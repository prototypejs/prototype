
suite('Position', function () {
  this.name = 'position';

  setup(function () {
    scrollTo(0, 0);
    Position.prepare();
    Position.includeScrollOffsets = false;
  });

  teardown(function () {
    scrollTo(0, 0);
    Position.prepare();
    Position.includeScrollOffsets = false;
  });

  test('.prepare', function () {
    Position.prepare();
    assert.equal(0, Position.deltaX);
    assert.equal(0, Position.deltaY);
    scrollTo(20, 30);
    Position.prepare();
    assert.equal(20, Position.deltaX);
    assert.equal(30, Position.deltaY);
  });

  test('.within', function () {
    [true, false].each(function(withScrollOffsets) {
      Position.includeScrollOffsets = withScrollOffsets;
      assert(!Position.within($('position_test_body_absolute'), 9, 9), 'outside left/top');
      assert(Position.within($('position_test_body_absolute'), 10, 10), 'left/top corner');
      assert(Position.within($('position_test_body_absolute'), 10, 19), 'left/bottom corner');
      assert(!Position.within($('position_test_body_absolute'), 10, 20), 'outside bottom');
    }, this);

    scrollTo(20, 30);
    Position.prepare();
    Position.includeScrollOffsets = true;
    assert(!Position.within($('position_test_body_absolute'), 9, 9), 'outside left/top');
    assert(Position.within($('position_test_body_absolute'), 10, 10), 'left/top corner');
    assert(Position.within($('position_test_body_absolute'), 10, 19), 'left/bottom corner');
    assert(!Position.within($('position_test_body_absolute'), 10, 20), 'outside bottom');
  });



});
