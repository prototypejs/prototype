Prototype._original_nw = window.NW;
//= require <nwmatcher-1.1.1>
Prototype.NW = window.NW;

// Restore globals.
window.NW = Prototype._original_nw;
delete Prototype._original_nw;

Prototype.Selector = (function(NW) {
  function extend(elements) {
    for (var i = 0, length = elements.length; i < length; i++)
      elements[i] = Element.extend(elements[i]);
    return elements;
  }
  
  function select(selector, scope) {
    return extend(NW.select(selector, scope || document));
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

