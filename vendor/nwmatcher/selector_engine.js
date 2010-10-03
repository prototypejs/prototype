Prototype._original_property = window.NW;
//= require "repository/src/nwmatcher"

;(function(engine) {
  var extendElements = Prototype.Selector.extendElements;
  
  function select(selector, scope) {
    return extendElements(engine.select(selector, scope));
  }
    
  Prototype.Selector.engine = engine;
  Prototype.Selector.select = select;
  Prototype.Selector.match = engine.match;
})(NW.Dom);

// Restore globals.
window.NW = Prototype._original_property;
delete Prototype._original_property;