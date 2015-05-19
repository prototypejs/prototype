(function(GLOBAL) {
  /** section: DOM
   * class Event
   *
   *  The namespace for Prototype's event system.
   *
   *  ##### Events: a fine mess
   *
   *  Event management is one of the really sore spots of cross-browser
   *  scripting.
   *
   *  True, the prevalent issue is: everybody does it the W3C way, and MSIE
   *  does it another way altogether. But there are quite a few subtler,
   *  sneakier issues here and there waiting to bite your ankle &mdash; such as the
   *  `keypress`/`keydown` issue with KHTML-based browsers (Konqueror and
   *  Safari). Also, MSIE has a tendency to leak memory when it comes to
   *  discarding event handlers.
   *
   *  ##### Prototype to the rescue
   *
   *  Of course, Prototype smooths it over so well you'll forget these
   *  troubles even exist. Enter the [[Event]] namespace. It is replete with
   *  methods that help to normalize the information reported by events across
   *  browsers.
   *
   *  [[Event]] also provides a standardized list of key codes you can use with
   *  keyboard-related events, including `KEY_BACKSPACE`, `KEY_TAB`,
   *  `KEY_RETURN`, `KEY_ESC`, `KEY_LEFT`, `KEY_UP`, `KEY_RIGHT`, `KEY_DOWN`,
   *  `KEY_DELETE`, `KEY_HOME`, `KEY_END`, `KEY_PAGEUP`, `KEY_PAGEDOWN` and
   *  `KEY_INSERT`.
   *
   *  The functions you're most likely to use a lot are [[Event.observe]],
   *  [[Event.element]] and [[Event.stop]]. If your web app uses custom events,
   *  you'll also get a lot of mileage out of [[Event.fire]].
   *
   *  ##### Instance methods on event objects
   *  As of Prototype 1.6, all methods on the `Event` object are now also
   *  available as instance methods on the event object itself:
   *
   *  **Before**
   *
   *      $('foo').observe('click', respondToClick);
   *
   *      function respondToClick(event) {
   *        var element = Event.element(event);
   *        element.addClassName('active');
   *      }
   *
   *  **After**
   *
   *      $('foo').observe('click', respondToClick);
   *
   *      function respondToClick(event) {
   *        var element = event.element();
   *        element.addClassName('active');
   *      }
   *
   *  These methods are added to the event object through [[Event.extend]],
   *  in the same way that `Element` methods are added to DOM nodes through
   *  [[Element.extend]]. Events are extended automatically when handlers are
   *  registered with Prototype's [[Event.observe]] method; if you're using a
   *  different method of event registration, for whatever reason,you'll need to
   *  extend these events manually with [[Event.extend]].
  **/
  var DIV = document.createElement('div');
  var docEl = document.documentElement;
  var MOUSEENTER_MOUSELEAVE_EVENTS_SUPPORTED = 'onmouseenter' in docEl
   && 'onmouseleave' in docEl;

  var Event = {
    KEY_BACKSPACE: 8,
    KEY_TAB:       9,
    KEY_RETURN:   13,
    KEY_ESC:      27,
    KEY_LEFT:     37,
    KEY_UP:       38,
    KEY_RIGHT:    39,
    KEY_DOWN:     40,
    KEY_DELETE:   46,
    KEY_HOME:     36,
    KEY_END:      35,
    KEY_PAGEUP:   33,
    KEY_PAGEDOWN: 34,
    KEY_INSERT:   45
  };

  // We need to support three different event "modes":
  //  1. browsers with only DOM L2 Events (WebKit, FireFox);
  //  2. browsers with only IE's legacy events system (IE 6-8);
  //  3. browsers with _both_ systems (IE 9 and arguably Opera).
  //
  // Groups 1 and 2 are easy; group three is trickier.

  var isIELegacyEvent = function(event) { return false; };

  if (window.attachEvent) {
    if (window.addEventListener) {
      // Both systems are supported. We need to decide at runtime.
      // (Though Opera supports both systems, the event object appears to be
      // the same no matter which system is used. That means that this function
      // will always return `true` in Opera, but that's OK; it keeps us from
      // having to do a browser sniff.)
      isIELegacyEvent = function(event) {
        return !(event instanceof window.Event);
      };
    } else {
      // No support for DOM L2 events. All events will be legacy.
      isIELegacyEvent = function(event) { return true; };
    }
  }

  // The two systems have different ways of indicating which button was used
  // for a mouse event.
  var _isButton;

  function _isButtonForDOMEvents(event, code) {
    return event.which ? (event.which === code + 1) : (event.button === code);
  }

  var legacyButtonMap = { 0: 1, 1: 4, 2: 2 };
  function _isButtonForLegacyEvents(event, code) {
    return event.button === legacyButtonMap[code];
  }

  // In WebKit we have to account for when the user holds down the "meta" key.
  function _isButtonForWebKit(event, code) {
    switch (code) {
      case 0: return event.which == 1 && !event.metaKey;
      case 1: return event.which == 2 || (event.which == 1 && event.metaKey);
      case 2: return event.which == 3;
      default: return false;
    }
  }

  if (window.attachEvent) {
    if (!window.addEventListener) {
      // Legacy IE events only.
      _isButton = _isButtonForLegacyEvents;
    } else {
      // Both systems are supported; decide at runtime.
      _isButton = function(event, code) {
        return isIELegacyEvent(event) ? _isButtonForLegacyEvents(event, code) :
         _isButtonForDOMEvents(event, code);
      }
    }
  } else if (Prototype.Browser.WebKit) {
    _isButton = _isButtonForWebKit;
  } else {
    _isButton = _isButtonForDOMEvents;
  }

  /**
   *  Event.isLeftClick(@event) -> Boolean
   *  - event (Event): An Event object
   *
   *  Determines whether a button-related mouse event involved the left
   *  mouse button.
   *
   *  Keep in mind that the "left" mouse button is actually the "primary" mouse
   *  button. When a mouse is in left-handed mode, the browser will report
   *  clicks of the _right_ button as "left-clicks."
  **/
  function isLeftClick(event)   { return _isButton(event, 0) }

  /**
   *  Event.isMiddleClick(@event) -> Boolean
   *  - event (Event): An Event object
   *
   *  Determines whether a button-related mouse event involved the middle
   *  mouse button.
  **/
  function isMiddleClick(event) { return _isButton(event, 1) }

  /**
   *  Event.isRightClick(@event) -> Boolean
   *  - event (Event): An Event object
   *
   *  Determines whether a button-related mouse event involved the right
   *  mouse button.
   *
   *  Keep in mind that the "right" mouse button is actually the "secondary"
   *  mouse button. When a mouse is in left-handed mode, the browser will
   *  report clicks of the _left_ button as "left-clicks."
  **/
  function isRightClick(event)  { return _isButton(event, 2) }

  /** deprecated
   *  Event.element(@event) -> Element
   *  - event (Event): An Event object
   *
   *  Returns the DOM element on which the event occurred. This method
   *  is deprecated, use [[Event.findElement]] instead.
   *
   *  ##### Example
   *
   *  Here's a simple bit of code which hides any paragraph when directly clicked.
   *
   *      document.observe('click', function(event) {
   *        var element = Event.element(event);
   *        if ('P' == element.tagName)
   *          element.hide();
   *      });
   *
   *  ##### See also
   *
   *  There is a subtle distinction between this function and
   *  [[Event.findElement]].
   *
   *  ##### Note for Prototype 1.5.0
   *
   *  Note that prior to version 1.5.1, if the browser does not support
   *  *native DOM extensions* (see the [[Element]] section for further details),
   *  the element returned by [[Event.element]] might very well
   *  *not be extended*. If you intend to use methods from [[Element.Methods]]
   *  on it, you need to wrap the call in the [[$]] function like so:
   *
   *      document.observe('click', function(event) {
   *        var element = $(Event.element(event));
   *        // ...
   *      });
  **/
  function element(event) {
    // The public version of `Event.element` is a thin wrapper around the
    // private `_element` method below. We do this so that we can use it
    // internally as `_element` without having to extend the node.
    return Element.extend(_element(event));
  }

  function _element(event) {
    event = Event.extend(event);

    var node = event.target, type = event.type,
     currentTarget = event.currentTarget;

    if (currentTarget && currentTarget.tagName) {
      // Firefox screws up the "click" event when moving between radio buttons
      // via arrow keys. It also screws up the "load" and "error" events on images,
      // reporting the document as the target instead of the original image.
      if (type === 'load' || type === 'error' ||
        (type === 'click' && currentTarget.tagName.toLowerCase() === 'input'
          && currentTarget.type === 'radio'))
            node = currentTarget;
    }

    // Fix a Safari bug where a text node gets passed as the target of an
    // anchor click rather than the anchor itself.
    return node.nodeType == Node.TEXT_NODE ? node.parentNode : node;
  }

  /**
   *  Event.findElement(@event[, expression]) -> Element
   *  - event (Event): An Event object
   *  - expression (String): An optional CSS selector
   *
   *  Returns the first DOM element that matches a given CSS selector &mdash;
   *  starting with the element on which the event occurred, then moving up
   *  its ancestor chain. If `expression` is not given, the element which fired
   *  the event is returned.
   *
   *  *If no matching element is found, `undefined` is returned.*
   *
   *  ##### Example
   *
   *  Here's a simple example that lets you click everywhere on the page and
   *  hides the closest-fitting paragraph around your click (if any).
   *
   *      document.observe('click', function(event) {
   *        var element = event.findElement('p');
   *        if (element)
   *          $(element).hide();
   *      });
  **/
  function findElement(event, expression) {
    var element = _element(event), selector = Prototype.Selector;
    if (!expression) return Element.extend(element);
    while (element) {
      if (Object.isElement(element) && selector.match(element, expression))
        return Element.extend(element);
      element = element.parentNode;
    }
  }

  /**
   *  Event.pointer(@event) -> Object
   *
   *  Returns the absolute position of the pointer for a mouse event.
   *
   *  Returns an object in the form `{ x: Number, y: Number}`.
   *
   *  Note that this position is absolute on the _page_, not on the
   *  _viewport_.
  **/
  function pointer(event) {
    return { x: pointerX(event), y: pointerY(event) };
  }

  /**
   *  Event.pointerX(@event) -> Number
   *
   *  Returns the absolute horizontal position of the pointer for a mouse
   *  event.
   *
   *  Note that this position is absolute on the `<body>`, not on the
   *  viewport: scrolling right increases the returned value for events on
   *  the same viewport location.
  **/
  function pointerX(event) {
    var docElement = document.documentElement,
     body = document.body || { scrollLeft: 0 };

    return event.pageX || (event.clientX +
      (docElement.scrollLeft || body.scrollLeft) -
      (docElement.clientLeft || 0));
  }

  /**
   *  Event.pointerY(@event) -> Number
   *
   *  Returns the absolute vertical position of the pointer for a mouse
   *  event.
   *
   *  Note that this position is absolute on the `<body>`, not on the
   *  viewport: scrolling down increases the returned value for events on
   *  the same viewport location.
  **/
  function pointerY(event) {
    var docElement = document.documentElement,
     body = document.body || { scrollTop: 0 };

    return  event.pageY || (event.clientY +
       (docElement.scrollTop || body.scrollTop) -
       (docElement.clientTop || 0));
  }


  /**
   *  Event.stop(@event) -> undefined
   *
   *  Stops the event's propagation and prevents its eventual default action
   *  from being triggered.
   *
   *  Stopping an event also sets a `stopped` property on that event for
   *  future inspection.
   *
   *  There are two aspects to how your browser handles an event once it fires up:
   *
   *  1. The browser usually triggers event handlers on the actual element the
   *  event occurred on, then on its parent element, and so on and so forth,
   *  until the document's root element is reached. This is called
   *  *event bubbling*, and is the most common form of event propagation. You
   *  may very well want to stop this propagation when you just handled an event,
   *  and don't want it to keep bubbling up (or see no need for it).
   *
   *  2. Once your code had a chance to process the event, the browser handles
   *  it as well, if that event has a *default behavior*. For instance, clicking
   *  on links navigates to them; submitting forms sends them over to the server
   *  side; hitting the Return key in a single-line form field submits it; etc.
   *  You may very well want to prevent this default behavior if you do your own
   *  handling.
   *
   *  Because stopping one of those aspects means, in 99.9% of the cases,
   *  preventing the other one as well, Prototype bundles both in this `stop`
   *  function. Calling it on an event object, stops propagation *and* prevents
   *  the default behavior.
   *
   *  ##### Example
   *
   *  Here's a simple script that prevents a form from being sent to the server
   *  side if certain field is empty.
   *
   *      Event.observe('signinForm', 'submit', function(event) {
   *        var login = $F('login').strip();
   *        if ('' == login) {
   *          Event.stop(event);
   *          // Display the issue one way or another
   *        }
   *      });
  **/
  function stop(event) {
    Event.extend(event);
    event.preventDefault();
    event.stopPropagation();

    // Set a "stopped" property so that a custom event can be inspected
    // after the fact to determine whether or not it was stopped.
    event.stopped = true;
  }


  Event.Methods = {
    isLeftClick:   isLeftClick,
    isMiddleClick: isMiddleClick,
    isRightClick:  isRightClick,

    element:     element,
    findElement: findElement,

    pointer:  pointer,
    pointerX: pointerX,
    pointerY: pointerY,

    stop: stop
  };

  // Compile the list of methods that get extended onto Events.
  var methods = Object.keys(Event.Methods).inject({ }, function(m, name) {
    m[name] = Event.Methods[name].methodize();
    return m;
  });

  if (window.attachEvent) {
    // For IE's event system, we need to do some work to make the event
    // object behave like a standard event object.
    function _relatedTarget(event) {
      var element;
      switch (event.type) {
        case 'mouseover':
        case 'mouseenter':
          element = event.fromElement;
          break;
        case 'mouseout':
        case 'mouseleave':
          element = event.toElement;
          break;
        default:
          return null;
      }
      return Element.extend(element);
    }

    // These methods should be added _only_ to legacy IE event objects.
    var additionalMethods = {
      stopPropagation: function() { this.cancelBubble = true },
      preventDefault:  function() { this.returnValue = false },
      inspect: function() { return '[object Event]' }
    };

    /**
     *  Event.extend(@event) -> Event
     *  - event (Event): An Event object
     *
     *  Extends `event` with all of the methods contained in `Event.Methods`.
     *
     *  Note that all events inside handlers that were registered using
     *  [[Event.observe]] or [[Element.observe]] will be extended automatically.
     *
     *  You need only call `Event.extend` manually if you register a handler a
     *  different way (e.g., the `onclick` attribute). We really can't encourage
     *  that sort of thing, though.
    **/
    // IE's method for extending events.
    Event.extend = function(event, element) {
      if (!event) return false;

      // If it's not a legacy event, it doesn't need extending.
      if (!isIELegacyEvent(event)) return event;

      // Mark this event so we know not to extend a second time.
      if (event._extendedByPrototype) return event;
      event._extendedByPrototype = Prototype.emptyFunction;

      var pointer = Event.pointer(event);

      // The optional `element` argument gives us a fallback value for the
      // `target` property in case IE doesn't give us through `srcElement`.
      Object.extend(event, {
        target: event.srcElement || element,
        relatedTarget: _relatedTarget(event),
        pageX:  pointer.x,
        pageY:  pointer.y
      });

      Object.extend(event, methods);
      Object.extend(event, additionalMethods);

      return event;
    };
  } else {
    // Only DOM events, so no manual extending necessary.
    Event.extend = Prototype.K;
  }

  if (window.addEventListener) {
    // In all browsers that support DOM L2 Events, we can augment
    // `Event.prototype` directly.
    Event.prototype = window.Event.prototype || document.createEvent('HTMLEvents').__proto__;
    Object.extend(Event.prototype, methods);
  }

  //
  // EVENT REGISTRY
  //
  var EVENT_TRANSLATIONS = {
    mouseenter: 'mouseover',
    mouseleave: 'mouseout'
  };

  function getDOMEventName(eventName) {
    return EVENT_TRANSLATIONS[eventName] || eventName;
  }

  if (MOUSEENTER_MOUSELEAVE_EVENTS_SUPPORTED)
    getDOMEventName = Prototype.K;

  function getUniqueElementID(element) {
    if (element === window) return 0;

    // Need to use actual `typeof` operator to prevent errors in some
    // environments when accessing node expandos.
    if (typeof element._prototypeUID === 'undefined')
      element._prototypeUID = Element.Storage.UID++;
    return element._prototypeUID;
  }

  // In Internet Explorer, DOM nodes have a `uniqueID` property. Saves us
  // from inventing our own.
  function getUniqueElementID_IE(element) {
    if (element === window) return 0;
    // The document object's `uniqueID` property changes each time you read it.
    if (element == document) return 1;
    return element.uniqueID;
  }

  if ('uniqueID' in DIV)
    getUniqueElementID = getUniqueElementID_IE;

  function isCustomEvent(eventName) {
    return eventName.include(':');
  }

  Event._isCustomEvent = isCustomEvent;

  // These two functions take an optional UID as a second argument so that we
  // can skip lookup if we've already got the element's UID.
  function getOrCreateRegistryFor(element, uid) {
    var CACHE = GLOBAL.Event.cache;
    if (Object.isUndefined(uid))
      uid = getUniqueElementID(element);
    if (!CACHE[uid]) CACHE[uid] = { element: element };
    return CACHE[uid];
  }

  function destroyRegistryForElement(element, uid) {
    if (Object.isUndefined(uid))
      uid = getUniqueElementID(element);
    delete GLOBAL.Event.cache[uid];
  }

  // The `register` and `unregister` functions handle creating the responder
  // and managing an event registry. They _don't_ attach and detach the
  // listeners themselves.

  // Add an event to the element's event registry.
  function register(element, eventName, handler) {
    var registry = getOrCreateRegistryFor(element);
    if (!registry[eventName]) registry[eventName] = [];
    var entries = registry[eventName];

    // Make sure this handler isn't already attached.
    var i = entries.length;
    while (i--)
      if (entries[i].handler === handler) return null;

    var uid = getUniqueElementID(element);
    var responder = GLOBAL.Event._createResponder(uid, eventName, handler);
    var entry = {
      responder: responder,
      handler:   handler
    };

    entries.push(entry);
    return entry;
  }

  // Remove an event from the element's event registry.
  function unregister(element, eventName, handler) {
    var registry = getOrCreateRegistryFor(element);
    var entries = registry[eventName] || [];

    // Looking for entry:
    var i = entries.length, entry;
    while (i--) {
      if (entries[i].handler === handler) {
        entry = entries[i];
        break;
      }
    }

    if (entry) {
      // Remove the entry from the collection;
      var index = entries.indexOf(entry);
      entries.splice(index, 1);
    }

    // Last entry for given event was deleted?
    if (entries.length === 0) {
      // We can destroy the registry's entry for this event name...
      delete registry[eventName];
      // ...and we we should destroy the whole registry if there are no other
      // events.
      if (Object.keys(registry).length === 1 && ('element' in registry))
        destroyRegistryForElement(element);
    }

    return entry;
  }


  //
  // EVENT OBSERVING
  //
  /**
   *  Event.observe(element, eventName, handler) -> Element
   *  - element (Element | String): The DOM element to observe, or its ID.
   *  - eventName (String): The name of the event, in all lower case, without
   *    the "on" prefix&nbsp;&mdash; e.g., "click" (not "onclick").
   *  - handler (Function): The function to call when the event occurs.
   *
   *  Registers an event handler on a DOM element. Aliased as [[Element#observe]].
   *
   *  [[Event.observe]] smooths out a variety of differences between browsers
   *  and provides some handy additional features as well. Key features in brief:
   *  * Several handlers can be registered for the same event on the same element.
   *  * Prototype figures out whether to use `addEventListener` (W3C standard) or
   *    `attachEvent` (MSIE); you don't have to worry about it.
   *  * The handler is passed an _extended_ [[Event]] object (even on MSIE).
   *  * The handler's context (`this` value) is set to the extended element
   *    being observed (even if the event actually occurred on a descendent
   *    element and bubbled up).
   *  * Prototype handles cleaning up the handler when leaving the page
   *    (important for MSIE memory leak prevention).
   *  * [[Event.observe]] makes it possible to stop observing the event easily
   *    via [[Event.stopObserving]].
   *  * Adds support for `mouseenter` / `mouseleave` events in all browsers.
   *
   *  Although you can use [[Event.observe]] directly and there are times when
   *  that's the most convenient or direct way, it's more common to use its
   *  alias [[Element#observe]]. These two statements have the same effect:
   *
   *      Event.observe('foo', 'click', myHandler);
   *      $('foo').observe('click', myHandler);
   *
   *  The examples in this documentation use the [[Element#observe]] form.
   *
   *  ##### The Handler
   *
   *  Signature:
   *
   *      function handler(event) {
   *        // `this` = the element being observed
   *      }
   *
   *  So for example, this will turn the background of the element 'foo' blue
   *  when it's clicked:
   *
   *      $('foo').observe('click', function(event) {
   *        this.setStyle({backgroundColor: 'blue'});
   *      });
   *
   *  Note that we used `this` to refer to the element, and that we received the
   *  `event` object as a parameter (even on MSIE).
   *
   *  ##### It's All About Timing
   *
   *  One of the most common errors trying to observe events is trying to do it
   *  before the element exists in the DOM. Don't try to observe elements until
   *  after the [[document.observe dom:loaded]] event or `window` `load` event
   *  has been fired.
   *
   *  ##### Preventing the Default Event Action and Bubbling
   *
   *  If we want to stop the event (e.g., prevent its default action and stop it
   *  bubbling), we can do so with the extended event object's [[Event#stop]]
   *  method:
   *
   *      $('foo').observe('click', function(event) {
   *        event.stop();
   *      });
   *
   *  ##### Finding the Element Where the Event Occurred
   *
   *  Since most events bubble from descendant elements up through the hierarchy
   *  until they're handled, we can observe an event on a container rather than
   *  individual elements within the container. This is sometimes called "event
   *  delegation". It's particularly handy for tables:
   *
   *      language: html
   *      <table id='records'>
   *        <thead>
   *          <tr><th colspan='2'>No record clicked</th></tr>
   *        </thead>
   *        <tbody>
   *          <tr data-recnum='1'><td>1</td><td>First record</td></tr>
   *          <tr data-recnum='2'><td>2</td><td>Second record</td></tr>
   *          <tr data-recnum='3'><td>3</td><td>Third record</td></tr>
   *        </tbody>
   *      </table>
   *
   *  Instead of observing each cell or row, we can simply observe the table:
   *
   *      $('records').observe('click', function(event) {
   *        var clickedRow = event.findElement('tr');
   *        if (clickedRow) {
   *          this.down('th').update("You clicked record #" + clickedRow.readAttribute("data-recnum"));
   *        }
   *      });
   *
   *  When any row in the table is clicked, we update the table's first header
   *  cell saying which record was clicked. [[Event#findElement]] finds the row
   *  that was clicked, and `this` refers to the table we were observing.
   *
   *  ##### Stopping Observing the Event
   *
   *  If we don't need to observe the event anymore, we can stop observing it
   *  with [[Event.stopObserving]] or its [[Element#stopObserving]] alias.
   *
   *  ##### Using an Instance Method as a Handler
   *
   *  If we want to use an instance method as a handler, we will probably want
   *  to use [[Function#bind]] to set the handler's context; otherwise, the
   *  context will be lost and `this` won't mean what we expect it to mean
   *  within the handler function. E.g.:
   *
   *      var MyClass = Class.create({
   *        initialize: function(name, element) {
   *          this.name = name;
   *          element = $(element);
   *          if (element) {
   *            element.observe(this.handleClick.bind(this));
   *          }
   *        },
   *        handleClick: function(event) {
   *          alert("My name is " + this.name);
   *        },
   *      });
   *
   *  Without the [[Function#bind]], when `handleClick` was triggered by the
   *  event, `this` wouldn't refer to the instance and so the alert wouldn't
   *  show the name. Because we used [[Function#bind]], it works correctly. See
   *  [[Function#bind]] for details. There's also [[Function#bindAsEventListener]],
   *  which is handy for certain very specific situations. (Normally,
   *  [[Function#bind]] is all you need.)
   *
   *  ##### Side Notes
   *
   *  Although Prototype smooths out most of the differences between browsers,
   *  the fundamental behavior of a browser implementation isn't changed. For
   *  example, the timing of the `change` or `blur` events varies a bit from
   *  browser to browser.
   *
   *  ##### Changes in 1.6.x
   *
   *  Prior to Prototype 1.6, [[Event.observe]] supported a fourth argument
   *  (`useCapture`), a boolean that indicated whether to use the browser's
   *  capturing phase or its bubbling phase. Since MSIE does not support the
   *  capturing phase, we removed this argument from 1.6, lest it give users the
   *  false impression that they can use the capturing phase in all browsers.
   *
   *  1.6 also introduced setting the `this` context to the element being
   *  observed, automatically extending the [[Event]] object, and the
   *  [[Event#findElement]] method.
  **/
  function observe(element, eventName, handler) {
    element = $(element);
    var entry = register(element, eventName, handler);

    if (entry === null) return element;

    var responder = entry.responder;
    if (isCustomEvent(eventName))
      observeCustomEvent(element, eventName, responder);
    else
      observeStandardEvent(element, eventName, responder);

    return element;
  }

  function observeStandardEvent(element, eventName, responder) {
    var actualEventName = getDOMEventName(eventName);
    if (element.addEventListener) {
      element.addEventListener(actualEventName, responder, false);
    } else {
      element.attachEvent('on' + actualEventName, responder);
    }
  }

  function observeCustomEvent(element, eventName, responder) {
    if (element.addEventListener) {
      element.addEventListener('dataavailable', responder, false);
    } else {
      // We observe two IE-proprietarty events: one for custom events that
      // bubble and one for custom events that do not bubble.
      element.attachEvent('ondataavailable', responder);
      element.attachEvent('onlosecapture',   responder);
    }
  }

  /**
   *  Event.stopObserving(element[, eventName[, handler]]) -> Element
   *  - element (Element | String): The element to stop observing, or its ID.
   *  - eventName (String): _(Optional)_ The name of the event to stop
   *    observing, in all lower case, without the "on"&nbsp;&mdash; e.g.,
   *    "click" (not "onclick").
   *  - handler (Function): _(Optional)_ The handler to remove; must be the
   *    _exact same_ reference that was passed to [[Event.observe]].
   *
   *  Unregisters one or more event handlers.
   *
   *  If `handler` is omitted, unregisters all event handlers on `element`
   *  for that `eventName`. If `eventName` is also omitted, unregisters _all_
   *  event handlers on `element`. (In each case, only affects handlers
   *  registered via Prototype.)
   *
   *  ##### Examples
   *
   *  Assuming:
   *
   *      $('foo').observe('click', myHandler);
   *
   *  ...we can stop observing using that handler like so:
   *
   *      $('foo').stopObserving('click', myHandler);
   *
   *  If we want to remove _all_ 'click' handlers from 'foo', we leave off the
   *  handler argument:
   *
   *      $('foo').stopObserving('click');
   *
   *  If we want to remove _all_ handlers for _all_ events from 'foo' (perhaps
   *  we're about to remove it from the DOM), we simply omit both the handler
   *  and the event name:
   *
   *      $('foo').stopObserving();
   *
   *  ##### A Common Error
   *
   *  When using instance methods as observers, it's common to use
   *  [[Function#bind]] on them, e.g.:
   *
   *      $('foo').observe('click', this.handlerMethod.bind(this));
   *
   *  If you do that, __this will not work__ to unregister the handler:
   *
   *      $('foo').stopObserving('click', this.handlerMethod.bind(this)); // <== WRONG
   *
   *  [[Function#bind]] returns a _new_ function every time it's called, and so
   *  if you don't retain the reference you used when observing, you can't
   *  unhook that function specifically. (You can still unhook __all__ handlers
   *  for an event, or all handlers on the element entirely.)
   *
   *  To do this, you need to keep a reference to the bound function:
   *
   *      this.boundHandlerMethod = this.handlerMethod.bind(this);
   *      $('foo').observe('click', this.boundHandlerMethod);
   *
   *  ...and then to remove:
   *
   *      $('foo').stopObserving('click', this.boundHandlerMethod); // <== Right
  **/
  function stopObserving(element, eventName, handler) {
    element = $(element);
    var handlerGiven = !Object.isUndefined(handler),
     eventNameGiven = !Object.isUndefined(eventName);

    if (!eventNameGiven && !handlerGiven) {
      stopObservingElement(element);
      return element;
    }

    if (!handlerGiven) {
      stopObservingEventName(element, eventName);
      return element;
    }

    var entry = unregister(element, eventName, handler);

    if (!entry) return element;
    removeEvent(element, eventName, entry.responder);
    return element;
  }

  function stopObservingStandardEvent(element, eventName, responder) {
    var actualEventName = getDOMEventName(eventName);
    if (element.removeEventListener) {
      element.removeEventListener(actualEventName, responder, false);
    } else {
      element.detachEvent('on' + actualEventName, responder);
    }
  }

  function stopObservingCustomEvent(element, eventName, responder) {
    if (element.removeEventListener) {
      element.removeEventListener('dataavailable', responder, false);
    } else {
      element.detachEvent('ondataavailable', responder);
      element.detachEvent('onlosecapture',   responder);
    }
  }


  // The `stopObservingElement` and `stopObservingEventName` functions are
  // for bulk removal of event listeners. We use them rather than recurse
  // back into `stopObserving` to avoid touching the registry more often than
  // necessary.

  // Stop observing _all_ listeners on an element.
  function stopObservingElement(element) {
    // Do a manual registry lookup because we don't want to create a registry
    // if one doesn't exist.
    var uid = getUniqueElementID(element), registry = GLOBAL.Event.cache[uid];
    // This way we can return early if there is no registry.
    if (!registry) return;

    destroyRegistryForElement(element, uid);

    var entries, i;
    for (var eventName in registry) {
      // Explicitly skip elements so we don't accidentally find one with a
      // `length` property.
      if (eventName === 'element') continue;

      entries = registry[eventName];
      i = entries.length;
      while (i--)
        removeEvent(element, eventName, entries[i].responder);
    }
  }

  // Stop observing all listeners of a certain event name on an element.
  function stopObservingEventName(element, eventName) {
    var registry = getOrCreateRegistryFor(element);
    var entries = registry[eventName];
    if (entries) {
      delete registry[eventName];
    }
    
    entries = entries || [];

    var i = entries.length;
    while (i--)
      removeEvent(element, eventName, entries[i].responder);

    for (var name in registry) {
      if (name === 'element') continue;
      return; // There is another registered event
    }

    // No other events for the element, destroy the registry:
    destroyRegistryForElement(element);
  }


  function removeEvent(element, eventName, handler) {
    if (isCustomEvent(eventName))
      stopObservingCustomEvent(element, eventName, handler);
    else
      stopObservingStandardEvent(element, eventName, handler);
  }



  // FIRING CUSTOM EVENTS
  function getFireTarget(element) {
    if (element !== document) return element;
    if (document.createEvent && !element.dispatchEvent)
      return document.documentElement;
    return element;
  }

  /**
   *  Event.fire(element, eventName[, memo[, bubble = true]]) -> Event
   *  - memo (?): Metadata for the event. Will be accessible to event
   *    handlers through the event's `memo` property.
   *  - bubble (Boolean): Whether the event should bubble.
   *
   *  Fires a custom event of name `eventName` with `element` as its target.
   *
   *  Custom events **must** include a colon (`:`) in their names.
  **/
  function fire(element, eventName, memo, bubble) {
    element = getFireTarget($(element));
    if (Object.isUndefined(bubble)) bubble = true;
    memo = memo || {};

    var event = fireEvent(element, eventName, memo, bubble);
    return Event.extend(event);
  }

  function fireEvent_DOM(element, eventName, memo, bubble) {
    var event = document.createEvent('HTMLEvents');
    event.initEvent('dataavailable', bubble, true);

    event.eventName = eventName;
    event.memo = memo;

    element.dispatchEvent(event);
    return event;
  }

  function fireEvent_IE(element, eventName, memo, bubble) {
    var event = document.createEventObject();
    event.eventType = bubble ? 'ondataavailable' : 'onlosecapture';

    event.eventName = eventName;
    event.memo = memo;

    element.fireEvent(event.eventType, event);
    return event;
  }

  var fireEvent = document.createEvent ? fireEvent_DOM : fireEvent_IE;


  // EVENT DELEGATION

  /**
   *  class Event.Handler
   *
   *  Creates an observer on an element that listens for a particular event on
   *  that element's descendants, optionally filtering by a CSS selector.
   *
   *  This class simplifies the common "event delegation" pattern, in which one
   *  avoids adding an observer to a number of individual elements and instead
   *  listens on a _common ancestor_ element.
   *
   *  For more information on usage, see [[Event.on]].
  **/
  Event.Handler = Class.create({
    /**
     *  new Event.Handler(element, eventName[, selector], callback)
     *  - element (Element): The element to listen on.
     *  - eventName (String): An event to listen for. Can be a standard browser
     *    event or a custom event.
     *  - selector (String): A CSS selector. If specified, will call `callback`
     *    _only_ when it can find an element that matches `selector` somewhere
     *    in the ancestor chain between the event's target element and the
     *    given `element`.
     *  - callback (Function): The event handler function. Should expect two
     *    arguments: the event object _and_ the element that received the
     *    event. (If `selector` was given, this element will be the one that
     *    satisfies the criteria described just above; if not, it will be the
     *    one specified in the `element` argument).
     *
     *  Instantiates an `Event.Handler`. **Will not** begin observing until
     *  [[Event.Handler#start]] is called.
    **/
    initialize: function(element, eventName, selector, callback) {
      this.element   = $(element);
      this.eventName = eventName;
      this.selector  = selector;
      this.callback  = callback;
      this.handler   = this.handleEvent.bind(this);
    },


    /**
     *  Event.Handler#start -> Event.Handler
     *
     *  Starts listening for events. Returns itself.
    **/
    start: function() {
      Event.observe(this.element, this.eventName, this.handler);
      return this;
    },

    /**
     *  Event.Handler#stop -> Event.Handler
     *
     *  Stops listening for events. Returns itself.
    **/
    stop: function() {
      Event.stopObserving(this.element, this.eventName, this.handler);
      return this;
    },

    handleEvent: function(event) {
      var element = Event.findElement(event, this.selector);
      if (element) this.callback.call(this.element, event, element);
    }
  });

  /**
   *  Event.on(element, eventName[, selector], callback) -> Event.Handler
   *  - element (Element | String): The DOM element to observe, or its ID.
   *  - eventName (String): The name of the event, in all lower case, without
   *    the "on" prefix&nbsp;&mdash; e.g., "click" (not "onclick").
   *  - selector (String): A CSS selector. If specified, will call `callback`
   *    _only_ when it can find an element that matches `selector` somewhere
   *    in the ancestor chain between the event's target element and the
   *    given `element`.
   *  - callback (Function): The event handler function. Should expect two
   *    arguments: the event object _and_ the element that received the
   *    event. (If `selector` was given, this element will be the one that
   *    satisfies the criteria described just above; if not, it will be the
   *    one specified in the `element` argument). This function is **always**
   *    bound to `element`.
   *
   *  Listens for events on an element's descendants, optionally filtering
   *  to match a given CSS selector.
   *
   *  Creates an instance of [[Event.Handler]], calls [[Event.Handler#start]],
   *  then returns that instance. Keep a reference to this returned instance if
   *  you later want to unregister the observer.
   *
   *  ##### Usage
   *
   *  `Event.on` can be used to set up event handlers with or without event
   *  delegation. In its simplest form, it works just like [[Event.observe]]:
   *
   *      $("messages").on("click", function(event) {
   *        // ...
   *      });
   *
   *  An optional second argument lets you specify a CSS selector for event
   *  delegation. This encapsulates the pattern of using [[Event#findElement]]
   *  to retrieve the first ancestor element matching a specific selector.
   *
   *      $("messages").on("click", "a.comment", function(event, element) {
   *         // ...
   *      });
   *
   *  Note the second argument in the handler above: it references the
   *  element matched by the selector (in this case, an `a` tag with a class
   *  of `comment`). This argument is important to use because within the
   *  callback, the `this` keyword **will always refer to the original
   *  element** (in this case, the element with the id of `messages`).
   *
   *  `Event.on` differs from `Event.observe` in one other important way:
   *  its return value is an instance of [[Event.Handler]]. This instance
   *  has a `stop` method that will remove the event handler when invoked
   *  (and a `start` method that will attach the event handler again after
   *  it's been removed).
   *
   *      // Register the handler:
   *      var handler = $("messages").on("click", "a.comment",
   *       this.click.bind(this));
   *
   *      // Unregister the handler:
   *      handler.stop();
   *
   *      // Re-register the handler:
   *      handler.start();
   *
   *  This means that, unlike `Event.stopObserving`, there's no need to
   *  retain a reference to the handler function.
  **/
  function on(element, eventName, selector, callback) {
    element = $(element);
    if (Object.isFunction(selector) && Object.isUndefined(callback)) {
      callback = selector, selector = null;
    }

    return new Event.Handler(element, eventName, selector, callback).start();
  }

  Object.extend(Event, Event.Methods);

  Object.extend(Event, {
    fire:          fire,
    observe:       observe,
    stopObserving: stopObserving,
    on:            on
  });

  Element.addMethods({
    /**
     *  Element.fire(@element, eventName[, memo[, bubble = true]]) -> Event
     *
     *  See [[Event.fire]].
     *
     *  Fires a custom event with the current element as its target.
     *
     *  [[Element.fire]] creates a custom event with the given name, then triggers
     *  it on the given element. The custom event has all the same properties
     *  and methods of native events. Like a native event, it will bubble up
     *  through the DOM unless its propagation is explicitly stopped.
     *
     *  The optional second argument will be assigned to the `memo` property of
     *  the event object so that it can be read by event handlers.
     *
     *  Custom events are dispatched synchronously: [[Element.fire]] waits until
     *  the event finishes its life cycle, then returns the event itself.
     *
     *  ##### Note
     *
     *  [[Element.fire]] does not support firing native events. All custom event
     *  names _must_ be namespaced (using a colon). This is to avoid custom
     *  event names conflicting with non-standard native DOM events such as
     *  `mousewheel` and `DOMMouseScroll`.
     *
     *  ##### Examples
     *
     *      document.observe("widget:frobbed", function(event) {
     *        console.log("Element with ID (" + event.target.id +
     *         ") frobbed widget #" + event.memo.widgetNumber + ".");
     *      });
     *
     *      var someNode = $('foo');
     *      someNode.fire("widget:frobbed", { widgetNumber: 19 });
     *
     *      //-> "Element with ID (foo) frobbed widget #19."
     *
     *  ##### Tip
     *
     *  Events that have been stopped with [[Event.stop]] will have a boolean
     *  `stopped` property set to true. Since [[Element.fire]] returns the custom
     *  event, you can inspect this property to determine whether the event was
     *  stopped.
    **/
    fire:          fire,

    /**
     *  Element.observe(@element, eventName, handler) -> Element
     *
     *  See [[Event.observe]].
    **/
    observe:       observe,

    /**
     *  Element.stopObserving(@element[, eventName[, handler]]) -> Element
     *
     *  See [[Event.stopObserving]].
    **/
    stopObserving: stopObserving,

    /**
     *  Element.on(@element, eventName[, selector], callback) -> Element
     *
     *  See [[Event.on]].
    **/
    on:            on
  });

  /** section: DOM
   *  document
   *
   *  Prototype extends the built-in `document` object with several convenience
   *  methods related to events.
  **/
  Object.extend(document, {
    /**
     *  document.fire(eventName[, memo[, bubble = true]]) -> Event
     *  - memo (?): Metadata for the event. Will be accessible through the
     *    event's `memo` property.
     *  - bubble (Boolean): Whether the event will bubble.
     *
     *  Fires a custom event of name `eventName` with `document` as the target.
     *
     *  `document.fire` is the document-wide version of [[Element.fire]].
     *
     *  Custom events must include a colon (`:`) in their names.
    **/
    fire:          fire.methodize(),

    /**
     *  document.observe(eventName, handler) -> Element
     *
     *  Listens for the given event over the entire document. Can also be used
     *  for listening to `"dom:loaded"` event.
     *
     *  [[document.observe]] is the document-wide version of [[Element#observe]].
     *  Using [[document.observe]] is equivalent to
     *  `Event.observe(document, eventName, handler)`.
     *
     *  ##### The `"dom:loaded"` event
     *
     *  One really useful event generated by Prototype that you might want to
     *  observe on the document is `"dom:loaded"`. On supporting browsers it
     *  fires on `DOMContentLoaded` and on unsupporting browsers it simulates it
     *  using smart workarounds. If you used `window.onload` before you might
     *  want to switch to `dom:loaded` because it will fire immediately after
     *  the HTML document is fully loaded, but _before_ images on the page are
     *  fully loaded. The `load` event on `window` only fires after all page
     *  images are loaded, making it unsuitable for some initialization purposes
     *  like hiding page elements (so they can be shown later).
     *
     *  ##### Example
     *
     *      document.observe("dom:loaded", function() {
     *        // initially hide all containers for tab content
     *        $$('div.tabcontent').invoke('hide');
     *      });
    **/
    observe:       observe.methodize(),

    /**
     *  document.stopObserving([eventName[, handler]]) -> Element
     *
     *  Unregisters an event handler from the document.
     *
     *  [[document.stopObserving]] is the document-wide version of
     *  [[Element.stopObserving]].
    **/
    stopObserving: stopObserving.methodize(),

    /**
     *  document.on(@element, eventName[, selector], callback) -> Event.Handler
     *
     *  See [[Event.on]].
    **/
    on:            on.methodize(),

    /**
     *  document.loaded -> Boolean
     *
     *  Whether the full DOM tree is ready for manipulation.
    **/
    loaded:        false
  });

  // Export to the global scope.
  if (GLOBAL.Event) Object.extend(window.Event, Event);
  else GLOBAL.Event = Event;

  GLOBAL.Event.cache = {};

  function destroyCache_IE() {
    GLOBAL.Event.cache = null;
  }

  if (window.attachEvent)
    window.attachEvent('onunload', destroyCache_IE);

  DIV = null;
  docEl = null;
})(this);

