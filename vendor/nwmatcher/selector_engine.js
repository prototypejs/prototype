Prototype._original_property = window.NW;
//= require "repository/src/nwmatcher"

Prototype.Selector = (function(engine) {
  function select(selector, scope) {
    return engine.select(selector, scope || document, null, Element.extend);
  }

  function filter(elements, selector) {
    var results = [], element, i = 0;
    while (element = elements[i++]) {
      if (engine.match(element, selector)) {
        Element.extend(element);
        results.push(element);
      }
    }
    return results;
  }
  
  return {
    engine:  engine,
    select:  select,
    match:   engine.match,
    filter:  filter
  };
})(NW.Dom);

// Restore globals.
window.NW = Prototype._original_property;
delete Prototype._original_property;