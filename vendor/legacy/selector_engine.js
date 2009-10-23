//= require "repository/legacy"

Prototype.Selector = (function(Legacy) {
  function select(selector, scope) {
    return Legacy.findChildElements(scope || document, [selector]);
  }
  
  function match(element, selector) {
    return !!Legacy.findElement([element], selector);
  }
  
  return {
    select: select,
    match:  match,
    filter: Legacy.matchElements
  };
})(Prototype.Legacy);
