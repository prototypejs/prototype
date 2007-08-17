if (!window.Event) var Event = { };

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
  KEY_INSERT:   45,
  
  DOMEvents: ['click', 'dblclick', 'mousedown', 'mouseup', 'mouseover', 
              'mousemove', 'mouseout', 'keypress', 'keydown', 'keyup', 
              'load', 'unload', 'abort', 'error', 'resize', 'scroll', 
              'select', 'change', 'submit', 'reset', 'focus', 'blur',
              'contextmenu'],
              
  cache: { },

  relatedTarget: function(event) {
    var element;
    switch(event.type) {
      case 'mouseover': element = event.fromElement; break;
      case 'mouseout':  element = event.toElement;   break;
      default: return null;
    }
    return Element.extend(element);
  }
});

Event.Methods = {
  element: function(event) {
    var node = event.target;
    return Element.extend(node.nodeType == Node.TEXT_NODE ? node.parentNode : node);
  },

  findElement: function(event, expression) {
    var element = Event.element(event);
    return element.match(expression) ? element : element.up(expression);
  },

  isLeftClick: function(event) {
    return (((event.which) && (event.which == 1)) ||
            ((event.button) && (event.button == 1)));
  },

  pointer: function(event) {
    return {
      x: event.pageX || (event.clientX + 
        (document.documentElement.scrollLeft || document.body.scrollLeft)),
      y: event.pageY || (event.clientY + 
        (document.documentElement.scrollTop || document.body.scrollTop))
    };
  },

  pointerX: function(event) { return Event.pointer(event).x },
  pointerY: function(event) { return Event.pointer(event).y },

  stop: function(event) {
    event.preventDefault(); 
    event.stopPropagation(); 
  }
};

Event.extend = (function() {
  var methods = Object.keys(Event.Methods).inject({ }, function(m, name) {
    m[name] = Event.Methods[name].methodize();
    return m;
  });
  
  if (Prototype.Browser.IE) {
    Object.extend(methods, {
      stopPropagation: function() { this.cancelBubble = true },
      preventDefault:  function() { this.returnValue = false },
      inspect: function() { return "[object Event]" }
    });

    return function(event) {
      if (!event) return false;
      if (event._extendedByPrototype) return event;
      
      event._extendedByPrototype = Prototype.emptyFunction;
      var pointer = Event.pointer(event);
      Object.extend(event, {
        target: event.srcElement,
        relatedTarget: Event.relatedTarget(event),
        pageX:  pointer.x,
        pageY:  pointer.y
      });
      return Object.extend(event, methods);
    };
    
  } else {
    Event.prototype = Event.prototype || document.createEvent("HTMLEvents").__proto__;
    Object.extend(Event.prototype, methods);
    return Prototype.K;
  }
})();

