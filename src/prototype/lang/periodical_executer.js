/** section: Language
 * class PeriodicalExecuter
 *
 *  Oversees the calling of a particular function periodically.
 *
 *  [[PeriodicalExecuter]] shields you from multiple parallel executions of a
 *  `callback` function, should it take longer than the given interval to
 *  execute.
 *
 *  This is especially useful if you use one to interact with the user at
 *  given intervals (e.g. use a prompt or confirm call): this will avoid
 *  multiple message boxes all waiting to be actioned.
 *
 *  ##### Example
 *
 *      new PeriodicalExecuter(function(pe) {
 *        if (!confirm('Want me to annoy you again later?')) {
 *          pe.stop();
 *        }
 *      }, 5);
**/
var PeriodicalExecuter = Class.create({
  /**
   *  new PeriodicalExecuter(callback, frequency)
   *  - callback (Function): the function to be executed at each interval.
   *  - frequency (Number): the amount of time, in seconds, to wait in between
   *    callbacks.
   *
   *  Creates a [[PeriodicalExecuter]].
  **/
  initialize: function(callback, frequency) {
    this.callback = callback;
    this.frequency = frequency;
    this.currentlyExecuting = false;

    this.registerCallback();
  },

  registerCallback: function() {
    this.timer = setInterval(this.onTimerEvent.bind(this), this.frequency * 1000);
  },

  execute: function() {
    this.callback(this);
  },

  /**
   *  PeriodicalExecuter#stop() -> undefined
   *
   *  Stops the periodical executer (there will be no further triggers).
   *
   *  Once a [[PeriodicalExecuter]] is created, it constitues an infinite loop,
   *  triggering at the given interval until the page unloads. This method lets
   *  you stop it any time you want.
   *
   *  ##### Example
   *
   *  This will only alert 1, 2 and 3, then the [[PeriodicalExecuter]] stops.
   *
   *      var count = 0;
   *      new PeriodicalExecuter(function(pe) {
   *        if (++count > 3) {
   *          pe.stop();
   *        } else {
   *          alert(count);
   *        }
   *      }, 1);
  **/
  stop: function() {
    if (!this.timer) return;
    clearInterval(this.timer);
    this.timer = null;
  },

  onTimerEvent: function() {
    if (!this.currentlyExecuting) {
      try {
        this.currentlyExecuting = true;
        this.execute();
      } finally {
        this.currentlyExecuting = false;
      }
    }
  }
});
