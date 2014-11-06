
suite('Number', function () {
  this.name = 'number';

  test('math methods', function () {
    assert.equal(1, (0.9).round());
    assert.equal(-2, (-1.9).floor());
    assert.equal(-1, (-1.9).ceil());

    $w('abs floor round ceil').each(function(method) {
      assert.equal(Math[method](Math.PI), Math.PI[method]());
    }, this);
  });

  test('#toColorPart', function () {
    assert.equal('00', (0).toColorPart());
    assert.equal('0a', (10).toColorPart());
    assert.equal('ff', (255).toColorPart());
  });

  test('#toPaddedString', function () {
    assert.equal('00', (0).toPaddedString(2, 16));
    assert.equal('0a', (10).toPaddedString(2, 16));
    assert.equal('ff', (255).toPaddedString(2, 16));
    assert.equal('000', (0).toPaddedString(3));
    assert.equal('010', (10).toPaddedString(3));
    assert.equal('100', (100).toPaddedString(3));
    assert.equal('1000', (1000).toPaddedString(3));
  });

  test('#times', function () {
    var results = [];
    (5).times(function(i) { results.push(i); });
    assert.enumEqual($R(0, 4), results);

    results = [];
    (5).times(function(i) { results.push(i * this.i); }, { i: 2 });
    assert.enumEqual([0, 2, 4, 6, 8], results);
  });

});
