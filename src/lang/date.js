/** section: Language
 * class Date
 *
 *  Extensions to the built-in `Date` object.
**/


(function(proto) {
  
  /**
   *  Date#toISOString() -> String
   *
   *  Produces a string representation of the date in ISO 8601 format.
   *  The time zone is always UTC, as denoted by the suffix "Z".
   *
   *  <h5>Example</h5>
   *
   *      var d = new Date(1969, 11, 31, 19);
   *      d.getTimezoneOffset();
   *      //-> -180 (time offest is given in minutes.)
   *      d.toISOString();
   *      //-> '1969-12-31T16:00:00Z'
  **/
  
  function toISOString() {
    return this.getUTCFullYear() + '-' +
      (this.getUTCMonth() + 1).toPaddedString(2) + '-' +
      this.getUTCDate().toPaddedString(2) + 'T' +
      this.getUTCHours().toPaddedString(2) + ':' +
      this.getUTCMinutes().toPaddedString(2) + ':' +
      this.getUTCSeconds().toPaddedString(2) + 'Z';
  }
  
  /**
   *  Date#toJSON() -> String
   *
   *  Internally calls [[Date#toISOString]].
   *
   *  <h5>Example</h5>
   *
   *      var d = new Date(1969, 11, 31, 19);
   *      d.getTimezoneOffset();
   *      //-> -180 (time offest is given in minutes.)
   *      d.toJSON();
   *      //-> '1969-12-31T16:00:00Z'
  **/

  function toJSON() {
    return this.toISOString();
  }
  
  if (!proto.toISOString) proto.toISOString = toISOString;
  if (!proto.toJSON) proto.toJSON = toJSON;
  
})(Date.prototype);

