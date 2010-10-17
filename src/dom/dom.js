/** section: DOM, related to: Element
 *  $(id) -> Element
 *  $(id...) -> [Element...]
 *    - id (String | Element): A DOM node or a string that references a node's
 *      ID.
 *
 *  If provided with a string, returns the element in the document with
 *  matching ID; otherwise returns the passed element.
 *
 *  Takes in an arbitrary number of arguments. Returns one [[Element]] if
 *  given one argument; otherwise returns an [[Array]] of [[Element]]s.
 *
 *  All elements returned by the function are "extended" with [[Element]]
 *  instance methods.
 *
 *  ##### More Information
 *
 *  The [[$]] function is the cornerstone of Prototype. Not only does it
 *  provide a handy alias for `document.getElementById`, it also lets you pass
 *  indifferently IDs (strings) or DOM node references to your functions:
 *  
 *      function foo(element) {
 *          element = $(element);
 *          //  rest of the function...
 *      }
 *  
 *  Code written this way is flexible — you can pass it the ID of the element
 *  or the element itself without any type sniffing.
 *  
 *  Invoking it with only one argument returns the [[Element]], while invoking it
 *  with multiple arguments returns an [[Array]] of [[Element]]s (and this
 *  works recursively: if you're twisted, you could pass it an array
 *  containing some arrays, and so forth). As this is dependent on
 *  `getElementById`, [W3C specs](http://www.w3.org/TR/DOM-Level-2-Core/core.html#ID-getElBId)
 *  apply: nonexistent IDs will yield `null` and IDs present multiple times in
 *  the DOM will yield erratic results. *If you're assigning the same ID to
 *  multiple elements, you're doing it wrong!*
 *  
 *  The function also *extends every returned element* with [[Element.extend]]
 *  so you can use Prototype's DOM extensions on it. In the following code,
 *  the two lines are equivalent. However, the second one feels significantly
 *  more object-oriented:
 *  
 *      // Note quite OOP-like...
 *      Element.hide('itemId');
 *      // A cleaner feel, thanks to guaranted extension
 *      $('itemId').hide();
 *  
 *  However, when using iterators, leveraging the [[$]] function makes for
 *  more elegant, more concise, and also more efficient code:
 *  
 *      ['item1', 'item2', 'item3'].each(Element.hide);
 *      // The better way:
 *      $('item1', 'item2', 'item3').invoke('hide');
 *  
 *  See [How Prototype extends the DOM](http://prototypejs.org/learn/extensions)
 *  for more info.
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

if (!Node) var Node = { };

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

/** section: DOM
 *  class Element
 *
 *  The [[Element]] object provides a variety of powerful DOM methods for
 *  interacting with DOM elements&nbsp;&mdash; creating them, updating them,
 *  traversing them, etc. You can access these either as methods of [[Element]]
 *  itself, passing in the element to work with as the first argument, or as
 *  methods on extended element *instances*:
 *
 *      // Using Element:
 *      Element.addClassName('target', 'highlighted');
 *
 *      // Using an extended element instance:
 *      $('target').addClassName('highlighted');
 *
 *  [[Element]] is also a constructor for building element instances from scratch,
 *  see [`new Element`](#new-constructor) for details.
 *
 *  Most [[Element]] methods return the element instance, so that you can chain
 *  them easily:
 *
 *      $('message').addClassName('read').update('I read this message!');
 *
 *  ##### More Information
 *
 *  For more information about extended elements, check out ["How Prototype
 *  extends the DOM"](http://prototypejs.org/learn/extensions), which will walk
 *  you through the inner workings of Prototype's DOM extension mechanism.
**/

/**
 *  new Element(tagName[, attributes])
 *  - tagName (String): The name of the HTML element to create.
 *  - attributes (Object): An optional group of attribute/value pairs to set on
 *    the element.
 *
 *  Creates an HTML element with `tagName` as the tag name, optionally with the
 *  given attributes. This can be markedly more concise than working directly
 *  with the DOM methods, and takes advantage of Prototype's workarounds for
 *  various browser issues with certain attributes:
 *
 *  ##### Example
 *
 *      // The old way:
 *      var a = document.createElement('a');
 *      a.setAttribute('class', 'foo');
 *      a.setAttribute('href', '/foo.html');
 *      a.appendChild(document.createTextNode("Next page"));
 *
 *      // The new way:
 *      var a = new Element('a', {'class': 'foo', href: '/foo.html'}).update("Next page");
**/

(function(global) {  
  // For performance reasons, we create new elements by cloning a "blank"
  // version of a given element. But sometimes this causes problems. Skip
  // the cache if:
  //   (a) We're creating a SELECT element (troublesome in IE6);
  //   (b) We're setting the `type` attribute on an INPUT element
  //       (troublesome in IE9).
  function shouldUseCache(tagName, attributes) {
    if (tagName === 'select') return false;
    if ('type' in attributes) return false;
    return true;
  }
  
  var HAS_EXTENDED_CREATE_ELEMENT_SYNTAX = (function(){
    try {
      var el = document.createElement('<input name="x">');
      return el.tagName.toLowerCase() === 'input' && el.name === 'x';
    } 
    catch(err) {
      return false;
    }
  })();

  var element = global.Element;
      
  global.Element = function(tagName, attributes) {
    attributes = attributes || { };
    tagName = tagName.toLowerCase();
    var cache = Element.cache;
    
    if (HAS_EXTENDED_CREATE_ELEMENT_SYNTAX && attributes.name) {
      tagName = '<' + tagName + ' name="' + attributes.name + '">';
      delete attributes.name;      
      return Element.writeAttribute(document.createElement(tagName), attributes);
    }
    
    if (!cache[tagName]) cache[tagName] = Element.extend(document.createElement(tagName));
    
    var node = shouldUseCache(tagName, attributes) ? 
     cache[tagName].cloneNode(false) : document.createElement(tagName);
    
    return Element.writeAttribute(node, attributes);
  };
  
  Object.extend(global.Element, element || { });
  if (element) global.Element.prototype = element.prototype;
  
})(this);

Element.idCounter = 1;
Element.cache = { };

// Performs cleanup on an element before it is removed from the page.
// See `Element#purge`.
Element._purgeElement = function(element) {
  var uid = element._prototypeUID;
  if (uid) {
    // Must go first because it relies on Element.Storage.
    Element.stopObserving(element);
    element._prototypeUID = void 0;
    delete Element.Storage[uid];
  }
}

