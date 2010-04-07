---
layout: blog_archive
author: Mislav Marohnić
author_url: http://mislav.uniqpath.com/
sections: Featured, Releases, blog
title: "Prototype 1.5.1.1 bug fix release"
---

Prototype 1.5.1.1 is now available for download. This is a *bug fix release* that prevents crashes with versions 1.3 and 2.0.x of the Safari browser. We urge everyone using Prototype 1.5.1 to [upgrade](/assets/2007/6/20/prototype.js) to this latest release.

Previous versions of Prototype could trigger bugs in Safari's regular expression engine when updating elements with HTML containing <code>&lt;script&gt;</code> tags or when using JSON functionality with built-in security checks. These regular expression engine bugs affect Safari versions 1.3 through 2.0.4, but not Safari 3 beta or the WebKit nightlies. We've managed to code around them to prevent either browser crashing while maintaining the full API, keeping the performance top-notch and assuring backwards-compatibility. 

Prototype 1.5.1.1 is a drop-in replacement for anyone using 1.5.1.
Please [upgrade now](/assets/2007/6/20/prototype.js)!

