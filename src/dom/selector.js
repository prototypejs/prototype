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
 *  Prototype.Selector.filter(elements, expression) -> [Element...]
 *  - elements (Enumerable): a collection of DOM elements.
 *  - expression (String): A CSS selector.
 *
 *  Filters the given collection of elements with `expression` and returns an
 *  array of extended [[Element]] objects.
 *
 *  The only nodes returned will be those that match the given CSS selector.
**/

// Implementation provided by selector engine.

