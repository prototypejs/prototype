---
layout: blog_archive
author: Tobie Langel
author_url: http://tobielangel.com/
sections: Featured, Interviews, blog
title: "An Interview with Piotr Dachtera"
---

<img src="http://prototypejs.org/assets/2008/5/28/piotrdachtera.jpg" style="float: left; margin-right: 10px" />

Piotr Dachtera is the lead developer behind the recently-launched <a href="http://live.chess.com/">Live Chess</a>, a Prototype-based, Comet-powered live chess game.

We talked to him about the client-side challenges he faced along the way.



<p class="question" style="clear: left;"><b>Hi, Piotr. Could you please introduce yourself?</b></p>

<span class="interviewee">Piotr Dachtera:</span> Sure. I'm currently the lead developer of the JavaScript/Ajax/Comet part of [chess.com](http://chess.com).

I've been dedicated to Web + chess applications since 1999. I've also been working on business software since 2000 (mainly [Java](http://java.sun.com/)). My interest in the game of chess was always pushing me forward and finally I think I can say I'm working on the number one web chess project.

<p class="question"><b>You've built <a href="http://live.chess.com/">Live Chess</a> using Prototype and <a href="http://script.aculo.us">script.aculo.us</a>. Can you tell us more about the application?</b></p>

<span class="interviewee">PD:</span> Chess community website users need to share things using a specific "language" which needs something more than plain text. They need to share game positions, whole chess games with analysis, and chess puzzles. Also, they want to play against each other.

<img src="/assets/2008/5/28/chess.jpg" alt="Screenshot of Live Chess" />

As we were starting to work on it all, I already had some experience with Prototype and script.aculo.us, and it was the natural choice.

We started with the interactive boards with draggable pieces, chess game parsers and things like that. Naturally, I had in mind that we were going to build something much more complex (the scalable real-time play server), so enclosing everything in reusable classes was the only solution. As it was always tempting to see what's inside Prototype, I was investigating its source all the time and I was trying to build my classes using the same style.

<p class="question"><b>Live Chess uses Comet to keep the chessboard synchronized. What made you choose that technology over ordinary Ajax?</b></p>

<span class="interviewee">PD:</span> The most important word in "Live Chess" is "live." We need things to happen instantly. We can't use polling to check every 10 seconds if anything changed.

If people want to play a game of chess in 2 minutes, they need some kind of _instant_ communication.

<p class="question"><b>Can you give us more details on the Comet implementation?</b></p>

<span class="interviewee">PD:</span> Working on my own proof-of-concept chess server in 2005, I "(re)invented" the Comet idea to allow this kind of communication... only to find out that people were using the same idea in simple chat apps.

The next step (which came with the new server built for the chess.com community and needed real scalability) was to use the idea of thread-less server solutions implemented in [Jetty](http://www.mortbay.org/) server and [ActiveMQ](http://activemq.apache.org/) to push messages between client and server. 

Finally, we switched to [Cometd/Bayeux](http://cometd.com/) with our own solution for guaranteed messaging and message ordering.

In all of these solutions, there was always Java on the server-side.

<p class="question"><b>What are you using Prototype for?</b></p>

<span class="interviewee">PD:</span> I started with script.aculo.us effects investigation which guided me directly to Prototype.

Currently, I'm not really a JavaScript developer. I'm a Prototype developer using the library everywhere.

<p class="question"><b>On top of Prototype and <a href="http://dojotoolkit.org">Dojo</a>, I saw you were also using <a href="http://extjs.com">ExtJS</a> in Live Chess. Was the integration of these three libraries seamless or were there issues?</b></p>

<span class="interviewee">PD:</span> We are using ExtJS with the [Prototype adapter](http://extjs.com/products/extjs/build/) so there was nothing really hard to do here.

Dojo things are completely separated from the rest of the system, but we had to use the library for Cometd communication. As a Prototype fan, I would be really happy to have a Cometd implementation built on top of Prototype, but currently I had to use Dojo in this area (which is sandboxed in a separate communication frame).

<p class="question"><b>What were the biggest challenges you faced with this application?</b></p>

<span class="interviewee">PD:</span> We still have lots of big challenges! But if I had to choose one, I would say: performance. Everybody wants to use Live Chess (and any other similar application) as if it was a desktop application.
As the system becomes heavier and more complex, we still have to work hard to keep it _smooth_.

