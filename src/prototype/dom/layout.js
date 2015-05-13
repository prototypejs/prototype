(function() {

  // Converts a CSS percentage value to a decimal.
  // Ex: toDecimal("30%"); // -> 0.3
  function toDecimal(pctString) {
    var match = pctString.match(/^(\d+)%?$/i);
    if (!match) return null;
    return (Number(match[1]) / 100);
  }

  // A bare-bones version of Element.getStyle. Needed because getStyle is
  // public-facing and too user-friendly for our tastes. We need raw,
  // non-normalized values.
  //
  // Camel-cased property names only.
  function getRawStyle(element, style) {
    element = $(element);

    // Try inline styles first.
    var value = element.style[style];
    if (!value || value === 'auto') {
      // Reluctantly retrieve the computed style.
      var css = document.defaultView.getComputedStyle(element, null);
      value = css ? css[style] : null;
    }

    if (style === 'opacity') return value ? parseFloat(value) : 1.0;
    return value === 'auto' ? null : value;
  }

  function getRawStyle_IE(element, style) {
    // Try inline styles first.
    var value = element.style[style];
    if (!value && element.currentStyle) {
      // Reluctantly retrieve the current style.
      value = element.currentStyle[style];
    }
    return value;
  }

  // Quickly figures out the content width of an element. Used instead of
  // `element.measure('width')` in several places below; we don't want to
  // call back into layout code recursively if we don't have to.
  //
  // But this means it doesn't handle edge cases. Use it when you know the
  // element in question is visible and will give accurate measurements.
  function getContentWidth(element, context) {
    var boxWidth = element.offsetWidth;

    var bl = getPixelValue(element, 'borderLeftWidth',  context) || 0;
    var br = getPixelValue(element, 'borderRightWidth', context) || 0;
    var pl = getPixelValue(element, 'paddingLeft',      context) || 0;
    var pr = getPixelValue(element, 'paddingRight',     context) || 0;

    return boxWidth - bl - br - pl - pr;
  }

  if (!Object.isUndefined(document.documentElement.currentStyle) && !Prototype.Browser.Opera) {
    getRawStyle = getRawStyle_IE;
  }


  // Can be called like this:
  //   getPixelValue("11px");
  // Or like this:
  //   getPixelValue(someElement, 'paddingTop');
  function getPixelValue(value, property, context) {
    var element = null;
    if (Object.isElement(value)) {
      element = value;
      value = getRawStyle(element, property);
    }

    if (value === null || Object.isUndefined(value)) {
      return null;
    }

    // Non-IE browsers will always return pixels if possible.
    // (We use parseFloat instead of parseInt because Firefox can return
    // non-integer pixel values.)
    if ((/^(?:-)?\d+(\.\d+)?(px)?$/i).test(value)) {
      return window.parseFloat(value);
    }

    var isPercentage = value.include('%'), isViewport = (context === document.viewport);

    // When IE gives us something other than a pixel value, this technique
    // (invented by Dean Edwards) will convert it to pixels.
    //
    // (This doesn't work for percentage values on elements with `position: fixed`
    // because those percentages are relative to the viewport.)
    if (/\d/.test(value) && element && element.runtimeStyle && !(isPercentage && isViewport)) {
      var style = element.style.left, rStyle = element.runtimeStyle.left;
      element.runtimeStyle.left = element.currentStyle.left;
      element.style.left = value || 0;
      value = element.style.pixelLeft;
      element.style.left = style;
      element.runtimeStyle.left = rStyle;

      return value;
    }

    // For other browsers, we have to do a bit of work.
    // (At this point, only percentages should be left; all other CSS units
    // are converted to pixels by getComputedStyle.)
    if (element && isPercentage) {
      // The `context` argument comes into play for percentage units; it's
      // the thing that the unit represents a percentage of. When an
      // absolutely-positioned element has a width of 50%, we know that's
      // 50% of its offset parent. If it's `position: fixed` instead, we know
      // it's 50% of the viewport. And so on.
      context = context || element.parentNode;
      var decimal = toDecimal(value), whole = null;

      var isHorizontal = property.include('left') || property.include('right') ||
       property.include('width');

      var isVertical   = property.include('top') || property.include('bottom') ||
        property.include('height');

      if (context === document.viewport) {
        if (isHorizontal) {
          whole = document.viewport.getWidth();
        } else if (isVertical) {
          whole = document.viewport.getHeight();
        }
      } else {
        if (isHorizontal) {
          whole = $(context).measure('width');
        } else if (isVertical) {
          whole = $(context).measure('height');
        }
      }

      return (whole === null) ? 0 : whole * decimal;
    }

    // If we get this far, we should probably give up.
    return 0;
  }

  // Turns plain numbers into pixel measurements.
  function toCSSPixels(number) {
    if (Object.isString(number) && number.endsWith('px'))
      return number;
    return number + 'px';
  }

  // Shortcut for figuring out if an element is `display: none` or not.
  function isDisplayed(element) {
    while (element && element.parentNode) {
      var display = element.getStyle('display');
      if (display === 'none') {
        return false;
      }
      element = $(element.parentNode);
    }
    return true;
  }

  // In IE6-7, positioned elements often need hasLayout triggered before they
  // report accurate measurements.
  var hasLayout = Prototype.K;
  if ('currentStyle' in document.documentElement) {
    hasLayout = function(element) {
      if (!element.currentStyle.hasLayout) {
        element.style.zoom = 1;
      }
      return element;
    };
  }

  // Converts the layout hash property names back to the CSS equivalents.
  // For now, only the border properties differ.
  function cssNameFor(key) {
    if (key.include('border')) key = key + '-width';
    return key.camelize();
  }

  /**
   *  class Element.Layout < Hash
   *
   *  A set of key/value pairs representing measurements of various
   *  dimensions of an element.
   *
   *  <h4>Overview</h4>
   *
   *  The `Element.Layout` class is a specialized way to measure elements.
   *  It helps mitigate:
   *
   *  * The convoluted steps often needed to get common measurements for
   *    elements.
   *  * The tendency of browsers to report measurements in non-pixel units.
   *  * The quirks that lead some browsers to report inaccurate measurements.
   *  * The difficulty of measuring elements that are hidden.
   *
   *  <h4>Usage</h4>
   *
   *  Instantiate an `Element.Layout` class by passing an element into the
   *  constructor:
   *
   *      var layout = new Element.Layout(someElement);
   *
   *  You can also use [[Element.getLayout]], if you prefer.
   *
   *  Once you have a layout object, retrieve properties using [[Hash]]'s
   *  familiar `get` and `set` syntax.
   *
   *      layout.get('width');  //-> 400
   *      layout.get('top');    //-> 180
   *
   *  The following are the CSS-related properties that can be retrieved.
   *  Nearly all of them map directly to their property names in CSS. (The
   *  only exception is for borders — e.g., `border-left` instead of
   *  `border-left-width`.)
   *
   *  * `height`
   *  * `width`
   *  * `top`
   *  * `left`
   *  * `right`
   *  * `bottom`
   *  * `border-left`
   *  * `border-right`
   *  * `border-top`
   *  * `border-bottom`
   *  * `padding-left`
   *  * `padding-right`
   *  * `padding-top`
   *  * `padding-bottom`
   *  * `margin-top`
   *  * `margin-bottom`
   *  * `margin-left`
   *  * `margin-right`
   *
   *  In addition, these "composite" properties can be retrieved:
   *
   *  * `padding-box-width` (width of the content area, from the beginning of
   *    the left padding to the end of the right padding)
   *  * `padding-box-height` (height of the content area, from the beginning
   *    of the top padding to the end of the bottom padding)
   *  * `border-box-width` (width of the content area, from the outer edge of
   *    the left border to the outer edge of the right border)
   *  * `border-box-height` (height of the content area, from the outer edge
   *    of the top border to the outer edge of the bottom border)
   *  * `margin-box-width` (width of the content area, from the beginning of
   *    the left margin to the end of the right margin)
   *  * `margin-box-height` (height of the content area, from the beginning
   *    of the top margin to the end of the bottom margin)
   *
   *  <h4>Caching</h4>
   *
   *  Because these properties can be costly to retrieve, `Element.Layout`
   *  behaves differently from an ordinary [[Hash]].
   *
   *  First: by default, values are "lazy-loaded" — they aren't computed
   *  until they're retrieved. To measure all properties at once, pass
   *  a second argument into the constructor:
   *
   *      var layout = new Element.Layout(someElement, true);
   *
   *  Second: once a particular value is computed, it's cached. Asking for
   *  the same property again will return the original value without
   *  re-computation. This means that **an instance of `Element.Layout`
   *  becomes stale when the element's dimensions change**. When this
   *  happens, obtain a new instance.
   *
   *  <h4>Hidden elements</h4>
   *
   *  Because it's a common case to want the dimensions of a hidden element
   *  (e.g., for animations), it's possible to measure elements that are
   *  hidden with `display: none`.
   *
   *  However, **it's only possible to measure a hidden element if its parent
   *  is visible**. If its parent (or any other ancestor) is hidden, any
   *  width and height measurements will return `0`, as will measurements for
   *  `top|bottom|left|right`.
   *
  **/
  Element.Layout = Class.create(Hash, {
    /**
     *  new Element.Layout(element[, preCompute = false])
     *  - element (Element): The element to be measured.
     *  - preCompute (Boolean): Whether to compute all values at once. Default
     *    is `false`.
     *
     *  Declare a new layout hash.
     *
     *  The `preCompute` argument determines whether measurements will be
     *  lazy-loaded or not. If you plan to use many different measurements,
     *  it's often more performant to pre-compute, as it minimizes the
     *  amount of overhead needed to measure. If you need only one or two
     *  measurements, it's probably not worth it.
    **/
    initialize: function($super, element, preCompute) {
      $super();
      this.element = $(element);

      // nullify all properties keys
      Element.Layout.PROPERTIES.each( function(property) {
        this._set(property, null);
      }, this);

      // The 'preCompute' boolean tells us whether we should fetch all values
      // at once. If so, we should do setup/teardown only once. We set a flag
      // so that we can ignore calls to `_begin` and `_end` elsewhere.
      if (preCompute) {
        this._preComputing = true;
        this._begin();
        Element.Layout.PROPERTIES.each( this._compute, this );
        this._end();
        this._preComputing = false;
      }
    },

    _set: function(property, value) {
      return Hash.prototype.set.call(this, property, value);
    },

    // TODO: Investigate.
    set: function(property, value) {
      throw "Properties of Element.Layout are read-only.";
    },

    /**
     *  Element.Layout#get(property) -> Number
     *  - property (String): One of the properties defined in
     *    [[Element.Layout.PROPERTIES]].
     *
     *  Retrieve the measurement specified by `property`. Will throw an error
     *  if the property is invalid.
     *
     *  ##### Caveats
     *
     *  * `Element.Layout` can measure the dimensions of an element hidden with
     *    CSS (`display: none`), but _only_ if its parent element is visible.
    **/
    get: function($super, property) {
      // Try to fetch from the cache.
      var value = $super(property);
      return value === null ? this._compute(property) : value;
    },

    // `_begin` and `_end` are two functions that are called internally
    // before and after any measurement is done. In certain conditions (e.g.,
    // when hidden), elements need a "preparation" phase that ensures
    // accuracy of measurements.
    _begin: function() {
      if (this._isPrepared()) return;

      var element = this.element;
      if (isDisplayed(element)) {
        this._setPrepared(true);
        return;
      }

      // If we get this far, it means this element is hidden. To get usable
      // measurements, we must remove `display: none`, but in a manner that
      // isn't noticeable to the user. That means we also set
      // `visibility: hidden` to make it invisible, and `position: absolute`
      // so that it won't alter the document flow when displayed.
      //
      // Once we do this, the element is "prepared," and we can make our
      // measurements. When we're done, the `_end` method cleans up our
      // changes.

      // Remember the original values for some styles we're going to alter.
      var originalStyles = {
        position:   element.style.position   || '',
        width:      element.style.width      || '',
        visibility: element.style.visibility || '',
        display:    element.style.display    || ''
      };

      // We store them so that the `_end` method can retrieve them later.
      element.store('prototype_original_styles', originalStyles);

      var position = getRawStyle(element, 'position'), width = element.offsetWidth;

      if (width === 0 || width === null) {
        // Opera/IE won't report the true width of the element through
        // `getComputedStyle` if it's hidden. If we got a nonsensical value,
        // we need to show the element and try again.
        element.style.display = 'block';
        width = element.offsetWidth;
      }

      // Preserve the context in case we get a percentage value.
      var context = (position === 'fixed') ? document.viewport :
       element.parentNode;

      var tempStyles = {
        visibility: 'hidden',
        display:    'block'
      };

      // If the element's `position: fixed`, it's already out of the document
      // flow, so it's both unnecessary and inaccurate to set
      // `position: absolute`.
      if (position !== 'fixed') tempStyles.position = 'absolute';

      element.setStyle(tempStyles);

      var positionedWidth = element.offsetWidth, newWidth;
      if (width && (positionedWidth === width)) {
        // If the element's width is the same both before and after
        // we set absolute positioning, that means:
        //  (a) it was already absolutely-positioned; or
        //  (b) it has an explicitly-set width, instead of width: auto.
        // Either way, it means the element is the width it needs to be
        // in order to report an accurate height.
        newWidth = getContentWidth(element, context);
      } else if (position === 'absolute' || position === 'fixed') {
        // Absolute- and fixed-position elements' dimensions don't depend
        // upon those of their parents.
        newWidth = getContentWidth(element, context);
      } else {
        // Otherwise, the element's width depends upon the width of its
        // parent.
        var parent = element.parentNode, pLayout = $(parent).getLayout();

        newWidth = pLayout.get('width') -
         this.get('margin-left') -
         this.get('border-left') -
         this.get('padding-left') -
         this.get('padding-right') -
         this.get('border-right') -
         this.get('margin-right');
      }

      // Whatever the case, we've now figured out the correct `width` value
      // for the element.
      element.setStyle({ width: newWidth + 'px' });

      // The element is now ready for measuring.
      this._setPrepared(true);
    },

    _end: function() {
      var element = this.element;
      var originalStyles = element.retrieve('prototype_original_styles');
      element.store('prototype_original_styles', null);
      element.setStyle(originalStyles);
      this._setPrepared(false);
    },

    _compute: function(property) {
      var COMPUTATIONS = Element.Layout.COMPUTATIONS;
      if (!(property in COMPUTATIONS)) {
        throw "Property not found.";
      }

      return this._set(property, COMPUTATIONS[property].call(this, this.element));
    },

    _isPrepared: function() {
      return this.element.retrieve('prototype_element_layout_prepared', false);
    },

    _setPrepared: function(bool) {
      return this.element.store('prototype_element_layout_prepared', bool);
    },

    /**
     *  Element.Layout#toObject([keys...]) -> Object
     *  - keys (String): A space-separated list of keys to include.
     *
     *  Converts the layout hash to a plain object of key/value pairs,
     *  optionally including only the given keys.
     *
     *  Keys can be passed into this method as individual arguments _or_
     *  separated by spaces within a string.
     *
     *      // Equivalent statements:
     *      someLayout.toObject('top', 'bottom', 'left', 'right');
     *      someLayout.toObject('top bottom left right');
    **/
    toObject: function() {
      var args = $A(arguments);
      var keys = (args.length === 0) ? Element.Layout.PROPERTIES :
       args.join(' ').split(' ');
      var obj = {};
      keys.each( function(key) {
        // Key needs to be a valid Element.Layout property.
        if (!Element.Layout.PROPERTIES.include(key)) return;
        var value = this.get(key);
        if (value != null) obj[key] = value;
      }, this);
      return obj;
    },

    /**
     *  Element.Layout#toHash([keys...]) -> Hash
     *  - keys (String): A space-separated list of keys to include.
     *
     *  Converts the layout hash to an ordinary hash of key/value pairs,
     *  optionally including only the given keys.
     *
     *  Keys can be passed into this method as individual arguments _or_
     *  separated by spaces within a string.
     *
     *      // Equivalent statements:
     *      someLayout.toHash('top', 'bottom', 'left', 'right');
     *      someLayout.toHash('top bottom left right');
    **/
    toHash: function() {
      var obj = this.toObject.apply(this, arguments);
      return new Hash(obj);
    },

    /**
     *  Element.Layout#toCSS([keys...]) -> Object
     *  - keys (String): A space-separated list of keys to include.
     *
     *  Converts the layout hash to a plain object of CSS property/value
     *  pairs, optionally including only the given keys.
     *
     *  Keys can be passed into this method as individual arguments _or_
     *  separated by spaces within a string.
     *
     *      // Equivalent statements:
     *      someLayout.toCSS('top', 'bottom', 'left', 'right');
     *      someLayout.toCSS('top bottom left right');
     *
     *  Useful for passing layout properties to [[Element.setStyle]].
    **/
    toCSS: function() {
      var args = $A(arguments);
      var keys = (args.length === 0) ? Element.Layout.PROPERTIES :
       args.join(' ').split(' ');
      var css = {};

      keys.each( function(key) {
        // Key needs to be a valid Element.Layout property...
        if (!Element.Layout.PROPERTIES.include(key)) return;
        // ...but not a composite property.
        if (Element.Layout.COMPOSITE_PROPERTIES.include(key)) return;

        var value = this.get(key);
        if (value != null) css[cssNameFor(key)] = value + 'px';
      }, this);
      return css;
    },

    inspect: function() {
      return "#<Element.Layout>";
    }
  });

  Object.extend(Element.Layout, {
    /**
     *  Element.Layout.PROPERTIES = Array
     *
     *  A list of all measurable properties.
    **/
    PROPERTIES: $w('height width top left right bottom border-left border-right border-top border-bottom padding-left padding-right padding-top padding-bottom margin-top margin-bottom margin-left margin-right padding-box-width padding-box-height border-box-width border-box-height margin-box-width margin-box-height'),

    /**
     *  Element.Layout.COMPOSITE_PROPERTIES = Array
     *
     *  A list of all composite properties. Composite properties don't map
     *  directly to CSS properties — they're combinations of other
     *  properties.
    **/
    COMPOSITE_PROPERTIES: $w('padding-box-width padding-box-height margin-box-width margin-box-height border-box-width border-box-height'),

    COMPUTATIONS: {
      'height': function(element) {
        if (!this._preComputing) this._begin();

        var bHeight = this.get('border-box-height');
        if (bHeight <= 0) {
          if (!this._preComputing) this._end();
          return 0;
        }

        var bTop = this.get('border-top'),
         bBottom = this.get('border-bottom');

        var pTop = this.get('padding-top'),
         pBottom = this.get('padding-bottom');

        if (!this._preComputing) this._end();

        return bHeight - bTop - bBottom - pTop - pBottom;
      },

      'width': function(element) {
        if (!this._preComputing) this._begin();

        var bWidth = this.get('border-box-width');
        if (bWidth <= 0) {
          if (!this._preComputing) this._end();
          return 0;
        }

        var bLeft = this.get('border-left'),
         bRight = this.get('border-right');

        var pLeft = this.get('padding-left'),
         pRight = this.get('padding-right');

        if (!this._preComputing) this._end();
        return bWidth - bLeft - bRight - pLeft - pRight;
      },

      'padding-box-height': function(element) {
        var height = this.get('height'),
         pTop = this.get('padding-top'),
         pBottom = this.get('padding-bottom');

        return height + pTop + pBottom;
      },

      'padding-box-width': function(element) {
        var width = this.get('width'),
         pLeft = this.get('padding-left'),
         pRight = this.get('padding-right');

        return width + pLeft + pRight;
      },

      'border-box-height': function(element) {
        if (!this._preComputing) this._begin();
        var height = element.offsetHeight;
        if (!this._preComputing) this._end();
        return height;
      },

      'border-box-width': function(element) {
        if (!this._preComputing) this._begin();
        var width = element.offsetWidth;
        if (!this._preComputing) this._end();
        return width;
      },

      'margin-box-height': function(element) {
        var bHeight = this.get('border-box-height'),
         mTop = this.get('margin-top'),
         mBottom = this.get('margin-bottom');

        if (bHeight <= 0) return 0;

        return bHeight + mTop + mBottom;
      },

      'margin-box-width': function(element) {
        var bWidth = this.get('border-box-width'),
         mLeft = this.get('margin-left'),
         mRight = this.get('margin-right');

        if (bWidth <= 0) return 0;

        return bWidth + mLeft + mRight;
      },

      'top': function(element) {
        var offset = element.positionedOffset();
        return offset.top;
      },

      'bottom': function(element) {
        var offset = element.positionedOffset(),
         parent = element.getOffsetParent(),
         pHeight = parent.measure('height');

        var mHeight = this.get('border-box-height');

        return pHeight - mHeight - offset.top;
        //
        // return getPixelValue(element, 'bottom');
      },

      'left': function(element) {
        var offset = element.positionedOffset();
        return offset.left;
      },

      'right': function(element) {
        var offset = element.positionedOffset(),
         parent = element.getOffsetParent(),
         pWidth = parent.measure('width');

        var mWidth = this.get('border-box-width');

        return pWidth - mWidth - offset.left;
        //
        // return getPixelValue(element, 'right');
      },

      'padding-top': function(element) {
        return getPixelValue(element, 'paddingTop');
      },

      'padding-bottom': function(element) {
        return getPixelValue(element, 'paddingBottom');
      },

      'padding-left': function(element) {
        return getPixelValue(element, 'paddingLeft');
      },

      'padding-right': function(element) {
        return getPixelValue(element, 'paddingRight');
      },

      'border-top': function(element) {
        return getPixelValue(element, 'borderTopWidth');
      },

      'border-bottom': function(element) {
        return getPixelValue(element, 'borderBottomWidth');
      },

      'border-left': function(element) {
        return getPixelValue(element, 'borderLeftWidth');
      },

      'border-right': function(element) {
        return getPixelValue(element, 'borderRightWidth');
      },

      'margin-top': function(element) {
        return getPixelValue(element, 'marginTop');
      },

      'margin-bottom': function(element) {
        return getPixelValue(element, 'marginBottom');
      },

      'margin-left': function(element) {
        return getPixelValue(element, 'marginLeft');
      },

      'margin-right': function(element) {
        return getPixelValue(element, 'marginRight');
      }
    }
  });

  // An easier way to compute right and bottom offsets.
  if ('getBoundingClientRect' in document.documentElement) {
    Object.extend(Element.Layout.COMPUTATIONS, {
      'right': function(element) {
        var parent = hasLayout(element.getOffsetParent());
        var rect = element.getBoundingClientRect(),
         pRect = parent.getBoundingClientRect();

        return (pRect.right - rect.right).round();
      },

      'bottom': function(element) {
        var parent = hasLayout(element.getOffsetParent());
        var rect = element.getBoundingClientRect(),
         pRect = parent.getBoundingClientRect();

        return (pRect.bottom - rect.bottom).round();
      }
    });
  }

  /**
   *  class Element.Offset
   *
   *  A representation of the top- and left-offsets of an element relative to
   *  another.
   *
   *  All methods that compute offsets return an instance of `Element.Offset`.
   *
  **/
  Element.Offset = Class.create({
    /**
     *  new Element.Offset(left, top)
     *
     *  Instantiates an [[Element.Offset]]. You shouldn't need to call this
     *  directly.
    **/
    initialize: function(left, top) {
      this.left = left.round();
      this.top  = top.round();

      // Act like an array.
      this[0] = this.left;
      this[1] = this.top;
    },

    /**
     *  Element.Offset#relativeTo(offset) -> Element.Offset
     *  - offset (Element.Offset): Another offset to compare to.
     *
     *  Returns a new [[Element.Offset]] with its origin at the given
     *  `offset`. Useful for determining an element's distance from another
     *  arbitrary element.
    **/
    relativeTo: function(offset) {
      return new Element.Offset(
        this.left - offset.left,
        this.top  - offset.top
      );
    },

    /**
     *  Element.Offset#inspect() -> String
     *
     *  Returns a debug-friendly representation of the offset.
    **/
    inspect: function() {
      return "#<Element.Offset left: #{left} top: #{top}>".interpolate(this);
    },

    /**
     *  Element.Offset#toString() -> String
    **/
    toString: function() {
      return "[#{left}, #{top}]".interpolate(this);
    },

    /**
     *  Element.Offset#toArray() -> Array
     *
     *  Returns an array representation fo the offset in [x, y] format.
    **/
    toArray: function() {
      return [this.left, this.top];
    }
  });

  /**
   *  Element.getLayout(@element[, preCompute = false]) -> Element.Layout
   *  - element (Element): The element to be measured.
   *  - preCompute (Boolean): Whether to compute all values at once. Default
   *    is `false`.
   *
   *  Returns an instance of [[Element.Layout]] for measuring an element's
   *  dimensions.
   *
   *  Note that this method returns a _new_ `Element.Layout` object each time
   *  it's called. If you want to take advantage of measurement caching,
   *  retain a reference to one `Element.Layout` object, rather than calling
   *  `Element.getLayout` whenever you need a measurement. You should call
   *  `Element.getLayout` again only when the values in an existing
   *  `Element.Layout` object have become outdated.
   *
   *  If the `preCompute` argument is `true`, all properties will be measured
   *  when the layout object is instantiated. If you plan to measure several
   *  properties of an element's dimensions, it's probably worth it to get a
   *  pre-computed hash.
   *
   *  ##### Examples
   *
   *      var layout = $('troz').getLayout();
   *
   *      layout.get('width');  //-> 150
   *      layout.get('height'); //-> 500
   *      layout.get('padding-left');  //-> 10
   *      layout.get('margin-left');   //-> 25
   *      layout.get('border-top');    //-> 5
   *      layout.get('border-bottom'); //-> 5
   *
   *      // Won't re-compute width; remembers value from first time.
   *      layout.get('width');  //-> 150
   *
   *      // Composite values obtained by adding together other properties;
   *      // will re-use any values we've already looked up above.
   *      layout.get('padding-box-width'); //-> 170
   *      layout.get('border-box-height'); //-> 510
   *
   *  ##### Caveats
   *
   *  * Instances of `Element.Layout` can measure the dimensions of an
   *    element hidden with CSS (`display: none`), but _only_ if its parent
   *    element is visible.
  **/
  function getLayout(element, preCompute) {
    return new Element.Layout(element, preCompute);
  }

  /**
   *  Element.measure(@element, property) -> Number
   *
   *  Gives the pixel value of `element`'s dimension specified by
   *  `property`.
   *
   *  Useful for one-off measurements of elements. If you find yourself
   *  calling this method frequently over short spans of code, you might want
   *  to call [[Element.getLayout]] and operate on the [[Element.Layout]]
   *  object itself (thereby taking advantage of measurement caching).
   *
   *  ##### Examples
   *
   *      $('troz').measure('width'); //-> 150
   *      $('troz').measure('border-top'); //-> 5
   *      $('troz').measure('top'); //-> 226
   *
   *  ##### Caveats
   *
   *  * `Element.measure` can measure the dimensions of an element hidden with
   *    CSS (`display: none`), but _only_ if its parent element is visible.
  **/
  function measure(element, property) {
    return $(element).getLayout().get(property);
  }

  /**
   *  Element.getHeight(@element) -> Number
   *
   *  Returns the height of `element`.
   *
   *  This method returns correct values on elements whose display is set to
   *  `none` either in an inline style rule or in an CSS stylesheet.
   *
   *  For performance reasons, if you need to query both width _and_ height of
   *  `element`, you should consider using [[Element.getDimensions]] instead.
   *
   *  Note that the value returned is a _number only_ although it is
   *  _expressed in pixels_.
   *
   *  ##### Examples
   *
   *      language: html
   *      <div id="rectangle" style="font-size: 10px; width: 20em; height: 10em"></div>
   *
   *  Then:
   *
   *      $('rectangle').getHeight();
   *      // -> 100
  **/
  function getHeight(element) {
    return Element.getDimensions(element).height;
  }

  /**
   *  Element.getWidth(@element) -> Number
   *
   *  Returns the width of `element`.
   *
   *  This method returns correct values on elements whose display is set to
   *  `none` either in an inline style rule or in an CSS stylesheet.
   *
   *  For performance reasons, if you need to query both width _and_ height of
   *  `element`, you should consider using [[Element.getDimensions]] instead.
   *
   *  Note that the value returned is a _number only_ although it is
   *  _expressed in pixels_.
   *
   *  ##### Examples
   *
   *      language: html
   *      <div id="rectangle" style="font-size: 10px; width: 20em; height: 10em"></div>
   *
   *  Then:
   *
   *      $('rectangle').getWidth();
   *      // -> 200
  **/
  function getWidth(element) {
    return Element.getDimensions(element).width;
  }

  /**
   *  Element.getDimensions(@element) -> Object
   *
   *  Finds the computed width and height of `element` and returns them as
   *  key/value pairs of an object.
   *
   *  For backwards-compatibility, these dimensions represent the dimensions
   *  of the element's "border box" (including CSS padding and border). This
   *  is equivalent to the built-in `offsetWidth` and `offsetHeight`
   *  browser properties.
   *
   *  Note that all values are returned as _numbers only_ although they are
   *  _expressed in pixels_.
   *
   *  ##### Caveats
   *
   *  * If the element is hidden via `display: none` in CSS, this method will
   *    attempt to measure the element by temporarily removing that CSS and
   *    applying `visibility: hidden` and `position: absolute`. This gives
   *    the element dimensions without making it visible or affecting the
   *    positioning of surrounding elements &mdash; but may not give accurate
   *    results in some cases. [[Element.measure]] is designed to give more
   *    accurate results.
   *
   *  * In order to avoid calling the method twice, you should consider
   *    caching the returned values in a variable, as shown in the example
   *    below.
   *
   *  * For more complex use cases, use [[Element.measure]], which is able
   *    to measure many different aspects of an element's dimensions and
   *    offsets.
   *
   *  ##### Examples
   *
   *      language: html
   *      <div id="rectangle" style="font-size: 10px; width: 20em; height: 10em"></div>
   *
   *  Then:
   *
   *      var dimensions = $('rectangle').getDimensions();
   *      // -> {width: 200, height: 100}
   *
   *      dimensions.width;
   *      // -> 200
   *
   *      dimensions.height;
   *      // -> 100
  **/
  function getDimensions(element) {
    element = $(element);
    var display = Element.getStyle(element, 'display');

    if (display && display !== 'none') {
      return { width: element.offsetWidth, height: element.offsetHeight };
    }

    // All *Width and *Height properties give 0 on elements with
    // `display: none`, so show the element temporarily.
    var style = element.style;
    var originalStyles = {
      visibility: style.visibility,
      position:   style.position,
      display:    style.display
    };

    var newStyles = {
      visibility: 'hidden',
      display:    'block'
    };

    // Switching `fixed` to `absolute` causes issues in Safari.
    if (originalStyles.position !== 'fixed')
      newStyles.position = 'absolute';

    Element.setStyle(element, newStyles);

    var dimensions = {
      width:  element.offsetWidth,
      height: element.offsetHeight
    };

    Element.setStyle(element, originalStyles);

    return dimensions;
  }

  /**
   *  Element.getOffsetParent(@element) -> Element
   *
   *  Returns `element`'s closest _positioned_ ancestor. If none is found, the
   *  `body` element is returned.
  **/
  function getOffsetParent(element) {
    element = $(element);

    // Ensure we never return the root HTML tag.
    function selfOrBody(element) {
      return isHtml(element) ? $(document.body) : $(element);
    }

    // For unusual cases like these, we standardize on returning the BODY
    // element as the offset parent.
    if (isDocument(element) || isDetached(element) || isBody(element) || isHtml(element))
      return $(document.body);

    // IE reports offset parent incorrectly for inline elements.
    var isInline = (Element.getStyle(element, 'display') === 'inline');
    if (!isInline && element.offsetParent) return selfOrBody(element.offsetParent);

    while ((element = element.parentNode) && element !== document.body) {
      if (Element.getStyle(element, 'position') !== 'static') {
        return selfOrBody(element);
      }
    }

    return $(document.body);
  }


  /**
   *  Element.cumulativeOffset(@element) -> Element.Offset
   *
   *  Returns the offsets of `element` from the top left corner of the
   *  document.
  **/
  function cumulativeOffset(element) {
    element = $(element);
    var valueT = 0, valueL = 0;
    if (element.parentNode) {
      do {
        valueT += element.offsetTop  || 0;
        valueL += element.offsetLeft || 0;
        element = element.offsetParent;
      } while (element);
    }
    return new Element.Offset(valueL, valueT);
  }

  /**
   *  Element.positionedOffset(@element) -> Element.Offset
   *
   *  Returns `element`'s offset relative to its closest positioned ancestor
   *  (the element that would be returned by [[Element.getOffsetParent]]).
  **/
  function positionedOffset(element) {
    element = $(element);

    // Account for the margin of the element.
    var layout = element.getLayout();

    var valueT = 0, valueL = 0;
    do {
      valueT += element.offsetTop  || 0;
      valueL += element.offsetLeft || 0;
      element = element.offsetParent;
      if (element) {
        if (isBody(element)) break;
        var p = Element.getStyle(element, 'position');
        if (p !== 'static') break;
      }
    } while (element);

    valueL -= layout.get('margin-left');
    valueT -= layout.get('margin-top');

    return new Element.Offset(valueL, valueT);
  }

  /**
   *  Element.cumulativeScrollOffset(@element) -> Element.Offset
   *
   *  Calculates the cumulative scroll offset of an element in nested
   *  scrolling containers.
  **/
  function cumulativeScrollOffset(element) {
    var valueT = 0, valueL = 0;
    do {
      if (element === document.body) {
        var bodyScrollNode = document.documentElement || document.body.parentNode || document.body;
        valueT += !Object.isUndefined(window.pageYOffset) ? window.pageYOffset : bodyScrollNode.scrollTop || 0;
        valueL += !Object.isUndefined(window.pageXOffset) ? window.pageXOffset : bodyScrollNode.scrollLeft || 0;
        break;
      } else {
        valueT += element.scrollTop  || 0;
        valueL += element.scrollLeft || 0;
        element = element.parentNode;
      }
    } while (element);
    return new Element.Offset(valueL, valueT);
  }

  /**
   *  Element.viewportOffset(@element) -> Element.Offset
   *
   *  Returns the X/Y coordinates of element relative to the viewport.
  **/
  function viewportOffset(forElement) {
    var valueT = 0, valueL = 0, docBody = document.body;

    forElement = $(forElement);
    var element = forElement;
    do {
      valueT += element.offsetTop  || 0;
      valueL += element.offsetLeft || 0;
      // Safari fix
      if (element.offsetParent == docBody &&
        Element.getStyle(element, 'position') == 'absolute') break;
    } while (element = element.offsetParent);

    element = forElement;
    do {
      // Opera < 9.5 sets scrollTop/Left on both HTML and BODY elements.
      // Other browsers set it only on the HTML element. The BODY element
      // can be skipped since its scrollTop/Left should always be 0.
      if (element != docBody) {
        valueT -= element.scrollTop  || 0;
        valueL -= element.scrollLeft || 0;
      }
    } while (element = element.parentNode);
    return new Element.Offset(valueL, valueT);
  }

  /**
   *  Element.absolutize(@element) -> Element
   *
   *  Turns `element` into an absolutely-positioned element _without_
   *  changing its position in the page layout.
  **/
  function absolutize(element) {
    element = $(element);

    if (Element.getStyle(element, 'position') === 'absolute') {
      return element;
    }

    var offsetParent = getOffsetParent(element);
    var eOffset = element.viewportOffset(),
     pOffset = offsetParent.viewportOffset();

    var offset = eOffset.relativeTo(pOffset);
    var layout = element.getLayout();

    element.store('prototype_absolutize_original_styles', {
      position: element.getStyle('position'),
      left:     element.getStyle('left'),
      top:      element.getStyle('top'),
      width:    element.getStyle('width'),
      height:   element.getStyle('height')
    });

    element.setStyle({
      position: 'absolute',
      top:    offset.top + 'px',
      left:   offset.left + 'px',
      width:  layout.get('width') + 'px',
      height: layout.get('height') + 'px'
    });

    return element;
  }

  /**
   *  Element.relativize(@element) -> Element
   *
   *  Turns `element` into a relatively-positioned element without changing
   *  its position in the page layout.
   *
   *  Used to undo a call to [[Element.absolutize]].
  **/
  function relativize(element) {
    element = $(element);
    if (Element.getStyle(element, 'position') === 'relative') {
      return element;
    }

    // Restore the original styles as captured by Element#absolutize.
    var originalStyles =
     element.retrieve('prototype_absolutize_original_styles');

    if (originalStyles) element.setStyle(originalStyles);
    return element;
  }


  /**
   *  Element.scrollTo(@element) -> Element
   *
   *  Scrolls the window so that `element` appears at the top of the viewport.
   *
   *  This has a similar effect than what would be achieved using
   *  [HTML anchors](http://www.w3.org/TR/html401/struct/links.html#h-12.2.3)
   *  (except the browser's history is not modified).
   *
   *  ##### Example
   *
   *      $(element).scrollTo();
   *      // -> Element
  **/
  function scrollTo(element) {
    element = $(element);
    var pos = Element.cumulativeOffset(element);
    window.scrollTo(pos.left, pos.top);
    return element;
  }


  /**
   *  Element.makePositioned(@element) -> Element
   *
   *  Allows for the easy creation of a CSS containing block by setting
   *  `element`'s CSS `position` to `relative` if its initial position is
   *  either `static` or `undefined`.
   *
   *  To revert back to `element`'s original CSS position, use
   *  [[Element.undoPositioned]].
  **/
  function makePositioned(element) {
    element = $(element);
    var position = Element.getStyle(element, 'position'), styles = {};
    if (position === 'static' || !position) {
      styles.position = 'relative';
      // When an element is `position: relative` with an undefined `top` and
      // `left`, Opera returns the offset relative to positioning context.
      if (Prototype.Browser.Opera) {
        styles.top  = 0;
        styles.left = 0;
      }
      Element.setStyle(element, styles);
      Element.store(element, 'prototype_made_positioned', true);
    }
    return element;
  }

  /**
   *  Element.undoPositioned(@element) -> Element
   *
   *  Sets `element` back to the state it was in _before_
   *  [[Element.makePositioned]] was applied to it.
   *
   *  `element`'s absolutely positioned children will now have their positions
   *  set relatively to `element`'s nearest ancestor with a CSS `position` of
   *  `'absolute'`, `'relative'` or `'fixed'`.
  **/
  function undoPositioned(element) {
    element = $(element);
    var storage = Element.getStorage(element),
     madePositioned = storage.get('prototype_made_positioned');

    if (madePositioned) {
      storage.unset('prototype_made_positioned');
      Element.setStyle(element, {
        position: '',
        top:      '',
        bottom:   '',
        left:     '',
        right:    ''
      });
    }
    return element;
  }

  /**
   *  Element.makeClipping(@element) -> Element
   *
   *  Simulates the poorly-supported CSS `clip` property by setting `element`'s
   *  `overflow` value to `hidden`.
   *
   *  To undo clipping, use [[Element.undoClipping]].
   *
   *  The visible area is determined by `element`'s width and height.
   *
   *  ##### Example
   *
   *      language:html
   *      <div id="framer">
   *        <img src="/assets/2007/1/14/chairs.jpg" alt="example" />
   *      </div>
   *
   *  Then:
   *
   *      $('framer').makeClipping().setStyle({width: '100px', height: '100px'});
   *      // -> Element
   *
   *  Another example:
   *
   *      language: html
   *      <a id="clipper" href="#">Click me to try it out.</a>
   *
   *      <div id="framer">
   *        <img src="/assets/2007/2/24/chairs.jpg" alt="example" />
   *      </div>
   *
   *      <script type="text/javascript" charset="utf-8">
   *        var Example = {
   *          clip: function(){
   *            $('clipper').update('undo clipping!');
   *            $('framer').makeClipping().setStyle({width: '100px', height: '100px'});
   *          },
   *          unClip: function(){
   *            $('clipper').update('clip!');
   *            $('framer').undoClipping();
   *          },
   *          toggleClip: function(event){
   *            if ($('clipper').innerHTML == 'undo clipping!') Example.unClip();
   *            else Example.clip();
   *            Event.stop(event);
   *          }
   *        };
   *        Event.observe('clipper', 'click', Example.toggleClip);
   *      </script>
  **/
  function makeClipping(element) {
    element = $(element);

    var storage = Element.getStorage(element),
     madeClipping = storage.get('prototype_made_clipping');

    // The "prototype_made_clipping" storage key is meant to hold the
    // original CSS overflow value. A string value or `null` means that we've
    // called `makeClipping` already. An `undefined` value means we haven't.
    if (Object.isUndefined(madeClipping)) {
      var overflow = Element.getStyle(element, 'overflow');
      storage.set('prototype_made_clipping', overflow);
      if (overflow !== 'hidden')
        element.style.overflow = 'hidden';
    }

    return element;
  }

  /**
   *  Element.undoClipping(@element) -> Element
   *
   *  Sets `element`'s CSS `overflow` property back to the value it had
   *  _before_ [[Element.makeClipping]] was applied.
   *
   *  ##### Example
   *
   *      language: html
   *      <div id="framer">
   *        <img src="/assets/2007/1/14/chairs.jpg" alt="example" />
   *      </div>
   *
   *  Then:
   *
   *      $('framer').undoClipping();
   *      // -> Element (and sets the CSS overflow property to its original value).
   *
   *  Another example:
   *
   *      language: html
   *      <a id="clipper" href="#">Click me to try it out.</a>
   *
   *      <div id="framer">
   *        <img src="/assets/2007/2/24/chairs_1.jpg" alt="example" />
   *      </div>
   *
   *      <script type="text/javascript" charset="utf-8">
   *        var Example = {
   *          clip: function(){
   *            $('clipper').update('undo clipping!');
   *            $('framer').makeClipping().setStyle({width: '100px', height: '100px'});
   *          },
   *          unClip: function(){
   *            $('clipper').update('clip!');
   *            $('framer').undoClipping();
   *          },
   *          toggleClip: function(event){
   *            if ($('clipper').innerHTML == 'clip!') Example.clip();
   *            else Example.unClip();
   *            Event.stop(event);
   *          }
   *        };
   *        $('framer').makeClipping().setStyle({width: '100px', height: '100px'});
   *        Event.observe('clipper', 'click', Example.toggleClip);
   *      </script>
  **/
  function undoClipping(element) {
    element = $(element);
    var storage = Element.getStorage(element),
     overflow = storage.get('prototype_made_clipping');

    if (!Object.isUndefined(overflow)) {
      storage.unset('prototype_made_clipping');
      element.style.overflow = overflow || '';
    }

    return element;
  }

  /**
   *  Element.clonePosition(@element, source[, options]) -> Element
   *  - source (Element | String): The source element (or its ID).
   *  - options (Object): The position fields to clone.
   *
   *  Clones the position and/or dimensions of `source` onto the element as
   *  defined by `options`, with an optional offset for the `left` and `top`
   *  properties.
   *
   *  Note that the element will be positioned exactly like `source` whether or
   *  not it is part of the same [CSS containing
   *  block](http://www.w3.org/TR/CSS21/visudet.html#containing-block-details).
   *
   *  ##### Options
   *
   *  <table class='options'>
   *  <thead>
   *    <tr>
   *      <th style='text-align: left; padding-right: 1em'>Name</th>
   *      <th style='text-align: left; padding-right: 1em'>Default</th>
   *      <th style='text-align: left; padding-right: 1em'>Description</th>
   *    </tr>
   *  </thead>
   *  <tbody>
   *    <tr>
   *    <td><code>setLeft</code></td>
   *    <td><code>true</code></td>
   *  <td>Clones <code>source</code>'s <code>left</code> CSS property onto <code>element</code>.</td>
   *  </tr>
   *  <tr>
   *    <td><code>setTop</code></td>
   *    <td><code>true</code></td>
   *  <td>Clones <code>source</code>'s <code>top</code> CSS property onto <code>element</code>.</td>
   *  </tr>
   *  <tr>
   *    <td><code>setWidth</code></td>
   *    <td><code>true</code></td>
   *  <td>Clones <code>source</code>'s <code>width</code> onto <code>element</code>.</td>
   *  </tr>
   *  <tr>
   *    <td><code>setHeight</code></td>
   *    <td><code>true</code></td>
   *  <td>Clones <code>source</code>'s <code>width</code> onto <code>element</code>.</td>
   *  </tr>
   *  <tr>
   *    <td><code>offsetLeft</code></td>
   *    <td><code>0</code></td>
   *  <td>Number by which to offset <code>element</code>'s <code>left</code> CSS property.</td>
   *  </tr>
   *  <tr>
   *    <td><code>offsetTop</code></td>
   *    <td><code>0</code></td>
   *  <td>Number by which to offset <code>element</code>'s <code>top</code> CSS property.</td>
   *  </tr>
   *  </tbody>
   *  </table>
  **/
  function clonePosition(element, source, options) {
    options = Object.extend({
      setLeft:    true,
      setTop:     true,
      setWidth:   true,
      setHeight:  true,
      offsetTop:  0,
      offsetLeft: 0
    }, options || {});

    var docEl = document.documentElement;

    // Find page position of source.
    source  = $(source);
    element = $(element);
    var p, delta, layout, styles = {};

    if (options.setLeft || options.setTop) {
      p = Element.viewportOffset(source);
      delta = [0, 0];
      // A delta of 0/0 will work for `positioned: fixed` elements, but
      // for `position: absolute` we need to get the parent's offset.
      if (Element.getStyle(element, 'position') === 'absolute') {
        var parent = Element.getOffsetParent(element);
        if (parent !== document.body) delta = Element.viewportOffset(parent);
      }
    }

    function pageScrollXY() {
      var x = 0, y = 0;
      if (Object.isNumber(window.pageXOffset)) {
        // Modern browsers.
        x = window.pageXOffset;
        y = window.pageYOffset;
      } else if (document.body && (document.body.scrollLeft || document.body.scrollTop)) {
        x = document.body.scrollLeft;
        y = document.body.scrollTop;
      } else if (docEl && (docEl.scrollLeft || docEl.scrollTop)) {
        // IE6
        x = docEl.scrollLeft;
        y = docEl.scrollTop;
      }
      return { x: x, y: y };
    }

    var pageXY = pageScrollXY();


    if (options.setWidth || options.setHeight) {
      layout = Element.getLayout(source);
    }

    // Set position.
    if (options.setLeft)
      styles.left = (p[0] + pageXY.x - delta[0] + options.offsetLeft) + 'px';
    if (options.setTop)
      styles.top  = (p[1] + pageXY.y - delta[1] + options.offsetTop)  + 'px';

    var currentLayout = element.getLayout();

    // Use content box when setting width/height. If padding/border are
    // different between source and target, that's for the user to fix;
    // there's no good option for us.
    if (options.setWidth) {
      styles.width = layout.get('width')  + 'px';
    }
    if (options.setHeight) {
      styles.height = layout.get('height') + 'px';
    }

    return Element.setStyle(element, styles);
  }


  if (Prototype.Browser.IE) {
    // IE doesn't report offsets correctly for static elements, so we change them
    // to "relative" to get the values, then change them back.
    getOffsetParent = getOffsetParent.wrap(
      function(proceed, element) {
        element = $(element);

        // For unusual cases like these, we standardize on returning the BODY
        // element as the offset parent.
        if (isDocument(element) || isDetached(element) || isBody(element) || isHtml(element))
          return $(document.body);

        var position = element.getStyle('position');
        if (position !== 'static') return proceed(element);

        element.setStyle({ position: 'relative' });
        var value = proceed(element);
        element.setStyle({ position: position });
        return value;
      }
    );

    positionedOffset = positionedOffset.wrap(function(proceed, element) {
      element = $(element);
      if (!element.parentNode) return new Element.Offset(0, 0);
      var position = element.getStyle('position');
      if (position !== 'static') return proceed(element);

      // Trigger hasLayout on the offset parent so that IE6 reports
      // accurate offsetTop and offsetLeft values for position: fixed.
      var offsetParent = element.getOffsetParent();
      if (offsetParent && offsetParent.getStyle('position') === 'fixed')
        hasLayout(offsetParent);

      element.setStyle({ position: 'relative' });
      var value = proceed(element);
      element.setStyle({ position: position });
      return value;
    });
  } else if (Prototype.Browser.Webkit) {
    // Safari returns margins on body which is incorrect if the child is absolutely
    // positioned.  For performance reasons, redefine Element#cumulativeOffset for
    // KHTML/WebKit only.
    cumulativeOffset = function(element) {
      element = $(element);
      var valueT = 0, valueL = 0;
      do {
        valueT += element.offsetTop  || 0;
        valueL += element.offsetLeft || 0;
        if (element.offsetParent == document.body) {
          if (Element.getStyle(element, 'position') == 'absolute') break;
        }

        element = element.offsetParent;
      } while (element);

      return new Element.Offset(valueL, valueT);
    };
  }


  Element.addMethods({
    getLayout:              getLayout,
    measure:                measure,
    getWidth:               getWidth,
    getHeight:              getHeight,
    getDimensions:          getDimensions,
    getOffsetParent:        getOffsetParent,
    cumulativeOffset:       cumulativeOffset,
    positionedOffset:       positionedOffset,
    cumulativeScrollOffset: cumulativeScrollOffset,
    viewportOffset:         viewportOffset,
    absolutize:             absolutize,
    relativize:             relativize,
    scrollTo:               scrollTo,
    makePositioned:         makePositioned,
    undoPositioned:         undoPositioned,
    makeClipping:           makeClipping,
    undoClipping:           undoClipping,
    clonePosition:          clonePosition
  });

  function isBody(element) {
    return element.nodeName.toUpperCase() === 'BODY';
  }

  function isHtml(element) {
    return element.nodeName.toUpperCase() === 'HTML';
  }

  function isDocument(element) {
    return element.nodeType === Node.DOCUMENT_NODE;
  }

  function isDetached(element) {
    return element !== document.body &&
     !Element.descendantOf(element, document.body);
  }

  // If the browser supports the nonstandard `getBoundingClientRect`
  // (currently only IE and Firefox), it becomes far easier to obtain
  // true offsets.
  if ('getBoundingClientRect' in document.documentElement) {
    Element.addMethods({
      viewportOffset: function(element) {
        element = $(element);
        if (isDetached(element)) return new Element.Offset(0, 0);

        var rect = element.getBoundingClientRect(),
         docEl = document.documentElement;
        // The HTML element on IE < 8 has a 2px border by default, giving
        // an incorrect offset. We correct this by subtracting clientTop
        // and clientLeft.
        return new Element.Offset(rect.left - docEl.clientLeft,
         rect.top - docEl.clientTop);
      }
    });
  }


})();

