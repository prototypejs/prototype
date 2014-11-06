var globalArgsTest = 'nothing to see here';

new Test.Unit.Runner({
  test$A: function(){
    this.assertEnumEqual([], $A({}));
  },
  
  testToArrayOnArguments: function(){
    function toArrayOnArguments(){
      globalArgsTest = $A(arguments);
    }
    toArrayOnArguments();
    this.assertEnumEqual([], globalArgsTest);
    toArrayOnArguments('foo');
    this.assertEnumEqual(['foo'], globalArgsTest);
    toArrayOnArguments('foo','bar');
    this.assertEnumEqual(['foo','bar'], globalArgsTest);
  },
  
  testToArrayOnNodeList: function(){
    // direct HTML
    this.assertEqual(3, $A($('test_node').childNodes).length);
    
    // DOM
    var element = document.createElement('div');
    element.appendChild(document.createTextNode('22'));
    (2).times(function(){ element.appendChild(document.createElement('span')) });
    this.assertEqual(3, $A(element.childNodes).length);
    
    // HTML String
    element = document.createElement('div');
    $(element).update('22<span></span><span></span');
    this.assertEqual(3, $A(element.childNodes).length);
  },
  
  testToArrayOnPrimitive: function() {
    this.assertEnumEqual(['a', 'b', 'c'], $A('abc'));
    this.assertEnumEqual([], $A(''));
    this.assertEnumEqual([], $A(null));
    this.assertEnumEqual([], $A(undefined));
    this.assertEnumEqual([], $A());
    this.assertEnumEqual([], $A(5));
    this.assertEnumEqual([], $A(true));
  },

  testClear: function(){
    this.assertEnumEqual([], [].clear());
    this.assertEnumEqual([], [1].clear());
    this.assertEnumEqual([], [1,2].clear());
  },
  
  testClone: function(){
    this.assertEnumEqual([], [].clone());
    this.assertEnumEqual([1], [1].clone());
    this.assertEnumEqual([1,2], [1,2].clone());
    this.assertEnumEqual([0,1,2], [0,1,2].clone());
    var a = [0,1,2];
    var b = a;
    this.assertIdentical(a, b);
    b = a.clone();
    this.assertNotIdentical(a, b);
  },
  
  testFirst: function(){
    this.assertUndefined([].first());
    this.assertEqual(1, [1].first());
    this.assertEqual(1, [1,2].first());
  },
  
  testLast: function(){
    this.assertUndefined([].last());
    this.assertEqual(1, [1].last());
    this.assertEqual(2, [1,2].last());
  },
  
  testCompact: function(){
    this.assertEnumEqual([],      [].compact());
    this.assertEnumEqual([1,2,3], [1,2,3].compact());
    this.assertEnumEqual([0,1,2,3], [0,null,1,2,undefined,3].compact());
    this.assertEnumEqual([1,2,3], [null,1,2,3,null].compact());
  },
  
  testFlatten: function(){
    this.assertEnumEqual([],      [].flatten());
    this.assertEnumEqual([1,2,3], [1,2,3].flatten());
    this.assertEnumEqual([1,2,3], [1,[[[2,3]]]].flatten());
    this.assertEnumEqual([1,2,3], [[1],[2],[3]].flatten());
    this.assertEnumEqual([1,2,3], [[[[[[[1]]]]]],2,3].flatten());
  },
  
  testIndexOf: function(){
    this.assertEqual(-1, [].indexOf(1));
    this.assertEqual(-1, [0].indexOf(1));
    this.assertEqual(0, [1].indexOf(1));
    this.assertEqual(1, [0,1,2].indexOf(1));
    this.assertEqual(0, [1,2,1].indexOf(1));
    this.assertEqual(2, [1,2,1].indexOf(1, -1));
    this.assertEqual(1, [undefined,null].indexOf(null));
    
    // ES5 compatibility tests.
    var undef;
    var array = [1, 2, 3, 4, 5, undef, 6, 7, 1, 2, 3];
    
    this.assertEqual(2, array.indexOf(3, -47),
     "large negative value for fromIndex");
    this.assertEqual(10, array.indexOf(3, 4));
    this.assertEqual(10, array.indexOf(3, -5))
    this.assertEqual(2, array.indexOf(3, {}),
     "nonsensical value for fromIndex");
    this.assertEqual(2, array.indexOf(3, ""),
     "nonsensical value for fromIndex");
    this.assertEqual(-1, array.indexOf(3, 41),
     "fromIndex value larger than the length of the array");
  },

  testLastIndexOf: function(){
    this.assertEqual(-1,[].lastIndexOf(1));
    this.assertEqual(-1, [0].lastIndexOf(1));
    this.assertEqual(0, [1].lastIndexOf(1));
    this.assertEqual(2, [0,2,4,6].lastIndexOf(4));
    this.assertEqual(3, [4,4,2,4,6].lastIndexOf(4));
    this.assertEqual(3, [0,2,4,6].lastIndexOf(6,3));
    this.assertEqual(-1, [0,2,4,6].lastIndexOf(6,2));
    this.assertEqual(0, [6,2,4,6].lastIndexOf(6,2));
    
    var fixture = [1,2,3,4,3];
    this.assertEqual(4, fixture.lastIndexOf(3));
    this.assertEnumEqual([1,2,3,4,3],fixture);
    
    //tests from http://developer.mozilla.org/en/docs/Core_JavaScript_1.5_Reference:Objects:Array:lastIndexOf
    var array = [2, 5, 9, 2];
    this.assertEqual(3,array.lastIndexOf(2));
    this.assertEqual(-1,array.lastIndexOf(7));
    this.assertEqual(3,array.lastIndexOf(2,3));
    this.assertEqual(0,array.lastIndexOf(2,2));
    this.assertEqual(0,array.lastIndexOf(2,-2));
    this.assertEqual(3,array.lastIndexOf(2,-1));
  },
  
  testInspect: function(){
    this.assertEqual('[]',[].inspect());
    this.assertEqual('[1]',[1].inspect());
    this.assertEqual('[\'a\']',['a'].inspect());
    this.assertEqual('[\'a\', 1]',['a',1].inspect());
  },
  
  testIntersect: function(){
    this.assertEnumEqual([1,3], [1,1,3,5].intersect([1,2,3]));
    this.assertEnumEqual([0,1], [0,1,2].intersect([0,1]));
    this.assertEnumEqual([1], [1,1].intersect([1,1]));
    this.assertEnumEqual([], [1,1,3,5].intersect([4]));
    this.assertEnumEqual([], [1].intersect(['1']));
    
    this.assertEnumEqual(
      ['B','C','D'], 
      $R('A','Z').toArray().intersect($R('B','D').toArray())
    );
  },
  
  testReverse: function(){
    this.assertEnumEqual([], [].reverse());
    this.assertEnumEqual([1], [1].reverse());
    this.assertEnumEqual([2,1], [1,2].reverse());
    this.assertEnumEqual([3,2,1], [1,2,3].reverse());
  },
  
  testSize: function(){
    this.assertEqual(4, [0, 1, 2, 3].size());
    this.assertEqual(0, [].size());
  },

  testUniq: function(){
    this.assertEnumEqual([1], [1, 1, 1].uniq());
    this.assertEnumEqual([1], [1].uniq());
    this.assertEnumEqual([], [].uniq());
    this.assertEnumEqual([0, 1, 2, 3], [0, 1, 2, 2, 3, 0, 2].uniq());
    this.assertEnumEqual([0, 1, 2, 3], [0, 0, 1, 1, 2, 3, 3, 3].uniq(true));
  },
  
  testWithout: function(){
    this.assertEnumEqual([], [].without(0));
    this.assertEnumEqual([], [0].without(0));
    this.assertEnumEqual([1], [0,1].without(0));
    this.assertEnumEqual([1,2], [0,1,2].without(0));
  },
  
  test$w: function(){
    this.assertEnumEqual(['a', 'b', 'c', 'd'], $w('a b c d'));
    this.assertEnumEqual([], $w(' '));
    this.assertEnumEqual([], $w(''));
    this.assertEnumEqual([], $w(null));
    this.assertEnumEqual([], $w(undefined));
    this.assertEnumEqual([], $w());
    this.assertEnumEqual([], $w(10));
    this.assertEnumEqual(['a'], $w('a'));
    this.assertEnumEqual(['a'], $w('a '));
    this.assertEnumEqual(['a'], $w(' a'));
    this.assertEnumEqual(['a', 'b', 'c', 'd'], $w(' a   b\nc\t\nd\n'));
  },
  
  testConcat: function() {
    var x = {};

    this.assertIdentical(1, Array.prototype.concat.length);

    this.assertEnumEqual(
      [0, 1],
      [0, 1].concat(),
      "test 2"
    );
    this.assertIdentical(2, [0, 1].concat().length, "test 3");
    
    this.assertEnumEqual(
      [0, 1, 2, 3, 4],
      [].concat([0, 1], [2, 3, 4]),
      "test 4"
    );
    this.assertIdentical(5, [].concat([0, 1], [2, 3, 4]).length, "test 5");

    this.assertEnumEqual([0, x, 1, 2, true, "NaN"], [0].concat(x, [1, 2], true, "NaN"), "test 6");
    this.assertIdentical(6, [0].concat(x, [1, 2], true, "NaN").length, "test 7");
    
    // These tests will fail in older IE because of the trailing comma.
    // Nothing we can do about that, so just skip them and let the user know.
    if ([,].length === 2) {
      this.info("NOTE: Old versions of IE don't like trailing commas in " + 
       "arrays. Skipping some tests.");
    } else {
      this.assertEnumEqual([undefined, 1, undefined], [,1].concat([], [,]), 
       "concatenation behavior with a trailing comma (1)");
      this.assertIdentical(3, [,1].concat([], [,]).length,
       "concatenation behavior with a trailing comma (2)");
    }
    
    
    this.assertEnumEqual([1], Object.keys([,1].concat([], [,])), "test 10");

    // Check that Array.prototype.concat can be used in a generic way
    x.concat = Array.prototype.concat;
    this.assertEnumEqual([x], x.concat());
    this.assertIdentical(1, x.concat().length);
    
    // Checking an edge case
    var arr = []; arr[2] = true;
    this.assertEnumEqual([undefined, undefined, true], [].concat(arr));
    this.assertIdentical(3, [].concat(arr).length);
    this.assertEnumEqual([2], Object.keys([].concat(arr)));

    var args = (function() { return [].concat(arguments) })(1, 2);
    this.assertIdentical(1, args[0][0]);
  },
  
  testEachOnSparseArrays: function() {
    var counter = 0;
    
    var sparseArray = [0, 1];
    sparseArray[5] = 5;
    sparseArray.each( function(item) { counter++; });
    
    this.assertEqual(3, counter, "Array#each should skip nonexistent keys in an array");
  },
  
  testMapGeneric: function() {
    var result = Array.prototype.map.call({0:0, 1:1, length:2});
    this.assertEnumEqual([0, 1], result);
  },
  
  testMap: function() {
    this.assertEnumEqual([1,2,3], [1,2,3].map());
    this.assertEnumEqual([2,4,6], [1,2,3].map(function(x) { return x * 2; }));
    
    var x = [1,2,3,4];
    delete x[1];
    delete x[3];
    this.assertEnumEqual([1, undefined, 3, undefined], x.map());
    this.assertIdentical(4, x.map().length);
    
    var traversed = [];
    x.map(function(val) {
      traversed.push(val);
    });
    this.assertEnumEqual([1, 3], traversed);
    this.assertIdentical(2, traversed.length);
  },
  
  testFindAllGeneric: function() {
    var result = Array.prototype.findAll.call({0:0, 1:1, length:2}, function(x) {
      return x === 1;
    });
    this.assertEnumEqual([1], result);
  },
  
  testFindAll: function() {
    this.assertEnumEqual([2, 4, 6], [1, 2, 3, 4, 5, 6].findAll(function(x) {
      return (x % 2) == 0;
    }));
    
    var x = [1,2,3], traversed = [];
    delete x[1];
    x.findAll(function(val) { traversed.push(val); });
    this.assertEnumEqual([1, 3], traversed);
    this.assertIdentical(2, traversed.length);
  },

  testAnyGeneric: function() {
    this.assert(Array.prototype.any.call({ 0:false, 1:true, length:2 }));
    this.assert(!Array.prototype.any.call({ 0:false, 1:false, length:2 }));
  },
  
  testAny: function() {
    this.assert(!([].any()));
    
    this.assert([true, true, true].any());
    this.assert([true, false, false].any());
    this.assert(![false, false, false].any());
    
    this.assert([1,2,3,4,5].any(function(value) {
      return value > 2;
    }));
    this.assert(![1,2,3,4,5].any(function(value) {
      return value > 5;
    }));
    
    var x = [1,2,3], traversed = [];
    delete x[1];
    x.any(function(val) { traversed.push(val); });
    this.assertEnumEqual([1, 3], traversed);
    this.assertIdentical(2, traversed.length);
  },
  
  testAllGeneric: function() {
    this.assert(Array.prototype.all.call({ 0:true, 1:true, length:2 }));
    this.assert(!Array.prototype.all.call({ 0:false, 1:true, length:2 }));
  },
  
  testAll: function() {
    this.assert([].all());
    
    this.assert([true, true, true].all());
    this.assert(![true, false, false].all());
    this.assert(![false, false, false].all());

    this.assert([1,2,3,4,5].all(function(value) {
      return value > 0;
    }));
    this.assert(![1,2,3,4,5].all(function(value) {
      return value > 1;
    }));
    
    var x = [1,2,3], traversed = [];
    delete x[1];
    x.all(function(val) { traversed.push(val); return true; });
    this.assertEnumEqual([1, 3], traversed);
    this.assertIdentical(2, traversed.length);
  }
});