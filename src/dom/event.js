(function() {
  var IE_EVENT_SYSTEM = (window.attachEvent && !window.opera);
    
  var Event = {};
  
  // Define keycode constants.
  Object.extend(Event, {
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
  });
  
  Event.cache = {};
  
  function _isButton(event, code) {
    switch (code) {
      case 0:  return event.which == 1 && !event.metaKey;
      case 1:  return event.which == 1 &&  event.metakey;
      default: return false;
    }
  }
  
  if (window.attachEvent && !window.opera) {
    // IE's event system doesn't map left/right/middle the same way.
    var buttonMap = { 0: 1, 1: 4, 2: 2 };
    _isButton = function(event, code) {
      return event.button === buttonMap[code];
    };
  } else if (Prototype.Browser.Safari) {
    // In Safari we have to account for when the user holds down
    // the "meta" key.
    _isButton = function(event, code) {
      switch (code) {
        case 0:  return event.which == 1 && !event.metaKey;
        case 1:  return event.which == 1 &&  event.metakey;
        default: return false;
      }
    };
  }  

  function _isLeftClick(event)   { return _isButton(event, 0); }
  function _isRightClick(event)  { return _isButton(event, 1); }
  function _isMiddleClick(event) { return _isButton(event, 2); }
  
  function _element(event) {
    event = Event.extend(event);
    
    var node = event.target, type = event.type, 
     currentTarget = event.currentTarget;
     
    if (currentTarget && currentTarget.tagName) {
      // Firefox screws up the "click" event when moving between radio buttons
      // via arrow keys. It also screws up the "load" and "error" events on images,
      // reporting the document as the target instead of the original image.
      if (type === 'click' && currentTarget.tagName.toLowerCase() === 'input'
       && currentTarget.type === 'radio')
        node = currentTarget;

      if (type === 'load' || type === 'error')
        node = currentTarget;
    }
    
    // Fix a Safari bug where a text node gets passed as the target of an
    // anchor click rather than the anchor itself.
    if (node.nodeType == Node.TEXT_NODE)
      node = node.parentNode;
      
    return Element.extend(node);
  }
  
  function _findElement(event, expression) {
    var element = Event.element(event);
    if (!expression) return element;
    var elements = [element].concat(element.ancestors());
    return Selector.findElement(elements, expression, 0);
  }
    
  function _pointer(event) {
    var docElement = document.documentElement,
     body = document.body || { scrollLeft: 0, scrollTop: 0 };
     
     return {
       x: event.pageX || (event.clientX + 
         (docElement.scrollLeft || body.scrollLeft) -
         (docElement.clientLeft || 0)),
       y: event.pageY || (event.clientY + 
         (docElement.scrollTop || body.scrollTop) -
         (docElement.clientTop || 0))
     };
  }
  
  function _pointerX(event) { return _pointer(event).x; }
  function _pointerY(event) { return _pointer(event).y; }
  
  function _stop(event) {
    Event.extend(event);
    event.preventDefault();
    event.stopPropagation();
    
    // Set a "stopped" property so that a custom event can be inspected
    // after the fact to determine whether or not it was stopped.
    event.stopped = true;
  }
  
  // Simulates the relatedTarget property in IE.
  function _relatedTarget(event) {
    var element;
    switch(event.type) {
      case 'mouseover': element = event.fromElement; break;
      case 'mouseout':  element = event.toElement;   break;
      default: return null;
    }
    return Element.extend(element);
  }
      
    
  Event.Methods = {
    pointer:  _pointer,
    pointerX: _pointerX,
    pointerY: _pointerY,
    
    element:     _element,
    findElement: _findElement,
    
    isLeftClick:   _isLeftClick,
    isRightClick:  _isRightClick,
    isMiddleClick: _isMiddleClick,
    
    stop: _stop
  };
  
  
  // Compile the list of methods that get extended onto Events.
  var _methods = Object.keys(Event.Methods).inject({ }, function(m, name) {
    m[name] = Event.Methods[name].methodize();
    return m;
  });
  
  if (IE_EVENT_SYSTEM) {
    Object.extend(_methods, {
      stopPropagation: function() { this.cancelBubble = true;  },
      preventDefault:  function() { this.returnValue  = false; },
      inspect: function() { return "[object Event]"; }
    });
  }
  
  // IE's method for extending events.
  function _extend(event) {
    if (!event) return false;
    if (event._extendedByPrototype) return event;
    
    event._extendedByPrototype = Prototype.emptyFunction;
    var pointer = _pointer(event);
    Object.extend(event, {
      target: event.srcElement,
      relatedTarget: _relatedTarget(event),
      pageX: pointer.x,
      pageY: pointer.y
    });
    
    return Object.extend(event, _methods);
  }
  
  if (IE_EVENT_SYSTEM) {
    Event.extend = _extend;
  } else {
    Event.prototype = window.Event.prototype || document.createEvent("HTMLEvents")['__proto__'];
    Object.extend(Event.prototype, _methods);
    Event.extend = Prototype.K;
  }
  
  
  function _getEventID(element) {
    if (element._prototypeEventID) return element._prototypeEventID[0];
    return element._prototypeEventID = [++arguments.callee.id];
  }
  
  _getEventID.id = 1;
  
  function _getDOMEventName(eventName) {
    if (eventName && eventName.include(':')) return "dataavailable";
    return eventName;
  }
  
  function _getCacheForID(id) {
    return Event.cache[id] = Event.cache[id] || { };
  }
  
  function _getRespondersForEvent(id, eventName) {
    var c = _getCacheForID(id);
    return c[eventName] = c[eventName] || [];
  }
  
  function _createResponder(element, eventName, handler) {
    var id = _getEventID(element), r = _getRespondersForEvent(id, eventName);
    
    // Work around the issue that permits a handler to be attached more than
    // once to the same element & event type.
    if (r.pluck('handler').include(handler)) return false;
    
    var responder = function(event) {
      if (!Event || !Event.extend) return false;
      // If it's a custom event, but not the _correct_ custom event, ignore it.
      if (!Object.isUndefined(event.eventName) && 
       event.eventName !== eventName)
        return false;
        
      Event.extend(event);
      handler.call(element, event);
    };
    
    responder.handler = handler;
    r.push(responder);
    return responder;
  }
  
  function _findResponder(id, eventName, handler) {
    var r = _getRespondersForEvent(id, eventName);
    
    return r.find( function(responder) { 
      return responder.handler === handler;
    });
  }
  
  function _destroyResponder(id, eventName, handler) {
    var c = _getCacheForID(id);
    if (Object.isUndefined(c[eventName])) return false;
    c[eventName] = c[eventName].without(_findResponder(id, eventName, handler));
  }
  
  function _destroyCache() {
    for (var id in Event.cache) {
      for (var eventName in cache[id])
        cache[id][eventName] = null;
    }
  }
  
  
  // Internet Explorer needs to remove event handlers on page unload
  // in order to avoid memory leaks.
  if (IE_EVENT_SYSTEM) {
    window.attachEvent("onunload", destroyCache);
  }
  
  // Safari needs a dummy event handler on page unload so that it won't
  // use its bfcache. Safari <= 3.1 has an issue with restoring the "document"
  // object when page is returned to via the back button using its bfcache.
  if (Prototype.Browser.WebKit) {    
    window.addEventListener('unload', Prototype.emptyFunction, false);
  }  
  
  function _observe(element, eventName, handler) {
    element = $(element);
    
    var name = _getDOMEventName(eventName);
    
    var responder = _createResponder(element, eventName, handler);
    if (!responder) return element;
    
    if (element.addEventListener) {
      element.addEventListener(name, responder, false);
    } else {
      element.attachEvent("on" + name, responder);
    }
    
    return element;
  }
  
  function _stopObserving(element, eventName, handler) {
    element = $(element);
    var id = _getEventID(element), name = _getDOMEventName(eventName);
    
    if (eventName && !handler) {
      // If an event name is passed without a handler, we stop observing all
      // handlers of that type.
      _getRespondersForEvent(id, eventName).each( function(r) {
        element.stopObserving(eventName, r.handler);
      });
      return element;
    } else if (!eventName) {
      // If both the event name and the handler are omitted, we stop observing
      // _all_ handlers on the element.
      Object.keys(_getCacheForID(id)).each( function(eventName) {
        element.stopObserving(eventName);
      });
      return element;
    }
    
    var responder = _findResponder(id, eventName, handler);
    if (!responder) return element;
    
    if (element.removeEventListener) {
      element.removeEventListener(name, responder, false);
    } else {
      element.detachEvent("on" + name, responder);
    }
    
    _destroyResponder(id, eventName, handler);
    
    return element;
  }
  
  function _fire(element, eventName, memo) {
    element = $(element);
    // In the W3C system, all calls to document.fire should treat 
    // document.documentElement as the target.
    if (element == document && document.createEvent && !element.dispatchEvent)
      element = document.documentElement;
      
    var event;
    
    if (document.createEvent) {
      event = document.createEvent("HTMLEvents");
      event.initEvent("dataavailable", true, true);
    } else {
      event = document.createEventObject();
      event.eventType = "ondataavailable";
    }
    
    event.eventName = eventName;
    event.memo = memo || { };
    
    if (document.createEvent) {
      element.dispatchEvent(event);
    } else {
      element.fireEvent(event.eventType, event);
    }
    
    return Event.extend(event);
  }
  
  Object.extend(Event, {
    fire:          _fire,
    observe:       _observe,
    stopObserving: _stopObserving
  });
  
  Element.addMethods({
    fire:          _fire,
    observe:       _observe,
    stopObserving: _stopObserving
  });
  
  Object.extend(document, {
    fire:          _fire.methodize(),
    observe:       _observe.methodize(),
    stopObserving: _stopObserving.methodize(),
    loaded:        false 
  });
  
  Object.extend(Event, Event.Methods);

  // Export to the global scope.
  if (window.Event) {
    Object.extend(window.Event, Event);
  } else {
    window.Event = Event;
  }
})();

(function() {
  /* Support for the DOMContentLoaded event is based on work by Dan Webb, 
     Matthias Miller, Dean Edwards and John Resig. */

  var _timer;
  
  function _fireContentLoadedEvent() {
    if (document.loaded) return;
    if (_timer) window.clearInterval(_timer);
    
    document.fire("dom:loaded");
    document.loaded = true;
  }
  
  function _webkitContentLoadedCheck() {
    var s = document.readyState;
    if (s === "loaded" || s === "complete")
      _fireContentLoadedEvent();
  }
  
  function _IEContentLoadedCheck() {
    if (this.readyState == "complete") {
      this.onreadystatechange = null; 
      _fireContentLoadedEvent();
    }
  }
  
  if (document.addEventListener) {
    if (Prototype.Browser.WebKit) {
      _timer = window.setInterval(_webkitContentLoadedCheck, 0);
      Event.observe(window, "load", _fireContentLoadedEvent);
    } else {
      document.addEventListener("DOMContentLoaded",
        _fireContentLoadedEvent, false);
    }
  } else {
    document.write("<script id=__onDOMContentLoaded defer src=//:><\/script>");
    $("__onDOMContentLoaded").onreadystatechange = _IEContentLoadedCheck;
  }
})();