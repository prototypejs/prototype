/** section: Ajax
 *  class Ajax.Request
 *
 *  Initiates and processes an Ajax request.
 *
 *  `Ajax.Request` is a general-purpose class for making HTTP requests.
 *
 *  <h4>Automatic JavaScript response evaluation</h4>
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
 *  <h4>Methods you may find useful</h4>
 *
 *  Instances of the `Request` object provide several methods that can come in
 *  handy in your callback functions, especially once the request is complete.
 *
 *  <h5>Is the response a successful one?</h5>
 *
 *  The [[Ajax.Request#success]] method examines the XHR object's `status`
 *  property and follows general HTTP guidelines: unknown status is deemed
 *  successful, as is the whole `2xy` status code family. It's a generally
 *  better way of testing your response than the usual
 *  `200 == transport.status`.
 *
 *  <h5>Getting HTTP response headers</h5>
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
 *  <h5>Evaluating JSON headers</h5>
 *
 *  Some backends will return JSON not as response text, but in the `X-JSON`
 *  header. In this case, you don't even need to evaluate the returned JSON
 *  yourself, as Prototype automatically does so. It passes the result as the
 *  `headerJSON` property of the [[Ajax.Response]] object. Note that if there
 *  is no such header &mdash; or its contents are invalid &mdash; `headerJSON` will be set
 *  to `null`.
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
    var params = Object.clone(this.options.parameters);

    if (!['get', 'post'].include(this.method)) {
      // simulate other verbs over post
      params['_method'] = this.method;
      this.method = 'post';
    }

    this.parameters = params;

    if (params = Object.toQueryString(params)) {
      // when GET, append parameters to URL
      if (this.method == 'get')
        this.url += (this.url.include('?') ? '&' : '?') + params;
      else if (/Konqueror|Safari|KHTML/.test(navigator.userAgent))
        params += '&_=';
    }

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

    for (var name in headers)
      this.transport.setRequestHeader(name, headers[name]);
  },

  /**
   *  Ajax.Request#success() -> Boolean
   *
   *  Tests whether the request was successful.
  **/
  success: function() {
    var status = this.getStatus();
    return !status || (status >= 200 && status < 300);
  },

  getStatus: function() {
    try {
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
