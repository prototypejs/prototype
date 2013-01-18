/** section: Ajax
 *  class Ajax.Response
 *
 *  A wrapper class around `XmlHttpRequest` for dealing with HTTP responses
 *  of Ajax requests.
 *
 *  An instance of [[Ajax.Response]] is passed as the first argument of all Ajax
 *  requests' callbacks. You _will not_ need to create instances of
 *  [[Ajax.Response]] yourself.
**/

/**
 *  Ajax.Response#readyState -> Number
 *
 *  A [[Number]] corresponding to the request's current state.
 *
 *  `0` : `"Uninitialized"`<br />
 *  `1` : `"Loading"`<br />
 *  `2` : `"Loaded"`<br />
 *  `3` : `"Interactive"`<br />
 *  `4` : `"Complete"`
**/

/**
 *  Ajax.Response#responseText -> String
 *
 *  The text body of the response.
**/

/**
 *  Ajax.Response#responseXML -> document | null
 *
 *  The XML body of the response if the `Content-type` of the request is set
 *  to `application/xml`; `null` otherwise.
**/

/**
 *  Ajax.Response#responseJSON -> Object | Array | null
 *
 *  The JSON body of the response if the `Content-type` of the request is set
 *  to `application/json`; `null` otherwise.
**/

/**
 *  Ajax.Response#headerJSON -> Object | Array | null
 *
 *  Auto-evaluated content of the `X-JSON` header if present; `null` otherwise.
 *  This is useful to transfer _small_ amounts of data.
**/

/**
 *  Ajax.Response#request -> Ajax.Request | Ajax.Updater
 *
 *  The request object itself (an instance of [[Ajax.Request]] or
 *  [[Ajax.Updater]]).
**/

/**
 *  Ajax.Response#transport -> XmlHttpRequest
 *
 *  The native `XmlHttpRequest` object itself.
**/

Ajax.Response = Class.create({
  // Don't document the constructor; should never be manually instantiated.
  initialize: function(request){
    this.request = request;
    var transport  = this.transport  = request.transport,
        readyState = this.readyState = transport.readyState;

    if ((readyState > 2 && !Prototype.Browser.IE) || readyState == 4) {
      this.status       = this.getStatus();
      this.statusText   = this.getStatusText();
      this.responseText = String.interpret(transport.responseText);
      this.headerJSON   = this._getHeaderJSON();
    }

    if (readyState == 4) {
      var xml = transport.responseXML;
      this.responseXML  = Object.isUndefined(xml) ? null : xml;
      this.responseJSON = this._getResponseJSON();
    }
  },

  /**
   *  Ajax.Response#status -> Number
   *
   *  The HTTP status code sent by the server.
  **/
  status:      0,

  /**
   *  Ajax.Response#statusText -> String
   *
   *  The HTTP status text sent by the server.
  **/
  statusText: '',

  getStatus: Ajax.Request.prototype.getStatus,

  getStatusText: function() {
    try {
      return this.transport.statusText || '';
    } catch (e) { return '' }
  },

  /**
   *  Ajax.Response#getHeader(name) -> String | null
   *
   *  See [[Ajax.Request#getHeader]].
  **/
  getHeader: Ajax.Request.prototype.getHeader,

  /**
   *  Ajax.Response#getAllHeaders() -> String | null
   *
   *  Returns a [[String]] containing all headers separated by line breaks.
   *  _Does not_ throw errors if no headers are present the way its native
   *  counterpart does.
  **/
  getAllHeaders: function() {
    try {
      return this.getAllResponseHeaders();
    } catch (e) { return null }
  },

  /**
   *  Ajax.Response#getResponseHeader(name) -> String
   *
   *  Returns the value of the requested header if present; throws an error
   *  otherwise. This is just a wrapper around the `XmlHttpRequest` method of
   *  the same name. Prefer it's shorter counterpart:
   *  [[Ajax.Response#getHeader]].
  **/
  getResponseHeader: function(name) {
    return this.transport.getResponseHeader(name);
  },

  /**
   *  Ajax.Response#getAllResponseHeaders() -> String
   *
   *  Returns a [[String]] containing all headers separated by line breaks; throws
   *  an error if no headers exist. This is just a wrapper around the
   *  `XmlHttpRequest` method of the same name. Prefer it's shorter counterpart:
   *  [[Ajax.Response#getAllHeaders]].
  **/
  getAllResponseHeaders: function() {
    return this.transport.getAllResponseHeaders();
  },

  _getHeaderJSON: function() {
    var json = this.getHeader('X-JSON');
    if (!json) return null;

    try {
      // Browsers expect HTTP headers to be ASCII and nothing else. Running
      // them through `decodeURIComponent` processes them with the page's
      // specified encoding.
      json = decodeURIComponent(escape(json));
    } catch(e) {
      // Except Chrome doesn't seem to need this, and calling
      // `decodeURIComponent` on text that's already in the proper encoding
      // will throw a `URIError`. The ugly solution is to assume that a
      // `URIError` raised here signifies that the text is, in fact, already 
      // in the correct encoding, and treat the failure as a good sign.
      //
      // This is ugly, but so too is sending extended characters in an HTTP
      // header with no spec to back you up.
    }
    
    try {
      return json.evalJSON(this.request.options.sanitizeJSON ||
        !this.request.isSameOrigin());
    } catch (e) {
      this.request.dispatchException(e);
    }
  },

  _getResponseJSON: function() {
    var options = this.request.options;
    if (!options.evalJSON || (options.evalJSON != 'force' &&
      !(this.getHeader('Content-type') || '').include('application/json')) ||
        this.responseText.blank())
          return null;
    try {
      return this.responseText.evalJSON(options.sanitizeJSON ||
        !this.request.isSameOrigin());
    } catch (e) {
      this.request.dispatchException(e);
    }
  }
});
