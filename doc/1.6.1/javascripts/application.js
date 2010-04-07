//= require <prototype>

if (!Prototype || Prototype.Version.indexOf('1.6') !== 0) {
  throw "This script requires Prototype >= 1.6.";
}

Object.isDate = function(object) {
  return object instanceof Date;
};

/** 
 *  class Cookie
 *  Creates a cookie.
**/
var Cookie = Class.create({
  /**
   *  new Cookie(name, value[, expires])
   *  
   *  - name (String): The name of the cookie.
   *  - value (String): The value of the cookie.
   *  - expires (Number | Date): Exact date (or number of days from now) that
   *     the cookie will expire.
  **/
  initialize: function(name, value, expires) {
    expires = expires || "";
    if (Object.isNumber(expires)) {
      var days = expires;
      expires = new Date();
      expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
    }
    
    if (Object.isDate(expires))
      expires = expires.toGMTString();

    if (!Object.isUndefined(expires) && expires !== "")
      expires = "; expires=" + expires;
    
    this.name    = name;
    this.value   = value;
    this.expires = expires;
    
    document.cookie = name + "=" + value + expires + "; path=/";      
  },
  
  toString: function() {
    return this.value;
  },
  
  inspect: function() {
    return "#<Cookie #{name}:#{value}>".interpolate(this);
  }
});

/**
 * Cookie
**/
Object.extend(Cookie, {
  /**
   *  Cookie.set(name, value, expires)
   *  
   *  Alias of [[Cookie#initialize]].
  **/
  set: function(name, value, expires) {
    return new Cookie(name, value, expires);
  },
  
  /**
   *  Cookie.get(name)
   *  
   *  Returns the value of the cookie with the given name.
   *  - name (String): The name of the cookie to retrieve.
  **/
  get: function(name) {
    var c = document.cookie.split(';');
    
    for (var i = 0, cookie; i < c.length; i++) {
      cookie = c[i].split('=');
      if (cookie[0].strip() === name)
        return cookie[1].strip();
    }
    
    return null;
  },
  
  /**
   *  Cookie.unset(name)
   *  
   *  Deletes a cookie.
   *  - name (String): The name of the cookie to delete.
   *  
  **/
  unset: function(name) {
    return Cookie.set(name, "", -1);
  }
});

Cookie.erase = Cookie.unset;



if (typeof PDoc === 'undefined') {
  window.PDoc = {
    Sidebar: {}
  };
}

// HISTORY MANAGER (sort of)
// Polls for changes to the hash.

(function() {
  var PREVIOUS_HASH = null;
  
  function poll() {
    var hash = window.location.hash;
    if (hash && hash !== PREVIOUS_HASH) {
      document.fire('hash:changed', {
        previous: PREVIOUS_HASH, current: hash
      });
    }
    PREVIOUS_HASH = hash;
    window.setTimeout(arguments.callee, 100);
  }
  
  Event.observe(window, 'load', poll);  
})();

Object.extend(PDoc.Sidebar, {
  getActiveTab: function() {
    var activeTab = $('sidebar_tabs').down('.active');
    if (!activeTab) return null;
    
    var href = activeTab.readAttribute('href');    
    return href.endsWith('menu_pane') ? 'menu_pane' : 'search_pane';    
  },
  
  // Remember the state of the sidebar so it can be restored on the next page.
  serialize: function() {
    var state = $H({
      activeTab: PDoc.Sidebar.getActiveTab(),
      menuScrollOffset: $('menu_pane').scrollTop,
      searchScrollOffset: $('search_results').scrollTop,
      searchValue: $('search').getValue()
    });
    
    return escape(state.toJSON());
  },
  
  // Restore the tree to a certain point based on a cookie.
  restore: function(state) {
    try {
      state = unescape(state).evalJSON();
      var filterer = $('search').retrieve('filterer');    
      filterer.setSearchValue(state.searchValue);

      (function() {
        $('menu_pane').scrollTop = state.menuScrollOffset;
        $('search_results').scrollTop = state.searchScrollOffset;
      }).defer();
    } catch(error) {
      console.log(error);
      if (!(error instanceof SyntaxError)) throw error;
    }
  }
});



