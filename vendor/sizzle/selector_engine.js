Prototype._original_property = window.Sizzle;
//= require "repository/sizzle"

Prototype.Selector = (function(engine) {
  function extend(elements) {
    for (var i = 0, length = elements.length; i < length; i++) {
      Element.extend(elements[i]);
    }
    return elements;
  }
  
  function select(selector, scope) {
    return extend(engine(selector, scope || document));
  }

  function match(element, selector) {
    return engine.matches(selector, [element]).length == 1;
  }
    
  return {
    engine:  engine,
    select:  select,
    match:   match
  };
})(Sizzle);

// Restore globals.
window.Sizzle = Prototype._original_property;
delete Prototype._original_property;
