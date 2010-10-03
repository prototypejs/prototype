Prototype._original_property = window.Slick;
//= require "repository/Source/Slick.Parser.js"
//= require "repository/Source/Slick.Finder.js"

;(function(engine) {
  var extendElements = Prototype.Selector.extendElements;
  
  function select(selector, scope) {
    return extendElements(engine.search(scope || document, selector));
  }
  
  Prototype.Selector.engine = engine;
  Prototype.Selector.select = select;
  Prototype.Selector.match = engine.match;
})(Slick);

// Restore globals.
window.Slick = Prototype._original_property;
delete Prototype._original_property;
