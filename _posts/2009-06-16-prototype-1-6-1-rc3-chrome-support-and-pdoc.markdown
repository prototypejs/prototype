---
layout: blog_archive
author: Andrew Dupont
author_url: http://andrewdupont.net/
sections: Featured, Releases, blog
title: "Prototype 1.6.1 RC3: Chrome support and PDoc"
---

Today we&#8217;re announcing Release Candidate 3 of Prototype 1.6.1. Among the highlights of this release are official Chrome support, improved IE8 compatibility, faster generation of API documentation with <a href="http://pdoc.org/" title="PDoc">PDoc</a>, and lots of bug fixes.

<h3 id="chrome_support">Chrome support</h3>

<p>Since <a href="http://www.google.com/chrome" title="Google Chrome - Download a new browser">Google Chrome</a> is a close sibling of Safari, Prototype has had excellent Chrome compatibility ever since the browser was first released. Now we&#8217;re making it official: Prototype supports Chrome 1.0 and greater.</p>

<p>If you have Chrome installed on your system (Windows only for now, even though early alphas exist for Mac), invoking <code>rake test</code> will run the unit tests in all locally-installed browsers, including Chrome. To run the unit tests in Chrome alone, try <code>rake test BROWSERS=chrome</code>.</p>

<h3 id="generate_your_own_docs_with_pdoc">Generate your own docs with PDoc</h3>

<p>It&#8217;s been a long, strange trip for <a href="http://pdoc.org/" title="PDoc">PDoc</a>, the inline-doc tool that will soon be for Prototype and <a href="http://script.aculo.us/" title="script.aculo.us - web 2.0 javascript">script.aculo.us</a> what <a href="http://rdoc.sourceforge.net/" title="RDoc - Document Generator for Ruby Source">RDoc</a> is for <a href="http://rubyonrails.org/" title="Ruby on Rails">Rails</a>. It started as Tobie&#8217;s brainchild over a year ago, but key contributions from <a href="http://jcoglan.com/" title="James Coglan">James Coglan</a> and <a href="http://github.com/samleb" title="samleb's Profile - GitHub">Samuel Lebeau</a> have helped to carry it across the finish line.</p>

<p>PDoc was a part of RC2, but has since been updated to make doc generation <em>much, much</em> faster. On my machine, a process that used to take 20 minutes now takes only <em>60 seconds</em>. Furthermore, we&#8217;ve solved a couple of minor issues that made it hard to build the docs on Windows.</p>

<p>Ever since Prototype 1.5, we&#8217;ve kept our documentation in <a href="http://mephistoblog.com/" title="Mephisto—The best blogging system ever">Mephisto</a>, the same engine that powers the rest of the site (and this blog). It&#8217;s served us well, but it meant that updating the docs became a chore that could only be started once we&#8217;d released a particular version. PDoc will make it far easier to maintain our documentation — and far easier to keep archival copies of the docs for older versions of Prototype.</p>

<p>Upon final release of 1.6.1, we&#8217;ll put the generated docs on this site, just like Rails hosts <a href="http://api.rubyonrails.org/" title="Rails Framework Documentation">its most recent stable documentation</a>. Until then, you can generate your own local docs by checking out the full source and running <code>rake doc</code> from the command line.</p>

<h3 id="other_improvements">Other improvements</h3>

<p>There have also been a number of bugs fixed since RC2 — including a heinous bug relating to <code>Event#observe</code> — and a number of key optimizations. We&#8217;ve further improved IE8 compatibility, solving some edge-case issues that popped up since RC2. Credit goes to Juriy (kangax), our newest team member, for working tirelessly these last few months to make 1.6.1 faster and less reliant on browser sniffs.</p>

<h3 id="download_report_bugs_and_get_help">Download, report bugs, and get help</h3>

<ul>
<li><a href="http://cloud.github.com/downloads/sstephenson/prototype/prototype_1-6-1_rc3.js">Download Prototype 1.6.1 RC3</a></li>
<li><a href="http://prototype.lighthouseapp.com">Submit bug reports</a> to Lighthouse</li>
<li><a href="/discuss">Get Prototype help</a> on the mailing list or <code>#prototype</code> IRC channel</li>
<li><a href="http://groups.google.com/group/prototype-core">Interact with the Core Team</a> on the protoype-core mailing list</li>
</ul>

<p>Thanks to the many contributors who made this release possible!</p>


