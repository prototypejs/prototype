/** section: Language
 * class Date
 *
 *  Extensions to the built-in `Date` object.
**/

/**
 *  Date#toJSON() -> String
 *
 *  Produces a string representation of the date in ISO 8601 format.
 *  The time zone is always UTC, as denoted by the suffix "Z".
 *
 *  <h5>Example</h5>
 *
 *      var d = new Date(1969, 11, 31, 19);
 *      d.getTimezoneOffset();
 *      //-> -180 (time offest is given in minutes.)
 *      d.toJSON();
 *      //-> '"1969-12-31T16:00:00Z"'
**/
Date.prototype.toJSON = function() {
  return '"' + this.getUTCFullYear() + '-' +
    (this.getUTCMonth() + 1).toPaddedString(2) + '-' +
    this.getUTCDate().toPaddedString(2) + 'T' +
    this.getUTCHours().toPaddedString(2) + ':' +
    this.getUTCMinutes().toPaddedString(2) + ':' +
    this.getUTCSeconds().toPaddedString(2) + 'Z"';
};

