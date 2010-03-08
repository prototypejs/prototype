/** section: Ajax
 *  class Ajax.PeriodicalUpdater
 *
 *  Periodically performs an Ajax request and updates a container's contents
 *  based on the response text.
 *
 *  [[Ajax.PeriodicalUpdater]] behaves like [[Ajax.Updater]], but performs the
 *  update at a prescribed interval, rather than only once. (Note that it is
 *  _not_ a subclass of [[Ajax.Updater]]; it's a wrapper around it.)
 *
 *  This class addresses the common need of periodical update, as required by
 *  all sorts of "polling" mechanisms (e.g., an online chatroom or an online
 *  mail client).
 *
 *  The basic idea is to run a regular [[Ajax.Updater]] at regular intervals,
 *  keeping track of the response text so it can (optionally) react to
 *  receiving the exact same response consecutively.
 *
 *  ##### Additional options
 *
 *  [[Ajax.PeriodicalUpdater]] features all the common options and callbacks
 *  described in the [[Ajax section]] &mdash; _plus_ those added by
 *  [[Ajax.Updater]].
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
 *  ##### Disabling and re-enabling a [[Ajax.PeriodicalUpdater]]
 *
 *  You can hit the brakes on a running [[Ajax.PeriodicalUpdater]] by calling
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
   *  Creates a new [[Ajax.PeriodicalUpdater]].
   *  
   *  Periodically performs an AJAX request and updates a container's contents
   *  based on the response text. Offers a mechanism for "decay," which lets it   
   *  trigger at widening intervals while the response is unchanged.
   *  
   *  This object addresses the common need of periodical update, which is used
   *  by all sorts of "polling" mechanisms (e.g. in an online chatroom or an
   *  online mail client).
   *  
   *  The basic idea is to run a regular [[Ajax.Updater]] at
   *  regular intervals, monitoring changes in the response text if the `decay`
   *  option (see below) is active.
   *  
   *  ##### Additional options
   *  
   *  [[Ajax.PeriodicalUpdater]] features all the common options and callbacks
   *  (see the [[Ajax section]] for more information), plus those added by
   *  [[Ajax.Updater]]. It also provides two new options that deal with the
   *  original period, and its decay rate (how Rocket Scientist does that make
   *  us sound, uh?!).
   *  
   *  <table>
   *  <thead>
   *    <tr>
   *      <th>Option</th>
   *      <th>Default</th>
   *      <th>Description</th>
   *    </tr>
   *  </thead>
   *  <tbody>
   *    <tr>
   *      <th><code>frequency</code></th>
   *      <td><code>2</code></td>
   *  <td>Okay, this is not a frequency (e.g 0.5Hz), but a period (i.e. a number of seconds).
   *  Don't kill me, I didn't write this one! This is the minimum interval at which AJAX
   *  requests are made. You don't want to make it too short (otherwise you may very well
   *  end up with multiple requests in parallel, if they take longer to process and return),
   *  but you technically can provide a number below one, e.g. 0.75 second.</td>
   *    </tr>
   *    <tr>
   *      <th><code>decay</code></th>
   *      <td>1</td>
   *  <td>This controls the rate at which the request interval grows when the response is
   *  unchanged. It is used as a multiplier on the current period (which starts at the original
   *  value of the <code>frequency</code> parameter). Every time a request returns an unchanged
   *  response text, the current period is multiplied by the decay. Therefore, the default
   *  value means regular requests (no change of interval). Values higher than one will
   *  yield growing intervals. Values below one are dangerous: the longer the response text
   *  stays the same, the more often you'll check, until the interval is so short your browser
   *  is left with no other choice than suicide. Note that, as soon as the response text
   *  <em>does</em> change, the current period resets to the original one.</td>
   *    </tr>
   *  </tbody>
   *  </table>
   *  
   *  To better understand decay, here is a small sequence of calls from the
   *  following example:
   *  
   *      new Ajax.PeriodicalUpdater('items', '/items', {
   *        method: 'get', frequency: 3, decay: 2
   *      });
   *  
   *  <table id="decayTable">
   *  <thead>
   *    <tr>
   *      <th>Call#</th>
   *      <th>When?</th>
   *      <th>Decay before</th>
   *      <th>Response changed?</th>
   *      <th>Decay after</th>
   *      <th>Next period</th>
   *      <th>Comments</th>
   *    </tr>
   *  </thead>
   *  <tbody>
   *    <tr>
   *      <td>1</td>
   *      <td>00:00</td>
   *      <td>2</td>
   *      <td>n/a</td>
   *      <td>1</td>
   *      <td>3</td>
   *  <td>Response is deemed changed, since there is no prior response to compare to!</td>
   *    </tr>
   *    <tr>
   *      <td>2</td>
   *      <td>00:03</td>
   *      <td>1</td>
   *      <td>yes</td>
   *      <td>1</td>
   *      <td>3</td>
   *  <td>Response did change again: we "reset" to 1, which was already the decay.</td>
   *    </tr>
   *    <tr>
   *      <td>3</td>
   *      <td>00:06</td>
   *      <td>1</td>
   *      <td>no</td>
   *      <td>2</td>
   *      <td>6</td>
   *  <td>Response didn't change: decay augments by the <code>decay</code> option factor:
   *  we're waiting longer now&#8230;</td>
   *    </tr>
   *    <tr>
   *      <td>4</td>
   *      <td>00:12</td>
   *      <td>2</td>
   *      <td>no</td>
   *      <td>4</td>
   *      <td>12</td>
   *      <td>Still no change, doubling again.</td>
   *    </tr>
   *    <tr>
   *      <td>5</td>
   *      <td>00:24</td>
   *      <td>4</td>
   *      <td>no</td>
   *      <td>8</td>
   *      <td>24</td>
   *      <td>Jesus, is this thing going to change or what?</td>
   *    </tr>
   *    <tr>
   *      <td>6</td>
   *      <td>00:48</td>
   *      <td>8</td>
   *      <td>yes</td>
   *      <td>1</td>
   *      <td>3</td>
   *  <td>Ah, finally! Resetting decay to 1, and therefore using the original period.</td>
   *    </tr>
   *  </tbody>
   *  </table>
   *  
   *  ##### Disabling and re-enabling a [[Ajax.PeriodicalUpdater]]
   *  
   *  You can pull the brake on a running [[Ajax.PeriodicalUpdater]] by simply
   *  calling its `stop` method. If you wish to re-enable it later, just call
   *  its `start` method. Both take no argument.
   *  
   *  ##### Beware!  Not a specialization!
   *  
   *  [[Ajax.PeriodicalUpdater]] is not a specialization of [[Ajax.Updater]],
   *  despite its name. When using it, do not expect to be able to use methods
   *  normally provided by [[Ajax.Request]] and "inherited" by [[Ajax.Updater]],
   *  such as `evalJSON` or `getHeader`. Also the `onComplete` callback is
   *  hijacked to be used for update management, so if you wish to be notified
   *  of every successful request, use `onSuccess` instead (beware: it will get
   *  called *before* the update is performed).
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
