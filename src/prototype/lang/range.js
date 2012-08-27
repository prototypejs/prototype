/** section: Language
 * class ObjectRange
 *  includes Enumerable
 *
 *  A succession of values.
 *
 *  An [[ObjectRange]] can model a range of any value that implements a `succ`
 *  method (which links that value to its "successor").
 *
 *  Prototype provides such a method for [[Number]] and [[String]], but you
 *  are (of course) welcome to implement useful semantics in your own objects,
 *  in order to enable ranges based on them.
 *
 *  [[ObjectRange]] mixes in [[Enumerable]], which makes ranges very versatile.
 *  It takes care, however, to override the default code for `include`, to
 *  achieve better efficiency.
 *
 *  While [[ObjectRange]] does provide a constructor, the preferred way to obtain
 *  a range is to use the [[$R]] utility function, which is strictly equivalent
 *  (only way more concise to use).
 *
 *  See [[$R]] for more information.
**/

/** section: Language
 *  $R(start, end[, exclusive = false]) -> ObjectRange
 *  
 *  Creates a new [[ObjectRange]] object. This method is a convenience wrapper
 *  around the [[ObjectRange]] constructor, but [[$R]] is the preferred alias.
 *  
 *  [[ObjectRange]] instances represent a range of consecutive values, be they 
 *  numerical, textual, or of another type that semantically supports value
 *  ranges. See the type's documentation for further details, and to discover
 *  how your own objects can support value ranges.
 *  
 *  The [[$R]] function takes exactly the same arguments as the original
 *  constructor: the **lower and upper bounds** (value of the same, proper
 *  type), and **whether the upper bound is exclusive** or not. By default, the
 *  upper bound is inclusive.
 *  
 *  ##### Examples
 *  
 *      $R(0, 10).include(10)
 *      // -> true
 *      
 *      $A($R(0, 5)).join(', ')
 *      // -> '0, 1, 2, 3, 4, 5'
 *      
 *      $A($R('aa', 'ah')).join(', ')
 *      // -> 'aa, ab, ac, ad, ae, af, ag, ah'
 *      
 *      $R(0, 10, true).include(10)
 *      // -> false
 *      
 *      $R(0, 10, true).each(function(value) {
 *        // invoked 10 times for value = 0 to 9
 *      });
 *  
 *  Note that [[ObjectRange]] mixes in the [[Enumerable]] module: this makes it 
 *  easy to convert a range to an [[Array]] ([[Enumerable]] provides the
 *  [[Enumerable#toArray]] method, which makes the [[$A]] conversion 
 *  straightforward), or to iterate through values. (Note, however, that getting
 *  the bounds back will be more efficiently done using the
 *  [[ObjectRange#start]] and [[ObjectRange#end]] properties than calling the
 *  [[Enumerable#min]] and [[Enumerable#max]] methods).
 *
 *  ##### Warning
 *
 *  **Be careful with [[String]] ranges**: as described in its [[String#succ]]
 *  method, it does not use alphabetical boundaries, but goes all the way
 *  through the character table:
 *  
 *      $A($R('a', 'e'))
 *      // -> ['a', 'b', 'c', 'd', 'e'], no surprise there
 *      
 *      $A($R('ax', 'ba'))
 *      // -> Ouch! Humongous array, starting as ['ax', 'ay', 'az', 'a{', 'a|', 'a}', 'a~'...]
 *
 *  See [[ObjectRange]] for more information.
**/
function $R(start, end, exclusive) {
  return new ObjectRange(start, end, exclusive);
}

var ObjectRange = Class.create(Enumerable, (function() {
  /**
   *  new ObjectRange(start, end[, exclusive = false])
   *
   *  Creates a new [[ObjectRange]].
   *
   *  The `exclusive` argument specifies whether `end` itself is a part of the
   *  range.
  **/
  function initialize(start, end, exclusive) {
    /**
     *  ObjectRange#start -> ?
     *
     *  The lower bounding value of the range.
    **/
    this.start = start;
    /**
     *  ObjectRange#end -> ?
     *
     *  The upper bounding value of the range.
    **/
    this.end = end;
    this.exclusive = exclusive;
  }

  function _each(iterator, context) {
    var value = this.start, i;
    for (i = 0; this.include(value); i++) {
      iterator.call(context, value, i);
      value = value.succ();
    }
  }

  /**
   *  ObjectRange#include(value) -> Boolean
   *
   *  Determines whether the value is included in the range.
   *
   *  This assumes the values in the range have a valid strict weak ordering
   *  (have valid semantics for the `<` operator). While [[ObjectRange]] mixes
   *  in [[Enumerable]], this method overrides the default version of
   *  [[Enumerable#include]], and is much more efficient (it uses a maximum of
   *  two comparisons).
   *  
   *  ##### Examples
   *  
   *      $R(1, 10).include(5);
   *      // -> true
   *      
   *      $R('a', 'h').include('x');
   *      // -> false
   *      
   *      $R(1, 10).include(10);
   *      // -> true
   *      
   *      $R(1, 10, true).include(10);
   *      // -> false
  **/
  function include(value) {
    if (value < this.start)
      return false;
    if (this.exclusive)
      return value < this.end;
    return value <= this.end;
  }

  return {
    initialize: initialize,
    _each:      _each,
    include:    include
  };
})());

