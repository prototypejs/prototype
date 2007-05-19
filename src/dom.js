function $(element) {
  if (arguments.length > 1) {
    for (var i = 0, elements = [], length = arguments.length; i < length; i++)
      elements.push($(arguments[i]));
    return elements;
  }
  if (typeof element == 'string')
    element = document.getElementById(element);
  return Element.extend(element);
}

if (Prototype.BrowserFeatures.XPath) {
  document._getElementsByXPath = function(expression, parentElement) {
    var results = [];
    var query = document.evaluate(expression, $(parentElement) || document,
      null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
    for (var i = 0, length = query.snapshotLength; i < length; i++)
      results.push(query.snapshotItem(i));
    return results;
  };
  
  document.getElementsByClassName = function(className, parentElement) {
    var q = ".//*[contains(concat(' ', @class, ' '), ' " + className + " ')]";
    return document._getElementsByXPath(q, parentElement);
  }
  
} else document.getElementsByClassName = function(className, parentElement) {
  var children = ($(parentElement) || document.body).getElementsByTagName('*');
  var elements = [], child;
  for (var i = 0, length = children.length; i < length; i++) {
    child = children[i];
    if (Element.hasClassName(child, className))
      elements.push(Element.extend(child));
  }
  return elements;
};

/*--------------------------------------------------------------------------*/

(function() {
  var element = this.Element;
  this.Element = function(tagName, attributes) {
    attributes = attributes || {};
    tagName = tagName.toLowerCase();
    var cache = Element.cache;
    if (Prototype.Browser.IE && attributes.name) {
      tagName = '<' + tagName + ' name="' + attributes.name + '">';
      delete attributes.name;
      return Element.writeAttribute(document.createElement(tagName), attributes);
    }
    if (!cache[tagName]) cache[tagName] = Element.extend(document.createElement(tagName));
    return Element.writeAttribute(cache[tagName].cloneNode(false), attributes);
  };
  Object.extend(this.Element, element || {});
}).call(window);

Element.cache = {};

Element.Methods = {
  visible: function(element) {
    return $(element).style.display != 'none';
  },
  
  toggle: function(element) {
    element = $(element);
    Element[Element.visible(element) ? 'hide' : 'show'](element);
    return element;
  },

  hide: function(element) {
    $(element).style.display = 'none';
    return element;
  },
  
  show: function(element) {
    $(element).style.display = '';
    return element;
  },

  remove: function(element) {
    element = $(element);
    element.parentNode.removeChild(element);
    return element;
  },

  update: function(element, html) {
    html = typeof html == 'undefined' ? '' : html.toString();
    $(element).innerHTML = html.stripScripts();
    html.evalScripts.bind(html).defer();
    return element;
  },
  
  replace: function(element, html) {
    element = $(element);
    html = typeof html == 'undefined' ? '' : html.toString();
    if (element.outerHTML) {
      element.outerHTML = html.stripScripts();
    } else {
      var range = element.ownerDocument.createRange();
      range.selectNode(element);
      element.parentNode.replaceChild(
        range.createContextualFragment(html.stripScripts()), element);
    }
    html.evalScripts.bind(html).defer();
    return element;
  },
  
  insert: function(element, content, position) {
    element = $(element);
    position = (position || 'bottom').toLowerCase();
    var t = Element._insertionTranslations[position], range;
    
    if (content && content.ownerDocument === document) {
      t.insert(element, content);
      return element;
    }
    
    content = content.toString();
    
    range = element.ownerDocument.createRange();
    t.initializeRange(element, range);
    t.insert(element, range.createContextualFragment(content.stripScripts()));

    content.evalScripts.bind(content).defer();
    return element;
  },
  
  wrap: function(element, wrapper) {
    element = $(element);
    wrapper = wrapper || 'div';
    if (typeof wrapper == 'string') wrapper = new Element(wrapper);
    else Element.extend(wrapper);
    element.parentNode.replaceChild(wrapper, element);
    wrapper.appendChild(element);
    return element;
  },

  inspect: function(element) {
    element = $(element);
    var result = '<' + element.tagName.toLowerCase();
    $H({'id': 'id', 'className': 'class'}).each(function(pair) {
      var property = pair.first(), attribute = pair.last();
      var value = (element[property] || '').toString();
      if (value) result += ' ' + attribute + '=' + value.inspect(true);
    });
    return result + '>';
  },
  
  recursivelyCollect: function(element, property) {
    element = $(element);
    var elements = [];
    while (element = element[property])
      if (element.nodeType == 1)
        elements.push(Element.extend(element));
    return elements;
  },
  
  ancestors: function(element) {
    return $(element).recursivelyCollect('parentNode');
  },
  
  descendants: function(element) {
    return $A($(element).getElementsByTagName('*')).each(Element.extend);
  },
  
  firstDescendant: function(element) {
    element = $(element).firstChild;
    while (element && element.nodeType != 1) element = element.nextSibling;
    return $(element);
  },
  
  immediateDescendants: function(element) {
    if (!(element = $(element).firstChild)) return [];
    while (element && element.nodeType != 1) element = element.nextSibling;
    if (element) return [element].concat($(element).nextSiblings());
    return [];
  },

  previousSiblings: function(element) {
    return $(element).recursivelyCollect('previousSibling');
  },
  
  nextSiblings: function(element) {
    return $(element).recursivelyCollect('nextSibling');
  },
  
  siblings: function(element) {
    element = $(element);
    return element.previousSiblings().reverse().concat(element.nextSiblings());
  },
  
  match: function(element, selector) {
    if (typeof selector == 'string')
      selector = new Selector(selector);
    return selector.match($(element));
  },
  
  up: function(element, expression, index) {
    element = $(element);
    if (arguments.length == 1) return $(element.parentNode);
    var ancestors = element.ancestors();
    return expression ? Selector.findElement(ancestors, expression, index) :
      ancestors[index || 0];
  },
  
  down: function(element, expression, index) {
    element = $(element);
    if (arguments.length == 1) return element.firstDescendant();
    var descendants = element.descendants();
    return expression ? Selector.findElement(descendants, expression, index) :
      descendants[index || 0];
  },

  previous: function(element, expression, index) {
    element = $(element);
    if (arguments.length == 1) return $(Selector.handlers.previousElementSibling(element));
    var previousSiblings = element.previousSiblings();
    return expression ? Selector.findElement(previousSiblings, expression, index) :
      previousSiblings[index || 0];
  },
  
  next: function(element, expression, index) {
    element = $(element);
    if (arguments.length == 1) return $(Selector.handlers.nextElementSibling(element));
    var nextSiblings = element.nextSiblings();
    return expression ? Selector.findElement(nextSiblings, expression, index) :
      nextSiblings[index || 0];
  },
  
  getElementsBySelector: function() {
    var args = $A(arguments), element = $(args.shift());
    return Selector.findChildElements(element, args);
  },
  
  getElementsByClassName: function(element, className) {
    return document.getElementsByClassName(className, element);
  },
  
  readAttribute: function(element, name) {
    element = $(element);
    if (Prototype.Browser.IE) {
      if (!element.attributes) return null;
      var t = Element._attributeTranslations.read;
      if (t.values[name]) return t.values[name](element, name);
      if (t.names[name])  name = t.names[name];
      var attribute = element.attributes[name];
      return attribute ? attribute.nodeValue : null;
    }    
    return element.getAttribute(name);
  },
  
  writeAttribute: function(element, name, value) {
    element = $(element);
    var attributes = {}, t = Element._attributeTranslations.write;
    
    if (typeof name == 'object') attributes = name;
    else attributes[name] = value === undefined ? true : value;
    
    for (var attr in attributes) {
      var name = t.names[attr] || attr, value = attributes[attr];
      if (t.values[attr]) name = t.values[attr](element, value);
      if (value === false || value === null)
        element.removeAttribute(name);
      else if (value === true)
        element.setAttribute(name, name);
      else element.setAttribute(name, value);
    }
    return element;
  },
  
  getHeight: function(element) {
    return $(element).getDimensions().height; 
  },
  
  getWidth: function(element) {
    return $(element).getDimensions().width; 
  },
  
  classNames: function(element) {
    return new Element.ClassNames(element);
  },

  hasClassName: function(element, className) {
    if (!(element = $(element))) return;
    var elementClassName = element.className;
    if (elementClassName.length == 0) return false;
    if (elementClassName == className || 
        elementClassName.match(new RegExp("(^|\\s)" + className + "(\\s|$)")))
      return true;
    return false;
  },

  addClassName: function(element, className) {
    if (!(element = $(element))) return;
    Element.classNames(element).add(className);
    return element;
  },

  removeClassName: function(element, className) {
    if (!(element = $(element))) return;
    Element.classNames(element).remove(className);
    return element;
  },
  
  toggleClassName: function(element, className) {
    if (!(element = $(element))) return;
    Element.classNames(element)[element.hasClassName(className) ? 'remove' : 'add'](className);
    return element;
  },
  
  observe: function() {
    Event.observe.apply(Event, arguments);
    return $A(arguments).first();
  },
  
  stopObserving: function() {
    Event.stopObserving.apply(Event, arguments);
    return $A(arguments).first();
  },
  
  // removes whitespace-only text node children
  cleanWhitespace: function(element) {
    element = $(element);
    var node = element.firstChild;
    while (node) {
      var nextNode = node.nextSibling;
      if (node.nodeType == 3 && !/\S/.test(node.nodeValue))
        element.removeChild(node);
      node = nextNode;
    }
    return element;
  },
  
  empty: function(element) {
    return $(element).innerHTML.blank();
  },
  
  descendantOf: function(element, ancestor) {
    element = $(element), ancestor = $(ancestor);
    while (element = element.parentNode)
      if (element == ancestor) return true;
    return false;
  },
  
  scrollTo: function(element) {
    element = $(element);
    var pos = Position.cumulativeOffset(element);
    window.scrollTo(pos[0], pos[1]);
    return element;
  },
  
  getStyle: function(element, style) {
    element = $(element);
    style = style == 'float' ? 'cssFloat' : style.camelize();
    var value = element.style[style];
    if (!value) {
      var css = document.defaultView.getComputedStyle(element, null);
      value = css ? css[style] : null;
    }
    if (style == 'opacity') return value ? parseFloat(value) : 1.0;
    return value == 'auto' ? null : value;
  },
  
  getOpacity: function(element) {
    return $(element).getStyle('opacity');
  },
  
  setStyle: function(element, styles, camelized) {
    element = $(element);
    var elementStyle = element.style;

    for (var property in styles)
      if (property == 'opacity') element.setOpacity(styles[property])
      else 
        elementStyle[(property == 'float' || property == 'cssFloat') ?
          (elementStyle.styleFloat === undefined ? 'cssFloat' : 'styleFloat') : 
          (camelized ? property : property.camelize())] = styles[property];

    return element;
  },
  
  setOpacity: function(element, value) {
    element = $(element);
    element.style.opacity = (value == 1 || value === '') ? '' : 
      (value < 0.00001) ? 0 : value;
    return element;
  },
  
  getDimensions: function(element) {
    element = $(element);
    var display = $(element).getStyle('display');
    if (display != 'none' && display != null) // Safari bug
      return {width: element.offsetWidth, height: element.offsetHeight};
    
    // All *Width and *Height properties give 0 on elements with display none,
    // so enable the element temporarily
    var els = element.style;
    var originalVisibility = els.visibility;
    var originalPosition = els.position;
    var originalDisplay = els.display;
    els.visibility = 'hidden';
    els.position = 'absolute';
    els.display = 'block';
    var originalWidth = element.clientWidth;
    var originalHeight = element.clientHeight;
    els.display = originalDisplay;
    els.position = originalPosition;
    els.visibility = originalVisibility;
    return {width: originalWidth, height: originalHeight};    
  },
  
  makePositioned: function(element) {
    element = $(element);
    var pos = Element.getStyle(element, 'position');
    if (pos == 'static' || !pos) {
      element._madePositioned = true;
      element.style.position = 'relative';
      // Opera returns the offset relative to the positioning context, when an
      // element is position relative but top and left have not been defined
      if (window.opera) {
        element.style.top = 0;
        element.style.left = 0;
      }  
    }
    return element;
  },

  undoPositioned: function(element) {
    element = $(element);
    if (element._madePositioned) {
      element._madePositioned = undefined;
      element.style.position =
        element.style.top =
        element.style.left =
        element.style.bottom =
        element.style.right = '';   
    }
    return element;
  },

  makeClipping: function(element) {
    element = $(element);
    if (element._overflow) return element;
    element._overflow = element.style.overflow || 'auto';
    if ((Element.getStyle(element, 'overflow') || 'visible') != 'hidden')
      element.style.overflow = 'hidden';
    return element;
  },

  undoClipping: function(element) {
    element = $(element);
    if (!element._overflow) return element;
    element.style.overflow = element._overflow == 'auto' ? '' : element._overflow;
    element._overflow = null;
    return element;
  },

  cumulativeOffset: function(element) {
    var valueT = 0, valueL = 0;
    do {
      valueT += element.offsetTop  || 0;
      valueL += element.offsetLeft || 0;
      element = element.offsetParent;
    } while (element);
    return Element._returnOffset(valueL, valueT);
  },

  positionedOffset: function(element) {
    var valueT = 0, valueL = 0;
    do {
      valueT += element.offsetTop  || 0;
      valueL += element.offsetLeft || 0;
      element = element.offsetParent;
      if (element) {
        if (element.tagName == 'BODY') break;
        var p = Element.getStyle(element, 'position');
        if (p == 'relative' || p == 'absolute') break;
      }
    } while (element);
    return Element._returnOffset(valueL, valueT);
  },

  absolutize: function(element) {
    element = $(element);
    if (element.style.position == 'absolute') return;
    // Position.prepare(); // To be done manually by Scripty when it needs it.

    var offsets = element.positionedOffset();
    var top     = offsets[1];
    var left    = offsets[0];
    var width   = element.clientWidth;
    var height  = element.clientHeight;

    element._originalLeft   = left - parseFloat(element.style.left  || 0);
    element._originalTop    = top  - parseFloat(element.style.top || 0);
    element._originalWidth  = element.style.width;
    element._originalHeight = element.style.height;

    element.style.position = 'absolute';
    element.style.top    = top + 'px';
    element.style.left   = left + 'px';
    element.style.width  = width + 'px';
    element.style.height = height + 'px';
    return element;
  },

  relativize: function(element) {
    element = $(element);
    if (element.style.position == 'relative') return;
    // Position.prepare(); // To be done manually by Scripty when it needs it.

    element.style.position = 'relative';
    var top  = parseFloat(element.style.top  || 0) - (element._originalTop || 0);
    var left = parseFloat(element.style.left || 0) - (element._originalLeft || 0);

    element.style.top    = top + 'px';
    element.style.left   = left + 'px';
    element.style.height = element._originalHeight;
    element.style.width  = element._originalWidth;
    return element;
  },

  cumulativeScrollOffset: function(element) {
    var valueT = 0, valueL = 0;
    do {
      valueT += element.scrollTop  || 0;
      valueL += element.scrollLeft || 0; 
      element = element.parentNode;
    } while (element);
    return Element._returnOffset(valueL, valueT);
  },
  
  getOffsetParent: function(element) {
    if (element.offsetParent) return $(element.offsetParent);
    if (element == document.body) return $(element);

    while ((element = element.parentNode) && element != document.body)
      if (Element.getStyle(element, 'position') != 'static')
        return $(element);

    return $(document.body);
  },

  viewportOffset: function(forElement) {
    var valueT = 0, valueL = 0;

    var element = forElement;
    do {
      valueT += element.offsetTop  || 0;
      valueL += element.offsetLeft || 0;

      // Safari fix
      if (element.offsetParent == document.body &&
        Element.getStyle(element, 'position') == 'absolute') break;

    } while (element = element.offsetParent);

    element = forElement;
    do {
      if (!Prototype.Browser.Opera || element.tagName == 'BODY') {
        valueT -= element.scrollTop  || 0;
        valueL -= element.scrollLeft || 0;
      }
    } while (element = element.parentNode);

    return Element._returnOffset(valueL, valueT);
  },

  clonePosition: function(element, source) {
    var options = Object.extend({
      setLeft:    true,
      setTop:     true,
      setWidth:   true,
      setHeight:  true,
      offsetTop:  0,
      offsetLeft: 0
    }, arguments[2] || {});

    // find page position of source
    source = $(source);
    var p = source.viewportOffset();

    // find coordinate system to use
    element = $(element);
    var delta = [0, 0];
    var parent = null;
    // delta [0,0] will do fine with position: fixed elements, 
    // position:absolute needs offsetParent deltas
    if (Element.getStyle(element, 'position') == 'absolute') {
      parent = element.getOffsetParent();
      delta = parent.viewportOffset();
    }

    // correct by body offsets (fixes Safari)
    if (parent == document.body) {
      delta[0] -= document.body.offsetLeft;
      delta[1] -= document.body.offsetTop; 
    }

    // set position
    if (options.setLeft)   element.style.left  = (p[0] - delta[0] + options.offsetLeft) + 'px';
    if (options.setTop)    element.style.top   = (p[1] - delta[1] + options.offsetTop) + 'px';
    if (options.setWidth)  element.style.width = source.offsetWidth + 'px';
    if (options.setHeight) element.style.height = source.offsetHeight + 'px';
    return element;
  }
};

Object.extend(Element.Methods, {
  childElements: Element.Methods.immediateDescendants
});

Element._attributeTranslations = {
  write: {
    names: {
      className: 'class',
      htmlFor:   'for'      
    }, 
    values: {}
  }
};


if (!document.createRange || Prototype.Browser.Opera) {
  Element.Methods.insert = function(element, content, position) {
    element = $(element);
    position = (position || 'bottom').toLowerCase();
    var t = Element._insertionTranslations, pos = t[position], tagName;
    
    if (content && content.ownerDocument === document) {
      pos.insert(element, content);
      return element;
    }

    content = content.toString();
    tagName = ((position == 'before' || position == 'after')
      ? element.parentNode : element).tagName.toUpperCase();
    
    if (t.tags[tagName]) {
      var fragments = Element._getContentFromAnonymousElement(tagName, content.stripScripts());
      if (position == 'top' || position == 'after') fragments.reverse();
      fragments.each(pos.insert.curry(element));
    }
    else element.insertAdjacentHTML(pos.adjacency, content.stripScripts());
    
    content.evalScripts.bind(content).defer();
    return element;
  }
}

if (Prototype.Browser.Opera) { 
  Element.Methods._getStyle = Element.Methods.getStyle; 
  Element.Methods.getStyle = function(element, style) { 
    switch(style) { 
      case 'left': 
      case 'top': 
      case 'right': 
      case 'bottom': 
        if (Element._getStyle(element, 'position') == 'static') return null; 
      default: return Element._getStyle(element, style); 
    }
  };
  Element.Methods._readAttribute = Element.Methods.readAttribute; 
  Element.Methods.readAttribute = function(element, attribute) { 
    if (attribute == 'title') return element.title; 
    return Element._readAttribute(element, attribute);
  };  
}

else if (Prototype.Browser.IE) {
  Element.Methods.getStyle = function(element, style) {
    element = $(element);
    style = (style == 'float' || style == 'cssFloat') ? 'styleFloat' : style.camelize();
    var value = element.style[style];
    if (!value && element.currentStyle) value = element.currentStyle[style];

    if (style == 'opacity') {
      if (value = (element.getStyle('filter') || '').match(/alpha\(opacity=(.*)\)/))
        if (value[1]) return parseFloat(value[1]) / 100;
      return 1.0;
    }

    if (value == 'auto') {
      if ((style == 'width' || style == 'height') && (element.getStyle('display') != 'none'))
        return element['offset' + style.capitalize()] + 'px';
      return null;
    }
    return value;
  };
  
  Element.Methods.setOpacity = function(element, value) {
    function stripAlpha(filter){
      return filter.replace(/alpha\([^\)]*\)/gi,'');
    }
    element = $(element);
    var filter = element.getStyle('filter'), style = element.style;
    if (value == 1 || value === '') {
      (filter = stripAlpha(filter)) ?
        style.filter = filter : style.removeAttribute('filter');
      return element;
    } else if (value < 0.00001) value = 0;
    style.filter = stripAlpha(filter) +
      'alpha(opacity=' + (value * 100) + ')';
    return element;   
  };

  Element._attributeTranslations = {
    read: {
      names: {
        colspan:   "colSpan",
        rowspan:   "rowSpan",
        valign:    "vAlign",
        datetime:  "dateTime",
        accesskey: "accessKey",
        tabindex:  "tabIndex",
        enctype:   "encType",
        maxlength: "maxLength",
        readonly:  "readOnly",
        longdesc:  "longDesc"
      },
      values: {
        _getAttr: function(element, attribute) {
          return element.getAttribute(attribute, 2);
        },
        _flag: function(element, attribute) {
          return $(element).hasAttribute(attribute) ? attribute : null;
        },
        style: function(element) {
          return element.style.cssText.toLowerCase();
        },
        title: function(element) {
          var node = element.getAttributeNode('title');
          return node.specified ? node.nodeValue : null;
        }
      }
    }
  };
  
  Element._attributeTranslations.write = {
    names: Object.extend({
        'class': 'className',
        'for':   'htmlFor'    
      }, Element._attributeTranslations.read.names),
    values: {
      checked: function(element, value) {
        element.checked = !!value;
      },
      
      style: function(element, value) {
        element.style.cssText = value ? value : '';
      }
    }
  };
  
  (function() {
    Object.extend(this, {
      href: this._getAttr,
      src:  this._getAttr,
      type: this._getAttr,
      disabled: this._flag,
      checked:  this._flag,
      readonly: this._flag,
      multiple: this._flag
    });
  }).call(Element._attributeTranslations.read.values);
}

