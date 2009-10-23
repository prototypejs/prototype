Prototype._original_sizzle = window.Sizzle;
//= require "sizzle/sizzle"
Prototype.Sizzle = window.Sizzle;

// Restore globals.
window.Sizzle = Prototype._original_sizzle;
delete Prototype._original_sizzle;

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
})(Prototype.Sizzle);

