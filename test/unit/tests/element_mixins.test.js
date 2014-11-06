Form.Element.Methods.coffee = Prototype.K;
Element.addMethods();

suite('Element mixins', function () {
  this.name = 'element_mixins';

  test('input', function () {
    assert($("input").present != null);
    assert(typeof $("input").present == 'function');
    assert($("input").select != null);
    assert.respondsTo('present', Form.Element);
    assert.respondsTo('present', Form.Element.Methods);
    assert.respondsTo('coffee', $('input'));
    assert.strictEqual(Prototype.K, Form.Element.coffee);
    assert.strictEqual(Prototype.K, Form.Element.Methods.coffee);
  });

  test('form', function () {
    assert($("form").reset != null);
    assert($("form").getInputs().length == 2);
  });

  test('event', function () {
    assert($("form").observe != null);
    // Can't really test this one with TestUnit...
    $('form').observe("submit", function(e) {
      alert("yeah!");
      Event.stop(e);
    });
  });

  test('collections', function () {
    assert($$("input").all(function(input) {
      return (input.focus != null);
    }));
  });

});
