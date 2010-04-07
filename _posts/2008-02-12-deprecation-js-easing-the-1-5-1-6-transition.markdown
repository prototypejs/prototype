---
layout: blog_archive
author: Andrew Dupont
author_url: http://andrewdupont.net/
sections: blog
title: "Deprecation.js: easing the 1.5 → 1.6 transition"
---

If you've put off the task of upgrading your old code to Prototype 1.6, now you're out of excuses. Core team member Tobie Langel has developed a script that will warn you of any deprecations or API changes.

The script is meant to be used with Firebug, so it's Firefox-only — but when you're done, your code will be ready for use alongside Prototype 1.6 <em>in all browsers</em>.

<img src="/assets/2008/2/12/console1_1.png" alt="deprecation.js screenshot" />

Using the script is easy. To migrate a page from 1.5 to 1.6:

1. Find the <code>script</code> tag that references <code>prototype.js</code>. Change the path to point to the 1.6.0.2 version (or else overwrite the existing <code>prototype.js</code> with the new version).
2. <em>On the very next line</em>, add a <code>script</code> tag that references <code>deprecation.js</code>. 
3. Develop your app as normal.

When your code calls a method that's been deprecated, replaced, or modified, the script will log a warning or error to your Firebug console. Clicking its hyperlink will take you to the deprecation script itself, which isn't all that helpful; but the message <em>itself</em> will contain a stack trace that points to the source of the error.

Naturally, the console errors are the most important to address, since they represent things that will <em>no longer work</em> in 1.6. The warnings represent deprecations — things that still work in 1.6, but are not guarateed to work in <em>future</em> versions of Prototype. If you'd like to see only removal notices, you can set a property in your code to turn off deprecations:

    DeprecationNotifier.logDeprecation = false;

As you address these errors and warnings, they'll go away. When there are no more errors, your code is compatible with 1.6. When there are no more warnings, your code is nimble and future-proof.

<a href="/assets/2008/2/12/deprecation.js">Download the deprecation script</a>.

