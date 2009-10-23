Prototype._original_nw = window.NW;
//= require "nwmatcher/src/nwmatcher"
Prototype.NW = window.NW;

// Restore globals.
window.NW = Prototype._original_nw;
delete Prototype._original_nw;

Prototype.Selector = (function(NW) {
  function select(selector, scope) {
    return NW.select(selector, scope || document, null, Element.extend);
  }

  function filter(elements, selector) {
    var results = [], element;
    for (var i = 0, length = elements.length; i < length; i++) {
      element = elements[i];
      if (NW.match(element, selector)) {
        results.push(Element.extend(element))
      }
    }
    return results;
  }
  
  return {
    select: select,
    match:  NW.match,
    filter: filter
  };
})(Prototype.NW.Dom);

