Object.extend(Function.prototype, (function() {
  var slice = Array.prototype.slice;
  
  function toArray(args) {
    return slice.call(args, 0);
  }
  
  function combine(array, args) {
    var arrayLength = array.length, length = args.length;
    while (length--) array[arrayLength + length] = args[length];
    return array;
  }
  
  function argumentNames() {
    var names = this.toString().match(/^[\s\(]*function[^(]*\(([^\)]*)\)/)[1]
      .replace(/\s+/g, '').split(',');
    return names.length == 1 && !names[0] ? [] : names;
  }

  function bind() {
    if (arguments.length < 2 && Object.isUndefined(arguments[0])) return this;
    var __method = this, args = toArray(arguments), object = args.shift();
    return function() {
      var combinedArgs = combine(args.clone(), arguments);
      return __method.apply(object, combinedArgs);
    }
  }

  function bindAsEventListener() {
    var __method = this, args = toArray(arguments), object = args.shift();
    return function(event) {
      var combinedArgs = combine([event || window.event], args);
      return __method.apply(object, combinedArgs);
    }
  }

  function curry() {
    if (!arguments.length) return this;
    var __method = this, args = toArray(arguments);
    return function() {
      var combinedArgs = combine(args.clone(), arguments);
      return __method.apply(this, combinedArgs);
    }
  }

  function delay() { 
    var __method = this, args = toArray(arguments), timeout = args.shift() * 1000; 
    return window.setTimeout(function() {
      return __method.apply(__method, args);
    }, timeout);
  }

  function defer() {
    var args = combine([0.01], arguments);
    return this.delay.apply(this, args);
  }

  function wrap(wrapper) {
    var __method = this;
    return function() {
      var combinedArgs = combine([__method.bind(this)], arguments);
      return wrapper.apply(this, combinedArgs);
    }
  }

  function methodize() {
    if (this._methodized) return this._methodized;
    var __method = this;
    return this._methodized = function() {
      var combinedArgs = combine([this], arguments);
      return __method.apply(null, combinedArgs);
    };
  }
  
  return {
    argumentNames:       argumentNames,
    bind:                bind,
    bindAsEventListener: bindAsEventListener,
    curry:               curry,
    delay:               delay,
    defer:               defer,
    wrap:                wrap,
    methodize:           methodize
  }
})());

