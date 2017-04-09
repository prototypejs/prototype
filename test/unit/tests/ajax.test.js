Fixtures.Ajax = {
  js: {
    responseBody:   '$("content").update("<H2>Hello world!</H2>");',
    'Content-Type': '           text/javascript     '
  },

  html: {
    responseBody: "Pack my box with <em>five dozen</em> liquor jugs! " +
      "Oh, how <strong>quickly</strong> daft jumping zebras vex..."
  },

  xml: {
    responseBody:   '<?xml version="1.0" encoding="UTF-8" ?><name attr="foo">bar</name>',
    'Content-Type': 'application/xml'
  },

  json: {
    responseBody:   '{\n\r"test": 123}',
    'Content-Type': 'application/json'
  },

  jsonWithoutContentType: {
    responseBody:   '{"test": 123}'
  },

  invalidJson: {
    responseBody:   '{});window.attacked = true;({}',
    'Content-Type': 'application/json'
  },

  headerJson: {
    'X-JSON': '{"test": "hello #éà"}'
  }
};

var responderCounter = 0;

// lowercase comparison because of MSIE which presents HTML tags in uppercase
var sentence = ("Pack my box with <em>five dozen</em> liquor jugs! " +
 "Oh, how <strong>quickly</strong> daft jumping zebras vex...").toLowerCase();

var message = 'You must be running a test server to test this feature.';

function assertContent(id, content, message) {
  var a = content.toLowerCase();
  var b = $(id).innerHTML.strip().toLowerCase();
  message = message || 'failure';

  assert.equal(
    a,
    b,
    message + ': element #' + id + ' should have content: (' + a + ') but has content: (' + b + ')'
  );
}


var extendDefault = function(options) {
  return Object.extend({
    asynchronous: false,
    method: 'get'
  }, options);
};