// Live API search.
PDoc.Sidebar.Filterer = Class.create({
  initialize: function(element, options) {
    this.element = $(element);
    this.options = Object.extend(
      Object.clone(PDoc.Sidebar.Filterer.DEFAULT_OPTIONS),
      options || {}
    );
    
    // The browser's "helpful" auto-complete gets in the way.
    this.element.writeAttribute("autocomplete", "off");
    this.element.setValue('');
    
    // Hitting "enter" should do nothing.
    this.element.up('form').observe("submit", Event.stop);
    
    this.menu  = this.options.menu;
    this.links = this.menu.select('a');
    
    this.resultsElement = this.options.resultsElement;
    
    this.observers = {
      filter:  this.filter.bind(this),
      keydown: this.keydown.bind(this),
      keyup:   this.keyup.bind(this)
    };
    
    this.menu.setStyle({ opacity: 0.9 });
    this.addObservers();    
  },
  
  addObservers: function() {
    this.element.observe('keyup', this.observers.filter);
  },

  // Called whenever the list of results needs to update as a result of a 
  // changed search key.
  filter: function(event) {
    // Clear the text box on ESC.
    if (event.keyCode && event.keyCode === Event.KEY_ESC) {
      this.element.setValue('');
    }
    
    if (PDoc.Sidebar.Filterer.INTERCEPT_KEYS.include(event.keyCode))
      return;
        
    // If there's nothing in the text box, clear the results list.
    var value = $F(this.element).strip().toLowerCase();    
    if (value === '') {
      this.emptyResults();
      this.hideResults();
      return;
    }
    
    var urls  = this.findURLs(value);
    this.buildResults(urls);
  },
  
  setSearchValue: function(value) {
    this.element.setValue(value);
    if (value.strip() === "") {
      PDoc.Sidebar.Tabs.setActiveTab(0);
      return;
    }
    this.buildResults(this.findURLs(value));
  },
  
  // Given a key, finds all the PDoc objects that match.
  findURLs: function(str) {
    var results = [];
    for (var name in PDoc.elements) {
      if (name.toLowerCase().include(str.toLowerCase()))
        results.push(PDoc.elements[name]);
    }
    return results;
  },
  
  buildResults: function(results) {
    this.emptyResults();
    
    results.each( function(result) {
      var li = this._buildResult(result);
      this.resultsElement.appendChild(li);
    }, this);
    this.showResults();
  },
  
  _buildResult: function(obj) {
    var li = new Element('li', { 'class': 'menu-item' });
    var a = new Element('a', {
      'class': obj.type.gsub(/\s/, '-'),
      'href':  PDoc.pathPrefix + obj.path
    }).update(obj.name);
    
    li.appendChild(a);
    return li;
  },
  
  emptyResults: function() {
    this.resultsElement.update();
  },
  
  hideResults: function() {
    PDoc.Sidebar.Tabs.setActiveTab(0);    
    //this.resultsElement.hide();
    document.stopObserving('keydown', this.observers.keydown);
    document.stopObserving('keyup', this.observers.keyup);
  },
  
  showResults: function() {
    PDoc.Sidebar.Tabs.setActiveTab(1);
    //this.resultsElement.show();
    document.stopObserving('keydown', this.observers.keydown);
    this.element.stopObserving('keyup', this.observers.keyup);
    this.element.observe('keydown', this.observers.keydown);
    document.observe('keyup', this.observers.keyup);
  },
  
  keydown: function(event) {
    if (!PDoc.Sidebar.Filterer.INTERCEPT_KEYS.include(event.keyCode))
      return;
      
    // Also ignore if any modifier keys are present.
    if (event.shiftKey || event.ctrlKey || event.altKey || event.metaKey)
      return;
      
    event.stop();

    if (event.keyCode === Event.KEY_RETURN) {
      // Follow the highlighted item, unless there is none.
      if (!this.highlighted) return;
      var a = this.highlighted.down('a');
      if (a) {
        window.location.href = a.href;
      }
    } else if ([Event.KEY_UP, Event.KEY_DOWN].include(event.keyCode)) {
      // Is an arrow key.
      var direction = (Event.KEY_DOWN === event.keyCode) ? 1 : -1;
      this.highlighted = this.moveHighlight(direction);
      
      if (!Prototype.Browser.WebKit) {
        // If up/down key is held down, list should keep scrolling.
        // WebKit does this automatically because it fires the keydown
        // event over and over.
        this._scrollTimer = window.setTimeout(
          this.scrollList.bind(this, direction), 1000);
      }
    }
  },
  
  keyup: function(event) {
    if (this._scrollTimer) {
      window.clearTimeout(this._scrollTimer);
    }
  },
  
  moveHighlight: function(direction) {
    if (!this.highlighted) {
      // If there is none, highlight the first result.
      this.highlighted =
       this.resultsElement.down('li').addClassName('highlighted');
    } else {
      var method = (direction === 1) ? 'next' : 'previous';
      this.highlighted.removeClassName('highlighted');
      var adjacent = this.highlighted[method]('li');
      // If there isn't an adjacent one, we're at the top or bottom
      // of the list. Flip it.
      if (!adjacent) {
        adjacent = method == 'next' ? this.resultsElement.down('li') :
         this.resultsElement.down('li:last-of-type');
      }
      adjacent.addClassName('highlighted');
      this.highlighted = adjacent;
    }
    
    var h = this.highlighted, r = this.resultsElement;
    
    var distanceToBottom = h.offsetTop + h.offsetHeight;
    if (distanceToBottom > (r.offsetHeight + r.scrollTop)) {
      // Item is below the visible frame.
      r.scrollTop = distanceToBottom - r.offsetHeight;
    } else if (h.offsetTop < r.scrollTop) {
      // Item is above the visible frame.
      r.scrollTop = h.offsetTop;
    }

    return this.highlighted;
  },
  
  scrollList: function(direction) {
    this.moveHighlight(direction);
    this._scrollTimer = window.setTimeout(
      this.scrollList.bind(this, direction), 100);
  }
});

