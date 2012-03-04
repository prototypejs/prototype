//= compat
/*  Prototype JavaScript framework, version <%= PROTOTYPE_VERSION %>
 *  (c) 2005-2010 Sam Stephenson
 *
 *  Prototype is freely distributable under the terms of an MIT-style license.
 *  For details, see the Prototype web site: http://www.prototypejs.org/
 *
 *--------------------------------------------------------------------------*/

/**
 * Prototype
 *
 *  The [[Prototype]] namespace provides fundamental information about the
 *  Prototype library you're using, as well as a central repository for default
 *  iterators or functions.
 *
 *  We say "namespace," because the [[Prototype]] object is not intended for
 *  instantiation, nor for mixing in other objects. It's really just... a
 *  namespace.
 *
 *  ##### Your version of Prototype
 *
 *  Your scripts can check against a particular version of Prototype by
 *  examining [[Prototype.Version]], which is a version [[String]] (e.g.
 *  "<%= PROTOTYPE_VERSION %>"). The famous
 *  [script.aculo.us](http://script.aculo.us) library does this at load time to
 *  ensure it's being used with a reasonably recent version of Prototype, for
 *  instance.
 *
 *  ##### Browser features
 *
 *  Prototype also provides a (nascent) repository of
 *  [[Prototype.BrowserFeatures browser feature information]], which it then
 *  uses here and there in its source code. The idea is, first, to make
 *  Prototype's source code more readable; and second, to centralize whatever
 *  scripting trickery might be necessary to detect the browser feature, in
 *  order to ease maintenance.
 *
 *  ##### Default iterators and functions
 *
 *  Numerous methods in Prototype objects (most notably the [[Enumerable]]
 *  module) let the user pass in a custom iterator, but make it optional by
 *  defaulting to an "identity function" (an iterator that just returns its
 *  argument, untouched). This is the [[Prototype.K]] function, which you'll
 *  see referred to in many places.
 *
 *  Many methods also take it easy by protecting themselves against missing
 *  methods here and there, reverting to empty functions when a supposedly
 *  available method is missing. Such a function simply ignores its potential
 *  arguments, and does nothing whatsoever (which is, oddly enough,
 *  blazing fast). The quintessential empty function sits, unsurprisingly,
 *  at [[Prototype.emptyFunction]] (note the lowercase first letter).
**/
var Prototype = {

  /**
   *  Prototype.Version -> String
   *
   *  The version of the Prototype library you are using (e.g.
   *  "<%= PROTOTYPE_VERSION %>").
  **/
  Version: '<%= PROTOTYPE_VERSION %>',

  /**
   *  Prototype.Browser
   *
   *  A collection of [[Boolean]] values indicating the browser which is
   *  currently in use. Available properties are `IE`, `Opera`, `WebKit`,
   *  `MobileSafari` and `Gecko`.
   *
   *  Example
   *
   *      Prototype.Browser.WebKit;
   *      //-> true, when executed in any WebKit-based browser.
  **/
  Browser: (function(){
    var ua = navigator.userAgent;
    // Opera (at least) 8.x+ has "Opera" as a [[Class]] of `window.opera`
    // This is a safer inference than plain boolean type conversion of `window.opera`
    var isOpera = Object.prototype.toString.call(window.opera) == '[object Opera]';
    return {
      IE:             !!window.attachEvent && !isOpera,
      Opera:          isOpera,
      WebKit:         ua.indexOf('AppleWebKit/') > -1,
      Gecko:          ua.indexOf('Gecko') > -1 && ua.indexOf('KHTML') === -1,
      MobileSafari:   /Apple.*Mobile/.test(ua)
    }
  })(),

  /**
   *  Prototype.BrowserFeatures
   *
   *  A collection of [[Boolean]] values indicating the presence of specific
   *  browser features.
  **/
  BrowserFeatures: {
    /**
     *  Prototype.BrowserFeatures.XPath -> Boolean
     *
     *  Used internally to detect if the browser supports
     *  [DOM Level 3 XPath](http://www.w3.org/TR/DOM-Level-3-XPath/xpath.html).
    **/
    XPath: !!document.evaluate,

    /**
     *  Prototype.BrowserFeatures.SelectorsAPI -> Boolean
     *
     *  Used internally to detect if the browser supports the
     *  [NodeSelector API](http://www.w3.org/TR/selectors-api/#nodeselector).
    **/
    SelectorsAPI: !!document.querySelector,

    /**
     *  Prototype.BrowserFeatures.ElementExtensions -> Boolean
     *
     *  Used internally to detect if the browser supports extending html element
     *  prototypes.
    **/
    ElementExtensions: (function() {
      var constructor = window.Element || window.HTMLElement;
      return !!(constructor && constructor.prototype);
    })(),
    SpecificElementExtensions: (function() {
      // First, try the named class
      if (typeof window.HTMLDivElement !== 'undefined')
        return true;

      var div = document.createElement('div'),
          form = document.createElement('form'),
          isSupported = false;

      if (div['__proto__'] && (div['__proto__'] !== form['__proto__'])) {
        isSupported = true;
      }

      div = form = null;

      return isSupported;
    })()
  },

  ScriptFragment: '<script[^>]*>([\\S\\s]*?)<\/script\\s*>',
  JSONFilter: /^\/\*-secure-([\s\S]*)\*\/\s*$/,

  /**
   *  Prototype.emptyFunction([argument...]) -> undefined
   *  - argument (Object): Optional arguments
   *
   *  The [[Prototype.emptyFunction]] does nothing... and returns nothing!
   *
   *  It is used thoughout the framework to provide a fallback function in order
   *  to cut down on conditionals. Typically you'll find it as a default value
   *  for optional callback functions.
  **/
  emptyFunction: function() { },

  /**
   *  Prototype.K(argument) -> argument
   *  - argument (Object): Optional argument...
   *
   *  [[Prototype.K]] is Prototype's very own
   *  [identity function](http://en.wikipedia.org/wiki/Identity_function), i.e.
   *  it returns its `argument` untouched.
   *
   *  This is used throughout the framework, most notably in the [[Enumerable]]
   *  module as a default value for iterators.
   *
   *  ##### Examples
   *
   *      Prototype.K('hello world!');
   *      // -> 'hello world!'
   *
   *      Prototype.K(200);
   *      // -> 200
   *
   *      Prototype.K(Prototype.K);
   *      // -> Prototype.K
  **/
  K: function(x) { return x }
};

if (Prototype.Browser.MobileSafari)
  Prototype.BrowserFeatures.SpecificElementExtensions = false;
