<%= include 'HEADER' %>

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
    ElementExtensions: !!window.HTMLElement,
    SpecificElementExtensions: 
      document.createElement('div')['__proto__'] &&
      document.createElement('div')['__proto__'] !== 
        document.createElement('form')['__proto__']
  },

  ScriptFragment: '<script[^>]*>([\\S\\s]*?)<\/script>',
  JSONFilter: /^\/\*-secure-([\s\S]*)\*\/\s*$/,  
  
  emptyFunction: function() { },
  K: function(x) { return x }
};

if (Prototype.Browser.MobileSafari)
  Prototype.BrowserFeatures.SpecificElementExtensions = false;
  
var Abstract = { };

var Try = {
  these: function() {
    var returnValue;
    
    for (var i = 0, length = arguments.length; i < length; i++) {
      var lambda = arguments[i];
      try {
        returnValue = lambda();
        break;
      } catch (e) { }
    }
    
    return returnValue;
  }
};

<%= include 'lang/class.js', 'lang/object.js', 'lang/function.js' %>

<%= include 'lang/date.js', 'lang/regexp.js', 'lang/periodical_executer.js' %>

<%= include 'lang/string.js', 'lang/template.js' %>

<%= include 'lang/enumerable.js', 'lang/array.js', 'lang/hash.js' %>

<%= include 'lang/number.js', 'lang/range.js' %>

<%= include 'ajax/ajax.js', 'ajax/responders.js', 'ajax/base.js', 'ajax/request.js', 'ajax/response.js' %>

<%= include 'ajax/updater.js', 'ajax/periodical_updater.js' %>

<%= include 'dom/dom.js', 'dom/selector.js', 'dom/form.js', 'dom/event.js' %>

<%= include 'deprecated.js' %>

Element.addMethods();
