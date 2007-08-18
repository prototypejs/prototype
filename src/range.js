ObjectRange = Class.create({
  initialize: function(start, end, exclusive) {
    this.start = start;
    this.end = end;
    this.exclusive = exclusive;
  },
  
  _each: function(iterator) {
    var value = this.start;
    while (this.include(value)) {
      iterator(value);
      value = value.succ();
    }
  } 
});

Object.extend(ObjectRange.prototype, Enumerable);

ObjectRange.prototype.include = function(value) {
  if (value < this.start) 
    return false;
  if (this.exclusive)
    return value < this.end;
  return value <= this.end;
};

var $R = function(start, end, exclusive) {
  return new ObjectRange(start, end, exclusive);
};
