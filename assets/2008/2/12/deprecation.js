/*  Prototype Deprecation Notifier for Prototype 1.6.0.2
 *  (c) 2008 Tobie Langel
 *
 *  Prototype Deprecation Notifier is freely distributable under the same
 *  terms as Prototype (MIT-style license).
 *  For details, see the Prototype web site: http://www.prototypejs.org/
 *  
 *  Include this file right below prototype.js. All warning messages
 *  will be logged to the console.
 *  
 *  Note: You can turn off deprecation messages (and log only removal and
 *  modification messages) by specifying:
 *  DeprecationNotifier.logDeprecation = false;
 * 
 *                THIS SCRIPT WORKS IN FIREFOX ONLY
 *--------------------------------------------------------------------------*/

var DeprecationNotifier = {
  logDeprecation:  true,
  MessageTemplate: new Template('Prototype #{type} Warning: #{message}\n#{stack}'),
  Regexp:          new RegExp("@" + window.location.protocol + ".*?\\d+\\n", "g"),

  init: function(deprecatedMethods) {
    if (!Prototype.Browser.Gecko) return;
    deprecatedMethods.each(function(d) {
      var condition = d.condition,
          type      = d.type || 'deprecation',
          message   = d.message,
          namespace = d.namespace,
          method    = d.methodName;
          
      namespace[method] = (namespace[method] || function() {}).wrap(function(proceed) {
        var args = $A(arguments).splice(1);
        if (!condition || condition.apply(this, args))
          DeprecationNotifier.notify(message, type);
        return proceed.apply(proceed, args);
      });
    });
    Element.addMethods();
  },
  
  notify: function(message, type) {
    if (type == 'deprecation' && !DeprecationNotifier.logDeprecation)
      return false;
    this.log(this.MessageTemplate.evaluate({
      message: message,
      stack: this.getStack(),
      type: type.capitalize()
    }), type);
    return true;
  },
  
  getStack: function() {
    try {
      throw new Error("stack");
    } catch(e) {
      return e.stack.match(this.Regexp).reject(function(path) {
        return /(prototype|unittest|deprecation)\.js/.test(path);
      }).join("\n");
    }
  },
  
  log: function(message, type) {
    if (type === 'removal') {
      console.error(message);
    } else console.warn(message);
  }
};

