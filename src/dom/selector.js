/** related to: Prototype.Selector
 *  $$(expression...) -> [Element...]
 *
 *  Returns all elements in the document that match the provided CSS selectors.
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

// Implementation provided by selector engine.

/**
 *  Prototype.Selector.select(expression[, root = document]) -> [Element...]
 *  - expression (String): A CSS selector.
 *  - root (Element | document): A "scope" to search within. All results will
 *    be descendants of this node.
 *
 *  Searches `root` for elements that match the provided CSS selector and returns an
 *  array of extended [[Element]] objects.
**/

// Implementation provided by selector engine.

/**
 *  Prototype.Selector.match(element, expression) -> Boolean
 *  - element (Element): a DOM element.
 *  - expression (String): A CSS selector.
 *
 *  Tests whether `element` matches the CSS selector.
**/

// Implementation provided by selector engine.

/**
 *  Prototype.Selector.find(elements, expression[, index]) -> Element
 *  - elements (Enumerable): a collection of DOM elements.
 *  - expression (String): A CSS selector.
 #  - index: Numeric index of the match to return, or 0 if omitted.
 *
 *  Filters the given collection of elements with `expression` and returns the
 *  first matching element (or the `index`th matching element if `index` is
 *  specified).
**/
if (!Prototype.Selector.find) {
  Prototype.Selector.find = function(elements, expression, index) {
    if (Object.isUndefined(index)) index = 0;
    var match = Prototype.Selector.match, length = elements.length, matchIndex = 0, i;

    for (i = 0; i < length; i++) {
      if (match(elements[i], expression) && index == matchIndex++) {
        return Element.extend(elements[i]);
      }
    }
  }
}

