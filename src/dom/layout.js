

(function() {
  
  // Converts a CSS percentage value to a decimal.
  // Ex: toDecimal("30%"); // -> 0.3
  function toDecimal(pctString) {
    var match = pctString.match(/^(\d+)%?$/i);
    if (!match) return null;
    return (Number(match[1]) / 100);
  }
  
  // Can be called like this:
  //   getPixelValue("11px");
  // Or like this:
  //   getPixelValue(someElement, 'paddingTop');  
  function getPixelValue(value, property) {
    if (Object.isElement(value)) {
      element = value;
      value = element.getStyle(property);
    }
    if (value === null) {
      return null;
    }

    // Non-IE browsers will always return pixels.
    if ((/^\d+(px)?$/i).test(value)) {
      return window.parseInt(value, 10);      
    }
    
    // When IE gives us something other than a pixel value, this technique
    // (invented by Dean Edwards) will convert it to pixels.
    if (/\d/.test(value) && element.runtimeStyle) {
      var style = element.style.left, rStyle = element.runtimeStyle.left; 
      element.runtimeStyle.left = element.currentStyle.left;
      element.style.left = value || 0;  
      value = element.style.pixelLeft;
      element.style.left = style;
      element.runtimeStyle.left = rStyle;
      
      return value;
    }
    
    // For other browsers, we have to do a bit of work.
    if (value.include('%')) {
      var decimal = toDecimal(value);
      var whole;
      if (property.include('left') || property.include('right') ||
       property.include('width')) {
        whole = $(element.parentNode).measure('width');
      } else if (property.include('top') || property.include('bottom') ||
       property.include('height')) {
        whole = $(element.parentNode).measure('height');
      }
      
      return whole * decimal;
    }
    
    // If we get this far, we should probably give up.
    return 0;
  }
  
  function toCSSPixels(number) {
    if (Object.isString(number) && number.endsWith('px')) {
      return number;
    }    
    return number + 'px';    
  }
  
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
  
  /**
   *  class Element.Layout < Hash
   *  
   *  A set of key/value pairs representing measurements of various
   *  dimensions of an element.
  **/
  Element.Layout = Class.create(Hash, {
    initialize: function($super, element, preCompute) {
      $super();      
      this.element = $(element);
      // The 'preCompute' boolean tells us whether we should fetch all values
      // at once. If so, we should do setup/teardown only once. We set a flag
      // so that we can ignore calls to `_begin` and `_end` elsewhere.
      if (preCompute) {
        this._preComputing = true;
        this._begin();
      }
      Element.Layout.PROPERTIES.each( function(property) {
        if (preCompute) {
          this._compute(property);
        } else {
          this._set(property, null);
        }
      }, this);
      if (preCompute) {
        this._end();
        this._preComputing = false;
      }
    },
    
    _set: function(property, value) {
      return Hash.prototype.set.call(this, property, value);
    },
    
    set: function(property, value) {
      if (Element.Layout.COMPOSITE_PROPERTIES.include(property)) {
        throw "Cannot set a composite property.";
      }
      
      return this._set(property, toCSSPixels(value));
    },
    
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
      if (this._prepared) return;      

      var element = this.element;
      if (isDisplayed(element)) {
        this._prepared = true;
        return;
      }
      
      // Remember the original values for some styles we're going to alter.
      var originalStyles = {
        position:   element.style.position   || '',
        width:      element.style.width      || '',
        visibility: element.style.visibility || '',
        display:    element.style.display    || ''
      };
      
      // We store them so that the `_end` function can retrieve them later.
      element.store('prototype_original_styles', originalStyles);
      
      var position = element.getStyle('position'),
       width = element.getStyle('width');
       
      element.setStyle({
        position:   'absolute',
        visibility: 'hidden',
        display:    'block'
      });
      
      var positionedWidth = element.getStyle('width');
      
      var newWidth;
      if (width && (positionedWidth === width)) {
        // If the element's width is the same both before and after
        // we set absolute positioning, that means:
        //  (a) it was already absolutely-positioned; or
        //  (b) it has an explicitly-set width, instead of width: auto.
        // Either way, it means the element is the width it needs to be
        // in order to report an accurate height.
        newWidth = window.parseInt(width, 10);
      } else if (width && (position === 'absolute' || position === 'fixed')) {
        newWidth = window.parseInt(width, 10);
      } else {
        // If not, that means the element's width depends upon the width of
        // its parent.
        var parent = element.parentNode, pLayout = $(parent).getLayout();
        
        
        newWidth = pLayout.get('width') -
         this.get('margin-left') -
         this.get('border-left') -
         this.get('padding-left') -
         this.get('padding-right') -
         this.get('border-right') -
         this.get('margin-right');
      }
      
      element.setStyle({ width: newWidth + 'px' });
      
      // The element is now ready for measuring.
      this._prepared = true;
    },
    
    _end: function() {
      var element = this.element;
      var originalStyles = element.retrieve('prototype_original_styles');
      element.store('prototype_original_styles', null);      
      element.setStyle(originalStyles);
      this._prepared = false;
    },
    
    _compute: function(property) {
      var COMPUTATIONS = Element.Layout.COMPUTATIONS;
      if (!(property in COMPUTATIONS)) {
        throw "Property not found.";
      }
      
      var value = COMPUTATIONS[property].call(this, this.element);
      this._set(property, value);
      return value;
    }    
  });
  
  Object.extend(Element.Layout, {
    // All measurable properties.
    PROPERTIES: $w('height width top left right bottom border-left border-right border-top border-bottom padding-left padding-right padding-top padding-bottom margin-top margin-bottom margin-left margin-right padding-box-width padding-box-height border-box-width border-box-height margin-box-width margin-box-height'),
    
    // Sums of other properties. Can be read but not written.
    COMPOSITE_PROPERTIES: $w('padding-box-width padding-box-height margin-box-width margin-box-height border-box-width border-box-height'),
    
    COMPUTATIONS: {
      'height': function(element) {
        if (!this._preComputing) this._begin();
        
        var bHeight = this.get('border-box-height');        
        if (bHeight <= 0) return 0;
        
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
        if (bWidth <= 0) return 0;

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
        return element.offsetHeight;
      },
            
      'border-box-width': function(element) {
        return element.offsetWidth;
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
        return getPixelValue(element, 'top');
      },
      
      'bottom': function(element) {
        return getPixelValue(element, 'bottom');
      },
      
      'left': function(element) {
        return getPixelValue(element, 'left');
      },
      
      'right': function(element) {
        return getPixelValue(element, 'right');
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
        return Object.isNumber(element.clientTop) ? element.clientTop : 
         getPixelValue(element, 'borderTopWidth');
      },
      
      'border-bottom': function(element) {
        return Object.isNumber(element.clientBottom) ? element.clientBottom : 
         getPixelValue(element, 'borderBottomWidth');
      },
      
      'border-left': function(element) {
        return Object.isNumber(element.clientLeft) ? element.clientLeft : 
         getPixelValue(element, 'borderLeftWidth');
      },
      
      'border-right': function(element) {
        return Object.isNumber(element.clientRight) ? element.clientRight : 
         getPixelValue(element, 'borderRightWidth');
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
  
  /**
   *  class Element.Offset
   *  
   *  A representation of the top- and left-offsets of an element relative to
   *  another.
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
    **/
    inspect: function() {
      return "#<Element.Offset left: #{left} top: #{top}".interpolate(this);
    },
    
    /**
     *  Element.Offset#toArray() -> Array
    **/
    toArray: function() {
      return [this.left, this.top];
    }
  });
  
  /**
   *  Element.getLayout(@element) -> Element.Layout
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
  **/
  function getLayout(element) {
    return new Element.Layout(element);
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
  **/
  function measure(element, property) {
    return $(element).getLayout().get(property);  
  }
  
  /**
   *  Element.cumulativeOffset(@element) -> Element.Offset
   *
   *  Returns the offsets of `element` from the top left corner of the
   *  document.
  **/
  function cumulativeOffset(element) {
    var valueT = 0, valueL = 0;
    do {
      valueT += element.offsetTop  || 0;
      valueL += element.offsetLeft || 0;
      element = element.offsetParent;
    } while (element);
    return new Element.Offset(valueL, valueT);
  }
  
  /**
   *  Element.positionedOffset(@element) -> Element.Offset
   *
   *  Returns `element`'s offset relative to its closest positioned ancestor
   *  (the element that would be returned by [[Element.getOffsetParent]]).
  **/  
  function positionedOffset(element) {
    var valueT = 0, valueL = 0;
    do {
      valueT += element.offsetTop  || 0;
      valueL += element.offsetLeft || 0;
      element = element.offsetParent;
      if (element) {
        if (element.tagName.toUpperCase() == 'BODY') break;
        var p = Element.getStyle(element, 'position');
        if (p !== 'static') break;
      }
    } while (element);
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
      valueT += element.scrollTop  || 0;
      valueL += element.scrollLeft || 0;
      element = element.parentNode;
    } while (element);
    return new Element.Offset(valueL, valueT);
  }

  /**
   *  Element.viewportOffset(@element) -> Array
   *
   *  Returns the X/Y coordinates of element relative to the viewport.
  **/
  function viewportOffset(forElement) {
    var valueT = 0, valueL = 0;

    var element = forElement;
    do {
      valueT += element.offsetTop  || 0;
      valueL += element.offsetLeft || 0;
      // Safari fix
      if (element.offsetParent == document.body &&
        Element.getStyle(element, 'position') == 'absolute') break;
    } while (element = element.offsetParent);

    element = forElement;    
    var tagName = element.tagName, O = Prototype.Browser.Opera;
    do {
      if (!O || tagName && tagName.toUpperCase() === 'BODY') {
        valueT -= element.scrollTop  || 0;
        valueL -= element.scrollLeft || 0;
      }
    } while (element = element.parentNode);    
    return new Element.Offset(valueL, valueT);
  }
  
  Element.addMethods({
    getLayout:              getLayout,
    measure:                measure,
    cumulativeOffset:       cumulativeOffset,
    positionedOffset:       positionedOffset,
    cumulativeScrollOffset: cumulativeScrollOffset,
    viewportOffset:         viewportOffset
  });
  
  // If the browser supports the nonstandard `getBoundingClientRect`
  // (currently only IE and Firefox), it becomes far easier to obtain
  // true offsets.
  if ('getBoundingClientRect' in document.documentElement) {
    Element.addMethods({
      viewportOffset: function(element) {
        element = $(element);
        var rect = element.getBoundingClientRect();
        return new Element.Offset(rect.left, rect.top);
      },
      
      cumulativeOffset: function(element) {
        element = $(element);
        var docOffset = $(document.documentElement).viewportOffset(),
          elementOffset = element.viewportOffset();
        return elementOffset.relativeTo(docOffset);
      },
            
      positionedOffset: function(element) {
        element = $(element);
        var parent = element.getOffsetParent();
        var isBody = (parent.nodeName.toUpperCase() === 'BODY');
        var eOffset = element.viewportOffset(),
          pOffset = isBody ? viewportOffset(parent) : parent.viewportOffset();
        return eOffset.relativeTo(pOffset);
      }
    });
  }  
})();