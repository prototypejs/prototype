/** section: Ajax
 *  class Ajax.Updater < Ajax.Request
 *
 *  A class that performs an Ajax request and updates a container's contents
 *  with the contents of the response.
 *
 *  [[Ajax.Updater]] is a subclass of [[Ajax.Request]] built for a common
 *  use-case.
 *
 *  ##### Example
 *
 *      new Ajax.Updater('items', '/items', {
 *        parameters: { text: $F('text') }
 *      });
 *
 *  This example will make a request to the URL `/items` (with the given
 *  parameters); it will then replace the contents of the element with the ID
 *  of `items` with whatever response it receives.
 *
 *  ##### Callbacks
 *
 *  [[Ajax.Updater]] supports all the callbacks listed in the [[Ajax section]].
 *  Note that the `onComplete` callback will be invoked **after** the element
 *  is updated.
 *
 *  ##### Additional options
 *
 *  [[Ajax.Updater]] has some options of its own apart from the common options
 *  described in the [[Ajax section]]:
 *
 *  * `evalScripts` ([[Boolean]]; defaults to `false`): Whether `<script>`
 *    elements in the response text should be evaluated.
 *  * `insertion` ([[String]]): By default, `Element.update` is used, meaning
 *    the contents of the response will replace the entire contents of the
 *    container. You may _instead_ insert the response text without disrupting
 *    existing contents. The `insertion` option takes one of four strings &mdash;
 *    `top`, `bottom`, `before`, or `after` &mdash; and _inserts_ the contents
 *    of the response in the manner described by [[Element#insert]].
 *
 *  ##### More About `evalScripts`
 *
 *  If you use `evalScripts: true`, any _inline_ `<script>` block will be
 *  evaluated. This **does not** mean it will be evaluated in the global scope;
 *  it won't, and that has important ramifications for your `var` and `function`
 *  statements.  Also note that only inline `<script>` blocks are supported;
 *  external scripts are ignored. See [[String#evalScripts]] for the details.
 *
 *  ##### Single container, or success/failure split?
 *
 *  The examples above all assume you're going to update the same container
 *  whether your request succeeds or fails. Instead, you may want to update
 *  _only_ for successful requests, or update a _different container_ on failed
 *  requests.
 *
 *  To achieve this, you can pass an object instead of a DOM element for the
 *  `container` parameter. This object _must_ have a `success` property whose
 *  value identifies the container to be updated on successful requests.
 *
 *  If you also provide it with a `failure` property, its value will be used as
 *  the container for failed requests.
 *
 *  In the following code, only successful requests get an update:
 *
 *      new Ajax.Updater({ success: 'items' }, '/items', {
 *        parameters: { text: $F('text') },
 *        insertion: 'bottom'
 *      });
 *
 *  This next example assumes failed requests will deliver an error message as
 *  response text &mdash; one that should be shown to the user in another area:
 *
 *      new Ajax.Updater({ success: 'items', failure: 'notice' }, '/items',
 *        parameters: { text: $F('text') },
 *        insertion: 'bottom'
 *      });
 *
**/

Ajax.Updater = Class.create(Ajax.Request, {
  /**
   *  new Ajax.Updater(container, url[, options])
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
   *  Creates a new `Ajax.Updater`.
  **/
  initialize: function($super, container, url, options) {
    this.container = {
      success: (container.success || container),
      failure: (container.failure || (container.success ? null : container))
    };

    options = Object.clone(options);
    var onComplete = options.onComplete;
    options.onComplete = (function(response, json) {
      this.updateContent(response.responseText);
      if (Object.isFunction(onComplete)) onComplete(response, json);
    }).bind(this);

    $super(url, options);
  },

  updateContent: function(responseText) {
    var receiver = this.container[this.success() ? 'success' : 'failure'],
        options = this.options;

    if (!options.evalScripts) responseText = responseText.stripScripts();

    if (receiver = $(receiver)) {
      if (options.insertion) {
        if (Object.isString(options.insertion)) {
          var insertion = { }; insertion[options.insertion] = responseText;
          receiver.insert(insertion);
        }
        else options.insertion(receiver, responseText);
      }
      else receiver.update(responseText);
    }
  }
});
