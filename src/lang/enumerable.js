/** section: lang
 * mixin Enumerable
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
   *
   *  Groups items into chunks of the given size.
   *  The final "slice" may have fewer than `number` items; it won't "pad" the
   *  last group with empty values. For that behavior, use
   *  [[Enumerable#inGroupsOf]].
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
   *
   *  Determines whether all the elements are boolean-equivalent to `true`,
   *  either directly or through computation by the provided iterator.
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
   *
   *  Determines whether at least one element is boolean-equivalent to `true`,
   *  either directly or through computation by the provided iterator.
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

  /** alias of: Enumerable#map
   *  Enumerable#collect([iterator = Prototype.K[, context]]) -> Array
   *
   *  Returns the results of applying the iterator to each element.
   *  Aliased as [[Enumerable#map]].
  **/
  function collect(iterator, context) {
    iterator = iterator || Prototype.K;
    var results = [];
    this.each(function(value, index) {
      results.push(iterator.call(context, value, index));
    });
    return results;
  }
  
  /** alias of: Enumerable#find
   *  Enumerable#detect(iterator[, context]) -> firstElement | undefined
   *
   *  Finds the first element for which the iterator returns a “truthy” value.
   *  Aliased by the [[Enumerable#find]] method.
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
  
  /** alias of: select
   *  Enumerable#findAll(iterator[, context]) -> Array
   *
   *  Returns all the elements for which the iterator returned “truthy” value.
   *  Aliased as [[Enumerable#select]].
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
   *  Enumerable#grep(regex[, iterator = Prototype.K[, context]]) -> Array
   *
   *  Returns all the elements that match the filter. If an iterator is provided,
   *  it is used to produce the returned value for each selected element.
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
  
  /** alias of: Enumerable#member
   *  Enumerable#include(object) -> Boolean
   *
   *  Determines whether a given object is in the Enumerable or not,
   *  based on the `==` comparison operator. Aliased as [[Enumerable#member]].
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
   *  Enumerable#inGroupsOf(size[, filler = null]) -> [group...]
   *
   *  Groups items in fixed-size chunks, using a specific value to fill up
   *  the last chunk if necessary.
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
   *
   *  Returns all the elements for which the iterator returned a “falsy” value.
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
  
  /** alias of: Enumerable#entries
   *  Enumerable#toArray() -> Array
   *
   *  Returns an Array representation of the enumeration.
   *  Aliased as [[Enumerable#entries]].
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
  
  /** related to: Object.inspect
   *  Enumerable#inspect() -> String
   *
   *  Returns the debug-oriented string representation of the object.
  **/
  function inspect() {
    return '#<Enumerable:' + this.toArray().inspect() + '>';
  }
  
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
