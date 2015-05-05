/** section: Language, related to: Array
 *  $A(iterable) -> Array
 *
 *  Accepts an array-like collection (anything with numeric indices) and returns
 *  its equivalent as an actual [[Array]] object. This method is a convenience
 *  alias of [[Array.from]], but is the preferred way of casting to an [[Array]].
 *
 *  The primary use of [[$A]] is to obtain an actual [[Array]] object based on
 *  anything that could pass as an array (e.g. the `NodeList` or
 *  `HTMLCollection` objects returned by numerous DOM methods, or the predefined
 *  `arguments` reference within your functions).
 *
 *  The reason you would want an actual [[Array]] is simple:
 *  [[Array Prototype extends Array]] to equip it with numerous extra methods,
 *  and also mixes in the [[Enumerable]] module, which brings in another
 *  boatload of nifty methods. Therefore, in Prototype, actual [[Array]]s trump
 *  any other collection type you might otherwise get.
 *
 *  The conversion performed is rather simple: `null`, `undefined` and `false` become
 *  an empty array; any object featuring an explicit `toArray` method (as many Prototype
 *  objects do) has it invoked; otherwise, we assume the argument "looks like an array"
 *  (e.g. features a `length` property and the `[]` operator), and iterate over its components
 *  in the usual way.
 *
 *  When passed an array, [[$A]] _makes a copy_ of that array and returns it.
 *
 *  ##### Examples
 *
 *  The well-known DOM method [`document.getElementsByTagName()`](http://www.w3.org/TR/DOM-Level-2-Core/core.html#ID-A6C9094)
 *  doesn't return an [[Array]], but a `NodeList` object that implements the basic array
 *  "interface." Internet Explorer does not allow us to extend `Enumerable` onto `NodeList.prototype`,
 *  so instead we cast the returned `NodeList` to an [[Array]]:
 *
 *      var paras = $A(document.getElementsByTagName('p'));
 *      paras.each(Element.hide);
 *      $(paras.last()).show();
 *
 *  Notice we had to use [[Enumerable#each each]] and [[Element.hide]] because
 *  [[$A]] doesn't perform DOM extensions, since the array could contain
 *  anything (not just DOM elements). To use the [[Element#hide]] instance
 *  method we first must make sure all the target elements are extended:
 *
 *      $A(document.getElementsByTagName('p')).map(Element.extend).invoke('hide');
 *
 *  Want to display your arguments easily? [[Array]] features a `join` method, but the `arguments`
 *  value that exists in all functions *does not* inherit from [[Array]]. So, the tough
 *  way, or the easy way?
 *
 *      // The hard way...
 *      function showArgs() {
 *        alert(Array.prototype.join.call(arguments, ', '));
 *      }
 *
 *      // The easy way...
 *      function showArgs() {
 *        alert($A(arguments).join(', '));
 *      }
**/

function $A(iterable) {
  if (!iterable) return [];
  // Safari <2.0.4 crashes when accessing property of a node list with property accessor.
  // It nevertheless works fine with `in` operator, which is why we use it here
  if ('toArray' in Object(iterable)) return iterable.toArray();
  var length = iterable.length || 0, results = new Array(length);
  while (length--) results[length] = iterable[length];
  return results;
}

/** section: Language, related to: Array
 *  $w(String) -> Array
 *
 *  Splits a string into an [[Array]], treating all whitespace as delimiters. Equivalent
 *  to Ruby's `%w{foo bar}` or Perl's `qw(foo bar)`.
 *
 *  This is one of those life-savers for people who just hate commas in literal arrays :-)
 *
 *  ### Examples
 *
 *      $w('apples bananas kiwis')
 *      // -> ['apples', 'bananas', 'kiwis']
 *
 *  This can slightly shorten code when writing simple iterations:
 *
 *      $w('apples bananas kiwis').each(function(fruit){
 *        var message = 'I like ' + fruit
 *        // do something with the message
 *      })
 *
 *  This also becomes sweet when combined with [[Element]] functions:
 *
 *      $w('ads navbar funkyLinks').each(Element.hide);
**/

function $w(string) {
  if (!Object.isString(string)) return [];
  string = string.strip();
  return string ? string.split(/\s+/) : [];
}

/** alias of: $A
 *  Array.from(iterable) -> Array
**/
Array.from = $A;

