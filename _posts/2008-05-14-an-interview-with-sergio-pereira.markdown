---
layout: blog_archive
author: Tobie Langel
author_url: http://tobielangel.com/
sections: Interviews, blog
title: "An Interview with Sergio Pereira"
---

<img src="http://prototypejs.org/assets/2008/5/11/sergio_small.jpg" style="float: left; margin-right: 10px" />
Last week, we launched a [Prototype Linkedin group](http://www.linkedin.com/e/gis/99273/13A82A188D9E), which, as of this writing, has more than 300 members. This was the occasion to get back in touch with a lot of people from the Prototype community, and to launch a project we've had in mind for a long time: regular interviews of developers and designers working with Prototype.

Today's interviewee is [Sergio Pereira](http://devlicio.us/blogs/sergio_pereira/).

<p class="question"><b>Your name is familiar to most early adopters of Prototype, but recent passengers on the Prototype bandwagon might not know you. Could you please introduce yourself?</b></p>

<p><span class="interviewee">Sergio Pereira:</span> Sure. I&#8217;m a software developer that has been paid to do that since 1997. Web development became the majority of my work in 2000 and that&#8217;s how things have been ever since. I have done some ASP classic, a ton of ASP.NET, some Ruby on Rails, and a tiny bit of PHP. ASP.NET still pays my bills, but I feel like RoR may be in my future.</p>

<p class="question"><b>When Prototype was still in its infancy, you were the first to document it. What was your motivation? What did you learn from it?</b></p>

<p><span class="interviewee">SP:</span> A friend of mine pointed me to the old Protoype page and, after perusing its source code, I asked the obvious two questions: &#8220;Is this really JavaScript?&#8221; and &#8220;What&#8217;s in this library?&#8221; I decided to take some time to study and understand the code. I knew I was not the only one that had a very superficial understanding of JavaScript, so I decided to take notes while I dissected that code and these notes became two different documents: <a href="http://www.sergiopereira.com/articles/prototype131.js.html">Developer Notes for prototype.js</a> and <a href="http://www.sergiopereira.com/articles/advjs.html">Quick guide to somewhat advanced JavaScript</a>. I also helped that I was learning Ruby and RoR at the same time and I benefited a lot from writing those docs. I still get a lot of hits and some emails about the articles. I hope they&#8217;ve helped somehow.</p>

<p class="question"><b>Most of your work involves .NET. While we were preparing this interview, you mentioned witnessing a lot of changes in the .NET landscape, notably with the introduction of <a href="http://www.asp.net/mvc/">ASP.NET MVC</a>. Can you tell us a bit more about this and how it affects Prototype?</b></p>

<p><span class="interviewee">SP:</span> ASP.NET development, traditionally, involves less HTML and JavaScript manipulation than, say, PHP and RoR. That&#8217;s not necessarily bad. It&#8217;s actually viewed as a good thing by most ASP.NET developers. Do you want a table with AJAX-ified sorting, pagination, in-place editing, etc? No big deal, just drag one from your toolbox on the design surface of your page and bind it to the data source and there you have it.</p>

<p>As TDD [Test-Driven Development] started to get greater adoption in .NET, the cracks in this style of development became apparent. Testing ASP.NET pages (the so called webforms) in isolation is impossible — or, at least, hard enough to become impractical. The Rails-inspired <a href="http://www.castleproject.org/monorail/">Castle MonoRail</a> project gave us a glimpse at how to properly structure a web development framework to support separation-of-concerns and inherently enable TDD.</p>

<p>In October of 2007 Microsoft revealed that they would be offering a similar solution in ASP.NET as an alternative to the existing webforms style. This alternative is called ASP.NET MVC. The creation of a view in ASP.NET MVC is closer to that of <a href="http://www.ruby-doc.org/stdlib/libdoc/erb/rdoc/">ERB</a>, where you define your UI much closer to the HTML than in webforms. That implies abandoning a lot of the pre-packaged components that we have in webforms and looking at alternative ways to get the same things done.</p>

<p>That&#8217;s where all these new JavaScript client libraries are becoming popular with ASP.NET developers. ASP.NET developers will soon go through the process of picking up a JavaScript library and adopting it as their company standard. Prototype and its surrounding ecosystem will undoubtedly be one of the most popular choices.</p>

<p class="question"><b>You&#8217;re mostly building applications for use on corporate intranets. How are you using Prototype in that context?</b></p>

<p><span class="interviewee">SP:</span> Coinciding with my interest in Prototype in the last few years, corporate development has also started to demand richer, more productive UIs. I remember seeing the surprise in some of my users&#8217; faces when they saw an InPlaceEditor from <a href="http://script.aculo.us/">script.aculo.us</a> and all the instant feedback provided by the use of <a href="http://www.prototypejs.org/api/ajax/request">Ajax.Request</a> and <a href="http://www.prototypejs.org/api/ajax/updater">Ajax.Updater</a>.</p>

<p>For me, what I like the most in Prototype is how well it lends itself to building your own libraries. I was able to create my own business-specific libraries on top of Prototype with a lot of clarity and extensibility. And all that was at least one full year before Microsoft had their own AJAX support for ASP.NET officially available.</p>

<p class="question"><b>Can you elaborate on the libraries you&#8217;ve built on top of Prototype? Maybe share some techniques, patterns or concepts?</b></p>

<p><span class="interviewee">SP:</span> For example, I was able to create UI classes (presenters if you will) that would bind to DOM elements and extend them with new behaviors, much like Draggables and InPlaceEditor do in script.aculo.us. In my case I created drop-down calendars and Ajax table paginators. I could extend <code>Ajax.Request</code> to detect session expiration and handle its unexpected server redirect.</p>

<p>I also added some more methods to <code>Element.Methods</code> that at the time (v1.4 or v1.5) I thought were useful, like:</p>

    Element#findParent('table');
    Element#append('a', { href: 'page.html', className: 'navLink' });
    Element#purgeChildren();

<p>A lot of what I have written is now obsolete with v1.6 and that&#8217;s great. I can&#8217;t wait to finish the migration to 1.6 and reduce my code surface.</p>

<p class="question"><b>Any other tips you&#8217;d like to share?</b></p>

<p><span class="interviewee">SP:</span> I don&#8217;t have any earth-shattering tips, but I am an advocate of <a href="http://c2.com/cgi/wiki?SharpenTheSaw">Sharpening the Saw</a> and becoming proficient in more than one language or platform. Basically try not to become content with the status quo.</p>

<p class="question"><b>You&#8217;re also writing training material for JavaScript classes. One of your forthcoming courses will be entitled <cite>Advanced JavaScript with Prototype and script.aculo.us</cite>. What are the things you emphasize the most in these courses? Which areas are the most troublesome?</b></p>

<p><span class="interviewee">SP:</span> The main problem with developers trying to use JavaScript, in my opinion, is the tendency to compare JavaScript to Java or C# just because some of the most trivial constructs are similar. JavaScript is fundamentally different from these two languages. For many developers JavaScript is the only dynamic language and the only prototypal-inheritance language they work with — and most of the time they don&#8217;t even know what that means and why they should care. I also try to make sure we talk about treating your JavaScript code with the same attitude as your server-side code: documentation, unit testing, organization, coding standards, etc.</p>

<p class="question"><b>Anything you&#8217;d like to add?</b></p>

<p><span class="interviewee">SP:</span> I&#8217;d like to leave a special message for any .NET developer reading this. Please don&#8217;t constrain your development to what comes bundled with Visual Studio or is downloadable from MSDN. Take a look at all the flourishing open-source projects out there. Check out <a href="http://altnetpedia.com/">ALT.NET</a> when you have a chance.</p>