(function(GLOBAL) {
  /* Code for creating leak-free event responders is based on work by
   John-David Dalton. */

  var docEl = document.documentElement;
  var MOUSEENTER_MOUSELEAVE_EVENTS_SUPPORTED = 'onmouseenter' in docEl
    && 'onmouseleave' in docEl;

  function isSimulatedMouseEnterLeaveEvent(eventName) {
    return !MOUSEENTER_MOUSELEAVE_EVENTS_SUPPORTED &&
     (eventName === 'mouseenter' || eventName === 'mouseleave');
  }

  // The functions for creating responders accept the element's UID rather
  // than the element itself. This way, there are _no_ DOM objects inside the
  // closure we create, meaning there's no need to unregister event listeners
  // on unload.
  function createResponder(uid, eventName, handler) {
    if (Event._isCustomEvent(eventName))
      return createResponderForCustomEvent(uid, eventName, handler);
    if (isSimulatedMouseEnterLeaveEvent(eventName))
      return createMouseEnterLeaveResponder(uid, eventName, handler);

    return function(event) {
      if (!Event.cache) return;

      var element = Event.cache[uid].element;
      Event.extend(event, element);
      handler.call(element, event);
    };
  }

  function createResponderForCustomEvent(uid, eventName, handler) {
    return function(event) {
      var cache = Event.cache[uid];
      var element =  cache && cache.element;

      if (Object.isUndefined(event.eventName))
        return false;

      if (event.eventName !== eventName)
        return false;

      Event.extend(event, element);
      handler.call(element, event);
    };
  }

  function createMouseEnterLeaveResponder(uid, eventName, handler) {
    return function(event) {
      var element = Event.cache[uid].element;

      Event.extend(event, element);
      var parent = event.relatedTarget;

      // Walk up the DOM tree to see if the related target is a descendant of
      // the original element. If it is, we ignore the event to match the
      // behavior of mouseenter/mouseleave.
      while (parent && parent !== element) {
        try { parent = parent.parentNode; }
        catch(e) { parent = element; }
      }

      if (parent === element) return;
      handler.call(element, event);
    }
  }

  GLOBAL.Event._createResponder = createResponder;
  docEl = null;
})(this);