else if (Prototype.Browser.Gecko) {
  Element.Methods.setOpacity = function(element, value) {
    element = $(element);
    element.style.opacity = (value == 1) ? 0.999999 : 
      (value === '') ? '' : (value < 0.00001) ? 0 : value;
    return element;
  };
}

else if (Prototype.Browser.WebKit) {
  // Safari returns margins on body which is incorrect if the child is absolutely
  // positioned.  For performance reasons, redefine Position.cumulativeOffset for
  // KHTML/WebKit only.
  Element.Methods.cumulativeOffset = function(element) {
    var valueT = 0, valueL = 0;
    do {
      valueT += element.offsetTop  || 0;
      valueL += element.offsetLeft || 0;
      if (element.offsetParent == document.body)
        if (Element.getStyle(element, 'position') == 'absolute') break;
        
      element = element.offsetParent;
    } while (element);
    
    return [valueL, valueT];
  }
}

if (Prototype.Browser.IE || Prototype.Browser.Opera) {
  // IE and Opera are missing .innerHTML support for TABLE-related and SELECT elements
  Element.Methods.update = function(element, html) {
    element = $(element);
    html = typeof html == 'undefined' ? '' : html.toString();
    var tagName = element.tagName.toUpperCase();
    
    if (Element._insertionTranslations.tags[tagName]) {
      $A(element.childNodes).each(function(node) { element.removeChild(node) });
      Element._getContentFromAnonymousElement(tagName, html.stripScripts())
        .each(function(node) { element.appendChild(node) });
    } 
    else element.innerHTML = html.stripScripts();
    
    html.evalScripts.bind(html).defer();
    return element;
  };
}

