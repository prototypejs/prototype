function $R(start, end, exclusive) {
  return new ObjectRange(start, end, exclusive);
}

var ObjectRange = Class.create(Enumerable, (function() {
  function initialize(start, end, exclusive) {
    this.start = start;
    this.end = end;
    this.exclusive = exclusive;
  }
  
  function _each(iterator) {
    var value = this.start;
    while (this.include(value)) {
      iterator(value);
      value = value.succ();
    }
  }
  
  function include(value) {
    if (value < this.start) 
      return false;
    if (this.exclusive)
      return value < this.end;
    return value <= this.end;
  }
  
  return {
    initialize: initialize,
    _each:      _each,
    include:    include
  };
})());

