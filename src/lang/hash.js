/** section: Language, related to: Hash
 *  $H([object]) -> Hash
 *
 *  Creates a `Hash`.
 *
 *  `$H` is a convenience wrapper around the Hash constructor, with a safeguard
 *  that lets you pass an existing Hash object and get it back untouched
 *  (instead of uselessly cloning it).
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
 *  There are two ways to construct a Hash instance: the first is regular
 *  JavaScript object instantiation with the `new` keyword, and the second is
 *  using the [[$H]] function. There is one difference between them: if a `Hash`
 *  is passed to `$H`, it will be returned as-is, wherease the same hash passed
 *  to `new Hash` will be _cloned_ instead.
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
   *
   *  Sets the hash's `key` property to `value` and returns `value`.
  **/
  function set(key, value) {
    return this._object[key] = value;
  }

  /**
   *  Hash#get(key) -> value
   *
   *  Returns the value of the hash's `key` property.
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
   *  Provides an Array of keys (that is, property names) for the hash.
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
   *
   *  Returns a new hash with `object`'s key/value pairs merged in.
   *  To modify the original hash in place, use [[Hash#update]].
   *
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
   *  Returns the debug-oriented string representation of the hash.
  **/
  function inspect() {
    return '#<Hash:{' + this.map(function(pair) {
      return pair.map(Object.inspect).join(': ');
    }).join(', ') + '}>';
  }

  /** related to: Object.toJSON
   *  Hash#toJSON() -> String
   *
   *  Returns a JSON string.
  **/
  function toJSON() {
    return Object.toJSON(this.toObject());
  }

  /**
   *  Hash#clone() -> Hash
   *
   *  Returns a clone of hash.
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
