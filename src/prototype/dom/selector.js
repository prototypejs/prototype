/** section: DOM, related to: Prototype.Selector
 *  $$(cssRule...) -> [Element...]
 *  
 *  Takes an arbitrary number of CSS selectors (strings) and returns a document-order
 *  array of extended DOM elements that match any of them.
 *  
 *  Sometimes the usual tools from your DOM arsenal -- `document.getElementById` encapsulated
 *  by [[$]], `getElementsByTagName` and even Prototype's very own `getElementsByClassName`
 *  extensions -- just aren't enough to quickly find elements or collections of elements.
 *  If you know the DOM tree structure, you can simply resort to CSS selectors to get
 *  the job done.
 *  
 *  ##### Quick examples
 *  
 *      $$('div');
 *      // -> all DIVs in the document. Same as document.getElementsByTagName('div').
 *      // Nice addition, the elements you're getting back are already extended!
 *      
 *      $$('#contents');
 *      // -> same as $('contents'), only it returns an array anyway (even though IDs must
 *      // be unique within a document).
 *      
 *      $$('li.faux');
 *      // -> all LI elements with class 'faux'
 *  
 *  The [[$$]] function searches the entire document. For selector queries on more specific
 *  sections of a document, use [[Element.select]].
 *  
 *  ##### Supported CSS syntax
 *  
 *  The [[$$]] function does not rely on the browser's internal CSS parsing capabilities
 *  (otherwise, we'd be in cross-browser trouble...), and therefore offers a consistent
 *  set of selectors across all supported browsers.
 *  
 *  ###### Supported in v1.5.0
 *  
 *  * Type selector: tag names, as in `div`.
 *  * Descendant selector: the space(s) between other selectors, as in `#a li`.
 *  * Attribute selectors: the full CSS 2.1 set of `[attr]`, `[attr=value]`, `[attr~=value]`
 *  and `[attr|=value]`. It also supports `[attr!=value]`. If the value you're matching
 *  against includes a space, be sure to enclose the value in quotation marks (`[title="Hello World!"]`).
 *  * Class selector: CSS class names, as in `.highlighted` or `.example.wrong`.
 *  * ID selector: as in `#item1`.
 *  
 *  ###### Supported from v1.5.1
 *  
 *  Virtually all of [CSS3](http://www.w3.org/TR/2001/CR-css3-selectors-20011113/#selectors)
 *  is supported, with the exception of pseudo-elements (like `::first-letter`) and some
 *  pseudo-classes (like `:hover`). Some examples of new selectors that can be used in 1.5.1:
 *  
 *  * Child selector: selects immediate descendants, as in `#a > li`.
 *  * Attribute selectors: all attribute operators are supported, including `~=` (matches
 *  part of a space-delimited attribute value, like `rel` or `class`); `^=` (matches the
 *  beginning of a value); `$=` (matches the end of a value); and `*=` (matches any part
 *  of the value).
 *  * The `:not` pseudo-class, as in `#a *:not(li)` (matches all descendants of `#a` that
 *  aren't LIs).
 *  * All the `:nth`, `:first`, and `:last` pseudo-classes. Examples include `tr:nth-child(even)`
 *  (all even table rows), `li:first-child` (the first item in any list), or `p:nth-last-of-type(3)`
 *  (the third-to-last paragraph on the page).
 *  * The `:empty` pseudo-class (for selecting elements without children or text content).
 *  * The `:enabled`, `:disabled`, and `:checked` pseudo-classes (for use with form controls).
 *  
 *  ##### Examples
 *  
 *      $$('#contents a[rel]');
 *      // -> all links inside the element of ID "contents" with a rel attribute
 *      
 *      $$('a[href="#"]');
 *      // -> all links with a href attribute of value "#" (eyeew!)
 *      
 *      $$('#navbar a', '#sidebar a');
 *      // -> all links within the elements of ID "navbar" or "sidebar"
 *  
 *  **With version 1.5.1 and above** you can do various types of advanced selectors:
 *  
 *      $$('a:not([rel~=nofollow])');
 *      // -> all links, excluding those whose rel attribute contains the word "nofollow"
 *      
 *      $$('table tbody > tr:nth-child(even)');
 *      // -> all even rows within all table bodies
 *      
 *      $$('div:empty');
 *      // -> all DIVs without content (i.e., whitespace-only)
**/
window.$$ = function() {
  var expression = $A(arguments).join(', ');
  return Prototype.Selector.select(expression, document);
};

/**
 * Prototype.Selector
 *
 * A namespace that acts as a wrapper around
 * the choosen selector engine (Sizzle by default).
 *
**/
Prototype.Selector = (function() {
  
  /**
   *  Prototype.Selector.select(expression[, root = document]) -> [Element...]
   *  - expression (String): A CSS selector.
   *  - root (Element | document): A "scope" to search within. All results will
   *    be descendants of this node.
   *
   *  Searches `root` for elements that match the provided CSS selector and returns an
   *  array of extended [[Element]] objects.
  **/
  function select() {
    throw new Error('Method "Prototype.Selector.select" must be defined.');
  }

  /**
   *  Prototype.Selector.match(element, expression) -> Boolean
   *  - element (Element): a DOM element.
   *  - expression (String): A CSS selector.
   *
   *  Tests whether `element` matches the CSS selector.
  **/
  function match() {
    throw new Error('Method "Prototype.Selector.match" must be defined.');
  }

  /**
   *  Prototype.Selector.find(elements, expression[, index = 0]) -> Element
   *  - elements (Enumerable): a collection of DOM elements.
   *  - expression (String): A CSS selector.
   *  - index (Number): Numeric index of the match to return, defaults to 0.
   *
   *  Filters the given collection of elements with `expression` and returns the
   *  first matching element (or the `index`th matching element if `index` is
   *  specified).
  **/
  function find(elements, expression, index) {
    index = index || 0;
    var match = Prototype.Selector.match, length = elements.length, matchIndex = 0, i;

    for (i = 0; i < length; i++) {
      if (match(elements[i], expression) && index == matchIndex++) {
        return Element.extend(elements[i]);
      }
    }
  }
  
  /**
   *  Prototype.Selector.extendElements(elements) -> Enumerable
   *  - elements (Enumerable): a collection of DOM elements.
   *
   *  If necessary, extends the elements contained in `elements`
   *  and returns `elements` untouched. This is provided as a 
   *  convenience method for selector engine wrapper implementors.
  **/
  function extendElements(elements) {
    for (var i = 0, length = elements.length; i < length; i++) {
      Element.extend(elements[i]);
    }
    return elements;
  }
  
  /** alias of: Element.extend
   *  Prototype.Selector.extendElement(element) -> Element
  **/
  
  var K = Prototype.K;
  
  return {
    select: select,
    match: match,
    find: find,
    extendElements: (Element.extend === K) ? K : extendElements,
    extendElement: Element.extend
  };
})();
