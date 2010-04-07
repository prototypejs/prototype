---
layout: blog_archive
author: Andrew Dupont
author_url: http://andrewdupont.net/
sections: blog
title: "Pimp My Code #1: Element.Storage"
---

<p>Man, it's quiet around here. Interested in doing some pimpin'?</p> 

<p>WAIT! COME BACK.</p>

<p><em>Code</em> pimping. You know? <a href="http://prototypejs.org/2008/10/7/want-your-code-pimped" title="Prototype JavaScript framework: Want your code 'pimped'?">The thing I'd discussed before</a>? Forgive my earlier informality. I see now how my words could have been confusing.</p>

<p>The very first edition of <cite>Pimp My Code</cite> is special because the code we&#8217;ll be looking at <em>will be included in Prototype 1.6.1</em>. (It's a bit like if we were to Pimp [someone's] Ride™, then decide to keep the car for ourselves.) So this is more than just an academic exercise for us — the &#8220;pimped&#8221; result is now part of the Prototype source code.</p>

<h3>The Original</h3>

<p>The code in question, from Sébastien Grosjean (a.k.a. ZenCocoon), implements element &#8220;storage&#8221; — attaching of arbitrary data to DOM nodes in a safe and leak-free manner. Other frameworks have had this for a while; <a href="http://jquery.com/" title="jQuery: The Write Less, Do More, JavaScript Library">jQuery</a>&#8217;s <code>$.fn.data</code>, for instance, is used heavily by jQuery plugin authors <a href="http://docs.jquery.com/Internals/jQuery.data" title="Internals/jQuery.data - jQuery JavaScript Library">to great effect</a>. But Seb&#8217;s is based on the similar Mootools API, which I&#8217;ve admired since <a href="http://mootools.net/blog/2008/01/22/whats-new-in-12-element-storage/" title="MooTools - What&#8217;s New in 1.2: Element Storage">it debuted in Mootools 1.2</a>.</p>

<p>Here&#8217;s Seb&#8217;s code. It&#8217;s a long code block, since he&#8217;s been thoughtful enough to comment the hell out of it:</p>

<script src="http://gist.github.com/15457.js"></script>

<p>The idea is this: instead of storing arbitrary objects as properties on DOM nodes, create <em>one</em> custom property on the DOM node: an index to a global hashtable. The value of that key in the table will itself be a collection of custom key/value pairs. On top of avoiding nasty IE memory leaks (circular references between DOM objects and JS objects), this has the benefit of encapsulating all of an element&#8217;s custom metadata into one place.</p>

<p>Let&#8217;s make a first pass at this, line-by-line.</p>

<h3>The Critique</h3>

<macro:jscode language="javascript">Object.extend(Prototype, {UID: 1});</macro:jscode>

<p>Already we&#8217;ve gotten to something I&#8217;d change. Seb is using the <code>Prototype</code> namespace correctly here, in that he&#8217;s storing something that&#8217;s of concern only to the framework and should feel &#8220;private.&#8221; But my own preference is to move this property into the <code>Element.Storage</code> namespace. I am fickle and my mind is hard to read.</p>

    Element.Storage = {
      get: function(uid) {
        return (this[uid] || (this[uid] = {}));
      },
    
      init: function(item) {
        return (item.uid || (item.uid = Prototype.UID++));
      }
    }

<p>OK, another change jumps out at me. The <code>Element.Storage.init</code> method gets called in both <code>Element#store</code> and <code>Element#retrieve</code>; it handles the case where an element doesn&#8217;t have any existing metadata. It creates our custom property on the node and increments the counter.</p>

<p>In other words, <code>store</code> and <code>retrieve</code> are the only two places where this method is needed, so I balk at making it public. My first instinct was to make it a private method inside a closure:</p>

    (function() {
      function _init(item) {
        return (item.uid || (item.uid = Prototype.UID++));
      }
    
      // ... rest of storage code
    })();

<p>I started down this path but quickly stopped. Instead, we&#8217;re going to refactor this part so that the <code>init</code> case is handled without the need for a separate method. Let&#8217;s move on for now.</p>

    Element.Methods.retrieve = function(element, property, dflt) {
      if (!(element = $(element))) return;
      if (element.uid == undefined) Element.Storage.init(element);
      var storage = Element.Storage.get(element.uid);
      var prop = storage[property];
      if (dflt != undefined && prop == undefined)
        prop = storage[property] = dflt;
      return prop;
    };

