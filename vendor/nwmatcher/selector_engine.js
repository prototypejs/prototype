Prototype._original_nw = window.NW;
//= require "repository/src/nwmatcher"
Prototype.NW = window.NW;

// Restore globals.
window.NW = Prototype._original_nw;
delete Prototype._original_nw;

Prototype.Selector = (function(NWDom) {
  function select(selector, scope) {
    return NWDom.select(selector, scope || document, null, Element.extend);
  }

  function filter(elements, selector) {
    var results = [], element, i = 0;
    while (element = elements[i++]) {
      if (NWDom.match(element, selector)) {
        Element.extend(element);
        results.push(element);
      }
    }
    return results;
  }
  
  return {
    select: select,
    match:  NWDom.match,
    filter: filter
  };
})(Prototype.NW.Dom);

