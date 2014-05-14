var globalArgsTest = 'nothing to see here';

suite('Array', function() {
  this.timeout(0);
  this.name = 'array';


  test('$A({}) should equal []', function() {
    assert.deepEqual([], $A({}), "$A({}) != []")
  });

  test('use $A() on function arguments', function() {
    function toArrayOnArguments() {
      globalArgsTest = $A(arguments);
    }

    toArrayOnArguments();
    assert.deepEqual([], globalArgsTest, "globalArgsTest != []");

    toArrayOnArguments('foo');
    assert.deepEqual(['foo'], globalArgsTest, "globalArgsTest != ['foo']");

    toArrayOnArguments('foo', 'bar');
    assert.deepEqual(['foo', 'bar'], globalArgsTest,
     "globalArgsTest != ['foo', 'bar']");
  });

  test('use $A() On NodeList', function() {
    // direct NodeList
    assert(
      0 === $A($('testfixture').childNodes).length,
      'HTML childNodes length != 0'
    );

    // DOM
    var element = document.createElement('div');
    element.appendChild(document.createTextNode('22'));
    (2).times(function () {
      element.appendChild(document.createElement('span'));
    });
    assert(
      3 === $A(element.childNodes).length,
      'DOM childNodes length != 3'
    );

    // HTML String
    element = document.createElement('div');
    $(element).update('22<span></span><span></span');
    assert(
      3 === $A(element.childNodes).length,
      "String childNodes length != 3"
    );
  });

  test("use $A() On primitive values", function() {
    assert.deepEqual(['a', 'b', 'c'], $A('abc'));
    assert.deepEqual([], $A(''));
    assert.deepEqual([], $A(null));
    assert.deepEqual([], $A(undefined));
    assert.deepEqual([], $A());
    assert.deepEqual([], $A(5));
    assert.deepEqual([], $A(true));
  });

  suite('instance methods', function() {
    test(".clear() method", function() {
      assert.deepEqual([], [].clear());
      assert.deepEqual([], [1].clear());
      assert.deepEqual([], [1, 2].clear());
    });

    test(".clone() method", function() {
      assert.deepEqual([], [].clone());
      assert.deepEqual([1], [1].clone());
      assert.deepEqual([1, 2], [1, 2].clone());
      assert.deepEqual([0, 1, 2], [0, 1, 2].clone());

      var a = [0, 1, 2], b = a;
      assert.strictEqual(a, b);
      b = a.clone();
      assert.notStrictEqual(a, b, 'should not be deep equal');
    });

    // test(".entries() method", function() {
    //   assert.deepEqual(
    //         [ [0, 3], [1, 5], [2, 6], [3, 1], [4, 20] ],
    //         [3, 5, 6, 1, 20].entries(),
    //         "[3, 5, 6, 1, 20].entries() != [[0, 3], [1, 5], [2, 6], [3, 1], [4, 20]]"
    //       );
    //
    //   assert.deepEqual(
    //         [ [0, 'a'], [1, 'b'], [2, 'c'] ],
    //         ['a', 'b', 'c'].entries(),
    //         "['a', 'b', 'c'].entries() != [[0, 'a'], [1, 'b'], [2, 'c']]"
    //       );
    // });

    test(".first() method", function() {
      assert([].first() === undefined, "[].first() != undefined");
      assert(1 === [1].first(), "[1].first() != 1");
      assert(1 === [1, 2].first(), "[1, 2].first() != 1");
    });

    test(".last() method", function() {
      assert([].last() === undefined, "[].last() != undefined");
      assert(1 === [1].last(), "[1].last() != 1");
      assert(2 === [1, 2].last(), "[1, 2].last() != 2");
    });

    test(".compact() method", function() {
      assert.deepEqual([],[].compact(), "[] != [].compact()");
      assert.deepEqual([1, 2, 3], [1, 2, 3].compact(),
       "[1, 2, 3] != [1, 2, 3].compact()");
      assert.deepEqual(
        [0, 1, 2, 3],
        [0, null, 1, 2, undefined, 3].compact(),
        "[0, 1, 2, 3] != [0,null,1,2,undefined,3].compact()"
      );
      assert.deepEqual(
        [1, 2, 3 ],
        [null, 1, 2, 3, null].compact(),
        "[1, 2, 3] != [null,1,2,3,null].compact()"
      );
    });

    test(".flatten() method", function() {
      assert.deepEqual([], [].flatten(), "[] != [].flatten()");

      assert.deepEqual([1, 2, 3], [1, 2, 3].flatten(),
       "[1, 2, 3] != [1, 2, 3].flatten()");
      assert.deepEqual([1, 2, 3], [1,[[[2, 3]]]].flatten(),
       "[1, 2, 3] != [1,[[[2, 3]]]].flatten()");
      assert.deepEqual([1, 2, 3], [[1],[2],[3]].flatten(),
       "[1, 2, 3] != [[1],[2],[3]].flatten()");
      assert.deepEqual([1, 2, 3], [[[[[[[1]]]]]],2,3].flatten(),
       "[1, 2, 3] != [[[[[[[1]]]]]],2,3].flatten()");
    });

    test(".indexOf() method", function() {
      assert(-1 === [].indexOf(1), "1 found in []");
      assert(-1 === [0].indexOf(1), "1 found in [0]");
      assert( 0 === [1].indexOf(1), "1 not found in [1]");
      assert( 1 === [0, 1, 2].indexOf(1), "[0, 1, 2].indexOf(1) != 1");
      assert( 0 === [1, 2, 1].indexOf(1), "[1, 2, 1].indexOf(1) != 0");
      assert( 2 === [1, 2, 1].indexOf(1, -1), "[1, 2, 1].indexOf(1, -1) != 2");
      assert( 1 === [undefined, null].indexOf(null),
       "[undefined,null].indexOf(null) != 1");

      // ES5 compatibility tests
      var undef;
      var array = [1, 2, 3, 4, 5, undef, 6, 7, 1, 2, 3];

      assert( 2  === array.indexOf(3, -47), "large negative value for fromIndex");
      assert( 10 === array.indexOf(3, 4));
      assert( 10 === array.indexOf(3, -5))
      assert( 2  === array.indexOf(3, {}), "nonsensical value for fromIndex");
      assert( 2  === array.indexOf(3, ""), "nonsensical value for fromIndex");
      assert(-1  === array.indexOf(3, 41), "fromIndex value larger than the length of the array");
    });

    test(".lastIndexOf() method", function() {
      assert(-1 === [].lastIndexOf(1));
      assert(-1 === [0].lastIndexOf(1));
      assert( 0 === [1].lastIndexOf(1));
      assert( 2 === [0, 2, 4, 6].lastIndexOf(4));
      assert( 3 === [4, 4, 2, 4, 6].lastIndexOf(4));
      assert( 3 === [0, 2, 4, 6].lastIndexOf(6,3));
      assert(-1 === [0, 2, 4, 6].lastIndexOf(6,2));
      assert( 0 === [6, 2, 4, 6].lastIndexOf(6,2));

      var fixture = [1, 2, 3, 4, 3];
      assert(4, fixture.lastIndexOf(3));
      assert.deepEqual([1, 2, 3, 4, 3], fixture);

      //tests from http://developer.mozilla.org/en/docs/Core_JavaScript_1.5_Reference:Objects:Array:lastIndexOf
      var array = [2, 5, 9, 2];
      assert( 3 === array.lastIndexOf(2));
      assert(-1 === array.lastIndexOf(7));
      assert( 3 === array.lastIndexOf(2,3));
      assert( 0 === array.lastIndexOf(2,2));
      assert( 0 === array.lastIndexOf(2,-2));
      assert( 3 === array.lastIndexOf(2,-1));
    });

    test(".inspect() method", function() {
      assert('[]' === [].inspect());
      assert('[1]' === [1].inspect());
      assert('[\'a\']' === ['a'].inspect());
      assert('[\'a\', 1]' === ['a',1].inspect());
    });

    test(".intersect() method", function() {
      assert.deepEqual([1, 3], [1, 1, 3, 5].intersect([1, 2, 3]));
      assert.deepEqual([0, 1], [0, 1, 2].intersect([0, 1]));
      assert.deepEqual([1], [1, 1].intersect([1, 1]));
      assert.deepEqual([], [1, 1, 3, 5].intersect([4]));
      assert.deepEqual([], [1].intersect(['1']));

      assert.deepEqual(
        ['B','C','D'],
        $R('A','Z').toArray().intersect($R('B','D').toArray())
      );
    });

    test(".reverse() method", function() {
      assert.deepEqual([], [].reverse());
      assert.deepEqual([1], [1].reverse());
      assert.deepEqual([2, 1], [1, 2].reverse());
      assert.deepEqual([3, 2, 1], [1, 2, 3].reverse());
    });

    test(".size() method", function(){
      assert(4 === [0, 1, 2, 3].size());
      assert(0 === [].size());
    });

    test(".uniq() method", function(){
      assert.deepEqual([1], [1, 1, 1].uniq());
      assert.deepEqual([1], [1].uniq());
      assert.deepEqual([], [].uniq());
      assert.deepEqual([0, 1, 2, 3], [0, 1, 2, 2, 3, 0, 2].uniq());
      assert.deepEqual([0, 1, 2, 3], [0, 0, 1, 1, 2, 3, 3, 3].uniq(true));
    });

    test(".without() method", function() {
      assert.deepEqual([], [].without(0));
      assert.deepEqual([], [0].without(0));
      assert.deepEqual([1], [0, 1].without(0));
      assert.deepEqual([1, 2], [0, 1, 2].without(0));
    });
    test(".concat() method", function() {
      var x = {};

      assert(1 === Array.prototype.concat.length);

      assert.deepEqual([0, 1],[0, 1].concat(), "test 2");
      assert(2 === [0, 1].concat().length, "test 3");

      assert.deepEqual([0, 1, 2, 3, 4],[].concat([0, 1], [2, 3, 4]), "test 4");
      assert(5 === [].concat([0, 1], [2, 3, 4]).length, "test 5");

      assert.deepEqual([0, x, 1, 2, true, "NaN"], [0].concat(x, [1, 2], true, "NaN"), "test 6");
      assert(6 === [0].concat(x, [1, 2], true, "NaN").length, "test 7");


      // These tests will fail in older IE because of the trailing comma.
      // Nothing we can do about that, so just skip them and let the user know.
      if ([,].length === 2) {
        info("NOTE: Old versions of IE don't like trailing commas in arrays. Skipping some tests.");
      } else {
        assert.enumEqual(
          [undefined, 1, undefined],
          [, 1].concat([], [,]),
          "concatenation behavior with a trailing comma (1)"
        );
        assert(
          3 === [, 1].concat([], [,]).length,
          "concatenation behavior with a trailing comma (2)"
        );
      }

      assert.enumEqual(
        ["1"],
        Object.keys([, 1].concat([], [,]))
      );

      // Check that Array.prototype.concat can be used in a generic way
      x.concat = Array.prototype.concat;
      assert.deepEqual([x], x.concat(), "test 11");
      assert(1 === x.concat().length, "test 12");

      // Checking an edge case
      var arr = []; arr[2] = true;
      assert.enumEqual([undefined, undefined, true], [].concat(arr), "test 13");
      assert(3 === [].concat(arr).length, "test 14");
      assert.deepEqual(["2"], Object.keys([].concat(arr)), "test 15");

      var args = (function() { return [].concat(arguments) })(1, 2);
      assert(1 === args[0][0], "test 16");
    });

    test(".map() method", function() {
      assert.deepEqual([1, 2, 3], [1, 2, 3].map());
      assert.deepEqual([2, 4, 6], [1, 2, 3].map(function(x) { return x * 2; }));

      var x = [1, 2, 3, 4];
      delete x[1];
      delete x[3];
      assert.enumEqual([1, undefined, 3, undefined], x.map());
      assert(4 === x.map().length);

      var traversed = [];
      x.map(function(val) {
        traversed.push(val);
      });
      assert.deepEqual([1, 3], traversed);
      assert(2 === traversed.length);
    });

    test(".findAll() method", function() {
      assert.deepEqual([2, 4, 6], [1, 2, 3, 4, 5, 6].findAll(function(x) {
        return (x % 2) == 0;
      }));

      var x = [1, 2, 3], traversed = [];
      delete x[1];
      x.findAll(function(val) { traversed.push(val); });
      assert.deepEqual([1, 3], traversed);
      assert(2 === traversed.length);
    });

    test(".any() method", function() {
      assert(!([].any()));

      assert([true, true, true].any());
      assert([true, false, false].any());
      assert(![false, false, false].any());

      assert([1, 2, 3, 4, 5].any(function(value) {
        return value > 2;
      }));
      assert(![1, 2, 3, 4, 5].any(function(value) {
        return value > 5;
      }));

      var x = [1, 2, 3], traversed = [];
      delete x[1];
      x.any(function(val) { traversed.push(val); });
      assert.deepEqual([1, 3], traversed);
      assert(2 === traversed.length);
    });
    test(".all() method", function() {
      assert([].all());

      assert([true, true, true].all());
      assert(![true, false, false].all());
      assert(![false, false, false].all());

      assert([1, 2, 3, 4, 5].all(function(value) {
        return value > 0;
      }));
      assert(![1, 2, 3, 4, 5].all(function(value) {
        return value > 1;
      }));

      var x = [1, 2, 3], traversed = [];
      delete x[1];
      x.all(function(val) { traversed.push(val); return true; });
      assert.deepEqual([1, 3], traversed);
      assert(2, traversed.length);
    });
  });

  test("$w()", function() {
    assert.deepEqual(['a', 'b', 'c', 'd'], $w('a b c d'));
    assert.deepEqual([], $w(' '));
    assert.deepEqual([], $w(''));
    assert.deepEqual([], $w(null));
    assert.deepEqual([], $w(undefined));
    assert.deepEqual([], $w());
    assert.deepEqual([], $w(10));
    assert.deepEqual(['a'], $w('a'));
    assert.deepEqual(['a'], $w('a '));
    assert.deepEqual(['a'], $w(' a'));
    assert.deepEqual(['a', 'b', 'c', 'd'], $w(' a   b\nc\t\nd\n'));
  });


  test(".each() On Sparse Arrays", function() {
    var counter = 0;

    var sparseArray = [0, 1];
    sparseArray[5] = 5;
    sparseArray.each( function(item) { counter++; });

    assert(3 === counter, "Array#each should skip nonexistent keys in an array");
  });

  test(".map() Generic", function() {
    var result = Array.prototype.map.call({0:0, 1:1, length:2});
    assert.deepEqual([0, 1], result);
  });


  test(".findAll() Generic", function() {
    var result = Array.prototype.findAll.call({0:0, 1:1, length:2}, function(x) {
      return x === 1;
    });
    assert.deepEqual([1], result);
  });


  test(".any() Generic", function() {
    assert(Array.prototype.any.call({ 0:false, 1:true, length:2 }));
    assert(!Array.prototype.any.call({ 0:false, 1:false, length:2 }));
  });


  test(".all() Generic", function() {
    assert(Array.prototype.all.call({ 0:true, 1:true, length:2 }));
    assert(!Array.prototype.all.call({ 0:false, 1:true, length:2 }));
  });

});