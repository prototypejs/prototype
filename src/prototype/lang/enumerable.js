/** section: Language
 * mixin Enumerable
 *
 *  [[Enumerable]] provides a large set of useful methods for enumerations &mdash;
 *  objects that act as collections of values. It is a cornerstone of
 *  Prototype.
 *
 *  [[Enumerable]] is a _mixin_: a set of methods intended not for standalone
 *  use, but for incorporation into other objects.
 *
 *  Prototype mixes [[Enumerable]] into several classes. The most visible cases
 *  are [[Array]] and [[Hash]], but you'll find it in less obvious spots as
 *  well, such as in [[ObjectRange]] and various DOM- or Ajax-related objects.
 *
 *  ##### The `context` parameter
 *
 *  Every method of [[Enumerable]] that takes an iterator also takes the "context
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
 *      myObject;
 *      // -> { foo: 0, bar: 1, baz: 2}
 *
 *  If there is no `context` argument, the iterator function will execute in
 *  the scope from which the [[Enumerable]] method itself was called.
 *  
 *  ##### Flow control
 *  
 *  You might find yourself missing the `break` and `continue` keywords that
 *  are available in ordinary `for` loops. If you need to break out of an
 *  enumeration before it's done, you can throw a special object named
 *  `$break`:
 *  
 *      var myObject = {};
 * 
 *      ['foo', 'bar', 'baz', 'thud'].each( function(name, index) {
 *        if (name === 'baz') throw $break;
 *        myObject[name] = index;
 *      });
 *  
 *      myObject;
 *      // -> { foo: 0, bar: 1 }
 *  
 *  Though we're technically throwing an exception, the `each` method knows
 *  to catch a thrown `$break` object and treat it as a command to stop
 *  iterating. (_Any_ exception thrown within an iterator will stop
 *  iteration, but only `$break` will be caught and suppressed.)
 *  
 *  If you need `continue`-like behavior, you can simply return early from
 *  your iterator:
 *  
 *      var myObject = {};
 *  
 *      ['foo', 'bar', 'baz', 'thud'].each( function(name, index) {
 *        if (name === 'baz') return;
 *        myObject[name] = index;
 *      });
 *  
 *      myObject;
 *      // -> { foo: 0, bar: 1, thud: 3 }
 *  
 *  ##### Mixing [[Enumerable]] into your own objects
 *
 *  So, let's say you've created your very own collection-like object (say,
 *  some sort of Set, or perhaps something that dynamically fetches data
 *  ranges from the server side, lazy-loading style). You want to be able to
 *  mix [[Enumerable]] in (and we commend you for it). How do you go about this?
 *
 *  The Enumerable module basically makes only one requirement on your object:
 *  it must provide a method named `_each` (note the leading underscore) that
 *  will accept a function as its unique argument, and will contain the actual
 *  "raw iteration" algorithm, invoking its argument with each element in turn.
 *
 *  As detailed in the documentation for [[Enumerable#each]], [[Enumerable]]
 *  provides all the extra layers (handling iteration short-circuits, passing
 *  numeric indices, etc.). You just need to implement the actual iteration,
 *  as fits your internal structure.
 *
 *  If you're still confused, just have a look at the Prototype source code for
 *  [[Array]], [[Hash]], or [[ObjectRange]]. They all begin with their own
 *  `_each` method, which should help you grasp the idea.
 *
 *  Once you're done with this, you just need to mix [[Enumerable]] in, which
 *  you'll usually do before defining your methods, so as to make sure whatever
 *  overrides you provide for [[Enumerable]] methods will indeed prevail. In
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
   *  ##### Examples
   *
   *      ['one', 'two', 'three'].each(alert);
   *      // Alerts "one", then alerts "two", then alerts "three"
   *
   *  ##### Built-In Variants
   *
   *  Most of the common use cases for `each` are already available pre-coded
   *  as other methods on [[Enumerable]]. Whether you want to find the first
   *  matching item in an enumeration, or transform it, or determine whether it
   *  has any (or all) values matching a particular condition, [[Enumerable]]
   *  has a method to do that for you.
  **/
  function each(iterator, context) {
    try {
      this._each(iterator, context);
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
   *  ##### Example
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
   *    each element in the enumeration; the function should return the value to
   *    test. If this is not provided, the element itself is tested.
   *  - context (Object): An optional object to use as `this` within
   *    calls to the iterator.
   *
   *  Determines whether all the elements are "truthy" (boolean-equivalent to
   *  `true`), either directly or through computation by the provided iterator.
   *  Stops on the first falsy element found (e.g., the first element that
   *  is boolean-equivalent to `false`, such as `undefined`, `0`, or indeed
   *  `false`);
   *
   *  ##### Examples
   *
   *      [].all();
   *      // -> true (empty arrays have no elements that could be falsy)
   *
   *      $R(1, 5).all();
   *      // -> true (all values in [1..5] are truthy)
   *
   *      [0, 1, 2].all();
   *      // -> false (with only one loop cycle: 0 is falsy)
   *
   *      [9, 10, 15].all(function(n) { return n >= 10; });
   *      // -> false (the iterator returns false on 9)
  **/
  function all(iterator, context) {
    iterator = iterator || Prototype.K;
    var result = true;
    this.each(function(value, index) {
      result = result && !!iterator.call(context, value, index, this);
      if (!result) throw $break;
    }, this);
    return result;
  }

  /**
   *  Enumerable#any([iterator = Prototype.K[, context]]) -> Boolean
   *  - iterator (Function): An optional function to use to evaluate each
   *    element in the enumeration; the function should return the value to
   *    test. If this is not provided, the element itself is tested.
   *  - context (Object): An optional object to use as `this` within
   *    calls to the iterator.
   *
   *  Determines whether at least one element is truthy (boolean-equivalent to
   *  `true`), either directly or through computation by the provided iterator.
   *
   *  ##### Examples
   *
   *      [].any();
   *      // -> false (empty arrays have no elements that could be truthy)
   *
   *      $R(0, 2).any();
   *      // -> true (on the second loop, 1 is truthy)
   *
   *      [2, 4, 6, 8, 10].any(function(n) { return n > 5; });
   *      // -> true (the iterator will return true on 6)
  **/
  function any(iterator, context) {
    iterator = iterator || Prototype.K;
    var result = false;
    this.each(function(value, index) {
      if (result = !!iterator.call(context, value, index, this))
        throw $break;
    }, this);
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
   *  returned array.
   *
   *  ##### Examples
   *
   *      ['Hitch', "Hiker's", 'Guide', 'to', 'the', 'Galaxy'].collect(function(s) {
   *        return s.charAt(0).toUpperCase();
   *      });
   *      // -> ['H', 'H', 'G', 'T', 'T', 'G']
   *
   *      $R(1,5).collect(function(n) {
   *        return n * n;
   *      });
   *      // -> [1, 4, 9, 16, 25]
  **/
  function collect(iterator, context) {
    iterator = iterator || Prototype.K;
    var results = [];
    this.each(function(value, index) {
      results.push(iterator.call(context, value, index, this));
    }, this);
    return results;
  }

  /**
   *  Enumerable#detect(iterator[, context]) -> firstElement | undefined
   *  - iterator (Function): The iterator function to apply to each element
   *    in the enumeration.
   *  - context (Object): An optional object to use as `this` within
   *    calls to the iterator.
   *
   *  Returns the first element for which the iterator returns a truthy value.
   *  Aliased by the [[Enumerable#find]] method.
   *
   *  ##### Example
   *
   *      [1, 7, -2, -4, 5].detect(function(n) { return n < 0; });
   *      // -> -2
  **/
  function detect(iterator, context) {
    var result;
    this.each(function(value, index) {
      if (iterator.call(context, value, index, this)) {
        result = value;
        throw $break;
      }
    }, this);
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
   *  ##### Example
   *
   *      [1, 'two', 3, 'four', 5].findAll(Object.isString);
   *      // -> ['two', 'four']
  **/
  function findAll(iterator, context) {
    var results = [];
    this.each(function(value, index) {
      if (iterator.call(context, value, index, this))
        results.push(value);
    }, this);
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
   *  ##### Examples
   *
   *      // Get all strings containing a repeated letter
   *      ['hello', 'world', 'this', 'is', 'cool'].grep(/(.)\1/);
   *      // -> ['hello', 'cool']
   *
   *      // Get all numbers ending with 0 or 5 and subtract 1 from them
   *      $R(1, 30).grep(/[05]$/, function(n) { return n - 1; });
   *      // -> [4, 9, 14, 19, 24, 29]
  **/
  function grep(filter, iterator, context) {
    iterator = iterator || Prototype.K;
    var results = [];

    if (Object.isString(filter))
      filter = new RegExp(RegExp.escape(filter));

    this.each(function(value, index) {
      if (filter.match(value))
        results.push(iterator.call(context, value, index, this));
    }, this);
    return results;
  }

  /**
   *  Enumerable#include(object) -> Boolean
   *  - object (?): The object to look for.
   *
   *  Determines whether a given object is in the enumerable or not,
   *  based on the `==` comparison operator (equality with implicit type
   *  conversion).
   *
   *  ##### Examples
   *
   *      $R(1, 15).include(10);
   *      // -> true
   *
   *      ['hello', 'world'].include('HELLO');
   *      // -> false ('hello' != 'HELLO')
   *
   *      [1, 2, '3', '4', '5'].include(3);
   *      // -> true ('3' == 3)
  **/
  function include(object) {
    if (Object.isFunction(this.indexOf) && this.indexOf(object) != -1)
      return true;

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
   *  ##### Examples
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
   *  - accumulator (?): The initial value to which the `iterator` adds.
   *  - iterator (Function): An iterator function used to build the accumulated
   *    result.
   *  - context (Object): An optional object to use as `this` within
   *    calls to the iterator.
   *
   *  Incrementally builds a result value based on the successive results
   *  of the iterator. This can be used for array construction, numerical
   *  sums/averages, etc.
   *
   *  The `iterator` function is called once for each element in the
   *  enumeration, receiving the current value of the accumulator as its first
   *  argument, the element as its second argument, and the element's index as
   *  its third. It returns the new value for the accumulator.
   *
   *  ##### Examples
   *
   *      $R(1,10).inject(0, function(acc, n) { return acc + n; });
   *      // -> 55 (sum of 1 to 10)
   *
   *      ['a', 'b', 'c', 'd', 'e'].inject([], function(string, value, index) {
   *        if (index % 2 === 0) { // even numbers
   *          string += value;
   *        }
   *        return string;
   *      });
   *      // -> 'ace'
  **/
  function inject(memo, iterator, context) {
    this.each(function(value, index) {
      memo = iterator.call(context, memo, value, index, this);
    }, this);
    return memo;
  }

  /**
   *  Enumerable#invoke(methodName[, arg...]) -> Array
   *  - methodName (String): The name of the method to invoke.
   *  - args (?): Optional arguments to pass to the method.
   *
   *  Invokes the same method, with the same arguments, for all items in a
   *  collection. Returns an array of the results of the method calls.
   *
   *  ##### Examples
   *
   *      ['hello', 'world'].invoke('toUpperCase');
   *      // -> ['HELLO', 'WORLD']
   *
   *      ['hello', 'world'].invoke('substring', 0, 3);
   *      // -> ['hel', 'wor']
   *
   *      $$('input').invoke('stopObserving', 'change');
   *      // -> Stops observing the 'change' event on all input elements,
   *      // returns an array of the element references.
  **/
  function invoke(method) {
    var args = $A(arguments).slice(1);
    return this.map(function(value) {
      return value[method].apply(value, args);
    });
  }

  /** related to: Enumerable#min
   *  Enumerable#max([iterator = Prototype.K[, context]]) -> maxValue
   *  - iterator (Function): An optional function to use to evaluate each
   *    element in the enumeration; the function should return the value to
   *    test. If this is not provided, the element itself is tested.
   *  - context (Object): An optional object to use as `this` within
   *    calls to the iterator.
   *
   *  Returns the maximum element (or element-based `iterator` result), or
   *  `undefined` if the enumeration is empty. Elements are either compared
   *  directly, or by first calling `iterator` and comparing returned values.
   *  If multiple "max" elements (or results) are equivalent, the one closest
   *  to the end of the enumeration is returned.
   *
   *  If provided, `iterator` is called with two arguments: The element being
   *  evaluated, and its index in the enumeration; it should return the value
   *  `max` should consider (and potentially return).
   *
   *  ##### Examples
   *
   *      ['c', 'b', 'a'].max();
   *      // -> 'c'
   *
   *      [1, 3, '3', 2].max();
   *      // -> '3' (because both 3 and '3' are "max", and '3' was later)
   *
   *      ['zero', 'one', 'two'].max(function(item) { return item.length; });
   *      // -> 4
  **/
  function max(iterator, context) {
    iterator = iterator || Prototype.K;
    var result;
    this.each(function(value, index) {
      value = iterator.call(context, value, index, this);
      if (result == null || value >= result)
        result = value;
    }, this);
    return result;
  }

  /** related to: Enumerable#max
   *  Enumerable#min([iterator = Prototype.K[, context]]) -> minValue
   *  - iterator (Function): An optional function to use to evaluate each
   *    element in the enumeration; the function should return the value to
   *    test. If this is not provided, the element itself is tested.
   *  - context (Object): An optional object to use as `this` within
   *    calls to the iterator.
   *
   *  Returns the minimum element (or element-based `iterator` result), or
   *  `undefined` if the enumeration is empty. Elements are either compared
   *  directly, or by first calling `iterator` and comparing returned values.
   *  If multiple "min" elements (or results) are equivalent, the one closest
   *  to the *beginning* of the enumeration is returned.
   *
   *  If provided, `iterator` is called with two arguments: The element being
   *  evaluated, and its index in the enumeration; it should return the value
   *  `min` should consider (and potentially return).
   *
   *  ##### Examples
   *
   *      ['c', 'b', 'a'].min();
   *      // -> 'a'
   *
   *      [3, 1, '1', 2].min();
   *      // -> 1 (because both 1 and '1' are "min", and 1 was earlier)
   *
   *      ['un', 'deux', 'trois'].min(function(item) { return item.length; });
   *      // -> 2
  **/
  function min(iterator, context) {
    iterator = iterator || Prototype.K;
    var result;
    this.each(function(value, index) {
      value = iterator.call(context, value, index, this);
      if (result == null || value < result)
        result = value;
    }, this);
    return result;
  }

  /**
   *  Enumerable#partition([iterator = Prototype.K[, context]]) -> [TrueArray, FalseArray]
   *  - iterator (Function): An optional function to use to evaluate each
   *    element in the enumeration; the function should return the value to
   *    test. If this is not provided, the element itself is tested.
   *  - context (Object): An optional object to use as `this` within
   *    calls to the iterator.
   *
   *  Partitions the elements in two groups: those regarded as true, and those
   *  considered false. By default, regular JavaScript boolean equivalence
   *  (e.g., truthiness vs. falsiness) is used, but an iterator can be provided
   *  that computes a boolean representation of the elements.
   *
   *  Using `partition` is more efficient than using [[Enumerable#findAll]] and
   *  then using [[Enumerable#reject]] because the enumeration is only processed
   *  once.
   *
   *  ##### Examples
   *
   *      ['hello', null, 42, false, true, , 17].partition();
   *      // -> [['hello', 42, true, 17], [null, false, undefined]]
   *
   *      $R(1, 10).partition(function(n) {
   *        return 0 == n % 2;
   *      });
   *      // -> [[2, 4, 6, 8, 10], [1, 3, 5, 7, 9]]
  **/
  function partition(iterator, context) {
    iterator = iterator || Prototype.K;
    var trues = [], falses = [];
    this.each(function(value, index) {
      (iterator.call(context, value, index, this) ?
        trues : falses).push(value);
    }, this);
    return [trues, falses];
  }

  /**
   *  Enumerable#pluck(property) -> Array
   *  - property (String): The name of the property to fetch.
   *
   *  Pre-baked implementation for a common use-case of [[Enumerable#collect]]
   *  and [[Enumerable#each]]: fetching the same property for all of the
   *  elements. Returns an array of the property values.
   *
   *  ##### Example
   *
   *      ['hello', 'world', 'this', 'is', 'nice'].pluck('length');
   *      // -> [5, 5, 4, 2, 4]
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
   *  ##### Example
   *
   *      [1, "two", 3, "four", 5].reject(Object.isString);
   *      // -> [1, 3, 5]
  **/
  function reject(iterator, context) {
    var results = [];
    this.each(function(value, index) {
      if (!iterator.call(context, value, index, this))
        results.push(value);
    }, this);
    return results;
  }

  /**
   *  Enumerable#sortBy(iterator[, context]) -> Array
   *  - iterator (Function): The function to use to compute the criterion for
   *    each element in the enumeration.
   *  - context (Object): An optional object to use as `this` within
   *    calls to the iterator.
   *
   *  Creates a custom-sorted array of the elements based on the criteria
   *  computed, for each element, by the iterator. Computed criteria must have
   *  well-defined ordering semantics (i.e. the `<` operator must exist between
   *  any two criteria).
   *
   *  [[Enumerable#sortBy]] does not guarantee a *stable* sort; adjacent
   *  equivalent elements may be swapped.
   *
   *  ##### Example
   *
   *      ['hello', 'world', 'this', 'is', 'nice'].sortBy(function(s) {
   *        return s.length;
   *      });
   *      // -> ['is', 'nice', 'this', 'world', 'hello']
  **/
  function sortBy(iterator, context) {
    return this.map(function(value, index) {
      return {
        value: value,
        criteria: iterator.call(context, value, index, this)
      };
    }, this).sort(function(left, right) {
      var a = left.criteria, b = right.criteria;
      return a < b ? -1 : a > b ? 1 : 0;
    }).pluck('value');
  }

  /**
   *  Enumerable#toArray() -> Array
   *
   *  Returns an Array containing the elements of the enumeration.
   *
   *  ##### Example
   *
   *      $R(1, 5).toArray();
   *      // -> [1, 2, 3, 4, 5]
   *
   *      $H({ name: 'Sunny', age: 20 }).toArray();
   *      // -> [['name', 'Sunny'], ['age', 20]]
  **/
  function toArray() {
    return this.map();
  }

  /**
   *  Enumerable#zip(sequence...[, iterator = Prototype.K]) -> Array
   *  - sequence (Object): A sequence to zip with this enumerable (there can
   *    be several of these if desired).
   *  - iterator (Function): Optional function to use to transform the tuples
   *    once generated; this is always the last argument provided.
   *
   *  Zips together (think of the zipper on a pair of trousers) 2+ sequences,
   *  returning a new array of tuples. Each tuple is an array containing one
   *  value per original sequence. Tuples can be transformed to something else
   *  by applying the optional `iterator` on them.
   *
   *  If supplied, `iterator` is called with each tuple as its only argument
   *  and should return the value to use in place of that tuple.
   *
   *  ##### Examples
   *
   *      var firstNames = ['Jane', 'Nitin', 'Guy'];
   *      var lastNames  = ['Doe',  'Patel', 'Forcier'];
   *      var ages       = [23,     41,      17];
   *
   *      firstNames.zip(lastNames);
   *      // -> [['Jane', 'Doe'], ['Nitin', 'Patel'], ['Guy', 'Forcier']]
   *
   *      firstNames.zip(lastNames, ages);
   *      // -> [['Jane', 'Doe', 23], ['Nitin', 'Patel', 41], ['Guy', 'Forcier', 17]]
   *
   *      firstNames.zip(lastNames, ages, function(tuple) {
   *        return tuple[0] + ' ' + tuple[1] + ' is ' + tuple[2];
   *      });
   *      // -> ['Jane Doe is 23', 'Nitin Patel is 41', 'Guy Forcier is 17']
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