Element._returnOffset = function(l, t) {
  var result = [l, t];
  result.left = l;
  result.top = t;
  return result;
};

Element._getContentFromAnonymousElement = function(tagName, html) {
  var div = new Element('div'); t = Element._insertionTranslations.tags[tagName]
  div.innerHTML = t[0] + html + t[1];
  t[2].times(function() { div = div.firstChild });
  return $A(div.childNodes);
};

Element._insertionTranslations = {
  before: {
    adjacency: 'beforeBegin',
    insert: function(element, node) {
      element.parentNode.insertBefore(node, element);
    },
    initializeRange: function(element, range) {
      range.setStartBefore(element);      
    }
  },
  top: {
    adjacency: 'afterBegin',
    insert: function(element, node) {
      element.insertBefore(node, element.firstChild);
    },
    initializeRange: function(element, range) {
      range.selectNodeContents(element);
      range.collapse(true);
    }
  },
  bottom: {
    adjacency: 'beforeEnd',
    insert: function(element, node) {
      element.appendChild(node);
    }
  },
  after: {
    adjacency: 'afterEnd',
    insert: function(element, node) {
      element.parentNode.insertBefore(node, element.nextSibling);
    },
    initializeRange: function(element, range) {
      range.setStartAfter(element);
    }
  },
  tags: {
    TABLE:  ['<table>',                '</table>',                   1],
    TBODY:  ['<table><tbody>',         '</tbody></table>',           2],
    TR:     ['<table><tbody><tr>',     '</tr></tbody></table>',      3],
    TD:     ['<table><tbody><tr><td>', '</td></tr></tbody></table>', 4],
    SELECT: ['<select>',               '</select>',                  1]
  }
};