Object.extend(Event, (function() {
  var cache = Event.cache;
  
  function getEventID(element) {
    if (element._eventID) return element._eventID;
    arguments.callee.id = arguments.callee.id || 1;
    return element._eventID = ++arguments.callee.id;
  }
  
  function getDOMEventName(eventName) {
    if (!Event.DOMEvents.include(eventName)) return "dataavailable";
    return { keypress: "keydown" }[eventName] || eventName;
  }
  
  function getCacheForID(id) {
    return cache[id] = cache[id] || { };
  }
  
  function getWrappersForEventName(id, eventName) {
    var c = getCacheForID(id);
    return c[eventName] = c[eventName] || [];
  }
  
  function createWrapper(element, eventName, handler) {
    var id = getEventID(element);
    var c = getWrappersForEventName(id, eventName);
    if (c.pluck("handler").include(handler)) return false;
    
    var wrapper = function(event) {
      if (event.eventName && event.eventName != eventName)
        return false;
      
      Event.extend(event);
      handler.call(element, event)
    };
    
    wrapper.handler = handler;
    c.push(wrapper);
    return wrapper;
  }
  
  function findWrapper(id, eventName, handler) {
    var c = getWrappersForEventName(id, eventName);
    return c.find(function(wrapper) { return wrapper.handler == handler });
  }
  
  function destroyWrapper(id, eventName, handler) {
    var c = getCacheForID(id);
    if (!c[eventName]) return false;
    c[eventName] = c[eventName].without(findWrapper(id, eventName, handler));
  }
  
  function destroyCache() {
    for (var id in cache)
      for (var eventName in cache[id])
        cache[id][eventName] = null;
  }
  
  if (window.attachEvent) {
    window.attachEvent("onunload", destroyCache);
  }
  
  return {
    observe: function(element, eventName, handler) {
      element = $(element);
      var name = getDOMEventName(eventName);
      
      var wrapper = createWrapper(element, eventName, handler);
      if (!wrapper) return element;
      
      if (element.addEventListener) {
        element.addEventListener(name, wrapper, false);
      } else {
        element.attachEvent("on" + name, wrapper);
      }
      
      return element;
    },
  
    stopObserving: function(element, eventName, handler) {
      element = $(element);
      var id = getEventID(element), name = getDOMEventName(eventName);
      
      if (!handler && eventName) {
        getWrappersForEventName(id, eventName).each(function(wrapper) {
          element.stopObserving(eventName, wrapper.handler);
        });
        return element;
        
      } else if (!eventName) {
        Object.keys(getCacheForID(id)).each(function(eventName) {
          element.stopObserving(eventName);
        });
        return element;
      }
      
      var wrapper = findWrapper(id, eventName, handler);
      if (!wrapper) return element;
      
      if (element.removeEventListener) {
        element.removeEventListener(name, wrapper, false);
      } else {
        element.detachEvent("on" + name, wrapper);
      }
      
      destroyWrapper(id, eventName, handler);
      
      return element;
    },
  
    fire: function(element, eventName, memo) {
      element = $(element);
      if (element == document && document.createEvent && !element.dispatchEvent)
        element = document.documentElement;
        
      if (document.createEvent) {
        var event = document.createEvent("HTMLEvents");
        event.initEvent("dataavailable", true, true);
      } else {
        var event = document.createEventObject();
        event.eventType = "ondataavailable";
      }

      event.eventName = eventName;
      event.memo = memo || { };

      if (document.createEvent) {
        element.dispatchEvent(event);
      } else {
        element.fireEvent(event.eventType, event);
      }

      return event;
    }
  };
})());

Object.extend(Event, Event.Methods);

Element.addMethods({
  fire:          Event.fire,
  observe:       Event.observe,
  stopObserving: Event.stopObserving
});

Object.extend(document, {
  fire:          Element.Methods.fire.methodize(),
  observe:       Element.Methods.observe.methodize(),
  stopObserving: Element.Methods.stopObserving.methodize()
});

(function() {
  /* Support for the DOMContentLoaded event is based on work by Dan Webb, 
     Matthias Miller, Dean Edwards and John Resig. */

  var timer, fired = false;
  
  function fireContentLoadedEvent() {
    if (fired) return;
    if (timer) window.clearInterval(timer);
    document.fire("contentloaded");
    fired = true;
  }
  
  if (document.addEventListener) {
    if (Prototype.Browser.WebKit) {
      timer = window.setInterval(function() {
        if (/loaded|complete/.test(document.readyState))
          fireContentLoadedEvent();
      }, 0);
      
      Event.observe(window, "load", fireContentLoadedEvent);
      
    } else {
      document.addEventListener("DOMContentLoaded", 
        fireContentLoadedEvent, false);
    }
    
  } else {
    document.write("<script id=__onDOMContentLoaded defer " +
      "src='://javascript:void(0)'><\/script>");
      
    $("__onDOMContentLoaded").onreadystatechange = function() { 
      if (this.readyState == "complete") {
        this.onreadystatechange = null; 
        fireContentLoadedEvent();
      }
    }; 
  }
})();
