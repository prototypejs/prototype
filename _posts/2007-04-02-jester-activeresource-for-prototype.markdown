---
layout: blog_archive
author: Justin Palmer
author_url: http://alternateidea.com/
sections: Tools, blog
title: "Jester:  ActiveResource for Prototype"
---

The folks over at [thoughtbot, inc.](http://thoughtbot.com/) have released [Jester](http://giantrobots.thoughtbot.com/2007/4/2/jester-javascriptian-rest), an almost identical port of Rails' ActiveResource to JavaScript.


Here is some sample code showing associations (hijacked directly from the blog post):

    >>> eric = User.find(1)
    GET http://localhost:3000/users/1.xml
    Object _name=User _singular=user _plural=users
    
    >>> eric.posts
    [Object _name=Post _singular=post _plural=posts, Object _name=Post _singular=post _plural=posts]
    
    >>> eric.posts.first().body
    "Today I passed the bar exam. Tomorrow, I make Nancy my wife."
    >>> eric.posts.first().body = "Today I *almost* passed the bar exam. The ring waits one more day."
    "Today I *almost* passed the bar exam. The ring waits one more day."
    
    >>> eric.posts.first().save()
    POST http://localhost:3000/posts/1.xml
    true
    
    >>> post = Post.find(1)
    GET http://localhost:3000/posts/1.xml
    Object _name=Post _singular=post _plural=posts
    
    >>> post.body
    "Today I *almost* passed the bar exam. The ring waits one more day."
    >>> post.user
    Object _name=User _singular=user _plural=users
    >>> post.user.name
    "Eric Mill"

[Hop over to GIANT ROBOTS SMASHING INTO OTHER GIANT ROBOTS](http://giantrobots.thoughtbot.com/2007/4/2/jester-javascriptian-rest) (cool name eh?) for the full scoop, code, and to give those guys your feedback.

