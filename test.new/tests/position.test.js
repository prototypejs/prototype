
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

  test('clonePosition, when scroll page', function() {
    var opts = { offsetTop: 20, offsetLeft: 0, setWidth: false, setHeight: false };
    //position before scroll
    $('SubMenu').clonePosition($('MainMenu'), opts);
    var before = $('SubMenu').viewportOffset()['top'] - $('MainMenu').viewportOffset()['top'];
    //offset not changed
    //after scroll
    //original
    
    $('SubMenu').setStyle({position: "absolute", 
                           top: "250px",
                           left: "250px"
                        });
    scrollTo(0, 300);
    $('SubMenu').clonePosition($('MainMenu'), opts);
    var after = $('SubMenu').viewportOffset()['top'] - $('MainMenu').viewportOffset()['top'];
    
    assert.equal(before, after);
  });

  test('clonePosition, when element have the same size', function() {
    var src = $('clone-position-source');
    var trg = $('clone-position-target');
    
    trg.clonePosition(src, {
      setHeight: false,
      offsetTop: src.offsetHeight
    });

    assert.equal(src.getWidth(), trg.getWidth());
    assert.equal(src.getHeight(), trg.getHeight());
  });
});
