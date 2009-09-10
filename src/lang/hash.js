/** section: Language, related to: Hash
 *  $H([object]) -> Hash
 *
 *  Creates a `Hash`. This is purely a convenience wrapper around the Hash
 *  constructor, it does not do anything other than pass any argument it's
 *  given into the Hash constructor and return the result.
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
 *  `Hash` can be thought of as an associative array, binding unique keys to
 *  values (which are not necessarily unique), though it can not guarantee
 *  consistent order its elements when iterating. Because of the nature of
 *  JavaScript, every object is in fact a hash; but `Hash` adds a number of
 *  methods that let you enumerate keys and values, iterate over key/value
 *  pairs, merge two hashes together, and much more.
 *
 *  <h4>Creating a hash</h4>
 *
 *  You can create a Hash either via `new Hash()` or the convenience alias
 *  `$H()`; there is **no** difference between them. In either case, you may
 *  optionally pass in an object to seed the `Hash`. If you pass in a `Hash`,
 *  it will be cloned.
 *
**/
var Hash = Class.create(Enumerable, (function() {
  /**
   *  new Hash([object])
   *
   *  Creates a new `Hash`. If `object` is given, the new hash will be populated
   *  with all the object's properties. See [[$H]].
   **/
  function initialize(object) {
    this._object = Object.isHash(object) ? object.toObject() : Object.clone(object);
  }

  // Docs for #each even though technically it's implemented by Enumerable
  /**
   *  Hash#each(iterator[, context]) -> Hash
   *  - iterator (Function): A function that expects each item in the `Hash`
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
   *  ### Example
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
  function _each(iterator) {
    for (var key in this._object) {
      var value = this._object[key], pair = [key, value];
      pair.key = key;
      pair.value = value;
      iterator(pair);
    }
  }

  /**
   *  Hash#set(key, value) -> value
   *  - key (String): The key to use for this value.
   *  - value (?): The value to use for this key.
   *
   *  Stores `value` in the hash using the key `key` and returns `value`.
   *
   *  ### Example
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
   *  ### Examples
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
   *  Deletes the hash's `key` property and returns its value.
  **/
  function unset(key) {
    var value = this._object[key];
    delete this._object[key];
    return value;
  }

  /**
   *  Hash#toObject() -> Object
   *
   *  Returns a cloned, vanilla object.
  **/
  function toObject() {
    return Object.clone(this._object);
  }

  /**
   *  Hash#keys() -> [String...]
   *
   *  Provides an Array containing the keys for items stored in the hash.
   *
   *  The order of the keys is not guaranteed.
   *
   *  ### Example
   *
   *      var h = $H({one: "uno", two: "due", three: "tre"});
   *      h.keys();
   *      // -> ["one", "three", "two] (these may be in any order)
  **/
  function keys() {
    return this.pluck('key');
  }

  /**
   *  Hash#values() -> Array
   *
   *  Collect the values of a hash and returns them in an array.
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
   *  Returns a new `Hash` instance with `object`'s key/value pairs merged in;
   *  this hash remains unchanged.
   *
   *  To modify the original hash in place, use [[Hash#update]].
   *
   *  ### Example
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
   *
   *  Updates hash with the key/value pairs of `object`.
   *  The original hash will be modified. To return a new hash instead, use
   *  [[Hash#merge]].
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
    return key + '=' + encodeURIComponent(String.interpret(value));
  }

  /** related to: String#toQueryParams
   *  Hash#toQueryString() -> String
   *
   *  Turns a hash into its URL-encoded query string representation.
  **/
  function toQueryString() {
    return this.inject([], function(results, pair) {
      var key = encodeURIComponent(pair.key), values = pair.value;

      if (values && typeof values == 'object') {
        if (Object.isArray(values))
          return results.concat(values.map(toQueryPair.curry(key)));
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

  /** related to: Object.toJSON
   *  Hash#toJSON() -> String
   *
   *  Returns a JSON string containing the keys and values in this hash.
   *
   *  ### Example
   *
   *      var h = $H({'a': 'apple', 'b': 23, 'c': false});
   *      h.toJSON();
   *      // -> {"a": "apple", "b": 23, "c": false}
  **/
  function toJSON() {
    return Object.toJSON(this.toObject());
  }

  /**
   *  Hash#clone() -> Hash
   *
   *  Returns a clone of this Hash.
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
    toJSON:                 toJSON,
    clone:                  clone
  };
})());

Hash.from = $H;
