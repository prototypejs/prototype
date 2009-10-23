Prototype._original_nw = window.NW;
//= require "nwmatcher/src/nwmatcher"
Prototype.NW = window.NW;

// Restore globals.
window.NW = Prototype._original_nw;
delete Prototype._original_nw;

Prototype.Selector = (function(NW) {
  function select(selector, scope) {
    var results = [], resultsIndex = 0;
    NW.select(selector, scope || document, null, function(element) {
      results[resultsIndex++] = Element.extend(element);
    });
    return results;
  }

  function filter(elements, selector) {
    var results = [], resultsIndex = 0, element;
    for (var i = 0, length = elements.length; i < length; i++) {
      element = elements[i];
      if (NW.match(element, selector)) {
        results[resultsIndex++] = Element.extend(element);
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

