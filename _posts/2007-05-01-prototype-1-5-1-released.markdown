---
layout: blog_archive
author: Mislav Marohnić
author_url: http://mislav.uniqpath.com/
sections: Releases, blog
title: "Prototype 1.5.1 released"
---

After almost two months of testing through four release candidates, the [final version of **1.5.1** is here](/download). The core team and dozens of contributors have fixed 30 bugs and introduced a slew of features and performance optimizations since 1.5.0. Here's a look at the highlights of our best release yet.

* Incredible Selector speedup and full CSS3 support ([read about it in the original post](/2007/3/9/prototype-1-5-1-rc1)).
* Full [JSON encoding and decoding](/learn/json) support and options for improved security.
* Optimized [`Element#get/setStyle`](/api/element/getStyle) for cross-browser compatibility and speed.
* Various [`String`](/api/string) method enhancements and fixes.
* The new [`Form#request`](/api/form/request) method simplifies the common case of submitting a serialized form with XMLHttpRequest.
* Many [form serialization](/api/form/serialize) fixes---if you had troubles before, now they've been squashed.

This list isn't *nearly* complete, so hop to the [CHANGELOG](http://dev.rubyonrails.org/browser/spinoffs/prototype/tags/rel_1-5-1/CHANGELOG?format=raw) for the full thing.

We've also been updating [the API documentation](/api). You will notice that the new methods since 1.5.0 are marked with a version tag by their name. Also, the old methods that have gained new features are now updated to reflect those changes. If you find any errors in the documentation, please report them on [the issue tracker](/contribute) or [the Core mailing list](/discuss).

Those who will *continue* to use version 1.5.0 can still use the docs without confusion, but---unless you have a compelling reason to do so---we urge you to upgrade to the new version. It's just so much better! ;)

Thanks to all the core members and contributors who made this release possible.

[Download Prototype 1.5.1](/download)

