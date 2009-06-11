/** section: Language
 * class Date
 *
 *  Extensions to the built-in `Date` object.
**/

/**
 *  Date#toJSON() -> String
 *
 *  Produces a string representation of the date in ISO 8601 format.
**/
Date.prototype.toJSON = function() {
  return '"' + this.getUTCFullYear() + '-' +
    (this.getUTCMonth() + 1).toPaddedString(2) + '-' +
    this.getUTCDate().toPaddedString(2) + 'T' +
    this.getUTCHours().toPaddedString(2) + ':' +
    this.getUTCMinutes().toPaddedString(2) + ':' +
    this.getUTCSeconds().toPaddedString(2) + 'Z"';
};

