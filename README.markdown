Prototype
=========

#### An object-oriented JavaScript framework ####

Prototype is a JavaScript framework that aims to ease development of dynamic 
web applications.  It offers a familiar class-style OO framework, extensive
Ajax support, higher-order programming constructs, and easy DOM manipulation.

### Targeted platforms ###

Prototype currently targets the following platforms:

* Microsoft Internet Explorer for Windows, version 6.0 and higher
* Mozilla Firefox 1.5 and higher
* Apple Safari 2.0.4 and higher
* Opera 9.25 and higher
* Chrome 1.0 and higher

Using Prototype
---------------

To use Prototype in your application, download the latest release from the 
Prototype web site (<http://prototypejs.org/download>) and copy 
`dist/prototype.js` to a suitable location. Then include it in your HTML
like so:

    <script type="text/javascript" src="/path/to/prototype.js"></script>

### Building Prototype from source ###

`prototype.js` is a composite file generated from many source files in 
the `src/` directory. To build Prototype, you'll need:

* a copy of the Prototype source tree, either from a distribution tarball or
  from the Git repository (see below)
* Ruby 1.8.2 or higher (<http://www.ruby-lang.org/>)
* Rake--Ruby Make (<http://rake.rubyforge.org/>)
* RDoc, if your Ruby distribution does not include it

From the root Prototype directory,

* `rake dist` will preprocess the Prototype source using Sprockets and 
  generate the composite `dist/prototype.js`.
* `rake package` will create a distribution tarball in the 
  `pkg/` directory.

Contributing to Prototype
-------------------------

Check out the Prototype source with 

    $ git clone git://github.com/sstephenson/prototype.git
    $ cd prototype
    $ git submodule init
    $ git submodule update vendor/sprockets vendor/pdoc vendor/unittest_js

Find out how to contribute: <http://prototypejs.org/contribute>.

Documentation
-------------

Please see the online Prototype API: <http://api.prototypejs.org>.