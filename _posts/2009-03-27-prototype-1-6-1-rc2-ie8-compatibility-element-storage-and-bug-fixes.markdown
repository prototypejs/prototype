---
layout: blog_archive
author: Andrew Dupont
author_url: http://andrewdupont.net/
sections: Featured, Releases, blog
title: "Prototype 1.6.1 RC2: IE8 compatibility, Element storage, and bug fixes"
---

Today we tagged the first public release candidate of Prototype 1.6.1. (What happened to RC1? Long story.) While there are more minor fixes we&#8217;d like to get into this release, we decided an interim release was necessary because of the final release of <a href="http://www.microsoft.com/windows/Internet-explorer/default.aspx">Internet Explorer 8</a> last week.

<p>This is the first public release of Prototype that is fully compatible — and fully <em>optimized for</em> — Internet Explorer 8&#8217;s &#8220;super-standards&#8221; mode. In particular, Prototype now takes advantage of IE8&#8217;s support of the <a href="http://www.w3.org/TR/selectors-api/" title="Selectors API">Selectors API</a> and its ability to extend the prototypes of DOM elements.</p>

<h3 id="what8217s_new">What&#8217;s new?</h3>

<ul>
<li><strong>Full compatibility with Internet Explorer 8</strong>. <a href="http://thinkweb2.com/projects/prototype/" title="perfection kills">Juriy</a> has spearheaded the effort to replace most of our IE &#8220;sniffs&#8221; into outright capability checks — making it far easier to support IE8 in both &#8220;super-standards&#8221; mode and compatibility mode.</li>
<li><strong>Element storage</strong>, a feature <a href="http://prototypejs.org/2009/2/16/pimp-my-code-1-element-storage" title="Prototype JavaScript framework: Pimp My Code #1: Element.Storage">announced previously</a>. Safely associate complex metadata with individual elements.</li>
<li><strong><code>mouseenter</code> and <code>mouseleave</code></strong> events — simulating the IE-proprietary events that tend to be far more useful than <code>mouseover</code> and <code>mouseout</code>.</li>
<li><strong>An <code>Element#clone</code> method</strong> for cloning DOM nodes in a way that lets you perform &#8220;cleanup&#8221; on the new copies.</li>
</ul>

<h3 id="what8217s_been_improved">What&#8217;s been improved?</h3>

<ul>
<li>Better housekeeping on event handlers in order to prevent memory leaks.</li>
<li>Better performance in <code>Function#bind</code>, <code>Element#down</code>, and a number of other often-used methods.</li>
<li>A number of bug fixes.</li>
</ul>

<p>Consult the <a href="http://github.com/sstephenson/prototype/blob/6c38d842544159d2334f2252c9015c737d5046b0/CHANGELOG" title="CHANGELOG at 6c38d842544159d2334f2252c9015c737d5046b0 from sstephenson's prototype - GitHub">CHANGELOG</a> for more details.</p>

<p>In addition to the code itself, the 1.6.1 release features Prototype&#8217;s embrace of two other excellent projects we&#8217;ve been working on: <a href="http://getsprockets.org/" title="JavaScript dependency management and concatenation: Sprockets">Sprockets</a> (JavaScript concatenation) and <a href="http://pdoc.org/" title="PDoc">PDoc</a> (inline documentation). Sprockets is now used to &#8220;build&#8221; Prototype into a single file for distribution. PDoc will be the way we document the framework from now on. The official API docs aren&#8217;t quite ready yet, but they&#8217;ll be ready for the final release of 1.6.1.</p>

<h3 id="download_report_bugs_and_get_help">Download, Report Bugs, and Get Help</h3>

<ul>
<li><a href="http://cloud.github.com/downloads/sstephenson/prototype/prototype_1-6-1_rc2.js" onmouseup="if(urchinTracker) urchinTracker('download/prototype-1.6.1_rc2');">Download Prototype 1.6.1_rc2</a></li>
    <li><a href="https://prototype.lighthouseapp.com/projects/8886-prototype/overview">Submit bug reports</a> to Lighthouse</li>
    <li><a href="http://prototypejs.org/discuss">Get Prototype help</a> on the rails-spinoffs mailing list or #prototype <span class="caps">IRC</span> channel</li>
    <li><a href="http://groups.google.com/group/prototype-core">Interact with the Core Team</a> on the prototype-core mailing list</li>
</ul>

<p>Thanks to the many contributors who made this release possible!</p>