<p>A few things to mention here.</p>

<ul>
  <li>
    <p>Variable naming is important. The ideal name for the third parameter of this function would be <code>default</code>, but that&#8217;s off-limits; <code>default</code> is a reserved word in JavaScript. Seb&#8217;s opted for <code>dflt</code> here, which is clear enough. I&#8217;d change it to <code>defaultValue</code> because I like vowels.</p>


<p>As an aside: my first instinct was to remove the <code>defaultValue</code> thing altogether, because I was surprised by the way it behaved. I didn&#8217;t find it very intuitive to give <code>Element#retrieve</code> the capability to <em>store</em> properties as well. So I took it out.</p>

<p>I changed my mind several minutes later, when I wrote some code that leveraged element metadata. I had assumed I wouldn&#8217;t need the &#8220;store a default value&#8221; feature often enough to warrant the surprising behavior, but I was <em>spectacularly wrong</em>. I put it back in. Consider that a lesson on how your API design needs to be grounded in use cases.</p>

  </li>

  <li>
    <p>The idiom in the first line is used throughout Prototype and script.aculo.us (and, in fact, should be used more consistently). It runs the argument through <code>$</code>, but also checks the return value to ensure we got back a DOM node and not <code>null</code> (as would happen if you passed a non-existent ID). An empty <code>return</code> is equivalent to <code>return undefined</code>, which (IMO) is an acceptable failure case. Bonus points, Seb!</p>
  </li>

  <li>
    <p><p>The custom property Seb&#8217;s been using is called <code>uid</code>. I&#8217;m going to change this to something that&#8217;s both (a) clearly private; (b) less likely to cause a naming collision. In keeping with existing Prototype convention, we&#8217;re going to call it <code>_prototypeUID</code>.</p>
</p>
  </li>

  <li>
     <p>Here&#8217;s a nitpick: <code>if (element.uid == undefined)</code>. The comparison operator (<code>==</code>) isn&#8217;t very precise, so if you&#8217;re testing for <code>undefined</code>, you should use the identity operator (<code>===</code>). You could also use Prototype&#8217;s <code>Object.isUndefined</code>. In fact, I will.</p>


    <p>I have a prejudice against the <code>==</code> operator. Most of the time the semantics of <code>===</code> are closer to what you <em>mean</em>. But this has special significance with <code>undefined</code>, which one encounters often in JavaScript. As an example: when you&#8217;re trying to figure out if an optional parameter was passed into a function, you&#8217;re looking for <code>undefined</code>. Any other value, no matter how &#8220;falsy&#8221; it is, means the parameter <em>was</em> given; <code>undefined</code> means it <em>was not</em>.</p>


    <p>(Oh, by the way: I am aware of the code screenshot on our homepage that violates the advice I just gave.)</p>
  </li>

  <li>
    <p>There are other checks against <code>undefined</code> in this function. For consistency I&#8217;m going to change these to use <code>Object.isUndefined</code> as well. Also, the check for <code>dflt != undefined</code> is unnecessary: if that compound conditional passes, it means <code>retrieve</code> is going to return <code>undefined</code> anyway, so it doesn&#8217;t matter which of the two <code>undefined</code> values we return.</p>

  </li>
</ul>

<p>Man, I&#8217;m a bastard, aren&#8217;t I? Luckily, <code>Element#store</code> is similar enough that there&#8217;s no new feedback to be given here, so I&#8217;m done kvetching.</p>

<p>Before we rewrite this code to reflect the changes I&#8217;ve suggested, we&#8217;re going to make a couple design decisions.</p>

<h3>Feature Design</h3>

<p>While I was deciding how to replace <code>Element.Storage.init</code>, I had an idea: rather than use ordinary <code>Object</code>s to store the data, we should be using Prototype&#8217;s <code>Hash</code>. In other words, we&#8217;ll create a global table of <code>Hash</code> objects, each one representing the custom key-value pairs for a specific element.</p>

<p>This isn&#8217;t just a plumbing change; it&#8217;s quite useful to be able to deal with the custom properties in a group rather than just one-by-one. And since <code>Hash</code> mixes in <code>Enumerable</code>, interesting use cases emerge: e.g., looping through all properties and acting on those that begin with a certain &#8220;namespace.&#8221;</p>

