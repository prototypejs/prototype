// json polyfill
if (!Prototype.BrowserFeatures.JSON) {
  var JSON = (function(GLOBAL) {
    
    var _toString = GLOBAL.Object.prototype.toString;
    
    var NULL_TYPE       = 'Null',
        UNDEFINED_TYPE  = 'Undefined',
        BOOLEAN_TYPE    = 'Boolean',
        NUMBER_TYPE     = 'Number',
        STRING_TYPE     = 'String',
        OBJECT_TYPE     = 'Object',
        FUNCTION_CLASS  = '[object Function]',
        BOOLEAN_CLASS   = '[object Boolean]',
        NUMBER_CLASS    = '[object Number]',
        STRING_CLASS    = '[object String]',
        ARRAY_CLASS     = '[object Array]',
        DATE_CLASS      = '[object Date]';
    
    // internal
    function _type(o) {
      switch(o) {
        case null: return NULL_TYPE;
        case (void 0): return UNDEFINED_TYPE;
      }
       
      switch(typeof o) {
        case 'boolean': return BOOLEAN_TYPE;
        case 'number': return NUMBER_TYPE;
        case 'string': return STRING_TYPE;
      }
      
      return OBJECT_TYPE;
    }
    
    // internal
    function _string(key, holder, stack) {
      var value = holder[key];

      if (_type(value) === OBJECT_TYPE && typeof value.toJSON === 'function')
        value = value.toJSON(key);

      var _class = _toString.call(value);

      switch (_class) {
        case NUMBER_CLASS:
        case BOOLEAN_CLASS:
        case STRING_CLASS:
          value = value.valueOf();
      }

      switch (value) {
        case null: 
        case (void 0): return 'null';
        case true: return 'true';
        case false: return 'false';
      }

      switch (typeof value) {
        case 'string':
          return value.inspect(true);
          
        case 'number':
          return isFinite(value) ? String(value) : 'null';
      }
      
      for (var i = 0, length = stack.length; i < length; ++i)
        if (stack[i] === value) throw new TypeError();
      
      stack.push(value);

      var partial = [];
      if (_class === ARRAY_CLASS) {
        for (var i = 0, length = value.length; i < length; ++i) {
          var str = _string(i, value, stack);
          partial.push(typeof str === 'undefined' ? 'null' : str);
        }
        
        partial = '[' + partial.join(',') + ']';
      } else {
        var keys = Object.keys(value);
        
        for (var i = 0, length = keys.length; i < length; i++) {
          var key = keys[i], str = _string(key, value, stack);
          if (typeof str !== "undefined")
            partial.push(key.inspect(true)+ ':' + str);
        }
        
        partial = '{' + partial.join(',') + '}';
      }
      
      stack.pop();
      
      return partial;
    }
    
    // ---------------------------------------------
    
    function parse(json) {
      var cx = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g;
    
      if (cx.test(json))
        json = json.replace(cx, function (a) { return '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4); });
      
      if (json.isJSON()) {
        try {
          return eval("(" + json + ")");
        } catch(e) {
          // noop
        }
      }
      
      throw new SyntaxError('Badly formed JSON string: ' + json.inspect());
    }
    
    function stringify(object) {
      return _string('', { '': object }, []);
    }
    
    return {
      parse:      parse,
      stringify:  stringify
    };
    
  })(this);
}