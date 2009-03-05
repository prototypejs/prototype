/** section: Language, alias of: Array.from
 *    $A(iterable) -> Array
 * 
 *  Accepts an array-like collection (anything with numeric indices) and returns 
 *  its equivalent as an actual Array object. 
 *  This method is a convenience alias of [[Array.from]], but is the preferred way
 *  of casting to an Array.
 **/
function $A(iterable) {
  if (!iterable) return [];
  if (iterable.toArray) return iterable.toArray();
  var length = iterable.length || 0, results = new Array(length);
  while (length--) results[length] = iterable[length];
  return results;
}

if (Prototype.Browser.WebKit) {
  $A = function(iterable) {
    if (!iterable) return [];    
    // In Safari, only use the `toArray` method if it's not a NodeList.
    // A NodeList is a function, has an function `item` property, and a numeric
    // `length` property. Adapted from Google Doctype.
    if (!(typeof iterable === 'function' && typeof iterable.length ===
        'number' && typeof iterable.item === 'function') && iterable.toArray)
      return iterable.toArray();
    var length = iterable.length || 0, results = new Array(length);
    while (length--) results[length] = iterable[length];
    return results;
  };
}

/** section: Language
 *  $w(string) -> Array
 *  - string (String): A string with zero or more spaces.
 *
 *  Splits a string into an array, treating all whitespace as delimiters.
 *
 *  Equivalent to Ruby's `%w{foo bar}` or Perl's `qw(foo bar)`.
**/
function $w(string) {
  if (!Object.isString(string)) return [];
  string = string.strip();
  return string ? string.split(/\s+/) : [];
}

Array.from = $A;

