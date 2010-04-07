---
layout: blog_archive
author: Sam Stephenson
author_url: http://conio.net/
sections: Featured, Releases, blog
title: "Prototype 1.6.1 released"
---

We're pleased to announce the release of Prototype 1.6.1 today. This version features improved performance, an element metadata storage system, new mouse events, and compatibility with the latest browsers. It's also the first release of Prototype built with [Sprockets](http://getsprockets.org/), our JavaScript packaging tool, and [PDoc](http://pdoc.org/), our inline documentation tool.

### Highlights

* **Full compatibility with new browsers.** This version of Prototype fully supports versions 1.0 and higher of Google Chrome, and Internet Explorer 8 in both compatibility mode and super-standards mode.

* **Element metadata storage.** Easily associate JavaScript key/value pairs with a DOM element. [See the blog post that started it off.](http://prototypejs.org/2009/2/16/pimp-my-code-1-element-storage)

* **New mouse events.** Internet Explorer's proprietary "mouseenter" and "mouseleave" events are now available in all browsers.

* **Improved performance and housekeeping.** The frequently used Function#bind, String#escapeHTML, and Element#down methods are faster, and Prototype is better at cleaning up after itself.

* **Built with Sprockets.** You can now include the Prototype source code repository in your application and use [Sprockets](http://getsprockets.org/) for dependency management and distribution.

* **Inline documentation with PDoc.** Our [API documentation](http://api.prototypejs.org/) is now stored in the source code with [PDoc](http://pdoc.org/) so it's easy to send patches or view documentation for a specific version. 

See the [RC2 blog post](http://prototypejs.org/2009/3/27/prototype-1-6-1-rc2-ie8-compatibility-element-storage-and-bug-fixes), [RC3 blog post](http://prototypejs.org/2009/6/16/prototype-1-6-1-rc3-chrome-support-and-pdoc), and [CHANGELOG](http://github.com/sstephenson/prototype/blob/f405b2c510e09b55d08c926a9e1a5c2e2d0a1834/CHANGELOG) for more details.


### Download, report bugs, and get help

* [Download Prototype 1.6.1](http://prototypejs.org/assets/2009/8/31/prototype.js)
* [View the API documentation](http://api.prototypejs.org/)
* [Check out the Prototype source code](http://github.com/sstephenson/prototype/) on GitHub
* [Submit bug reports](http://prototype.lighthouseapp.com/) to Lighthouse
* [Get Prototype help](http://prototypejs.org/discuss) on the mailing list or #prototype IRC channel
* [Interact with the Core Team](http://groups.google.com/group/prototype-core) on the protoype-core mailing list


We hope you enjoy the new version!

