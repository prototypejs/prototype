var Person = function(name){
    this.name = name;
};

Person.prototype.toJSON = function() {
  return '-' + this.name;
};

///

suite('Object', function () {
  this.name = 'object';

  test('.extend', function () {
    var object = {foo: 'foo', bar: [1, 2, 3]};
    assert.strictEqual(object, Object.extend(object));
    assert.hashEqual({foo: 'foo', bar: [1, 2, 3]}, object);
    assert.strictEqual(object, Object.extend(object, {bla: 123}));
    assert.hashEqual({foo: 'foo', bar: [1, 2, 3], bla: 123}, object);
    assert.hashEqual({foo: 'foo', bar: [1, 2, 3], bla: null},
      Object.extend(object, {bla: null}));
  });

  test('.toQueryString', function () {
    assert.equal('a=A&b=B&c=C&d=D%23', Object.toQueryString({a: 'A', b: 'B', c: 'C', d: 'D#'}));
  });

  test('.clone', function () {
    var object = {foo: 'foo', bar: [1, 2, 3]};
    assert.notStrictEqual(object, Object.clone(object));
    assert.hashEqual(object, Object.clone(object));
    assert.hashEqual({}, Object.clone());
    var clone = Object.clone(object);
    delete clone.bar;
    assert.hashEqual({foo: 'foo'}, clone,
      "Optimizing Object.clone perf using prototyping doesn't allow properties to be deleted.");
  });

  test('.keys', function () {
    assert.enumEqual([], Object.keys({}));
    assert.enumEqual(['bar', 'foo'], Object.keys({foo: 'foo', bar: 'bar'}).sort());
    function Foo() { this.bar = 'bar'; }
    Foo.prototype.foo = 'foo';
    assert.enumEqual(['bar'], Object.keys(new Foo()));
    assert.raise('TypeError', function(){ Object.keys(); });

    var obj = {
      foo: 'bar',
      baz: 'thud',
      toString: function() { return '1'; },
      valueOf:  function() { return  1;  }
    };

    assert.equal(4, Object.keys(obj).length, 'DontEnum properties should be included in Object.keys');
  });

  test('.inspect', function () {
    assert.equal('undefined', Object.inspect());
    assert.equal('undefined', Object.inspect(undefined));
    assert.equal('null', Object.inspect(null));
    assert.equal("'foo\\\\b\\\'ar'", Object.inspect('foo\\b\'ar'));
    assert.equal('[]', Object.inspect([]));
    assert.nothingRaised(function() { Object.inspect(window.Node); });
  });

  test('.toJSON', function () {
    assert.isUndefined(Object.toJSON(undefined));
    assert.isUndefined(Object.toJSON(Prototype.K));
    assert.equal('\"\"', Object.toJSON(''));
    assert.equal('\"test\"', Object.toJSON('test'));
    assert.equal('null', Object.toJSON(Number.NaN));
    assert.equal('0', Object.toJSON(0));
    assert.equal('-293', Object.toJSON(-293));
    assert.equal('[]', Object.toJSON([]));
    assert.equal('[\"a\"]', Object.toJSON(['a']));
    assert.equal('[\"a\",1]', Object.toJSON(['a', 1]));
    assert.equal('[\"a\",{\"b\":null}]', Object.toJSON(['a', {'b': null}]));
    assert.equal('{\"a\":\"hello!\"}', Object.toJSON({a: 'hello!'}));
    assert.equal('{}', Object.toJSON({}));
    assert.equal('{}', Object.toJSON({a: undefined, b: undefined, c: Prototype.K}));
    assert.equal('{\"b\":[null,false,true,null],\"c\":{\"a\":\"hello!\"}}',
      Object.toJSON({'b': [undefined, false, true, undefined], c: {a: 'hello!'}}));
    assert.equal('{\"b\":[null,false,true,null],\"c\":{\"a\":\"hello!\"}}',
      Object.toJSON($H({'b': [undefined, false, true, undefined], c: {a: 'hello!'}})));
    assert.equal('true', Object.toJSON(true));
    assert.equal('false', Object.toJSON(false));
    assert.equal('null', Object.toJSON(null));
    var sam = new Person('sam');
    assert.equal('"-sam"', Object.toJSON(sam));
  });

  test('.toHTML', function () {
    assert.strictEqual('', Object.toHTML());
    assert.strictEqual('', Object.toHTML(''));
    assert.strictEqual('', Object.toHTML(null));
    assert.strictEqual('0', Object.toHTML(0));
    assert.strictEqual('123', Object.toHTML(123));
    assert.equal('hello world', Object.toHTML('hello world'));
    assert.equal('hello world', Object.toHTML({toHTML: function() { return 'hello world'; }}));
  });

  test('.isArray', function () {
    assert(Object.isArray([]));
    assert(Object.isArray([0]));
    assert(Object.isArray([0, 1]));
    assert(!Object.isArray({}));
    assert(!Object.isArray($('object-test-list').childNodes));
    assert(!Object.isArray());
    assert(!Object.isArray(''));
    assert(!Object.isArray('foo'));
    assert(!Object.isArray(0));
    assert(!Object.isArray(1));
    assert(!Object.isArray(null));
    assert(!Object.isArray(true));
    assert(!Object.isArray(false));
    assert(!Object.isArray(undefined));
  });

  test('.isHash', function () {
    assert(Object.isHash($H()));
    assert(Object.isHash(new Hash()));
    assert(!Object.isHash({}));
    assert(!Object.isHash(null));
    assert(!Object.isHash());
    assert(!Object.isHash(''));
    assert(!Object.isHash(2));
    assert(!Object.isHash(false));
    assert(!Object.isHash(true));
    assert(!Object.isHash([]));
  });

  test('.isElement', function () {
    assert(Object.isElement(document.createElement('div')));
    assert(Object.isElement(new Element('div')));
    assert(Object.isElement($('object-test')));
    assert(!Object.isElement(document.createTextNode('bla')));

    // falsy variables should not mess up return value type
    assert.strictEqual(false, Object.isElement(0));
    assert.strictEqual(false, Object.isElement(''));
    assert.strictEqual(false, Object.isElement(NaN));
    assert.strictEqual(false, Object.isElement(null));
    assert.strictEqual(false, Object.isElement(undefined));
  });

  test('.isFunction', function () {
    assert(Object.isFunction(function() { }));
    assert(Object.isFunction(Class.create()));

    assert(!Object.isFunction("a string"));
    assert(!Object.isFunction($(document.createElement('div'))));
    assert(!Object.isFunction([]));
    assert(!Object.isFunction({}));
    assert(!Object.isFunction(0));
    assert(!Object.isFunction(false));
    assert(!Object.isFunction(undefined));
    assert(!Object.isFunction(/xyz/), 'regular expressions are not functions');
  });

  test('.isString', function () {
    assert(!Object.isString(function() { }));
    assert(Object.isString("a string"));
    assert(Object.isString(new String("a string")));
    assert(!Object.isString(0));
    assert(!Object.isString([]));
    assert(!Object.isString({}));
    assert(!Object.isString(false));
    assert(!Object.isString(undefined));
    assert(!Object.isString(document), 'host objects should return false rather than throw exceptions');
  });

  test('.isNumber', function () {
    assert(Object.isNumber(0));
    assert(Object.isNumber(1.0));
    assert(Object.isNumber(new Number(0)));
    assert(Object.isNumber(new Number(1.0)));
    assert(!Object.isNumber(function() { }));
    assert(!Object.isNumber({ test: function() { return 3; } }));
    assert(!Object.isNumber("a string"));
    assert(!Object.isNumber([]));
    assert(!Object.isNumber({}));
    assert(!Object.isNumber(false));
    assert(!Object.isNumber(undefined));
    assert(!Object.isNumber(document), 'host objects should return false rather than throw exceptions');
  });

  test('.isDate', function () {
    var d = new Date();
    assert(Object.isDate(d), 'constructor with no arguments');
    assert(Object.isDate(new Date(0)), 'constructor with milliseconds');
    assert(Object.isDate(new Date(1995, 11, 17)), 'constructor with Y, M, D');
    assert(Object.isDate(new Date(1995, 11, 17, 3, 24, 0)), 'constructor with Y, M, D, H, M, S');
    assert(Object.isDate(new Date(Date.parse("Dec 25, 1995"))), 'constructor with result of Date.parse');

    assert(!Object.isDate(d.valueOf()), 'Date#valueOf returns a number');
    assert(!Object.isDate(function() { }));
    assert(!Object.isDate(0));
    assert(!Object.isDate("a string"));
    assert(!Object.isDate([]));
    assert(!Object.isDate({}));
    assert(!Object.isDate(false));
    assert(!Object.isDate(undefined));
    assert(!Object.isDate(document), 'host objects should return false rather than throw exceptions');
  });

  test('.isUndefined', function () {
    assert(Object.isUndefined(undefined));
    assert(!Object.isUndefined(null));
    assert(!Object.isUndefined(false));
    assert(!Object.isUndefined(0));
    assert(!Object.isUndefined(""));
    assert(!Object.isUndefined(function() { }));
    assert(!Object.isUndefined([]));
    assert(!Object.isUndefined({}));
  });

  test('should not extend Object.prototype', function () {
    // for-in is supported with objects
    var iterations = 0, obj = { a: 1, b: 2, c: 3 }, property;
    for (property in obj) iterations++;
    assert.equal(3, iterations);

    // for-in is not supported with arrays
    iterations = 0;
    var arr = [1,2,3];
    for (property in arr) iterations++;
    assert(iterations > 3);
  });


});