(function(GLOBAL) {
  /* Support for the DOMContentLoaded event is based on work by Dan Webb,
     Matthias Miller, Dean Edwards, John Resig, and Diego Perini. */

  var TIMER;

  function fireContentLoadedEvent() {
    if (document.loaded) return;
    if (TIMER) window.clearTimeout(TIMER);
    document.loaded = true;
    document.fire('dom:loaded');
  }

  function checkReadyState() {
    if (document.readyState === 'complete') {
      document.detachEvent('onreadystatechange', checkReadyState);
      fireContentLoadedEvent();
    }
  }

  function pollDoScroll() {
    try {
      document.documentElement.doScroll('left');
    } catch (e) {
      TIMER = pollDoScroll.defer();
      return;
    }

    fireContentLoadedEvent();
  }


  if (document.readyState === 'complete') {
    // We must have been loaded asynchronously, because the DOMContentLoaded
    // event has already fired. We can just fire `dom:loaded` and be done
    // with it.
    fireContentLoadedEvent();
    return;
  }

  if (document.addEventListener) {
    // All browsers that support DOM L2 Events support DOMContentLoaded,
    // including IE 9.
    document.addEventListener('DOMContentLoaded', fireContentLoadedEvent, false);
  } else {
    document.attachEvent('onreadystatechange', checkReadyState);
    if (window == top) TIMER = pollDoScroll.defer();
  }

  // Worst-case fallback.
  Event.observe(window, 'load', fireContentLoadedEvent);
})(this);
