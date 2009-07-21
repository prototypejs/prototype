/** section: Language
 * class PeriodicalExecuter
 *
 *  A class that oversees the calling of a particular function periodically.
 *
 *  `PeriodicalExecuter` shields you from multiple parallel executions of the
 *  `callback` function, should it take longer than the given interval to
 *  execute.
 *
 *  This is especially useful if you use one to interact with the user at
 *  given intervals (e.g. use a prompt or confirm call): this will avoid
 *  multiple message boxes all waiting to be actioned.
**/
var PeriodicalExecuter = Class.create({
  /**
   *  new PeriodicalExecuter(callback, frequency)
   *  - callback (Function): the function to be executed at each interval.
   *  - frequency (Number): the amount of time, in sections, to wait in between
   *      callbacks.
   *
   *  Creates an `PeriodicalExecuter`.
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
  **/
  stop: function() {
    if (!this.timer) return;
    clearInterval(this.timer);
    this.timer = null;
  },

  onTimerEvent: function() {
    if (!this.currentlyExecuting) {
      // IE doesn't support `finally` statements unless all errors are caught.
      // We mimic the behaviour of `finally` statements by duplicating code
      // that would belong in it. First at the bottom of the `try` statement
      // (for errorless cases). Secondly, inside a `catch` statement which
      // rethrows any caught errors.
      try {
        this.currentlyExecuting = true;
        this.execute();
        this.currentlyExecuting = false;
      } catch(e) {
        this.currentlyExecuting = false;
        throw e;
      }
    }
  }
});
