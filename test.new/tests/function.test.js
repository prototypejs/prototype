var arg1 = 1;
var arg2 = 2;
var arg3 = 3;
function TestObj() { };
TestObj.prototype.assertingEventHandler =
  function(event, assertEvent, assert1, assert2, assert3, a1, a2, a3) {
    assertEvent(event);
    assert1(a1);
    assert2(a2);
    assert3(a3);
  };

var globalBindTest = null;

///

var undefined;

suite('Function', function () {

  this.name = 'function';

  test('#argumentNames', function () {
    assert.enumEqual([], (function() {}).argumentNames());
    assert.enumEqual(["one"], (function(one) {}).argumentNames());
    assert.enumEqual(["one", "two", "three"], (function(one, two, three) {}).argumentNames());
    assert.enumEqual(["one", "two", "three"], (function(  one  , two
       , three   ) {}).argumentNames());
    assert.equal("$super", (function($super) {}).argumentNames().first());
    function named1() {};
    assert.enumEqual([], named1.argumentNames());
    function named2(one) {};
    assert.enumEqual(["one"], named2.argumentNames());
    function named3(one, two, three) {};
    assert.enumEqual(["one", "two", "three"], named3.argumentNames());
    function named4(one,
      two,

      three) {}
    assert.enumEqual($w('one two three'), named4.argumentNames());
    function named5(/*foo*/ foo, /* bar */ bar, /*****/ baz) {}
    assert.enumEqual($w("foo bar baz"), named5.argumentNames());
    function named6(
      /*foo*/ foo,
      /**/bar,
      /* baz */ /* baz */ baz,
      // Skip a line just to screw with the regex...
      /* thud */ thud) {}
    assert.enumEqual($w("foo bar baz thud"), named6.argumentNames());
  });

  test('#bind', function () {
    function methodWithoutArguments() { return this.hi; }
    function methodWithArguments()    { return this.hi + ',' + $A(arguments).join(','); }
    function methodReturningContext() { return this; }
    var func = Prototype.emptyFunction;
    var u;

    // We used to test that `bind` without a `context` argument simply
    // returns the original function, but this contradicts the ES5 spec.

    assert.notStrictEqual(func, func.bind(null));

    assert.equal('without', methodWithoutArguments.bind({ hi: 'without' })());
    assert.equal('with,arg1,arg2', methodWithArguments.bind({ hi: 'with' })('arg1','arg2'));
    assert.equal('withBindArgs,arg1,arg2',
      methodWithArguments.bind({ hi: 'withBindArgs' }, 'arg1', 'arg2')());
    assert.equal('withBindArgsAndArgs,arg1,arg2,arg3,arg4',
      methodWithArguments.bind({ hi: 'withBindArgsAndArgs' }, 'arg1', 'arg2')('arg3', 'arg4'));

    assert.equal(window, methodReturningContext.bind(null)(), 'null has window as its context');
    assert.equal(window, methodReturningContext.bind(u)(), 'undefined has window as its context');
    assert.equal('', methodReturningContext.bind('')(), 'other falsy values should not have window as their context');


    // Ensure that bound functions ignore their `context` when used as
    // constructors. Taken from example at:
    // https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Function/bind
    function Point(x, y) {
      this.x = x;
      this.y = y;
    }

    Point.prototype.toString = function() {
      return this.x + "," + this.y;
    };

    var p = new Point(1, 2);
    p.toString(); // "1,2"

    var emptyObj = {};
    var YAxisPoint = Point.bind(emptyObj, 0 /* x */);

    var axisPoint = new YAxisPoint(5);
    axisPoint.toString(); //  "0,5"

    assert.equal("0,5", axisPoint.toString(),
     "bound constructor should ignore context and curry properly");

    assert(axisPoint instanceof Point,
     "should be an instance of Point");
    assert(axisPoint instanceof YAxisPoint,
     "should be an instance of YAxisPoint");
  });

  test('#curry', function () {
    var split = function(delimiter, string) { return string.split(delimiter); };
    var splitOnColons = split.curry(":");
    assert.notStrictEqual(split, splitOnColons);
    assert.enumEqual(split(":", "0:1:2:3:4:5"), splitOnColons("0:1:2:3:4:5"));
    assert.strictEqual(split, split.curry());
  });

  test('#delay', function (done) {
    window.delayed = undefined;
    var delayedFunction = function() { window.delayed = true; };
    var delayedFunctionWithArgs = function() { window.delayedWithArgs = $A(arguments).join(' '); };
    delayedFunction.delay(0.8);
    delayedFunctionWithArgs.delay(0.8, 'hello', 'world');
    assert.isUndefined(window.delayed);
    wait(1000, done, function() {
      assert(window.delayed);
      assert.equal('hello world', window.delayedWithArgs);
      done();
    });
  });

  test('#wrap', function () {
    function sayHello(){
      return 'hello world';
    };

    assert.equal('HELLO WORLD', sayHello.wrap(function(proceed) {
      return proceed().toUpperCase();
    })());

    var temp = String.prototype.capitalize;
    String.prototype.capitalize = String.prototype.capitalize.wrap(function(proceed, eachWord) {
      if(eachWord && this.include(' ')) return this.split(' ').map(function(str){
        return str.capitalize();
      }).join(' ');
      return proceed();
    });
    assert.equal('Hello world', 'hello world'.capitalize());
    assert.equal('Hello World', 'hello world'.capitalize(true));
    assert.equal('Hello', 'hello'.capitalize());
    String.prototype.capitalize = temp;
  });

  test('#defer', function (done) {
    window.deferred = undefined;
    var deferredFunction = function() { window.deferred = true; };
    deferredFunction.defer();
    assert.isUndefined(window.deferred);
    wait(50, done, function() {
      assert(window.deferred);

      window.deferredValue = 0;
      var deferredFunction2 = function(arg) { window.deferredValue = arg; };
      deferredFunction2.defer('test');
      wait(50, done, function() {
        assert.equal('test', window.deferredValue);

        window.deferBoundProperly = false;

        var obj = { foo: 'bar' };
        var func = function() {
          if ('foo' in this) window.deferBoundProperly = true;
        };

        func.bind(obj).defer();

        wait(50, done, function() {
          assert(window.deferBoundProperly,
           "deferred bound functions should preserve original scope");

          window.deferBoundProperlyOnString = false;
          var str = "<script>window.deferBoundProperlyOnString = true;</script>"

          str.evalScripts.bind(str).defer();

          wait(50, done, function() {
            assert(window.deferBoundProperlyOnString);
            done();
          });
        });
      });
    });
  });

  test('#methodize', function () {
    var Foo = { bar: function(baz) { return baz; } };
    var baz = { quux: Foo.bar.methodize() };

    assert.equal(Foo.bar.methodize(), baz.quux);
    assert.equal(baz, Foo.bar(baz));
    assert.equal(baz, baz.quux());
  });

  test('#bindAsEventListener', function () {
    for (var i = 0; i < 10; ++i){
      var div = document.createElement('div');
      div.setAttribute('id','test-'+i);
      document.body.appendChild(div);
      var tobj = new TestObj();
      var eventTest = { test: true };
      var call = tobj.assertingEventHandler.bindAsEventListener(tobj,
        assert.equal.bind(assert, eventTest),
        assert.equal.bind(assert, arg1),
        assert.equal.bind(assert, arg2),
        assert.equal.bind(assert, arg3), arg1, arg2, arg3 );
      call(eventTest);
    }
  });

});