Object.extend(PDoc.Sidebar.Filterer, {
  INTERCEPT_KEYS: [Event.KEY_UP, Event.KEY_DOWN, Event.KEY_RETURN],
  DEFAULT_OPTIONS: {
    interval: 0.1,
    resultsElement: '.search-results'
  }
});


Form.GhostedField = Class.create({
  initialize: function(element, title, options) {
    options = options || {};
    
    this.element = $(element);
    this.title = title;
    
    this.isGhosted = true;
    
    if (options.cloak) {
      
      // Wrap the native getValue function so that it never returns the
      // ghosted value. This is optional because it presumes the ghosted
      // value isn't valid input for the field.
      this.element.getValue = this.element.getValue.wrap(this.wrappedGetValue.bind(this));      
    }
    
    this.addObservers();
    
    this.onBlur();
  },
  
  wrappedGetValue: function($proceed) {
    var value = $proceed();
    return value === this.title ? "" : value;
  },
  
  addObservers: function() {
    this.element.observe('focus', this.onFocus.bind(this));
    this.element.observe('blur',  this.onBlur.bind(this));
    
    var form = this.element.up('form');
    if (form) {
      form.observe('submit', this.onSubmit.bind(this));
    }
    
    // Firefox's bfcache means that form fields need to be re-initialized
    // when you hit the "back" button to return to the page.
    if (Prototype.Browser.Gecko) {
      window.addEventListener('pageshow', this.onBlur.bind(this), false);
    }
  },
  
  onFocus: function() {
    if (this.isGhosted) {
      this.element.setValue('');
      this.setGhosted(false);
    }
  },
  
  onBlur: function() {
    var value = this.element.getValue();
    if (value.blank() || value == this.title) {
      this.setGhosted(true);
    } else {
      this.setGhosted(false);
    }
  },
  
  setGhosted: function(isGhosted) {
    this.isGhosted = isGhosted;
    this.element[isGhosted ? 'addClassName' : 'removeClassName']('ghosted');
    if (isGhosted) {
      this.element.setValue(this.title);
    }    
  },

  // Hook into the enclosing form's `onsubmit` event so that we clear any
  // ghosted text before the form is sent.
  onSubmit: function() {
    if (this.isGhosted) {
      this.element.setValue('');
    }
  }
});

document.observe('dom:loaded', function() {
  PDoc.Sidebar.Tabs = new Control.Tabs($('sidebar_tabs'));
  
  var searchField = $('search');
  
  if (searchField) {
    var filterer = new PDoc.Sidebar.Filterer(searchField, {
      menu: $('api_menu'),
      resultsElement: $('search_results')
    });
    searchField.store('filterer', filterer);
  }  
  
  // Prevent horizontal scrolling in scrollable sidebar areas.
  $$('.scrollable').invoke('observe', 'scroll', function() {
    this.scrollLeft = 0;
  });
  
  var sidebarState = Cookie.get('sidebar_state');
  if (sidebarState) {
    PDoc.Sidebar.restore(sidebarState);
  }
  
  new Form.GhostedField(searchField, searchField.getAttribute('title'), 
    { cloak: true });
});

Event.observe(window, 'unload', function() {
  Cookie.set('sidebar_state', PDoc.Sidebar.serialize());
});