/**
 *  mixin Element.Methods
 *
 *  [[Element.Methods]] is a mixin for DOM elements. The methods of this object 
 *  are accessed through the [[$]] utility or through the [[Element]] object and
 *  shouldn't be accessed directly.
 *  
 *  ##### Examples
 *  
 *  Hide the element 
 *  
 *      $(element).hide(); 
 *      
 *  Return an [[Enumerable]] of all descendant nodes of the element with the id
 *  "article"
 *  
 *      $('articles').descendants();
**/
Element.Methods = {
  /**
   *  Element.visible(@element) -> Boolean
   *
   *  Tells whether `element` is visible (i.e., whether its inline `display`
   *  CSS property is set to `none`.
   *  
   *  ##### Examples
   *  
   *      language: html
   *      <div id="visible"></div>
   *      <div id="hidden" style="display: none;"></div>
   *
   *  And the associated JavaScript:
   *
   *      $('visible').visible();
   *      // -> true
   *      
   *      $('hidden').visible();
   *      // -> false
   *  
   *  ##### Notes
   *  
   *  Styles applied via a CSS stylesheet are _not_ taken into consideration.
   *  Note that this is not a Prototype limitation, it is a CSS limitation.
   *  
   *      language: html
   *      <style>
   *        #hidden-by-css {
   *          display: none;
   *        }
   *      </style>
   *      
   *      [...]
   *      
   *      <div id="hidden-by-css"></div>
   *
   *  And the associated JavaScript:
   *
   *      $('hidden-by-css').visible();
   *      // -> true
  **/
  visible: function(element) {
    return $(element).style.display != 'none';
  },

  /**
   *  Element.toggle(@element) -> Element
   *
   *  Toggles the visibility of `element`. Returns `element`.
   *  
   *  ##### Examples
   *  
   *      <div id="welcome-message"></div>
   *      <div id="error-message" style="display:none;"></div>
   *  
   *      $('welcome-message').toggle();
   *      // -> Element (and hides div#welcome-message)
   *      
   *      $('error-message').toggle();
   *      // -> Element (and displays div#error-message)
   *  
   *  Toggle multiple elements using [[Enumerable#each]]:
   *  
   *      ['error-message', 'welcome-message'].each(Element.toggle);
   *      // -> ['error-message', 'welcome-message'] 
   *  
   *  Toggle multiple elements using [[Enumerable#invoke]]:
   *  
   *      $('error-message', 'welcome-message').invoke('toggle');
   *      // -> [Element, Element]
   *
   *  ##### Notes
   *  
   *  [[Element.toggle]] _cannot_ display elements hidden via CSS stylesheets.
   *  Note that this is not a Prototype limitation but a consequence of how the
   *  CSS `display` property works.
   *  
   *      <style>
   *        #hidden-by-css {
   *          display: none;
   *        }
   *      </style>
   *      
   *      [...]
   *      
   *      <div id="hidden-by-css"></div>
   *  
   *      $('hidden-by-css').toggle(); // WONT' WORK!
   *      // -> Element (div#hidden-by-css is still hidden!)
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
   *  
   *  ##### Examples
   *
   *  Hide a single element:
   *  
   *      <div id="error-message"></div>
   *  
   *      $('error-message').hide();
   *      // -> Element (and hides div#error-message)
   *
   *  Hide multiple elements using [[Enumerable#each]]:
   *  
   *      ['content', 'navigation', 'footer'].each(Element.hide);
   *      // -> ['content', 'navigation', 'footer'] 
   *  
   *  Hide multiple elements using [[Enumerable#invoke]]:
   *  
   *      $('content', 'navigation', 'footer').invoke('hide');
   *      // -> [Element, Element, Element]
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
   *  
   *  ##### Examples
   *
   *  Show a single element:
   *  
   *      <div id="error-message" style="display:none;"></div>
   *  
   *      $('error-message').show();
   *      // -> Element (and displays div#error-message)
   *  
   *  Show multiple elements using [[Enumerable#each]]:
   *  
   *      ['content', 'navigation', 'footer'].each(Element.show);
   *      // -> ['content', 'navigation', 'footer'] 
   *  
   *  Show multiple elements using [[Enumerable#invoke]]:
   *  
   *      $('content', 'navigation', 'footer').invoke('show');
   *      // -> [Element, Element, Element]
   *  
   *  ##### Notes
   *  
   *  [[Element.show]] _cannot_ display elements hidden via CSS stylesheets.
   *  Note that this is not a Prototype limitation but a consequence of how the
   *  CSS `display` property works.
   *  
   *      <style>
   *        #hidden-by-css {
   *          display: none;
   *        }
   *      </style>
   *      
   *      [...]
   *      
   *      <div id="hidden-by-css"></div>
   *  
   *      $('hidden-by-css').show(); // DOES NOT WORK!
   *      // -> Element (div#error-message is still hidden!)
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
   *
   *  If you would rather just hide the element and keep it around for further
   *  use, try [[Element.hide]] instead.
   *  
   *  ##### Examples
   *  
   *      language: html
   *      // Before:
   *      <ul>
   *        <li id="golden-delicious">Golden Delicious</li>
   *        <li id="mutsu">Mutsu</li>
   *        <li id="mcintosh">McIntosh</li>
   *        <li id="ida-red">Ida Red</li>
   *      </ul>
   *
   *  And the associated JavaScript:
   *
   *      $('mutsu').remove();
   *      // -> Element (and removes li#mutsu)
   *  
   *  The resulting HTML:
   *
   *      language: html
   *      <ul>
   *        <li id="golden-delicious">Golden Delicious</li>
   *        <li id="mcintosh">McIntosh</li>
   *        <li id="ida-red">Ida Red</li>
   *      </ul>
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
   *  `newContent` may be in any of these forms:
   *  - [[String]]: A string of HTML to be parsed and rendered
   *  - [[Element]]: An Element instance to insert
   *  - ...any object with a `toElement` method: The method is called and the resulting element used
   *  - ...any object with a `toHTML` method: The method is called and the resulting HTML string
   *    is parsed and rendered
   *
   *  If `newContent` is omitted, the element's content is blanked out (i.e.,
   *  replaced with an empty string).
   *
   *  If `newContent` is a string and contains one or more inline `<script>` 
   *  tags, the scripts are scheduled to be evaluated after a very brief pause
   *  (using [[Function#defer]]) to allow the browser to finish updating the 
   *  DOM. Note that the scripts are evaluated in the scope of 
   *  [[String#evalScripts]], not in the global scope, which has important
   *  ramifications for your `var`s and `function`s.
   *  See [[String#evalScripts]] for details.
   *
   *  Note that this method allows seamless content update of table related 
   *  elements in Internet Explorer 6 and beyond.
   *  
   *  Any nodes replaced with `Element.update` will first have event
   *  listeners unregistered and storage keys removed. This frees up memory
   *  and prevents leaks in certain versions of Internet Explorer. (See
   *  [[Element.purge]]).
   *  
   *  ##### Examples
   *  
   *      language: html
   *      <div id="fruits">carrot, eggplant and cucumber</div>
   *  
   *  Passing a regular string:
   *  
   *      $('fruits').update('kiwi, banana and apple');
   *      // -> Element
   *      $('fruits').innerHTML;
   *      // -> 'kiwi, banana and apple'
   *  
   *  Clearing the element's content:
   *  
   *      $('fruits').update();
   *      // -> Element
   *      $('fruits').innerHTML;
   *      // -> '' (an empty string)
   *  
   *  And now inserting an HTML snippet:
   *  
   *      $('fruits').update('<p>Kiwi, banana <em>and</em> apple.</p>');
   *      // -> Element
   *      $('fruits').innerHTML;
   *      // -> '<p>Kiwi, banana <em>and</em> apple.</p>'
   *  
   *  ... with a `<script>` tag thrown in:
   *  
   *      $('fruits').update('<p>Kiwi, banana <em>and</em> apple.</p><script>alert("updated!")</script>');
   *      // -> Element (and prints "updated!" in an alert dialog).
   *      $('fruits').innerHTML;
   *      // -> '<p>Kiwi, banana <em>and</em> apple.</p>'
   *  
   *  Relying on the `toString()` method:
   *  
   *      $('fruits').update(123);
   *      // -> Element
   *      $('fruits').innerHTML;
   *      // -> '123'
   *  
   *  Finally, you can do some pretty funky stuff by defining your own
   *  `toString()` method on your custom objects:
   *  
   *      var Fruit = Class.create({
   *        initialize: function(fruit){
   *          this.fruit = fruit;
   *        },
   *        toString: function(){
   *          return 'I am a fruit and my name is "' + this.fruit + '".'; 
   *        }
   *      });
   *      var apple = new Fruit('apple');
   *      
   *      $('fruits').update(apple);
   *      $('fruits').innerHTML;
   *      // -> 'I am a fruit and my name is "apple".'
  **/
  update: (function(){

    // see: http://support.microsoft.com/kb/276228
    var SELECT_ELEMENT_INNERHTML_BUGGY = (function(){
      var el = document.createElement("select"),
          isBuggy = true;
      el.innerHTML = "<option value=\"test\">test</option>";
      if (el.options && el.options[0]) {
        isBuggy = el.options[0].nodeName.toUpperCase() !== "OPTION";
      }
      el = null;
      return isBuggy;
    })();

    // see: http://msdn.microsoft.com/en-us/library/ms533897(VS.85).aspx
    var TABLE_ELEMENT_INNERHTML_BUGGY = (function(){
      try {
        var el = document.createElement("table");
        if (el && el.tBodies) {
          el.innerHTML = "<tbody><tr><td>test</td></tr></tbody>";
          var isBuggy = typeof el.tBodies[0] == "undefined";
          el = null;
          return isBuggy;
        }
      } catch (e) {
        return true;
      }
    })();

    var SCRIPT_ELEMENT_REJECTS_TEXTNODE_APPENDING = (function () {
      var s = document.createElement("script"),
          isBuggy = false;
      try {
        s.appendChild(document.createTextNode(""));
        isBuggy = !s.firstChild ||
          s.firstChild && s.firstChild.nodeType !== 3;
      } catch (e) {
        isBuggy = true;
      }
      s = null;
      return isBuggy;
    })();

    function update(element, content) {
      element = $(element);
      var purgeElement = Element._purgeElement;
      
      // Purge the element's existing contents of all storage keys and
      // event listeners, since said content will be replaced no matter
      // what.
      var descendants = element.getElementsByTagName('*'),
       i = descendants.length;
      while (i--) purgeElement(descendants[i]);
      
      if (content && content.toElement)
        content = content.toElement();

      if (Object.isElement(content))
        return element.update().insert(content);

      content = Object.toHTML(content);

      var tagName = element.tagName.toUpperCase();

      if (tagName === 'SCRIPT' && SCRIPT_ELEMENT_REJECTS_TEXTNODE_APPENDING) {
        // scripts are not evaluated when updating SCRIPT element
        element.text = content;
        return element;
      }

      if (SELECT_ELEMENT_INNERHTML_BUGGY || TABLE_ELEMENT_INNERHTML_BUGGY) {
        if (tagName in Element._insertionTranslations.tags) {
          while (element.firstChild) {
            element.removeChild(element.firstChild);
          }
          Element._getContentFromAnonymousElement(tagName, content.stripScripts())
            .each(function(node) {
              element.appendChild(node)
            });
        }
        else {
          element.innerHTML = content.stripScripts();
        }
      }
      else {
        element.innerHTML = content.stripScripts();
      }

      content.evalScripts.bind(content).defer();
      return element;
    }

    return update;
  })(),

  /**
   *  Element.replace(@element[, newContent]) -> Element
   *
   *  Replaces `element` _itself_ with `newContent` and returns `element`.
   *
   *  Keep in mind that this method returns the element that has just been
   *  removed &mdash; not the element that took its place.
   *
   *  `newContent` can be either plain text, an HTML snippet or any JavaScript
   *  object which has a `toString()` method.
   *  
   *  If `newContent` contains any `<script>` tags, these will be evaluated
   *  after `element` has been replaced ([[Element.replace]] internally calls
   *  [[String#evalScripts]]).
   *  
   *  Note that if no argument is provided, [[Element.replace]] will simply
   *  clear `element` of its content. However, using [[Element.remove]] to do so
   *  is both faster and more standard compliant.
   *  
   *  ##### Examples
   *  
   *      language: html
   *      <div id="food">
   *        <div id="fruits">
   *          <p id="first">Kiwi, banana <em>and</em> apple.</p>
   *        </div>
   *      </div>
   *  
   *  Passing an HTML snippet:
   *  
   *      $('first').replace('<ul id="favorite"><li>kiwi</li><li>banana</li><li>apple</li></ul>');
   *      // -> Element (p#first)
   *      
   *      $('fruits').innerHTML;
   *      // -> '<ul id="favorite"><li>kiwi</li><li>banana</li><li>apple</li></ul>'
   *  
   *  Again, with a `<script>` tag thrown in:
   *  
   *      $('favorite').replace('<p id="still-first">Melon, oranges <em>and</em> grapes.</p><script>alert("removed!")</script>');
   *      // -> Element (ul#favorite) and prints "removed!" in an alert dialog.
   *      
   *      $('fruits').innerHTML;
   *      // -> '<p id="still-first">Melon, oranges <em>and</em> grapes.</p>'
   *  
   *  With plain text:
   *  
   *      $('still-first').replace('Melon, oranges and grapes.');
   *      // -> Element (p#still-first)
   *
   *      $('fruits').innerHTML;
   *      // -> 'Melon, oranges and grapes.'
   *  
   *  Finally, relying on the `toString()` method:
   *  
   *      $('fruits').replace(123);
   *      // -> Element
   *      
   *      $('food').innerHTML;
   *      // -> '123'
   *
   *  ##### Warning
   *
   *  Using [[Element.replace]] as an instance method (e.g.,
   *  `$('foo').replace('<p>Bar</p>')`) causes errors in Opera 9 when used on
   *  `input` elements. The `replace` property is reserved on `input` elements
   *  as part of [Web Forms 2](http://www.whatwg.org/specs/web-forms/current-work/).
   *  As a workaround, use the generic version instead
   *  (`Element.replace('foo', '<p>Bar</p>')`).
   *  
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
   *  - content (String | Element | Object): The content to insert.
   *
   *  Inserts content `above`, `below`, at the `top`, and/or at the `bottom` of
   *  the given element, depending on the option(s) given.
   *
   *  `insert` accepts content in any of these forms:
   *  - [[String]]: A string of HTML to be parsed and rendered
   *  - [[Element]]: An Element instance to insert
   *  - ...any object with a `toElement` method: The method is called and the resulting element used
   *  - ...any object with a `toHTML` method: The method is called and the resulting HTML string
   *    is parsed and rendered
   *
   *  The `content` argument can be the content to insert, in which case the
   *  implied insertion point is `bottom`, or an object that specifies one or
   *  more insertion points (e.g., `{ bottom: "foo", top: "bar" }`).
   *
   *  Accepted insertion points are:
   *  - `before` (as `element`'s previous sibling)
   *  - `after` (as `element's` next sibling)
   *  - `top` (as `element`'s first child)
   *  - `bottom` (as `element`'s last child)
   *
   *  Note that if the inserted HTML contains any `<script>` tag, these will be
   *  automatically evaluated after the insertion (`insert` internally calls
   *  [[String.evalScripts]] when inserting HTML).
   *
   *  <h5>Examples</h5>
   *
   *  Insert the given HTML at the bottom of the element (using the default):
   *
   *      $('myelement').insert("<p>HTML to append</p>");
   *
   *      $('myelement').insert({
   *        top: new Element('img', {src: 'logo.png'})
   *      });
   *
   *  Put `hr`s `before` and `after` the element:
   *
   *      $('myelement').insert({
   *        before: "<hr>",
   *        after: "<hr>"
   *      });
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
   *  - wrapper (Element | String): An element to wrap `element` inside, or
   *    else a string representing the tag name of an element to be created.
   *  - attributes (Object): A set of attributes to apply to the wrapper
   *    element. Refer to the [[Element]] constructor for usage.
   *
   *  Wraps an element inside another, then returns the wrapper.
   *  
   *  If the given element exists on the page, [[Element.wrap]] will wrap it in
   *  place — its position will remain the same.
   *  
   *  The `wrapper` argument can be _either_ an existing [[Element]] _or_ a
   *  string representing the tag name of an element to be created. The optional
   *  `attributes` argument can contain a list of attribute/value pairs that
   *  will be set on the wrapper using [[Element.writeAttribute]].
   *  
   *  ##### Examples
   *  
   *  Original HTML:
   *  
   *      language: html
   *      <table id="data">
   *        <tr>
   *          <th>Foo</th>
   *          <th>Bar</th>
   *        </tr>
   *        <tr>
   *          <td>1</td>
   *          <td>2</td>
   *        </tr>
   *      </table>
   *  
   *  JavaScript:
   *  
   *      // approach 1:
   *      var div = new Element('div', { 'class': 'table-wrapper' });
   *      $('data').wrap(div);
   *      
   *      // approach 2:
   *      $('data').wrap('div', { 'class': 'table-wrapper' });
   *      
   *      // Both examples are equivalent &mdash; they return the DIV.
   *  
   *  Resulting HTML:
   *  
   *      language: html
   *      <div class="table-wrapper">
   *        <table id="data">
   *          <tr>
   *            <th>Foo</th>
   *            <th>Bar</th>
   *          </tr>
   *          <tr>
   *            <td>1</td>
   *            <td>2</td>
   *          </tr>
   *        </table>
   *      </div> 
   *  
   *  ##### Warning
   *
   *  Using [[Element.wrap]] as an instance method (e.g., `$('foo').wrap('p')`)
   *  causes errors in Internet Explorer when used on `textarea` elements. The
   *  `wrap` property is reserved on `textarea`'s as a proprietary extension to
   *  HTML. As a workaround, use the generic version instead
   *  (`Element.wrap('foo', 'p')`).
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
   *
   *  For more information on `inspect` methods, see [[Object.inspect]].
   *  
   *      language: html
   *      <ul>
   *        <li id="golden-delicious">Golden Delicious</li>
   *        <li id="mutsu" class="yummy apple">Mutsu</li>
   *        <li id="mcintosh" class="yummy">McIntosh</li>
   *        <li></li>
   *      </ul>
   *
   *  And the associated JavaScript:
   *
   *      $('golden-delicious').inspect();
   *      // -> '<li id="golden-delicious">'
   *      
   *      $('mutsu').inspect();
   *      // -> '<li id="mutsu" class="yummy apple">'
   *      
   *      $('mutsu').next().inspect();
   *      // -> '<li>'
  **/
  inspect: function(element) {
    element = $(element);
    var result = '<' + element.tagName.toLowerCase();
    $H({'id': 'id', 'className': 'class'}).each(function(pair) {
      var property = pair.first(), 
          attribute = pair.last(),
          value = (element[property] || '').toString();
      if (value) result += ' ' + attribute + '=' + value.inspect(true);
    });
    return result + '>';
  },

  /**
   *  Element.recursivelyCollect(@element, property) -> [Element...]
   *
   *  Recursively collects elements whose relationship to `element` is
   *  specified by `property`. `property` has to be a _property_ (a method
   *  won't do!) of `element` that points to a single DOM node (e.g.,
   *  `nextSibling` or `parentNode`).
   *
   *  ##### More information
   *
   *  This method is used internally by [[Element.ancestors]],
   *  [[Element.descendants]], [[Element.nextSiblings]],
   *  [[Element.previousSiblings]] and [[Element.siblings]] which offer really
   *  convenient way to grab elements, so directly accessing
   *  [[Element.recursivelyCollect]] should seldom be needed. However, if you
   *  are after something out of the ordinary, it is the way to go.
   *  
   *  Note that all of Prototype's DOM traversal methods ignore text nodes and
   *  return element nodes only.
   *  
   *  ##### Examples
   *  
   *      language: html
   *      <ul id="fruits">
   *        <li id="apples">
   *          <ul id="list-of-apples">
   *            <li id="golden-delicious"><p>Golden Delicious</p></li>
   *            <li id="mutsu">Mutsu</li>
   *            <li id="mcintosh">McIntosh</li>
   *            <li id="ida-red">Ida Red</li>
   *          </ul>
   *        </li>
   *      </ul>
   *
   *  And the associated JavaScript:
   *
   *      $('fruits').recursivelyCollect('firstChild');
   *      // -> [li#apples, ul#list-of-apples, li#golden-delicious, p]
  **/
  recursivelyCollect: function(element, property, maximumLength) {
    element = $(element);
    maximumLength = maximumLength || -1;
    var elements = [];
    
    while (element = element[property]) {
      if (element.nodeType == 1)
        elements.push(Element.extend(element));
      if (elements.length == maximumLength) 
        break;
    }
    
    return elements;
  },

  /**
   *  Element.ancestors(@element) -> [Element...]
   *
   *  Collects all of `element`'s ancestor elements and returns them as an
   *  array of extended elements.
   *
   *  The returned array's first element is `element`'s direct ancestor (its
   *  `parentNode`), the second one is its grandparent, and so on until the
   *  `<html>` element is reached. `<html>` will always be the last member of
   *  the array. Calling `ancestors` on the `<html>` element will return an
   *  empty array.
   *
   *  ##### Example
   *
   *  Assuming:
   *
   *      language: html
   *      <html>
   *      [...]
   *        <body>
   *          <div id="father">
   *            <div id="kid">
   *            </div>
   *          </div>
   *        </body>
   *      </html>
   *
   *  Then:
   *
   *      $('kid').ancestors();
   *      // -> [div#father, body, html]
  **/
  ancestors: function(element) {
    return Element.recursivelyCollect(element, 'parentNode');
  },

  /**
   *  Element.descendants(@element) -> [Element...]
   *
   *  Collects all of the element's descendants (its children, their children,
   *  etc.) and returns them as an array of extended elements. As with all of
   *  Prototype's DOM traversal methods, only [[Element]]s are returned, other
   *  nodes (text nodes, etc.) are skipped.
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
   *  any node, including text nodes and comment nodes.
   *
   *  ##### Examples
   *  
   *      language: html
   *      <div id="australopithecus">
   *        <div id="homo-erectus"><!-- Latin is super -->
   *          <div id="homo-neanderthalensis"></div>
   *          <div id="homo-sapiens"></div>
   *        </div>
   *      </div>
   *
   *  Then:
   *
   *      $('australopithecus').firstDescendant();
   *      // -> div#homo-herectus
   *      
   *      // the DOM property returns any first node
   *      $('homo-herectus').firstChild;
   *      // -> comment node "Latin is super"
   *      
   *      // this is what we want!
   *      $('homo-herectus').firstDescendant();
   *      // -> div#homo-neanderthalensis
  **/
  firstDescendant: function(element) {
    element = $(element).firstChild;
    while (element && element.nodeType != 1) element = element.nextSibling;
    return $(element);
  },

  /** deprecated, alias of: Element.childElements
   *  Element.immediateDescendants(@element) -> [Element...]
   *
   *  **This method is deprecated, please see [[Element.childElements]]**.
  **/
  immediateDescendants: function(element) {
    var results = [], child = $(element).firstChild;
    while (child) {
      if (child.nodeType === 1) {
        results.push(Element.extend(child));
      }
      child = child.nextSibling;
    }
    return results;
  },

  /**
   *  Element.previousSiblings(@element) -> [Element...]
   *
   *  Collects all of `element`'s previous siblings and returns them as an
   *  [[Array]] of elements.
   *  
   *  Two elements are siblings if they have the same parent. So for example,
   *  the `<head>` and `<body>` elements are siblings (their parent is the
   *  `<html>` element). Previous-siblings are simply the ones which precede
   *  `element` in the document.
   *  
   *  The returned [[Array]] reflects the siblings _inversed_ order in the
   *  document (e.g. an index of 0 refers to the lowest sibling i.e., the one
   *  closest to `element`).
   *  
   *  Note that all of Prototype's DOM traversal methods ignore text nodes and
   *  return element nodes only.
   *  
   *  ##### Examples
   *  
   *      language: html
   *      <ul>
   *        <li id="golden-delicious">Golden Delicious</li>
   *        <li id="mutsu">Mutsu</li>
   *        <li id="mcintosh">McIntosh</li>
   *        <li id="ida-red">Ida Red</li>
   *      </ul>
   *
   *  Then:
   *
   *      $('mcintosh').previousSiblings();
   *      // -> [li#mutsu, li#golden-delicious]
   *      
   *      $('golden-delicious').previousSiblings();
   *      // -> []
  **/
  previousSiblings: function(element, maximumLength) {
    return Element.recursivelyCollect(element, 'previousSibling');
  },

  /**
   *  Element.nextSiblings(@element) -> [Element...]
   *
   *  Collects all of `element`'s next siblings and returns them as an [[Array]]
   *  of elements.
   *  
   *  Two elements are siblings if they have the same parent. So for example,
   *  the `head` and `body` elements are siblings (their parent is the `html`
   *  element). Next-siblings are simply the ones which follow `element` in the
   *  document.
   *  
   *  The returned [[Array]] reflects the siblings order in the document
   *  (e.g. an index of 0 refers to the sibling right below `element`).
   *  
   *  Note that all of Prototype's DOM traversal methods ignore text nodes and
   *  return element nodes only.
   *  
   *  ##### Examples
   *  
   *      language: html
   *      <ul>
   *        <li id="golden-delicious">Golden Delicious</li>
   *        <li id="mutsu">Mutsu</li>
   *        <li id="mcintosh">McIntosh</li>
   *        <li id="ida-red">Ida Red</li>
   *      </ul>
   *
   *  Then:
   *
   *      $('mutsu').nextSiblings();
   *      // -> [li#mcintosh, li#ida-red]
   *      
   *      $('ida-red').nextSiblings();
   *      // -> []
  **/
  nextSiblings: function(element) {
    return Element.recursivelyCollect(element, 'nextSibling');
  },

  /**
   *  Element.siblings(@element) -> [Element...]
   *  Collects all of element's siblings and returns them as an [[Array]] of
   *  elements.
   *
   *  Two elements are siblings if they have the same parent. So for example,
   *  the `head` and `body` elements are siblings (their parent is the `html`
   *  element).
   *  
   *  The returned [[Array]] reflects the siblings' order in the document (e.g.
   *  an index of 0 refers to `element`'s topmost sibling).
   *  
   *  Note that all of Prototype's DOM traversal methods ignore text nodes and
   *  return element nodes only.
   *  
   *  ##### Examples
   *  
   *      language: html
   *      <ul>
   *        <li id="golden-delicious">Golden Delicious</li>
   *        <li id="mutsu">Mutsu</li>
   *        <li id="mcintosh">McIntosh</li>
   *        <li id="ida-red">Ida Red</li>
   *      </ul>
   *
   *  Then:
   *
   *      $('mutsu').siblings();
   *      // -> [li#golden-delicious, li#mcintosh, li#ida-red]
  **/
  siblings: function(element) {
    element = $(element);
    return Element.previousSiblings(element).reverse()
      .concat(Element.nextSiblings(element));
  },

  /**
   *  Element.match(@element, selector) -> boolean
   *  - selector (String): A CSS selector.
   *
   *  Checks if `element` matches the given CSS selector.
   *
   *  ##### Examples
   *  
   *      language: html
   *      <ul id="fruits">
   *        <li id="apples">
   *          <ul>
   *            <li id="golden-delicious">Golden Delicious</li>
   *            <li id="mutsu" class="yummy">Mutsu</li>
   *            <li id="mcintosh" class="yummy">McIntosh</li>
   *            <li id="ida-red">Ida Red</li>
   *          </ul>
   *        </li>
   *      </ul>
   *
   *  Then:
   *
   *      $('fruits').match('ul');
   *      // -> true
   *      
   *      $('mcintosh').match('li#mcintosh.yummy');
   *      // -> true
   *      
   *      $('fruits').match('p');
   *      // -> false
  **/
  match: function(element, selector) {
    element = $(element);
    if (Object.isString(selector))
      return Prototype.Selector.match(element, selector);
    return selector.match(element);
  },

  /**
   *  Element.up(@element[, expression[, index = 0]]) -> Element
   *  Element.up(@element[, index = 0]) -> Element
   *  - expression (String): A CSS selector.
   *
   *  Returns `element`'s first ancestor (or the Nth ancestor, if `index`
   *  is specified) that matches `expression`. If no `expression` is
   *  provided, all ancestors are considered. If no ancestor matches these
   *  criteria, `undefined` is returned.
   *
   *  ##### More information
   *
   *  The [[Element.up]] method is part of Prototype's ultimate DOM traversal
   *  toolkit (check out [[Element.down]], [[Element.next]] and
   *  [[Element.previous]] for some more Prototypish niceness). It allows 
   *  precise index-based and/or CSS rule-based selection of any of `element`'s
   *  **ancestors**.
   *  
   *  As it totally ignores text nodes (it only returns elements), you don't
   *  have to worry about whitespace nodes.
   *  
   *  And as an added bonus, all elements returned are already extended
   *  (see [[Element.extended]]) allowing chaining:
   *  
   *      $(element).up(1).next('li', 2).hide();
   *  
   *  Walking the DOM has never been that easy!
   *  
   *  ##### Arguments
   *  
   *  If no arguments are passed, `element`'s first ancestor is returned (this
   *  is similar to calling `parentNode` except [[Element.up]] returns an already
   *  extended element.
   *  
   *  If `index` is defined, `element`'s corresponding ancestor is returned.
   *  (This is equivalent to selecting an element from the array of elements
   *  returned by the method [[Element.ancestors]]). Note that the first element
   *  has an index of 0.
   *  
   *  If `expression` is defined, [[Element.up]] will return the first ancestor
   *  that matches it.
   *  
   *  If both `expression` and `index` are defined, [[Element.up]] will collect
   *  all the ancestors matching the given CSS expression and will return the
   *  one at the specified index.
   *  
   *  **In all of the above cases, if no descendant is found,** `undefined`
   *  **will be returned.**
   *  
   *  ### Examples
   *  
   *      language: html
   *      <html>
   *        [...]
   *        <body>
   *          <ul id="fruits">
   *            <li id="apples" class="keeps-the-doctor-away">
   *              <ul>
   *                <li id="golden-delicious">Golden Delicious</li>
   *                <li id="mutsu" class="yummy">Mutsu</li>
   *                <li id="mcintosh" class="yummy">McIntosh</li>
   *                <li id="ida-red">Ida Red</li>
   *              </ul>
   *            </li>
   *          </ul>
   *        </body>
   *      </html>
   *
   *  Get the first ancestor of "#fruites":
   *
   *      $('fruits').up();
   *      // or:
   *      $('fruits').up(0);
   *      // -> body
   *
   *  Get the third ancestor of "#mutsu":
   *      
   *      $('mutsu').up(2);
   *      // -> ul#fruits
   *
   *  Get the first ancestor of "#mutsu" with the node name "li":
   *      
   *      $('mutsu').up('li');
   *      // -> li#apples
   *
   *  Get the first ancestor of "#mutsu" with the class name
   *  "keeps-the-doctor-away":
   *
   *      $('mutsu').up('.keeps-the-doctor-away');
   *      // -> li#apples
   *
   *  Get the second ancestor of "#mutsu" with the node name "ul":
   *      
   *      $('mutsu').up('ul', 1);
   *      // -> ul#fruits
   *
   *  Try to get the first ancestor of "#mutsu" with the node name "div":
   *      
   *      $('mutsu').up('div');
   *      // -> undefined
  **/
  up: function(element, expression, index) {
    element = $(element);
    if (arguments.length == 1) return $(element.parentNode);
    var ancestors = Element.ancestors(element);
    return Object.isNumber(expression) ? ancestors[expression] :
      Prototype.Selector.find(ancestors, expression, index);
  },

  /**
   *  Element.down(@element[, expression[, index = 0]]) -> Element
   *  Element.down(@element[, index = 0]) -> Element
   *  - expression (String): A CSS selector.
   *
   *  Returns `element`'s first descendant (or the Nth descendant, if `index`
   *  is specified) that matches `expression`. If no `expression` is
   *  provided, all descendants are considered. If no descendant matches these
   *  criteria, `undefined` is returned.
   *
   *  ##### More information
   *
   *  The [[Element.down]] method is part of Prototype's ultimate DOM traversal
   *  toolkit (check out [[Element.up]], [[Element.next]] and
   *  [[Element.previous]] for some more Prototypish niceness). It allows
   *  precise index-based and/or CSS rule-based selection of any of the 
   *  element's **descendants**.
   *  
   *  As it totally ignores text nodes (it only returns elements), you don't
   *  have to worry about whitespace nodes.
   *  
   *  And as an added bonus, all elements returned are already extended
   *  (see [[Element.extend]]) allowing chaining:
   *  
   *      $(element).down(1).next('li', 2).hide();
   *  
   *  Walking the DOM has never been that easy!
   *  
   *  ##### Arguments
   *  
   *  If no arguments are passed, `element`'s first descendant is returned (this
   *  is similar to calling `firstChild` except [[Element.down]] returns an
   *  extended element.
   *  
   *  If `index` is defined, `element`'s corresponding descendant is returned.
   *  (This is equivalent to selecting an element from the array of elements
   *  returned by the method [[Element.descendants]].) Note that the first
   *  element has an index of 0.
   *  
   *  If `expression` is defined, [[Element.down]] will return the first
   *  descendant that matches it. This is a great way to grab the first item in
   *  a list for example (just pass in 'li' as the method's first argument).
   *  
   *  If both `expression` and `index` are defined, [[Element.down]] will collect
   *  all the descendants matching the given CSS expression and will return the
   *  one at the specified index.
   *  
   *  **In all of the above cases, if no descendant is found,** `undefined`
   *  **will be returned.**
   *  
   *  ##### Examples
   *  
   *      language: html
   *      <ul id="fruits">
   *        <li id="apples">
   *          <ul>
   *            <li id="golden-delicious">Golden Delicious</li>
   *            <li id="mutsu" class="yummy">Mutsu</li>
   *            <li id="mcintosh" class="yummy">McIntosh</li>
   *            <li id="ida-red">Ida Red</li>
   *          </ul>
   *        </li>
   *      </ul>
   *      
   *  Get the first descendant of "#fruites":
   *
   *      $('fruits').down();
   *      // or:
   *      $('fruits').down(0);
   *      // -> li#apples
   *
   *  Get the third descendant of "#fruits":
   *      
   *      $('fruits').down(3);
   *      // -> li#golden-delicious
   *      
   *  Get the first descendant of "#apples" with the node name "li":
   *
   *      $('apples').down('li');
   *      // -> li#golden-delicious
   *
   *  Get the first descendant of "#apples" with the node name "li" and the
   *  class name "yummy":
   *
   *      $('apples').down('li.yummy');
   *      // -> li#mutsu
   *
   *  Get the second descendant of "#fruits" with the class name "yummy":
   *
   *      $('fruits').down('.yummy', 1);
   *      // -> li#mcintosh
   *
   *  Try to get the ninety-ninth descendant of "#fruits":
   *
   *      $('fruits').down(99);
   *      // -> undefined
  **/
  down: function(element, expression, index) {
    element = $(element);
    if (arguments.length == 1) return Element.firstDescendant(element);
    return Object.isNumber(expression) ? Element.descendants(element)[expression] :
      Element.select(element, expression)[index || 0];
  },

  /**
   *  Element.previous(@element[, expression[, index = 0]]) -> Element
   *  Element.previous(@element[, index = 0]) -> Element
   *  - expression (String): A CSS selector.
   *
   *  Returns `element`'s first previous sibling (or the Nth, if `index`
   *  is specified) that matches `expression`. If no `expression` is
   *  provided, all previous siblings are considered. If none matches these
   *  criteria, `undefined` is returned.
   *
   *  ##### More information
   *
   *  The [[Element.previous]] method is part of Prototype's ultimate DOM
   *  traversal toolkit (check out [[Element.up]], [[Element.down]] and
   *  [[Element.next]] for some more Prototypish niceness). It allows precise
   *  index-based and/or CSS expression-based selection of any of `element`'s
   *  **previous siblings**. (Note that two elements are considered siblings if
   *  they have the same parent, so for example, the `head` and `body` elements
   *  are siblings&#8212;their parent is the `html` element.)
   *  
   *  As it totally ignores text nodes (it only returns elements), you don't
   *  have to worry about whitespace nodes.
   *  
   *  And as an added bonus, all elements returned are already extended (see 
   *  [[Element.extend]]) allowing chaining:
   *  
   *      $(element).down('p').previous('ul', 2).hide();
   *  
   *  Walking the DOM has never been that easy!
   *  
   *  ##### Arguments
   *  
   *  If no arguments are passed, `element`'s previous sibling is returned
   *  (this is similar as calling `previousSibling` except [[Element.previous]]
   *  returns an already extended element).
   *  
   *  If `index` is defined, `element`'s corresponding previous sibling is
   *  returned. (This is equivalent to selecting an element from the array of
   *  elements returned by the method [[Element.previousSiblings]]). Note that
   *  the sibling _right above_ `element` has an index of 0.
   *  
   *  If `expression` is defined, [[Element.previous]] will return the `element`
   *  first previous sibling that matches it.
   *  
   *  If both `expression` and `index` are defined, [[Element.previous]] will
   *  collect all of `element`'s previous siblings matching the given CSS
   *  expression and will return the one at the specified index.
   *  
   *  **In all of the above cases, if no previous sibling is found,**
   *  `undefined` **will be returned.**
   *  
   *  ##### Examples
   *  
   *      language: html
   *      <ul id="fruits">
   *        <li id="apples">
   *          <h3>Apples</h3>
   *          <ul id="list-of-apples">
   *            <li id="golden-delicious" class="yummy">Golden Delicious</li>
   *            <li id="mutsu" class="yummy">Mutsu</li>
   *            <li id="mcintosh">McIntosh</li>
   *            <li id="ida-red">Ida Red</li>
   *          </ul>
   *          <p id="saying">An apple a day keeps the doctor away.</p>  
   *        </li>
   *      </ul>
   *  
   *  Get the first previous sibling of "#saying":
   *  
   *      $('saying').previous();
   *      // or:
   *      $('saying').previous(0);
   *      // -> ul#list-of-apples
   *
   *  Get the second previous sibling of "#saying":
   *
   *      $('saying').previous(1);
   *      // -> h3
   *
   *  Get the first previous sibling of "#saying" with node name "h3":
   *
   *      $('saying').previous('h3');
   *      // -> h3
   *
   *  Get the first previous sibling of "#ida-red" with class name "yummy":
   *
   *      $('ida-red').previous('.yummy');
   *      // -> li#mutsu
   *
   *  Get the second previous sibling of "#ida-red" with class name "yummy":
   *
   *      $('ida-red').previous('.yummy', 1);
   *      // -> li#golden-delicious
   *
   *  Try to get the sixth previous sibling of "#ida-red":
   *      
   *      $('ida-red').previous(5);
   *      // -> undefined
  **/
  previous: function(element, expression, index) {
    element = $(element);
    if (Object.isNumber(expression)) index = expression, expression = false;
    if (!Object.isNumber(index)) index = 0;
    
    if (expression) {
      return Prototype.Selector.find(element.previousSiblings(), expression, index);
    } else {
      return element.recursivelyCollect("previousSibling", index + 1)[index];
    }
  },

  /**
   *  Element.next(@element[, expression[, index = 0]]) -> Element
   *  Element.next(@element[, index = 0]) -> Element
   *  - expression (String): A CSS selector.
   *
   *  Returns `element`'s first following sibling (or the Nth, if `index`
   *  is specified) that matches `expression`. If no `expression` is
   *  provided, all following siblings are considered. If none matches these
   *  criteria, `undefined` is returned.
   *
   *  ##### More information
   *
   *  The [[Element.next]] method is part of Prototype's ultimate DOM traversal
   *  toolkit (check out [[Element.up]], [[Element.down]] and
   *  [[Element.previous]] for some more Prototypish niceness). It allows
   *  precise index-based and/or CSS expression-based selection of any of
   *  `element`'s **following siblings**. (Note that two elements are considered
   *  siblings if they have the same parent, so for example, the `head` and
   *  `body` elements are siblings&#8212;their parent is the `html` element.)
   *  
   *  As it totally ignores text nodes (it only returns elements), you don't
   *  have to worry about whitespace nodes.
   *  
   *  And as an added bonus, all elements returned are already extended (see 
   *  [[Element.extend]]) allowing chaining:
   *  
   *      $(element).down(1).next('li', 2).hide();
   *  
   *  Walking the DOM has never been that easy!
   *  
   *  ##### Arguments
   *  
   *  If no arguments are passed, `element`'s following sibling is returned
   *  (this is similar as calling `nextSibling` except [[Element.next]] returns an
   *  already extended element).
   *  
   *  If `index` is defined, `element`'s corresponding following sibling is
   *  returned. (This is equivalent to selecting an element from the array of
   *  elements returned by the method [[Element.nextSiblings]]). Note that the
   *  sibling _right below_ `element` has an index of 0.
   *  
   *  If `expression` is defined, [[Element.next]] will return the `element` first
   *  following sibling that matches it.
   *  
   *  If both `expression` and `index` are defined, [[Element.next]] will collect
   *  all of `element`'s following siblings matching the given CSS expression
   *  and will return the one at the specified index.
   *  
   *  **In all of the above cases, if no following sibling is found,**
   *  `undefined` **will be returned.**
   *  
   *  ##### Examples
   *  
   *      language: html
   *      <ul id="fruits">
   *        <li id="apples">
   *          <h3 id="title">Apples</h3>
   *          <ul id="list-of-apples">
   *            <li id="golden-delicious">Golden Delicious</li>
   *            <li id="mutsu">Mutsu</li>
   *            <li id="mcintosh" class="yummy">McIntosh</li>
   *            <li id="ida-red" class="yummy">Ida Red</li>
   *          </ul>
   *          <p id="saying">An apple a day keeps the doctor away.</p>  
   *        </li>
   *      </ul>
   *
   *  Get the first sibling after "#title":
   *  
   *      $('title').next();
   *      // or:
   *      $('title').next(0);
   *      // -> ul#list-of-apples
   *
   *  Get the second sibling after "#title":
   *
   *      $('title').next(1);
   *      // -> p#saying
   *
   *  Get the first sibling after "#title" with node name "p":
   *
   *      $('title').next('p');
   *      // -> p#sayings
   *
   *  Get the first sibling after "#golden-delicious" with class name "yummy":
   *      
   *      $('golden-delicious').next('.yummy');
   *      // -> li#mcintosh
   *
   *  Get the second sibling after "#golden-delicious" with class name "yummy":
   *
   *      $('golden-delicious').next('.yummy', 1);
   *      // -> li#ida-red
   *
   *  Try to get the first sibling after "#ida-red":
   *
   *      $('ida-red').next();
   *      // -> undefined   
  **/
  next: function(element, expression, index) {
    element = $(element);
    if (Object.isNumber(expression)) index = expression, expression = false;
    if (!Object.isNumber(index)) index = 0;
    
    if (expression) {
      return Prototype.Selector.find(element.nextSiblings(), expression, index);
    } else {
      var maximumLength = Object.isNumber(index) ? index + 1 : 1;
      return element.recursivelyCollect("nextSibling", index + 1)[index];
    }
  },


  /**
   *  Element.select(@element, expression...) -> [Element...]
   *  - expression (String): A CSS selector.
   *
   *  Takes an arbitrary number of CSS selectors and returns an array of
   *  descendants of `element` that match any of them.
   *
   *  This method is very similar to [[$$]] but can be used within the context 
   *  of one element, rather than the whole document. The supported CSS syntax 
   *  is identical, so please refer to the [[$$]] docs for details.
   *  
   *  ##### Examples
   *  
   *      language: html
   *      <ul id="fruits">
   *        <li id="apples">
   *          <h3 title="yummy!">Apples</h3>
   *          <ul id="list-of-apples">
   *            <li id="golden-delicious" title="yummy!" >Golden Delicious</li>
   *            <li id="mutsu" title="yummy!">Mutsu</li>
   *            <li id="mcintosh">McIntosh</li>
   *            <li id="ida-red">Ida Red</li>
   *          </ul>
   *          <p id="saying">An apple a day keeps the doctor away.</p>  
   *        </li>
   *      </ul>
   *
   *  Then:
   *
   *      $('apples').select('[title="yummy!"]');
   *      // -> [h3, li#golden-delicious, li#mutsu]
   *      
   *      $('apples').select( 'p#saying', 'li[title="yummy!"]');
   *      // -> [li#golden-delicious, li#mutsu,  p#saying]
   *      
   *      $('apples').select('[title="disgusting!"]');
   *      // -> []
   *  
   *  ##### Tip
   *
   *  [[Element.select]] can be used as a pleasant alternative to the native
   *  method `getElementsByTagName`:
   *  
   *      var nodes  = $A(someUL.getElementsByTagName('li')).map(Element.extend);
   *      var nodes2 = someUL.select('li');
   *  
   *  In the first example, you must explicitly convert the result set to an
   *  [[Array]] (so that Prototype's [[Enumerable]] methods can be used) and
   *  must manually call [[Element.extend]] on each node (so that custom 
   *  instance methods can be used on the nodes). [[Element.select]] takes care 
   *  of both concerns on its own.
   *  
   *  If you're using 1.6 or above (and the performance optimizations therein), 
   *  the speed difference between these two examples is negligible.
  **/
  select: function(element) {
    element = $(element);
    var expressions = Array.prototype.slice.call(arguments, 1).join(', ');
    return Prototype.Selector.select(expressions, element);
  },

  /**
   *  Element.adjacent(@element, selector...) -> [Element...]
   *  - selector (String): A CSS selector.
   *
   *  Finds all siblings of the current element that match the given
   *  selector(s). If you provide multiple selectors, siblings matching *any*
   *  of the selectors are included. If a sibling matches multiple selectors,
   *  it is only included once. The order of the returned array is not defined.
   *
   *  ##### Example
   *
   *  Assuming this list:
   *
   *      language: html
   *      <ul id="cities">
   *        <li class="us" id="nyc">New York</li>
   *        <li class="uk" id="lon">London</li>
   *        <li class="us" id="chi">Chicago</li>
   *        <li class="jp" id="tok">Tokyo</li>
   *        <li class="us" id="la">Los Angeles</li>
   *        <li class="us" id="aus">Austin</li>
   *      </ul>
   *
   *  Then:
   *
   *      $('nyc').adjacent('li.us');
   *      // -> [li#chi, li#la, li#aus]
   *      $('nyc').adjacent('li.uk', 'li.jp');
   *      // -> [li#lon, li#tok]
  **/
  adjacent: function(element) {
    element = $(element);
    var expressions = Array.prototype.slice.call(arguments, 1).join(', ');
    return Prototype.Selector.select(expressions, element.parentNode).without(element);
  },

  /**
   *  Element.identify(@element) -> String
   *
   *  Returns `element`'s ID. If `element` does not have an ID, one is
   *  generated, assigned to `element`, and returned.
   *  
   *  ##### Examples
   *  
   *  Original HTML:
   *  
   *        <ul>
   *          <li id="apple">apple</li>
   *          <li>orange</li>
   *        </ul>
   *  
   *  JavaScript:
   *  
   *        $('apple').identify();
   *        // -> 'apple'
   *      
   *        $('apple').next().identify();
   *        // -> 'anonymous_element_1'
   *  
   *  Resulting HTML:
   *  
   *        <ul>
   *          <li id="apple">apple</li>
   *          <li id="anonymous_element_1">orange</li>
   *        </ul>
  **/
  identify: function(element) {
    element = $(element);
    var id = Element.readAttribute(element, 'id');
    if (id) return id;
    do { id = 'anonymous_element_' + Element.idCounter++ } while ($(id));
    Element.writeAttribute(element, 'id', id);
    return id;
  },

  /**
   *  Element.readAttribute(@element, attributeName) -> String | null
   *
   *  Returns the value of `element`'s `attribute` or `null` if `attribute` has
   *  not been specified.
   *  
   *  This method serves two purposes. First it acts as a simple wrapper around
   *  `getAttribute` which isn't a "real" function in Safari and Internet
   *  Explorer (it doesn't have `.apply` or `.call` for instance). Secondly, it
   *  cleans up the horrible mess Internet Explorer makes when handling
   *  attributes.
   *  
   *  ##### Examples
   *  
   *      language: html
   *      <a id="tag" href="/tags/prototype" rel="tag" title="view related bookmarks." my_widget="some info.">Prototype</a>
   *
   *  Then:
   *
   *      $('tag').readAttribute('href');
   *      // -> '/tags/prototype'
   *      
   *      $('tag').readAttribute('title');
   *      // -> 'view related bookmarks.'
   *      
   *      $('tag').readAttribute('my_widget');
   *      // -> 'some info.'
  **/
  readAttribute: function(element, name) {
    element = $(element);
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
  },

  /**
   *  Element.writeAttribute(@element, attribute[, value = true]) -> Element
   *  Element.writeAttribute(@element, attributes) -> Element
   *
   *  Adds, specifies or removes attributes passed as either a hash or a
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
   *  
   *  This method returns correct values on elements whose display is set to
   *  `none` either in an inline style rule or in an CSS stylesheet.
   *  
   *  For performance reasons, if you need to query both width _and_ height of
   *  `element`, you should consider using [[Element.getDimensions]] instead.
   *  
   *  Note that the value returned is a _number only_ although it is
   *  _expressed in pixels_.
   *  
   *  ##### Examples
   *  
   *      language: html
   *      <div id="rectangle" style="font-size: 10px; width: 20em; height: 10em"></div>
   *
   *  Then:
   *
   *      $('rectangle').getHeight();
   *      // -> 100
  **/
  getHeight: function(element) {
    return Element.getDimensions(element).height;
  },

  /**
   *  Element.getWidth(@element) -> Number
   *
   *  Returns the width of `element`.
   *  
   *  This method returns correct values on elements whose display is set to
   *  `none` either in an inline style rule or in an CSS stylesheet.
   *  
   *  For performance reasons, if you need to query both width _and_ height of
   *  `element`, you should consider using [[Element.getDimensions]] instead.
   *  
   *  Note that the value returned is a _number only_ although it is
   *  _expressed in pixels_.
   *  
   *  ##### Examples
   *  
   *      language: html
   *      <div id="rectangle" style="font-size: 10px; width: 20em; height: 10em"></div>
   *
   *  Then:
   *
   *      $('rectangle').getWidth();
   *      // -> 200
  **/
  getWidth: function(element) {
    return Element.getDimensions(element).width;
  },

  /** deprecated
   *  Element.classNames(@element) -> [String...]
   *
   *  Returns a new instance of [[Element.ClassNames]], an [[Enumerable]]
   *  object used to read and write CSS class names of `element`.
   *
   *  **Deprecated**, please see [[Element.addClassName]],
   *  [[Element.removeClassName]], and [[Element.hasClassName]]. If you want
   *  an array of classnames, you can use `$w(element.className)`.
  **/
  classNames: function(element) {
    return new Element.ClassNames(element);
  },

  /**
   *  Element.hasClassName(@element, className) -> Boolean
   *
   *  Checks for the presence of CSS class `className` on `element`.
   *
   *  ##### Examples
   *  
   *      language: html
   *      <div id="mutsu" class="apple fruit food"></div>
   *
   *  Then:
   *
   *      $('mutsu').hasClassName('fruit');
   *      // -> true
   *      
   *      $('mutsu').hasClassName('vegetable');
   *      // -> false
  **/
  hasClassName: function(element, className) {
    if (!(element = $(element))) return;
    var elementClassName = element.className;
    return (elementClassName.length > 0 && (elementClassName == className ||
      new RegExp("(^|\\s)" + className + "(\\s|$)").test(elementClassName)));
  },

  /**
   *  Element.addClassName(@element, className) -> Element
   *  - className (String): The class name to add.
   *
   *  Adds the given CSS class to `element`.
   *
   *  ##### Example
   *
   *  Assuming this HTML:
   *
   *      language: html
   *      <div id="mutsu" class="apple fruit"></div>
   *
   *  Then:
   *
   *      $('mutsu').className;
   *      // -> 'apple fruit'
   *      $('mutsu').addClassName('food');
   *      $('mutsu').className;
   *      // -> 'apple fruit food'
  **/
  addClassName: function(element, className) {
    if (!(element = $(element))) return;
    if (!Element.hasClassName(element, className))
      element.className += (element.className ? ' ' : '') + className;
    return element;
  },

  /**
   *  Element.removeClassName(@element, className) -> Element
   *
   *  Removes CSS class `className` from `element`.
   *
   *  ##### Examples
   *
   *  Assuming this HTML:
   *
   *      language: html
   *      <div id="mutsu" class="apple fruit food"></div>
   *  
   *  Then:
   *
   *      $('mutsu').removeClassName('food');
   *      // -> Element
   *      
   *      $('mutsu').classNames;
   *      // -> 'apple fruit'
  **/
  removeClassName: function(element, className) {
    if (!(element = $(element))) return;
    element.className = element.className.replace(
      new RegExp("(^|\\s+)" + className + "(\\s+|$)"), ' ').strip();
    return element;
  },

  /**
   *  Element.toggleClassName(@element, className) -> Element
   *
   *  Toggles the presence of CSS class `className` on `element`.
   *
   *  ##### Examples
   *  
   *      language: html
   *      <div id="mutsu" class="apple"></div>
   *
   *  Then:
   *
   *      $('mutsu').hasClassName('fruit');
   *      // -> false
   *      
   *      $('mutsu').toggleClassName('fruit');
   *      // -> element
   *      
   *      $('mutsu').hasClassName('fruit');
   *      // -> true
  **/
  toggleClassName: function(element, className) {
    if (!(element = $(element))) return;
    return Element[Element.hasClassName(element, className) ?
      'removeClassName' : 'addClassName'](element, className);
  },

  /**
   *  Element.cleanWhitespace(@element) -> Element
   *
   *  Removes all of `element`'s child text nodes that contain *only*
   *  whitespace. Returns `element`.
   *
   *  This can be very useful when using standard properties like `nextSibling`,
   *  `previousSibling`, `firstChild` or `lastChild` to walk the DOM. Usually
   *  you'd only do that if you are interested in all of the DOM nodes, not
   *  just Elements (since if you just need to traverse the Elements in the
   *  DOM tree, you can use [[Element.up]], [[Element.down]],
   *  [[Element.next]], and [[Element.previous]] instead).
   *
   *  #### Example
   *
   *  Consider the following HTML snippet:
   *
   *      language: html
   *      <ul id="apples">
   *        <li>Mutsu</li>
   *        <li>McIntosh</li>
   *        <li>Ida Red</li>
   *      </ul>
   *
   *  Let's grab what we think is the first list item using the raw DOM
   *  method:
   *
   *      var element = $('apples');
   *      element.firstChild.innerHTML;
   *      // -> undefined
   *
   *  It's undefined because the `firstChild` of the `apples` element is a
   *  text node containing the whitespace after the end of the `ul` and before
   *  the first `li`.
   *
   *  If we remove the useless whitespace, then `firstChild` works as expected:
   *
   *      var element = $('apples');
   *      element.cleanWhitespace();
   *      element.firstChild.innerHTML;
   *      // -> 'Mutsu'
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
   *  
   *  ##### Examples
   *  
   *      <div id="wallet">     </div>
   *      <div id="cart">full!</div>
   *  
   *      $('wallet').empty();
   *      // -> true
   *
   *      $('cart').empty();
   *      // -> false
  **/
  empty: function(element) {
    return $(element).innerHTML.blank();
  },

  /**
   *  Element.descendantOf(@element, ancestor) -> Boolean
   *  - ancestor (Element | String): The element to check against (or its ID).
   *
   *  Checks if `element` is a descendant of `ancestor`.
   *
   *  ##### Example
   *
   *  Assuming:
   *
   *      language: html
   *      <div id="australopithecus">
   *        <div id="homo-erectus">
   *          <div id="homo-sapiens"></div>
   *        </div>
   *      </div>
   *
   *  Then:
   *
   *      $('homo-sapiens').descendantOf('australopithecus');
   *      // -> true
   *
   *      $('homo-erectus').descendantOf('homo-sapiens');
   *      // -> false
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
   *  
   *  This has a similar effect than what would be achieved using
   *  [HTML anchors](http://www.w3.org/TR/html401/struct/links.html#h-12.2.3)
   *  (except the browser's history is not modified).
   *  
   *  ##### Example
   *  
   *      $(element).scrollTo();
   *      // -> Element
  **/
  scrollTo: function(element) {
    element = $(element);
    var pos = Element.cumulativeOffset(element);
    window.scrollTo(pos[0], pos[1]);
    return element;
  },

  /**
   *  Element.getStyle(@element, style) -> String | null
   *  - style (String): The property name to be retrieved.
   *
   *  Returns the given CSS property value of `element`. The property can be
   *  specified in either its CSS form (`font-size`) or its camelized form
   *  (`fontSize`).
   *
   *  This method looks up the CSS property of an element whether it was
   *  applied inline or in a stylesheet. It works around browser inconsistencies
   *  regarding `float`, `opacity`, which returns a value between `0`
   *  (fully transparent) and `1` (fully opaque), position properties
   *  (`left`, `top`, `right` and `bottom`) and when getting the dimensions
   *  (`width` or `height`) of hidden elements.
   *  
   *  ##### Examples
   *  
   *      $(element).getStyle('font-size');
   *      // equivalent:
   *      
   *      $(element).getStyle('fontSize');
   *      // -> '12px'
   *  
   *  ##### Notes
   *  
   *  Internet Explorer returns literal values while other browsers return
   *  computed values.
   *
   *  Consider the following HTML snippet:
   *  
   *      language: html
   *      <style>
   *        #test {
   *          font-size: 12px;
   *          margin-left: 1em;
   *        }
   *      </style>
   *      <div id="test"></div>
   *
   *  Then:
   *
   *      $('test').getStyle('margin-left');
   *      // -> '1em' in Internet Explorer,
   *      // -> '12px' elsewhere.
   *  
   *  Safari returns `null` for *any* non-inline property if the element is
   *  hidden (has `display` set to `'none'`).
   *  
   *  Not all CSS shorthand properties are supported. You may only use the CSS
   *  properties described in the
   *  [Document Object Model (DOM) Level 2 Style Specification](http://www.w3.org/TR/DOM-Level-2-Style/css.html#CSS-ElementCSSInlineStyle).
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
   *  Modifies `element`'s CSS style properties. Styles are passed as a hash of
   *  property-value pairs in which the properties are specified in their
   *  camelized form.
   *  
   *  ##### Examples
   *  
   *      $(element).setStyle({
   *        backgroundColor: '#900',
   *        fontSize: '12px'
   *      });
   *      // -> Element
   *  
   *  ##### Notes
   *  
   *  The method transparently deals with browser inconsistencies for `float`
   *  (however, as `float` is a reserved keyword, you must either escape it or
   *  use `cssFloat` instead) and `opacity` (which accepts values between `0`
   *  -fully transparent- and `1` -fully opaque-). You can safely use either of
   *  the following across all browsers:
   *  
   *      $(element).setStyle({
   *        cssFloat: 'left',
   *        opacity: 0.5
   *      });
   *      // -> Element
   *      
   *      $(element).setStyle({
   *        'float': 'left', // notice how float is surrounded by single quotes
   *        opacity: 0.5
   *      });
   *      // -> Element
   *  
   *  Not all CSS shorthand properties are supported. You may only use the CSS
   *  properties described in the
   *  [Document Object Model (DOM) Level 2 Style Specification](http://www.w3.org/TR/DOM-Level-2-Style/css.html#CSS-ElementCSSInlineStyle).
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
   *  Element.setOpacity(@element, opacity) -> [Element...]
   *  
   *  Sets the visual opacity of an element while working around inconsistencies
   *  in various browsers. The `opacity` argument should be a floating point
   *  number, where the value of `0` is fully transparent and `1` is fully opaque.
   *  
   *  [[Element.setStyle]] method uses [[Element.setOpacity]] internally when needed.
   *  
   *  ##### Examples
   *  
   *      var element = $('myelement');
   *      // set to 50% transparency
   *      element.setOpacity(0.5);
   *      
   *      // these are equivalent, but allow for setting more than
   *      // one CSS property at once:
   *      element.setStyle({ opacity: 0.5 });
   *      element.setStyle("opacity: 0.5");
  **/
  setOpacity: function(element, value) {
    element = $(element);
    element.style.opacity = (value == 1 || value === '') ? '' :
      (value < 0.00001) ? 0 : value;
    return element;
  },

  /**
   *  Element.makePositioned(@element) -> Element
   *
   *  Allows for the easy creation of a CSS containing block by setting
   *  `element`'s CSS `position` to `relative` if its initial position is
   *  either `static` or `undefined`.
   *  
   *  To revert back to `element`'s original CSS position, use
   *  [[Element.undoPositioned]].
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
   *  
   *  `element`'s absolutely positioned children will now have their positions
   *  set relatively to `element`'s nearest ancestor with a CSS `position` of
   *  `'absolute'`, `'relative'` or `'fixed'`.
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
   *
   *  To undo clipping, use [[Element.undoClipping]].
   *  
   *  The visible area is determined by `element`'s width and height.
   *  
   *  ##### Example
   *  
   *      language:html
   *      <div id="framer">
   *        <img src="/assets/2007/1/14/chairs.jpg" alt="example" />
   *      </div>
   *  
   *  Then:
   *
   *      $('framer').makeClipping().setStyle({width: '100px', height: '100px'});
   *      // -> Element
   *  
   *  Another example:
   *
   *      language: html
   *      <a id="clipper" href="#">Click me to try it out.</a>
   *  
   *      <div id="framer">
   *        <img src="/assets/2007/2/24/chairs.jpg" alt="example" />
   *      </div>
   *  
   *      <script type="text/javascript" charset="utf-8">
   *        var Example = {
   *          clip: function(){
   *            $('clipper').update('undo clipping!');
   *            $('framer').makeClipping().setStyle({width: '100px', height: '100px'});
   *          },
   *          unClip: function(){
   *            $('clipper').update('clip!');
   *            $('framer').undoClipping();
   *          },
   *          toggleClip: function(event){
   *            if($('clipper').innerHTML == 'undo clipping!') Example.unClip();
   *            else Example.clip();
   *            Event.stop(event);
   *          }
   *        };
   *        Event.observe('clipper', 'click', Example.toggleClip);
   *      </script>
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
   *  Sets `element`'s CSS `overflow` property back to the value it had
   *  _before_ [[Element.makeClipping]] was applied.
   *
   *  ##### Example
   *  
   *      language: html
   *      <div id="framer">
   *        <img src="/assets/2007/1/14/chairs.jpg" alt="example" />
   *      </div>
   *
   *  Then:
   *
   *      $('framer').undoClipping();
   *      // -> Element (and sets the CSS overflow property to its original value).
   *  
   *  Another example:
   *
   *      language: html
   *      <a id="clipper" href="#">Click me to try it out.</a>
   *
   *      <div id="framer">
   *        <img src="/assets/2007/2/24/chairs_1.jpg" alt="example" />
   *      </div>
   *  
   *      <script type="text/javascript" charset="utf-8">
   *        var Example = {
   *          clip: function(){
   *            $('clipper').update('undo clipping!');
   *            $('framer').makeClipping().setStyle({width: '100px', height: '100px'});
   *          },
   *          unClip: function(){
   *            $('clipper').update('clip!');
   *            $('framer').undoClipping();
   *          },
   *          toggleClip: function(event){
   *            if($('clipper').innerHTML == 'clip!') Example.clip();
   *            else Example.unClip();
   *            Event.stop(event);
   *          }
   *        };
   *        $('framer').makeClipping().setStyle({width: '100px', height: '100px'});
   *        Event.observe('clipper', 'click', Example.toggleClip);
   *      </script>
  **/
  undoClipping: function(element) {
    element = $(element);
    if (!element._overflow) return element;
    element.style.overflow = element._overflow == 'auto' ? '' : element._overflow;
    element._overflow = null;
    return element;
  },

  /**
   *  Element.clonePosition(@element, source[, options]) -> Element
   *  - source (Element | String): The source element (or its ID).
   *  - options (Object): The position fields to clone.
   *
   *  Clones the position and/or dimensions of `source` onto the element as
   *  defined by `options`, with an optional offset for the `left` and `top`
   *  properties.
   *
   *  Note that the element will be positioned exactly like `source` whether or
   *  not it is part of the same [CSS containing
   *  block](http://www.w3.org/TR/CSS21/visudet.html#containing-block-details).
   *
   *  ##### Options
   *
   *  <table class='options'>
   *  <thead>
   *    <tr>
   *      <th style='text-align: left; padding-right: 1em'>Name</th>
   *      <th style='text-align: left; padding-right: 1em'>Default</th>
   *      <th style='text-align: left; padding-right: 1em'>Description</th>
   *    </tr>
   *  </thead>
   *  <tbody>
   *    <tr>
   *    <td><code>setLeft</code></td>
   *    <td><code>true</code></td>
   *  <td>Clones <code>source</code>'s <code>left</code> CSS property onto <code>element</code>.</td>
   *  </tr>
   *  <tr>
   *    <td><code>setTop</code></td>
   *    <td><code>true</code></td>
   *  <td>Clones <code>source</code>'s <code>top</code> CSS property onto <code>element</code>.</td>
   *  </tr>
   *  <tr>
   *    <td><code>setWidth</code></td>
   *    <td><code>true</code></td>
   *  <td>Clones <code>source</code>'s <code>width</code> onto <code>element</code>.</td>
   *  </tr>
   *  <tr>
   *    <td><code>setHeight</code></td>
   *    <td><code>true</code></td>
   *  <td>Clones <code>source</code>'s <code>width</code> onto <code>element</code>.</td>
   *  </tr>
   *  <tr>
   *    <td><code>offsetLeft</code></td>
   *    <td><code>0</code></td>
   *  <td>Number by which to offset <code>element</code>'s <code>left</code> CSS property.</td>
   *  </tr>
   *  <tr>
   *    <td><code>offsetTop</code></td>
   *    <td><code>0</code></td>
   *  <td>Number by which to offset <code>element</code>'s <code>top</code> CSS property.</td>
   *  </tr>
   *  </tbody>
   *  </table>
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
    var p = Element.viewportOffset(source), delta = [0, 0], parent = null;

    // find coordinate system to use
    element = $(element);
    
    // delta [0,0] will do fine with position: fixed elements,
    // position:absolute needs offsetParent deltas
    if (Element.getStyle(element, 'position') == 'absolute') {
      parent = Element.getOffsetParent(element);
      delta = Element.viewportOffset(parent);
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

  /**
   *  Element.childElements(@element) -> [Element...]
   *
   *  Collects all of the element's children and returns them as an array of
   *  [[Element.extended extended]] elements, in document order. The first
   *  entry in the array is the topmost child of `element`, the next is the
   *  child after that, etc.
   *
   *  Like all of Prototype's DOM traversal methods, [[Element.childElements]]
   *  ignores text nodes and returns element nodes only.
   *
   *  ##### Example
   *
   *  Assuming:
   *
   *      language: html
   *      <div id="australopithecus">
   *        Some text in a text node
   *        <div id="homo-erectus">
   *          <div id="homo-neanderthalensis"></div>
   *          <div id="homo-sapiens"></div>
   *        </div>
   *      </div>
   *
   *  Then:
   *
   *      $('australopithecus').childElements();
   *      // -> [div#homo-erectus]
   *
   *      $('homo-erectus').childElements();
   *      // -> [div#homo-neanderthalensis, div#homo-sapiens]
   *
   *      $('homo-sapiens').childElements();
   *      // -> []
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

  Element._attributeTranslations = (function(){

    var classProp = 'className', 
        forProp = 'for', 
        el = document.createElement('div');

    // try "className" first (IE <8)
    el.setAttribute(classProp, 'x');

    if (el.className !== 'x') {
      // try "class" (IE 8)
      el.setAttribute('class', 'x');
      if (el.className === 'x') {
        classProp = 'class';
      }
    }
    el = null;

    el = document.createElement('label');
    el.setAttribute(forProp, 'x');
    if (el.htmlFor !== 'x') {
      el.setAttribute('htmlFor', 'x');
      if (el.htmlFor === 'x') {
        forProp = 'htmlFor';
      }
    }
    el = null;

    return {
      read: {
        names: {
          'class':      classProp,
          'className':  classProp,
          'for':        forProp,
          'htmlFor':    forProp
        },
        values: {
          _getAttr: function(element, attribute) {
            return element.getAttribute(attribute);
          },
          _getAttr2: function(element, attribute) {
            return element.getAttribute(attribute, 2);
          },
          _getAttrNode: function(element, attribute) {
            var node = element.getAttributeNode(attribute);
            return node ? node.value : "";
          },
          _getEv: (function(){

            var el = document.createElement('div'), f;
            el.onclick = Prototype.emptyFunction;
            var value = el.getAttribute('onclick');

            // IE<8
            if (String(value).indexOf('{') > -1) {
              // intrinsic event attributes are serialized as `function { ... }`
              f = function(element, attribute) {
                attribute = element.getAttribute(attribute);
                if (!attribute) return null;
                attribute = attribute.toString();
                attribute = attribute.split('{')[1];
                attribute = attribute.split('}')[0];
                return attribute.strip();
              };
            }
            // IE8
            else if (value === '') {
              // only function body is serialized
              f = function(element, attribute) {
                attribute = element.getAttribute(attribute);
                if (!attribute) return null;
                return attribute.strip();
              };
            }
            el = null;
            return f;
          })(),
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
    }
  })();

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
      href:        v._getAttr2,
      src:         v._getAttr2,
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

  // We optimize Element#down for IE so that it does not call
  // Element#descendants (and therefore extend all nodes).
  if (Prototype.BrowserFeatures.ElementExtensions) {
    (function() {
      function _descendants(element) {
        var nodes = element.getElementsByTagName('*'), results = [];
        for (var i = 0, node; node = nodes[i]; i++)
          if (node.tagName !== "!") // Filter out comment nodes.
            results.push(node);
        return results;
      }

      Element.Methods.down = function(element, expression, index) {
        element = $(element);
        if (arguments.length == 1) return element.firstDescendant();
        return Object.isNumber(expression) ? _descendants(element)[expression] :
          Element.select(element, expression)[index || 0];
      }
    })();
  }

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
      if (element.tagName.toUpperCase() == 'IMG' && element.width) {
        element.width++; element.width--;
      } else try {
        var n = document.createTextNode(' ');
        element.appendChild(n);
        element.removeChild(n);
      } catch (e) { }

    return element;
  };
}

if ('outerHTML' in document.documentElement) {
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
      var nextSibling = element.next(),
          fragments = Element._getContentFromAnonymousElement(tagName, content.stripScripts());
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
  var div = new Element('div'), 
      t = Element._insertionTranslations.tags[tagName];
  if (t) {
    div.innerHTML = t[0] + html + t[1];
    for (var i = t[2]; i--; ) {
      div = div.firstChild;
    }
  }
  else {
    div.innerHTML = html;
  }
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
  var tags = Element._insertionTranslations.tags;
  Object.extend(tags, {
    THEAD: tags.TBODY,
    TFOOT: tags.TBODY,
    TH:    tags.TD
  });
})();

Element.Methods.Simulated = {
  /**
   *  Element.hasAttribute(@element, attribute) -> Boolean
   *  
   *  Simulates the standard compliant DOM method
   *  [`hasAttribute`](http://www.w3.org/TR/DOM-Level-2-Core/core.html#ID-ElHasAttr)
   *  for browsers missing it (Internet Explorer 6 and 7).
   *  
   *  ##### Example
   *  
   *      language: html
   *      <a id="link" href="http://prototypejs.org">Prototype</a>
   *
   *  Then:
   *
   *      $('link').hasAttribute('href');
   *      // -> true
  **/  
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

})(document.createElement('div'));

