/* global define */
(function (root) {
    'use strict';

    // NOTE: One change has been made from stock proclaim.js: it now
    // explicitly puts the fallback message (which had previously only been
    // included in AssertionError#toString) into the error's `message`
    // property. Without this, a failed test would display `undefined` in
    // Mocha unless it had its own message. -APD

    var proclaim = ok;

    // Assertions as outlined in
    // http://wiki.commonjs.org/wiki/Unit_Testing/1.0#Assert
    // -----------------------------------------------------

    // Assert that a value is truthy
    function ok (val, msg) {
        if (!!!val) {
            fail(val, true, msg, '==');
        }
    }
    proclaim.ok = ok;

    // Assert that two values are equal
    proclaim.equal = function (actual, expected, msg) {
        /* jshint eqeqeq: false */
        if (actual != expected) {
            fail(actual, expected, msg, '==');
        }
    };

    // Assert that two values are not equal
    proclaim.notEqual = function (actual, expected, msg) {
        /* jshint eqeqeq: false */
        if (actual == expected) {
            fail(actual, expected, msg, '!=');
        }
    };

    // Assert that two values are equal with strict comparison
    proclaim.strictEqual = function (actual, expected, msg) {
        if (actual !== expected) {
            fail(actual, expected, msg, '===');
        }
    };

    // Assert that two values are not equal with strict comparison
    proclaim.notStrictEqual = function (actual, expected, msg) {
        if (actual === expected) {
            fail(actual, expected, msg, '!==');
        }
    };

    // Assert that two values are deeply equal
    proclaim.deepEqual = function (actual, expected, msg) {
        if (!isDeepEqual(actual, expected)) {
            fail(actual, expected, msg, 'deepEqual');
        }
    };

    // Assert that two values are not deeply equal
    proclaim.notDeepEqual = function (actual, expected, msg) {
        if (isDeepEqual(actual, expected)) {
            fail(actual, expected, msg, '!deepEqual');
        }
    };

    // Assert that a function throws an error
    proclaim['throws'] = function (fn, expected, msg) {
        if (!functionThrows(fn, expected)) {
            fail(fn, expected, msg, 'throws');
        }
    };


    // Additional assertions
    // ---------------------

    // Assert that a value is falsy
    proclaim.notOk = function (val, msg) {
        if (!!val) {
            fail(val, true, msg, '!=');
        }
    };

    // Assert that a function does not throw an error
    proclaim.doesNotThrow = function (fn, expected, msg) {
        if (functionThrows(fn, expected)) {
            fail(fn, expected, msg, '!throws');
        }
    };

    // Assert that a value is a specific type
    proclaim.isTypeOf = function (val, type, msg) {
        proclaim.strictEqual(typeof val, type, msg);
    };

    // Assert that a value is not a specific type
    proclaim.isNotTypeOf = function (val, type, msg) {
        proclaim.notStrictEqual(typeof val, type, msg);
    };

    // Assert that a value is an instance of a constructor
    proclaim.isInstanceOf = function (val, constructor, msg) {
        if (!(val instanceof constructor)) {
            fail(val, constructor, msg, 'instanceof');
        }
    };

    // Assert that a value not an instance of a constructor
    proclaim.isNotInstanceOf = function (val, constructor, msg) {
        if (val instanceof constructor) {
            fail(val, constructor, msg, '!instanceof');
        }
    };

    // Assert that a value is an array
    proclaim.isArray = function (val, msg) {
        if (!isArray(val)) {
            fail(typeof val, 'array', msg, '===');
        }
    };

    // Assert that a value is not an array
    proclaim.isNotArray = function (val, msg) {
        if (isArray(val)) {
            fail(typeof val, 'array', msg, '!==');
        }
    };

    // Assert that a value is a boolean
    proclaim.isBoolean = function (val, msg) {
        proclaim.isTypeOf(val, 'boolean', msg);
    };

    // Assert that a value is not a boolean
    proclaim.isNotBoolean = function (val, msg) {
        proclaim.isNotTypeOf(val, 'boolean', msg);
    };

    // Assert that a value is true
    proclaim.isTrue = function (val, msg) {
        proclaim.strictEqual(val, true, msg);
    };

    // Assert that a value is false
    proclaim.isFalse = function (val, msg) {
        proclaim.strictEqual(val, false, msg);
    };

    // Assert that a value is a function
    proclaim.isFunction = function (val, msg) {
        proclaim.isTypeOf(val, 'function', msg);
    };

    // Assert that a value is not a function
    proclaim.isNotFunction = function (val, msg) {
        proclaim.isNotTypeOf(val, 'function', msg);
    };

    // Assert that a value is null
    proclaim.isNull = function (val, msg) {
        proclaim.strictEqual(val, null, msg);
    };

    // Assert that a value is not null
    proclaim.isNotNull = function (val, msg) {
        proclaim.notStrictEqual(val, null, msg);
    };

    // Assert that a value is a number
    proclaim.isNumber = function (val, msg) {
        proclaim.isTypeOf(val, 'number', msg);
    };

    // Assert that a value is not a number
    proclaim.isNotNumber = function (val, msg) {
        proclaim.isNotTypeOf(val, 'number', msg);
    };

    // Assert that a value is an object
    proclaim.isObject = function (val, msg) {
        proclaim.isTypeOf(val, 'object', msg);
    };

    // Assert that a value is not an object
    proclaim.isNotObject = function (val, msg) {
        proclaim.isNotTypeOf(val, 'object', msg);
    };

    // Assert that a value is a string
    proclaim.isString = function (val, msg) {
        proclaim.isTypeOf(val, 'string', msg);
    };

    // Assert that a value is not a string
    proclaim.isNotString = function (val, msg) {
        proclaim.isNotTypeOf(val, 'string', msg);
    };

    // Assert that a value is undefined
    proclaim.isUndefined = function (val, msg) {
        proclaim.isTypeOf(val, 'undefined', msg);
    };

    // Assert that a value is defined
    proclaim.isDefined = function (val, msg) {
        proclaim.isNotTypeOf(val, 'undefined', msg);
    };

    // Assert that a value matches a regular expression
    proclaim.match = function (actual, expected, msg) {
        if (!expected.test(actual)) {
            fail(actual, expected, msg, 'match');
        }
    };

    // Assert that a value does not match a regular expression
    proclaim.notMatch = function (actual, expected, msg) {
        if (expected.test(actual)) {
            fail(actual, expected, msg, '!match');
        }
    };

    // Assert that an object includes something
    proclaim.includes = function (haystack, needle, msg) {
        if (!includes(haystack, needle)) {
            fail(haystack, needle, msg, 'include');
        }
    };

    // Assert that an object does not include something
    proclaim.doesNotInclude = function (haystack, needle, msg) {
        if (includes(haystack, needle)) {
            fail(haystack, needle, msg, '!include');
        }
    };

    // Assert that an object (Array, String, etc.) has the expected length
    proclaim.lengthEquals = function (obj, expected, msg) {
        var undef;
        if (isUndefinedOrNull(obj)) {
            return fail(undef, expected, msg, 'length');
        }
        if (obj.length !== expected) {
            fail(obj.length, expected, msg, 'length');
        }
    };

    // Assert that a value is less than another value
    proclaim.lessThan = function (actual, expected, msg) {
        if (actual >= expected) {
            fail(actual, expected, msg, '<');
        }
    };

    // Assert that a value is less than or equal to another value
    proclaim.lessThanOrEqual = function (actual, expected, msg) {
        if (actual > expected) {
            fail(actual, expected, msg, '<=');
        }
    };

    // Assert that a value is greater than another value
    proclaim.greaterThan = function (actual, expected, msg) {
        if (actual <= expected) {
            fail(actual, expected, msg, '>');
        }
    };

    // Assert that a value is greater than another value
    proclaim.greaterThanOrEqual = function (actual, expected, msg) {
        if (actual < expected) {
            fail(actual, expected, msg, '>=');
        }
    };


    // Error handling
    // --------------

    // Assertion error class
    function AssertionError (opts) {
        opts = opts || {};
        this.name = 'AssertionError';
        this.actual = opts.actual;
        this.expected = opts.expected;
        this.operator = opts.operator || '';
        this._message = opts.message;

        this.message = this._describe();

        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, opts.stackStartFunction || fail);
        }
    }
    AssertionError.prototype = (Object.create ? Object.create(Error.prototype) : new Error());
    AssertionError.prototype.name = 'AssertionError';
    AssertionError.prototype.constructor = AssertionError;

    AssertionError.prototype._describe = function () {
        var output = this.actual + ' ' +
            this.operator + ' ' +
            this.expected;

        return this._message ? this._message + ': ' + output : output;
    };

    // Assertion error to string
    AssertionError.prototype.toString = function () {
        return this.name + ': ' + this._describe();
    };

    // Fail a test
    function fail (actual, expected, message, operator, stackStartFunction) {
        throw new AssertionError({
            message: message,
            actual: actual,
            expected: expected,
            operator: operator,
            stackStartFunction: stackStartFunction
        });
    }

    // Expose error handling tools
    proclaim.AssertionError = AssertionError;
    proclaim.fail = fail;


    // Utilities
    // ---------

    // Utility for checking whether a value is undefined or null
    function isUndefinedOrNull (val) {
        return (val === null || typeof val === 'undefined');
    }

    // Utility for checking whether a value is an arguments object
    function isArgumentsObject (val) {
        return (Object.prototype.toString.call(val) === '[object Arguments]');
    }

    // Utility for checking whether a value is plain object
    function isPlainObject (val) {
        return Object.prototype.toString.call(val) === '[object Object]';
    }

    // Utility for checking whether an object contains another object
    function includes (haystack, needle) {
        /* jshint maxdepth: 3*/
        var i;

        // Array#indexOf, but ie...
        if (isArray(haystack)) {
            for (i = haystack.length - 1; i >= 0; i = i - 1) {
                if (haystack[i] === needle) {
                    return true;
                }
            }
        }

        // String#indexOf
        if (typeof haystack === 'string') {
            if (haystack.indexOf(needle) !== -1) {
                return true;
            }
        }

        // Object#hasOwnProperty
        if (isPlainObject(haystack)) {
            if (haystack.hasOwnProperty(needle)) {
                return true;
            }
        }

        return false;
    }

    // Utility for checking whether a value is an array
    var isArray = Array.isArray || function (val) {
        return (Object.prototype.toString.call(val) === '[object Array]');
    };

    // Utility for getting object keys
    function getObjectKeys (obj) {
        var key, keys = [];
        for (key in obj) {
            if (obj.hasOwnProperty(key)) {
                keys.push(key);
            }
        }
        return keys;
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


    // Exports
    // -------

    // AMD
    if (typeof define !== 'undefined' && define.amd) {
        define([], function () {
            return proclaim;
        });
    }
    // CommonJS
    else if (typeof module !== 'undefined' && module.exports) {
        module.exports = proclaim;
    }
    // Script tag
    else {
        root.proclaim = proclaim;
    }


} (this));