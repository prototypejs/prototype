Fixtures.Hash = {
  one: { a: 'A#' },

  many: {
    a: 'A',
    b: 'B',
    c: 'C',
    d: 'D#'
  },

  functions: {
    quad: function(n) { return n*n; },
    plus: function(n) { return n+n; }
  },

  multiple:         { color: $w('r g b') },
  multiple_nil:     { color: ['r', null, 'g', undefined, 0] },
  multiple_all_nil: { color: [null, undefined] },
  multiple_empty:   { color: [] },
  multiple_special: { 'stuff[]': $w('$ a ;') },

  value_undefined:  { a:"b", c:undefined },
  value_null:       { a:"b", c:null },
  value_zero:       { a:"b", c:0 }
};


///


suite('Hash', function () {
  this.name = 'hash';

  test('#set', function () {
    var h = $H({a: 'A'});

    assert.equal('B', h.set('b', 'B'));
    assert.hashEqual({a: 'A', b: 'B'}, h);

    assert.isUndefined(h.set('c'));
    assert.hashEqual({a: 'A', b: 'B', c: undefined}, h);
  });

  test('#get', function () {
    var h = $H({a: 'A'});
    assert.equal('A', h.get('a'));
    assert.isUndefined(h.a);
    assert.isUndefined($H({}).get('a'));

    assert.isUndefined($H({}).get('toString'));
    assert.isUndefined($H({}).get('constructor'));
  });

  test('#unset', function () {
    var hash = $H(Fixtures.Hash.many);
    assert.equal('B', hash.unset('b'));
    assert.hashEqual({a:'A', c: 'C', d:'D#'}, hash);
    assert.isUndefined(hash.unset('z'));
    assert.hashEqual({a:'A', c: 'C', d:'D#'}, hash);
    // not equivalent to Hash#remove
    assert.equal('A', hash.unset('a', 'c'));
    assert.hashEqual({c: 'C', d:'D#'}, hash);
  });

  test('#toObject', function () {
    var hash = $H(Fixtures.Hash.many), object = hash.toObject();
    assert.isInstanceOf(object, Object);
    assert.hashEqual(Fixtures.Hash.many, object);
    assert.notStrictEqual(Fixtures.Hash.many, object);
    hash.set('foo', 'bar');
    assert.hashNotEqual(object, hash.toObject());
  });

  test('new Hash', function () {
    var object = Object.clone(Fixtures.Hash.one);
    var h = new Hash(object), h2 = $H(object);
    assert.isInstanceOf(h, Hash);
    assert.isInstanceOf(h2, Hash);

    assert.hashEqual({}, new Hash());
    assert.hashEqual(object, h);
    assert.hashEqual(object, h2);

    h.set('foo', 'bar');
    assert.hashNotEqual(object, h);

    var clone = $H(h);
    assert.isInstanceOf(clone, Hash);
    assert.hashEqual(h, clone);
    h.set('foo', 'foo');
    assert.hashNotEqual(h, clone);
    assert.strictEqual($H, Hash.from);
  });

  test('#keys', function () {
    assert.enumEqual([],               $H({}).keys());
    assert.enumEqual(['a'],            $H(Fixtures.Hash.one).keys());
    assert.enumEqual($w('a b c d'),    $H(Fixtures.Hash.many).keys().sort());
    assert.enumEqual($w('plus quad'),  $H(Fixtures.Hash.functions).keys().sort());
  });

  test('#values', function () {
    assert.enumEqual([],             $H({}).values());
    assert.enumEqual(['A#'],         $H(Fixtures.Hash.one).values());
    assert.enumEqual($w('A B C D#'), $H(Fixtures.Hash.many).values().sort());
    assert.enumEqual($w('function function'),
      $H(Fixtures.Hash.functions).values().map(function(i){ return typeof i; }));
    assert.equal(9, $H(Fixtures.Hash.functions).get('quad')(3));
    assert.equal(6, $H(Fixtures.Hash.functions).get('plus')(3));
  });

  test('#index', function () {
    assert.isUndefined($H().index('foo'));

    assert('a', $H(Fixtures.Hash.one).index('A#'));
    assert('a', $H(Fixtures.Hash.many).index('A'));
    assert.isUndefined($H(Fixtures.Hash.many).index('Z'));

    var hash = $H({a:1,b:'2',c:1});
    assert(['a','c'].include(hash.index(1)));
    assert.isUndefined(hash.index('1'));
  });

  test('#merge', function () {
    var h = $H(Fixtures.Hash.many);
    assert.notStrictEqual(h, h.merge());
    assert.notStrictEqual(h, h.merge({}));
    assert.isInstanceOf(h.merge(), Hash);
    assert.isInstanceOf(h.merge({}), Hash);
    assert.hashEqual(h, h.merge());
    assert.hashEqual(h, h.merge({}));
    assert.hashEqual(h, h.merge($H()));
    assert.hashEqual({a:'A',  b:'B', c:'C', d:'D#', aaa:'AAA' }, h.merge({aaa: 'AAA'}));
    assert.hashEqual({a:'A#', b:'B', c:'C', d:'D#' }, h.merge(Fixtures.Hash.one));
  });

  test('#update', function () {
    var h = $H(Fixtures.Hash.many);
    assert.strictEqual(h, h.update());
    assert.strictEqual(h, h.update({}));
    assert.hashEqual(h, h.update());
    assert.hashEqual(h, h.update({}));
    assert.hashEqual(h, h.update($H()));
    assert.hashEqual({a:'A',  b:'B', c:'C', d:'D#', aaa:'AAA' }, h.update({aaa: 'AAA'}));
    assert.hashEqual({a:'A#', b:'B', c:'C', d:'D#', aaa:'AAA' }, h.update(Fixtures.Hash.one));
  });

  test('#toQueryString', function () {
    assert.equal('',                   $H({}).toQueryString());
    assert.equal('a%23=A',             $H({'a#': 'A'}).toQueryString());
    assert.equal('a=A%23',             $H(Fixtures.Hash.one).toQueryString());
    assert.equal('a=A&b=B&c=C&d=D%23', $H(Fixtures.Hash.many).toQueryString());
    assert.equal("a=b&c",              $H(Fixtures.Hash.value_undefined).toQueryString());
    assert.equal("a=b&c",              $H("a=b&c".toQueryParams()).toQueryString());
    assert.equal("a=b+d&c",            $H("a=b+d&c".toQueryParams()).toQueryString());
    assert.equal("a=b&c=",             $H(Fixtures.Hash.value_null).toQueryString());
    assert.equal("a=b&c=0",            $H(Fixtures.Hash.value_zero).toQueryString());
    assert.equal("color=r&color=g&color=b", $H(Fixtures.Hash.multiple).toQueryString());
    assert.equal("color=r&color=&color=g&color&color=0", $H(Fixtures.Hash.multiple_nil).toQueryString());
    assert.equal("color=&color",       $H(Fixtures.Hash.multiple_all_nil).toQueryString());
    assert.equal("",                   $H(Fixtures.Hash.multiple_empty).toQueryString());
    assert.equal("",                   $H({foo: {}, bar: {}}).toQueryString());
    assert.equal("stuff%5B%5D=%24&stuff%5B%5D=a&stuff%5B%5D=%3B", $H(Fixtures.Hash.multiple_special).toQueryString());
    assert.hashEqual(Fixtures.Hash.multiple_special, $H(Fixtures.Hash.multiple_special).toQueryString().toQueryParams());
    assert.strictEqual(Object.toQueryString, Hash.toQueryString);

    // Serializing newlines and spaces is weird. See:
    // http://www.w3.org/TR/1999/REC-html401-19991224/interact/forms.html#h-17.13.4.1
    var complex = "an arbitrary line\n\'something in single quotes followed by a newline\'\r\n" +
     "and more text eventually";
    var queryString = $H({ val: complex }).toQueryString();
    var expected = "val=an+arbitrary+line%0D%0A'something+in+single+quotes+followed+by+a+" +
     "newline'%0D%0Aand+more+text+eventually";
    assert.equal(expected, queryString, "newlines and spaces should be properly encoded");
  });

  test('#inspect', function () {
    assert.equal('#<Hash:{}>',              $H({}).inspect());
    assert.equal("#<Hash:{'a': 'A#'}>",     $H(Fixtures.Hash.one).inspect());
    assert.equal("#<Hash:{'a': 'A', 'b': 'B', 'c': 'C', 'd': 'D#'}>", $H(Fixtures.Hash.many).inspect());
  });

  test('#clone', function () {
    var h = $H(Fixtures.Hash.many);
    assert.hashEqual(h, h.clone());
    assert.isInstanceOf(h.clone(), Hash);
    assert.notStrictEqual(h, h.clone());
  });

  test('#toJSON', function () {
    assert.equal('{\"b\":[null,false,true,null],\"c\":{\"a\":\"hello!\"}}',
      Object.toJSON({b: [undefined, false, true, undefined], c: {a: 'hello!'}}));
  });

  test('ability to contain any key', function () {
    var h = $H({ _each: 'E', map: 'M', keys: 'K', pluck: 'P', unset: 'U' });
    assert.enumEqual($w('_each keys map pluck unset'), h.keys().sort());
    assert.equal('U', h.unset('unset'));
    assert.hashEqual({ _each: 'E', map: 'M', keys: 'K', pluck: 'P' }, h);
  });

  test('#toTemplateReplacements', function () {
    var template = new Template("#{a} #{b}"), hash = $H({ a: "hello", b: "world" });
    assert.equal("hello world", template.evaluate(hash.toObject()));
    assert.equal("hello world", template.evaluate(hash));
    assert.equal("hello", "#{a}".interpolate(hash));
  });

  test("don't iterate over shadowed properties", function () {
    // redundant now that object is systematically cloned.
    var FooMaker = function(value) {
      this.key = value;
    };
    FooMaker.prototype.key = 'foo';
    var foo = new FooMaker('bar');
    assert.equal("key=bar", new Hash(foo).toQueryString());
    assert.equal("key=bar", new Hash(new Hash(foo)).toQueryString());
  });

  test('#each', function () {
    var h = $H({a:1, b:2});
    var result = [];
    h.each(function(kv, i){
      result.push(i);
    });
   assert.enumEqual([0,1], result);
  });


});










