// TODO: Ideally, none of the stuff in this file should use Prototype, so
// that a broken method inside Prototype does not end up affecting the test
// reporting.

(function () {
  // Needed because Mocha's HTML test runner assumes the presence of
  // String#trim.
  if (!String.prototype.trim) {
    String.prototype.trim = String.prototype.strip;
  }

  var CONSOLE_LOG_SUPPORTED = ('console' in window) && console.log;
  var CONSOLE_GROUP_SUPPORTED = ('console' in window) && console.group &&
   console.groupEnd;
  var CONSOLE_LOG_APPLY = true;

  // TODO: Find a different way to log info in IE9.
  function info() {
    if (CONSOLE_LOG_APPLY) {
      console.log.apply(console, arguments);
    } else {
      console.log(arguments);
    }
  }

  function info_IE9() {
    var log = $('log');
    log.show();
    var results = [];
    for (var i = 0, len = arguments.length; i < len; i++) {
      results.push(arguments[i].toString());
    }
    var html = results.join(' ');
    var p = new Element('p', { 'class': 'log-item' });
    p.update(html);

    log.insert(p);
    // Force the log to scroll to the bottom whenever new stuff happens.
    log.scrollTop = log.offsetHeight;
  }

  if (!CONSOLE_LOG_SUPPORTED) {
    info = info_IE9;
  } else {
    try {
      console.log.apply(console, [""]);
    } catch (e) {
      CONSOLE_LOG_APPLY = false;
    }
  }

  window.info = info;

  // A function that acts like setTimeout, except with arguments reversed. This
  // is far more readable within tests.
  function wait(duration, done, fn) {
    var handler = function () {
      try {
        fn();
      } catch (e) {
        // Instead of relying on window.onerror to detect an error was
        // thrown (which is problematic in IE6-7), we invoke the callback
        // with an error the way Mocha expects.
        return done(e);
      }
    };
    return setTimeout(handler, duration);
  }
  window.wait = wait;

  function buildMessage() {
    var args = $A(arguments), message = args.shift(), template = args.shift();
    var output = template.interpolate(args.map(Object.inspect));
    return message ? (message + ': ' + output) : output;
  }

  window.assert = proclaim;

  // Add our own assertions.
  //
  Object.extend(assert, {
    enumEqual: function(expected, actual, message) {
      expected = $A(expected);
      actual = $A(actual);

      message = buildMessage(
        message || 'assert.enumEqual',
        'expected collection #{0} to match collection #{1}',
        actual,
        expected
      );

      var passes = expected.length == actual.length &&
       expected.zip(actual).all(function(pair) { return pair[0] == pair[1]; });

      if (!passes) {
        assert.fail(actual, expected, message, 'enumEqual');
      }
    },

    identical: function (expected, actual, message) {
      assert(expected === actual, message);
    },

    notIdentical: function (expected, actual, message) {
      assert(expected !== actual, message);
    },

    enabled: function () {
      for (var i = 0, element; element = arguments[i]; i++) {
        assert(
          !$(element).disabled,
          'element was disabled: ' + Object.inspect(element)
        );
      }
    },

    disabled: function () {
      for (var i = 0, element; element = arguments[i]; i++) {
        assert(
          $(element).disabled,
          'element was enabled: ' + Object.inspect(element)
        );
      }
    },

    raise: function (exceptionName, fn, message) {
      var raised = false;
      try {
        fn();
      } catch (e) {
        if (e.name == exceptionName)
          raised = true;
      }

      assert(raised, message);
    },

    nothingRaised: function (fn, message) {
      var raised = false;
      try {
        fn();
      } catch (e) {
        raised = true;
      }

      assert(!raised, message);
    },

    respondsTo: function (method, obj, message) {
      message = (message || 'assertRespondsTo') +
       ": object doesn't respond to <" + method + ">";
      var passes = (method in obj) && (typeof obj[method] === 'function');
      assert(passes, message);
    },

    elementsMatch: function () {
      var message, passes = true, expressions = $A(arguments), elements = $A(expressions.shift());

      if (elements.length !== expressions.length) {
        passes = false;
        message = 'Size mismatch: #{0} elements, #{1} expressions (#{2})'.interpolate(
         [elements.length, expressions.length, expressions]);
      } else {
        elements.zip(expressions).all(function (pair, index) {
          var element = $(pair.first()), expression = pair.last();
          if (element.match(expression)) return true;

          message = 'In index <#{0}>: expected <#{1}> but got #{2}'.interpolate(
           [index, expression, Object.inspect(element)]);
          passes = false;
        }.bind(this));
      }

      assert(passes, message);
    },

    elementMatches: function (element, expression, message) {
      this.elementsMatch([element], expression);
    },

    hashEqual: function (expected, actual, message) {
      function assertPairEqual(pair) {
        return pair.all(Object.isArray) ?
          pair[0].zip(pair[1]).all(assertPairEqual) : pair[0] == pair[1];
      }

      expected = $H(expected);
      actual = $H(actual);

      var eArray = expected.toArray().sort();
      var aArray = actual.toArray().sort();

      var passes = (eArray.length === aArray.length) &&
        eArray.zip(aArray).all(assertPairEqual);

      assert(passes, message);
    },

    hashNotEqual: function (expected, actual, message) {
      function assertPairEqual(pair) {
        return pair.all(Object.isArray) ?
          pair[0].zip(pair[1]).all(assertPairEqual) : pair[0] == pair[1];
      }

      expected = $H(expected);
      actual = $H(actual);

      var eArray = expected.toArray().sort();
      var aArray = actual.toArray().sort();

      var fails = (eArray.length === aArray.length) &&
        eArray.zip(aArray).all(assertPairEqual);

      assert(!fails, message);
    },

    isNotNullOrUndefined: function (val, message) {
      if (val === null || typeof val === 'undefined') {
        message = buildMessage(
          message,
          "expected #{0} not to be null/undefined",
          val
        );
        assert.fail(val, null, message, 'isNotNullOrUndefined');
      }
    }
  });


  // Add a bit of structure around the tests.
  //
  // All the tests run on the same page, but each test suite has its own HTML
  // fixture. This makes it easy for them to get in each others' way. (The
  // Selector tests, especially, are very particular about the types and
  // quantities of elements on the page.)
  //
  // The way we manage this is to assemble all the HTML fixtures before any
  // tests run, then detach them all from the document. Then, before a suite
  // runs, its fixtures are reattached, then removed again before the next
  // suite runs.
  //
  window.Test = {
    setup: function () {
      var body = document.body;
      this.suites = body.getAttribute('data-suites').split(',');

      this.fixtures = {};

      this.suites.each(function (suite) {
        var fixtures = $('other_fixtures').down('[data-suite="' + suite + '"]');
        if (fixtures) {
          this.fixtures[suite] = fixtures.remove();;
        }
      }, this);
    },

    startSuite: function (suite) {
      if (CONSOLE_GROUP_SUPPORTED) {
        console.group('Suite:', suite);
      } else if (CONSOLE_LOG_SUPPORTED) {
        console.log('Suite: ', suite);
      }

      // Calling `remove` on this node has been known to crash the tests in
      // IE6-7.
      if (this.currentFixtures) {
        document.getElementById('current_fixtures').innerHTML = '';
      }

      if (this.fixtures[suite]) {
        this.currentFixtures = this.fixtures[suite];
        $('current_fixtures').insert(this.currentFixtures);
      }
    },

    endSuite: function (suite) {
      if (CONSOLE_GROUP_SUPPORTED) {
        console.groupEnd();
      }
    },

    configureRunner: function (runner) {
      var failedTests = [];
      runner.on('end', function(){
        window.mochaResults = runner.stats;
        window.mochaResults.reports = failedTests;
      });

      runner.on('fail', logFailure);

      function logFailure (test, err) {
        function flattenTitles (test) {
          var titles = [];
          while (test.parent.title) {
            titles.push(test.parent.title);
            test = test.parent;
          }
          return titles.reverse();
        }

        failedTests.push({
          name:    test.title,
          result:  false,
          message: err.message,
          stack:   err.stack,
          titles:  flattenTitles(test)
        });
      }
    }
  };

  // Wrap Mocha's standard HTML reporter with some logic that pings a URL
  // with a results summary once the tests are done.
  var HTML = Mocha.reporters.HTML;

  // If there's a `results_url` parameter in the URL, we should use it.
  var resultsUrl;
  var queryParams = location.search.toQueryParams();

  if (queryParams['results_url']) {
    resultsUrl = queryParams['results_url'];
  }

  Test.Reporter = function (runner, root) {
    HTML.call(this, runner);

    runner.on('suite end', function (suite) {
      if (!suite.root) {
        return;
      }

      $('mocha').addClassName('done');

      if (!resultsUrl) {
        return;
      }

      var startMs  = this.stats.start.valueOf();
      var endMs    = (new Date).valueOf();
      var duration = (endMs - startMs) / 1000;

      var params = {
        duration:   duration,
        tests:      this.stats.tests,
        passes:     this.stats.passes,
        failures:   this.stats.failures
      };

      var url = resultsUrl + '?' + Object.toQueryString(params);

      var script = document.createElement('script');
      script.src = url;
      document.body.appendChild(script);
      setTimeout(function () {
        document.body.removeChild(script);
      }, 2000);
    });
  };

})();