(function() {
  this.bottom.initializeRange = this.top.initializeRange;
  Object.extend(this.tags, {
    THEAD: this.tags.TBODY,
    TFOOT: this.tags.TBODY,
    TH:    this.tags.TD
  });
}).call(Element._insertionTranslations);

Element.Methods.Simulated = {
  hasAttribute: function(element, attribute) {
    var t = Element._attributeTranslations.read, node;
    attribute = t.names[attribute] || attribute;
    node = $(element).getAttributeNode(attribute);
    return node && node.specified;
  }
};

Element.Methods.ByTag = {};

Object.extend(Element, Element.Methods);

Element.extend = (function() {
  if (Prototype.BrowserFeatures.SpecificElementExtensions)
    return Prototype.K;
  
  var Methods = {}, ByTag = Element.Methods.ByTag;
  
  var extend = Object.extend(function(element) {
    if (!element || element._extendedByPrototype || 
        element.nodeType != 1 || element == window) return element;

    var methods = Object.clone(Methods),
      tagName = element.tagName, property, value;
    
    // extend methods for specific tags
    if (ByTag[tagName]) Object.extend(methods, ByTag[tagName]);
    
    for (property in methods) {
      value = methods[property];
      if (typeof value == 'function' && !(property in element))
        element[property] = value.methodize();
    }
    
    element._extendedByPrototype = Prototype.emptyFunction;
    return element;
    
  }, { 
    refresh: function() {
      // extend methods for all tags (Safari doesn't need this)
      if (!Prototype.BrowserFeatures.ElementExtensions) {
        Object.extend(Methods, Element.Methods);
        Object.extend(Methods, Element.Methods.Simulated);
      }
    }
  });
  
  extend.refresh();
  return extend;
})();

