---
layout: blog_archive
author: Andrew Dupont
author_url: http://andrewdupont.net/
sections: Featured, Releases, blog
title: "Prototype 1.6.0.3: A long-awaited bugfix release"
---

<p>Yesterday we released Prototype 1.6.0.3, the result of some much-needed bug fixes, and a stopgap release on the road to 1.6.1.</p>

<p>It&#8217;s a backwards-compatible, drop-in replacement recommended for all users of Prototype 1.6. We&#8217;ve fixed 30 bugs and made 25 other improvements to our already-rock-solid library.</p>

<p>Developers who follow along in Git might&#8217;ve noticed that the repository has seen <em>a lot</em> of disruptive activity in the last few days as we reassessed many of the commits that had gone into the library since April. Rather than try to fit too many fixes into one release, we decided to scale back and release 1.6.0.3 with the set of improvements we were in complete agreement on.</p>

<p>Because of the way we handled this overhaul, those who try to update their Git working copies to the latest trunk will encounter conflicts, <em>even if they hadn&#8217;t made local changes</em>. </p>

<p>Here&#8217;s how we recommend bringing your working copy up to date:</p>

<ol>
<li>First, if you&#8217;ve made any local changes, please create a new branch so that those changes aren&#8217;t lost.</li>
<li><p>On your local master branch, run:</p>
<pre><code>git fetch origin master
git reset --hard 34ee207</code></pre>
<p>The first line fetches the new commits without trying to apply them to your local copy. The second line resets your master branch to be in sync with the latest revision.</p>
</li>
<li>From there, you can cherry-pick from your branch any local commits you made (though you may have to do some manual merging).</li>
</ol>



<h3>Download, report bugs, and get help</h3>


	<ul>
	<li><a href="http://cloud.github.com/downloads/sstephenson/prototype/prototype_1-6-0-3.js">Download Prototype 1.6.0.3</a></li>
		<li><a href="http://prototype.lighthouseapp.com/projects/8886-prototype">Submit bug reports</a> to Lighthouse</li>
		<li><a href="http://prototypejs.org/discuss">Get Prototype help</a> on the Prototype & script.aculo.us mailing list or #prototype <span class="caps">IRC</span> channel</li>
		<li><a href="http://groups.google.com/group/prototype-core">Interact with the Core Team</a> on the prototype-core mailing list</li>
	</ul>


	<p>As always, thanks to the core team and the many users who contributed bug reports and well-tested patches for this release.</p>