DeprecationNotifier.init([
  {
    methodName: 'display',
    namespace: Toggle,
    message: 'Toggle.display has been deprecated, please use Element.toggle instead.'
  },
  
  {
    methodName: 'show',
    namespace: Element.Methods,
    message: 'Passing an arbitrary number of elements to Element.show is no longer supported.\n' +
      'Use [id_1, id_2, ...].each(Element.show) or $(id_1, id_2, ...).invoke("show") instead.',
    type: 'removal',
    condition: function() { return arguments.length > 1 && !Object.isNumber(arguments[1]) }
  },
  
  {
    methodName: 'hide',
    namespace: Element.Methods,
    message: 'Passing an arbitrary number of elements to Element.hide is no longer supported.\n' +
      'Use [id_1, id_2, ...].each(Element.hide) or $(id_1, id_2, ...).invoke("hide") instead.',
    type: 'removal',
    condition: function() { return arguments.length > 1 && !Object.isNumber(arguments[1]) }
  },
  
  {
    methodName: 'toggle',
    namespace: Element.Methods,
    message: 'Passing an arbitrary number of elements to Element.toggle is no longer supported.\n' +
      'Use [id_1, id_2, ...].each(Element.toggle) or $(id_1, id_2, ...).invoke("toggle") instead.',
    type: 'removal',
    condition: function() { return arguments.length > 1 && !Object.isNumber(arguments[1]) }
  },
  
  {
    methodName: 'clear',
    namespace: Form.Element.Methods,
    message: 'Passing an arbitrary number of elements to Field.clear is no longer supported.\n' +
      'Use [id_1, id_2, ...].each(Form.Element.clear) or $(id_1, id_2, ...).invoke("clear") instead.',
    type: 'removal',
    condition: function() { return arguments.length > 1 && !Object.isNumber(arguments[1]) }
  },
  
  {
    methodName: 'present',
    namespace: Form.Element.Methods,
    message: 'Passing an arbitrary number of elements to Field.present is no longer supported.\n' +
      'Use [id_1, id_2, ...].each(Form.Element.present) or $(id_1, id_2, ...).invoke("present") instead.',
    type: 'removal',
    condition: function() { return arguments.length > 1 && !Object.isNumber(arguments[1]) }
  },
  
  {
    methodName: 'childOf',
    namespace: Element.Methods,
    message: 'Element#childOf has been deprecated, please use Element#descendantOf instead.'
  },
  
  {
    methodName: 'Before',
    namespace: Insertion,
    message: 'Insertion.Before has been deprecated, please use Element#insert instead.'
  },
  
  {
    methodName: 'Top',
    namespace: Insertion,
    message: 'Insertion.Top has been deprecated, please use Element#insert instead.'
  },
  
  {
    methodName: 'Bottom',
    namespace: Insertion,
    message: 'Insertion.Bottom has been deprecated, please use Element#insert instead.'
  },
  
  {
    methodName: 'After',
    namespace: Insertion,
    message: 'Insertion.After has been deprecated, please use Element#insert instead.'
  },
  
  {
    methodName: 'prepare',
    namespace: Position,
    message: 'Position.prepare has been deprecated.'
  },
  
  {
    methodName: 'within',
    namespace: Position,
    message: 'Position.within has been deprecated.'
  },
  
  {
    methodName: 'withinIncludingScrolloffsets',
    namespace: Position,
    message: 'Position.withinIncludingScrolloffsets has been deprecated.'
  },
  
  {
    methodName: 'overlap',
    namespace: Position,
    message: 'Position.overlap has been deprecated.'
  },
  
  {
    methodName: 'cumulativeOffset',
    namespace: Position,
    message: 'Position.cumulativeOffset has been deprecated, please use Element#cumulativeOffset instead.'
  },
  
  {
    methodName: 'positionedOffset',
    namespace: Position,
    message: 'Position.positionedOffset has been deprecated, please use Element#positionedOffset instead.'
  },
  
  {
    methodName: 'absolutize',
    namespace: Position,
    message: 'Position.absolutize has been deprecated, please use Element#absolutize instead.'
  },
  
  {
    methodName: 'relativize',
    namespace: Position,
    message: 'Position.relativize has been deprecated, please use Element#relativize instead.'
  },
  
  {
    methodName: 'realOffset',
    namespace: Position,
    message: 'Position.realOffset has been deprecated, please use Element#cumulativeScrollOffset instead.'
  },
  
  {
    methodName: 'offsetParent',
    namespace: Position,
    message: 'Position.offsetParent has been deprecated, please use Element#getOffsetParent instead.'
  },
  
  {
    methodName: 'page',
    namespace: Position,
    message: 'Position.page has been deprecated, please use Element#viewportOffset instead.'
  },
  
  {
    methodName: 'clone',
    namespace: Position,
    message: 'Position.clone has been deprecated, please use Element#clonePosition instead.'
  },
  
  {
    methodName: 'initialize',
    namespace: Element.ClassNames.prototype,
    message: 'Element.ClassNames has been deprecated.'
  },
  
  {
    methodName: 'classNames',
    namespace: Element.Methods,
    message: 'Element#classNames has been deprecated.\n' +
      'If you need to access CSS class names as an array, try: $w(element.classname).'
  },
  
  {
    methodName: 'setStyle',
    namespace: Element.Methods,
    message: 'Use of uncamelized style-property names is no longer supported.\n' + 
      'Use either camelized style-property names or a regular CSS string instead (see online documentation).',
    type: 'removal',
    condition: function(element, style) {
      return !Object.isString(style) && Object.keys(style).join('').include('-');
    }
  },
  
  {
    methodName: 'getElementsByClassName',
    namespace: document,
    message: 'document.getElementsByClassName has been deprecated, please use $$ instead.'
  },
  
  {
    methodName: 'getElementsByClassName',
    namespace: Element.Methods,
    message: 'Element#getElementsByClassName has been deprecated, please use Element#select instead.'
  },
  
  {
    methodName: 'immediateDescendants',
    namespace: Element.Methods,
    message: 'Element#immediateDescendants has been deprecated, please use Element#childElements instead.'
  },
  
  {
    methodName: 'getElementsBySelector',
    namespace: Element.Methods,
    message: 'Element#getElementsBySelector has been deprecated, please use Element#select instead.'
  },
  
  {
    methodName: 'toQueryString',
    namespace: Hash,
    message: 'Hash.toQueryString has been deprecated.\n' + 
      'Use the instance method Hash#toQueryString or Object.toQueryString instead.'
  },
  
  {
    methodName: 'remove',
    namespace: Hash.prototype,
    message: 'Hash#remove is no longer supported, use Hash#unset instead.\n' + 
      'Please note that Hash#unset only accepts one argument.',
    type: 'removal'
  },
  
  {
    methodName: 'merge',
    namespace: Hash.prototype,
    message: 'Hash#merge is no longer destructive: it operates on a clone of the Hash instance.\n' + 
      'If you need a destructive merge, use Hash#update instead.',
    type: 'modification'
  },
  
  {
    methodName: 'unloadCache',
    namespace: Event,
    message: 'Event.unloadCache has been deprecated.'
  }
]);

