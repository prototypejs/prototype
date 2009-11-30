/* Update Helper (c) 2008-2009 Tobie Langel
 * 
 * Requires Prototype >= 1.6.0
 * 
 * Update Helper is distributable under the same terms as Prototype
 * (MIT-style license). For details, see the Prototype web site:
 * http://www.prototypejs.org/
 * 
 *--------------------------------------------------------------------------*/

var UpdateHelper = Class.create({
  logLevel: 0,
  MessageTemplate: new Template('Update Helper: #{message}\n#{stack}'),
  Regexp:          new RegExp("@" + window.location.protocol + ".*?\\d+\\n", "g"),
  
  initialize: function(deprecatedMethods) {
    var notify = function(message, type) {
      this.notify(message, type);
    }.bind(this);   // Late binding to simplify testing.
    
    deprecatedMethods.each(function(d) {
      var condition = d.condition,
          type      = d.type || 'info',
          message   = d.message,
          namespace = d.namespace,
          method    = d.methodName;
      
      namespace[method] = (namespace[method] || function() {}).wrap(function(proceed) {
        var args = $A(arguments).splice(1);
        if (!condition || condition.apply(this, args)) notify(message, type);
        return proceed.apply(proceed, args);
      });
    });
    Element.addMethods();
  },
  
  notify: function(message, type) {
    switch(type) {
      case 'info':
        if (this.logLevel > UpdateHelper.Info) return false;
      case 'warn':
        if (this.logLevel > UpdateHelper.Warn) return false;
      default:
        if (this.logLevel > UpdateHelper.Error) return false;
    }
    this.log(this.MessageTemplate.evaluate({
      message: message,
      stack: this.getStack()
    }), type);
    return true;
  },
  
  getStack: function() {
    try {
      throw new Error("stack");
    } catch(e) {
      var match = (e.stack || '').match(this.Regexp);
      if (match) {
        return match.reject(function(path) {
          return (/(prototype|unittest|update_helper)\.js/).test(path);
        }).join("\n");
      } else { return ''; }
    }
  },
  
  log: function(message, type) {
    if (type == 'error') console.error(message);
    else if (type == 'warn') console.warn(message);
    else console.log(message);
  }
});

Object.extend(UpdateHelper, {
  Info:  0,
  Warn:  1,
  Error: 2
});

