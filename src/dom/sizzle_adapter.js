//= require <sizzle>

Prototype.Selector = (function(Sizzle) {
  function extend(elements) {
    for (var i = 0, length = elements.length; i < length; i++)
      elements[i] = Element.extend(elements[i]);
    return elements;
  }
  
  function select(selector, scope) {
    return extend(Sizzle(selector, scope || document));
  }

  function match(element, selector) {
    return Sizzle.matches(selector, [element]).length == 1;
  }

  function filter(elements, selector) {
    return extend(Sizzle.matches(selector, elements));
  }
  
  return {
    select: select,
    match:  match,
    filter: filter
  };
})(Sizzle);

/** related to: Selector
 *  $$(expression...) -> [Element...]
 *
 *  Returns all elements in the document that match the provided CSS selectors.
**/
window.$$ = function() {
  var expression = $A(arguments).join(', ');
  return Prototype.Selector.select(expression, document);
};