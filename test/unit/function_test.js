new Test.Unit.Runner({
  testFunctionArgumentNames: function() {
    this.assertEnumEqual([], (function() {}).argumentNames());
    this.assertEnumEqual(["one"], (function(one) {}).argumentNames());
    this.assertEnumEqual(["one", "two", "three"], (function(one, two, three) {}).argumentNames());
    this.assertEnumEqual(["one", "two", "three"], (function(  one  , two
       , three   ) {}).argumentNames());
    this.assertEqual("$super", (function($super) {}).argumentNames().first());

    function named1() {};
    this.assertEnumEqual([], named1.argumentNames());
    function named2(one) {};
    this.assertEnumEqual(["one"], named2.argumentNames());
    function named3(one, two, three) {};
    this.assertEnumEqual(["one", "two", "three"], named3.argumentNames());
    function named4(one,
      two,

      three) {}
    this.assertEnumEqual($w('one two three'), named4.argumentNames());
    function named5(/*foo*/ foo, /* bar */ bar, /*****/ baz) {}
    this.assertEnumEqual($w("foo bar baz"), named5.argumentNames());
    function named6(
      /*foo*/ foo,
      /**/bar,
      /* baz */ /* baz */ baz,
      // Skip a line just to screw with the regex...
      /* thud */ thud) {}
    this.assertEnumEqual($w("foo bar baz thud"), named6.argumentNames());
  },

  testFunctionBind: function() {
    function methodWithoutArguments() { return this.hi; }
    function methodWithArguments()    { return this.hi + ',' + $A(arguments).join(','); }
    function methodReturningContext() { return this; }
    var func = Prototype.emptyFunction;
    var u;
    
    // We used to test that `bind` without a `context` argument simply
    // returns the original function, but this contradicts the ES5 spec.

    this.assertNotIdentical(func, func.bind(null));

    this.assertEqual('without', methodWithoutArguments.bind({ hi: 'without' })());
    this.assertEqual('with,arg1,arg2', methodWithArguments.bind({ hi: 'with' })('arg1','arg2'));
    this.assertEqual('withBindArgs,arg1,arg2',
      methodWithArguments.bind({ hi: 'withBindArgs' }, 'arg1', 'arg2')());
    this.assertEqual('withBindArgsAndArgs,arg1,arg2,arg3,arg4',
      methodWithArguments.bind({ hi: 'withBindArgsAndArgs' }, 'arg1', 'arg2')('arg3', 'arg4'));

    this.assertEqual(window, methodReturningContext.bind(null)(), 'null has window as its context');
    this.assertEqual(window, methodReturningContext.bind(u)(), 'undefined has window as its context');
    this.assertEqual('', methodReturningContext.bind('')(), 'other falsy values should not have window as their context');
      
    
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
    
    this.assertEqual("0,5", axisPoint.toString(),
     "bound constructor should ignore context and curry properly");
    
    this.assert(axisPoint instanceof Point,
     "should be an instance of Point");
    this.assert(axisPoint instanceof YAxisPoint,
     "should be an instance of YAxisPoint");
  },

  testFunctionCurry: function() {
    var split = function(delimiter, string) { return string.split(delimiter); };
    var splitOnColons = split.curry(":");
    this.assertNotIdentical(split, splitOnColons);
    this.assertEnumEqual(split(":", "0:1:2:3:4:5"), splitOnColons("0:1:2:3:4:5"));
    this.assertIdentical(split, split.curry());
  },

  testFunctionDelay: function() {
    window.delayed = undefined;
    var delayedFunction = function() { window.delayed = true; };
    var delayedFunctionWithArgs = function() { window.delayedWithArgs = $A(arguments).join(' '); };
    delayedFunction.delay(0.8);
    delayedFunctionWithArgs.delay(0.8, 'hello', 'world');
    this.assertUndefined(window.delayed);
    this.wait(1000, function() {
      this.assert(window.delayed);
      this.assertEqual('hello world', window.delayedWithArgs);
    });
  },

  testFunctionWrap: function() {
    function sayHello(){
      return 'hello world';
    };

    this.assertEqual('HELLO WORLD', sayHello.wrap(function(proceed) {
      return proceed().toUpperCase();
    })());

    var temp = String.prototype.capitalize;
    String.prototype.capitalize = String.prototype.capitalize.wrap(function(proceed, eachWord) {
      if(eachWord && this.include(' ')) return this.split(' ').map(function(str){
        return str.capitalize();
      }).join(' ');
      return proceed();
    });
    this.assertEqual('Hello world', 'hello world'.capitalize());
    this.assertEqual('Hello World', 'hello world'.capitalize(true));
    this.assertEqual('Hello', 'hello'.capitalize());
    String.prototype.capitalize = temp;
  },

  testFunctionDefer: function() {
    window.deferred = undefined;
    var deferredFunction = function() { window.deferred = true; };
    deferredFunction.defer();
    this.assertUndefined(window.deferred);
    this.wait(50, function() {
      this.assert(window.deferred);

      window.deferredValue = 0;
      var deferredFunction2 = function(arg) { window.deferredValue = arg; };
      deferredFunction2.defer('test');
      this.wait(50, function() {
        this.assertEqual('test', window.deferredValue);
        
        window.deferBoundProperly = false;
    
        var obj = { foo: 'bar' };
        var func = function() {
          if ('foo' in this) window.deferBoundProperly = true;
        };
    
        func.bind(obj).defer();
    
        this.wait(50, function() {
          this.assert(window.deferBoundProperly,
           "deferred bound functions should preserve original scope");
           
          window.deferBoundProperlyOnString = false;
          var str = "<script>window.deferBoundProperlyOnString = true;</script>"
          
          str.evalScripts.bind(str).defer();
          
          this.wait(50, function() {
            this.assert(window.deferBoundProperlyOnString);
          });
          
        });
        
      });
    });
    

  },

  testFunctionMethodize: function() {
    var Foo = { bar: function(baz) { return baz } };
    var baz = { quux: Foo.bar.methodize() };

    this.assertEqual(Foo.bar.methodize(), baz.quux);
    this.assertEqual(baz, Foo.bar(baz));
    this.assertEqual(baz, baz.quux());
  },

  testBindAsEventListener: function() {
    for( var i = 0; i < 10; ++i ){
      var div = document.createElement('div');
      div.setAttribute('id','test-'+i);
      document.body.appendChild(div);
      var tobj = new TestObj();
      var eventTest = { test: true };
      var call = tobj.assertingEventHandler.bindAsEventListener(tobj,
        this.assertEqual.bind(this, eventTest),
        this.assertEqual.bind(this, arg1),
        this.assertEqual.bind(this, arg2),
        this.assertEqual.bind(this, arg3), arg1, arg2, arg3 );
      call(eventTest);
    }
  }
});