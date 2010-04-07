---
layout: blog_archive
author: Mislav Marohnić
author_url: http://mislav.uniqpath.com/
sections: blog
title: "New in Prototype trunk: DOM builder"
---

There is no rest for [the Prototype core team](/core). Immediately after [we pushed version 1.5.1](/2007/5/1/prototype-1-5-1-released) out, great changes continue to incubate in our experimental [SVN branches](http://dev.rubyonrails.org/browser/spinoffs/prototype/branches/), and some of those have recently made their way into trunk. Here's a look at one such change that will make creating DOM nodes simpler in the next release of Prototype.

Recently the DOM part of the framework has received much love from [Tobie Langel](http://tobielangel.com/), who [hacked around the DOM branch a lot](http://dev.rubyonrails.org/log/spinoffs/prototype/branches/dom) to provide us with great new features for the next release.

Today's highlight is that now you can create a new HTML element like this:

    var form = new Element('form', {
                             action: "/user/create",
                             method': "post"
                           });
    //-> &lt;form action="/user/create" method="post">

That's right -- you can specify both the element and its attributes in a single call! So, you've got your own minimal DOM builder right here. Naturally, this is **entirely cross-browser** since it maps the attributes to correct properties internally. You can even do this in IE _without_ tears:

    new Element('input', { name: "user", disabled: true });
    //-> &lt;input name="user" disabled="disabled" />

Experienced coders will remember that Internet Explorer doesn't allow the `name` attribute to be set in a normal way. Well, we worked around that, too. This also demonstrates how boolean `true` as an attribute value results in repeating its name inside the value (`disabled="disabled"`), which is a convention of XHTML.

The `Element` constructor demonstrated here sets attributes by using a method that's also new: `Element#writeAttributes`. We should also mention that the constructor is optimized for speed when creating multiple instances of the same type. Using `document.createElement()` a lot to create nodes you will later manipulate with Prototype? You should use the `Element` constructor instead.

This, folks, is currently in [the trunk](http://dev.rubyonrails.org/browser/spinoffs/prototype/trunk), but you can check it out with SVN ([instructions](/contribute)) and use anytime. You can also <a onmouseup="if(urchinTracker) urchinTracker('download/prototype-dev-6728')" href="http://cloud.github.com/downloads/sstephenson/prototype/prototype_1-5-2_pre0.js">download this development build</a> if you want to skip the SVN process. Big thanks to [Martin Ström](http://burnfield.com/martin) and [Tom Gregory](http://www.tag-strategia.com/blog/) for inspiring this and helping it happen. Also thanks [everyone participating in the discussion](http://groups.google.com/group/prototype-core/browse_thread/thread/6854e0f1bc77a904/38cdf071c8431a43) for helping us make Prototype a better library!