<p>So let&#8217;s envision a new method: <code>Element#getStorage</code>. Given an element, it will return the <code>Hash</code> object associated with that element. If there isn&#8217;t one, it can &#8220;initialize&#8221; the storage on that element, thus making <code>Element.Storage.init</code> unnecessary.</p>

<p>This new method also establishes some elegant parallels: the <code>store</code> and <code>retrieve</code> methods are really just aliases for <code>set</code> and <code>get</code> on the hash itself. Actually, <code>retrieve</code> will be a bit more complicated because of the &#8220;default value&#8221; feature, but we&#8217;ll be able to condense <code>store</code> down to two lines.</p>

<h3>The Rewrite</h3>

<p>Enough blathering. Here&#8217;s the rewrite:</p>

    Element.Storage = {
      UID: 1
    };

<p>As promised, I&#8217;ve moved the <code>UID</code> counter. The <code>Element.Storage</code> object also acts as our global hashtable, but all its keys will be numeric, so the <code>UID</code> property won&#8217;t get in anyone&#8217;s way.</p>

<p><code>Element#getStorage</code> assumes the duties of <code>Element.Storage.get</code> and <code>Element.Storage.init</code>, thereby making them obsolete. We&#8217;ve removed them.</p>

    Element.addMethods({
      getStorage: function(element) {
        if (!(element = $(element))) return;
    
        if (Object.isUndefined(element._prototypeUID))
          element._prototypeUID = Element.Storage.UID++;
    
        var uid = element._prototypeUID;
    
        if (!Element.Storage[uid])
          Element.Storage[uid] = $H();
    
        return Element.Storage[uid];
      },

<p>The new <code>getStorage</code> method checks for the presence of <code>_prototypeUID</code>. If it&#8217;s not there, it gets defined on the node.</p>

<p>It then looks for the corresponding <code>Hash</code> object in <code>Element.Storage</code>, creating an empty <code>Hash</code> if there&#8217;s nothing there.</p>

<p>As I said before, <code>Element#store</code> is much simpler now:</p>

    store: function(element, key, value) {
        if (!(element = $(element))) return;
        element.getStorage().set(key, value);
        return element;
      },

<p>I thought about returning the stored value, to make it behave exactly like <code>Hash#set</code>, but some feedback from others suggested it was better to return the element itself for chaining purposes (as we do with many methods on <code>Element</code>).</p>

<p>And <code>Element#retrieve</code> is nearly as simple:</p>

    retrieve: function(element, key, defaultValue) {
        if (!(element = $(element))) return;
    
        var hash = element.getStorage(), value = hash.get(key);
    
        if (Object.isUndefined(value)) {
          hash.set(key, defaultValue);
          value = defaultValue;
        }
    
        return value;
      }
    });

<p>And we&#8217;re done.</p>

<h3>Further refinements</h3>

<p>In fact, we&#8217;re <em>not</em> done. This is roughly what the code looked like when I first checked in this feature, but some further improvements have been made.</p>

<p>Since we&#8217;d been using a system similar to this to associate event handlers with nodes, we had to rewrite that code to use the new storage API. In doing so, we found that we needed to include <code>window</code> in our storage system, since it has events of its own. Rather than define a <code>_prototypeUID</code> property on the global object, we give <code>window</code> a UID of <code>0</code> and check for it specifically in <code>Element#getStorage</code>.</p>

<p>Also, based on an excellent suggestion, we changed <code>Element#store</code> so that it could accept an object full of key/value pairs, much like <code>Hash#update</code>.</p>

<h3>In Summation</h3>

<p>I was happy to come across Sébastien's submission. It was the perfect length for a drive-by refactoring; it made sense as a standalone piece of code, without need for an accompanying screenshot or block of HTML; and it implemented a feature we'd already had on the 1.6.1 roadmap.</p>

<p>You can <a href="http://github.com/sstephenson/prototype/tree/master" title="sstephenson's prototype at master - GitHub">get the bleeding-edge Prototype</a> if you want to try out the code we wrote. Or you can <a href="http://gist.github.com/53924" title="gist: 53924 - GitHub">grab this gist</a> if you want to drop the new functionality in alongside 1.6.0.3.</p>

<p>We're further grateful to Mootools for the API we're stealing. And to <a href="http://www.wilshipley.com/blog/" title="Call Me Fishmeal.">Wil Shipley</a> for the recurring blog article series we're stealing.</p>


