/** section: Ajax
 *  class Ajax.PeriodicalUpdater
 *
 *  Periodically performs an Ajax request and updates a container's contents
 *  based on the response text.
 *
 *  `Ajax.PeriodicalUpdater` behaves like [[Ajax.Updater]], but performs the
 *  update at a prescribed interval, rather than only once. (Note that it is
 *  _not_ a subclass of `Ajax.Updater`; it's a wrapper around it.)
 *
 *  This class addresses the common need of periodical update, as required by
 *  all sorts of "polling" mechanisms (e.g., an online chatroom or an online
 *  mail client).
 *
 *  The basic idea is to run a regular [[Ajax.Updater]] at regular intervals,
 *  keeping track of the response text so it can (optionally) react to
 *  receiving the exact same response consecutively.
 *
 *  <h4>Additional options</h4>
 *
 *  `Ajax.PeriodicalUpdater` features all the common options and callbacks
 *  described in the [[Ajax section]] &mdash; _plus_ those added by `Ajax.Updater`.
 *
 *  It also provides two new options:
 *
 *  * `frequency` ([[Number]]; default is `2`): How long, in seconds, to wait
 *    between the end of one request and the beginning of the next.
 *  * `decay` ([[Number]]; default is `1`): The rate at which the `frequency`
 *    grows when the response received is _exactly_ the same as the previous.
 *    The default of `1` means `frequency` will never grow; override the
 *    default if a stale response implies it's worthwhile to poll less often.
 *    If `decay` is set to `2`, for instance, `frequency` will double
 *    (2 seconds, 4 seconds, 8 seconds...) each consecutive time the result
 *    is the same; when the result is different once again, `frequency` will
 *    revert to its original value.
 *
 *  <h4>Disabling and re-enabling a <code>PeriodicalUpdater</code></h4>
 *
 *  You can hit the brakes on a running `PeriodicalUpdater` by calling
 *  [[Ajax.PeriodicalUpdater#stop]]. If you wish to re-enable it later, call
 *  [[Ajax.PeriodicalUpdater#start]].
 *
**/

Ajax.PeriodicalUpdater = Class.create(Ajax.Base, {
  /**
   *  new Ajax.PeriodicalUpdater(container, url[, options])
   *  - container (String | Element): The DOM element whose contents to update
   *    as a result of the Ajax request. Can be a DOM node or a string that
   *    identifies a node's ID.
   *  - url (String): The URL to fetch. When the _same-origin_ policy is in
   *    effect (as it is in most cases), `url` **must** be a relative URL or an
   *    absolute URL that starts with a slash (i.e., it must not begin with
   *    `http`).
   *  - options (Object): Configuration for the request. See the
   *    [[Ajax section]] for more information.
   *
   *  Creates a new `Ajax.PeriodicalUpdater`.
  **/
  initialize: function($super, container, url, options) {
    $super(options);
    this.onComplete = this.options.onComplete;

    this.frequency = (this.options.frequency || 2);
    this.decay = (this.options.decay || 1);

    this.updater = { };
    this.container = container;
    this.url = url;

    this.start();
  },

  /**
   *  Ajax.PeriodicalUpdater#start() -> undefined
   *
   *  Starts the periodical updater (if it had previously been stopped with
   *  [[Ajax.PeriodicalUpdater#stop]]).
  **/
  start: function() {
    this.options.onComplete = this.updateComplete.bind(this);
    this.onTimerEvent();
  },

  /**
   *  Ajax.PeriodicalUpdater#stop() -> undefined
   *
   *  Stops the periodical updater.
   *
   *  Also calls the `onComplete` callback, if one has been defined.
  **/
  stop: function() {
    this.updater.options.onComplete = undefined;
    clearTimeout(this.timer);
    (this.onComplete || Prototype.emptyFunction).apply(this, arguments);
  },

  updateComplete: function(response) {
    if (this.options.decay) {
      this.decay = (response.responseText == this.lastText ?
        this.decay * this.options.decay : 1);

      this.lastText = response.responseText;
    }
    this.timer = this.onTimerEvent.bind(this).delay(this.decay * this.frequency);
  },

  onTimerEvent: function() {
    this.updater = new Ajax.Updater(this.container, this.url, this.options);
  }
});
