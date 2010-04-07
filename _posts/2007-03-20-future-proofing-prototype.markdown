---
layout: blog_archive
author: Tobie Langel
author_url: http://tobielangel.com/
sections: General, blog
title: "Future-proofing Prototype"
---

[John Resig](http://ejohn.org), best known for his [jQuery](http://jquery.com/) JavaScript library and his work at Mozilla, has just posted [instructions on testing Prototype against the latest alpha builds of Firefox 3](http://ejohn.org/blog/testing-prototype-with-firefox-3/).

While this doesn't sound so spectacular at first (nothing prevented you from doing so yourself up to now), it's actually great news for Prototype as it's part of a much larger project recently undertook by Mozilla.

Mozilla has decided to include the test suites of popular JavaScript libraries _directly inside the Mozilla test system_. This means that the developers working on Firefox 3 will run these test suites on a regular basis, probably before each commit.

You can [read more about this project](http://ejohn.org/blog/future-proofing-javascript-libraries/) over at John's blog.

The benefits for Prototype, and for the other libraries which will be included shortly, are obviously huge. We'll be made aware of unavoidable regression bugs really early in the developing process and we'll probably avoid many which could have slipped unnoticed without this undertaking.

If we're lucky, this initiative will push other browser vendors to jump in the bandwagon. And we'll be there to help them make it possible should they decide to do so.

