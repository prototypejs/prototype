Prototype._original_property = window.NW;
//= require "repository/src/nwmatcher"

Prototype.Selector = (function(engine) {
  function select(selector, scope) {
    return engine.select(selector, scope || document, Element.extend);
  }

  return {
    engine:  engine,
    select:  select,
    match:   engine.match
  };
})(NW.Dom);

// Restore globals.
window.NW = Prototype._original_property;
delete Prototype._original_property;