suite("Ajax", function () {
  this.timeout(10000);
  this.name = 'ajax';

  setup(function () {
    $('content', 'content2').invoke('update', '');
  });

  teardown(function () {
    // hack to cleanup responders
    Ajax.Responders.responders = [Ajax.Responders.responders[0]];
  });

  test("synchronous request", function () {
    assert.equal("", $('content').innerHTML);
    assert.equal(0, Ajax.activeRequestCount);

    new Ajax.Request('/fixtures/hello.js', {
      asynchronous: false,
      method: 'GET',
      evalJS: 'force'
    });

    assert.equal(0, Ajax.activeRequestCount);
  });

  test("asynchronous request", function (done) {
    assert.equal("", $("content").innerHTML);

    new Ajax.Request('/fixtures/hello.js', {
      asynchronous: true,
      method: 'GET',
      evalJS: 'force'
    });

    setTimeout(function () {
      var h2 = $('content').firstChild;
      assert.equal("Hello world!", h2.innerHTML);
      done();
    }, 1000);
  });

  test("activeRequestCount decrements when an exception occurs in a handler", function (done) {

    new Ajax.Request('/fixtures/hello.js', {
      method: 'GET',
      onComplete: function () {
        assert.equal(1, Ajax.activeRequestCount);
        setTimeout(function () {
          assert.equal(0, Ajax.activeRequestCount);
          done();
        }, 250);
        throw new Error('test');
      },

      onException: function () {
        // Empty function to prevent the error from being rethrown
      }
    });

  });

  suite('Updater', function () {

    setup(function () {
      $('content', 'content2').invoke('update', '');
    });

    test('basic', function (done) {
      assert.equal("", $('content').innerHTML);

      new Ajax.Updater('content', '/fixtures/content.html', { method: 'get' });

      setTimeout(function () {
        assertContent('content', sentence, 'simple updater');

        $('content').update('');
        assert.equal("", $('content').innerHTML);

        new Ajax.Updater(
          { success: 'content', failure: 'content2' },
          '/fixtures/content.html',
          { method: 'get', parameters: { pet: 'monkey' } }
        );

        setTimeout(function () {
          assertContent('content', sentence, 'success/failure updater');
          assertContent('content2', '', 'failure DIV should be empty');
          done();
        }, 1000);

      }, 1000);

    });

    test('with insertion', function (done) {
      $('content').update();
      new Ajax.Updater('content', '/fixtures/content.html', {
        method: 'get',
        insertion: Insertion.Top
      });
      assertContent('content', '');

      setTimeout(function() {
        assertContent('content', sentence, 'Insertion.Top');
        $('content').update();

        new Ajax.Updater('content', '/fixtures/content.html', {
          method: 'get',
          insertion: 'bottom'
        });

        setTimeout(function () {
          assertContent('content', sentence, 'bottom insertion');
          $('content').update();

          new Ajax.Updater('content', '/fixtures/content.html', {
            method: 'get',
            insertion: 'after'
          });

          setTimeout(function () {
            assert.equal(
              'five dozen',
              $('content').next().innerHTML.strip().toLowerCase(),
              'after insertion'
            );
            done();
          }, 1000);

        }, 1000);

      }, 1000);

    });

    test('with options', function () {
      var options = {
        method: 'get',
        asynchronous: false,
        evalJS: 'force',
        onComplete: Prototype.emptyFunction
      };

      var request = new Ajax.Updater('content', '/fixtures/hello.js', options);
      request.options.onComplete = Prototype.emptyFunction;
      assert.strictEqual(Prototype.emptyFunction, options.onComplete);
    });

  }); // Updater

  test('responders', function (done) {
    var r = Ajax.Responders.responders;
    assert.equal(1, r.length);

    var dummyResponder = {
      onComplete: Prototype.emptyFunction
    };

    Ajax.Responders.register(dummyResponder);
    assert.equal(2, r.length);

    // Don't add twice.
    Ajax.Responders.register(dummyResponder);
    assert.equal(2, r.length, 'what');

    Ajax.Responders.unregister(dummyResponder);
    assert.equal(1, Ajax.Responders.responders.length);

    var responder = {
      onCreate:   function(req) { responderCounter++; },
      onLoading:  function(req) { responderCounter++; },
      onComplete: function(req) { responderCounter++; }
    };
    Ajax.Responders.register(responder);

    assert.equal(0, responderCounter);
    assert.equal(0, Ajax.activeRequestCount);

    new Ajax.Request('/fixtures/content.html', {
      method: 'get',
      parameters: 'pet=monkey'
    });

    assert.equal(1, responderCounter);
    assert.equal(1, Ajax.activeRequestCount);

    setTimeout(function () {
      assert.equal(3, responderCounter);
      assert.equal(0, Ajax.activeRequestCount);
      done();
    }, 1000);

  });

  test('eval response should be called before onComplete', function () {
    assert.equal('', $('content').innerHTML);
    assert.equal(0, Ajax.activeRequestCount);

    new Ajax.Request('/fixtures/hello.js', extendDefault({
      onComplete: function(response) {
        assert.notEqual('', $('content').innerHTML);
      }
    }));
    assert.equal(0, Ajax.activeRequestCount);

    var h2 = $('content').firstChild;
    assert.equal('Hello world!', h2.innerHTML);
  });

  test('Content-Type set for obscure verbs', function () {
    new Ajax.Request('/inspect', extendDefault({
      method: 'put',
      contentType: 'application/bogus',
      onComplete: function (response) {
        assert.equal(
          'application/bogus; charset=UTF-8',
          response.responseJSON.headers['content-type']
        );
      }
    }));
  });

  test('verbs with bodies', function () {
    var verbs = $w('post put patch');
    verbs.each(function (verb) {
      new Ajax.Request('/inspect', extendDefault({
        method: verb,
        body: 'foo=foo&bar=bar',
        onSuccess: function (response) {
          var body = response.responseJSON.body;
          assert.equal('foo=foo&bar=bar', body, verb + ' should send body');
        },
        onFailure: function () {
          assert(false, verb + ' should send body');
        }
      }));
    });
  });

  test('verbs without bodies', function () {
    var verbs = $w('get head options delete');

    verbs.each(function (verb) {
      new Ajax.Request('/inspect', extendDefault({
        method: verb,
        onSuccess: function () {
          assert(true, verb + ' method should work');
        },
        onFailure: function () {
          assert(false, verb + ' method should work');
        }
      }));
    });
  });

  test('onCreate callback', function () {
    new Ajax.Request('/fixtures/content.html', extendDefault({
      onCreate: function (transport) {
        assert.equal(0, transport.readyState);
      },
      onComplete: function (transport) {
        assert.notEqual(0, transport.readyState);
      }
    }));
  });

  test('evalJS', function () {
    $('content').update();
    new Ajax.Request('/response', extendDefault({
      parameters: Fixtures.Ajax.js,
      onComplete: function (transport) {
        var h2 = $('content').firstChild;
        assert.equal('Hello world!', h2.innerHTML);
      }
    }));

    $('content').update();
    new Ajax.Request('/response', extendDefault({
      evalJS: false,
      parameters: Fixtures.Ajax.js,
      onComplete: function () {
        assert.equal('', $('content').innerHTML);
      }
    }));

    $('content').update();
    new Ajax.Request("/fixtures/hello.js", extendDefault({
      evalJS: 'force',
      onComplete: function(transport) {
        var h2 = $('content').firstChild;
        assert.equal('Hello world!', h2.innerHTML);
      }
    }));

  });

  test('callbacks', function () {
    var options = extendDefault({
      onCreate: function (transport) {
       assert.isInstanceOf(transport, Ajax.Response);
      }
    });

    Ajax.Request.Events.each(function (state) {
      options['on' + state] = options.onCreate;
    });

    new Ajax.Request('/fixtures/content.html', options);
  });

  test('response text', function () {
    new Ajax.Request('/fixtures/empty.html', extendDefault({
      onComplete: function (transport) {
        assert.equal('', transport.responseText);
      }
    }));

    new Ajax.Request('/fixtures/content.html', extendDefault({
      onComplete: function (transport) {
        assert.equal(sentence, transport.responseText.toLowerCase());
      }
    }));
  });

  test('responseXML', function () {
    new Ajax.Request('/response', extendDefault({
      parameters: Fixtures.Ajax.xml,
      onComplete: function (transport) {
        assert.equal(
          'foo',
          transport.responseXML.getElementsByTagName('name')[0].getAttribute('attr')
        );
      }
    }));
  });

  test('responseJSON', function () {
    new Ajax.Request('/response', extendDefault({
      parameters: Fixtures.Ajax.json,
      onComplete: function (transport) {
        assert.equal(123, transport.responseJSON.test);
      }
    }));

    new Ajax.Request('/response', extendDefault({
      parameters: {
        'Content-Length': 0,
        'Content-Type': 'application/json'
      },
      onComplete: function (transport) {
        assert.isNull(transport.responseJSON);
      }
    }));

    new Ajax.Request('/response', extendDefault({
      evalJSON: false,
      parameters: Fixtures.Ajax.json,
      onComplete: function (transport) {
        assert.isNull(transport.responseJSON);
      }
    }));

    new Ajax.Request('/response', extendDefault({
      sanitizeJSON: true,
      parameters: Fixtures.Ajax.invalidJson,
      onException: function (request, error) {
        assert.equal('SyntaxError', error.name);
      }
    }));

    new Ajax.Request('/fixtures/data.json', extendDefault({
      evalJSON: 'force',
      onComplete: function (transport) {
        assert.equal(123, transport.responseJSON.test);
      }
    }));
  });

  test('headerJSON', function () {
    new Ajax.Request('/response', extendDefault({
      parameters: Fixtures.Ajax.headerJson,
      onComplete: function (transport, json) {
        assert.equal('hello #éà', transport.headerJSON.test);
        assert.equal('hello #éà', json.test);
      }
    }));

    new Ajax.Request('/response', extendDefault({
      onComplete: function (transport, json) {
        assert.isNull(transport.headerJSON);
        assert.isNull(json);
      }
    }));
  });

  test('getHeader', function () {
    new Ajax.Request('/response', extendDefault({
      parameters: { 'X-TEST': 'some value' },
      onComplete: function (transport) {
        assert.equal('some value', transport.getHeader('X-Test'));
        assert.isNull(transport.getHeader('X-Non-Existent'));
      }
    }));
  });

  test('parameters can be a hash', function () {
    new Ajax.Request('/response', extendDefault({
      parameters: $H({ one: "two", three: "four" }),
      onComplete: function (transport) {
        assert.equal('two', transport.getHeader('one'));
        assert.equal('four', transport.getHeader('three'));
        assert.isNull(transport.getHeader('toObject'));
      }
    }));
  });

  test('parameters string order is preserved', function () {
    new Ajax.Request('/inspect', extendDefault({
      parameters: "cool=1&bad=2&cool=3&bad=4",
      method: 'post',
      onComplete: function (transport) {
        var bodyWithoutWart =
         transport.responseJSON.body.match(/((?:(?!&_=$).)*)/)[1];
        assert.equal('cool=1&bad=2&cool=3&bad=4', bodyWithoutWart);
      }
    }));
  });

  test('isSameOrigin', function () {
    var isSameOrigin = Ajax.Request.prototype.isSameOrigin;

    assert(isSameOrigin.call({ url: '/foo/bar.html' }),
     '/foo/bar.html should be same-origin');
    assert(isSameOrigin.call({ url: window.location.toString() }),
     'current window location should be same-origin');
    assert(!isSameOrigin.call({ url: 'http://example.com' }),
     'example.com should not be same-origin');

    Ajax.Request.prototype.isSameOrigin = function () {
      return false;
    };

    $('content').update('same origin policy');

    new Ajax.Request('/response', extendDefault({
      parameters: Fixtures.Ajax.js,
      onComplete: function (transport) {
        assert.equal('same origin policy', $('content').innerHTML);
      }
    }));

    new Ajax.Request('/response', extendDefault({
      parameters: Fixtures.Ajax.invalidJson,
      onException: function (request, error) {
        assert.equal('SyntaxError', error.name);
      }
    }));

    new Ajax.Request('/response', extendDefault({
      parameters: { 'X-JSON': '{});window.attacked = true;({}' },
      onException: function (request, error) {
        assert.equal('SyntaxError', error.name);
      }
    }));

    Ajax.Request.prototype.isSameOrigin = isSameOrigin;
  });

  test('can omit content-type', function () {
    new Ajax.Request('/inspect', extendDefault({
      method: 'post',
      contentType: false,
      onSuccess: function (response) {
        // If we omit Content-Type, the browser will provide its own.
        var contentType = response.responseJSON.headers['content-type'];
        assert(contentType.indexOf('text/plain') > -1);
      }
    }));
  });
});

