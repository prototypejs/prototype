/** section: Ajax
 * Ajax
**/

var Ajax = {
  getTransport: function() {
    return new XMLHttpRequest();
  },

  /**
   *  Ajax.activeRequestCount -> Number
   *
   *  Represents the number of active XHR requests triggered through
   *  [[Ajax.Request]], [[Ajax.Updater]], or [[Ajax.PeriodicalUpdater]].
  **/
  activeRequestCount: 0
};
