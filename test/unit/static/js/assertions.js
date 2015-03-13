
(function () {

  function ok(val, message) {
    if (!!!val) {
      fail(val, true, message, '==');
    }
  }

  function buildMessage() {
    var args = $A(arguments), template = args.shift();
    return template.interpolate(args);
  }

  function fail (actual, expected, message, operator, stackStartFunction) {
    throw new AssertionError({
      message:            message,
      actual:             actual,
      expected:           expected,
      operator:           operator,
      stackStartFunction: stackStartFunction
    });
  }

  // Utility for deep equality testing of objects
  function objectsEqual (obj1, obj2) {
    /* jshint eqeqeq: false */

    // Check for undefined or null
    if (isUndefinedOrNull(obj1) || isUndefinedOrNull(obj2)) {
      return false;
    }

    // Object prototypes must be the same
    if (obj1.prototype !== obj2.prototype) {
      return false;
    }

    // Handle argument objects
    if (isArgumentsObject(obj1)) {
      if (!isArgumentsObject(obj2)) {
        return false;
      }
      obj1 = Array.prototype.slice.call(obj1);
      obj2 = Array.prototype.slice.call(obj2);
    }

    // Check number of own properties
    var obj1Keys = getObjectKeys(obj1);
    var obj2Keys = getObjectKeys(obj2);
    if (obj1Keys.length !== obj2Keys.length) {
      return false;
    }

    obj1Keys.sort();
    obj2Keys.sort();

    // Cheap initial key test (see https://github.com/joyent/node/blob/master/lib/assert.js)
    var key, i, len = obj1Keys.length;
    for (i = 0; i < len; i += 1) {
      if (obj1Keys[i] != obj2Keys[i]) {
        return false;
      }
    }

    // Expensive deep test
    for (i = 0; i < len; i += 1) {
      key = obj1Keys[i];
      if (!isDeepEqual(obj1[key], obj2[key])) {
        return false;
      }
    }

    // If it got this far...
    return true;
  }

  // Utility for deep equality testing
  function isDeepEqual (actual, expected) {
    /* jshint eqeqeq: false */
    if (actual === expected) {
      return true;
    }
    if (expected instanceof Date && actual instanceof Date) {
      return actual.getTime() === expected.getTime();
    }
    if (actual instanceof RegExp && expected instanceof RegExp) {
      return (
        actual.source === expected.source &&
        actual.global === expected.global &&
        actual.multiline === expected.multiline &&
        actual.lastIndex === expected.lastIndex &&
        actual.ignoreCase === expected.ignoreCase
      );
    }
    if (typeof actual !== 'object' && typeof expected !== 'object') {
      return actual == expected;
    }
    return objectsEqual(actual, expected);
  }

  // Utility for testing whether a function throws an error
  function functionThrows (fn, expected) {

    // Try/catch
    var thrown = false;
    var thrownError;
    try {
      fn();
    } catch (err) {
      thrown = true;
      thrownError = err;
    }

    // Check error
    if (thrown && expected) {
      thrown = errorMatches(thrownError, expected);
    }

    return thrown;
  }

  // Utility for checking whether an error matches a given constructor, regexp or string
  function errorMatches (actual, expected) {
    if (typeof expected === 'string') {
      return actual.message === expected;
    }
    if (expected instanceof RegExp) {
      return expected.test(actual.message);
    }
    if (actual instanceof expected) {
      return true;
    }
    return false;
  }

  function AssertionError (opts) {
    opts = opts || {};

    this.name     = 'AssertionError';
    this.actual   = opts.actual;
    this.expected = opts.expected;
    this.operator = opts.operator || '';
    this.message  = opts.message;

    if (!this.message) {
      this.message = this.toString();
    }

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, opts.stackStartFunction || fail);
    }
  }

  AssertionError.prototype = (Object.create ? Object.create(Error.prototype) : new Error());
  AssertionError.prototype.name = 'AssertionError';
  AssertionError.prototype.constructor = AssertionError;

  // Assertion error to string
  AssertionError.prototype.toString = function () {
    if (this.message) {
      return this.name + ': ' +this.message;
    } else {
      return this.name + ': ' +
        this.actual + ' ' +
        this.operator + ' ' +
        this.expected;
    }
  };


  var assert = ok;

  Object.extend(assert, {

    equal: function (actual, expected, message) {
      if (actual != expected) {
        var msg = buildMessage(message, 'expected "#{0}" to equal "#{1}"',
         actual, expected);
        fail(actual, expected, msg, '==');
      }
    },

    notEqual: function (actual, expected, message) {
      if (actual == expected) {
        var msg = buildMessage(message, 'expected "#{0}" not to equal "#{1}"',
         actual, expected);
        fail(actual, expected, msg, '!=');
      }
    },

    strictEqual: function (actual, expected, message) {
      if (actual !== expected) {
        var msg = buildMessage(
          message,
          'expected "#{0}" to strictly equal "#{1}"',
          actual,
          expected
        );
        fail(actual, expected, msg, '===');
      }
    },

    notStrictEqual: function (actual, expected, message) {
      if (actual === expected) {
        var msg = buildMessage(
          message,
          'expected "#{0}" not to strictly equal "#{1}"',
          actual,
          expected
        );
        fail(actual, expected, msg, '!=');
      }
    },

    deepEqual: function (actual, expected, message) {
      if (!isDeepEqual(actual, expected)) {
        var msg = buildMessage(
          message,
          'expected #{0} to deep-equal #{1}',
          actual,
          expected
        );
        fail(actual, expected, msg, 'deepEqual');
      }
    },

    notDeepEqual: function (actual, expected, message) {
      if (isDeepEqual(actual, expected)) {
        var msg = buildMessage(
          message,
          'expected #{0} not to deep-equal #{1}',
          actual,
          expected
        );
        fail(actual, expected, msg, 'notDeepEqual');
      }
    },

    'throws': function (fn, expected, message) {
      if (!functionThrows(fn, expected)) {
        var msg = buildMessage(
          message,
          'expected function to throw #{0}',
          expected || 'error'
        );
        fail(val, true, msg, 'throws');
      }
    },

    doesNotThrow: function (fn, expected, message) {
      if (functionThrows(fn, expected)) {
        var msg = buildMessage(
          message,
          'expected function not to throw #{0}',
          expected || 'error'
        );
      }
    },

    isTypeOf: function (val, type, message) {
      if (typeof val !== type) {
        var msg = buildMessage(
          message,
          'expected "#{0}" to be of type #{1}',
          val, type
        );
        fail(val, type, msg, 'isTypeOf');
      }
    },

    isNotTypeOf: function (val, type, message) {
      if (typeof val === type) {
        var msg = buildMessage(
          message,
          'expected "#{0}" not to be of type #{1}',
          val, type
        );
        fail(val, type, msg, 'isNotTypeOf');
      }
    },

    isInstanceOf: function (val, constructor, message) {
      if (!(val instanceof constructor)) {
        var msg = buildMessage(
          message,
          'expected #{0} to be an instance of #{1}',
          val, constructor
        );
        fail(val, constructor, msg, 'instanceof');
      }
    },

    isNotInstanceOf: function (val, constructor, message) {
      if (val instanceof constructor) {
        var msg = buildMessage(
          message,
          'expected #{0} not to be an instance of #{1}',
          val, constructor
        );
        fail(val, constructor, msg, '!instanceof');
      }
    },

    isNull: function (val, message) {
      if (val !== null) {
        var msg = buildMessage(
          message,
          'expected #{0} to be null',
          val
        );
        fail(val, null, msg, 'isNull');
      }
    },

    isNotNull: function (val, message) {
      if (val === null) {
        var msg = buildMessage(
          message,
          'expected #{0} not to be null',
          val
        );
        fail(val, null, msg, 'isNotNull');
      }
    },

    isUndefined: function (val, message) {
      var undef;
      if (typeof val !== 'undefined') {
        var msg = buildMessage(
          message,
          'expected #{0} to be undefined',
          val
        );
        fail(val, undef, msg, 'isUndefined');
      }
    },

    isDefined: function (val, message) {
      var undef;
      if (typeof val === 'undefined') {
        var msg = buildMessage(
          message,
          'expected #{0} to be defined',
          val
        );
        fail(val, undef, msg, 'isDefined');
      }
    },

    match: function (actual, expected, message) {
      if (!expected.test(actual)) {
        var msg = buildMessage(
          message,
          'expected #{0} to match #{1}',
          actual,
          expected
        );
        fail(actual, expected, msg, 'match');
      }
    },

    notMatch: function (actual, expected, message) {
      if (expected.test(actual)) {
        var msg = buildMessage(
          message,
          'expected #{0} not to match #{1}',
          actual,
          expected
        );
        fail(actual, expected, msg, '!match');
      }
    },

    enumEqual: function (expected, actual, message) {
      expected = $A(expected);
      actual = $A(actual);

      var passes = expected.length == actual.length &&
       expected.zip(actual).all(function(pair) { return pair[0] == pair[1]; });

      if (!passes) {
        var msg = buildMessage(
          message,
          'expected collection #{0} to match collection #{1}',
          actual,
          expected
        );
        fail(actual, expected, msg, 'enumEqual');
      }
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

    respondsTo: function (method, obj, message) {
      var passes = (method in obj) && (typeof obj[method] === 'function');

      if (!passes) {
        var msg = buildMessage(
          message || 'assert.respondsTo',
          'expected #{0} to respond to method "#{1}"',
          obj,
          method
        );
        fail(obj, method, msg, 'respondsTo');
      }
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

          message = 'in index <#{0}>: expected <#{1}> but got #{2}'.interpolate(
           [index, expression, Object.inspect(element)]);
          passes = false;
        });
      }

      assert(passes, message);
    },

    elementMatches: function (element, expression, message) {
      assert.elementsMatch([element], expression);
    }

  });



  // Exports
  // -------

  // AMD
  if (typeof define !== 'undefined' && define.amd) {
      define([], function () {
          return assert;
      });
  }
  // CommonJS
  else if (typeof module !== 'undefined' && module.exports) {
      module.exports = assert;
  }
  // Script tag
  else {
      root.assert = assert;
  }

})(this);