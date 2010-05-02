Prototype._original_property = window.Slick;
//= require "repository/Source/Slick.Parser.js"
//= require "repository/Source/Slick.Finder.js"

Prototype.Selector = (function(engine) {
  function extend(elements) {
    for (var i = 0, length = elements.length; i < length; i++) {
      Element.extend(elements[i]);
    }
    return elements;
  }
  
  function select(selector, scope) {
    return extend(engine.search(scope || document, selector));
  }
  
  return {
    engine:  engine,
    select:  select,
    match:   engine.match
  };
})(Slick);

// Restore globals.
window.Slick = Prototype._original_property;
delete Prototype._original_property;
