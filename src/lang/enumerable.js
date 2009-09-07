/** section: Language
 * mixin Enumerable
 *
 *  `Enumerable` provides a large set of useful methods for enumerations &mdash;
 *  objects that act as collections of values. It is a cornerstone of
 *  Prototype.
 *
 *  `Enumerable` is a _mixin_: a set of methods intended not for standaone
 *  use, but for incorporation into other objects.
 *
 *  Prototype mixes `Enumerable` into several classes. The most visible cases
 *  are [[Array]] and [[Hash]], but you'll find it in less obvious spots as
 *  well, such as in [[ObjectRange]] and various DOM- or Ajax-related objects.
 *
 *  <h4>The <code>context</code> parameter</h4>
 *
 *  Every method of `Enumerable` that takes an iterator also takes the "context
 *  object" as the next (optional) parameter. The context object is what the
 *  iterator will be _bound_ to &mdash; what the keyword `this` will refer to inside
 *  the iterator.
 *
 *      var myObject = {};
 *
 *      ['foo', 'bar', 'baz'].each(function(name, index) {
 *        this[name] = index;
 *      }, myObject); // we have specified the context
 *
 *      myObject
 *      //-> { foo: 0, bar: 1, baz: 2}
 *
 *  If there is no `context` argument, the iterator function will execute in
 *  the scope from which the `Enumerable` method itself was called.
 *
 *  <h4>Mixing <code>Enumerable</code> into your own objects</h4>
 *
 *  So, let's say you've created your very own collection-like object (say,
 *  some sort of Set, or perhaps something that dynamically fetches data
 *  ranges from the server side, lazy-loading style). You want to be able to
 *  mix `Enumerable` in (and we commend you for it). How do you go about this?
 *
 *  The Enumerable module basically makes only one requirement on your object:
 *  it must provide a method named `_each` (note the leading underscore) that
 *  will accept a function as its unique argument, and will contain the actual
 *  "raw iteration" algorithm, invoking its argument with each element in turn.
 *
 *  As detailed in the documentation for [[Enumerable#each]], `Enumerable`
 *  provides all the extra layers (handling iteration short-circuits, passing
 *  numeric indices, etc.). You just need to implement the actual iteration,
 *  as fits your internal structure.
 *
 *  If you're still confused, just have a look at the Prototype source code for
 *  [[Array]], [[Hash]], or [[ObjectRange]]. They all begin with their own
 *  `_each` method, which should help you grasp the idea.
 *
 *  Once you're done with this, you just need to mix `Enumerable` in, which
 *  you'll usually do before defining your methods, so as to make sure whatever
 *  overrides you provide for `Enumerable` methods will indeed prevail. In
 *  short, your code will probably end up looking like this:
 *
 *
 *      var YourObject = Class.create(Enumerable, {
 *        initialize: function() { // with whatever constructor arguments you need
 *          // Your construction code
 *        },
 *
 *        _each: function(iterator) {
 *          // Your iteration code, invoking iterator at every turn
 *        },
 *
 *        // Your other methods here, including Enumerable overrides
 *      });
 *
 *  Then, obviously, your object can be used like this:
 *
 *      var obj = new YourObject();
 *      // Populate the collection somehow
 *      obj.pluck('somePropName');
 *      obj.invoke('someMethodName');
 *      obj.size();
 *      // etc.
 *
**/

var $break = { };

