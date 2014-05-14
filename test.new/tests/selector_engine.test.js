
suite('Selector engine', function () {
  this.name = 'selector_engine';

  test('.engine', function () {
    assert(Prototype.Selector.engine);
  });

  test('.select', function () {
    var elements = Prototype.Selector.select('.test_class');

    assert(Object.isArray(elements));
    assert.equal(2, elements.length);
    assert.equal('div_parent', elements[0].id);
    assert.equal('div_child', elements[1].id);
  });

  test('.select (with context)', function () {
    var elements = Prototype.Selector.select('.test_class', $('div_parent'));

    assert(Object.isArray(elements));
    assert.equal(1, elements.length);
    assert.equal('div_child', elements[0].id);
  });

  test('.select (with empty result set)', function () {
    var elements = Prototype.Selector.select('.non_existent');

    assert(Object.isArray(elements));
    assert.equal(0, elements.length);
  });

  test('.match', function () {
    var element = $('div_parent');

    assert.equal(true, Prototype.Selector.match(element, '.test_class'));
    assert.equal(false, Prototype.Selector.match(element, '.non_existent'));
  });

  test('.find', function () {
    var elements = document.getElementsByTagName('*'),
        expression = '.test_class';
    assert.equal('div_parent', Prototype.Selector.find(elements, expression).id);
    assert.equal('div_child', Prototype.Selector.find(elements, expression, 1).id);
  });

});