(function() {
  /**
   *  document.viewport
   *
   *  The `document.viewport` namespace contains methods that return information
   *  about the viewport &mdash; the rectangle that represents the portion of a web
   *  page within view. In other words, it's the browser window minus all chrome.
  **/

  var IS_OLD_OPERA = Prototype.Browser.Opera &&
   (window.parseFloat(window.opera.version()) < 9.5);
  var ROOT = null;
  function getRootElement() {
    if (ROOT) return ROOT;
    ROOT = IS_OLD_OPERA ? document.body : document.documentElement;
    return ROOT;
  }

  /**
   *  document.viewport.getDimensions() -> Object
   *
   *  Returns an object containing viewport dimensions in the form
   *  `{ width: Number, height: Number }`.
   *
   *  The _viewport_ is the subset of the browser window that a page occupies
   *  &mdash; the "usable" space in a browser window.
   *
   *  ##### Example
   *
   *      document.viewport.getDimensions();
   *      //-> { width: 776, height: 580 }
  **/
  function getDimensions() {
    return { width: this.getWidth(), height: this.getHeight() };
  }

  /**
   *  document.viewport.getWidth() -> Number
   *
   *  Returns the width of the viewport.
   *
   *  Equivalent to calling `document.viewport.getDimensions().width`.
  **/
  function getWidth() {
    return getRootElement().clientWidth;
  }

  /**
   *  document.viewport.getHeight() -> Number
   *
   *  Returns the height of the viewport.
   *
   *  Equivalent to `document.viewport.getDimensions().height`.
  **/
  function getHeight() {
    return getRootElement().clientHeight;
  }

  /**
   *  document.viewport.getScrollOffsets() -> Array
   *
   *  Returns the viewport's horizontal and vertical scroll offsets.
   *
   *  Returns an array in the form of `[leftValue, topValue]`. Also accessible
   *  as properties: `{ left: leftValue, top: topValue }`.
   *
   *  ##### Examples
   *
   *      document.viewport.getScrollOffsets();
   *      //-> { left: 0, top: 0 }
   *
   *      window.scrollTo(0, 120);
   *      document.viewport.getScrollOffsets();
   *      //-> { left: 0, top: 120 }
  **/
  function getScrollOffsets() {
    var x = window.pageXOffset || document.documentElement.scrollLeft ||
     document.body.scrollLeft;
    var y = window.pageYOffset || document.documentElement.scrollTop ||
     document.body.scrollTop;

    return new Element.Offset(x, y);
  }

  document.viewport = {
    getDimensions:    getDimensions,
    getWidth:         getWidth,
    getHeight:        getHeight,
    getScrollOffsets: getScrollOffsets
  };

})();