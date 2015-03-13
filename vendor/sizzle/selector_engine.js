Prototype._original_property = window.Sizzle;

;(function () {
  function fakeDefine(fn) {
    Prototype._actual_sizzle = fn();
  }
  fakeDefine.amd = true;
  
  if (typeof define !== 'undefined' && define.amd) {
    // RequireJS is loaded. We need to pretend to be `define` while Sizzle
    // runs.
    Prototype._original_define = define;
    Prototype._actual_sizzle = null;
    window.define = fakeDefine;
  }
})();

//= require "repository/dist/sizzle"

;(function() {
  if (typeof Sizzle !== 'undefined') {
    // Sizzle was properly defined.
    return;
  }
  
  if (typeof define !== 'undefined' && define.amd) {
    // RequireJS.
    // We should find Sizzle where we put it. And we need to restore the original `define`.
    window.Sizzle = Prototype._actual_sizzle;
    window.define = Prototype._original_define;
    delete Prototype._actual_sizzle;
    delete Prototype._original_define;
    // TODO: Should we make our own `define` call here?
  } else if (typeof module !== 'undefined' && module.exports) {
    // Sizzle saw that it's in a CommonJS environment and attached itself to
    // `module.exports` instead.
    window.Sizzle = module.exports;
    // Reset `module.exports`.
    module.exports = {};
  }
})();

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
