function isDisplayed(element) {
  var originalElement = element;

  while (element && element.parentNode) {
    var display = element.getStyle('display');
    if (display === 'none') {
      return false;
    }
    element = $(element.parentNode);
  }
  return true;
}

var documentViewportProperties = null;

var RESIZE_DISABLED = false;

suite("Layout", function(){
  this.name = 'layout';

  setup(function () {

    if (documentViewportProperties) return;

    // Based on properties check from http://www.quirksmode.org/viewport/compatibility.html.

    documentViewportProperties = {
      properties: [
        'self.pageXOffset', 'self.pageYOffset',
        'self.screenX', 'self.screenY',
        'self.innerHeight', 'self.innerWidth',
        'self.outerHeight', 'self.outerWidth',
        'self.screen.height', 'self.screen.width',
        'self.screen.availHeight', 'self.screen.availWidth',
        'self.screen.availTop', 'self.screen.availLeft',
        'self.screen.Top', 'self.screen.Left',
        'self.screenTop', 'self.screenLeft',
        'document.body.clientHeight', 'document.body.clientWidth',
        'document.body.scrollHeight', 'document.body.scrollWidth',
        'document.body.scrollLeft', 'document.body.scrollTop',
        'document.body.offsetHeight', 'document.body.offsetWidth',
        'document.body.offsetTop', 'document.body.offsetLeft'
      ].inject([], function (properties, prop) {
        if (!self.screen && prop.include('self.screen')) return;
        if (!document.body && prop.include('document.body')) return;

        properties.push(prop);

        if (prop.include('body') && document.documentElement) {
          properties.push(prop.sub('.body', '.documentElement'));
        }

        return properties;
      }),

      inspect: function () {
        var props = [];
        this.properties.each(function (prop) {
          if (eval(prop)) props[prop] = eval(prop);
        }, this);
        return props;
      }
    };
  });


  test("preCompute argument of layout", function() {
    var preComputedLayout = $('box1').getLayout(true),
        normalLayout = $('box1').getLayout();

    // restore normal get method from Hash object
    preComputedLayout.get = Hash.prototype.get;

    Element.Layout.PROPERTIES.each(function(key) {
      assert.equal(normalLayout.get(key), preComputedLayout.get(key), key);
    });
  });

  test("layout on absolutely-positioned elements", function() {
    var layout = $('box1').getLayout();

    assert.equal(242, layout.get('width'),  'width' );
    assert.equal(555, layout.get('height'), 'height');

    assert.equal(3, layout.get('border-left'), 'border-left');
    assert.equal(10, layout.get('padding-top'), 'padding-top');
    assert.equal(1020, layout.get('top'), 'top');

    assert.equal(25, layout.get('left'), 'left');
  });

  test("layout on elements with display: none and exact width", function() {
    var layout = $('box2').getLayout();

    assert(!isDisplayed($('box2')), 'box should be hidden');

    assert.equal(500, layout.get('width'),            'width');
    assert.equal(  3, layout.get('border-right'),     'border-right');
    assert.equal( 10, layout.get('padding-bottom'),   'padding-bottom');
    assert.equal(526, layout.get('border-box-width'), 'border-box-width');

    assert(!isDisplayed($('box2')), 'box should still be hidden');
  });

  test("layout on elements with negative margins", function() {
    var layout = $('box_with_negative_margins').getLayout();

    assert.equal(-10, layout.get('margin-top')  );
    assert.equal( -3, layout.get('margin-left') );
    assert.equal(  2, layout.get('margin-right'));
  });

  test("layout on elements with display: none and width: auto", function() {
    var layout = $('box3').getLayout();

    assert(!isDisplayed($('box3')), 'box should be hidden');

    assert.equal(364, layout.get('width'),            'width');
    assert.equal(400, layout.get('margin-box-width'), 'margin-box-width');
    assert.equal(390, layout.get('border-box-width'), 'border-box-width');
    assert.equal(3,   layout.get('border-right'),     'border-top');
    assert.equal(10,  layout.get('padding-bottom'),   'padding-right');

    // Ensure that we cleaned up after ourselves.
    assert(!isDisplayed($('box3')), 'box should still be hidden');
  });

  test("layout on elements with display: none ancestors",function() {
    var layout = $('box4').getLayout();

    assert(!isDisplayed($('box4')), 'box should be hidden');

    // Width and height values are nonsensical for deeply-hidden elements.
    assert.equal(0, layout.get('width'), 'width of a deeply-hidden element should be 0');
    assert.equal(0, layout.get('margin-box-height'), 'height of a deeply-hidden element should be 0');

    // But we can still get meaningful values for other measurements.
    assert.equal(0, layout.get('border-right'), 'border-top');
    assert.equal(13, layout.get('padding-bottom'), 'padding-right');

    // Ensure that we cleaned up after ourselves.
    assert(!isDisplayed($('box4')), 'box should still be hidden');
  });

  test("positioning on absolutely-positioned elements", function() {
    var layout = $('box5').getLayout();

    assert.equal(30, layout.get('top'), 'top');
    assert.equal(60, layout.get('right'), 'right (percentage value)');

    assert.equal(340, layout.get('left'), 'left');
  });

  test("positioning on absolutely-positioned element with top=0 and left=0", function() {
    var layout = $('box6').getLayout();

    assert.equal(0, layout.get('top'), 'top');
    assert.strictEqual($('box6_parent'), $('box6').getOffsetParent());
  });

  test("layout on statically-positioned element with percentage width", function() {
    var layout = $('box7').getLayout();

    assert.equal(150, layout.get('width'));
  });

  test("layout on absolutely-positioned element with percentage width", function() {
    var layout = $('box8').getLayout();

    assert.equal(150, layout.get('width'));
  });

  test("layout on fixed-position element with percentage width", function() {
    var viewportWidth = document.viewport.getWidth();
    var layout = $('box9').getLayout();

    function assertNear(v1, v2, message) {
      var abs = Math.abs(v1 - v2);
      assert(abs <= 1, message + ' (actual: ' + v1 + ', ' + v2 + ')');
    }

    // With percentage widths, we'll occasionally run into rounding
    // discrepancies. Assert that the values agree to within 1 pixel.
    var vWidth = viewportWidth / 4, eWidth = $('box9').measure('width');
    assertNear.call(this, vWidth, eWidth, 'width (visible)');

    $('box9').hide();
    assertNear.call(this, vWidth, $('box9').measure('width'), 'width (hidden)');
    $('box9').show();
  });

  test("#toCSS, #toObject, #toHash", function() {
    var layout = $('box6').getLayout();
    var top = layout.get('top');

    var cssObject = layout.toCSS('top');

    assert('top' in cssObject,
     "layout object should have 'top' property");

    cssObject = layout.toCSS('top left bottom');

    $w('top left bottom').each( function(prop) {
      assert(prop in cssObject, "layout object should have '" +
       prop + "' property");
    }, this);

    var obj = layout.toObject('top');
    assert('top' in obj,
     "object should have 'top' property");
  });

  test("dimensions on absolutely-positioned, hidden elements", function() {
    var layout = $('box10').getLayout();

    assert.equal(278, layout.get('width'),  'width' );
    assert.equal(591, layout.get('height'), 'height');
  });

  // ELEMENT METHODS

  suite('Element', function () {

    test('#makeClipping, #undoClipping', function () {
      var chained = document.createElement('DIV');
      assert.equal(chained, chained.makeClipping());
      assert.equal(chained, chained.makeClipping());
      assert.equal(chained, chained.makeClipping().makeClipping());

      assert.equal(chained, chained.undoClipping());
      assert.equal(chained, chained.undoClipping());
      assert.equal(chained, chained.undoClipping().makeClipping());

      ['hidden','visible','scroll'].each( function(overflowValue) {
        var element = $('element_with_'+overflowValue+'_overflow');

        assert.equal(overflowValue, element.getStyle('overflow'));
        element.makeClipping();
        assert.equal('hidden', element.getStyle('overflow'));
        element.undoClipping();
        assert.equal(overflowValue, element.getStyle('overflow'));
      });
    });

    test('#getHeight', function () {
      assert.strictEqual(100, $('dimensions-visible').getHeight());
      assert.strictEqual(100, $('dimensions-display-none').getHeight());
    });

    test('#getWidth', function () {
      assert.strictEqual(200, $('dimensions-visible').getWidth(), '#dimensions-visible');
      assert.strictEqual(200, $('dimensions-display-none').getWidth(), '#dimensions-display-none');
    });

    test('#getDimensions', function () {
      assert.strictEqual(100, $('dimensions-visible').getDimensions().height);
      assert.strictEqual(200, $('dimensions-visible').getDimensions().width);
      assert.strictEqual(100, $('dimensions-display-none').getDimensions().height);
      assert.strictEqual(200, $('dimensions-display-none').getDimensions().width);

      assert.strictEqual(100, $('dimensions-visible-pos-rel').getDimensions().height);
      assert.strictEqual(200, $('dimensions-visible-pos-rel').getDimensions().width);
      assert.strictEqual(100, $('dimensions-display-none-pos-rel').getDimensions().height);
      assert.strictEqual(200, $('dimensions-display-none-pos-rel').getDimensions().width);

      assert.strictEqual(100, $('dimensions-visible-pos-abs').getDimensions().height);
      assert.strictEqual(200, $('dimensions-visible-pos-abs').getDimensions().width);
      assert.strictEqual(100, $('dimensions-display-none-pos-abs').getDimensions().height);
      assert.strictEqual(200, $('dimensions-display-none-pos-abs').getDimensions().width);

      // known failing issue
      // assert($('dimensions-nestee').getDimensions().width <= 500, 'check for proper dimensions of hidden child elements');

      $('dimensions-td').hide();
      assert.strictEqual(100, $('dimensions-td').getDimensions().height);
      assert.strictEqual(200, $('dimensions-td').getDimensions().width);
      $('dimensions-td').show();

      $('dimensions-tr').hide();
      assert.strictEqual(100, $('dimensions-tr').getDimensions().height);
      assert.strictEqual(200, $('dimensions-tr').getDimensions().width);
      $('dimensions-tr').show();

      $('dimensions-table').hide();
      assert.strictEqual(100, $('dimensions-table').getDimensions().height);
      assert.strictEqual(200, $('dimensions-table').getDimensions().width);
    });

    test('#positionedOffset', function () {
      assert.enumEqual([10,10],
        $('body_absolute').positionedOffset(), '#body_absolute');
      assert.enumEqual([10,10],
        $('absolute_absolute').positionedOffset(), '#absolute_absolute');
      assert.enumEqual([10,10],
        $('absolute_relative').positionedOffset(), '#absolute_relative');
      assert.enumEqual([0,10],
        $('absolute_relative_undefined').positionedOffset(), '#absolute_relative_undefined');
      assert.enumEqual([10,10],
        $('absolute_fixed_absolute').positionedOffset(), '#absolute_fixed_absolute');

      var afu = $('absolute_fixed_undefined');
      assert.enumEqual([afu.offsetLeft, afu.offsetTop],
        afu.positionedOffset(), '#absolute_fixed_undefined');

      var element = new Element('div'), offset = element.positionedOffset();
      assert.enumEqual([0,0], offset, 'new element');
      assert.strictEqual(0, offset.top, 'new element top');
      assert.strictEqual(0, offset.left, 'new element left');
    });

    test('#cumulativeOffset', function () {
      var element = new Element('div'), offset = element.cumulativeOffset();
      assert.enumEqual([0,0], offset, 'new element');
      assert.strictEqual(0, offset.top, 'new element top');
      assert.strictEqual(0, offset.left, 'new element left');

      var innerEl = new Element('div'), outerEl = new Element('div');
      outerEl.appendChild(innerEl);
      assert.enumEqual([0,0], innerEl.cumulativeOffset(), 'new inner element');
    });

    test('#viewportOffset', function () {
      window.scrollTo(0, 0);

      assert.enumEqual([10, 10],
        $('body_absolute').viewportOffset());
      assert.enumEqual([20,20],
        $('absolute_absolute').viewportOffset());
      assert.enumEqual([20,20],
        $('absolute_relative').viewportOffset());
      assert.enumEqual([20,30],
        $('absolute_relative_undefined').viewportOffset());
      var element = new Element('div'), offset = element.viewportOffset();
      assert.enumEqual([0,0], offset);
      assert.strictEqual(0, offset.top);
      assert.strictEqual(0, offset.left);
    });

    test('#getOffsetParent', function () {
      assert.equal('body_absolute', $('absolute_absolute').getOffsetParent().id,
       '#body_absolute should be parent of #absolute_absolute');
      assert.equal('body_absolute', $('absolute_relative').getOffsetParent().id,
       '#body_absolute should be parent of #absolute_relative');
      assert.equal('absolute_relative', $('inline').getOffsetParent().id,
       '#absolute_relative should be parent of #inline');
      assert.equal('absolute_relative', $('absolute_relative_undefined').getOffsetParent().id,
       '#absolute_relative should be parent of #absolute_relative_undefined');

      assert.equal(document.body, new Element('div').getOffsetParent(),
       'body should be parent of unattached element');

      [document, document.body, document.documentElement].each (function(node) {
        assert.equal(document.body, Element.getOffsetParent(node));
      });
    });

    test('#absolutize', function () {
      $('notInlineAbsoluted', 'inlineAbsoluted').each(function(elt) {
        if ('_originalLeft' in elt) delete elt._originalLeft;
        elt.absolutize();
        assert.isUndefined(elt._originalLeft, 'absolutize() did not detect absolute positioning');
      }, this);
      // invoking on "absolute" positioned element should return element
      var element = $('absolute_fixed_undefined').setStyle({position: 'absolute'});
      assert.equal(element, element.absolutize());
    });

    test('#relativize', function () {
      // invoking on "relative" positioned element should return element
      var element = $('absolute_fixed_undefined').setStyle({
       position: 'relative' });
      assert.equal(element, element.relativize());
    });

    test('#clonePosition (when scrolling the page)', function() {
      var opts = { offsetTop: 20, offsetLeft: 0, setWidth: false, setHeight: false };

      // Before scroll.
      $('sub_menu').clonePosition($('main_menu'), opts);
      var before = $('sub_menu').viewportOffset().top - $('main_menu').viewportOffset().top;

      // Reset to original position.
      $('sub_menu').setStyle({
        position: "absolute",
        top: "250px",
        left: "250px"
      });
      scrollTo(0, 300);

      // After scroll.
      $('sub_menu').clonePosition($('main_menu'), opts);
      var after = $('sub_menu').viewportOffset()['top'] - $('main_menu').viewportOffset()['top'];

      assert.equal(before, after);
    });

    test('#clonePosition (when element is absolutely positioned and has a non-body offset parent)', function () {
      var opts = { offsetTop: 20, offsetLeft: 0, setWidth: false, setHeight: false };

      var subMenu = $('sub_menu_2');
      var mainMenu = $('main_menu_2');

      subMenu.clonePosition(mainMenu, opts);
      var offset = subMenu.viewportOffset().top - mainMenu.viewportOffset().top;

      assert.equal(offset, 20);

      scrollTo(0, 300);

      subMenu.clonePosition(mainMenu, opts);
      offset = subMenu.viewportOffset().top - mainMenu.viewportOffset().top;
      assert.equal(offset, 20);
    });

    test('#clonePosition (when element has fixed position)', function () {
      var opts = { offsetTop: 20, offsetLeft: 0, setWidth: false, setHeight: false };

      var subMenu = $('sub_menu_3');
      var mainMenu = $('main_menu_3');

      subMenu.clonePosition(mainMenu, opts);
      var offset = subMenu.viewportOffset().top - mainMenu.viewportOffset().top;

      assert.equal(offset, 20);

      scrollTo(0, 300);

      subMenu.clonePosition(mainMenu, opts);
      offset = subMenu.viewportOffset().top - mainMenu.viewportOffset().top;
      assert.equal(offset, 20);

    });

    test('#clonePosition (when elements have the same size)', function() {
      var source = $('clone_position_source');
      var target = $('clone_position_target');

      target.clonePosition(source, {
        setHeight: false,
        offsetTop: source.offsetHeight
      });

      assert.equal(source.getWidth(),  target.getWidth());
      assert.equal(source.getHeight(), target.getHeight());
    });

  }); // Element

  suite('document.viewport', function () {

    test('#getDimensions', function (done) {
      this.timeout(5000);
      var original = document.viewport.getDimensions();

      try {
        window.resizeTo(800, 600);
      } catch (e) {
        info("Can't resize.");

        return done();
      }
      wait(1000, done, function() {
        var before = document.viewport.getDimensions();

        var delta = { width: 800 - before.width, height: 600 - before.height };

        window.resizeBy(50, 50);
        wait(1000, done, function() {
          var after = document.viewport.getDimensions();

          // Assume that JavaScript window resizing is disabled if before width
          // and after width are the same.
          if (before.width === after.width) {
            RESIZE_DISABLED = true;
            info("SKIPPING REMAINING TESTS (JavaScript window resizing disabled)");
            return done();
          }


          assert.equal(
            before.width + 50, after.width,
           "NOTE: YOU MUST ALLOW JAVASCRIPT TO RESIZE YOUR WINDOW FOR THIS TEST TO PASS"
         );
          assert.equal(
            before.height + 50, after.height,
           "NOTE: YOU MUST ALLOW JAVASCRIPT TO RESIZE YOUR WINDOW FOR THIS TEST TO PASS"
         );

          wait(1000, done, function() {
            // Restore original dimensions.
            window.resizeTo(
              original.width  + delta.width,
              original.height + delta.height
            );
            done();
          });
        });
      });
    });

    test('#getDimensions (should not affect document properties)', function () {
      // No properties on the document should be affected when resizing
      // an absolutely-positioned (0,0) element to viewport dimensions.
      var vd = document.viewport.getDimensions();

      var before = documentViewportProperties.inspect();
      $('elementToViewportDimensions').setStyle({ height: vd.height + 'px', width: vd.width + 'px' }).show();
      var after = documentViewportProperties.inspect();
      $('elementToViewportDimensions').hide();

      documentViewportProperties.properties.each(function(prop) {
        assert.equal(before[prop], after[prop], prop + ' was affected');
      });
    });

    test('#getScrollOffsets', function (done) {
      this.timeout(5000);
      var original = document.viewport.getDimensions();

      window.scrollTo(0, 0);
      assert.equal(0, document.viewport.getScrollOffsets().top);

      window.scrollTo(0, 35);
      assert.equal(35, document.viewport.getScrollOffsets().top);

      if (RESIZE_DISABLED) {
        info("SKIPPING REMAINING TESTS (JavaScript window resizing disabled)");
        done();
        return;
      }

      window.resizeTo(200, 650);

      wait(1000, done, function() {
        var before = document.viewport.getDimensions();
        var delta = { width: 200 - before.width, height: 650 - before.height };

        window.scrollTo(25, 35);
        assert.equal(25, document.viewport.getScrollOffsets().left,
         "NOTE: YOU MUST ALLOW JAVASCRIPT TO RESIZE YOUR WINDOW FOR THESE TESTS TO PASS");

        wait(1000, done, function() {
          // Restore original dimensions.
          window.resizeTo(
            original.width  + delta.width,
            original.height + delta.height
          );
          done();
        });
      });
    });

  }); // document.viewport

});