/** section: Language
 * class Array
 *  includes Enumerable
 *
 *  Prototype extends all native JavaScript arrays with quite a few powerful
 *  methods.
 *
 *  This is done in two ways:
 *
 *  * It mixes in the [[Enumerable]] module, which brings in a ton of methods.
 *  * It adds quite a few extra methods, which are documented in this section.
 *
 *  With Prototype, arrays become much, much more than the trivial objects we
 *  used to manipulate, limiting ourselves to using their `length` property and
 *  their `[]` indexing operator. They become very powerful objects that
 *  greatly simplify the code for 99% of the common use cases involving them.
 *
 *  ##### Why you should stop using for...in to iterate
 *
 *  Many JavaScript authors have been misled into using the `for...in` JavaScript
 *  construct to loop over array elements. This kind of code just won't work
 *  with Prototype.
 *
 *  The ECMA 262 standard, which defines ECMAScript 3rd edition, supposedly
 *  implemented by all major browsers including MSIE, defines ten methods
 *  on [[Array]] (&sect;15.4.4), including nice methods like `concat`, `join`,
 *  `pop`, and `push`.
 *
 *  This same standard explicitly defines that the `for...in` construct (&sect;12.6.4)
 *  exists to enumerate the properties of the object appearing on the right side
 *  of the `in` keyword. Only properties specifically marked as _non-enumerable_
 *  are ignored by such a loop. By default, the `prototype` and `length`
 *  properties are so marked, which prevents you from enumerating over array
 *  methods when using for...in. This comfort led developers to use `for...in` as a
 *  shortcut for indexing loops, when it is not its actual purpose.
 *
 *  However, Prototype has no way to mark the methods it adds to
 *  `Array.prototype` as non-enumerable. Therefore, using `for...in` on arrays
 *  when using Prototype will enumerate all extended methods as well, such as
 *  those coming from the [[Enumerable]] module, and those Prototype puts in the
 *  [[Array]] namespace (listed further below).
 *
 *  ##### What you should use instead
 *
 *  You can revert to vanilla loops:
 *
 *      for (var index = 0; index < myArray.length; ++index) {
 *        var item = myArray[index];
 *        // Your code working on item here...
 *      }
 *
 *  Or you can use iterators, such as [[Array#each]]:
 *
 *      myArray.each(function(item) {
 *        // Your code working on item here...
 *      });
 *
 *  The inability to use `for...in` on arrays is not much of a burden: as you'll
 *  see, most of what you used to loop over arrays for can be concisely done
 *  using the new methods provided by Array or the mixed-in [[Enumerable]]
 *  module. So manual loops should be fairly rare.
 *
 *  ##### A note on performance
 *
 *  Should you have a very large array, using iterators with lexical closures
 *  (anonymous functions that you pass to the iterators and that get invoked at
 *  every loop iteration) in methods like [[Array#each]] &mdash; _or_ relying on
 *  repetitive array construction (such as uniq), may yield unsatisfactory
 *  performance. In such cases, you're better off writing manual indexing loops,
 *  but take care then to cache the length property and use the prefix `++`
 *  operator:
 *
 *      // Custom loop with cached length property: maximum full-loop
 *      // performance on very large arrays!
 *      for (var index = 0, len = myArray.length; index < len; ++index) {
 *        var item = myArray[index];
 *        // Your code working on item here...
 *      }
 *
**/

