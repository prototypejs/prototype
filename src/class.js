/* Based on Alex Arnell's inheritance implementation. */
var Class = {
  create: function() {
    var parent = null, properties = $A(arguments);
    if (Object.isFunction(properties[0]))
      parent = properties.shift();
    
    function klass() {
      this.initialize.apply(this, arguments);
    }
    
    Object.extend(klass, Class.Methods);
    klass.superclass = parent;
    klass.subclasses = [];
    
    if (parent) {
      var subclass = function() { };
      subclass.prototype = parent.prototype;
      klass.prototype = new subclass;
      parent.subclasses.push(klass);
    }
    
    for (var i = 0; i < properties.length; i++)
      klass.addMethods(properties[i]);
      
    if (!klass.prototype.initialize)
      klass.prototype.initialize = Prototype.emptyFunction;
    
    klass.prototype.constructor = klass;
    
    return klass;
  }
};

Class.Methods = {
  addMethods: function(source) {
    var ancestor   = this.superclass && this.superclass.prototype;
    var properties = Object.keys(source);
    
    if (!Object.keys({ toString: true }).length)
      properties.push("toString", "valueOf");
    
    for (var i = 0, length = properties.length; i < length; i++) {
      var property = properties[i], value = source[property];
      if (ancestor && Object.isFunction(value) &&
          value.argumentNames().first() == "$super") {
        var method = value;
        value = (function(m) {
          return function() { return ancestor[m].apply(this, arguments) };
        })(property).wrap(method);

        value.valueOf = method.valueOf.bind(method);
        value.toString = method.toString.bind(method);
      }
      this.prototype[property] = value;
    }
    
    return this;
  }
};
