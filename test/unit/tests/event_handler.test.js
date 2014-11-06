
function handle(selector, callback) {
  if (!callback) {
    callback = selector;
    selector = false;
  }
  return new Event.Handler("event-handler-container", "test:event", selector, callback);
}

var handler;

suite('Event.Handler', function () {
  this.name = 'event_handler';

  teardown(function () {
    try {
      handler.stop();
    } catch (e) {
    } finally {
      delete handler;
    }
  });

  test('handlers do nothing if #start has not been called', function () {
    var fired = false;
    handler = handle(function() { fired = true; });

    $("event-handler-container").fire("test:event");
    assert(!fired);
  });

  test('handlers are fired when #start is called', function () {
    var fired = false;
    handler = handle(function() { fired = true; });

    handler.start();
    assert(!fired);
    $("event-handler-container").fire("test:event");
    assert(fired);
  });

  test('handlers do not fire after starting, then stopping', function () {
    var fired = 0;
    handler = handle(function() { fired++; });

    handler.start();
    assert.equal(0, fired);
    $("event-handler-container").fire("test:event");
    assert.equal(1, fired);
    handler.stop();
    $("event-handler-container").fire("test:event");
    assert.equal(1, fired);
  });

  test('handlers without selectors pass the target element to callbacks', function () {
    var span = $("event-handler-container").down("span");
    handler = handle(function(event, element) {
      assert.equal(span, element);
    }.bind(this));

    handler.start();
    span.fire("test:event");
  });

  test('handlers with selectors pass the matched element to callbacks', function () {
    var link = $("event-handler-container").down("a"), span = link.down("span");
    handler = handle("a", function(event, element) {
      assert.equal(link, element);
    }.bind(this));

    handler.start();
    span.fire("test:event");
  });

  test('handlers with selectors do not call the callback if no matching element is called', function () {
    var paragraph = $("event-handler-container").down("p", 1), fired = false;
    handler = handle("a", function(event, element) { fired = true; });

    handler.start();
    paragraph.fire("test:event");
    assert(!fired);
  });

  test('handler callbacks are bound to the original element', function () {
    var span = $("event-handler-container").down("span"), element;
    handler = handle(function() { element = this; });

    handler.start();
    span.fire("test:event");
    assert.equal($("event-handler-container"), element);
  });

  test('calling start multiple times does not install multiple observers', function () {
    var fired = 0;
    handler = handle(function() { fired++; });

    handler.start();
    handler.start();
    $("event-handler-container").fire("test:event");
    assert.equal(1, fired);
  });

});
