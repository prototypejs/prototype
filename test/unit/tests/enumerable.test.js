Fixtures.Enumerable = {
  People: [
    {name: 'Sam Stephenson',    nickname: 'sam-'},
    {name: 'Marcel Molina Jr.', nickname: 'noradio'},
    {name: 'Scott Barron',      nickname: 'htonl'},
    {name: 'Nicholas Seckar',   nickname: 'Ulysses'}
  ],

  Nicknames: $w('sam- noradio htonl Ulysses'),

  Basic: [1, 2, 3],

  Primes: [
     1,  2,  3,  5,  7,  11, 13, 17, 19, 23,
    29, 31, 37, 41, 43,  47, 53, 59, 61, 67,
    71, 73, 79, 83, 89,  97
  ],

  Z: []
};

for (var i = 1; i <= 100; i++)
  Fixtures.Enumerable.Z.push(i);


///////


function prime(value) {
  for (var i = 2; i < value; i++) {
    if (value % i == 0) return false;
  }
  return true;
}

suite('Enumerable', function () {
  this.name = 'enumerable';

  test('#each ($break)', function () {
    var result = 0;
    Fixtures.Enumerable.Basic.each(function(value) {
      if ((result = value) == 2) throw $break;
    });

    assert.equal(2, result);
  });

  test('#each (return acts as continue)', function () {
    var results = [];
    Fixtures.Enumerable.Basic.each(function(value) {
      if (value == 2) return;
      results.push(value);
    });

    assert.equal('1, 3', results.join(', '));
  });

  test('#each (passes value, index, collection to the iterator)', function () {
    var i = 0;
    Fixtures.Enumerable.Basic.each(function(value, index, collection) {
      assert.strictEqual(Fixtures.Enumerable.Basic[i], value);
      assert.strictEqual(i, index);
      assert.strictEqual(Fixtures.Enumerable.Basic, collection);
      i++;
    });
  });

  test('#each (chaining)', function () {
    assert.equal(Fixtures.Enumerable.Primes, Fixtures.Enumerable.Primes.each(Prototype.emptyFunction));
    assert.equal(3, Fixtures.Enumerable.Basic.each(Prototype.emptyFunction).length);
  });


  test('context', function () {
    var results = [];
    Fixtures.Enumerable.Basic.each(function(value) {
      results.push(value * this.i);
    }, { i: 2 });

    assert.equal('2 4 6', results.join(' '));

    assert(Fixtures.Enumerable.Basic.all(function(value){
      return value >= this.min && value <= this.max;
    }, { min: 1, max: 3 }));
    assert(!Fixtures.Enumerable.Basic.all(function(value){
      return value >= this.min && value <= this.max;
    }));
    assert(Fixtures.Enumerable.Basic.any(function(value){
      return value == this.target_value;
    }, { target_value: 2 }));
  });

  test('#any', function () {
    assert(!([].any()));

    assert([true, true, true].any());
    assert([true, false, false].any());
    assert(![false, false, false].any());

    assert(Fixtures.Enumerable.Basic.any(function(value) {
      return value > 2;
    }));
    assert(!Fixtures.Enumerable.Basic.any(function(value) {
      return value > 5;
    }));
  });

  test('#any (passes value, index, collection to the iterator)', function () {
    var i = 0;
    Fixtures.Enumerable.Basic.any(function(value, index, collection) {
      assert.strictEqual(Fixtures.Enumerable.Basic[i], value);
      assert.strictEqual(i, index);
      assert.strictEqual(Fixtures.Enumerable.Basic, collection);
      i++;

      // Iterate over all values
      return value > 5;
    }, this);
  });

  test('#all', function () {
    assert([].all());

    assert([true, true, true].all());
    assert(![true, false, false].all());
    assert(![false, false, false].all());

    assert(Fixtures.Enumerable.Basic.all(function(value) {
      return value > 0;
    }));
    assert(!Fixtures.Enumerable.Basic.all(function(value) {
      return value > 1;
    }));
  });

  test('#all (passes value, context, collection to the iterator)', function () {
    var i = 0;
    Fixtures.Enumerable.Basic.all(function(value, index, collection) {
      assert.strictEqual(Fixtures.Enumerable.Basic[i], value);
      assert.strictEqual(i, index);
      assert.strictEqual(Fixtures.Enumerable.Basic, collection);
      i++;

      // Iterate over all values
      return value > 0;
    });
  });

  test('#collect', function () {
    assert.equal(Fixtures.Enumerable.Nicknames.join(', '),
      Fixtures.Enumerable.People.collect(function(person) {
        return person.nickname;
      }).join(", "));

    assert.equal(26,  Fixtures.Enumerable.Primes.map().length);
  });

  test('#collect (passes value, index, collection to the iterator)', function () {
    var i = 0;
    Fixtures.Enumerable.Basic.collect(function(value, index, collection) {
      assert.strictEqual(Fixtures.Enumerable.Basic[i], value);
      assert.strictEqual(i, index);
      assert.strictEqual(Fixtures.Enumerable.Basic, collection);
      i++;
      return value;
    });
  });

  test('#detect', function () {
    assert.equal('Marcel Molina Jr.',
      Fixtures.Enumerable.People.detect(function(person) {
        return person.nickname.match(/no/);
      }).name);
  });

  test('#detect (passes value, index, collection to the iterator)', function () {
    var i = 0;
    Fixtures.Enumerable.Basic.detect(function(value, index, collection) {
      assert.strictEqual(Fixtures.Enumerable.Basic[i], value);
      assert.strictEqual(i, index);
      assert.strictEqual(Fixtures.Enumerable.Basic, collection);
      i++;

      // Iterate over all values
      return value > 5;
    });
  });

  test('#eachSlice', function () {
    assert.enumEqual([], [].eachSlice(2));
    assert.equal(1, [1].eachSlice(1).length);
    assert.enumEqual([1], [1].eachSlice(1)[0]);
    assert.equal(2, Fixtures.Enumerable.Basic.eachSlice(2).length);
    assert.enumEqual(
      [3, 2, 1, 11, 7, 5, 19, 17, 13, 31, 29, 23, 43, 41, 37, 59, 53, 47, 71, 67, 61, 83, 79, 73, 97, 89],
      Fixtures.Enumerable.Primes.eachSlice( 3, function(slice){ return slice.reverse(); }).flatten()
    );
    assert.enumEqual(Fixtures.Enumerable.Basic, Fixtures.Enumerable.Basic.eachSlice(-10));
    assert.enumEqual(Fixtures.Enumerable.Basic, Fixtures.Enumerable.Basic.eachSlice(0));
    assert.notStrictEqual(Fixtures.Enumerable.Basic, Fixtures.Enumerable.Basic.eachSlice(0));
  });

  test('#each (with index)', function () {
    var nicknames = [], indexes = [];
    Fixtures.Enumerable.People.each(function(person, index) {
      nicknames.push(person.nickname);
      indexes.push(index);
    });

    assert.equal(Fixtures.Enumerable.Nicknames.join(', '),
      nicknames.join(', '));
    assert.equal('0, 1, 2, 3', indexes.join(', '));
  });

  test('#findAll', function () {
    assert.equal(Fixtures.Enumerable.Primes.join(', '),
      Fixtures.Enumerable.Z.findAll(prime).join(', '));
  });

  test('#findAll (passes value, index, collection to the iterator)', function () {
    var i = 0;
    Fixtures.Enumerable.Basic.findAll(function(value, index, collection) {
      assert.strictEqual(Fixtures.Enumerable.Basic[i], value);
      assert.strictEqual(i, index);
      assert.strictEqual(Fixtures.Enumerable.Basic, collection);
      i++;
      return value > 5;
    });
  });

  test('#grep', function () {
    assert.equal('noradio, htonl',
      Fixtures.Enumerable.Nicknames.grep(/o/).join(", "));

    assert.equal('NORADIO, HTONL',
      Fixtures.Enumerable.Nicknames.grep(/o/, function(nickname) {
        return nickname.toUpperCase();
      }).join(", "));

    assert.enumEqual(
      $('grepHeader', 'grepCell'),
      $('grepTable', 'grepTBody', 'grepRow', 'grepHeader', 'grepCell').grep(new Selector('.cell'))
    );

    // troublesome characters
    assert.enumEqual(['?a', 'c?'], ['?a','b','c?'].grep('?'));
    assert.enumEqual(['*a', 'c*'], ['*a','b','c*'].grep('*'));
    assert.enumEqual(['+a', 'c+'], ['+a','b','c+'].grep('+'));
    assert.enumEqual(['{1}a', 'c{1}'], ['{1}a','b','c{1}'].grep('{1}'));
    assert.enumEqual(['(a', 'c('], ['(a','b','c('].grep('('));
    assert.enumEqual(['|a', 'c|'], ['|a','b','c|'].grep('|'));
  });

  test('#grep (passes value, index, collection to the iterator)', function () {
    var i = 0;
    Fixtures.Enumerable.Basic.grep(/\d/, function(value, index, collection) {
      assert.strictEqual(Fixtures.Enumerable.Basic[i], value);
      assert.strictEqual(i, index);
      assert.strictEqual(Fixtures.Enumerable.Basic, collection);
      i++;
      return value;
    });
  });

  test('#include', function () {
    assert(Fixtures.Enumerable.Nicknames.include('sam-'));
    assert(Fixtures.Enumerable.Nicknames.include('noradio'));
    assert(!Fixtures.Enumerable.Nicknames.include('gmosx'));
    assert(Fixtures.Enumerable.Basic.include(2));
    assert(Fixtures.Enumerable.Basic.include('2'));
    assert(!Fixtures.Enumerable.Basic.include('4'));
  });

  test('#inGroupsOf', function () {
    assert.enumEqual([], [].inGroupsOf(3));

    var arr = [1, 2, 3, 4, 5, 6].inGroupsOf(3);
    assert.equal(2, arr.length);
    assert.enumEqual([1, 2, 3], arr[0]);
    assert.enumEqual([4, 5, 6], arr[1]);

    arr = [1, 2, 3, 4, 5, 6].inGroupsOf(4);
    assert.equal(2, arr.length);
    assert.enumEqual([1, 2, 3, 4], arr[0]);
    assert.enumEqual([5, 6, null, null], arr[1]);

    var basic = Fixtures.Enumerable.Basic;

    arr = basic.inGroupsOf(4,'x');
    assert.equal(1, arr.length);
    assert.enumEqual([1, 2, 3, 'x'], arr[0]);

    assert.enumEqual([1,2,3,'a'], basic.inGroupsOf(2, 'a').flatten());

    arr = basic.inGroupsOf(5, '');
    assert.equal(1, arr.length);
    assert.enumEqual([1, 2, 3, '', ''], arr[0]);

    assert.enumEqual([1,2,3,0], basic.inGroupsOf(2, 0).flatten());
    assert.enumEqual([1,2,3,false], basic.inGroupsOf(2, false).flatten());
  });

  test('#inject', function () {
    assert.equal(1061,
      Fixtures.Enumerable.Primes.inject(0, function(sum, value) {
        return sum + value;
      })
    );
  });

  test('#inject (passes memo, value, index, collection to the iterator)', function () {
    var i = 0;
    Fixtures.Enumerable.Basic.inject(0, function(memo, value, index, collection) {
      assert.strictEqual(Fixtures.Enumerable.Basic[i], value);
      assert.strictEqual(i, index);
      assert.strictEqual(Fixtures.Enumerable.Basic, collection);
      i++;

      return memo + value;
    });
  });

  test('#invoke', function () {
    var result = [[2, 1, 3], [6, 5, 4]].invoke('sort');
    assert.equal(2, result.length);
    assert.equal('1, 2, 3', result[0].join(', '));
    assert.equal('4, 5, 6', result[1].join(', '));

    result = result.invoke('invoke', 'toString', 2);
    assert.equal('1, 10, 11', result[0].join(', '));
    assert.equal('100, 101, 110', result[1].join(', '));
  });

  test('#max', function () {
    assert.equal(100, Fixtures.Enumerable.Z.max());
    assert.equal(97, Fixtures.Enumerable.Primes.max());
    assert.equal(2, [ -9, -8, -7, -6, -4, -3, -2,  0, -1,  2 ].max());
    assert.equal('sam-', Fixtures.Enumerable.Nicknames.max()); // ?s > ?U
  });

  test('#max (passes value, index, collection to the iterator)', function () {
    var i = 0;
    Fixtures.Enumerable.Basic.max(function(value, index, collection) {
      assert.strictEqual(Fixtures.Enumerable.Basic[i], value);
      assert.strictEqual(i, index);
      assert.strictEqual(Fixtures.Enumerable.Basic, collection);
      i++;
      return value;
    });
  });

  test('#min', function () {
    assert.equal(1, Fixtures.Enumerable.Z.min());
    assert.equal(0, [  1, 2, 3, 4, 5, 6, 7, 8, 0, 9 ].min());
    assert.equal('Ulysses', Fixtures.Enumerable.Nicknames.min()); // ?U < ?h
  });

  test('#min (passes value, index, collection to the iterator)', function () {
    var i = 0;
    Fixtures.Enumerable.Basic.min(function(value, index, collection) {
      assert.strictEqual(Fixtures.Enumerable.Basic[i], value);
      assert.strictEqual(i, index);
      assert.strictEqual(Fixtures.Enumerable.Basic, collection);
      i++;
      return value;
    }, this);
  });

  test('#partition', function () {
    var result = Fixtures.Enumerable.People.partition(function(person) {
      return person.name.length < 15;
    }).invoke('pluck', 'nickname');

    assert.equal(2, result.length);
    assert.equal('sam-, htonl', result[0].join(', '));
    assert.equal('noradio, Ulysses', result[1].join(', '));
  });

  test('#partition (passes value, index, collection to the iterator)', function () {
    var i = 0;
    Fixtures.Enumerable.Basic.partition(function(value, index, collection) {
      assert.strictEqual(Fixtures.Enumerable.Basic[i], value);
      assert.strictEqual(i, index);
      assert.strictEqual(Fixtures.Enumerable.Basic, collection);
      i++;
      return value < 2;
    }, this);
  });

  test('#pluck', function () {
    assert.equal(Fixtures.Enumerable.Nicknames.join(', '),
      Fixtures.Enumerable.People.pluck('nickname').join(', '));
  });

  test('#reject', function () {
    assert.equal(0,
      Fixtures.Enumerable.Nicknames.reject(Prototype.K).length);

    assert.equal('sam-, noradio, htonl',
      Fixtures.Enumerable.Nicknames.reject(function(nickname) {
        return nickname != nickname.toLowerCase();
      }).join(', '));
  });

  test('#reject (passes value, index, collection to the iterator)', function () {
    var i = 0;
    Fixtures.Enumerable.Basic.reject(function(value, index, collection) {
      assert.strictEqual(Fixtures.Enumerable.Basic[i], value);
      assert.strictEqual(i, index);
      assert.strictEqual(Fixtures.Enumerable.Basic, collection);
      i++;
      return value < 2;
    });
  });

  test('#sortBy', function () {
    assert.equal('htonl, noradio, sam-, Ulysses',
      Fixtures.Enumerable.People.sortBy(function(value) {
        return value.nickname.toLowerCase();
      }).pluck('nickname').join(', '));
  });

  test('#sortBy (passes value, index, collection to the iterator)', function () {
    var i = 0;
    Fixtures.Enumerable.Basic.sortBy(function(value, index, collection) {
      assert.strictEqual(Fixtures.Enumerable.Basic[i], value);
      assert.strictEqual(i, index);
      assert.strictEqual(Fixtures.Enumerable.Basic, collection);
      i++;
      return value;
    });
  });

  test('#toArray', function () {
    var result = Fixtures.Enumerable.People.toArray();
    assert(result != Fixtures.Enumerable.People, '#toArray should create a new object');
    assert.equal(Fixtures.Enumerable.Nicknames.join(', '),
      result.pluck('nickname').join(', ')); // but the values are the same
  });

  test('#zip', function () {
    var result = [1, 2, 3].zip([4, 5, 6], [7, 8, 9]);
    assert.equal('[[1, 4, 7], [2, 5, 8], [3, 6, 9]]', result.inspect());

    result = [1, 2, 3].zip([4, 5, 6], [7, 8, 9], function(array) { return array.reverse(); });
    assert.equal('[[7, 4, 1], [8, 5, 2], [9, 6, 3]]', result.inspect());
  });

  test('#size', function () {
    assert.equal(4, Fixtures.Enumerable.People.size());
    assert.equal(4, Fixtures.Enumerable.Nicknames.size());
    assert.equal(26, Fixtures.Enumerable.Primes.size());
    assert.equal(0, [].size());
  });

});
