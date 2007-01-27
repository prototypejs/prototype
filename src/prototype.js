<%= include 'HEADER' %>

var Prototype = {
  Version: '<%= PROTOTYPE_VERSION %>',
  BrowserFeatures: {
    XPath: !!document.evaluate,
    ElementExtensions: !!window.HTMLElement,
    SpecificElementExtensions: 
      (document.createElement('div').__proto__ !== 
       document.createElement('form').__proto__)
  },
  
  ScriptFragment: '(?:<script.*?>)((\n|\r|.)*?)(?:<\/script>)',
  emptyFunction: function() {},
  K: function(x) { return x }
}

<%= include 'base.js', 'string.js' %>

<%= include 'enumerable.js', 'array.js', 'hash.js', 'range.js' %>

<%= include 'ajax.js', 'dom.js', 'selector.js', 'form.js', 'event.js', 'position.js' %>

Element.addMethods();