if (!Prototype.BrowserFeatures.ElementExtensions && 
    document.createElement('div').__proto__) {
  window.HTMLElement = {};
  window.HTMLElement.prototype = document.createElement('div').__proto__;
  Prototype.BrowserFeatures.ElementExtensions = true;
}

Element.hasAttribute = function(element, attribute) {
  if (element.hasAttribute) return element.hasAttribute(attribute);
  return Element.Methods.Simulated.hasAttribute(element, attribute);
};

Element.addMethods = function(methods) {
  var F = Prototype.BrowserFeatures, T = Element.Methods.ByTag;
  
  if (!methods) {
    Object.extend(Form, Form.Methods);
    Object.extend(Form.Element, Form.Element.Methods);
    Object.extend(Element.Methods.ByTag, {
      "FORM":     Object.clone(Form.Methods),
      "INPUT":    Object.clone(Form.Element.Methods),
      "SELECT":   Object.clone(Form.Element.Methods),
      "TEXTAREA": Object.clone(Form.Element.Methods)
    });
  }
  
  if (arguments.length == 2) {
    var tagName = methods;
    methods = arguments[1];
  }
  
  if (!tagName) Object.extend(Element.Methods, methods || {});  
  else {
    if (tagName.constructor == Array) tagName.each(extend);
    else extend(tagName);
  }
  
  function extend(tagName) {
    tagName = tagName.toUpperCase();
    if (!Element.Methods.ByTag[tagName])
      Element.Methods.ByTag[tagName] = {};
    Object.extend(Element.Methods.ByTag[tagName], methods);
  }

  function copy(methods, destination, onlyIfAbsent) {
    onlyIfAbsent = onlyIfAbsent || false;
    for (var property in methods) {
      var value = methods[property];
      if (typeof value != 'function') continue;
      if (!onlyIfAbsent || !(property in destination))
        destination[property] = value.methodize();
    }
  }
  
  function findDOMClass(tagName) {
    var klass;
    var trans = {       
      "OPTGROUP": "OptGroup", "TEXTAREA": "TextArea", "P": "Paragraph", 
      "FIELDSET": "FieldSet", "UL": "UList", "OL": "OList", "DL": "DList",
      "DIR": "Directory", "H1": "Heading", "H2": "Heading", "H3": "Heading",
      "H4": "Heading", "H5": "Heading", "H6": "Heading", "Q": "Quote", 
      "INS": "Mod", "DEL": "Mod", "A": "Anchor", "IMG": "Image", "CAPTION": 
      "TableCaption", "COL": "TableCol", "COLGROUP": "TableCol", "THEAD": 
      "TableSection", "TFOOT": "TableSection", "TBODY": "TableSection", "TR":
      "TableRow", "TH": "TableCell", "TD": "TableCell", "FRAMESET": 
      "FrameSet", "IFRAME": "IFrame"
    };
    if (trans[tagName]) klass = 'HTML' + trans[tagName] + 'Element';
    if (window[klass]) return window[klass];
    klass = 'HTML' + tagName + 'Element';
    if (window[klass]) return window[klass];
    klass = 'HTML' + tagName.capitalize() + 'Element';
    if (window[klass]) return window[klass];
    
    window[klass] = {};
    window[klass].prototype = document.createElement(tagName).__proto__;
    return window[klass];
  }
  
  if (F.ElementExtensions) {
    copy(Element.Methods, HTMLElement.prototype);
    copy(Element.Methods.Simulated, HTMLElement.prototype, true);
  }
  
  if (F.SpecificElementExtensions) {
    for (var tag in Element.Methods.ByTag) {
      var klass = findDOMClass(tag);
      if (typeof klass == "undefined") continue;
      copy(T[tag], klass.prototype);
    }
  }  

  Object.extend(Element, Element.Methods);
  delete Element.ByTag;
  
  if (Element.extend.refresh) Element.extend.refresh();
  Element.cache = {};
};

/*--------------------------------------------------------------------------*/

Element.ClassNames = Class.create();
Element.ClassNames.prototype = {
  initialize: function(element) {
    this.element = $(element);
  },

  _each: function(iterator) {
    this.element.className.split(/\s+/).select(function(name) {
      return name.length > 0;
    })._each(iterator);
  },
  
  set: function(className) {
    this.element.className = className;
  },
  
  add: function(classNameToAdd) {
    if (this.include(classNameToAdd)) return;
    this.set($A(this).concat(classNameToAdd).join(' '));
  },
  
  remove: function(classNameToRemove) {
    if (!this.include(classNameToRemove)) return;
    this.set($A(this).without(classNameToRemove).join(' '));
  },
  
  toString: function() {
    return $A(this).join(' ');
  }
};

Object.extend(Element.ClassNames.prototype, Enumerable);
