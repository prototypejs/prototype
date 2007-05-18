<%= include 'HEADER' %>

var Prototype = {
  Version: '<%= PROTOTYPE_VERSION %>',
  
  Browser: {
    IE:     !!(window.attachEvent && !window.opera),
    Opera:  !!window.opera,
    WebKit: navigator.userAgent.indexOf('AppleWebKit/') > -1,
    Gecko:  navigator.userAgent.indexOf('Gecko') > -1 && navigator.userAgent.indexOf('KHTML') == -1
  },

  BrowserFeatures: {
    XPath: !!document.evaluate,
    ElementExtensions: !!window.HTMLElement,
    SpecificElementExtensions: 
      (document.createElement('div').__proto__ !== 
       document.createElement('form').__proto__)
  },

  ScriptFragment: '<script[^>]*>([\u0001-\uFFFF]*?)<\/script>',
  JSONFilter: /^\/\*-secure-\s*(.*)\s*\*\/\s*$/,  
  
  emptyFunction: function() { },
  K: function(x) { return x }
}

<%= include 'base.js', 'string.js' %>

<%= include 'enumerable.js', 'array.js', 'hash.js', 'range.js' %>

<%= include 'ajax.js', 'dom.js', 'selector.js', 'form.js', 'event.js', 'deprecated.js' %>

Element.addMethods();