/**
 *  Element.extend(element) -> Element
 *
 *  Extends the given element instance with all of the Prototype goodness and
 *  syntactic sugar, as well as any extensions added via [[Element.addMethods]].
 *  (If the element instance was already extended, this is a no-op.)
 *
 *  You only need to use [[Element.extend]] on element instances you've acquired
 *  directly from the DOM; **all** Prototype methods that return element
 *  instances (such as [[$]], [[Element.down]], etc.) will pre-extend the
 *  element before returning it.
 *
 *  Check out ["How Prototype extends the
 *  DOM"](http://prototypejs.org/learn/extensions) for more about element
 *  extensions.
 *
 *  ##### Details
 *
 *  Specifically, [[Element.extend]] extends the given instance with the methods
 *  contained in [[Element.Methods]] and `Element.Methods.Simulated`. If `element`
 *  is an `input`, `textarea`, or `select` element, it will also be extended
 *  with the methods from `Form.Element.Methods`. If it is a `form` element, it
 *  will also be extended with the methods from `Form.Methods`.
**/
Element.extend = (function() {

  function checkDeficiency(tagName) {
    if (typeof window.Element != 'undefined') {
      var proto = window.Element.prototype;
      if (proto) {
        var id = '_' + (Math.random()+'').slice(2),
            el = document.createElement(tagName);
        proto[id] = 'x';
        var isBuggy = (el[id] !== 'x');
        delete proto[id];
        el = null;
        return isBuggy;
      }
    }
    return false;
  }

  function extendElementWith(element, methods) {
    for (var property in methods) {
      var value = methods[property];
      if (Object.isFunction(value) && !(property in element))
        element[property] = value.methodize();
    }
  }

  var HTMLOBJECTELEMENT_PROTOTYPE_BUGGY = checkDeficiency('object');

  if (Prototype.BrowserFeatures.SpecificElementExtensions) {
    // IE8 has a bug with `HTMLObjectElement` and `HTMLAppletElement` objects
    // not being able to "inherit" from `Element.prototype`
    // or a specific prototype - `HTMLObjectElement.prototype`, `HTMLAppletElement.prototype`
    if (HTMLOBJECTELEMENT_PROTOTYPE_BUGGY) {
      return function(element) {
        if (element && typeof element._extendedByPrototype == 'undefined') {
          var t = element.tagName;
          if (t && (/^(?:object|applet|embed)$/i.test(t))) {
            extendElementWith(element, Element.Methods);
            extendElementWith(element, Element.Methods.Simulated);
            extendElementWith(element, Element.Methods.ByTag[t.toUpperCase()]);
          }
        }
        return element;
      }
    }
    return Prototype.K;
  }

  var Methods = { }, ByTag = Element.Methods.ByTag;

  var extend = Object.extend(function(element) {
    // need to use actual `typeof` operator
    // to prevent errors in some environments (when accessing node expandos)
    if (!element || typeof element._extendedByPrototype != 'undefined' ||
        element.nodeType != 1 || element == window) return element;

    var methods = Object.clone(Methods),
        tagName = element.tagName.toUpperCase();

    // extend methods for specific tags
    if (ByTag[tagName]) Object.extend(methods, ByTag[tagName]);

    extendElementWith(element, methods);

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

if (document.documentElement.hasAttribute) {
  Element.hasAttribute = function(element, attribute) {
    return element.hasAttribute(attribute);
  };
}
else {
  Element.hasAttribute = Element.Methods.Simulated.hasAttribute;
}

/**
 *  Element.addMethods(methods) -> undefined
 *  Element.addMethods(tagName, methods) -> undefined
 *  - tagName (String): (Optional) The name of the HTML tag for which the
 *    methods should be available; if not given, all HTML elements will have
 *    the new methods.
 *  - methods (Object): A hash of methods to add.
 *
 *  [[Element.addMethods]] makes it possible to mix your *own* methods into the
 *  [[Element]] object and extended element instances (all of them, or only ones
 *  with the given HTML tag if you specify `tagName`).
 *
 *  You define the methods in a hash that you provide to [[Element.addMethods]].
 *  Here's an example adding two methods:
 *
 *      Element.addMethods({
 *
 *        // myOwnMethod: Do something cool with the element
 *        myOwnMethod: function(element) {
 *          if (!(element = $(element))) return;
 *          // ...do smething with 'element'...
 *          return element;
 *        },
 *
 *        // wrap: Wrap the element in a new element using the given tag
 *        wrap: function(element, tagName) {
 *          var wrapper;
 *          if (!(element = $(element))) return;
 *          wrapper = new Element(tagName);
 *          element.parentNode.replaceChild(wrapper, element);
 *          wrapper.appendChild(element);
 *          return wrapper;
 *        }
 *
 *      });
 *
 *  Once added, those can be used either via [[Element]]:
 *
 *      // Wrap the element with the ID 'foo' in a div
 *      Element.wrap('foo', 'div');
 *
 *  ...or as instance methods of extended elements:
 *
 *      // Wrap the element with the ID 'foo' in a div
 *      $('foo').wrap('div');
 *
 *  Note the following requirements and conventions for methods added to
 *  [[Element]]:
 *
 *  - The first argument is *always* an element or ID, by convention this
 *    argument is called `element`.
 *  - The method passes the `element` argument through [[$]] and typically
 *    returns if the result is undefined.
 *  - Barring a good reason to return something else, the method returns the
 *    extended element to enable chaining.
 *
 *  Our `myOwnMethod` method above returns the element because it doesn't have
 *  a good reason to return anything else. Our `wrap` method returns the
 *  wrapper, because that makes more sense for that method.
 *
 *  ##### Extending only specific elements
 *
 *  If you call [[Element.addMethods]] with *two* arguments, it will apply the
 *  methods only to elements with the given HTML tag:
 *
 *      Element.addMethods('DIV', my_div_methods);
 *      // the given methods are now available on DIV elements, but not others
 *
 *  You can also pass an *[[Array]]* of tag names as the first argument:
 *
 *      Element.addMethods(['DIV', 'SPAN'], my_additional_methods);
 *      // DIV and SPAN now both have the given methods
 *
 *  (Tag names in the first argument are not case sensitive.)
 *
 *  Note: [[Element.addMethods]] has built-in security which prevents you from
 *  overriding native element methods or properties (like `getAttribute` or
 *  `innerHTML`), but nothing prevents you from overriding one of Prototype's
 *  methods. Prototype uses a lot of its methods internally; overriding its
 *  methods is best avoided or at least done only with great care.
 *
 *  ##### Example 1
 *
 *  Our `wrap` method earlier was a complete example. For instance, given this
 *  paragraph:
 *
 *      language: html
 *      <p id="first">Some content...</p>
 *
 *  ...we might wrap it in a `div`:
 *
 *      $('first').wrap('div');
 *
 *  ...or perhaps wrap it and apply some style to the `div` as well:
 *
 *      $('first').wrap('div').setStyle({
 *        backgroundImage: 'url(images/rounded-corner-top-left.png) top left'
 *      });
 *
 *  ##### Example 2
 *
 *  We can add a method to elements that makes it a bit easier to update them
 *  via [[Ajax.Updater]]:
 *
 *      Element.addMethods({
 *        ajaxUpdate: function(element, url, options) {
 *          if (!(element = $(element))) return;
 *          element.update('<img src="/images/spinner.gif" alt="Loading...">');
 *          options = options || {};
 *          options.onFailure = options.onFailure || defaultFailureHandler.curry(element);
 *          new Ajax.Updater(element, url, options);
 *          return element;
 *        }
 *      });
 *
 *  Now we can update an element via an Ajax call much more concisely than
 *  before:
 *
 *      $('foo').ajaxUpdate('/new/content');
 *
 *  That will use [[Ajax.Updater]] to load new content into the 'foo' element,
 *  showing a spinner while the call is in progress. It even applies a default
 *  failure handler (since we didn't supply one).
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
      "TEXTAREA": Object.clone(Form.Element.Methods),
      "BUTTON":   Object.clone(Form.Element.Methods)
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

    var element = document.createElement(tagName),
        proto = element['__proto__'] || element.constructor.prototype;
        
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

/**
 *  document.viewport
 *
 *  The `document.viewport` namespace contains methods that return information
 *  about the viewport &mdash; the rectangle that represents the portion of a web
 *  page within view. In other words, it's the browser window minus all chrome.
**/

document.viewport = {

  /**
   *  document.viewport.getDimensions() -> Object
   *
   *  Returns an object containing viewport dimensions in the form
   *  `{ width: Number, height: Number }`.
   *
   *  The _viewport_ is the subset of the browser window that a page occupies
   *  &mdash; the "usable" space in a browser window.
   *  
   *  ##### Example
   *  
   *      document.viewport.getDimensions();
   *      //-> { width: 776, height: 580 }
  **/
  getDimensions: function() {
    return { width: this.getWidth(), height: this.getHeight() };
  },

  /**
   *  document.viewport.getScrollOffsets() -> Array
   *
   *  Returns the viewport's horizontal and vertical scroll offsets.
   *
   *  Returns an array in the form of `[leftValue, topValue]`. Also accessible
   *  as properties: `{ left: leftValue, top: topValue }`.
   *
   *  ##### Examples
   *  
   *      document.viewport.getScrollOffsets();
   *      //-> { left: 0, top: 0 }
   *      
   *      window.scrollTo(0, 120);
   *      document.viewport.getScrollOffsets();
   *      //-> { left: 0, top: 120 }
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
   *
   *  Equivalent to calling `document.viewport.getDimensions().width`.
  **/
  viewport.getWidth  = define.curry('Width');

  /**
   *  document.viewport.getHeight() -> Number
   *
   *  Returns the height of the viewport.
   *
   *  Equivalent to `document.viewport.getDimensions().height`.
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
      if (typeof element._prototypeUID === "undefined")
        element._prototypeUID = Element.Storage.UID++;
      uid = element._prototypeUID;
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
      Element.getStorage(element).update(key);
    } else {
      Element.getStorage(element).set(key, value);
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
  },

  /**
   *  Element.clone(@element, deep) -> Element
   *  - deep (Boolean): Whether to clone `element`'s descendants as well.
   *
   *  Returns a duplicate of `element`.
   *
   *  A wrapper around DOM Level 2 `Node#cloneNode`, [[Element.clone]] cleans up
   *  any expando properties defined by Prototype.
  **/
  clone: function(element, deep) {
    if (!(element = $(element))) return;
    var clone = element.cloneNode(deep);
    clone._prototypeUID = void 0;
    if (deep) {
      var descendants = Element.select(clone, '*'),
          i = descendants.length;
      while (i--) {
        descendants[i]._prototypeUID = void 0;
      }
    }
    return Element.extend(clone);
  },
  
  /**
   *  Element.purge(@element) -> null
   *  
   *  Removes all event listeners and storage keys from an element.
   *  
   *  To be used just before removing an element from the page.
  **/
  purge: function(element) {
    if (!(element = $(element))) return;    
    var purgeElement = Element._purgeElement;
    
    purgeElement(element);

    var descendants = element.getElementsByTagName('*'),
     i = descendants.length;

    while (i--) purgeElement(descendants[i]);

    return null;
  }
});
