//= compat
//= require "dom/dom"
//= require "dom/layout"
//= require "dom/selector"
//= require <selector_engine>
//= require "dom/form"
//= require "dom/event"

/**
 *  == DOM ==
 *
 *  Extensions to DOM elements, plus other utilities for DOM traversal
 *  and modification.
 *
 *  Prototype's DOM extensions represent a large portion of where you'll spend
 *  your time. Prototype adds many convenience methods to elements returned by
 *  the [[$]] function. For instance, you can write
 *
 *      $('comments').addClassName('active').show();
 *
 *  to get the element with the ID of `comments`, add a class name to it, and
 *  show it (if it was previously hidden).
 *
 *  In other words, Prototype adds "instance" methods to DOM nodes. This is
 *  made possible by direct extension of the backing DOM objects (in browsers
 *  that support it) and by manual extension of individual nodes (in browsers
 *  that do not).
 *
**/

Element.addMethods();
