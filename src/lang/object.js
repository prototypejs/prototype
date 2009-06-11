/** section: Language
 * class Object
 *
 *  Extensions to the built-in `Object` object.
 *
 *  Because it is dangerous and invasive to augment `Object.prototype` (i.e.,
 *  add instance methods to objects), all these methods are static methods that
 *  take an `Object` as their first parameter.
 *
**/
(function() {

  function getClass(object) {
    return Object.prototype.toString.call(object)
     .match(/^\[object\s(.*)\]$/)[1];
  }

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
   *  For other types, `Object.toJSON` looks for a `toJSON` method on `object`.
   *  If there is one, it is used; otherwise the object is treated like a
   *  generic `Object`.
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
   *  object (Object): The object whose property/value pairs will be converted.
   *
   *  Turns an object into its URL-encoded query string representation.
   *
   *  This is a form of serialization, and is mostly useful to provide complex
   *  parameter sets for stuff such as objects in the Ajax namespace (e.g.
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
   *  relies on the `for&#8230;in` loop, for which the ECMAScript spec does not
   *  prescribe an enumeration order. Sort the resulting array if you wish to
   *  normalize the order of the object keys.
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
   *  Returns an array of the object's values.
   *
   *  Note that the order of the resulting array is browser-dependent &mdash; it
   *  relies on the `for&#8230;in` loop, for which the ECMAScript spec does not
   *  prescribe an enumeration order.
   *
   *  Also, remember that while property _names_ are unique, property _values_
   *  have no such constraint.
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
   *  Duplicates the passed object.
   *
   *  Copies all the original's key/value pairs onto an empty object.
   *
   *  Do note that this is a _shallow_ copy, not a _deep_ copy. Nested objects
   *  will retain their references.
  **/
  function clone(object) {
    return extend({ }, object);
  }

  /**
   *  Object.isElement(object) -> Boolean
   *  - object (Object): The object to test.
   *
   *  Returns `true` if `object` is a DOM node of type 1; `false` otherwise.
  **/
  function isElement(object) {
    return !!(object && object.nodeType == 1);
  }

  /**
   *  Object.isArray(object) -> Boolean
   *  - object (Object): The object to test.
   *
   *  Returns `true` if `object` is an array; false otherwise.
  **/
  function isArray(object) {
    return getClass(object) === "Array";
  }


  /**
   *  Object.isHash(object) -> Boolean
   *  - object (Object): The object to test.
   *
   *  Returns `true` if `object` is an instance of the [[Hash]] class; `false`
   *  otherwise.
  **/
  function isHash(object) {
    return object instanceof Hash;
  }

  /**
   *  Object.isFunction(object) -> Boolean
   *  - object (Object): The object to test.
   *
   *  Returns `true` if `object` is of type `function`; `false` otherwise.
  **/
  function isFunction(object) {
    return typeof object === "function";
  }

  /**
   *  Object.isString(object) -> Boolean
   *  - object (Object): The object to test.
   *
   *  Returns `true` if `object` is of type `string`; `false` otherwise.
  **/
  function isString(object) {
    return getClass(object) === "String";
  }

  /**
   *  Object.isNumber(object) -> Boolean
   *  - object (Object): The object to test.
   *
   *  Returns `true` if `object` is of type `number`; `false` otherwise.
  **/
  function isNumber(object) {
    return getClass(object) === "Number";
  }

  /**
   *  Object.isUndefined(object) -> Boolean
   *  - object (Object): The object to test.
   *
   *  Returns `true` if `object` is of type `string`; `false` otherwise.
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
