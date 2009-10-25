//= require "repository/legacy_selector"

Prototype.Selector = (function(engine) {
  function select(selector, scope) {
    return engine.findChildElements(scope || document, [selector]);
  }
  
  function match(element, selector) {
    return !!engine.findElement([element], selector);
  }
  
  return {
    engine:  engine,
    select:  select,
    match:   match,
    filter:  engine.matchElements
  };
})(Prototype.LegacySelector);