(function() {
  var arrayProto = Array.prototype,
      slice = arrayProto.slice,
      _each = arrayProto.forEach; // use native browser JS 1.6 implementation if available

  function each(iterator, context) {
    for (var i = 0, length = this.length >>> 0; i < length; i++) {
      if (i in this) iterator.call(context, this[i], i, this);
    }
  }
  if (!_each) _each = each;

  /**
   *  Array#clear() -> Array
   *
   *  Clears the array (makes it empty) and returns the array reference.
   *
   *  ##### Example
   *
   *      var guys = ['Sam', 'Justin', 'Andrew', 'Dan'];
   *      guys.clear();
   *      // -> []
   *      guys
   *      // -> []
  **/
  function clear() {
    this.length = 0;
    return this;
  }

  /**
   *  Array#first() -> ?
   *
   *  Returns the array's first item (e.g., `array[0]`).
  **/
  function first() {
    return this[0];
  }

  /**
   *  Array#last() -> ?
   *
   *  Returns the array's last item (e.g., `array[array.length - 1]`).
  **/
  function last() {
    return this[this.length - 1];
  }

  /**
   *  Array#compact() -> Array
   *
   *  Returns a **copy** of the array without any `null` or `undefined` values.
   *
   *  ##### Example
   *
   *      var orig = [undefined, 'A', undefined, 'B', null, 'C'];
   *      var copy = orig.compact();
   *      // orig -> [undefined, 'A', undefined, 'B', null, 'C'];
   *      // copy -> ['A', 'B', 'C'];
  **/
  function compact() {
    return this.select(function(value) {
      return value != null;
    });
  }

  /**
   *  Array#flatten() -> Array
   *
   *  Returns a flattened (one-dimensional) copy of the array, leaving
   *  the original array unchanged.
   *
   *  Nested arrays are recursively injected inline. This can prove very
   *  useful when handling the results of a recursive collection algorithm,
   *  for instance.
   *
   *  ##### Example
   *
   *      var a = ['frank', ['bob', 'lisa'], ['jill', ['tom', 'sally']]];
   *      var b = a.flatten();
   *      // a -> ['frank', ['bob', 'lisa'], ['jill', ['tom', 'sally']]]
   *      // b -> ['frank', 'bob', 'lisa', 'jill', 'tom', 'sally']
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
   *  Array#without(value[, value...]) -> Array
   *  - value (?): A value to exclude.
   *
   *  Produces a new version of the array that does not contain any of the
   *  specified values, leaving the original array unchanged.
   *
   *  ##### Examples
   *
   *      [3, 5, 6].without(3)
   *      // -> [5, 6]
   *
   *      [3, 5, 6, 20].without(20, 6)
   *      // -> [3, 5]
  **/
  function without() {
    var values = slice.call(arguments, 0);
    return this.select(function(value) {
      return !values.include(value);
    });
  }

  /**
   *  Array#reverse([inline = true]) -> Array
   *  - inline (Boolean): Whether to modify the array in place. Defaults to `true`.
   *      Clones the original array when `false`.
   *
   *  Reverses the array's contents, optionally cloning it first.
   *
   *  ##### Examples
   *
   *      // Making a copy
   *      var nums = [3, 5, 6, 1, 20];
   *      var rev = nums.reverse(false);
   *      // nums -> [3, 5, 6, 1, 20]
   *      // rev -> [20, 1, 6, 5, 3]
   *
   *      // Working inline
   *      var nums = [3, 5, 6, 1, 20];
   *      nums.reverse();
   *      // nums -> [20, 1, 6, 5, 3]
  **/
  function reverse(inline) {
    return (inline === false ? this.toArray() : this)._reverse();
  }

  /**
   *  Array#uniq([sorted = false]) -> Array
   *  - sorted (Boolean): Whether the array has already been sorted. If `true`,
   *    a less-costly algorithm will be used.
   *
   *  Produces a duplicate-free version of an array. If no duplicates are
   *  found, the original array is returned.
   *
   *  On large arrays when `sorted` is `false`, this method has a potentially
   *  large performance cost.
   *
   *  ##### Examples
   *
   *      [1, 3, 2, 1].uniq();
   *      // -> [1, 2, 3]
   *
   *      ['A', 'a'].uniq();
   *      // -> ['A', 'a'] (because String comparison is case-sensitive)
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
      return array.indexOf(item) !== -1;
    });
  }

  /** alias of: Array#clone
   *  Array#toArray() -> Array
  **/

  /**
   *  Array#clone() -> Array
   *
   *  Returns a duplicate of the array, leaving the original array intact.
  **/
  function clone() {
    return slice.call(this, 0);
  }

  /** related to: Enumerable#size
   *  Array#size() -> Number
   *
   *  Returns the size of the array (e.g., `array.length`).
   *
   *  This is just a local optimization of the mixed-in [[Enumerable#size]]
   *  which avoids array cloning and uses the array's native length property.
  **/
  function size() {
    return this.length;
  }

  /** related to: Object.inspect
   *  Array#inspect() -> String
   *
   *  Returns the debug-oriented string representation of an array.
   *
   *  ##### Example
   *
   *      ['Apples', {good: 'yes', bad: 'no'}, 3, 34].inspect()
   *      // -> "['Apples', [object Object], 3, 34]"
  **/
  function inspect() {
    return '[' + this.map(Object.inspect).join(', ') + ']';
  }

  /**
   *  Array#indexOf(item[, offset = 0]) -> Number
   *  - item (?): A value that may or may not be in the array.
   *  - offset (Number): The number of initial items to skip before beginning
   *      the search.
   *
   *  Returns the index of the first occurrence of `item` within the array,
   *  or `-1` if `item` doesn't exist in the array. `Array#indexOf` compares
   *  items using *strict equality* (`===`).
   *
   *  `Array#indexOf` acts as an ECMAScript 5 [polyfill](http://remysharp.com/2010/10/08/what-is-a-polyfill/).
   *  It is only defined if not already present in the user's browser, and it
   *  is meant to behave like the native version as much as possible. Consult
   *  the [ES5 specification](http://es5.github.com/#x15.4.4.14) for more
   *  information.
   *
   *  ##### Examples
   *
   *      [3, 5, 6, 1, 20].indexOf(1)
   *      // -> 3
   *
   *      [3, 5, 6, 1, 20].indexOf(90)
   *      // -> -1 (not found)
   *
   *      ['1', '2', '3'].indexOf(1);
   *      // -> -1 (not found, 1 !== '1')
  **/
  function indexOf(item, i) {
    if (this == null) throw new TypeError();

    var array = Object(this), length = array.length >>> 0;
    if (length === 0) return -1;

    // The rules for the `fromIndex` argument are tricky. Let's follow the
    // spec line-by-line.
    i = Number(i);
    if (isNaN(i)) {
      i = 0;
    } else if (i !== 0 && isFinite(i)) {
      // Equivalent to ES5's `ToInteger` operation.
      i = (i > 0 ? 1 : -1) * Math.floor(Math.abs(i));
    }

    // If the search index is greater than the length of the array,
    // return -1.
    if (i > length) return -1;

    // If the search index is negative, take its absolute value, subtract it
    // from the length, and make that the new search index. If it's still
    // negative, make it 0.
    var k = i >= 0 ? i : Math.max(length - Math.abs(i), 0);
    for (; k < length; k++)
      if (k in array && array[k] === item) return k;
    return -1;
  }


  /** related to: Array#indexOf
   *  Array#lastIndexOf(item[, offset]) -> Number
   *  - item (?): A value that may or may not be in the array.
   *  - offset (Number): The number of items at the end to skip before
   *      beginning the search.
   *
   *  Returns the position of the last occurrence of `item` within the
   *  array &mdash; or `-1` if `item` doesn't exist in the array.
   *
   *  `Array#lastIndexOf` acts as an ECMAScript 5 [polyfill](http://remysharp.com/2010/10/08/what-is-a-polyfill/).
   *  It is only defined if not already present in the user's browser, and it
   *  is meant to behave like the native version as much as possible. Consult
   *  the [ES5 specification](http://es5.github.com/#x15.4.4.15) for more
   *  information.
  **/
  function lastIndexOf(item, i) {
    if (this == null) throw new TypeError();

    var array = Object(this), length = array.length >>> 0;
    if (length === 0) return -1;

    // The rules for the `fromIndex` argument are tricky. Let's follow the
    // spec line-by-line.
    if (!Object.isUndefined(i)) {
      i = Number(i);
      if (isNaN(i)) {
        i = 0;
      } else if (i !== 0 && isFinite(i)) {
        // Equivalent to ES5's `ToInteger` operation.
        i = (i > 0 ? 1 : -1) * Math.floor(Math.abs(i));
      }
    } else {
      i = length;
    }

    // If fromIndex is positive, clamp it to the last index in the array;
    // if it's negative, subtract its absolute value from the array's length.
    var k = i >= 0 ? Math.min(i, length - 1) :
     length - Math.abs(i);

    // (If fromIndex is still negative, it'll bypass this loop altogether and
    // return -1.)
    for (; k >= 0; k--)
      if (k in array && array[k] === item) return k;
    return -1;
  }

  // Replaces a built-in function. No PDoc needed.
  //
  // Used instead of the broken version of Array#concat in some versions of
  // Opera. Made to be ES5-compliant.
  function concat(_) {
    var array = [], items = slice.call(arguments, 0), item, n = 0;
    items.unshift(this);
    for (var i = 0, length = items.length; i < length; i++) {
      item = items[i];
      if (Object.isArray(item) && !('callee' in item)) {
        for (var j = 0, arrayLength = item.length; j < arrayLength; j++) {
          if (j in item) array[n] = item[j];
          n++;
        }
      } else {
        array[n++] = item;
      }
    }
    array.length = n;
    return array;
  }

  // Certain ES5 array methods have the same names as Prototype array methods
  // and perform the same functions.
  //
  // Prototype's implementations of these methods differ from the ES5 spec in
  // the way a missing iterator function is handled. Prototype uses
  // `Prototype.K` as a default iterator, while ES5 specifies that a
  // `TypeError` must be thrown. Implementing the ES5 spec completely would
  // break backward compatibility and would force users to pass `Prototype.K`
  // manually.
  //
  // Instead, if native versions of these methods exist, we wrap the existing
  // methods with our own behavior. This has very little performance impact.
  // It violates the spec by suppressing `TypeError`s for certain methods,
  // but that's an acceptable trade-off.

  function wrapNative(method) {
    return function() {
      if (arguments.length === 0) {
        // No iterator was given. Instead of throwing a `TypeError`, use
        // `Prototype.K` as the default iterator.
        return method.call(this, Prototype.K);
      } else if (arguments[0] === undefined) {
        // Same as above.
        var args = slice.call(arguments, 1);
        args.unshift(Prototype.K);
        return method.apply(this, args);
      } else {
        // Pass straight through to the native method.
        return method.apply(this, arguments);
      }
    };
  }

  // Note that #map, #filter, #some, and #every take some extra steps for
  // ES5 compliance: the context in which they're called is coerced to an
  // object, and that object's `length` property is coerced to a finite
  // integer. This makes it easier to use the methods as generics.
  //
  // This means that they behave a little differently from other methods in
  // `Enumerable`/`Array` that don't collide with ES5, but that's OK.

  /**
   *  Array#map([iterator = Prototype.K[, context]]) -> Array
   *  - iterator (Function): The iterator function to apply to each element
   *    in the enumeration.
   *  - context (Object): An optional object to use as `this` within
   *    calls to the iterator.
   *
   *  Returns the result of applying `iterator` to each item in the array. If
   *  no iterator is provided, the elements are simply copied to the returned
   *  array.
   *
   *  `Array#map` acts as an ECMAScript 5 [polyfill](http://remysharp.com/2010/10/08/what-is-a-polyfill/).
   *  It is only defined if not already present in the user's browser, and it
   *  is meant to behave like the native version as much as possible. Consult
   *  the [ES5 specification](http://es5.github.com/#x15.4.4.19) for more
   *  information.
  **/
  function map(iterator) {
    if (this == null) throw new TypeError();
    iterator = iterator || Prototype.K;

    var object = Object(this);
    var results = [], context = arguments[1], n = 0;

    for (var i = 0, length = object.length >>> 0; i < length; i++) {
      if (i in object) {
        results[n] = iterator.call(context, object[i], i, object);
      }
      n++;
    }
    results.length = n;
    return results;
  }

  if (arrayProto.map) {
    map = wrapNative(Array.prototype.map);
  }

  /**
   *  Array#filter(iterator[, context]) -> Array
   *  - iterator (Function): An iterator function to use to test the
   *    elements.
   *  - context (Object): An optional object to use as `this` within
   *    calls to the iterator.
   *
   *  Returns a new array containing all the items in this array for which
   *  `iterator` returned a truthy value.
   *
   *  `Array#filter` acts as an ECMAScript 5 [polyfill](http://remysharp.com/2010/10/08/what-is-a-polyfill/).
   *  It is only defined if not already present in the user's browser, and it
   *  is meant to behave like the native version as much as possible. Consult
   *  the [ES5 specification](http://es5.github.com/#x15.4.4.20) for more
   *  information.
  **/
  function filter(iterator) {
    if (this == null || !Object.isFunction(iterator))
      throw new TypeError();

    var object = Object(this);
    var results = [], context = arguments[1], value;

    for (var i = 0, length = object.length >>> 0; i < length; i++) {
      if (i in object) {
        value = object[i];
        if (iterator.call(context, value, i, object)) {
          results.push(value);
        }
      }
    }
    return results;
  }

  if (arrayProto.filter) {
    // `Array#filter` requires an iterator by nature, so we don't need to
    // wrap it.
    filter = Array.prototype.filter;
  }

  /**
   *  Array#some([iterator = Prototype.K[, context]]) -> Boolean
   *  - iterator (Function): An optional function to use to evaluate each
   *    element in the enumeration; the function should return the value to
   *    test. If this is not provided, the element itself is tested.
   *  - context (Object): An optional object to use as `this` within
   *    calls to the iterator.
   *
   *  Determines whether at least one element is truthy (boolean-equivalent to
   *  `true`), either directly or through computation by the provided iterator.
   *
   *  `Array#some` acts as an ECMAScript 5 [polyfill](http://remysharp.com/2010/10/08/what-is-a-polyfill/).
   *  It is only defined if not already present in the user's browser, and it
   *  is meant to behave like the native version as much as possible. Consult
   *  the [ES5 specification](http://es5.github.com/#x15.4.4.17) for more
   *  information.
  **/
  function some(iterator) {
    if (this == null) throw new TypeError();
    iterator = iterator || Prototype.K;
    var context = arguments[1];

    var object = Object(this);
    for (var i = 0, length = object.length >>> 0; i < length; i++) {
      if (i in object && iterator.call(context, object[i], i, object)) {
        return true;
      }
    }

    return false;
  }

  if (arrayProto.some) {
    some = wrapNative(Array.prototype.some);
  }

  /**
   *  Array#every([iterator = Prototype.K[, context]]) -> Boolean
   *  - iterator (Function): An optional function to use to evaluate each
   *    element in the enumeration; the function should return the value to
   *    test. If this is not provided, the element itself is tested.
   *  - context (Object): An optional object to use as `this` within
   *    calls to the iterator.
   *
   *  Determines whether all elements are truthy (boolean-equivalent to
   *  `true`), either directly or through computation by the provided iterator.
   *
   *  `Array#every` acts as an ECMAScript 5 [polyfill](http://remysharp.com/2010/10/08/what-is-a-polyfill/).
   *  It is only defined if not already present in the user's browser, and it
   *  is meant to behave like the native version as much as possible. Consult
   *  the [ES5 specification](http://es5.github.com/#x15.4.4.16) for more
   *  information.
   *
  **/
  function every(iterator) {
    if (this == null) throw new TypeError();
    iterator = iterator || Prototype.K;
    var context = arguments[1];

    var object = Object(this);
    for (var i = 0, length = object.length >>> 0; i < length; i++) {
      if (i in object && !iterator.call(context, object[i], i, object)) {
        return false;
      }
    }

    return true;
  }

  if (arrayProto.every) {
    every = wrapNative(Array.prototype.every);
  }

  // We used to define an `inject` method here that relied on ES5's
  // `Array#reduce` (if present), but using `reduce` prevents us from
  // catching a thrown `$break`. So arrays now use the standard
  // `Enumerable.inject` like they did previously.

  Object.extend(arrayProto, Enumerable);

  // Enumerable's `entries` method is no longer safe to mixin to arrays, as
  // it conflicts with an ES6 method. But it can still be mixed into other
  // things.
  if (arrayProto.entries === Enumerable.entries) {
    delete arrayProto.entries;
  }

  if (!arrayProto._reverse)
    arrayProto._reverse = arrayProto.reverse;

  Object.extend(arrayProto, {
    _each:     _each,

    map:       map,
    collect:   map,
    select:    filter,
    filter:    filter,
    findAll:   filter,
    some:      some,
    any:       some,
    every:     every,
    all:       every,

    clear:     clear,
    first:     first,
    last:      last,
    compact:   compact,
    flatten:   flatten,
    without:   without,
    reverse:   reverse,
    uniq:      uniq,
    intersect: intersect,
    clone:     clone,
    toArray:   clone,
    size:      size,
    inspect:   inspect
  });

  // fix for opera
  var CONCAT_ARGUMENTS_BUGGY = (function() {
    return [].concat(arguments)[0][0] !== 1;
  })(1,2);

  if (CONCAT_ARGUMENTS_BUGGY) arrayProto.concat = concat;

  // Use native browser JS 1.6 implementations if available.
  if (!arrayProto.indexOf) arrayProto.indexOf = indexOf;
  if (!arrayProto.lastIndexOf) arrayProto.lastIndexOf = lastIndexOf;
})();
