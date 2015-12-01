//= compat
//= require "lang/class"
//= require "lang/object"
//= require "lang/function"
//= require "lang/regexp"
//= require "lang/periodical_executer"
//= require "lang/string"
//= require "lang/template"
//= require "lang/enumerable"
//= require "lang/array"
//= require "lang/hash"
//= require "lang/number"
//= require "lang/range"

/**
 * == Language ==
 *
 * Additions to JavaScript's "standard library" and extensions to
 * built-in JavaScript objects.
**/

var Abstract = { };

/** section: Language
 * Try
**/

/** deprecated
 *  Try.these(function...) -> ?
 *  - function (Function): A function that may throw an exception.
 *
 *  Accepts an arbitrary number of functions and returns the result of the
 *  first one that doesn't throw an error.
 *
 *  **This method is deprecated.**
 *
 *  <h5>More information</h5>
 *
 *  [[Try.these]] provides a simple idiom for trying out blocks of code in
 *  sequence. Such a sequence of attempts usually represents a downgrading
 *  approach to obtaining a given feature.
 *
 *  In this example from Prototype's [[Ajax section]] internals, we want to get an
 *  `XMLHttpRequest` object. Internet Explorer 8 and earlier, however, does not
 *  provide it as a vanilla JavaScript object, and will throw an error if we
 *  attempt a simple instantiation. Also, over time, its proprietary way
 *  evolved, changing COM interface names.
 *
 *  [[Try.these]] will try several ways in sequence, from the best (and,
 *  theoretically, most widespread) one to the oldest and rarest way, returning
 *  the result of the first successful function.
 *
 *  If none of the blocks succeeded, [[Try.these]] will return `undefined`, which
 *  will cause the `Ajax.getTransport` method in the example below to return
 *  `false`, provided as a fallback result value.
 *
 *      var Ajax = {
 *        getTransport: function() {
 *          return Try.these(
 *            function() { return new XMLHttpRequest() },
 *            function() { return new ActiveXObject('Msxml2.XMLHTTP') },
 *            function() { return new ActiveXObject('Microsoft.XMLHTTP') }
 *          ) || false;
 *        }
 *      };
 **/
var Try = {
  these: function() {
    var returnValue;

    for (var i = 0, length = arguments.length; i < length; i++) {
      var lambda = arguments[i];
      try {
        returnValue = lambda();
        break;
      } catch (e) { }
    }

    return returnValue;
  }
};
