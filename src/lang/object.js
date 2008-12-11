Object.extend = function(destination, source) {
  for (var property in source)
    destination[property] = source[property];
  return destination;
};

Object.extend(Object, {
  inspect: function(object) {
    try {
      if (Object.isUndefined(object)) return 'undefined';
      if (object === null) return 'null';
      return object.inspect ? object.inspect() : String(object);
    } catch (e) {
      if (e instanceof RangeError) return '...';
      throw e;
    }
  },
  
  toJSON: function(object) {
    var type = typeof object;
    switch (type) {
      case 'undefined':
      case 'function':
      case 'unknown': return;
      case 'boolean': return object.toString();
    }
    
    if (object === null) return 'null';
    if (object.toJSON) return object.toJSON();
    if (Object.isElement(object)) return;
    
    var results = [];
    for (var property in object) {
      var value = Object.toJSON(object[property]);
      if (!Object.isUndefined(value))
        results.push(property.toJSON() + ': ' + value);
    }
    
    return '{' + results.join(', ') + '}';
  },
  
  toQueryString: function(object) {
    return $H(object).toQueryString();
  },
  
  toHTML: function(object) {
    return object && object.toHTML ? object.toHTML() : String.interpret(object);
  },
  
  keys: function(object) {
    var keys = [];
    for (var property in object)
      keys.push(property);
    return keys;
  },
  
  values: function(object) {
    var values = [];
    for (var property in object)
      values.push(object[property]);
    return values;
  },
  
  clone: function(object) {
    return Object.extend({ }, object);
  },
  
  isElement: function(object) {
    return !!(object && object.nodeType == 1);
  },
  
  isArray: function(object) {
    return object != null && typeof object == "object" &&
      'splice' in object && 'join' in object;
  },
  
  isHash: function(object) {
    return object instanceof Hash;
  },
  
  isFunction: function(object) {
    return typeof object == "function";
  },
  
  isString: function(object) {
    return typeof object == "string";
  },
  
  isNumber: function(object) {
    return typeof object == "number";
  },
  
  isUndefined: function(object) {
    return typeof object == "undefined";
  }
});
