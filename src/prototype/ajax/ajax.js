/** section: Ajax
 * Ajax
**/

var Ajax = {
  getTransport: function() {
    return Try.these(
      function() {return new XMLHttpRequest()},
      function() {return new ActiveXObject('Msxml2.XMLHTTP')},
      function() {return new ActiveXObject('Microsoft.XMLHTTP')}
    ) || false;
  },

  /**
   *  Ajax.activeRequestCount -> Number
   *
   *  Represents the number of active XHR requests triggered through
   *  [[Ajax.Request]], [[Ajax.Updater]], or [[Ajax.PeriodicalUpdater]].
  **/
  activeRequestCount: 0
};