/** section: Language
 * class Array
**/
(function() {
  var arrayProto = Array.prototype,
      slice = arrayProto.slice,
      _each = arrayProto.forEach; // use native browser JS 1.6 implementation if available
  
  function each(iterator) {
    for (var i = 0, length = this.length; i < length; i++)
      iterator(this[i]);
  }
  if (!_each) _each = each;
  
  /**
   *  Array#clear() -> Array
   *  Empties an array.
  **/
  function clear() {
    this.length = 0;
    return this;
  }

  /**
   *  Array#first() -> ?
   *  Returns the array's first item.
  **/
  function first() {
    return this[0];
  }

  /**
   *  Array#last() -> ?
   *  Returns the array's last item.
  **/
  function last() {
    return this[this.length - 1];
  }

  /**
   *  Array#compact() -> Array
   *  Trims the array of `null`, `undefined`, or other "falsy" values.
  **/
  function compact() {
    return this.select(function(value) {
      return value != null;
    });
  }

  /**
   *  Array#flatten() -> Array
   *  Returns a “flat” (one-dimensional) version of the array.
   *
   *  Nested arrays are recursively injected “inline”. This can prove very
   *  useful when handling the results of a recursive collection algorithm,
   *  for instance.
  **/
  function flatten() {
    return this.inject([], function(array, value) {
      if (Object.isArray(value))
        return array.concat(value.flatten());
      array.push(value);
      return array;
    });
  }

  /**
   *  Array#without(value...) -> Array
   *  - value (?): A value to exclude.
   *
   *  Produces a new version of the array that does not contain any of the
   *  specified values.
  **/
  function without() {
    var values = slice.call(arguments, 0);
    return this.select(function(value) {
      return !values.include(value);
    });
  }

  /**
   *  Array#reverse([inline = false]) -> Array
   *  - inline (Boolean): Whether to modify the array in place. If `false`,
   *      clones the original array first.
   *
   *  Returns the reversed version of the array.
  **/
  function reverse(inline) {
    return (inline !== false ? this : this.toArray())._reverse();
  }

  /**
   * Array#reduce() -> Array
   *  Reduces arrays: one-element arrays are turned into their unique item,
   *  while multiple-element arrays are returned untouched.
  **/
  function reduce() {
    return this.length > 1 ? this : this[0];
  }

  /**
   *  Array#uniq([sorted = false]) -> Array
   *  - sorted (Boolean): Whether the array has already been sorted. If `true`,
   *      a less-costly algorithm will be used.
   *
   *  Produces a duplicate-free version of an array. If no duplicates are
   *  found, the original array is returned.
  **/
  function uniq(sorted) {
    return this.inject([], function(array, value, index) {
      if (0 == index || (sorted ? array.last() != value : !array.include(value)))
        array.push(value);
      return array;
    });
  }

  /**
   *  Array#intersect(array) -> Array
   *  - array (Array): A collection of values.
   *
   *  Returns an array containing every item that is shared between the two
   *  given arrays.
  **/
  function intersect(array) { 
    return this.uniq().findAll(function(item) { 
      return array.detect(function(value) { return item === value });
    }); 
  }

  /** alias of: Array#toArray
   *  Array#clone() -> Array
   *
   *  Returns a duplicate of the array, leaving the original array intact.
  **/
  function clone() {
    return slice.call(this, 0);
  }

  /** related to: Enumerable#size
   *  Array#size() -> Number
   *  Returns the size of the array.
   *
   *  This is just a local optimization of the mixed-in [[Enumerable#size]]
   *  which avoids array cloning and uses the array’s native length property.
  **/
  function size() {
    return this.length;
  }

  /** related to: Object.inspect
   *  Array#inspect() -> String
   *
   *  Returns the debug-oriented string representation of an array.
  **/
  function inspect() {
    return '[' + this.map(Object.inspect).join(', ') + ']';
  }

  /** related to: Object.toJSON
   *  Array#toJSON() -> String
   *
   *  Returns a JSON string representation of the array.
  **/
  function toJSON() {
    var results = [];
    this.each(function(object) {
      var value = Object.toJSON(object);
      if (!Object.isUndefined(value)) results.push(value);
    });
    return '[' + results.join(', ') + ']';
  }
  
  /**
   *  Array#indexOf(item[, offset = 0]) -> Number
   *  - item (?): A value that may or may not be in the array.
   *  - offset (Number): The number of initial items to skip before beginning the
   *      search.
   *
   *  Returns the position of the first occurrence of `item` within the array — or
   *  `-1` if `item` doesn’t exist in the array.
  **/
  function indexOf(item, i) {
    i || (i = 0);
    var length = this.length;
    if (i < 0) i = length + i;
    for (; i < length; i++)
      if (this[i] === item) return i;
    return -1;
  }
  
  /** related to: Array#indexOf
   *  Array#lastIndexOf(item[, offset]) -> Number
   *  - item (?): A value that may or may not be in the array.
   *  - offset (Number): The number of items at the end to skip before beginning
   *      the search.
   *
   *  Returns the position of the last occurrence of `item` within the array — or
   *  `-1` if `item` doesn’t exist in the array.
  **/
  function lastIndexOf(item, i) {
    i = isNaN(i) ? this.length : (i < 0 ? this.length + i : i) + 1;
    var n = this.slice(0, i).reverse().indexOf(item);
    return (n < 0) ? n : i - n - 1;
  }
  
  // Replaces a built-in function. No PDoc needed.
  function concat() {
    var array = slice.call(this, 0), item;
    for (var i = 0, length = arguments.length; i < length; i++) {
      item = arguments[i];
      if (Object.isArray(item) && !('callee' in item)) {
        for (var j = 0, arrayLength = item.length; j < arrayLength; j++)
          array.push(item[j]);
      } else { 
        array.push(item);
      }
    }
    return array;
  }
  
  Object.extend(arrayProto, Enumerable);
  
  if (!arrayProto._reverse)
    arrayProto._reverse = arrayProto.reverse;
  
  Object.extend(arrayProto, {
    _each:     _each,
    clear:     clear,
    first:     first,
    last:      last,
    compact:   compact,
    flatten:   flatten,
    without:   without,
    reverse:   reverse,
    reduce:    reduce,
    uniq:      uniq,
    intersect: intersect,
    clone:     clone,
    toArray:   clone,
    size:      size,
    inspect:   inspect,
    toJSON:    toJSON
  });
  
  // fix for opera
  var CONCAT_ARGUMENTS_BUGGY = (function() {
    return [].concat(arguments)[0][0] !== 1;
  })(1,2)
  
  if (CONCAT_ARGUMENTS_BUGGY) arrayProto.concat = concat;
  
  // use native browser JS 1.6 implementation if available
  if (!arrayProto.indexOf) arrayProto.indexOf = indexOf;
  if (!arrayProto.lastIndexOf) arrayProto.lastIndexOf = lastIndexOf;
})();
