/** section: Ajax
 *  class Ajax.Updater < Ajax.Request
 *  
 *  A class that performs an Ajax request and updates a container’s contents
 *  with the contents of the response.
 *  
 *  `Ajax.Updater` is a subclass of [[Ajax.Request]] built for a common
 *  use-case.
 *  
 *  <h4>Example</h4>
 *  
 *    new Ajax.Updater('items', '/items', {
 *      parameters: { text: $F('text') }
 *    });
 *  
 *  This example will make a request to the URL `/items` (with the given
 *  parameters); it will then replace the contents of the element with the ID
 *  of `items` with whatever response it receives.
 *  
 *  
 *  
**/






Ajax.Updater = Class.create(Ajax.Request, {
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
