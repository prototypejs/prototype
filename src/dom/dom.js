/** section: dom
 *  $(id) -> Element
 *  $(id...) -> [Element]...
 *    - id (String | Element): A DOM node or a string that references a node's
 *      ID.
 *  
 *  If provided with a string, returns the element in the document with
 *  matching ID; otherwise returns the passed element.
 *  
 *  Takes in an arbitrary number of arguments. Returns one `Element` if given
 *  one argument; otherwise returns an array of `Element`s.
 *  
 *  All elements returned by the function are "extended" with `Element`
 *  instance methods.
**/

function $(element) {
  if (arguments.length > 1) {
    for (var i = 0, elements = [], length = arguments.length; i < length; i++)
      elements.push($(arguments[i]));
    return elements;
  }
  if (Object.isString(element))
    element = document.getElementById(element);
  return Element.extend(element);
}

if (Prototype.BrowserFeatures.XPath) {
  document._getElementsByXPath = function(expression, parentElement) {
    var results = [];
    var query = document.evaluate(expression, $(parentElement) || document,
      null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
    for (var i = 0, length = query.snapshotLength; i < length; i++)
      results.push(Element.extend(query.snapshotItem(i)));
    return results;
  };
}

/*--------------------------------------------------------------------------*/

if (!window.Node) var Node = { };

if (!Node.ELEMENT_NODE) {
  // DOM level 2 ECMAScript Language Binding
  Object.extend(Node, {
    ELEMENT_NODE: 1,
    ATTRIBUTE_NODE: 2,
    TEXT_NODE: 3,
    CDATA_SECTION_NODE: 4,
    ENTITY_REFERENCE_NODE: 5,
    ENTITY_NODE: 6,
    PROCESSING_INSTRUCTION_NODE: 7,
    COMMENT_NODE: 8,
    DOCUMENT_NODE: 9,
    DOCUMENT_TYPE_NODE: 10,
    DOCUMENT_FRAGMENT_NODE: 11,
    NOTATION_NODE: 12
  });
}

/** section: dom
 *  class Element
**/

/** 
 *  new Element(tagName[, attributes])
 *    - tagName (String): The name of the HTML element to create.
 *    - attributes (Object): A list of attribute/value pairs to set on the
 *      element.
 *  
 *  Creates an HTML element with `tagName` as the tag name.
**/
(function(global) {
  var element = global.Element;
  global.Element = function(tagName, attributes) {
    attributes = attributes || { };
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
  Object.extend(global.Element, element || { });
  if (element) global.Element.prototype = element.prototype;
})(this);

Element.cache = { };
Element.idCounter = 1;

Element.Methods = {
  /** 
   *  Element.visible(@element) -> boolean
   *  
   *  Tells whether `element` is visible (i.e., whether its inline `display`
   *  CSS property is set to `none`.
  **/
  visible: function(element) {
    return $(element).style.display != 'none';
  },
  
  /** 
   *  Element.toggle(@element) -> Element
   *  
   *  Toggles the visibility of `element`. Returns `element`.
  **/
  toggle: function(element) {
    element = $(element);
    Element[Element.visible(element) ? 'hide' : 'show'](element);
    return element;
  },
  
  
  /**
   *  Element.hide(@element) -> Element
   *  
   *  Sets `display: none` on `element`. Returns `element`.
  **/
  hide: function(element) {
    element = $(element);
    element.style.display = 'none';
    return element;
  },
  
  /**
   *  Element.show(@element) -> Element
   *  
   *  Removes `display: none` on `element`. Returns `element`.
  **/
  show: function(element) {
    element = $(element);
    element.style.display = '';
    return element;
  },

  /**
   *  Element.remove(@element) -> Element
   *  
   *  Completely removes `element` from the document and returns it.
  **/
  remove: function(element) {
    element = $(element);
    element.parentNode.removeChild(element);
    return element;
  },

  /** 
   *  Element.update(@element[, newContent]) -> Element
   *  
   *  Replaces _the content_ of `element` with the `newContent` argument and
   *  returns `element`.
   *  
   *  If `newContent` is omitted, the element's content is blanked out (i.e., 
   *  replaced with an empty string).
  **/
  update: function(element, content) {
    element = $(element);
    if (content && content.toElement) content = content.toElement();
    if (Object.isElement(content)) return element.update().insert(content);
    content = Object.toHTML(content);
    element.innerHTML = content.stripScripts();
    content.evalScripts.bind(content).defer();
    return element;
  },
  
  /**
   *  Element.replace(@element[, newContent]) -> Element
   *  
   *  Replaces `element` _itself_ with `newContent` and returns `element`.
   *  
   *  Keep in mind that this method returns the element that has just been
   *  removed — not the element that took its place.
  **/
  replace: function(element, content) {
    element = $(element);
    if (content && content.toElement) content = content.toElement();
    else if (!Object.isElement(content)) {
      content = Object.toHTML(content);
      var range = element.ownerDocument.createRange();
      range.selectNode(element);
      content.evalScripts.bind(content).defer();
      content = range.createContextualFragment(content.stripScripts());
    }
    element.parentNode.replaceChild(content, element);
    return element;
  },
  
  /**
   *  Element.insert(@element, content) -> Element
   *    - content (String | Object): The content to insert.
   *  
   *  Inserts content at a specific point relative to `element`.
   *  
   *  The `content` argument can be a string, in which case the implied
   *  insertion point is `bottom`. Or it can be an object that specifies
   *  one or more insertion points (e.g., `{ bottom: "foo", top: "bar" }`).
   *  
   *  Accepted insertion points are `before` (as `element`'s previous sibling);
   *  `after` (as `element's` next sibling); `top` (as `element`'s first
   *  child); and `bottom` (as `element`'s last child).
  **/
  insert: function(element, insertions) {
    element = $(element);
    
    if (Object.isString(insertions) || Object.isNumber(insertions) ||
        Object.isElement(insertions) || (insertions && (insertions.toElement || insertions.toHTML)))
          insertions = {bottom:insertions};
    
    var content, insert, tagName, childNodes;
    
    for (var position in insertions) {
      content  = insertions[position];
      position = position.toLowerCase();
      insert = Element._insertionTranslations[position];

      if (content && content.toElement) content = content.toElement();
      if (Object.isElement(content)) {
        insert(element, content);
        continue;
      }
    
      content = Object.toHTML(content);
      
      tagName = ((position == 'before' || position == 'after')
        ? element.parentNode : element).tagName.toUpperCase();
      
      childNodes = Element._getContentFromAnonymousElement(tagName, content.stripScripts());
      
      if (position == 'top' || position == 'after') childNodes.reverse();
      childNodes.each(insert.curry(element));
      
      content.evalScripts.bind(content).defer();
    }
    
    return element;
  },
  
  /**
   *  Element.wrap(@element, wrapper[, attributes]) -> Element
   *    - wrapper (Element | String): An element to wrap `element` inside, or
   *      else a string representing the tag name of an element to be created.
   *    - attributes (Object): A set of attributes to apply to the wrapper
   *      element. Refer to the [[Element]] constructor for usage.
   *  
   *  Wraps an element inside another, then returns the wrapper.
  **/
  wrap: function(element, wrapper, attributes) {
    element = $(element);
    if (Object.isElement(wrapper))
      $(wrapper).writeAttribute(attributes || { });
    else if (Object.isString(wrapper)) wrapper = new Element(wrapper, attributes);
    else wrapper = new Element('div', wrapper);
    if (element.parentNode)
      element.parentNode.replaceChild(wrapper, element);
    wrapper.appendChild(element);
    return wrapper;
  },
  
  /**
   *  Element.inspect(@element) -> String
   *  
   *  Returns the debug-oriented string representation of `element`.
  **/
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
  
  /**
   *  Element.recursivelyCollect(element, property) -> [Element...]
   *  
   *  Recursively collects elements whose relationship to `element` is
   *  specified by `property`. `property` has to be a _property_ (a method
   *  won’t do!) of `element` that points to a single DOM node (e.g., 
   *  `nextSibling` or `parentNode`). 
  **/
  recursivelyCollect: function(element, property) {
    element = $(element);
    var elements = [];
    while (element = element[property])
      if (element.nodeType == 1)
        elements.push(Element.extend(element));
    return elements;
  },
  
  /**
   *  Element.ancestors(@element) -> [Element...]
   *  
   *  Collects all of `element`’s ancestors and returns them as an array of
   *  elements.
  **/
  ancestors: function(element) {
    return $(element).recursivelyCollect('parentNode');
  },
  
  /**
   *  Element.descendants(@element) -> [Element...]
   *  
   *  Collects all of element’s descendants and returns them as an array of
   *  elements.
  **/
  descendants: function(element) {
    return Element.select(element, "*");
  },
  
  /**
   *  Element.firstDescendant(@element) -> Element
   *  
   *  Returns the first child that is an element.
   *  
   *  This is opposed to the `firstChild` DOM property, which will return
   *  any node, including text nodes.
  **/
  firstDescendant: function(element) {
    element = $(element).firstChild;
    while (element && element.nodeType != 1) element = element.nextSibling;
    return $(element);
  },
  
  /** alias of: Element.childElements
   *  
   *  Element.childElements(@element) -> [Element...]
   *  
   *  Collects all of `element`’s immediate descendants (i.e., children) and
   *  returns them as an array of elements.
  **/
  immediateDescendants: function(element) {
    if (!(element = $(element).firstChild)) return [];
    while (element && element.nodeType != 1) element = element.nextSibling;
    if (element) return [element].concat($(element).nextSiblings());
    return [];
  },

  /**
   *  Element.previousSiblings(@element) -> [Element...]
   *  
   *  Collects all of `element`’s previous siblings and returns them as an
   *  array of elements.
  **/
  previousSiblings: function(element) {
    return $(element).recursivelyCollect('previousSibling');
  },
  
  /**
   *  Element.nextSiblings(@element) -> [Element...]
   *  
   *  Collects all of `element`’s next siblings and returns them as an array
   *  of elements.
  **/
  nextSiblings: function(element) {
    return $(element).recursivelyCollect('nextSibling');
  },
  
  /**
   *  Element.siblings(@element) -> [Element...]
   *  Collects all of element’s siblings and returns them as an array of
   *  elements.
  **/
  siblings: function(element) {
    element = $(element);
    return element.previousSiblings().reverse().concat(element.nextSiblings());
  },
  
  /**
   *  Element.match(@element, selector) -> boolean
   *    - selector (String): A CSS selector.
   *  
   *  Checks if `element` matches the given CSS selector.
  **/
  match: function(element, selector) {
    if (Object.isString(selector))
      selector = new Selector(selector);
    return selector.match($(element));
  },
  
  /**
   *  Element.up(@element[, expression[, index = 0]]) -> Element
   *  Element.up(@element[, index = 0]) -> Element
   *    - expression (String): A CSS selector.
   *  
   *  Returns `element`’s first ancestor (or the Nth ancestor, if `index`
   *  is specified) that matches `expression`. If no `expression` is
   *  provided, all ancestors are considered. If no ancestor matches these
   *  criteria, `undefined` is returned.
  **/
  up: function(element, expression, index) {
    element = $(element);
    if (arguments.length == 1) return $(element.parentNode);
    var ancestors = element.ancestors();
    return Object.isNumber(expression) ? ancestors[expression] :
      Selector.findElement(ancestors, expression, index);
  },
  
  /**
   *  Element.down(@element[, expression[, index = 0]]) -> Element
   *  Element.down(@element[, index = 0]) -> Element
   *    - expression (String): A CSS selector.
   *  
   *  Returns `element`’s first descendant (or the Nth descendant, if `index`
   *  is specified) that matches `expression`. If no `expression` is
   *  provided, all descendants are considered. If no descendant matches these
   *  criteria, `undefined` is returned.
  **/
  down: function(element, expression, index) {
    element = $(element);
    if (arguments.length == 1) return element.firstDescendant();
    return Object.isNumber(expression) ? element.descendants()[expression] :
      Element.select(element, expression)[index || 0];
  },

  /**
   *  Element.previous(@element[, expression[, index = 0]]) -> Element
   *  Element.previous(@element[, index = 0]) -> Element
   *    - expression (String): A CSS selector.
   *  
   *  Returns `element`’s first previous sibling (or the Nth, if `index`
   *  is specified) that matches `expression`. If no `expression` is
   *  provided, all previous siblings are considered. If none matches these
   *  criteria, `undefined` is returned.
  **/
  previous: function(element, expression, index) {
    element = $(element);
    if (arguments.length == 1) return $(Selector.handlers.previousElementSibling(element));
    var previousSiblings = element.previousSiblings();
    return Object.isNumber(expression) ? previousSiblings[expression] :
      Selector.findElement(previousSiblings, expression, index);   
  },
  
  /**
   *  Element.next(@element[, expression[, index = 0]]) -> Element
   *  Element.next(@element[, index = 0]) -> Element
   *    - expression (String): A CSS selector.
   *  
   *  Returns `element`’s first following sibling (or the Nth, if `index`
   *  is specified) that matches `expression`. If no `expression` is
   *  provided, all following siblings are considered. If none matches these
   *  criteria, `undefined` is returned.
  **/
  next: function(element, expression, index) {
    element = $(element);
    if (arguments.length == 1) return $(Selector.handlers.nextElementSibling(element));
    var nextSiblings = element.nextSiblings();
    return Object.isNumber(expression) ? nextSiblings[expression] :
      Selector.findElement(nextSiblings, expression, index);
  },
  
  
  /**
   *  Element.select(@element, selector...) -> [Element...]
   *    - selector (String): A CSS selector.
   *  
   *  Takes an arbitrary number of CSS selectors and returns an array of
   *  descendants of `element` that match any of them.
  **/
  select: function() {
    var args = $A(arguments), element = $(args.shift());
    return Selector.findChildElements(element, args);
  },
  
  /**
   *  Element.adjacent(@element, selector...) -> [Element...]
   *    - selector (String): A CSS selector.
   *  
   *  Finds all siblings of the current element that match the given
   *  selector(s).
  **/
  adjacent: function() {
    var args = $A(arguments), element = $(args.shift());
    return Selector.findChildElements(element.parentNode, args).without(element);
  },
  
  /**
   *  Element.identify(@element) -> String
   *  
   *  Returns `element`'s ID. If `element` does not have an ID, one is
   *  generated, assigned to `element`, and returned.
  **/
  identify: function(element) {
    element = $(element);
    var id = element.readAttribute('id');
    if (id) return id;
    do { id = 'anonymous_element_' + Element.idCounter++ } while ($(id));
    element.writeAttribute('id', id);
    return id;
  },
  
  /**
   *  Element.readAttribute(@element, attributeName) -> String | null
   *  
   *  Returns the value of `element`'s attribute with the given name.
  **/
  readAttribute: (function(){
    
    var iframeGetAttributeThrowsError = (function(){
      var el = document.createElement('iframe'),
          isBuggy = false;
          
      document.documentElement.appendChild(el);
      try {
        el.getAttribute('type', 2);
      } catch(e) {
        isBuggy = true;
      }
      document.documentElement.removeChild(el);
      el = null;
      return isBuggy;
    })();
    
    return function(element, name) {
      element = $(element);
      // check boolean first, to get out of expression faster
      if (iframeGetAttributeThrowsError &&
          name === 'type' && 
          element.tagName.toUpperCase() == 'IFRAME') {
        return element.getAttribute('type');
      }
      if (Prototype.Browser.IE) {
        var t = Element._attributeTranslations.read;
        if (t.values[name]) return t.values[name](element, name);
        if (t.names[name]) name = t.names[name];
        if (name.include(':')) {
          return (!element.attributes || !element.attributes[name]) ? null : 
           element.attributes[name].value;
        }
      }      
      return element.getAttribute(name);
    }
  })(),
  
  /**
   *  Element.writeAttribute(@element, attribute[, value = true]) -> Element
   *  Element.writeAttribute(@element, attributes) -> Element
   *  
   *  Adds, changes, or removes attributes passed as either a hash or a
   *  name/value pair.
  **/
  writeAttribute: function(element, name, value) {
    element = $(element);
    var attributes = { }, t = Element._attributeTranslations.write;
    
    if (typeof name == 'object') attributes = name;
    else attributes[name] = Object.isUndefined(value) ? true : value;
    
    for (var attr in attributes) {
      name = t.names[attr] || attr;
      value = attributes[attr];
      if (t.values[attr]) name = t.values[attr](element, value);
      if (value === false || value === null)
        element.removeAttribute(name);
      else if (value === true)
        element.setAttribute(name, name);
      else element.setAttribute(name, value);
    }
    return element;
  },
  
  /**
   *  Element.getHeight(@element) -> Number
   *  
   *  Returns the height of `element`.
  **/
  getHeight: function(element) {
    return $(element).getDimensions().height; 
  },
  
  /**
   *  Element.getWidth(@element) -> Number
   *  
   *  Returns the width of `element`.
  **/
  getWidth: function(element) {
    return $(element).getDimensions().width; 
  },
  
  /**
   *  Element.classNames(@element) -> [String...]
   *  
   *  Returns a new instance of [[Element.ClassNames]], an [[Enumerable]]
   *  object used to read and write CSS class names of `element`.
  **/
  classNames: function(element) {
    return new Element.ClassNames(element);
  },

  /**
   *  Element.hasClassName(@element, className) -> Boolean
   *  
   *  Checks whether `element` has the given CSS class name.
  **/
  hasClassName: function(element, className) {
    if (!(element = $(element))) return;
    var elementClassName = element.className;
    return (elementClassName.length > 0 && (elementClassName == className || 
      new RegExp("(^|\\s)" + className + "(\\s|$)").test(elementClassName)));
  },

  /**
   *  Element.addClassName(@element, className) -> Element
   *  
   *  Adds a CSS class to `element`.
  **/
  addClassName: function(element, className) {
    if (!(element = $(element))) return;
    if (!element.hasClassName(className))
      element.className += (element.className ? ' ' : '') + className;
    return element;
  },

  /**
   *  Element.removeClassName(@element, className) -> Element
   *  
   *  Removes a CSS class from `element`.
  **/
  removeClassName: function(element, className) {
    if (!(element = $(element))) return;
    element.className = element.className.replace(
      new RegExp("(^|\\s+)" + className + "(\\s+|$)"), ' ').strip();
    return element;
  },
  
  /**
   *  Element.toggleClassName(@element, className)
   *  
   *  Toggles the presence of a CSS class on `element`.
  **/
  toggleClassName: function(element, className) {
    if (!(element = $(element))) return;
    return element[element.hasClassName(className) ?
      'removeClassName' : 'addClassName'](className);
  },
  
  /**
   *  Element.cleanWhitespace(@element) -> Element
   *  
   *  Removes whitespace-only text node children from `element`.
  **/
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
  
  /**
   *  Element.empty(@element) -> Element
   *  
   *  Tests whether `element` is empty (i.e., contains only whitespace).
  **/
  empty: function(element) {
    return $(element).innerHTML.blank();
  },
  
  /**
   *  Element.descendantOf(@element, ancestor) -> Boolean
   *  
   *  Checks if `element` is a descendant of `ancestor`.
  **/
  descendantOf: function(element, ancestor) {
    element = $(element), ancestor = $(ancestor);

    if (element.compareDocumentPosition)
      return (element.compareDocumentPosition(ancestor) & 8) === 8;
      
    if (ancestor.contains)
      return ancestor.contains(element) && ancestor !== element;
    
    while (element = element.parentNode)
      if (element == ancestor) return true;
      
    return false;
  },
  
  /**
   *  Element.scrollTo(@element) -> Element
   *  
   *  Scrolls the window so that `element` appears at the top of the viewport.
  **/
  scrollTo: function(element) {
    element = $(element);
    var pos = element.cumulativeOffset();
    window.scrollTo(pos[0], pos[1]);
    return element;
  },
  
  /**
   *  Element.getStyle(@element, style) -> String | null
   *    - style (String): The property name to be retrieved.
   *  
   *  Returns the given CSS property value of `element`. The property can be
   *  specified in either its CSS form (`font-size`) or its camelized form
   *  (`fontSize`).
  **/
  getStyle: function(element, style) {
    element = $(element);
    style = style == 'float' ? 'cssFloat' : style.camelize();
    var value = element.style[style];
    if (!value || value == 'auto') {
      var css = document.defaultView.getComputedStyle(element, null);
      value = css ? css[style] : null;
    }
    if (style == 'opacity') return value ? parseFloat(value) : 1.0;
    return value == 'auto' ? null : value;
  },
  
  /**
   *  Element.getOpacity(@element) -> String | null
   *  
   *  Returns the opacity of the element.
  **/
  getOpacity: function(element) {
    return $(element).getStyle('opacity');
  },
  
  /**
   *  Element.setStyle(@element, styles) -> Element
   *  
   *  Modifies `element`’s CSS style properties.
   *  
   *  Styles are passed as an object of property-value pairs in which the
   *  properties are specified in their camelized form (e.g., `fontSize`).
  **/
  setStyle: function(element, styles) {
    element = $(element);
    var elementStyle = element.style, match;
    if (Object.isString(styles)) {
      element.style.cssText += ';' + styles;
      return styles.include('opacity') ?
        element.setOpacity(styles.match(/opacity:\s*(\d?\.?\d*)/)[1]) : element;
    }
    for (var property in styles)
      if (property == 'opacity') element.setOpacity(styles[property]);
      else 
        elementStyle[(property == 'float' || property == 'cssFloat') ?
          (Object.isUndefined(elementStyle.styleFloat) ? 'cssFloat' : 'styleFloat') : 
            property] = styles[property];

    return element;
  },
  
  /**
   *  Element.setOpacity(@element, value) -> Element
   *  
   *  Sets the opacity of `element`.
  **/
  setOpacity: function(element, value) {
    element = $(element);
    element.style.opacity = (value == 1 || value === '') ? '' : 
      (value < 0.00001) ? 0 : value;
    return element;
  },
  
  /**
   *  Element.getDimensions(@element) -> Object
   *  
   *  Finds the computed width and height of `element` and returns them as
   *  key/value pairs of an object.
  **/
  getDimensions: function(element) {
    element = $(element);
    var display = element.getStyle('display');
    if (display != 'none' && display != null) // Safari bug
      return {width: element.offsetWidth, height: element.offsetHeight};
    
    // All *Width and *Height properties give 0 on elements with display none,
    // so enable the element temporarily
    var els = element.style;
    var originalVisibility = els.visibility;
    var originalPosition = els.position;
    var originalDisplay = els.display;
    els.visibility = 'hidden';
    if (originalPosition != 'fixed') // Switching fixed to absolute causes issues in Safari
      els.position = 'absolute';
    els.display = 'block';
    var originalWidth = element.clientWidth;
    var originalHeight = element.clientHeight;
    els.display = originalDisplay;
    els.position = originalPosition;
    els.visibility = originalVisibility;
    return {width: originalWidth, height: originalHeight};    
  },
  
  /**
   *  Element.makePositioned(@element) -> Element
   *  
   *  Allows for the easy creation of a CSS containing block by setting 
   *  `element`'s CSS `position` to `relative` if its initial position is
   *  either `static` or `undefined`.
  **/
  makePositioned: function(element) {
    element = $(element);
    var pos = Element.getStyle(element, 'position');
    if (pos == 'static' || !pos) {
      element._madePositioned = true;
      element.style.position = 'relative';
      // Opera returns the offset relative to the positioning context, when an
      // element is position relative but top and left have not been defined
      if (Prototype.Browser.Opera) {
        element.style.top = 0;
        element.style.left = 0;
      }  
    }
    return element;
  },
  
  /**
   *  Element.undoPositioned(@element) -> Element
   *  
   *  Sets `element` back to the state it was in _before_
   *  [[Element.makePositioned]] was applied to it.
  **/
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

  /**
   *  Element.makeClipping(@element) -> Element
   *  
   *  Simulates the poorly-supported CSS `clip` property by setting `element`'s
   *  `overflow` value to `hidden`.
  **/
  makeClipping: function(element) {
    element = $(element);
    if (element._overflow) return element;
    element._overflow = Element.getStyle(element, 'overflow') || 'auto';
    if (element._overflow !== 'hidden')
      element.style.overflow = 'hidden';
    return element;
  },

  /**
   *  Element.undoClipping(@element) -> Element
   *  
   *  Sets `element`’s CSS `overflow` property back to the value it had
   *  _before_ [[Element.makeClipping]] was applied.
  **/
  undoClipping: function(element) {
    element = $(element);
    if (!element._overflow) return element;
    element.style.overflow = element._overflow == 'auto' ? '' : element._overflow;
    element._overflow = null;
    return element;
  },

  /**
   *  Element.cumulativeOffset(@element) -> Array
   *  
   *  Returns the offsets of `element` from the top left corner of the
   *  document.
   *  
   *  Returns an array in the form of `[leftValue, topValue]`. Also accessible
   *  as properties: `{ left: leftValue, top: topValue }`.
  **/
  cumulativeOffset: function(element) {
    var valueT = 0, valueL = 0;
    do {
      valueT += element.offsetTop  || 0;
      valueL += element.offsetLeft || 0;
      element = element.offsetParent;
    } while (element);
    return Element._returnOffset(valueL, valueT);
  },

  /**
   *  Element.positionedOffset(@element) -> Array
   *  
   *  Returns `element`’s offset relative to its closest positioned ancestor
   *  (the element that would be returned by [[Element.getOffsetParent]]).
   *  
   *  Returns an array in the form of `[leftValue, topValue]`. Also accessible
   *  as properties: `{ left: leftValue, top: topValue }`.
  **/
  positionedOffset: function(element) {
    var valueT = 0, valueL = 0;
    do {
      valueT += element.offsetTop  || 0;
      valueL += element.offsetLeft || 0;
      element = element.offsetParent;
      if (element) {
        if (element.tagName.toUpperCase() == 'BODY') break;
        var p = Element.getStyle(element, 'position');
        if (p !== 'static') break;
      }
    } while (element);
    return Element._returnOffset(valueL, valueT);
  },

  /**
   *  Element.absolutize(@element) -> Element
   *  
   *  Turns `element` into an absolutely-positioned element _without_ changing
   *  its position in the page layout.
  **/
  absolutize: function(element) {
    element = $(element);
    if (element.getStyle('position') == 'absolute') return element;

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

  /**
   *  Element.relativize(@element) -> Element
   *  
   *  Turns `element` into a relatively-positioned element without changing
   *  its position in the page layout.
   *  
   *  Used to undo a call to [[Element.absolutize]].
  **/
  relativize: function(element) {
    element = $(element);
    if (element.getStyle('position') == 'relative') return element;

    element.style.position = 'relative';
    var top  = parseFloat(element.style.top  || 0) - (element._originalTop || 0);
    var left = parseFloat(element.style.left || 0) - (element._originalLeft || 0);

    element.style.top    = top + 'px';
    element.style.left   = left + 'px';
    element.style.height = element._originalHeight;
    element.style.width  = element._originalWidth;
    return element;
  },

  /**
   *  Element.cumulativeScrollOffset(@element) -> Array
   *  
   *  Calculates the cumulative scroll offset of an element in nested
   *  scrolling containers.
   *  
   *  Returns an array in the form of `[leftValue, topValue]`. Also accessible
   *  as properties: `{ left: leftValue, top: topValue }`.
  **/
  cumulativeScrollOffset: function(element) {
    var valueT = 0, valueL = 0;
    do {
      valueT += element.scrollTop  || 0;
      valueL += element.scrollLeft || 0; 
      element = element.parentNode;
    } while (element);
    return Element._returnOffset(valueL, valueT);
  },
  
  /**
   *  Element.getOffsetParent(@element) -> Element
   *  
   *  Returns `element`’s closest _positioned_ ancestor. If none is found, the
   *  `body` element is returned.
  **/
  getOffsetParent: function(element) {
    if (element.offsetParent) return $(element.offsetParent);
    if (element == document.body) return $(element);
    
    while ((element = element.parentNode) && element != document.body)
      if (Element.getStyle(element, 'position') != 'static')
        return $(element);

    return $(document.body);
  },

  /**
   *  Element.viewportOffset(@element) -> Array
   *  
   *  Returns the X/Y coordinates of element relative to the viewport.
   *  
   *  Returns an array in the form of `[leftValue, topValue]`. Also accessible
   *  as properties: `{ left: leftValue, top: topValue }`.
  **/
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
      if (!Prototype.Browser.Opera || (element.tagName && (element.tagName.toUpperCase() == 'BODY'))) {
        valueT -= element.scrollTop  || 0;
        valueL -= element.scrollLeft || 0;
      }
    } while (element = element.parentNode);

    return Element._returnOffset(valueL, valueT);
  },
  
  /**
   *  Element.clonePosition(@element, source[, options]) -> Element
   *  
   *  Clones the position and/or dimensions of `source` onto `element` as
   *  defined by `options`.
   *  
   *  Valid keys for `options` are: `setLeft`, `setTop`, `setWidth`, and
   *  `setHeight` (all booleans which default to `true`); and `offsetTop`
   *  and `offsetLeft` (numbers which default to `0`). Use these to control
   *  which aspects of `source`'s layout are cloned and how much to offset
   *  the resulting position of `element`.
  **/
  clonePosition: function(element, source) {
    var options = Object.extend({
      setLeft:    true,
      setTop:     true,
      setWidth:   true,
      setHeight:  true,
      offsetTop:  0,
      offsetLeft: 0
    }, arguments[2] || { });

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
  /** alias of: Element.select
   *  Element.getElementsBySelector(@element, selector) -> [Element...]
  **/
  getElementsBySelector: Element.Methods.select,
  
  /** alias of: Element.immediateDescendants
   *  Element.childElements(@element) -> [Element...]
  **/
  childElements: Element.Methods.immediateDescendants
});

Element._attributeTranslations = {
  write: {
    names: {
      className: 'class',
      htmlFor:   'for'      
    }, 
    values: { }
  }
};

if (Prototype.Browser.Opera) { 
  Element.Methods.getStyle = Element.Methods.getStyle.wrap( 
    function(proceed, element, style) {
      switch (style) {
        case 'left': case 'top': case 'right': case 'bottom':
          if (proceed(element, 'position') === 'static') return null;
        case 'height': case 'width':
          // returns '0px' for hidden elements; we want it to return null
          if (!Element.visible(element)) return null;
          
          // returns the border-box dimensions rather than the content-box
          // dimensions, so we subtract padding and borders from the value
          var dim = parseInt(proceed(element, style), 10);
          
          if (dim !== element['offset' + style.capitalize()])
            return dim + 'px';
            
          var properties;
          if (style === 'height') {
            properties = ['border-top-width', 'padding-top',
             'padding-bottom', 'border-bottom-width'];
          }
          else {
            properties = ['border-left-width', 'padding-left',
             'padding-right', 'border-right-width'];            
          }             
          return properties.inject(dim, function(memo, property) {
            var val = proceed(element, property);
            return val === null ? memo : memo - parseInt(val, 10);              
          }) + 'px';          
        default: return proceed(element, style);
      }
    }
  );
  
  Element.Methods.readAttribute = Element.Methods.readAttribute.wrap(
    function(proceed, element, attribute) {
      if (attribute === 'title') return element.title;
      return proceed(element, attribute);
    }
  );  
}

else if (Prototype.Browser.IE) {
  // IE doesn't report offsets correctly for static elements, so we change them
  // to "relative" to get the values, then change them back.  
  Element.Methods.getOffsetParent = Element.Methods.getOffsetParent.wrap(
    function(proceed, element) {
      element = $(element);
      // IE throws an error if element is not in document
      try { element.offsetParent }
      catch(e) { return $(document.body) }
      var position = element.getStyle('position');
      if (position !== 'static') return proceed(element);
      element.setStyle({ position: 'relative' });
      var value = proceed(element);
      element.setStyle({ position: position });
      return value;
    }
  );
  
  $w('positionedOffset viewportOffset').each(function(method) {
    Element.Methods[method] = Element.Methods[method].wrap(
      function(proceed, element) {
        element = $(element);
        try { element.offsetParent }
        catch(e) { return Element._returnOffset(0,0) }
        var position = element.getStyle('position');
        if (position !== 'static') return proceed(element);
        // Trigger hasLayout on the offset parent so that IE6 reports
        // accurate offsetTop and offsetLeft values for position: fixed.
        var offsetParent = element.getOffsetParent();
        if (offsetParent && offsetParent.getStyle('position') === 'fixed')
          offsetParent.setStyle({ zoom: 1 });
        element.setStyle({ position: 'relative' });
        var value = proceed(element);
        element.setStyle({ position: position });
        return value;
      }
    );
  });
  
  Element.Methods.cumulativeOffset = Element.Methods.cumulativeOffset.wrap(
    function(proceed, element) {
      try { element.offsetParent }
      catch(e) { return Element._returnOffset(0,0) }
      return proceed(element);
    }
  );
    
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
    var currentStyle = element.currentStyle;
    if ((currentStyle && !currentStyle.hasLayout) ||
      (!currentStyle && element.style.zoom == 'normal'))
        element.style.zoom = 1;
    
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
        'class': 'className',
        'for':   'htmlFor'
      },
      values: {
        _getAttr: function(element, attribute) {
          return element.getAttribute(attribute, 2);
        },
        _getAttrNode: function(element, attribute) {
          var node = element.getAttributeNode(attribute);
          return node ? node.value : "";
        },
        _getEv: function(element, attribute) {
          attribute = element.getAttribute(attribute);
          
          // TODO: Need something less ugly here.
          if (!attribute) return null;
          attribute = attribute.toString();
          attribute = attribute.split('{')[1];
          attribute = attribute.split('}')[0];
          return attribute.strip();
        },
        _flag: function(element, attribute) {
          return $(element).hasAttribute(attribute) ? attribute : null;
        },
        style: function(element) {
          return element.style.cssText.toLowerCase();
        },
        title: function(element) {
          return element.title;
        }
      }
    }
  };
  
  Element._attributeTranslations.write = {
    names: Object.extend({
      cellpadding: 'cellPadding',
      cellspacing: 'cellSpacing'
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
  
  Element._attributeTranslations.has = {};
    
  $w('colSpan rowSpan vAlign dateTime accessKey tabIndex ' +
      'encType maxLength readOnly longDesc frameBorder').each(function(attr) {
    Element._attributeTranslations.write.names[attr.toLowerCase()] = attr;
    Element._attributeTranslations.has[attr.toLowerCase()] = attr;
  });
  
  (function(v) {
    Object.extend(v, {
      href:        v._getAttr,
      src:         v._getAttr,
      type:        v._getAttr,
      action:      v._getAttrNode,
      disabled:    v._flag,
      checked:     v._flag,
      readonly:    v._flag,
      multiple:    v._flag,
      onload:      v._getEv,
      onunload:    v._getEv,
      onclick:     v._getEv,
      ondblclick:  v._getEv,
      onmousedown: v._getEv,
      onmouseup:   v._getEv,
      onmouseover: v._getEv,
      onmousemove: v._getEv,
      onmouseout:  v._getEv,
      onfocus:     v._getEv,
      onblur:      v._getEv,
      onkeypress:  v._getEv,
      onkeydown:   v._getEv,
      onkeyup:     v._getEv,
      onsubmit:    v._getEv,
      onreset:     v._getEv,
      onselect:    v._getEv,
      onchange:    v._getEv
    });
  })(Element._attributeTranslations.read.values);
}

else if (Prototype.Browser.Gecko && /rv:1\.8\.0/.test(navigator.userAgent)) {
  Element.Methods.setOpacity = function(element, value) {
    element = $(element);
    element.style.opacity = (value == 1) ? 0.999999 : 
      (value === '') ? '' : (value < 0.00001) ? 0 : value;
    return element;
  };
}

else if (Prototype.Browser.WebKit) {
  Element.Methods.setOpacity = function(element, value) {
    element = $(element);
    element.style.opacity = (value == 1 || value === '') ? '' :
      (value < 0.00001) ? 0 : value;
    
    if (value == 1)
      if(element.tagName.toUpperCase() == 'IMG' && element.width) { 
        element.width++; element.width--;
      } else try {
        var n = document.createTextNode(' ');
        element.appendChild(n);
        element.removeChild(n);
      } catch (e) { }
    
    return element;
  };
  
  // Safari returns margins on body which is incorrect if the child is absolutely
  // positioned.  For performance reasons, redefine Element#cumulativeOffset for
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
    
    return Element._returnOffset(valueL, valueT);
  };
}

if (Prototype.Browser.IE || Prototype.Browser.Opera) {
  // IE and Opera are missing .innerHTML support for TABLE-related and SELECT elements
  Element.Methods.update = function(element, content) {
    element = $(element);
    
    if (content && content.toElement) content = content.toElement();
    if (Object.isElement(content)) return element.update().insert(content);
    
    content = Object.toHTML(content);
    var tagName = element.tagName.toUpperCase();
    
    if (tagName in Element._insertionTranslations.tags) {
      $A(element.childNodes).each(function(node) { element.removeChild(node) });
      Element._getContentFromAnonymousElement(tagName, content.stripScripts())
        .each(function(node) { element.appendChild(node) });
    }
    else element.innerHTML = content.stripScripts();
    
    content.evalScripts.bind(content).defer();
    return element;
  };
}

if ('outerHTML' in document.createElement('div')) {
  Element.Methods.replace = function(element, content) {
    element = $(element);
    
    if (content && content.toElement) content = content.toElement();
    if (Object.isElement(content)) {
      element.parentNode.replaceChild(content, element);
      return element;
    }

    content = Object.toHTML(content);
    var parent = element.parentNode, tagName = parent.tagName.toUpperCase();
    
    if (Element._insertionTranslations.tags[tagName]) {
      var nextSibling = element.next();
      var fragments = Element._getContentFromAnonymousElement(tagName, content.stripScripts());
      parent.removeChild(element);
      if (nextSibling)
        fragments.each(function(node) { parent.insertBefore(node, nextSibling) });
      else 
        fragments.each(function(node) { parent.appendChild(node) });
    }
    else element.outerHTML = content.stripScripts();
    
    content.evalScripts.bind(content).defer();
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
  var div = new Element('div'), t = Element._insertionTranslations.tags[tagName];
  if (t) {
    div.innerHTML = t[0] + html + t[1];
    t[2].times(function() { div = div.firstChild });
  } else div.innerHTML = html;
  return $A(div.childNodes);
};

Element._insertionTranslations = {
  before: function(element, node) {
    element.parentNode.insertBefore(node, element);
  },
  top: function(element, node) {
    element.insertBefore(node, element.firstChild);
  },
  bottom: function(element, node) {
    element.appendChild(node);
  },
  after: function(element, node) {
    element.parentNode.insertBefore(node, element.nextSibling);
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
  Object.extend(this.tags, {
    THEAD: this.tags.TBODY,
    TFOOT: this.tags.TBODY,
    TH:    this.tags.TD
  });
}).call(Element._insertionTranslations);

Element.Methods.Simulated = {
  hasAttribute: function(element, attribute) {
    attribute = Element._attributeTranslations.has[attribute] || attribute;
    var node = $(element).getAttributeNode(attribute);
    return !!(node && node.specified);
  }
};

Element.Methods.ByTag = { };

Object.extend(Element, Element.Methods);

(function(div) {
  
  if (!Prototype.BrowserFeatures.ElementExtensions && div['__proto__']) {
    window.HTMLElement = { };
    window.HTMLElement.prototype = div['__proto__'];
    Prototype.BrowserFeatures.ElementExtensions = true;
  }
  
  div = null;
  
})(document.createElement('div'))

/**
 *  Element.extend(element) -> Element
 *  
 *  Extends `element` with all of the methods contained in `Element.Methods`
 *  and `Element.Methods.Simulated`.
 *  If `element` is an `input`, `textarea`, or `select` tag, it will also be
 *  extended with the methods from `Form.Element.Methods`. If it is a `form`
 *  tag, it will also be extended with the methods from `Form.Methods`.
**/
Element.extend = (function() {
  if (Prototype.BrowserFeatures.SpecificElementExtensions)
    return Prototype.K;

  var Methods = { }, ByTag = Element.Methods.ByTag;
  
  var extend = Object.extend(function(element) {
    if (!element || element._extendedByPrototype || 
        element.nodeType != 1 || element == window) return element;

    var methods = Object.clone(Methods),
      tagName = element.tagName.toUpperCase(), property, value;
    
    // extend methods for specific tags
    if (ByTag[tagName]) Object.extend(methods, ByTag[tagName]);
    
    for (property in methods) {
      value = methods[property];
      if (Object.isFunction(value) && !(property in element))
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

Element.hasAttribute = function(element, attribute) {
  if (element.hasAttribute) return element.hasAttribute(attribute);
  return Element.Methods.Simulated.hasAttribute(element, attribute);
};

/**
 *  Element.addMethods(methods) -> undefined
 *  Element.addMethods(tagName, methods) -> undefined
 *  
 *  Takes a hash of methods and makes them available as methods of extended
 *  elements and of the `Element` object.
 *  
 *  The second usage form is for adding methods only to specific tag names.
 *  
**/
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
  
  if (!tagName) Object.extend(Element.Methods, methods || { });  
  else {
    if (Object.isArray(tagName)) tagName.each(extend);
    else extend(tagName);
  }
  
  function extend(tagName) {
    tagName = tagName.toUpperCase();
    if (!Element.Methods.ByTag[tagName])
      Element.Methods.ByTag[tagName] = { };
    Object.extend(Element.Methods.ByTag[tagName], methods);
  }

  function copy(methods, destination, onlyIfAbsent) {
    onlyIfAbsent = onlyIfAbsent || false;
    for (var property in methods) {
      var value = methods[property];
      if (!Object.isFunction(value)) continue;
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
    
    var element = document.createElement(tagName);    
    var proto = element['__proto__'] || element.constructor.prototype;    
    element = null;
    return proto;
  }
  
  var elementPrototype = window.HTMLElement ? HTMLElement.prototype :
   Element.prototype;
  
  if (F.ElementExtensions) {
    copy(Element.Methods, elementPrototype);
    copy(Element.Methods.Simulated, elementPrototype, true);
  }
  
  if (F.SpecificElementExtensions) {
    for (var tag in Element.Methods.ByTag) {
      var klass = findDOMClass(tag);
      if (Object.isUndefined(klass)) continue;
      copy(T[tag], klass.prototype);
    }
  }  

  Object.extend(Element, Element.Methods);
  delete Element.ByTag;
  
  if (Element.extend.refresh) Element.extend.refresh();
  Element.cache = { };
};

/** section: dom
 * document.viewport 
**/

document.viewport = {
  
  /**
   *  document.viewport.getDimensions() -> Object
   *  
   *  Returns the size of the viewport.
   *  
   *  Returns an object of the form `{ width: Number, height: Number }`.
  **/
  getDimensions: function() {
    return { width: this.getWidth(), height: this.getHeight() };
  },

  /**
   *  document.viewport.getScrollOffsets() -> Array
   *  
   *  Returns the viewport’s horizontal and vertical scroll offsets.
   *  
   *  Returns an array in the form of `[leftValue, topValue]`. Also accessible
   *  as properties: `{ left: leftValue, top: topValue }`.
  **/
  getScrollOffsets: function() {
    return Element._returnOffset(
      window.pageXOffset || document.documentElement.scrollLeft || document.body.scrollLeft,
      window.pageYOffset || document.documentElement.scrollTop  || document.body.scrollTop);
  }
};

(function(viewport) {
  var B = Prototype.Browser, doc = document, element, property = {};
   
  function getRootElement() {
    // Older versions of Safari.
    if (B.WebKit && !doc.evaluate)
      return document;
    
    // Older versions of Opera.
    if (B.Opera && window.parseFloat(window.opera.version()) < 9.5)
      return document.body;
    
    return document.documentElement;
  }

  function define(D) {
    if (!element) element = getRootElement();
    
    property[D] = 'client' + D;

    viewport['get' + D] = function() { return element[property[D]] };
    return viewport['get' + D]();
  }
  
  /**
   *  document.viewport.getWidth() -> Number
   *  
   *  Returns the width of the viewport.
  **/
  viewport.getWidth  = define.curry('Width');
  
  /**
   *  document.viewport.getHeight() -> Number
   *  
   *  Returns the height of the viewport.
  **/
  viewport.getHeight = define.curry('Height');
})(document.viewport);


Element.Storage = {
  UID: 1
};

Element.addMethods({
  /**
   *  Element.getStorage(@element) -> Hash
   *  
   *  Returns the [[Hash]] object that stores custom metadata for this element.
  **/
  getStorage: function(element) {
    if (!(element = $(element))) return;
    
    var uid;
    if (element === window) {
      uid = 0;
    } else {
      if (Object.isUndefined(element._prototypeUID))
        element._prototypeUID = [Element.Storage.UID++];
      uid = element._prototypeUID[0];
    }
        
    if (!Element.Storage[uid])
      Element.Storage[uid] = $H();
    
    return Element.Storage[uid];
  },
  
  /**
   *  Element.store(@element, key, value) -> Element
   *  
   *  Stores a key/value pair of custom metadata on the element.
   *  
   *  The metadata can later be retrieved with [[Element.retrieve]].
  **/
  store: function(element, key, value) {
    if (!(element = $(element))) return;
    
    if (arguments.length === 2) {
      // Assume we've been passed an object full of key/value pairs.
      element.getStorage().update(key);
    } else {
      element.getStorage().set(key, value);
    }
    
    return element;
  },
  
  /**
   *  Element.retrieve(@element, key[, defaultValue]) -> ?
   *  
   *  Retrieves custom metadata set on `element` with [[Element.store]].
   *  
   *  If the value is `undefined` and `defaultValue` is given, it will be
   *  stored on the element as its new value for that key, then returned.
  **/
  retrieve: function(element, key, defaultValue) {
    if (!(element = $(element))) return;
    var hash = Element.getStorage(element), value = hash.get(key);
    
    if (Object.isUndefined(value)) {
      hash.set(key, defaultValue);
      value = defaultValue;
    }
    
    return value;
  }
});
