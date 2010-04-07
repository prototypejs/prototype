---
layout: default
title: "Blog"
---
{% assign year = site.posts.first.date  %}
{% assign year = year | date: '%Y' | to_i   %}

{{ year }}

{% for post in site.posts %}
  * {{ post.date | date: '%B %e, %Y'}} – [{{ post.title }}]({{ post.url }})
{% endfor %}