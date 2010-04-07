---
layout: blog_archive
author: Andrew Dupont
author_url: http://andrewdupont.net/
sections: Featured, blog
title: "Sprockets: Beautiful and angular"
---

<p><a href="http://www.37signals.com/svn/posts/1587-introducing-sprockets-javascript-dependency-management-and-concatenation" title="Introducing Sprockets: JavaScript dependency management and concatenation - (37signals)">Over at SvN</a>, Sam announced the 1.0 release of <a href="http://getsprockets.org/" title="JavaScript dependency management and concatenation: Sprockets">Sprockets</a>, the new dependency management and concatenation tool that makes it easy to modularize your JavaScript. Sprockets is Prototype&#8217;s new build system, but it&#8217;s also been <a href="http://github.com/sstephenson/sprockets/tree/master" title="sstephenson's sprockets at master - GitHub">extracted into a Ruby library</a> so <em>you</em> can use it anywhere you write JavaScript.</p>

<p>There are many great ways to use Sprockets in your own projects. You can use it the way Prototype does — split up your JavaScript into small, maintainable files, then <a href="http://github.com/sstephenson/prototype/blob/ab1313ea202e0d0bfb7cd0f563b035040710da9b/src/dom.js" title="src/dom.js at ab1313ea202e0d0bfb7cd0f563b035040710da9b from sstephenson's prototype - GitHub">create &#8220;meta-files&#8221;</a> that include the smaller files in a logical order. Prototype had previously been doing this with plain ERB; now we integrate Sprockets as a Git submodule and use it to build our distributable file.</p>

<p>Sprockets can also be used to write JavaScript &#8220;plugins&#8221;: bundles of files that can easily be integrated into existing code. With Sprockets, <a href="http://getsprockets.org/installation_and_usage#specifying_dependencies_with_the_require_directive" title="JavaScript dependency management and concatenation: Sprockets">you can formally declare</a> that <code>foo.js</code> depends on <code>thud.js</code>; when your files are concatenated into one output file, <code>thud.js</code> will be included first.</p>

<p>In addition, <a href="http://getsprockets.org/installation_and_usage#bundling_assets_with_the_provide_directive" title="JavaScript dependency management and concatenation: Sprockets">Sprockets lets JavaScript files <em>provide</em> other assets</a> — HTML, CSS, images, and the like. At build time, those assets will be copied into the document root of your server (in a way that preserves the sub-structure of directories within). This allows the plugin to refer to those assets via absolute URLs, instead of having to ask you where they&#8217;re located.</p>

<p>A few facts are worth special mention.</p>

<ul>
<li><strong>Sprockets does not require Prototype.</strong> Sprockets directives can be inserted into any arbitrary JavaScript file. You can use Sprockets in your build system no matter which JavaScript framework you prefer.</li>
<li><strong>Sprockets does not require Rails.</strong> Sam has also written an excellent <code>sprockets-rails</code> plugin, one which deftly applies the conventions of Rails plugins to JavaScript. But he has also written a <a href="http://github.com/sstephenson/sprockets/blob/e0ddeaf4c2f1e9e175df6dc909afd78057326a42/ext/nph-sprockets.cgi" title="ext/nph-sprockets.cgi at e0ddeaf4c2f1e9e175df6dc909afd78057326a42 from sstephenson's sprockets - GitHub">generic CGI wrapper around Sprockets</a> that is framework-agnostic. Or, instead, you can integrate Sprockets into your build cycle without bothering your server stack with the details. If you use Rake, you can do this with Ruby, as Prototype does; otherwise you can use the <code>sprocketize</code> binary from the command line.</li>
<li><strong>Sprockets-enabled JavaScript files can work just fine without Sprockets.</strong> If your plugin has its own &#8220;build stage,&#8221; then the distributable JavaScript will include no Sprockets directives. On the other hand, if your plugin is small enough not to require this overhead, your distributable can be a short JS file that declares its external dependencies at the top. Because <code>require</code> directives are an extension of comment syntax, they won&#8217;t confuse a JS interpreter.</li>
</ul>

<p>In short, we&#8217;re excited about what Sprockets means for the Prototype ecosystem. If you maintain a Prototype add-on library, the <a href="http://groups.google.com/group/prototype-core" title="Prototype: Core | Google Groups">prototype-core mailing list</a> would love to help you make it Sprockets-aware.</p>

<p>Now is the time on Sprockets when we dance.</p>


