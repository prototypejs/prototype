/** section: Language
 * class RegExp
 *
 *  Extensions to the built-in `RegExp` object.
**/

/**
 *  RegExp#match(str) -> Boolean
 *  - str (String): a string against witch to match the regular expression.
 *
 *  Alias of the native `RegExp#test` method. Returns `true`
 *  if `str` matches the regular expression, `false` otherwise.
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
