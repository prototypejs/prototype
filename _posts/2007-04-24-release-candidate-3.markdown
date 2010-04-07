---
layout: blog_archive
author: Tobie Langel
author_url: http://tobielangel.com/
sections: Releases, blog
title: "Release candidate 3"
---

[Prototype 1.5.1_rc3](http://prototypejs.org/assets/2007/4/24/prototype.js) is out!

Here's what's new:

#### Bug fixes
 * `Element.addMethods` now again adds the methods to Element. [[#7888]](http://dev.rubyonrails.org/ticket/7888)
 * `Form.request` also works with forms containing an input element with `name="action"`.  [[#8063]](http://dev.rubyonrails.org/ticket/8063)
 * Safari no longer crashes on `String#stripScripts` and `extractScripts` with large `<script>`.
 * `Form.disable` works again on non-form elements. [[#6887]](http://dev.rubyonrails.org/ticket/6887)
 * `String#endsWith` now always returns the correct value.  [[#7822]](http://dev.rubyonrails.org/ticket/7822)
 * Ajax responses with no Content-type header are no longer evaluated. [[#7827]](http://dev.rubyonrails.org/ticket/7827)
 * `Hash#toQueryString` again serializes undefined values to ensure consitency with `String#toQueryParams`. [[#7806]](http://dev.rubyonrails.org/ticket/7806)
 * Various fixes of the `$$()` utility. [[#7873]](http://dev.rubyonrails.org/ticket/7873), [[#7901]](http://dev.rubyonrails.org/ticket/7901)

#### Enhancements
* Ajax.Requests now supports per-request `onCreate` callbacks. [[#8011]](http://dev.rubyonrails.org/ticket/8011)
* JSON strings are automatically stripped of their security delimiters (if present) before `eval`.  More details on this security issue [here (PDF document)](http://www.fortifysoftware.com/servlet/downloads/public/JavaScript_Hijacking.pdf). [[#7910]](http://dev.rubyonrails.org/ticket/7910)
* all `toJSON` methods now generate YAML-loadable JSON.  [[#7883]](http://dev.rubyonrails.org/ticket/7883)
* `Event.element` now returns an extended element. [[#7870]](http://dev.rubyonrails.org/ticket/7870)
* Linefeed normalisation is now prevented in IE on `String#escapeHTML` and `String#unescapeHTML` for consistency with other browsers.
* Added a new `Element.childElements` method (shorter alias of `Element.immediateDescendants`).
* Added a new `Element.firstDescendant` method (same as using `Element.down` with no arguments).

#### Performance
* Faster `$$()` utility and `Element.getElemementsBySelector` method. [[#7873]](http://dev.rubyonrails.org/ticket/7873), [[#7901]](http://dev.rubyonrails.org/ticket/7901)
* Optimized `Element.next`, `Element.down`, `Element.up` and `Element.previous` DOM methods. [[#7848]](http://dev.rubyonrails.org/ticket/7848)
* Speed improvements of `String#escapeHTML` and `String#unescapeHTML` in IE and Safari.

You can also [view the full changelog](http://dev.rubyonrails.org/browser/spinoffs/prototype/tags/rel_1-5-1_rc3/CHANGELOG?rev=6603&format=raw).

If all goes well, this will be the last release candidate before 1.5.1 final, so we're counting on your zealous testing and bug reporting.

[Download Prototype 1.5.1_rc3](http://prototypejs.org/assets/2007/4/24/prototype.js).