var Enumerable = (function() {
  /**
   *  Enumerable#each(iterator[, context]) -> Enumerable
   *  - iterator (Function): A `Function` that expects an item in the
   *    collection as the first argument and a numerical index as the second.
   *  - context (Object): The scope in which to call `iterator`. Affects what
   *    the keyword `this` means inside `iterator`.
   *
   *  Calls `iterator` for each item in the collection.
   *
   *  ### Examples
   *
   *      ['one', 'two', 'three'].each(alert);
   *      // Alerts "one", then alerts "two", then alerts "three"
   *
   *  ### Built-In Variants
   *
   *  Most of the common use cases for `each` are already available pre-coded
   *  as other methods on `Enumerable`. Whether you want to find the first
   *  matching item in an enumeration, or transform it, or determine whether it
   *  has any (or all) values matching a particular condition, `Enumerable`
   *  has a method to do that for you.
  **/
  function each(iterator, context) {
    var index = 0;
    try {
      this._each(function(value) {
        iterator.call(context, value, index++);
      });
    } catch (e) {
      if (e != $break) throw e;
    }
    return this;
  }

  /**
   *  Enumerable#eachSlice(number[, iterator = Prototype.K[, context]]) -> Enumerable
   *  - number (Number): The number of items to include in each slice.
   *  - iterator (Function): An optional function to use to transform each
   *    element before it's included in the slice; if this is not provided,
   *    the element itself is included.
   *  - context (Object): An optional object to use as `this` within
   *    calls to the iterator.
   *
   *  Groups items into chunks of the given size. The final "slice" may have
   *  fewer than `number` items; it won't "pad" the last group with empty
   *  values. For that behavior, use [[Enumerable#inGroupsOf]].
   *
   *  ### Example
   *
   *      var students = [
   *        { name: 'Sunny', age: 20 },
   *        { name: 'Audrey', age: 21 },
   *        { name: 'Matt', age: 20 },
   *        { name: 'Amelie', age: 26 },
   *        { name: 'Will', age: 21 }
   *      ];
   *
   *      students.eachSlice(3, function(student) {
   *        return student.name;
   *      });
   *      // -> [['Sunny', 'Audrey', 'Matt'], ['Amelie', 'Will']]
  **/
  function eachSlice(number, iterator, context) {
    var index = -number, slices = [], array = this.toArray();
    if (number < 1) return array;
    while ((index += number) < array.length)
      slices.push(array.slice(index, index+number));
    return slices.collect(iterator, context);
  }

  /**
   *  Enumerable#all([iterator = Prototype.K[, context]]) -> Boolean
   *  - iterator (Function): An optional function to use to evaluate
   *    each element in the array; the function should return the value to
   *    test. If this is not provided, the element itself is tested.
   *  - context (Object): An optional object to use as `this` within
   *    calls to the iterator.
   *
   *  Determines whether all the elements are "truthy" (boolean-equivalent to
   *  `true`), either directly or through computation by the provided iterator.
   *  Stops on the first falsey element found (e.g., the first element that
   *  is boolean-equivalent to `false`, such as `undefined`, `0`, or indeed
   *  `false`);
   *
   *  ### Examples
   *
   *      [].all()
   *      // -> true (empty arrays have no elements that could be falsey)
   *
   *      $R(1, 5).all()
   *      // -> true (all values in [1..5] are truthy)
   *
   *      [0, 1, 2].all()
   *      // -> false (with only one loop cycle: 0 is falsey)
   *
   *      [9, 10, 15].all(function(n) { return n >= 10; })
   *      // -> false (the iterator returns false on 9)
  **/
  function all(iterator, context) {
    iterator = iterator || Prototype.K;
    var result = true;
    this.each(function(value, index) {
      result = result && !!iterator.call(context, value, index);
      if (!result) throw $break;
    });
    return result;
  }

  /**
   *  Enumerable#any([iterator = Prototype.K[, context]]) -> Boolean
   *  - iterator (Function): An optional function to use to evaluate
   *    each element in the array; the function should return the value to
   *    test. If this is not provided, the element itself is tested.
   *  - context (Object): An optional object to use as `this` within
   *    calls to the iterator.
   *
   *  Determines whether at least one element is truthy (boolean-equivalent to
   *  `true`), either directly or through computation by the provided iterator.
   *
   *  ### Examples
   *
   *      [].any()
   *      // -> false (empty arrays have no elements that could be truthy)
   *
   *      $R(0, 2).any()
   *      // -> true (on the second loop, 1 is truthy)
   *
   *      [2, 4, 6, 8, 10].any(function(n) { return n > 5; })
   *      // -> true (the iterator will return true on 6)
  **/
  function any(iterator, context) {
    iterator = iterator || Prototype.K;
    var result = false;
    this.each(function(value, index) {
      if (result = !!iterator.call(context, value, index))
        throw $break;
    });
    return result;
  }

  /**
   *  Enumerable#collect([iterator = Prototype.K[, context]]) -> Array
   *  - iterator (Function): The iterator function to apply to each element
   *    in the enumeration.
   *  - context (Object): An optional object to use as `this` within
   *    calls to the iterator.
   *
   *  Returns the result of applying `iterator` to each element. If no
   *  `iterator` is provided, the elements are simply copied to the
   *  result array.
   *
   *  ### Examples
   *
   *      ['Hitch', "Hiker's", 'Guide', 'to', 'the', 'Galaxy'].collect(function(s) {
   *        return s.charAt(0).toUpperCase();
   *      })
   *      // -> ['H', 'H', 'G', 'T', 'T', 'G']
   *
   *      $R(1,5).collect(function(n) {
   *        return n * n;
   *      })
   *      // -> [1, 4, 9, 16, 25]
  **/
  function collect(iterator, context) {
    iterator = iterator || Prototype.K;
    var results = [];
    this.each(function(value, index) {
      results.push(iterator.call(context, value, index));
    });
    return results;
  }

  /**
   *  Enumerable#detect(iterator[, context]) -> firstElement | undefined
   *  - iterator (Function): The iterator function to apply to each element
   *    in the array.
   *  - context (Object): An optional object to use as `this` within
   *    calls to the iterator.
   *
   *  Returns the first element for which the iterator returns a truthy value.
   *  Aliased by the [[Enumerable#find]] method.
   *
   *  ### Example
   *
   *      [1, 7, -2, -4, 5].detect(function(n) { return n < 0; })
   *      // -> -2
  **/
  function detect(iterator, context) {
    var result;
    this.each(function(value, index) {
      if (iterator.call(context, value, index)) {
        result = value;
        throw $break;
      }
    });
    return result;
  }

  /**
   *  Enumerable#findAll(iterator[, context]) -> Array
   *  - iterator (Function): An iterator function to use to test the elements.
   *  - context (Object): An optional object to use as `this` within
   *    calls to the iterator.
   *
   *  Returns all the elements for which the iterator returned a truthy value.
   *  For the opposite operation, see [[Enumerable#reject]].
   *
   *  ### Example
   *
   *      [1, "two", 3, "four", 5].findAll(Object.isString);
   *      // -> ["two", "four"]
  **/
  function findAll(iterator, context) {
    var results = [];
    this.each(function(value, index) {
      if (iterator.call(context, value, index))
        results.push(value);
    });
    return results;
  }

  /**
   *  Enumerable#grep(filter[, iterator = Prototype.K[, context]]) -> Array
   *  - filter (RegExp | String | Object): The filter to apply to elements. This
   *    can be a `RegExp` instance, a regular expression [[String]], or any
   *    object with a `match` function.
   *  - iterator (Function): An optional function to apply to selected elements
   *    before including them in the result.
   *  - context (Object): An optional object to use as `this` within
   *    calls to the iterator.
   *
   *  Returns an array containing all of the elements for which the given
   *  filter returns `true` (or a truthy value). If an iterator is provided,
   *  it is used to produce the returned value for each selected element; this
   *  is done *after* the element has been selected by the filter.
   *
   *  If the given filter is a [[String]], it is converted into a `RegExp`
   *  object. To select elements, each element is passed into the filter's
   *  `match` function, which should return a truthy value to select the element
   *  or a falsy value not to. Note that the `RegExp` `match` function will
   *  convert elements to Strings to perform matching.
   *
   *  ### Examples
   *
   *      // Get all strings containing a repeated letter
   *      ['hello', 'world', 'this', 'is', 'cool'].grep(/(.)\1/)
   *      // -> ['hello', 'cool']
   *
   *      // Get all numbers ending with 0 or 5 and subtract 1 from them
   *      $R(1,30).grep(/[05]$/, function(n) { return n - 1; })
   *      // -> [4, 9, 14, 19, 24, 29]
  **/
  function grep(filter, iterator, context) {
    iterator = iterator || Prototype.K;
    var results = [];

    if (Object.isString(filter))
      filter = new RegExp(RegExp.escape(filter));

    this.each(function(value, index) {
      if (filter.match(value))
        results.push(iterator.call(context, value, index));
    });
    return results;
  }

  /**
   *  Enumerable#include(object) -> Boolean
   *  - object (Object): The object to look for.
   *
   *  Determines whether a given object is in the Enumerable or not,
   *  based on the `==` comparison operator (equality with implicit type
   *  conversion).
   *
   *  ### Examples
   *
   *      $R(1,15).include(10);
   *      // -> true
   *
   *      ['hello', 'world'].include('HELLO');
   *      // -> false ('hello' != 'HELLO')
   *
   *      [1, 2, '3', '4', '5'].include(3);
   *      // -> true ('3' == 3)
  **/
  function include(object) {
    if (Object.isFunction(this.indexOf))
      if (this.indexOf(object) != -1) return true;

    var found = false;
    this.each(function(value) {
      if (value == object) {
        found = true;
        throw $break;
      }
    });
    return found;
  }

  /**
   *  Enumerable#inGroupsOf(number[, fillWith = null]) -> [group...]
   *  - number (Number): The number of items to include in each group.
   *  - fillWith (Object): An optional filler to use if the last group needs
   *    any; defaults to `null`.
   *
   *  Like [[Enumerable#eachSlice]], but pads out the last chunk with the
   *  specified value if necessary and doesn't support the `iterator` function.
   *
   *  ### Examples
   *
   *      var students = [
   *        { name: 'Sunny',  age: 20 },
   *        { name: 'Audrey', age: 21 },
   *        { name: 'Matt',   age: 20 },
   *        { name: 'Amelie', age: 26 },
   *        { name: 'Will',   age: 21 }
   *      ];
   *
   *      students.inGroupsOf(2, { name: '', age: 0 });
   *      // -> [
   *      //      [{ name: 'Sunny', age: 20 }, { name: 'Audrey', age: 21 }],
   *      //      [{ name: 'Matt', age: 20 },  { name: 'Amelie', age: 26 }],
   *      //      [{ name: 'Will', age: 21 },  { name: '', age: 0 }]
   *      //    ]
  **/
  function inGroupsOf(number, fillWith) {
    fillWith = Object.isUndefined(fillWith) ? null : fillWith;
    return this.eachSlice(number, function(slice) {
      while(slice.length < number) slice.push(fillWith);
      return slice;
    });
  }

  /**
   *  Enumerable#inject(accumulator, iterator[, context]) -> accumulatedValue
   *
   *  Incrementally builds a result value based on the successive results
   *  of the iterator.
   *  This can be used for array construction, numerical sums/averages, etc.
  **/
  function inject(memo, iterator, context) {
    this.each(function(value, index) {
      memo = iterator.call(context, memo, value, index);
    });
    return memo;
  }

  /**
   *  Enumerable#invoke(methodName[, arg...]) -> Array
   *
   *  Invokes the same method, with the same arguments, for all items in a collection.
   *  Returns the results of the method calls.
  **/
  function invoke(method) {
    var args = $A(arguments).slice(1);
    return this.map(function(value) {
      return value[method].apply(value, args);
    });
  }

  /**
   *  Enumerable#max([iterator = Prototype.K[, context]]) -> maxValue
   *
   *  Returns the maximum element (or element-based computation), or undefined if
   *  the enumeration is empty.
   *  Elements are either compared directly, or by first applying the iterator
   *  and comparing returned values.
  **/
  function max(iterator, context) {
    iterator = iterator || Prototype.K;
    var result;
    this.each(function(value, index) {
      value = iterator.call(context, value, index);
      if (result == null || value >= result)
        result = value;
    });
    return result;
  }

  /**
   *  Enumerable#min([iterator = Prototype.K[, context]]) -> minValue
   *
   *  Returns the minimum element (or element-based computation), or undefined if
   *  the enumeration is empty.
   *  Elements are either compared directly, or by first applying the iterator
   *  and comparing returned values.
  **/
  function min(iterator, context) {
    iterator = iterator || Prototype.K;
    var result;
    this.each(function(value, index) {
      value = iterator.call(context, value, index);
      if (result == null || value < result)
        result = value;
    });
    return result;
  }

  /**
   *  Enumerable#partition([iterator = Prototype.K[, context]]) -> [TrueArray, FalseArray]
   *
   *  Partitions the elements in two groups: those regarded as true, and those
   *  considered false.
   *  By default, regular JavaScript boolean equivalence is used, but an iterator
   *  can be provided, that computes a boolean representation of the elements.
  **/
  function partition(iterator, context) {
    iterator = iterator || Prototype.K;
    var trues = [], falses = [];
    this.each(function(value, index) {
      (iterator.call(context, value, index) ?
        trues : falses).push(value);
    });
    return [trues, falses];
  }

  /**
   *  Enumerable#pluck(propertyName) -> Array
   *
   *  Optimization for a common use-case of collect: fetching the same property
   *  for all the elements. Returns the property values.
  **/
  function pluck(property) {
    var results = [];
    this.each(function(value) {
      results.push(value[property]);
    });
    return results;
  }

  /**
   *  Enumerable#reject(iterator[, context]) -> Array
   *  - iterator (Function): An iterator function to use to test the elements.
   *  - context (Object): An optional object to use as `this` within
   *    calls to the iterator.
   *
   *  Returns all the elements for which the iterator returns a falsy value.
   *  For the opposite operation, see [[Enumerable#findAll]].
   *
   *  ### Example
   *
   *      [1, "two", 3, "four", 5].reject(Object.isString);
   *      // -> [1, 3, 5]
  **/
  function reject(iterator, context) {
    var results = [];
    this.each(function(value, index) {
      if (!iterator.call(context, value, index))
        results.push(value);
    });
    return results;
  }

  /**
   *  Enumerable#sortBy(iterator[, context]) -> Array
   *
   *  Provides a custom-sorted view of the elements based on the criteria computed,
   *  for each element, by the iterator.
  **/
  function sortBy(iterator, context) {
    return this.map(function(value, index) {
      return {
        value: value,
        criteria: iterator.call(context, value, index)
      };
    }).sort(function(left, right) {
      var a = left.criteria, b = right.criteria;
      return a < b ? -1 : a > b ? 1 : 0;
    }).pluck('value');
  }

  /**
   *  Enumerable#toArray() -> Array
   *
   *  Returns an Array representation of the enumeration.
  **/
  function toArray() {
    return this.map();
  }

  /**
   *  Enumerable#zip(sequence...[, iterator = Prototype.K]) -> Array
   *
   *  Zips together (think of the zip on a pair of trousers) 2+ sequences,
   *  providing an array of tuples.
   *  Each tuple contains one value per original sequence.
   *  Tuples can be converted to something else by applying the optional iterator on them.
  **/
  function zip() {
    var iterator = Prototype.K, args = $A(arguments);
    if (Object.isFunction(args.last()))
      iterator = args.pop();

    var collections = [this].concat(args).map($A);
    return this.map(function(value, index) {
      return iterator(collections.pluck(index));
    });
  }

  /**
   *  Enumerable#size() -> Number
   *
   *  Returns the size of the enumeration.
  **/
  function size() {
    return this.toArray().length;
  }

  /**
   *  Enumerable#inspect() -> String
   *
   *  Returns the debug-oriented string representation of the object.
  **/
  function inspect() {
    return '#<Enumerable:' + this.toArray().inspect() + '>';
  }

  /** alias of: Enumerable#collect
   *  Enumerable#map([iterator = Prototype.K[, context]]) -> Array
  **/

  /** alias of: Enumerable#any
   *  Enumerable#some([iterator = Prototype.K[, context]]) -> Boolean
  **/

  /** alias of: Enumerable#all
   *  Enumerable#every([iterator = Prototype.K[, context]]) -> Boolean
  **/

  /** alias of: Enumerable#findAll
   *  Enumerable#select(iterator[, context]) -> Array
  **/

  /** alias of: Enumerable#findAll
   *  Enumerable#filter(iterator[, context]) -> Array
  **/

  /** alias of: Enumerable#include
   *  Enumerable#member(object) -> Boolean
  **/

  /** alias of: Enumerable#toArray
   *  Enumerable#entries() -> Array
  **/

  /** alias of: Enumerable#detect
   *  Enumerable#find(iterator[, context]) -> firstElement | undefined
  **/

  return {
    each:       each,
    eachSlice:  eachSlice,
    all:        all,
    every:      all,
    any:        any,
    some:       any,
    collect:    collect,
    map:        collect,
    detect:     detect,
    findAll:    findAll,
    select:     findAll,
    filter:     findAll,
    grep:       grep,
    include:    include,
    member:     include,
    inGroupsOf: inGroupsOf,
    inject:     inject,
    invoke:     invoke,
    max:        max,
    min:        min,
    partition:  partition,
    pluck:      pluck,
    reject:     reject,
    sortBy:     sortBy,
    toArray:    toArray,
    entries:    toArray,
    zip:        zip,
    size:       size,
    inspect:    inspect,
    find:       detect
  };
})();
