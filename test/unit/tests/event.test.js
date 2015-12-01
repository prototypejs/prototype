var documentLoaded = document.loaded;

function uidForElement(elem) {
  return elem._prototypeUID;
}

suite('Event', function () {
  this.name = 'event';

  test('custom event firing', function () {
    var span = $("span"), fired = false, observer = function(event) {
      assert.equal(span, event.element());
      assert.equal(1, event.memo.index);
      fired = true;
    }.bind(this);

    span.observe("test:somethingHappened", observer);
    span.fire("test:somethingHappened", { index: 1 });
    assert(fired);

    fired = false;
    span.fire("test:somethingElseHappened");
    assert(!fired);

    span.stopObserving("test:somethingHappened", observer);
    span.fire("test:somethingHappened");
    assert(!fired);
  });

  test('custom event bubbling', function () {
    var span = $("span"), outer = $("outer"), fired = false, observer = function(event) {
      assert.equal(span, event.element());
      fired = true;
    }.bind(this);

    outer.observe("test:somethingHappened", observer);
    span.fire("test:somethingHappened");
    assert(fired);

    fired = false;
    span.fire("test:somethingElseHappened");
    assert(!fired);

    outer.stopObserving("test:somethingHappened", observer);
    span.fire("test:somethingHappened");
    assert(!fired);
  });

  test('custom event canceling', function () {
    var span = $("span"), outer = $("outer"), inner = $("inner");
    var fired = false, stopped = false;

    function outerObserver(event) {
      fired = span == event.element();
    }

    function innerObserver(event) {
      event.stop();
      stopped = true;
    }

    inner.observe("test:somethingHappened", innerObserver);
    outer.observe("test:somethingHappened", outerObserver);
    span.fire("test:somethingHappened");
    assert(stopped);
    assert(!fired);

    fired = stopped = false;
    inner.stopObserving("test:somethingHappened", innerObserver);
    span.fire("test:somethingHappened");
    assert(!stopped);
    assert(fired);

    outer.stopObserving("test:somethingHappened", outerObserver);
  });

  test('event object is extended', function () {
    var span = $("span"), event, observedEvent, observer = function(e) { observedEvent = e; };
    span.observe("test:somethingHappened", observer);
    event = span.fire("test:somethingHappened");
    assert.equal(event, observedEvent);
    assert.equal(Event.Methods.stop.methodize(), event.stop);
    span.stopObserving("test:somethingHappened", observer);

    event = span.fire("test:somethingHappenedButNoOneIsListening");
    assert.equal(Event.Methods.stop.methodize(), event.stop);
  });

  test('event observers are bound to the observed element', function () {
    var span = $("span"), target, observer = function() { target = this; };

    span.observe("test:somethingHappened", observer);
    span.fire("test:somethingHappened");
    span.stopObserving("test:somethingHappened", observer);
    assert.equal(span, target);
    target = null;

    var outer = $("outer");
    outer.observe("test:somethingHappened", observer);
    span.fire("test:somethingHappened");
    outer.stopObserving("test:somethingHappened", observer);
    assert.equal(outer, target);
  });

  test('multiple custom event observers with the same handler', function () {
    var span = $("span"), count = 0, observer = function() { count++; };

    span.observe("test:somethingHappened", observer);
    span.observe("test:somethingElseHappened", observer);
    span.fire("test:somethingHappened");
    assert.equal(1, count);
    span.fire("test:somethingElseHappened");
    assert.equal(2, count);

  });

  test('multiple event handlers can be added and removed from an element', function () {
    var span = $("span"), count1 = 0, count2 = 0;
    var observer1 = function() { count1++; };
    var observer2 = function() { count2++; };

    span.observe("test:somethingHappened", observer1);
    span.observe("test:somethingHappened", observer2);
    span.fire("test:somethingHappened");
    assert.equal(1, count1);
    assert.equal(1, count2);

    span.stopObserving("test:somethingHappened", observer1);
    span.stopObserving("test:somethingHappened", observer2);
    span.fire("test:somethingHappened");
    assert.equal(1, count1);
    assert.equal(1, count2);
  });

  test('#stopObserving without arguments', function () {
    var span = $("span"), count = 0, observer = function() { count++; };

    span.observe("test:somethingHappened", observer);
    span.observe("test:somethingElseHappened", observer);
    span.stopObserving();
    span.fire("test:somethingHappened");
    assert.equal(0, count);
    span.fire("test:somethingElseHappened");
    assert.equal(0, count);
  });

  test('#stopObserving without handler argument', function () {
    var span = $("span"), count = 0, observer = function() { count++; };

    span.observe("test:somethingHappened", observer);
    span.observe("test:somethingElseHappened", observer);
    span.stopObserving("test:somethingHappened");
    span.fire("test:somethingHappened");
    assert.equal(0, count);
    span.fire("test:somethingElseHappened");
    assert.equal(1, count);
    span.stopObserving("test:somethingElseHappened");
    span.fire("test:somethingElseHappened");
    assert.equal(1, count);
  });

  test('#stopObserving removes handler from cache', function () {
    var span = $("span"), observer = Prototype.emptyFunction, eventID;

    span.observe("test:somethingHappened", observer);
    span.observe("test:somethingHappened", function() {});

    function uidForElement(elem) {
      return elem._prototypeUID;
    }

    var registry = Event.cache[uidForElement(span)];

    assert(registry, 'registry should exist');
    assert(Object.isArray(registry['test:somethingHappened']));
    assert.equal(2, registry['test:somethingHappened'].length);

    span.stopObserving("test:somethingHappened", observer);

    registry = Event.cache[uidForElement(span)];

    assert(registry);
    assert(Object.isArray(registry['test:somethingHappened']));
    assert.equal(1, registry['test:somethingHappened'].length);
  });

  test('last #stopObserving clears cache', function () {
    var span = $("span"), observer = Prototype.emptyFunction;
    delete Event.cache[uidForElement(span)];

    span.observe("test:somethingHappened", observer);
    span.observe("test:somethingElseHappened", observer);
    span.stopObserving("test:somethingElseHappened", observer);

    var registry = Event.cache[uidForElement(span)];
    assert(registry);

    span.stopObserving("test:somethingHappened", observer);

    registry = Event.cache[uidForElement(span)];

    assert(!registry, 'registry');
  });

  test('double #stopObserving - cache should be kept empty', function () {
    var span = $("span"), observer = Prototype.emptyFunction;
    delete Event.cache[uidForElement(span)];

    span.observe("test:somethingHappened", observer);
    span.stopObserving("test:somethingHappened", observer);
    span.stopObserving("test:somethingHappened", observer);

    assert(!Event.cache[uidForElement(span)], 'registry should be clear after 2 stopObserving');

    span.stopObserving("test:somethingHappened");

    assert(!Event.cache[uidForElement(span)], 'registry should be clear after stopObserving with no handler');

    span.stopObserving();

    assert(!Event.cache[uidForElement(span)], 'registry should be clear after stopObserving with no eventName');
  });

  test('#observe and #stopObserving are chainable', function () {
    var span = $("span"), observer = Prototype.emptyFunction;

    assert.equal(span, span.observe("test:somethingHappened", observer));
    assert.equal(span, span.stopObserving("test:somethingHappened", observer));

    span.observe("test:somethingHappened", observer);
    assert.equal(span, span.stopObserving("test:somethingHappened"));

    assert.equal(span, span.stopObserving("test:somethingOtherHappened", observer));

    span.observe("test:somethingHappened", observer);
    assert.equal(span, span.stopObserving());
    assert.equal(span, span.stopObserving()); // assert it again, after there are no observers

    span.observe("test:somethingHappened", observer);
    assert.equal(span, span.observe("test:somethingHappened", observer)); // try to reuse the same observer
    span.stopObserving();
  });

  test('document.loaded', function () {
    assert(!documentLoaded);
    assert(document.loaded);
  });

  test('document contentLoaded event fires before window load', function () {
    assert(eventResults.contentLoaded, "contentLoaded");
    assert(eventResults.contentLoaded.endOfDocument, "contentLoaded.endOfDocument");
    assert(!eventResults.contentLoaded.windowLoad, "!contentLoaded.windowLoad");
    assert(eventResults.windowLoad, "windowLoad");
    assert(eventResults.windowLoad.endOfDocument, "windowLoad.endOfDocument");
    assert(eventResults.windowLoad.contentLoaded, "windowLoad.contentLoaded");
  });

  test('event.stopped', function () {
    var span = $("span"), event;

    span.observe("test:somethingHappened", Prototype.emptyFunction);
    event = span.fire("test:somethingHappened");
    assert(!event.stopped, "event.stopped should be false with an empty observer");
    span.stopObserving("test:somethingHappened");

    span.observe("test:somethingHappened", function(e) { e.stop(); });
    event = span.fire("test:somethingHappened");
    assert(event.stopped, "event.stopped should be true for an observer that calls stop");
    span.stopObserving("test:somethingHappened");
  });

  test('non-bubbling custom event', function () {
    var span = $('span'), outer = $('outer'), event;

    var outerRespondedToEvent = false;
    outer.observe("test:bubbleEvent", function(e) { outerRespondedToEvent = true; });
    span.fire("test:bubbleEvent", {}, false);

    assert.equal(false, outerRespondedToEvent,
     'parent element should not respond to non-bubbling event fired on child');
  });

  test('#findElement', function () {
    var span = $("span"), event;
    event = span.fire("test:somethingHappened");
    assert.elementMatches(event.findElement(), 'span#span');
    assert.elementMatches(event.findElement('span'), 'span#span');
    assert.elementMatches(event.findElement('p'), 'p#inner');
    assert.equal(null, event.findElement('div.does_not_exist'));
    assert.elementMatches(event.findElement('.does_not_exist, span'), 'span#span');
  });

  test('event ID duplication', function () {
    $('event-container').down().observe("test:somethingHappened", Prototype.emptyFunction);
    $('event-container').innerHTML += $('event-container').innerHTML;
    assert.isUndefined($('event-container').down(1)._prototypeEventID);
  });

});

document.observe("dom:loaded", function(event) {
  eventResults.contentLoaded = {
    endOfDocument: eventResults.endOfDocument,
    windowLoad:    eventResults.windowLoad
  };
});

Event.observe(window, "load", function(event) {
  eventResults.windowLoad = {
    endOfDocument: eventResults.endOfDocument,
    contentLoaded: eventResults.contentLoaded
  };
});
