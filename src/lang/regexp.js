/** section: Language
 * class RegExp
 *
 *  Extensions to the built-in `RegExp` object.
**/

/** alias of: RegExp#test
 *  RegExp#match(str) -> Boolean
 *
 *  Return true if string matches the regular expression, false otherwise.
 **/
RegExp.prototype.match = RegExp.prototype.test;

/**
 *  RegExp.escape(str) -> String
 *  - str (String): A string intended to be used in a `RegExp` constructor.
 *
 *  Escapes any characters in the string that have special meaning in a
 *  regular expression.
 *
 *  Use before passing a string into the `RegExp` constructor.
**/
RegExp.escape = function(str) {
  return String(str).replace(/([.*+?^=!:${}()|[\]\/\\])/g, '\\$1');
};
