Prototype._original_property = window.Sizzle;
//= require "repository/sizzle"

;(function(engine) {
  var extendElements = Prototype.Selector.extendElements;
  
  function select(selector, scope) {
    return extendElements(engine(selector, scope || document));
  }

  function match(element, selector) {
    return engine.matches(selector, [element]).length == 1;
  }
  
  Prototype.Selector.engine = engine;
  Prototype.Selector.select = select;
  Prototype.Selector.match = match;
})(Sizzle);

// Restore globals.
window.Sizzle = Prototype._original_property;
delete Prototype._original_property;
