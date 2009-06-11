/** section: Language
 * class Number
 *
 *  Extensions to the built-in `Number` object.
 *
 *  Prototype extends native JavaScript numbers in order to provide:
 *
 *  * [[ObjectRange]] compatibility, through [[Number#succ]].
 *  * Ruby-like numerical loops with [[Number#times]].
 *  * Simple utility methods such as [[Number#toColorPart]] and
 *    [[Number#toPaddedString]].
 *  * Instance-method aliases of many functions in the `Math` namespace.
 *
**/
Object.extend(Number.prototype, (function() {
  /**
   *  Number#toColorPart() -> String
   *
   *  Produces a 2-digit hexadecimal representation of the number
   *  (which is therefore assumed to be in the [0..255] range).
   *  Useful for composing CSS color strings.
  **/
  function toColorPart() {
    return this.toPaddedString(2, 16);
  }

  /**
   *  Number#succ() -> Number
   *
   *  Returns the successor of the current Number, as defined by current + 1.
   *  Used to make numbers compatible with ObjectRange.
  **/
  function succ() {
    return this + 1;
  }

  /**
   *  Number#times(iterator) -> Number
   *
   *  Calls `iterator` the specified number of times.
   *  The function takes an integer as the first parameter; it will start at 0
   *  and be incremented after each invocation.
  **/
  function times(iterator, context) {
    $R(0, this, true).each(iterator, context);
    return this;
  }

  /**
   *  Number#toPaddedString(length[, radix]) -> String
   *
   *  Converts the number into a string padded with 0s so that the string's length
   *  is at least equal to `length`.
   *  Takes an optional `radix` argument which specifies the base to use for conversion.
  **/
  function toPaddedString(length, radix) {
    var string = this.toString(radix || 10);
    return '0'.times(length - string.length) + string;
  }

  /** related to: Object.toJSON
   *  Number#toJSON() -> String
   *
   *  Returns a JSON string representation of the number.
  **/
  function toJSON() {
    return isFinite(this) ? this.toString() : 'null';
  }

  /**
   *  Number#abs() -> Number
   *
   *  Returns the absolute value of the number.
  **/
  function abs() {
    return Math.abs(this);
  }

  /**
   *  Number#round() -> Number
   *
   *  Rounds the number to the nearest integer.
  **/
  function round() {
    return Math.round(this);
  }

  /**
   *  Number#ceil() -> Number
   *
   *  Returns the smallest integer greater than or equal to the number.
  **/
  function ceil() {
    return Math.ceil(this);
  }

  /**
   *  Number#floor() -> Number
   *
   *  Returns the largest integer less than or equal to the number.
  **/
  function floor() {
    return Math.floor(this);
  }

  return {
    toColorPart:    toColorPart,
    succ:           succ,
    times:          times,
    toPaddedString: toPaddedString,
    toJSON:         toJSON,
    abs:            abs,
    round:          round,
    ceil:           ceil,
    floor:          floor
  };
})());
