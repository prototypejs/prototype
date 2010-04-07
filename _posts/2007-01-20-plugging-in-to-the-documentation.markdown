---
layout: blog_archive
author: Justin Palmer
author_url: http://alternateidea.com/
sections: Tools, blog
title: "Plugging In to the Documentation"
---

Wow, what an exciting first couple of days.  Yesterday alone, we received about 100,000 page views and the responses were overwhelmingly positive.  Amongst those responses, we've learned of a couple folks who are working on, or have created, some tools for the documentation.  I want to throw out a couple of ideas here, and talk about how developers can make use of the docs.  In addition to that, let's find out what tools are already available to help you work with Prototype and JavaScript in general.

### Atom to the rescue
One of the benefits of using [Mephisto](http://mephistoblog.com) to power this site is the way in which it supports atom feeds.  This opens the doors for some great uses of the documentation.  Based on the comments we've received, some folks have already started on some tools.

You can get an atom feed for any section of the Prototype API docs.  I've just added the official feed icon on the right side of the title for each *object* page.  I have plans to get these pages in [hAtom](http://microformats.org/wiki/hatom) format as well, but that'll come later on.  In the meantime, you can get the feeds by clicking the feed icon next to the title.  Feed URLs are also guessable.  If you wanted to get the feed for `Form.element`, you'd have something like this:

    language: html
    http://prototypejs.org/feed/api/form/element/atom.xml

### On to the tools
Ok, so what about those tools?  There are a variety of tools available to help you become a more efficient Prototype and JavaScript developer.  Here are some of the ones I'm aware of.

* **Quick API Search:** One commenter whipped up a quick bookmarklet for quickly accessing pages within the documentation.  You can get it by dragging <a href="javascript:p=prompt('Search Prototype API');if(p) { p=p.replace(/\./g, '/');window.location='http://prototypejs.org/api/'+p.toLowerCase();}">this link</a> to your bookmarks bar.

#### TextMate Plugins
* **Prototype Snippets and Language Grammar:** [Thomas Aylott](http://subtlegradient.com/) is a [TextMate](http://textmate.org) machine!  [Grab his TextMate bundle here](http://subtlegradient.com/articles/2006/07/17/textmate-javascript-prototype-script-aculo-us) chocked full of stuff for Prototype. I also believe he's working on a plugin for TextMate that would allow you to search the docs.  Who knows what else he'll throw in there.  I'm sure it will be great once he gets it finished.

* **Lint Checking and Compression:**
   Andrew has a nice [plugin for lint checking and compressing your code](http://www.andrewdupont.net/2006/10/01/javascript-tools-textmate-bundle/) (if you like that sort of thing).  It's a very handy tool that I abuse daily.

If you're aware of other tools for Prototype, let me know and I'll post them here.

### Some ideas to ponder (or take action on)
There are a lot of things we can do with the documentation.  Here are some of the things I've been thinking about.

* Firefox search plugin
* Firefox sidebar
* TextMate tooltips and search
* Integration with other editors (anyone know of something like this already?)

<a style="display:none;" href="http://www.technorati.com/claim/wmbmcmfqkt" rel="me">Technorati Profile</a>

