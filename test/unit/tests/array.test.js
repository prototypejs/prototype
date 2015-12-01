var globalArgsTest = 'nothing to see here';

suite('Array', function () {
  this.name = 'array';

  test('$A', function () {
    assert.enumEqual([], $A({}));
  });

  test('$A (on arguments)', function () {
    function toArrayOnArguments(){
      globalArgsTest = $A(arguments);
    }
    toArrayOnArguments();
    assert.enumEqual([], globalArgsTest);
    toArrayOnArguments('foo');
    assert.enumEqual(['foo'], globalArgsTest);
    toArrayOnArguments('foo','bar');
    assert.enumEqual(['foo','bar'], globalArgsTest);
  });

  test('$A (on NodeList)', function () {
    // direct HTML
    assert.equal(3, $A($('test_node').childNodes).length);

    // DOM
    var element = document.createElement('div');
    element.appendChild(document.createTextNode('22'));
    (2).times(function(){ element.appendChild(document.createElement('span')); });
    assert.equal(3, $A(element.childNodes).length);

    // HTML String
    element = document.createElement('div');
    $(element).update('22<span></span><span></span');
    assert.equal(3, $A(element.childNodes).length);
  });

  test('$A (on primitive)', function () {
    assert.enumEqual(['a', 'b', 'c'], $A('abc'));
    assert.enumEqual([], $A(''));
    assert.enumEqual([], $A(null));
    assert.enumEqual([], $A(undefined));
    assert.enumEqual([], $A());
    assert.enumEqual([], $A(5));
    assert.enumEqual([], $A(true));
  });

  test('#clear', function () {
    assert.enumEqual([], [].clear());
    assert.enumEqual([], [1].clear());
    assert.enumEqual([], [1,2].clear());
  });

  test('#clone', function () {
    assert.enumEqual([], [].clone());
    assert.enumEqual([1], [1].clone());
    assert.enumEqual([1,2], [1,2].clone());
    assert.enumEqual([0,1,2], [0,1,2].clone());
    var a = [0,1,2];
    var b = a;
    assert.strictEqual(a, b);
    b = a.clone();
    assert.notStrictEqual(a, b);
  });

  test('#first', function () {
    assert.isUndefined([].first());
    assert.equal(1, [1].first());
    assert.equal(1, [1,2].first());
  });

  test('#last', function () {
    assert.isUndefined([].last());
    assert.equal(1, [1].last());
    assert.equal(2, [1,2].last());
  });

  test('#compact', function () {
    assert.enumEqual([],        [].compact());
    assert.enumEqual([1,2,3],   [1,2,3].compact());
    assert.enumEqual([0,1,2,3], [0,null,1,2,undefined,3].compact());
    assert.enumEqual([1,2,3],   [null,1,2,3,null].compact());
  });

  test('#flatten', function () {
    assert.enumEqual([],      [].flatten());
    assert.enumEqual([1,2,3], [1,2,3].flatten());
    assert.enumEqual([1,2,3], [1,[[[2,3]]]].flatten());
    assert.enumEqual([1,2,3], [[1],[2],[3]].flatten());
    assert.enumEqual([1,2,3], [[[[[[[1]]]]]],2,3].flatten());
  });

  test('#indexOf', function () {
    assert.equal(-1, [].indexOf(1));
    assert.equal(-1, [0].indexOf(1));
    assert.equal(0, [1].indexOf(1));
    assert.equal(1, [0,1,2].indexOf(1));
    assert.equal(0, [1,2,1].indexOf(1));
    assert.equal(2, [1,2,1].indexOf(1, -1));
    assert.equal(1, [undefined,null].indexOf(null));

    // ES5 compatibility tests.
    var undef;
    var array = [1, 2, 3, 4, 5, undef, 6, 7, 1, 2, 3];

    assert.equal(2, array.indexOf(3, -47),
     "large negative value for fromIndex");
    assert.equal(10, array.indexOf(3, 4));
    assert.equal(10, array.indexOf(3, -5));
    assert.equal(2, array.indexOf(3, {}),
     "nonsensical value for fromIndex");
    assert.equal(2, array.indexOf(3, ""),
     "nonsensical value for fromIndex");
    assert.equal(-1, array.indexOf(3, 41),
     "fromIndex value larger than the length of the array");
  });

  test('#lastIndexOf', function () {
    assert.equal(-1,[].lastIndexOf(1));
    assert.equal(-1, [0].lastIndexOf(1));
    assert.equal(0, [1].lastIndexOf(1));
    assert.equal(2, [0,2,4,6].lastIndexOf(4));
    assert.equal(3, [4,4,2,4,6].lastIndexOf(4));
    assert.equal(3, [0,2,4,6].lastIndexOf(6,3));
    assert.equal(-1, [0,2,4,6].lastIndexOf(6,2));
    assert.equal(0, [6,2,4,6].lastIndexOf(6,2));

    var fixture = [1,2,3,4,3];
    assert.equal(4, fixture.lastIndexOf(3));
    assert.enumEqual([1,2,3,4,3],fixture);

    //tests from http://developer.mozilla.org/en/docs/Core_JavaScript_1.5_Reference:Objects:Array:lastIndexOf
    var array = [2, 5, 9, 2];
    assert.equal(3,array.lastIndexOf(2));
    assert.equal(-1,array.lastIndexOf(7));
    assert.equal(3,array.lastIndexOf(2,3));
    assert.equal(0,array.lastIndexOf(2,2));
    assert.equal(0,array.lastIndexOf(2,-2));
    assert.equal(3,array.lastIndexOf(2,-1));
  });

  test('#inspect', function () {
    assert.equal('[]',[].inspect());
    assert.equal('[1]',[1].inspect());
    assert.equal('[\'a\']',['a'].inspect());
    assert.equal('[\'a\', 1]',['a',1].inspect());
  });

  test('#intersect', function () {
    assert.enumEqual([1,3], [1,1,3,5].intersect([1,2,3]));
    assert.enumEqual([0,1], [0,1,2].intersect([0,1]));
    assert.enumEqual([1], [1,1].intersect([1,1]));
    assert.enumEqual([], [1,1,3,5].intersect([4]));
    assert.enumEqual([], [1].intersect(['1']));

    assert.enumEqual(
      ['B','C','D'],
      $R('A','Z').toArray().intersect($R('B','D').toArray())
    );
  });

  test('#reverse', function () {
    assert.enumEqual([], [].reverse());
    assert.enumEqual([1], [1].reverse());
    assert.enumEqual([2,1], [1,2].reverse());
    assert.enumEqual([3,2,1], [1,2,3].reverse());
  });

  test('#size', function () {
    assert.equal(4, [0, 1, 2, 3].size());
    assert.equal(0, [].size());
  });

  test('#uniq', function () {
    assert.enumEqual([1], [1, 1, 1].uniq());
    assert.enumEqual([1], [1].uniq());
    assert.enumEqual([], [].uniq());
    assert.enumEqual([0, 1, 2, 3], [0, 1, 2, 2, 3, 0, 2].uniq());
    assert.enumEqual([0, 1, 2, 3], [0, 0, 1, 1, 2, 3, 3, 3].uniq(true));
  });

  test('#without', function () {
    assert.enumEqual([], [].without(0));
    assert.enumEqual([], [0].without(0));
    assert.enumEqual([1], [0,1].without(0));
    assert.enumEqual([1,2], [0,1,2].without(0));
  });

  test('$w', function () {
    assert.enumEqual(['a', 'b', 'c', 'd'], $w('a b c d'));
    assert.enumEqual([], $w(' '));
    assert.enumEqual([], $w(''));
    assert.enumEqual([], $w(null));
    assert.enumEqual([], $w(undefined));
    assert.enumEqual([], $w());
    assert.enumEqual([], $w(10));
    assert.enumEqual(['a'], $w('a'));
    assert.enumEqual(['a'], $w('a '));
    assert.enumEqual(['a'], $w(' a'));
    assert.enumEqual(['a', 'b', 'c', 'd'], $w(' a   b\nc\t\nd\n'));
  });

  test('#concat', function () {
    var x = {};

    assert.strictEqual(1, Array.prototype.concat.length);

    assert.enumEqual(
      [0, 1],
      [0, 1].concat(),
      "test 2"
    );
    assert.strictEqual(2, [0, 1].concat().length, "test 3");

    assert.enumEqual(
      [0, 1, 2, 3, 4],
      [].concat([0, 1], [2, 3, 4]),
      "test 4"
    );
    assert.strictEqual(5, [].concat([0, 1], [2, 3, 4]).length, "test 5");

    assert.enumEqual([0, x, 1, 2, true, "NaN"], [0].concat(x, [1, 2], true, "NaN"), "test 6");
    assert.strictEqual(6, [0].concat(x, [1, 2], true, "NaN").length, "test 7");

    assert.enumEqual([undefined, 1, undefined], [,1].concat([], [,]),
     "concatenation behavior with a trailing comma (1)");
    assert.strictEqual(3, [,1].concat([], [,]).length,
     "concatenation behavior with a trailing comma (2)");

    assert.enumEqual([1], Object.keys([,1].concat([], [,])), "test 10");

    // Check that Array.prototype.concat can be used in a generic way
    x.concat = Array.prototype.concat;
    assert.enumEqual([x], x.concat());
    assert.strictEqual(1, x.concat().length);

    // Checking an edge case
    var arr = []; arr[2] = true;
    assert.enumEqual([undefined, undefined, true], [].concat(arr));
    assert.strictEqual(3, [].concat(arr).length);
    assert.enumEqual([2], Object.keys([].concat(arr)));

    var args = (function() { return [].concat(arguments); })(1, 2);
    assert.strictEqual(1, args[0][0]);
  });

  test('#each (on sparse arrays)', function () {
    var counter = 0;

    var sparseArray = [0, 1];
    sparseArray[5] = 5;
    sparseArray.each( function(item) { counter++; });

    assert.equal(3, counter, "Array#each should skip nonexistent keys in an array");
  });

  test('#map', function () {
    assert.enumEqual([1,2,3], [1,2,3].map());
    assert.enumEqual([2,4,6], [1,2,3].map(function(x) { return x * 2; }));

    var x = [1,2,3,4];
    delete x[1];
    delete x[3];
    assert.enumEqual([1, undefined, 3, undefined], x.map());
    assert.strictEqual(4, x.map().length);

    var traversed = [];
    x.map(function(val) {
      traversed.push(val);
    });
    assert.enumEqual([1, 3], traversed);
    assert.strictEqual(2, traversed.length);
  });

  test('#map (used as generic)', function () {
    var result = Array.prototype.map.call({0:0, 1:1, length:2});
    assert.enumEqual([0, 1], result);
  });

  test('#findAll', function () {
    assert.enumEqual([2, 4, 6], [1, 2, 3, 4, 5, 6].findAll(function(x) {
      return (x % 2) == 0;
    }));

    var x = [1,2,3], traversed = [];
    delete x[1];
    x.findAll(function(val) { traversed.push(val); });
    assert.enumEqual([1, 3], traversed);
    assert.strictEqual(2, traversed.length);
  });

  test('#findAll (used as generic)', function () {
    var result = Array.prototype.findAll.call({0:0, 1:1, length:2}, function(x) {
      return x === 1;
    });
    assert.enumEqual([1], result);
  });

  test('#any', function () {
    assert(!([].any()));

    assert([true, true, true].any());
    assert([true, false, false].any());
    assert(![false, false, false].any());

    assert([1,2,3,4,5].any(function(value) {
      return value > 2;
    }));
    assert(![1,2,3,4,5].any(function(value) {
      return value > 5;
    }));

    var x = [1,2,3], traversed = [];
    delete x[1];
    x.any(function(val) { traversed.push(val); });
    assert.enumEqual([1, 3], traversed);
    assert.strictEqual(2, traversed.length);
  });

  test('#any (used as generic)', function () {
    assert(Array.prototype.any.call({ 0:false, 1:true, length:2 }));
    assert(!Array.prototype.any.call({ 0:false, 1:false, length:2 }));
  });

  test('#all', function () {
    assert([].all());

    assert([true, true, true].all());
    assert(![true, false, false].all());
    assert(![false, false, false].all());

    assert([1,2,3,4,5].all(function(value) {
      return value > 0;
    }));
    assert(![1,2,3,4,5].all(function(value) {
      return value > 1;
    }));

    var x = [1,2,3], traversed = [];
    delete x[1];
    x.all(function(val) { traversed.push(val); return true; });
    assert.enumEqual([1, 3], traversed);
    assert.strictEqual(2, traversed.length);
  });

  test('#all (used as generic)', function () {
    assert(Array.prototype.all.call({ 0:true, 1:true, length:2 }));
    assert(!Array.prototype.all.call({ 0:false, 1:true, length:2 }));
  });

  test('#entries (should be either nonexistent or native)', function () {
    assert(Array.prototype.entries !== Enumerable.entries);
  });

});
