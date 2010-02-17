/** section: Language
 * class Object
 *
 *  Extensions to the built-in [[Object]] object.
 *
 *  Because it is dangerous and invasive to augment `Object.prototype` (i.e.,
 *  add instance methods to objects), all these methods are static methods that
 *  take an [[Object]] as their first parameter.
 *
 *  [[Object]] is used by Prototype as a namespace; that is, it just keeps a few 
 *  new methods together, which are intended for namespaced access (i.e. starting
 *  with "`Object.`").
 *  
 *  For the regular developer (who simply uses Prototype without tweaking it), the
 *  most commonly used methods are probably [[Object.inspect]] and, to a lesser degree, 
 *  [[Object.clone]].
 *  
 *  Advanced users, who wish to create their own objects like Prototype does, or
 *  explore objects as if they were hashes, will turn to [[Object.extend]], 
 *  [[Object.keys]], and [[Object.values]].
**/
(function() {

  var _toString = Object.prototype.toString;

  /**
   *  Object.extend(destination, source) -> Object
   *  - destination (Object): The object to receive the new properties.
   *  - source (Object): The object whose properties will be duplicated.
   *
   *  Copies all properties from the source to the destination object. Returns
   *  the destination object.
  **/
  function extend(destination, source) {
    for (var property in source)
      destination[property] = source[property];
    return destination;
  }

  /**
   *  Object.inspect(object) -> String
   *  - object (Object): The item to be inspected.
   *
   *  Returns the debug-oriented string representation of the object.
   *
   *  `undefined` and `null` are represented as such.
   *
   *  Other types are checked for a `inspect` method. If there is one, it is
   *  used; otherwise, it reverts to the `toString` method.
   *
   *  Prototype provides `inspect` methods for many types, both built-in and
   *  library-defined &mdash; among them `String`, `Array`, `Enumerable` and `Hash`.
   *  These attempt to provide useful string representations (from a
   *  developer's standpoint) for their respective types.
  **/
  function inspect(object) {
    try {
      if (isUndefined(object)) return 'undefined';
      if (object === null) return 'null';
      return object.inspect ? object.inspect() : String(object);
    } catch (e) {
      if (e instanceof RangeError) return '...';
      throw e;
    }
  }

  /**
   *  Object.toJSON(object) -> String
   *  - object (Object): The object to be serialized.
   *
   *  Returns a JSON string.
   *
   *  `undefined` and `function` types have no JSON representation. `boolean`
   *  and `null` are coerced to strings.
   *
   *  For other types, [[Object.toJSON]] looks for a `toJSON` method on `object`.
   *  If there is one, it is used; otherwise the object is treated like a
   *  generic [[Object]].
   *  
   *  For more information on Prototype's JSON encoder, hop to our
   *  [tutorial](http://prototypejs.org/learn/json).
   *  
   *  ##### Example
   *  
   *      var data = {name: 'Violet', occupation: 'character', age: 25, pets: ['frog', 'rabbit']};
   *      Object.toJSON(data);
   *      //-> '{"name": "Violet", "occupation": "character", "age": 25, "pets": ["frog","rabbit"]}'
  **/
  function toJSON(object) {
    var type = typeof object;
    switch (type) {
      case 'undefined':
      case 'function':
      case 'unknown': return;
      case 'boolean': return object.toString();
    }

    if (object === null) return 'null';
    if (object.toJSON) return object.toJSON();
    if (isElement(object)) return;

    var results = [];
    for (var property in object) {
      var value = toJSON(object[property]);
      if (!isUndefined(value))
        results.push(property.toJSON() + ': ' + value);
    }

    return '{' + results.join(', ') + '}';
  }

  /**
   *  Object.toQueryString(object) -> String
   *  - object (Object): The object whose property/value pairs will be converted.
   *
   *  Turns an object into its URL-encoded query string representation.
   *
   *  This is a form of serialization, and is mostly useful to provide complex
   *  parameter sets for stuff such as objects in the [[Ajax]] namespace (e.g.
   *  [[Ajax.Request]]).
   *
   *  Undefined-value pairs will be serialized as if empty-valued. Array-valued
   *  pairs will get serialized with one name/value pair per array element. All
   *  values get URI-encoded using JavaScript's native `encodeURIComponent`
   *  function.
   *
   *  The order of pairs in the serialized form is not guaranteed (and mostly
   *  irrelevant anyway) &mdash; except for array-based parts, which are serialized
   *  in array order.
   *  
   *  ##### Examples
   *  
   *      Object.toQueryString({ action: 'ship', order_id: 123, fees: ['f1', 'f2'], 'label': 'a demo' })
   *      // -> 'action=ship&order_id=123&fees=f1&fees=f2&label=a%20demo'
  **/
  function toQueryString(object) {
    return $H(object).toQueryString();
  }

  /**
   *  Object.toHTML(object) -> String
   *  - object (Object): The object to convert to HTML.
   *
   *  Converts the object to its HTML representation.
   *
   *  Returns the return value of `object`'s `toHTML` method if it exists; else
   *  runs `object` through [[String.interpret]].
   *  
   *  ##### Examples
   *  
   *      var Bookmark = Class.create({
   *        initialize: function(name, url) {
   *          this.name = name;
   *          this.url = url;
   *        },
   *        
   *        toHTML: function() {
   *          return '<a href="#{url}">#{name}</a>'.interpolate(this);
   *        }
   *      });
   *      
   *      var api = new Bookmark('Prototype API', 'http://prototypejs.org/api');
   *      
   *      Object.toHTML(api);
   *      //-> '<a href="http://prototypejs.org/api">Prototype API</a>'
   *      
   *      Object.toHTML("Hello world!");
   *      //-> "Hello world!"
   *      
   *      Object.toHTML();
   *      //-> ""
   *      
   *      Object.toHTML(null);
   *      //-> ""
   *      
   *      Object.toHTML(undefined);
   *      //-> ""
   *      
   *      Object.toHTML(true);
   *      //-> "true"
   *      
   *      Object.toHTML(false);
   *      //-> "false"
   *      
   *      Object.toHTML(123);
   *      //-> "123"
  **/
  function toHTML(object) {
    return object && object.toHTML ? object.toHTML() : String.interpret(object);
  }

  /**
   *  Object.keys(object) -> Array
   *  - object (Object): The object to pull keys from.
   *
   *  Returns an array of the object's property names.
   *
   *  Note that the order of the resulting array is browser-dependent &mdash; it
   *  relies on the `for...in` loop, for which the ECMAScript spec does not
   *  prescribe an enumeration order. Sort the resulting array if you wish to
   *  normalize the order of the object keys.
   *
   *  ##### Examples
   *  
   *      Object.keys();
   *      // -> []
   *      
   *      Object.keys({ name: 'Prototype', version: '1.6.1' }).sort();
   *      // -> ['name', 'version']
  **/
  function keys(object) {
    var results = [];
    for (var property in object)
      results.push(property);
    return results;
  }

  /**
   *  Object.values(object) -> Array
   *  - object (Object): The object to pull values from.
   *
   *  Returns an array of the object's property values.
   *
   *  Note that the order of the resulting array is browser-dependent &mdash; it
   *  relies on the `for...in` loop, for which the ECMAScript spec does not
   *  prescribe an enumeration order.
   *
   *  Also, remember that while property _names_ are unique, property _values_
   *  have no such constraint.
   *
   *  ##### Examples
   *  
   *      Object.values();
   *      // -> []
   *      
   *      Object.values({ name: 'Prototype', version: '1.6.1' }).sort();
   *      // -> ['1.6.1', 'Prototype']
  **/
  function values(object) {
    var results = [];
    for (var property in object)
      results.push(object[property]);
    return results;
  }

  /**
   *  Object.clone(object) -> Object
   *  - object (Object): The object to clone.
   *
   *  Creates and returns a shallow duplicate of the passed object by copying
   *  all of the original's key/value pairs onto an empty object.
   *
   *  Do note that this is a _shallow_ copy, not a _deep_ copy. Nested objects
   *  will retain their references.
   *
   *  <h5>Examples</h5>
   *
   *      var original = {name: 'primaryColors', values: ['red', 'green', 'blue']};
   *      var copy = Object.clone(original);
   *      original.name;
   *      // -> "primaryColors"
   *      original.values[0];
   *      // -> "red"
   *      copy.name;
   *      // -> "primaryColors"
   *      copy.name = "secondaryColors";
   *      original.name;
   *      // -> "primaryColors"
   *      copy.name;
   *      // -> "secondaryColors"
   *      copy.values[0] = 'magenta';
   *      copy.values[1] = 'cyan';
   *      copy.values[2] = 'yellow';
   *      original.values[0];
   *      // -> "magenta" (it was a shallow copy, so they shared the array)
  **/
  function clone(object) {
    return extend({ }, object);
  }

  /**
   *  Object.isElement(object) -> Boolean
   *  - object (Object): The object to test.
   *
   *  Returns `true` if `object` is a DOM node of type 1; `false` otherwise.
   *  
   *  ##### Examples
   *  
   *      Object.isElement(new Element('div'));
   *      //-> true
   *      
   *      Object.isElement(document.createElement('div'));
   *      //-> true
   *      
   *      Object.isElement($('id_of_an_exiting_element'));
   *      //-> true
   *      
   *      Object.isElement(document.createTextNode('foo'));
   *      //-> false
  **/
  function isElement(object) {
    return !!(object && object.nodeType == 1);
  }

  /**
   *  Object.isArray(object) -> Boolean
   *  - object (Object): The object to test.
   *
   *  Returns `true` if `object` is an [[Array]]; `false` otherwise.
   *  
   *  ##### Examples
   *  
   *      Object.isArray([]);
   *      //-> true
   *      
   *      Object.isArray($w());
   *      //-> true
   *      
   *      Object.isArray({ });
   *      //-> false
  **/
  function isArray(object) {
    return _toString.call(object) == "[object Array]";
  }
  
  var hasNativeIsArray = (typeof Array.isArray == 'function') 
    && Array.isArray([]) && !Array.isArray({});
  
  if (hasNativeIsArray) {
    isArray = Array.isArray;
  }

  /**
   *  Object.isHash(object) -> Boolean
   *  - object (Object): The object to test.
   *
   *  Returns `true` if `object` is an instance of the [[Hash]] class; `false`
   *  otherwise.
   *  
   *  ##### Examples
   *  
   *      Object.isHash(new Hash({ }));
   *      //-> true
   *      
   *      Object.isHash($H({ }));
   *      //-> true
   *      
   *      Object.isHash({ });
   *      //-> false
  **/
  function isHash(object) {
    return object instanceof Hash;
  }

  /**
   *  Object.isFunction(object) -> Boolean
   *  - object (Object): The object to test.
   *
   *  Returns `true` if `object` is of type [[Function]]; `false` otherwise.
   *  
   *  ##### Examples
   *  
   *      Object.isFunction($);
   *      //-> true
   *      
   *      Object.isFunction(123);
   *      //-> false
  **/
  function isFunction(object) {
    return typeof object === "function";
  }

  /**
   *  Object.isString(object) -> Boolean
   *  - object (Object): The object to test.
   *
   *  Returns `true` if `object` is of type [[String]]; `false` otherwise.
   *  
   *  ##### Examples
   *  
   *      Object.isString("foo");
   *      //-> true
   *      
   *      Object.isString("");
   *      //-> true
   *      
   *      Object.isString(123);
   *      //-> false
  **/
  function isString(object) {
    return _toString.call(object) == "[object String]";
  }

  /**
   *  Object.isNumber(object) -> Boolean
   *  - object (Object): The object to test.
   *
   *  Returns `true` if `object` is of type [[Number]]; `false` otherwise.
   *  
   *  ##### Examples
   *  
   *      Object.isNumber(0);
   *      //-> true
   *      
   *      Object.isNumber(1.2);
   *      //-> true
   *      
   *      Object.isNumber("foo");
   *      //-> false
  **/
  function isNumber(object) {
    return _toString.call(object) == "[object Number]";
  }

  /**
   *  Object.isUndefined(object) -> Boolean
   *  - object (Object): The object to test.
   *
   *  Returns `true` if `object` is of type `undefined`; `false` otherwise.
   *  
   *  ##### Examples
   *  
   *      Object.isUndefined();
   *      //-> true
   *      
   *      Object.isUndefined(undefined);
   *      //-> true
   *      
   *      Object.isUndefined(null);
   *      //-> false
   *      
   *      Object.isUndefined(0);
   *      //-> false
   *      
   *      Object.isUndefined("");
   *      //-> false
  **/
  function isUndefined(object) {
    return typeof object === "undefined";
  }

  extend(Object, {
    extend:        extend,
    inspect:       inspect,
    toJSON:        toJSON,
    toQueryString: toQueryString,
    toHTML:        toHTML,
    keys:          keys,
    values:        values,
    clone:         clone,
    isElement:     isElement,
    isArray:       isArray,
    isHash:        isHash,
    isFunction:    isFunction,
    isString:      isString,
    isNumber:      isNumber,
    isUndefined:   isUndefined
  });
})();
