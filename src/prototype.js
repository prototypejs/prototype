<%= include 'HEADER' %>

var Prototype = {
  Version: '<%= PROTOTYPE_VERSION %>',
  
  Browser: {
    IE:     !!(window.attachEvent && !window.opera),
    Opera:  !!window.opera,
    WebKit: navigator.userAgent.indexOf('AppleWebKit/') > -1,
    Gecko:  navigator.userAgent.indexOf('Gecko') > -1 && navigator.userAgent.indexOf('KHTML') == -1,
    MobileSafari: !!navigator.userAgent.match(/Apple.*Mobile.*Safari/)
  },

  BrowserFeatures: {
    XPath: !!document.evaluate,
    ElementExtensions: !!window.HTMLElement,
    SpecificElementExtensions: 
      document.createElement('div').__proto__ &&
      document.createElement('div').__proto__ !== 
        document.createElement('form').__proto__
  },

  ScriptFragment: '<script[^>]*>([\\S\\s]*?)<\/script>',
  JSONFilter: /^\/\*-secure-([\s\S]*)\*\/\s*$/,  
  
  emptyFunction: function() { },
  K: function(x) { return x }
};

if (Prototype.Browser.MobileSafari)
  Prototype.BrowserFeatures.SpecificElementExtensions = false;
  

<%= include 'base.js', 'string.js' %>

<%= include 'enumerable.js', 'array.js', 'number.js', 'hash.js', 'range.js' %>

<%= include 'ajax.js', 'dom.js', 'selector.js', 'form.js', 'event.js', 'deprecated.js' %>

Element.addMethods();