// Special casing for Hash.

(function() {
  if (!Prototype.Browser.Gecko) return;
  
  var __properties = Object.keys(Hash.prototype).concat(['_object', '__properties']);
  
  var messages = {
    setting: new Template("Directly setting a property on an instance of Hash is no longer supported.\n" + 
    "Please use Hash#set('#{property}', #{value}) instead."),
    getting: new Template("Directly accessing a property of an instance of Hash is no longer supported.\n" + 
      "Please use Hash#get('#{property}') instead.")
  };
  
  function notify(property, value) {
    var message = messages[arguments.length == 1 ? 'getting' : 'setting'].evaluate({
      property: property,
      value: Object.inspect(value)
    });
    DeprecationNotifier.notify(message, 'removal');
  }
  
  function defineSetters(obj, prop) {
    if (obj.__properties.include(prop)) return;
    obj.__properties.push(prop);
    obj.__defineGetter__(prop, function() {
      checkProperties(this);
      notify(prop);
    });
    obj.__defineSetter__(prop, function(value) {
      checkProperties(this);
      notify(prop, value);
    });
  }
  
  function checkProperties(hash) {
    var current = Object.keys(hash);
    if (current.length == hash.__properties.length)
      return;
    current.each(function(prop) {
      if (hash.__properties.include(prop)) return;
      notify(prop, hash[prop]);
      defineSetters(hash, prop);
    });
  }
  
  Hash.prototype.set = Hash.prototype.set.wrap(function(proceed, property, value) {
    defineSetters(this, property);
    return proceed(property, value);
  });

  $w('merge update').each(function(name) {
    Hash.prototype[name] = Hash.prototype[name].wrap(function(proceed, object) {
      for (var prop in object) defineSetters(this, prop);
      return proceed(object);
    });
  });

  $H(Hash.prototype).each(function(method) {
    var key = method.key;
    if (!Object.isFunction(method.value) || key == 'initialize') return;
    Hash.prototype[key] = Hash.prototype[key].wrap(function(proceed) {
      checkProperties(this);
      return proceed.apply(proceed, $A(arguments).splice(1));
    });
  });

  Hash.prototype.initialize = Hash.prototype.initialize.wrap(function(proceed, object) {
    this.__properties = __properties.clone();
    for (var prop in object) defineSetters(this, prop);
    proceed(object);
  });
})();
  