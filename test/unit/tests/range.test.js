
suite('Range', function () {
  this.name = 'range';

  test('#include', function () {
    assert(!$R(0, 0, true).include(0));
    assert($R(0, 0, false).include(0));

    assert($R(0, 5, true).include(0));
    assert($R(0, 5, true).include(4));
    assert(!$R(0, 5, true).include(5));

    assert($R(0, 5, false).include(0));
    assert($R(0, 5, false).include(5));
    assert(!$R(0, 5, false).include(6));
  });

  test('#each', function () {
    var results = [];
    $R(0, 0, true).each(function(value) {
      results.push(value);
    });

    assert.enumEqual([], results);

    results = [];
    $R(0, 3, false).each(function(value) {
      results.push(value);
    });

    assert.enumEqual([0, 1, 2, 3], results);

    results = [];
    $R(2, 4, true).each(function(value, index) {
      results.push(index);
    });
    assert.enumEqual([0, 1], results);
  });

  test('#any', function () {
    assert(!$R(1, 1, true).any());
    assert($R(0, 3, false).any(function(value) {
      return value == 3;
    }));
  });

  test('#all', function () {
    assert($R(1, 1, true).all());
    assert($R(0, 3, false).all(function(value) {
      return value <= 3;
    }));
  });

  test('#toArray', function () {
    assert.enumEqual([], $R(0, 0, true).toArray());
    assert.enumEqual([0], $R(0, 0, false).toArray());
    assert.enumEqual([0], $R(0, 1, true).toArray());
    assert.enumEqual([0, 1], $R(0, 1, false).toArray());
    assert.enumEqual([-3, -2, -1, 0, 1, 2], $R(-3, 3, true).toArray());
    assert.enumEqual([-3, -2, -1, 0, 1, 2, 3], $R(-3, 3, false).toArray());
  });

  test('defaults to inclusive', function () {
    assert.enumEqual($R(-3,3), $R(-3,3,false));
  });

});
