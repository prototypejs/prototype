/*  Prototype JavaScript framework, version <%= PROTOTYPE_VERSION %>
 *  (c) 2005-2009 Sam Stephenson
 *
 *  Prototype is freely distributable under the terms of an MIT-style license.
 *  For details, see the Prototype web site: http://www.prototypejs.org/
 *
 *--------------------------------------------------------------------------*/
 
var Prototype = {
  Version: '<%= PROTOTYPE_VERSION %>',
  
  Browser: {
    IE:     !!(window.attachEvent &&
      navigator.userAgent.indexOf('Opera') === -1),
    Opera:  navigator.userAgent.indexOf('Opera') > -1,
    WebKit: navigator.userAgent.indexOf('AppleWebKit/') > -1,
    Gecko:  navigator.userAgent.indexOf('Gecko') > -1 && 
      navigator.userAgent.indexOf('KHTML') === -1,
    MobileSafari: !!navigator.userAgent.match(/Apple.*Mobile.*Safari/)
  },

  BrowserFeatures: {
    XPath: !!document.evaluate,
    SelectorsAPI: !!document.querySelector,
    ElementExtensions: (function() {
      if (window.HTMLElement && window.HTMLElement.prototype)
        return true;      
      if (window.Element && window.Element.prototype)
        return true;
    })(),
    SpecificElementExtensions: (function() {      
      // First, try the named class
      if (typeof window.HTMLDivElement !== 'undefined')
        return true;
        
      var div = document.createElement('div');
      if (div['__proto__'] && div['__proto__'] !== 
       document.createElement('form')['__proto__']) {
        return true;
      }
      
      return false;      
    })()
  },

  ScriptFragment: '<script[^>]*>([\\S\\s]*?)<\/script>',
  JSONFilter: /^\/\*-secure-([\s\S]*)\*\/\s*$/,  
  
  emptyFunction: function() { },
  K: function(x) { return x }
};

if (Prototype.Browser.MobileSafari)
  Prototype.BrowserFeatures.SpecificElementExtensions = false;
  
//= require "lang"
//= require "ajax"
//= require "dom"

//= require "deprecated"
