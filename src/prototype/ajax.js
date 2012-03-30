//= compat
//= require "ajax/ajax"
//= require "ajax/responders"
//= require "ajax/base"
//= require "ajax/request"
//= require "ajax/response"
//= require "ajax/updater"
//= require "ajax/periodical_updater"

/**
 *  == Ajax ==
 *
 *  Prototype's APIs around the `XmlHttpRequest` object.
 *
 *  The Prototype framework enables you to deal with Ajax calls in a manner that
 *  is both easy and compatible with all modern browsers.
 *
 *  Actual requests are made by creating instances of [[Ajax.Request]].
 *
 *  ##### Request headers
 *
 *  The following headers are sent with all Ajax requests (and can be
 *  overridden with the `requestHeaders` option described below):
 *
 *  * `X-Requested-With` is set to `XMLHttpRequest`.
 *  * `X-Prototype-Version` is set to Prototype's current version (e.g.,
 *    `<%= PROTOTYPE_VERSION %>`).
 *  * `Accept` is set to `text/javascript, text/html, application/xml,
 *     text/xml, * / *`
 *  * `Content-type` is automatically determined based on the `contentType`
 *    and `encoding` options.
 *
 *  ##### Ajax options
 *
 *  All Ajax classes share a common set of _options_ and _callbacks_.
 *  Callbacks are called at various points in the life-cycle of a request, and
 *  always feature the same list of arguments.
 *
 *  ##### Common options
 *
 *  * `asynchronous` ([[Boolean]]; default `true`): Determines whether
 *    `XMLHttpRequest` is used asynchronously or not. Synchronous usage is
 *    **strongly discouraged** &mdash; it halts all script execution for the
 *    duration of the request _and_ blocks the browser UI.
 *  * `contentType` ([[String]]; default `application/x-www-form-urlencoded`):
 *    The `Content-type` header for your request. Change this header if you
 *    want to send data in another format (like XML).
 *  * `encoding` ([[String]]; default `UTF-8`): The encoding for the contents
 *    of your request. It is best left as-is, but should weird encoding issues
 *    arise, you may have to tweak this.
 *  * `method` ([[String]]; default `post`): The HTTP method to use for the
 *    request. The other common possibility is `get`. Abiding by Rails
 *    conventions, Prototype also reacts to other HTTP verbs (such as `put` and
 *    `delete`) by submitting via `post` and adding a extra `_method` parameter
 *    with the originally-requested method.
 *  * `parameters` ([[String]]): The parameters for the request, which will be
 *    encoded into the URL for a `get` method, or into the request body for the
 *    other methods. This can be provided either as a URL-encoded string, a
 *    [[Hash]], or a plain [[Object]].
 *  * `postBody` ([[String]]): Specific contents for the request body on a
 *    `post` method. If it is not provided, the contents of the `parameters`
 *    option will be used instead.
 *  * `requestHeaders` ([[Object]]): A set of key-value pairs, with properties
 *    representing header names.
 *  * `evalJS` ([[Boolean]] | [[String]]; default `true`): Automatically `eval`s
 *    the content of [[Ajax.Response#responseText]] if the `Content-type` returned
 *    by the server is set to one of `text/javascript`, `application/ecmascript`
 *    (matches expression `(text|application)\/(x-)?(java|ecma)script`).
 *    If the request doesn't obey same-origin policy, the content is not evaluated.
 *    If you need to force evalutation, pass `'force'`. To prevent it altogether,
 *    pass `false`.
 *  * `evalJSON` ([[Boolean]] | [[String]]; default `true`): Automatically `eval`s
 *    the content of [[Ajax.Response#responseText]] and populates
 *    [[Ajax.Response#responseJSON]] with it if the `Content-type` returned by
 *    the server is set to `application/json`. If the request doesn't obey
 *    same-origin policy, the content is sanitized before evaluation. If you
 *    need to force evalutation, pass `'force'`. To prevent it altogether, pass
 *    `false`.
 *  * `sanitizeJSON` ([[Boolean]]; default is `false` for same-origin requests,
 *    `true` otherwise): Sanitizes the contents of
 *    [[Ajax.Response#responseText]] before evaluating it.
 *
 *  ##### Common callbacks
 *
 *  When used on individual instances, all callbacks (except `onException`) are
 *  invoked with two parameters: the [[Ajax.Response]] object and the result of
 *  evaluating the `X-JSON` response header, if any (can be `null`).
 *
 *  For another way of describing their chronological order and which callbacks
 *  are mutually exclusive, see [[Ajax.Request]].
 *
 *  * `onCreate`: Triggered when the [[Ajax.Request]] object is initialized.
 *    This is _after_ the parameters and the URL have been processed, but
 *    _before_ opening the connection via the XHR object.
 *  * `onUninitialized` (*Not guaranteed*):  Invoked just after the XHR object
 *    is created.
 *  * `onLoading` (*Not guaranteed*): Triggered when the underlying XHR object
 *    is being setup, and its connection opened.
 *  * `onLoaded` (*Not guaranteed*): Triggered once the underlying XHR object
 *    is setup, the connection is open, and it is ready to send its actual
 *    request.
 *  * `onInteractive` (*Not guaranteed*): Triggered whenever the requester
 *    receives a part of the response (but not the final part), should it
 *    be sent in several packets.
 *  * `onSuccess`: Invoked when a request completes and its status code is
 *    `undefined` or belongs in the `2xy` family. This is skipped if a
 *    code-specific callback is defined (e.g., `on200`), and happens _before_
 *    `onComplete`.
 *  * `onFailure`: Invoked when a request completes and its status code exists
 *    but _is not_ in the `2xy` family. This is skipped if a code-specific
 *    callback is defined (e.g. `on403`), and happens _before_ `onComplete`.
 *  * `onXYZ` (_with `XYZ` representing any HTTP status code_): Invoked just
 *    after the response is complete _if_ the status code is the exact code
 *    used in the callback name. _Prevents_ execution of `onSuccess` and
 *    `onFailure`. Happens _before_ `onComplete`.
 *  * `onException`: Triggered whenever an XHR error arises. Has a custom
 *    signature: the first argument is the requester (i.e. an [[Ajax.Request]]
 *    instance), and the second is the exception object.
 *  * `onComplete`: Triggered at the _very end_ of a request's life-cycle, after
 *    the request completes, status-specific callbacks are called, and possible
 *    automatic behaviors are processed. Guaranteed to run regardless of what
 *    happened during the request.
 *
**/
