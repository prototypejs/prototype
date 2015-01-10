/* Based on Alex Arnell's inheritance implementation. */

/** section: Language
 * class Class
 *
 *  Manages Prototype's class-based OOP system.
 *
 *  Refer to Prototype's web site for a [tutorial on classes and
 *  inheritance](http://prototypejs.org/learn/class-inheritance).
**/
var Class = (function() {
  
  // Some versions of JScript fail to enumerate over properties, names of which 
  // correspond to non-enumerable properties in the prototype chain
  var IS_DONTENUM_BUGGY = (function(){
    for (var p in { toString: 1 }) {
      // check actual property name, so that it works with augmented Object.prototype
      if (p === 'toString') return false;
    }
    return true;
  })();
  
  // IE8 provides a version of `Object.defineProperty` but it only works on DOM
  // elements and when some other conditions are met, we therefore cannot use it
  // @see http://msdn.microsoft.com/en-us/library/dd229916%28VS.85%29.aspx
  var IS_DEFPROP_BUGGY = (function(){
    try {
      var x = {};
      Object.defineProperty(x, 'prop', {
        get: function()  {},
        set: function(y) {},
        configurable: false,
        enumerable:   true
      });
      
      return false;
    } catch(e) {
      return true;
    }
  })();
  
  /**
   *  Class.create([superclass][, methods...]) -> Class
   *    - superclass (Class): The optional superclass to inherit methods from.
   *    - methods (Object): An object whose properties will be "mixed-in" to the
   *        new class. Any number of mixins can be added; later mixins take
   *        precedence.
   *
   *  [[Class.create]] creates a class and returns a constructor function for
   *  instances of the class. Calling the constructor function (typically as
   *  part of a `new` statement) will invoke the class's `initialize` method.
   *
   *  [[Class.create]] accepts two kinds of arguments. If the first argument is
   *  a [[Class]], it's used as the new class's superclass, and all its methods
   *  are inherited. Otherwise, any arguments passed are treated as objects,
   *  and their methods are copied over ("mixed in") as instance methods of the
   *  new class. In cases of method name overlap, later arguments take
   *  precedence over earlier arguments.
   *
   *  If a subclass overrides an instance method declared in a superclass, the
   *  subclass's method can still access the original method. To do so, declare
   *  the subclass's method as normal, but insert `$super` as the first
   *  argument. This makes `$super` available as a method for use within the
   *  function.
   *
   *  To extend a class after it has been defined, use [[Class#addMethods]].
   *
   *  For details, see the
   *  [inheritance tutorial](http://prototypejs.org/learn/class-inheritance)
   *  on the Prototype website.
  **/
  function subclass() {};
  function create() {
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
      subclass.prototype = parent.prototype;
      klass.prototype = new subclass;
      parent.subclasses.push(klass);
    }

    for (var i = 0, length = properties.length; i < length; i++)
      klass.addMethods(properties[i]);

    if (!klass.prototype.initialize)
      klass.prototype.initialize = Prototype.emptyFunction;

    klass.prototype.constructor = klass;
    return klass;
  }

  /**
   *  Class#addMethods(methods) -> Class
   *    - methods (Object): The methods to add to the class.
   *
   *  Adds methods to an existing class.
   *
   *  [[Class#addMethods]] is a method available on classes that have been
   *  defined with [[Class.create]]. It can be used to add new instance methods
   *  to that class, or overwrite existing methods, after the class has been
   *  defined.
   *
   *  New methods propagate down the inheritance chain. If the class has
   *  subclasses, those subclasses will receive the new methods &mdash; even in
   *  the context of `$super` calls. The new methods also propagate to instances
   *  of the class and of all its subclasses, even those that have already been
   *  instantiated.
   *
   *  ##### Examples
   *
   *      var Animal = Class.create({
   *        initialize: function(name, sound) {
   *          this.name  = name;
   *          this.sound = sound;
   *        },
   *
   *        speak: function() {
   *          alert(this.name + " says: " + this.sound + "!");
   *        }
   *      });
   *
   *      // subclassing Animal
   *      var Snake = Class.create(Animal, {
   *        initialize: function($super, name) {
   *          $super(name, 'hissssssssss');
   *        }
   *      });
   *
   *      var ringneck = new Snake("Ringneck");
   *      ringneck.speak();
   *
   *      //-> alerts "Ringneck says: hissssssss!"
   *
   *      // adding Snake#speak (with a supercall)
   *      Snake.addMethods({
   *        speak: function($super) {
   *          $super();
   *          alert("You should probably run. He looks really mad.");
   *        }
   *      });
   *
   *      ringneck.speak();
   *      //-> alerts "Ringneck says: hissssssss!"
   *      //-> alerts "You should probably run. He looks really mad."
   *
   *      // redefining Animal#speak
   *      Animal.addMethods({
   *        speak: function() {
   *          alert(this.name + 'snarls: ' + this.sound + '!');
   *        }
   *      });
   *
   *      ringneck.speak();
   *      //-> alerts "Ringneck snarls: hissssssss!"
   *      //-> alerts "You should probably run. He looks really mad."
  **/
  function addMethods(source) {
    var ancestor   = this.superclass && this.superclass.prototype,
        properties = Object.keys(source);

    // IE6 doesn't enumerate `toString` and `valueOf` (among other built-in `Object.prototype`) properties,
    // Force copy if they're not Object.prototype ones.
    // Do not copy other Object.prototype.* for performance reasons
    if (IS_DONTENUM_BUGGY) {
      if (source.toString != Object.prototype.toString)
        properties.push("toString");
      if (source.valueOf != Object.prototype.valueOf)
        properties.push("valueOf");
    }
    
    function wrap_function(property, method)
    {
      if (method.argumentNames()[0] == "$super") {
        value = (function(m) {
          return function() { return ancestor[m].apply(this, arguments); };
        })(property).wrap(method);
        
        // We used to use `bind` to ensure that `toString` and `valueOf`
        // methods were called in the proper context, but now that we're 
        // relying on native bind and/or an existing polyfill, we can't rely
        // on the nuanced behavior of whatever `bind` implementation is on
        // the page.
        //
        // MDC's polyfill, for instance, doesn't like binding functions that
        // haven't got a `prototype` property defined.
        value.valueOf = (function(method) {
          return function() { return method.valueOf.call(method); };
        })(method);
        
        value.toString = (function(method) {
          return function() { return method.toString.call(method); };
        })(method);
        
        return value;
      } else {
        return method;
      }
    }
    
    // Checking for `Object.defineProperty` will work in IE8 but the provided implementation only works in some
    // very specfic configurations and only on DOM elements - its therefore not reliable enough to use in practice.
    if(Object.getOwnPropertyDescriptor && Object.defineProperty && !IS_DEFPROP_BUGGY) { // Dynamic property support
      for (var i = 0, length = properties.length; i < length; i++) {
        var property = properties[i], descriptor = Object.getOwnPropertyDescriptor(source, property);
        
        if (ancestor && Object.isFunction(descriptor.value)) {
          descriptor.value = wrap_function(property, descriptor.value);
        }
        if (ancestor && Object.isFunction(descriptor.get)) {
          descriptor.get = wrap_function(property, descriptor.get);
        }
        if (ancestor && Object.isFunction(descriptor.set)) {
          descriptor.set = wrap_function(property, descriptor.set);
        }
        Object.defineProperty(this.prototype, property, descriptor);
      }
    } else {
      for (var i = 0, length = properties.length; i < length; i++) {
        var property = properties[i], value = source[property];
        if (ancestor && Object.isFunction(value)) {
          value = wrap_function(property, value);
        }
        this.prototype[property] = value;
      }
    }

    return this;
  }

  return {
    create: create,
    Methods: {
      addMethods: addMethods
    }
  };
})();
