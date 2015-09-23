/** section: Language
 * class Function
 *
 *  Extensions to the built-in `Function` object.
**/
Object.extend(Function.prototype, (function() {
  var slice = Array.prototype.slice;

  function update(array, args) {
    var arrayLength = array.length, length = args.length;
    while (length--) array[arrayLength + length] = args[length];
    return array;
  }

  function merge(array, args) {
    array = slice.call(array, 0);
    return update(array, args);
  }

  /**
   *  Function#argumentNames() -> Array
   *
   *  Reads the argument names as stated in the function definition and returns
   *  the values as an array of strings (or an empty array if the function is
   *  defined without parameters).
   *
   *  ##### Examples
   *
   *      function fn(foo, bar) {
   *        return foo + bar;
   *      }
   *      fn.argumentNames();
   *      //-> ['foo', 'bar']
   *
   *      Prototype.emptyFunction.argumentNames();
   *      //-> []
  **/
  function argumentNames() {
    var names = this.toString().match(/^[\s\(]*function[^(]*\(([^)]*)\)/)[1]
      .replace(/\/\/.*?[\r\n]|\/\*(?:.|[\r\n])*?\*\//g, '')
      .replace(/\s+/g, '').split(',');
    return names.length == 1 && !names[0] ? [] : names;
  }

  /** related to: Function#bindAsEventListener
   *  Function#bind(context[, args...]) -> Function
   *  - context (Object): The object to bind to.
   *  - args (?): Optional additional arguments to curry for the function.
   *
   *  Binds this function to the given `context` by wrapping it in another
   *  function and returning the wrapper. Whenever the resulting "bound"
   *  function is called, it will call the original ensuring that `this` is set
   *  to `context`. Also optionally curries arguments for the function.
   *
   *  `Function#bind` acts as an ECMAScript 5 [polyfill](http://remysharp.com/2010/10/08/what-is-a-polyfill/).
   *  It is only defined if not already present in the user's browser, and it
   *  is meant to behave like the native version as much as possible. Consult
   *  the [ES5 specification](http://es5.github.com/#x15.3.4.5) for more
   *  information.
   *
   *  ##### Examples
   *
   *  A typical use of [[Function#bind]] is to ensure that a callback (event
   *  handler, etc.) that is an object method gets called with the correct
   *  object as its context (`this` value):
   *
   *      var AlertOnClick = Class.create({
   *        initialize: function(msg) {
   *          this.msg = msg;
   *        },
   *        handleClick: function(event) {
   *          event.stop();
   *          alert(this.msg);
   *        }
   *      });
   *      var myalert = new AlertOnClick("Clicked!");
   *      $('foo').observe('click', myalert.handleClick); // <= WRONG
   *      // -> If 'foo' is clicked, the alert will be blank; "this" is wrong
   *      $('bar').observe('click', myalert.handleClick.bind(myalert)); // <= RIGHT
   *      // -> If 'bar' is clicked, the alert will be "Clicked!"
   *
   *  `bind` can also *curry* (burn in) arguments for the function if you
   *  provide them after the `context` argument:
   *
   *      var Averager = Class.create({
   *        initialize: function() {
   *          this.count = 0;
   *          this.total = 0;
   *        },
   *        add: function(addend) {
   *          ++this.count;
   *          this.total += addend;
   *        },
   *        getAverage: function() {
   *          return this.count == 0 ? NaN : this.total / this.count;
   *        }
   *      });
   *      var a = new Averager();
   *      var b = new Averager();
   *      var aAdd5 = a.add.bind(a, 5);   // Bind to a, curry 5
   *      var aAdd10 = a.add.bind(a, 10); // Bind to a, curry 10
   *      var bAdd20 = b.add.bind(b, 20); // Bind to b, curry 20
   *      aAdd5();
   *      aAdd10();
   *      bAdd20();
   *      bAdd20();
   *      alert(a.getAverage());
   *      // -> Alerts "7.5" (average of [5, 10])
   *      alert(b.getAverage());
   *      // -> Alerts "20" (average of [20, 20])
   *
   *  (To curry without binding, see [[Function#curry]].)
  **/

  function bind(context) {
    if (arguments.length < 2 && Object.isUndefined(arguments[0]))
      return this;

    if (!Object.isFunction(this))
      throw new TypeError("The object is not callable.");
      
    var nop = function() {};
    var __method = this, args = slice.call(arguments, 1);
    
    var bound = function() {
      var a = merge(args, arguments);
      // Ignore the supplied context when the bound function is called with
      // the "new" keyword.
      var c = this instanceof bound ? this : context;
      return __method.apply(c, a);
    };
        
    nop.prototype   = this.prototype;
    bound.prototype = new nop();

    return bound;
  }

  /** related to: Function#bind
   *  Function#bindAsEventListener(context[, args...]) -> Function
   *  - context (Object): The object to bind to.
   *  - args (?): Optional arguments to curry after the event argument.
   *
   *  An event-specific variant of [[Function#bind]] which ensures the function
   *  will recieve the current event object as the first argument when
   *  executing.
   *
   *  It is not necessary to use `bindAsEventListener` for all bound event
   *  handlers; [[Function#bind]] works well for the vast majority of cases.
   *  `bindAsEventListener` is only needed when:
   *
   *  - Using old-style DOM0 handlers rather than handlers hooked up via
   *    [[Event.observe]], because `bindAsEventListener` gets the event object
   *    from the right place (even on MSIE). (If you're using `Event.observe`,
   *    that's already handled.)
   *  - You want to bind an event handler and curry additional arguments but
   *    have those arguments appear after, rather than before, the event object.
   *    This mostly happens if the number of arguments will vary, and so you
   *    want to know the event object is the first argument.
   *
   *  ##### Example
   *
   *      var ContentUpdater = Class.create({
   *        initialize: function(initialData) {
   *          this.data = Object.extend({}, initialData);
   *        },
   *        // On an event, update the content in the elements whose
   *        // IDs are passed as arguments from our data
   *        updateTheseHandler: function(event) {
   *          var argIndex, id, element;
   *          event.stop();
   *          for (argIndex = 1; argIndex < arguments.length; ++argIndex) {
   *            id = arguments[argIndex];
   *            element = $(id);
   *            if (element) {
   *              element.update(String(this.data[id]).escapeHTML());
   *            }
   *          }
   *        }
   *      });
   *      var cu = new ContentUpdater({
   *        dispName: 'Joe Bloggs',
   *        dispTitle: 'Manager <provisional>',
   *        dispAge: 47
   *      });
   *      // Using bindAsEventListener because of the variable arg lists:
   *      $('btnUpdateName').observe('click',
   *        cu.updateTheseHandler.bindAsEventListener(cu, 'dispName')
   *      );
   *      $('btnUpdateAll').observe('click',
   *        cu.updateTheseHandler.bindAsEventListener(cu, 'dispName', 'dispTitle', 'dispAge')
   *      );
  **/
  function bindAsEventListener(context) {
    var __method = this, args = slice.call(arguments, 1);
    return function(event) {
      var a = update([event || window.event], args);
      return __method.apply(context, a);
    }
  }

  /**
   *  Function#curry(args...) -> Function
   *  - args (?): The arguments to curry.
   *
   *  *Curries* (burns in) arguments to a function, returning a new function
   *  that when called with call the original passing in the curried arguments
   *  (along with any new ones):
   *
   *      function showArguments() {
   *        alert($A(arguments).join(', '));
   *      }
   *      showArguments(1, 2,, 3);
   *      // -> alerts "1, 2, 3"
   *
   *      var f = showArguments.curry(1, 2, 3);
   *      f('a', 'b');
   *      // -> alerts "1, 2, 3, a, b"
   *
   *  [[Function#curry]] works just like [[Function#bind]] without the initial
   *  context argument. Use `bind` if you need to curry arguments _and_ set
   *  context at the same time.
   *
   *  The name "curry" comes from [mathematics](http://en.wikipedia.org/wiki/Currying).
  **/
  function curry() {
    if (!arguments.length) return this;
    var __method = this, args = slice.call(arguments, 0);
    return function() {
      var a = merge(args, arguments);
      return __method.apply(this, a);
    }
  }

  /**
   *  Function#delay(timeout[, args...]) -> Number
   *  - timeout (Number): The time, in seconds, to wait before calling the
   *    function.
   *  - args (?): Optional arguments to pass to the function when calling it.
   *
   *  Schedules the function to run after the specified amount of time, passing
   *  any arguments given.
   *
   *  Behaves much like `window.setTimeout`, but the timeout is in seconds
   *  rather than milliseconds. Returns an integer ID that can be used to
   *  clear the timeout with `window.clearTimeout` before it runs.
   *
   *  To schedule a function to run as soon as the interpreter is idle, use
   *  [[Function#defer]].
   *
   *  ##### Example
   *
   *      function showMsg(msg) {
   *        alert(msg);
   *      }
   *      showMsg.delay(0.1, "Hi there!");
   *      // -> Waits a 10th of a second, then alerts "Hi there!"
  **/
  function delay(timeout) {
    var __method = this, args = slice.call(arguments, 1);
    timeout = timeout * 1000;
    return window.setTimeout(function() {
      return __method.apply(__method, args);
    }, timeout);
  }

  /**
   *  Function#defer(args...) -> Number
   *  - args (?): Optional arguments to pass into the function.
   *
   *  Schedules the function to run as soon as the interpreter is idle.
   *
   *  A "deferred" function will not run immediately; rather, it will run as soon
   *  as the interpreter's call stack is empty.
   *
   *  Behaves much like `window.setTimeout` with a delay set to `0`. Returns an
   *  ID that can be used to clear the timeout with `window.clearTimeout` before
   *  it runs.
   *
   *  ##### Example
   *
   *      function showMsg(msg) {
   *        alert(msg);
   *      }
   *
   *      showMsg("One");
   *      showMsg.defer("Two");
   *      showMsg("Three");
   *      // Alerts "One", then "Three", then (after a brief pause) "Two"
   *      // Note that "Three" happens before "Two"
  **/
  function defer() {
    var args = update([0.01], arguments);
    return this.delay.apply(this, args);
  }

  /**
   *  Function#wrap(wrapper) -> Function
   *  - wrapper (Function): The function to use as a wrapper.
   *
   *  Returns a function "wrapped" around the original function.
   *
   *  [[Function#wrap]] distills the essence of aspect-oriented programming into
   *  a single method, letting you easily build on existing functions by
   *  specifying before and after behavior, transforming the return value, or
   *  even preventing the original function from being called.
   *
   *  The wrapper function is called with this signature:
   *
   *      function wrapper(callOriginal[, args...])
   *
   *  ...where `callOriginal` is a function that can be used to call the
   *  original (wrapped) function (or not, as appropriate). (`callOriginal` is
   *  not a direct reference to the original function, there's a layer of
   *  indirection in-between that sets up the proper context \[`this` value\] for
   *  it.)
   *
   *  ##### Example
   *
   *      // Wrap String#capitalize so it accepts an additional argument
   *      String.prototype.capitalize = String.prototype.capitalize.wrap(
   *        function(callOriginal, eachWord) {
   *          if (eachWord && this.include(" ")) {
   *            // capitalize each word in the string
   *            return this.split(" ").invoke("capitalize").join(" ");
   *          } else {
   *            // proceed using the original function
   *            return callOriginal();
   *          }
   *        });
   *
   *      "hello world".capitalize();
   *      // -> "Hello world" (only the 'H' is capitalized)
   *      "hello world".capitalize(true);
   *      // -> "Hello World" (both 'H' and 'W' are capitalized)
  **/
  function wrap(wrapper) {
    var __method = this;
    return function() {
      var a = update([__method.bind(this)], arguments);
      return wrapper.apply(this, a);
    }
  }

  /**
   *  Function#methodize() -> Function
   *
   *  Wraps the function inside another function that, when called, pushes
   *  `this` to the original function as the first argument (with any further
   *  arguments following it).
   *
   *  The `methodize` method transforms the original function that has an
   *  explicit first argument to a function that passes `this` (the current
   *  context) as an implicit first argument at call time. It is useful when we
   *  want to transform a function that takes an object to a method of that
   *  object or its prototype, shortening its signature by one argument.
   *
   *  ##### Example
   *
   *      // A function that sets a name on a target object
   *      function setName(target, name) {
   *        target.name = name;
   *      }
   *
   *      // Use it
   *      obj = {};
   *      setName(obj, 'Fred');
   *      obj.name;
   *      // -> "Fred"
   *
   *      // Make it a method of the object
   *      obj.setName = setName.methodize();
   *
   *      // Use the method instead
   *      obj.setName('Barney');
   *      obj.name;
   *      // -> "Barney"
   *
   *  The example above is quite simplistic. It's more useful to copy methodized
   *  functions to object prototypes so that new methods are immediately shared
   *  among instances. In the Prototype library, `methodize` is used in various
   *  places such as the DOM module, so that (for instance) you can hide an
   *  element either by calling the static version of `Element.hide` and passing in
   *  an element reference or ID, like so:
   *
   *      Element.hide('myElement');
   *
   *  ...or if you already have an element reference, just calling the
   *  methodized form instead:
   *
   *      myElement.hide();
  **/
  function methodize() {
    if (this._methodized) return this._methodized;
    var __method = this;
    return this._methodized = function() {
      var a = update([this], arguments);
      return __method.apply(null, a);
    };
  }
  
  var extensions = {
    argumentNames:       argumentNames,
    bindAsEventListener: bindAsEventListener,
    curry:               curry,
    delay:               delay,
    defer:               defer,
    wrap:                wrap,
    methodize:           methodize
  };
  
  if (!Function.prototype.bind)
    extensions.bind = bind;

  return extensions;
})());

