//= require "repository/legacy_selector"

;(function(engine) {
  function select(selector, scope) {
    return engine.findChildElements(scope || document, [selector]);
  }
  
  function match(element, selector) {
    return !!engine.findElement([element], selector);
  }
  
  Prototype.Selector.engine = engine;
  Prototype.Selector.select = select;
  Prototype.Selector.match = match;
})(Prototype.LegacySelector);
