/** section: Ajax
 *  class Ajax.Request
 *
 *  Initiates and processes an Ajax request.
 *
 *  [[Ajax.Request]] is a general-purpose class for making HTTP requests which
 *  handles the life-cycle of the request, handles the boilerplate, and lets
 *  you plug in callback functions for your custom needs.
 *
 *  In the optional `options` hash, you usually provide an `onComplete` and/or
 *  `onSuccess` callback, unless you're in the edge case where you're getting a
 *  JavaScript-typed response, that will automatically be `eval`'d.
 *  
 *  For a full list of common options and callbacks, see "Ajax options" heading
 *  of the [[Ajax section]].
 *
 *  ##### A basic example
 *
 *      new Ajax.Request('/your/url', {
 *        onSuccess: function(response) {
 *          // Handle the response content...
 *        }
 *      });
 *
 *  ##### Request life-cycle
 *  
 *  Underneath our nice requester objects lies, of course, `XMLHttpRequest`. The
 *  defined life-cycle is as follows:
 *  
 *  1. Created
 *  2. Initialized
 *  3. Request sent
 *  4. Response being received (can occur many times, as packets come in)
 *  5. Response received, request complete
 *  
 *  As you can see under the "Ajax options" heading of the [[Ajax section]],
 *  Prototype's AJAX objects define a whole slew of callbacks, which are
 *  triggered in the following order:
 *  
 *  1. `onCreate` (this is actually a callback reserved to [[Ajax.Responders]])
 *  2. `onUninitialized` (maps on Created)
 *  3. `onLoading` (maps on Initialized)
 *  4. `onLoaded` (maps on Request sent)
 *  5. `onInteractive` (maps on Response being received)
 *  6. `on`*XYZ* (numerical response status code), onSuccess or onFailure (see below)
 *  7. `onComplete`
 *  
 *  The two last steps both map on *Response received*, in that order. If a
 *  status-specific callback is defined, it gets invoked. Otherwise, if
 *  `onSuccess` is defined and the response is deemed a success (see below), it
 *  is invoked. Otherwise, if `onFailure` is defined and the response is *not*
 *  deemed a success, it is invoked. Only after that potential first callback is
 *  `onComplete` called.
 *  
 *  ##### A note on portability
 *  
 *  Depending on how your browser implements `XMLHttpRequest`, one or more
 *  callbacks may never be invoked. In particular, `onLoaded` and
 *  `onInteractive` are not a 100% safe bet so far. However, the global
 *  `onCreate`, `onUninitialized` and the two final steps are very much
 *  guaranteed.
 *  
 *  ##### `onSuccess` and `onFailure`, the under-used callbacks
 *  
 *  Way too many people use [[Ajax.Request]] in a similar manner to raw XHR,
 *  defining only an `onComplete` callback even when they're only interested in
 *  "successful" responses, thereby testing it by hand:
 *  
 *      // This is too bad, there's better!
 *      new Ajax.Request('/your/url', {
 *        onComplete: function(response) {
 *          if (200 == response.status)
 *            // yada yada yada
 *        }
 *      });
 *  
 *  First, as described below, you could use better "success" detection: success
 *  is generally defined, HTTP-wise, as either no response status or a "2xy"
 *  response status (e.g., 201 is a success, too). See the example below.
 *  
 *  Second, you could dispense with status testing altogether! Prototype adds
 *  callbacks specific to success and failure, which we listed above. Here's
 *  what you could do if you're only interested in success, for instance:
 *  
 *      new Ajax.Request('/your/url', {
 *        onSuccess: function(response) {
 *            // yada yada yada
 *        }
 *      });
 *  
 *  ##### Automatic JavaScript response evaluation
 *
 *  If an Ajax request follows the _same-origin policy_ **and** its response
 *  has a JavaScript-related `Content-type`, the content of the `responseText`
 *  property will automatically be passed to `eval`.
 *
 *  In other words: you don't even need to provide a callback to leverage
 *  pure-JavaScript Ajax responses. This is the convention that drives Rails's
 *  RJS.
 *
 *  The list of JavaScript-related MIME-types handled by Prototype is:
 *
 *  * `application/ecmascript`
 *  * `application/javascript`
 *  * `application/x-ecmascript`
 *  * `application/x-javascript`
 *  * `text/ecmascript`
 *  * `text/javascript`
 *  * `text/x-ecmascript`
 *  * `text/x-javascript`
 *
 *  The MIME-type string is examined in a case-insensitive manner.
 *
 *  ##### Methods you may find useful
 *
 *  Instances of the [[Ajax.Request]] object provide several methods that come
 *  in handy in your callback functions, especially once the request is complete.
 *
 *  ###### Is the response a successful one?
 *
 *  The [[Ajax.Request#success]] method examines the XHR object's `status`
 *  property and follows general HTTP guidelines: unknown status is deemed
 *  successful, as is the whole `2xy` status code family. It's a generally
 *  better way of testing your response than the usual
 *  `200 == transport.status`.
 *
 *  ###### Getting HTTP response headers
 *
 *  While you can obtain response headers from the XHR object using its
 *  `getResponseHeader` method, this makes for verbose code, and several
 *  implementations raise an exception when the header is not found. To make
 *  this easier, you can use the [[Ajax.Response#getHeader]] method, which
 *  delegates to the longer version and returns `null` if an exception occurs:
 *
 *      new Ajax.Request('/your/url', {
 *        onSuccess: function(response) {
 *          // Note how we brace against null values
 *          if ((response.getHeader('Server') || '').match(/Apache/))
 *            ++gApacheCount;
 *          // Remainder of the code
 *        }
 *      });
 *
 *  ##### Evaluating JSON headers
 *
 *  Some backends will return JSON not as response text, but in the `X-JSON`
 *  header. In this case, you don't even need to evaluate the returned JSON
 *  yourself, as Prototype automatically does so. It passes the result as the
 *  `headerJSON` property of the [[Ajax.Response]] object. Note that if there
 *  is no such header &mdash; or its contents are invalid &mdash; `headerJSON`
 *  will be set to `null`.
 *
 *      new Ajax.Request('/your/url', {
 *        onSuccess: function(transport) {
 *          transport.headerJSON
 *        }
 *      });
**/
Ajax.Request = Class.create(Ajax.Base, {
  _complete: false,

  /**
   *  new Ajax.Request(url[, options])
   *  - url (String): The URL to fetch. When the _same-origin_ policy is in
   *    effect (as it is in most cases), `url` **must** be a relative URL or an
   *    absolute URL that starts with a slash (i.e., it must not begin with
   *    `http`).
   *  - options (Object): Configuration for the request. See the
   *    [[Ajax section]] for more information.
   *
   *  Creates a new `Ajax.Request`.
  **/
  initialize: function($super, url, options) {
    $super(options);
    this.transport = Ajax.getTransport();
    this.request(url);
  },

  request: function(url) {
    this.url = url;
    this.method = this.options.method;
    var params = Object.isString(this.options.parameters) ?
          this.options.parameters :
          Object.toQueryString(this.options.parameters);

    if (!['get', 'post'].include(this.method)) {
      // simulate other verbs over post
      params += (params ? '&' : '') + "_method=" + this.method;
      this.method = 'post';
    }

    if (params && this.method === 'get') {
      // when GET, append parameters to URL
      this.url += (this.url.include('?') ? '&' : '?') + params;
    }

    this.parameters = params.toQueryParams();

    try {
      var response = new Ajax.Response(this);
      if (this.options.onCreate) this.options.onCreate(response);
      Ajax.Responders.dispatch('onCreate', this, response);

      this.transport.open(this.method.toUpperCase(), this.url,
        this.options.asynchronous);

      if (this.options.asynchronous) this.respondToReadyState.bind(this).defer(1);

      this.transport.onreadystatechange = this.onStateChange.bind(this);
      this.setRequestHeaders();

      this.body = this.method == 'post' ? (this.options.postBody || params) : null;
      this.transport.send(this.body);

      /* Force Firefox to handle ready state 4 for synchronous requests */
      if (!this.options.asynchronous && this.transport.overrideMimeType)
        this.onStateChange();

    }
    catch (e) {
      this.dispatchException(e);
    }
  },

  onStateChange: function() {
    var readyState = this.transport.readyState;
    if (readyState > 1 && !((readyState == 4) && this._complete))
      this.respondToReadyState(this.transport.readyState);
  },

  setRequestHeaders: function() {
    var headers = {
      'X-Requested-With': 'XMLHttpRequest',
      'X-Prototype-Version': Prototype.Version,
      'Accept': 'text/javascript, text/html, application/xml, text/xml, */*'
    };

    if (this.method == 'post') {
      headers['Content-type'] = this.options.contentType +
        (this.options.encoding ? '; charset=' + this.options.encoding : '');

      /* Force "Connection: close" for older Mozilla browsers to work
       * around a bug where XMLHttpRequest sends an incorrect
       * Content-length header. See Mozilla Bugzilla #246651.
       */
      if (this.transport.overrideMimeType &&
          (navigator.userAgent.match(/Gecko\/(\d{4})/) || [0,2005])[1] < 2005)
            headers['Connection'] = 'close';
    }

    // user-defined headers
    if (typeof this.options.requestHeaders == 'object') {
      var extras = this.options.requestHeaders;

      if (Object.isFunction(extras.push))
        for (var i = 0, length = extras.length; i < length; i += 2)
          headers[extras[i]] = extras[i+1];
      else
        $H(extras).each(function(pair) { headers[pair.key] = pair.value });
    }

    // skip null or undefined values
    for (var name in headers)
      if (headers[name] != null)
        this.transport.setRequestHeader(name, headers[name]);
  },

  /**
   *  Ajax.Request#success() -> Boolean
   *
   *  Tests whether the request was successful.
  **/
  success: function() {
    var status = this.getStatus();
    return !status || (status >= 200 && status < 300) || status == 304;
  },

  getStatus: function() {
    try {
      // IE sometimes returns 1223 for a 204 response.
      if (this.transport.status === 1223) return 204;
      return this.transport.status || 0;
    } catch (e) { return 0 }
  },

  respondToReadyState: function(readyState) {
    var state = Ajax.Request.Events[readyState], response = new Ajax.Response(this);

    if (state == 'Complete') {
      try {
        this._complete = true;
        (this.options['on' + response.status]
         || this.options['on' + (this.success() ? 'Success' : 'Failure')]
         || Prototype.emptyFunction)(response, response.headerJSON);
      } catch (e) {
        this.dispatchException(e);
      }

      var contentType = response.getHeader('Content-type');
      if (this.options.evalJS == 'force'
          || (this.options.evalJS && this.isSameOrigin() && contentType
          && contentType.match(/^\s*(text|application)\/(x-)?(java|ecma)script(;.*)?\s*$/i)))
        this.evalResponse();
    }

    try {
      (this.options['on' + state] || Prototype.emptyFunction)(response, response.headerJSON);
      Ajax.Responders.dispatch('on' + state, this, response, response.headerJSON);
    } catch (e) {
      this.dispatchException(e);
    }

    if (state == 'Complete') {
      // avoid memory leak in MSIE: clean up
      this.transport.onreadystatechange = Prototype.emptyFunction;
    }
  },

  isSameOrigin: function() {
    var m = this.url.match(/^\s*https?:\/\/[^\/]*/);
    return !m || (m[0] == '#{protocol}//#{domain}#{port}'.interpolate({
      protocol: location.protocol,
      domain: document.domain,
      port: location.port ? ':' + location.port : ''
    }));
  },

  /**
   *  Ajax.Request#getHeader(name) -> String | null
   *  - name (String): The name of an HTTP header that may have been part of
   *    the response.
   *
   *  Returns the value of the given response header, or `null` if that header
   *  was not found.
  **/
  getHeader: function(name) {
    try {
      return this.transport.getResponseHeader(name) || null;
    } catch (e) { return null; }
  },

  evalResponse: function() {
    try {
      return eval((this.transport.responseText || '').unfilterJSON());
    } catch (e) {
      this.dispatchException(e);
    }
  },

  dispatchException: function(exception) {
    (this.options.onException || Prototype.emptyFunction)(this, exception);
    Ajax.Responders.dispatch('onException', this, exception);
  }
});

Ajax.Request.Events =
  ['Uninitialized', 'Loading', 'Loaded', 'Interactive', 'Complete'];
