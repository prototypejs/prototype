//= require <sizzle>

/** section: DOM
 *  class Selector
 *
 *  A class that queries the document for elements that match a given CSS
 *  selector.
**/
(function() {
  function extend(elements) {
    for (var i = 0, length = elements.length; i < length; i++)
      elements[i] = Element.extend(elements[i]);
    return elements;
  }

  window.Selector = Class.create({
    /**
     *  new Selector(expression)
     *  - expression (String): A CSS selector.
     *
     *  Creates a `Selector` with the given CSS selector.
    **/
    initialize: function(expression) {
      this.expression = expression.strip();
    },
  
    /**
     *  Selector#findElements(root) -> [Element...]
     *  - root (Element || document): A "scope" to search within. All results will
     *    be descendants of this node.
     *
     *  Searches the document for elements that match the instance's CSS
     *  selector.
    **/
    findElements: function(rootElement) {
      return extend(Sizzle(this.expression, rootElement || document));
    },
  
    /**
     *  Selector#match(element) -> Boolean
     *
     *  Tests whether a `element` matches the instance's CSS selector.
    **/
    match: function(element) {
      return Sizzle.matches(this.expression, [element]).length == 1;
    },
  
    toString: function() {
      return this.expression;
    },
  
    inspect: function() {
      return "#<Selector: " + this.expression + ">";
    }
  });

  Object.extend(Selector, {
    /**
     *  Selector.matchElements(elements, expression) -> [Element...]
     *
     *  Filters the given collection of elements with `expression`.
     *
     *  The only nodes returned will be those that match the given CSS selector.
    **/
    matchElements: function(elements, expression) {
      return extend(Sizzle.matches(expression, elements));
    },

    /**
     *  Selector.findElement(elements, expression[, index = 0]) -> Element
     *  Selector.findElement(elements[, index = 0]) -> Element
     *
     *  Returns the `index`th element in the collection that matches
     *  `expression`.
     *
     *  Returns the `index`th element overall if `expression` is not given.
    **/
    findElement: function(elements, expression, index) {
      if (Object.isUndefined(index)) index = 0;
      return Element.extend(Sizzle.matches(expression, elements)[index]);
    },

    /**
     *  Selector.findChildElements(element, expressions) -> [Element...]
     *
     *  Searches beneath `element` for any elements that match the selector
     *  (or selectors) specified in `expressions`.
    **/
    findChildElements: function(element, expressions) {
      var results = [], exprs = expressions.toArray();
      while (exprs.length) Sizzle(exprs.shift(), element || document, results);
      return extend(results);
    }
  });

  /** related to: Selector
   *  $$(expression...) -> [Element...]
   *
   *  Returns all elements in the document that match the provided CSS selectors.
  **/
  window.$$ = function() {
    return Selector.findChildElements(document, $A(arguments));
  }
})();
