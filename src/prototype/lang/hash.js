/** section: Language, related to: Hash
 *  $H([obj]) -> Hash
 *  
 *  Creates a [[Hash]] (which is synonymous to "map" or "associative array"
 *  for our purposes). A convenience wrapper around the [[Hash]] constructor, with a safeguard
 *  that lets you pass an existing [[Hash]] object and get it back untouched (instead of
 *  uselessly cloning it).
 *  
 *  The [[$H]] function is the shorter way to obtain a hash (prior to 1.5 final, it was
 *  the *only* proper way of getting one).
 *  
 *  ##### Example
 *  
 *      var h = $H({name: 'John', age: 26, country: 'Australia'});
 *      // Equivalent to:
 *      var h = new Hash({name: 'John', age: 26, country: 'Australia'});
 *      // Can then be accessed the classic Hash way
 *      h.get('country');
 *      // -> 'Australia'
**/
function $H(object) {
  return new Hash(object);
};

/** section: Language
 * class Hash
 *  includes Enumerable
 *
 *  A set of key/value pairs.
 *
 *  [[Hash]] can be thought of as an associative array, binding unique keys to
 *  values (which are not necessarily unique), though it can not guarantee
 *  consistent order its elements when iterating. Because of the nature of
 *  JavaScript, every object is in fact a hash; but [[Hash]] adds a number of
 *  methods that let you enumerate keys and values, iterate over key/value
 *  pairs, merge two hashes together, and much more.
 *
 *  ##### Creating a hash
 *
 *  You can create a Hash either via `new Hash()` or the convenience alias
 *  `$H()`; there is **no** difference between them. In either case, you may
 *  optionally pass in an object to seed the [[Hash]]. If you pass in a [[Hash]],
 *  it will be cloned.
 *
**/
var Hash = Class.create(Enumerable, (function() {
  /**
   *  new Hash([object])
   *
   *  Creates a new [[Hash]]. If `object` is given, the new hash will be populated
   *  with all the object's properties. See [[$H]].
   **/
  function initialize(object) {
    this._object = Object.isHash(object) ? object.toObject() : Object.clone(object);
  }

  // Docs for #each even though technically it's implemented by Enumerable
  /**
   *  Hash#each(iterator[, context]) -> Hash
   *  - iterator (Function): A function that expects each item in the [[Hash]]
   *    as the first argument and a numerical index as the second.
   *  - context (Object): The scope in which to call `iterator`. Determines what
   *    `this` means inside `iterator`.
   *
   *  Iterates over the name/value pairs in the hash.
   *
   *  This is actually just the [[Enumerable#each #each]] method from the
   *  mixed-in [[Enumerable]] module. It is documented here to describe the
   *  structure of the elements passed to the iterator and the order of
   *  iteration.
   *
   *  The iterator's first argument (the "item") is an object with two
   *  properties:
   *
   *  - `key`: the key name as a `String`
   *  - `value`: the corresponding value (which may be `undefined`)
   *
   *  The order of iteration is implementation-dependent, as it relies on
   *  the order of the native `for..in` loop. Although most modern
   *  implementations exhibit *ordered* behavior, this is not standardized and
   *  may not always be the case, and so cannot be relied upon.
   *
   *  ##### Example
   *
   *      var h = $H({version: 1.6, author: 'The Core Team'});
   *
   *      h.each(function(pair) {
   *        alert(pair.key + ' = "' + pair.value + '"');
   *      });
   *      // Alerts 'version = "1.6"' and 'author = "The Core Team"'
   *      // -or-
   *      // Alerts 'author = "The Core Team"' and 'version = "1.6"'
  **/

  // Our _internal_ each
  function _each(iterator, context) {
    var i = 0;
    for (var key in this._object) {
      var value = this._object[key], pair = [key, value];
      pair.key = key;
      pair.value = value;
      iterator.call(context, pair, i);
      i++;
    }
  }

  /**
   *  Hash#set(key, value) -> value
   *  - key (String): The key to use for this value.
   *  - value (?): The value to use for this key.
   *
   *  Stores `value` in the hash using the key `key` and returns `value`.
   *
   *  ##### Example
   *
   *      var h = $H();
   *      h.keys();
   *      // -> [] (initially empty)
   *      h.set('a', 'apple');
   *      // -> "apple"
   *      h.keys();
   *      // -> ["a"] (has the new entry)
   *      h.get('a');
   *      // -> "apple"
  **/
  function set(key, value) {
    return this._object[key] = value;
  }

  /**
   *  Hash#get(key) -> value
   *
   *  Returns the stored value for the given `key`.
   *
   *  ##### Examples
   *
   *      var h = new Hash({a: 'apple', b: 'banana', c: 'coconut'});
   *      h.get('a');
   *      // -> 'apple'
  **/
  function get(key) {
    // simulating poorly supported hasOwnProperty
    if (this._object[key] !== Object.prototype[key])
      return this._object[key];
  }

  /**
   *  Hash#unset(key) -> value
   *
   *  Deletes the stored pair for the given `key` from the hash and returns its
   *  value.
   *
   *  ##### Example
   *
   *      var h = new Hash({a: 'apple', b: 'banana', c: 'coconut'});
   *      h.keys();
   *      // -> ["a", "b", "c"]
   *      h.unset('a');
   *      // -> 'apple'
   *      h.keys();
   *      // -> ["b", "c"] ("a" is no longer in the hash)
  **/
  function unset(key) {
    var value = this._object[key];
    delete this._object[key];
    return value;
  }

  /**
   *  Hash#toObject() -> Object
   *
   *  Returns a cloned, vanilla object whose properties (and property values)
   *  match the keys (and values) from the hash.
   *
   *  ##### Example
   *
   *      var h = new Hash({ a: 'apple', b: 'banana', c: 'coconut' });
   *      var obj = h.toObject();
   *      obj.a;
   *      // -> "apple"
  **/
  function toObject() {
    return Object.clone(this._object);
  }

  /** related to: Object.toJSON, alias of: Hash#toObject
   *  Hash#toJSON() -> Object
  **/
  
  /** alias of: Hash#toObject
   *  Hash#toTemplateReplacements() -> Object
  **/
  
  /**
   *  Hash#keys() -> [String...]
   *
   *  Provides an Array containing the keys for items stored in the hash.
   *
   *  The order of the keys is not guaranteed.
   *
   *  ##### Example
   *
   *      var h = $H({one: "uno", two: "due", three: "tre"});
   *      h.keys();
   *      // -> ["one", "three", "two"] (these may be in any order)
  **/
  function keys() {
    return this.pluck('key');
  }

  /**
   *  Hash#values() -> Array
   *
   *  Collects the values of the hash and returns them in an array.
   *
   *  The order of the values is not guaranteed.
   *
   *  ##### Example
   *
   *      var h = $H({one: "uno", two: "due", three: "tre"});
   *      h.values();
   *      // -> ["uno", "tre", "due"] (these may be in any order)
  **/
  function values() {
    return this.pluck('value');
  }

  /**
   *  Hash#index(value) -> String
   *
   *  Returns the first key in the hash whose value matches `value`.
   *  Returns `false` if there is no such key.
  **/
  function index(value) {
    var match = this.detect(function(pair) {
      return pair.value === value;
    });
    return match && match.key;
  }

  /**
   *  Hash#merge(object) -> Hash
   *  - object (Object | Hash): The object to merge with this hash to produce
   *    the resulting hash.
   *
   *  Returns a new [[Hash]] instance with `object`'s key/value pairs merged in;
   *  this hash remains unchanged.
   *
   *  To modify the original hash in place, use [[Hash#update]].
   *
   *  ##### Example
   *
   *      var h = $H({one: "uno", two: "due"});
   *      var h2 = h.merge({three: "tre"});
   *      h.keys();
   *      // -> ["one", "two"] (unchanged)
   *      h2.keys();
   *      // -> ["one", "two", "three"] (has merged contents)
  **/
  function merge(object) {
    return this.clone().update(object);
  }

  /**
   *  Hash#update(object) -> Hash
   *  - object (Object | Hash): The object to merge with this hash to produce
   *    the resulting hash.
   *
   *  Updates a hash *in place* with the key/value pairs of `object`, returns
   *  the hash.
   *
   *  [[Hash#update]] modifies the hash. To get a new hash instead, use
   *  [[Hash#merge]].
   *
   *  ##### Example
   *
   *      var h = $H({one: "uno", two: "due"});
   *      h.update({three: "tre"});
   *      // -> h (a reference to the original hash)
   *      h.keys();
   *      // -> ["one", "two", "three"] (has merged contents)
  **/
  function update(object) {
    return new Hash(object).inject(this, function(result, pair) {
      result.set(pair.key, pair.value);
      return result;
    });
  }

  // Private. No PDoc necessary.
  function toQueryPair(key, value) {
    if (Object.isUndefined(value)) return key;
    
    value = String.interpret(value);

    // Normalize newlines as \r\n because the HTML spec says newlines should
    // be encoded as CRLFs.
    value = value.gsub(/(\r)?\n/, '\r\n');
    value = encodeURIComponent(value);
    // Likewise, according to the spec, spaces should be '+' rather than
    // '%20'.
    value = value.gsub(/%20/, '+');
    return key + '=' + value;
  }

  /** related to: String#toQueryParams
   *  Hash#toQueryString() -> String
   *
   *  Returns a URL-encoded string containing the hash's contents as query
   *  parameters according to the following rules:
   *
   *  - An undefined value results a parameter with no value portion at all
   *    (simply the key name, no equal sign).
   *  - A null value results a parameter with a blank value (the key followed
   *    by an equal sign and nothing else).
   *  - A boolean value results a parameter with the value "true" or "false".
   *  - An Array value results in a parameter for each array element, in
   *    array order, each using the same key.
   *  - All keys and values are URI-encoded using JavaScript's native
   *    `encodeURIComponent` function.
   *
   *  The order of pairs in the string is not guaranteed, other than the order
   *  of array values described above.
   *
   *  ##### Example
   *
   *      $H({action: 'ship',
   *          order_id: 123,
   *          fees: ['f1', 'f2']
   *      }).toQueryString();
   *      // -> "action=ship&order_id=123&fees=f1&fees=f2"
   *
   *      $H({comment: '',
   *          'key with spaces': true,
   *          related_order: undefined,
   *          contents: null,
   *          'label': 'a demo'
   *      }).toQueryString();
   *      // -> "comment=&key%20with%20spaces=true&related_order&contents=&label=a%20demo"
   *
   *      // an empty hash is an empty query string:
   *      $H().toQueryString();
   *      // -> ""
  **/
  function toQueryString() {
    return this.inject([], function(results, pair) {
      var key = encodeURIComponent(pair.key), values = pair.value;
      
      if (values && typeof values == 'object') {
        if (Object.isArray(values)) {
          // We used to use `Array#map` here to get the query pair for each
          // item in the array, but that caused test regressions once we
          // added the sparse array behavior for array iterator methods.
          // Changed to an ordinary `for` loop so that we can handle
          // `undefined` values ourselves rather than have them skipped.
          var queryValues = [];
          for (var i = 0, len = values.length, value; i < len; i++) {
            value = values[i];
            queryValues.push(toQueryPair(key, value));            
          }
          return results.concat(queryValues);
        }
      } else results.push(toQueryPair(key, values));
      return results;
    }).join('&');
  }

  /** related to: Object.inspect
   *  Hash#inspect() -> String
   *
   *  Returns the debug-oriented string representation of the Hash.
  **/
  function inspect() {
    return '#<Hash:{' + this.map(function(pair) {
      return pair.map(Object.inspect).join(': ');
    }).join(', ') + '}>';
  }

 /**
   *  Hash#clone() -> Hash
   *
   *  Returns a clone of this [[Hash]].
  **/
  function clone() {
    return new Hash(this);
  }

  return {
    initialize:             initialize,
    _each:                  _each,
    set:                    set,
    get:                    get,
    unset:                  unset,
    toObject:               toObject,
    toTemplateReplacements: toObject,
    keys:                   keys,
    values:                 values,
    index:                  index,
    merge:                  merge,
    update:                 update,
    toQueryString:          toQueryString,
    inspect:                inspect,
    toJSON:                 toObject,
    clone:                  clone
  };
})());

Hash.from = $H;
