/** section: Language
 * class Template
 *
 *  A class for sophisticated string interpolation.
 *
 *  Any time you have a group of similar objects and you need to produce
 *  formatted output for these objects, maybe inside a loop, you typically
 *  resort to concatenating string literals with the object's fields:
 *
 *      "The TV show " + title + " was created by " + author + ".";
 *
 *  There's nothing wrong with this approach, except that it is hard to
 *  visualize the output immediately just by glancing at the concatenation
 *  expression. The [[Template]] class provides a much nicer and clearer way of
 *  achieving this formatting.
 *
 *  ##### Straightforward templates
 *
 *  The [[Template]] class uses a basic formatting syntax, similar to what is
 *  used in Ruby. The templates are created from strings that have embedded
 *  symbols in the form (e.g., `#{fieldName}`) that will be replaced by
 *  actual values when the template is applied (evaluated) to an object.
 *
 *      // the template (our formatting expression)
 *      var myTemplate = new Template(
 *       'The TV show #{title} was created by #{author}.');
 *
 *      // our data to be formatted by the template
 *      var show = {
 *        title: 'The Simpsons',
 *        author: 'Matt Groening',
 *        network: 'FOX'
 *      };
 *
 *      // let's format our data
 *      myTemplate.evaluate(show);
 *      // -> "The TV show The Simpsons was created by Matt Groening."
 *
 *  ##### Templates are meant to be reused
 *
 *  As the example illustrates, [[Template]] objects are not tied to specific
 *  data. The data is bound to the template only during the evaluation of the
 *  template, without affecting the template itself. The next example shows the
 *  same template being used with a handful of distinct objects.
 *
 *      // creating a few similar objects
 *      var conversion1 = { from: 'meters', to: 'feet', factor: 3.28 };
 *      var conversion2 = { from: 'kilojoules', to: 'BTUs', factor: 0.9478 };
 *      var conversion3 = { from: 'megabytes', to: 'gigabytes', factor: 1024 };
 *
 *      // the template
 *      var templ = new Template(
 *       'Multiply by #{factor} to convert from #{from} to #{to}.');
 *
 *      // let's format each object
 *      [conversion1, conversion2, conversion3].each( function(conv){
 *          templ.evaluate(conv);
 *      });
 *      // -> Multiply by 3.28 to convert from meters to feet.
 *      // -> Multiply by 0.9478 to convert from kilojoules to BTUs.
 *      // -> Multiply by 1024 to convert from megabytes to gigabytes.
 *
 *  ##### Escape sequence
 *
 *  There's always the chance that one day you'll need to have a literal in your
 *  template that looks like a symbol, but is not supposed to be replaced. For
 *  these situations there's an escape character: the backslash (`\\`).
 *
 *      // NOTE: you're seeing two backslashes here because the backslash
 *      // is also an escape character in JavaScript strings, so a literal
 *      // backslash is represented by two backslashes.
 *      var t = new Template(
 *       'in #{lang} we also use the \\#{variable} syntax for templates.');
 *      var data = { lang:'Ruby', variable: '(not used)' };
 *      t.evaluate(data);
 *      // -> in Ruby we also use the #{variable} syntax for templates.
 *
 *  ##### Custom syntaxes
 *
 *  The default syntax of the template strings will probably be enough for most
 *  scenarios. In the rare occasion where the default Ruby-like syntax is
 *  inadequate, there's a provision for customization. [[Template]]'s
 *  constructor accepts an optional second argument that is a regular expression
 *  object to match the replaceable symbols in the template string. Let's put
 *  together a template that uses a syntax similar to the now ubiquitous `{{ }}`
 *  constructs:
 *
 *      // matches symbols like '{{ field }}'
 *      var syntax = /(^|.|\r|\n)(\{{\s*(\w+)\s*}})/;
 *
 *      var t = new Template(
 *       '<div>Name: <b>{{ name }}</b>, Age: <b>{{ age }}</b></div>',
 *       syntax);
 *      t.evaluate( {name: 'John Smith', age: 26} );
 *      // -> <div>Name: <b>John Smith</b>, Age: <b>26</b></div>
 *
 *  There are important constraints to any custom syntax. Any syntax must
 *  provide at least three groupings in the regular expression. The first
 *  grouping is to capture what comes before the symbol, to detect the backslash
 *  escape character (no, you cannot use a different character). The second
 *  grouping captures the entire symbol and will be completely replaced upon
 *  evaluation. Lastly, the third required grouping captures the name of the
 *  field inside the symbol.
 *
**/
var Template = Class.create({
  /**
   *  new Template(template[, pattern = Template.Pattern])
   *
   *  Creates a Template object.
   *
   *  The optional `pattern` argument expects a `RegExp` that defines a custom
   *  syntax for the replaceable symbols in `template`.
  **/
  initialize: function(template, pattern) {
    this.template = template.toString();
    this.pattern = pattern || Template.Pattern;
  },

  /**
   *  Template#evaluate(object) -> String
   *
   *  Applies the template to `object`'s data, producing a formatted string
   *  with symbols replaced by `object`'s corresponding properties.
   *  
   *  #####  Examples
   *  
   *      var hrefTemplate = new Template('/dir/showAll?lang=#{language}&amp;categ=#{category}&amp;lv=#{levels}');
   *      var selection = {category: 'books' , language: 'en-US'};
   *      
   *      hrefTemplate.evaluate(selection);
   *      // -> '/dir/showAll?lang=en-US&amp;categ=books&amp;lv='
   *      
   *      hrefTemplate.evaluate({language: 'jp', levels: 3, created: '10/12/2005'});
   *      // -> '/dir/showAll?lang=jp&amp;categ=&amp;lv=3'
   *      
   *      hrefTemplate.evaluate({});
   *      // -> '/dir/showAll?lang=&amp;categ=&amp;lv='
   *      
   *      hrefTemplate.evaluate(null);
   *      // -> error !
  **/
  evaluate: function(object) {
    if (object && Object.isFunction(object.toTemplateReplacements))
      object = object.toTemplateReplacements();

    return this.template.gsub(this.pattern, function(match) {
      if (object == null) return (match[1] + '');

      var before = match[1] || '';
      if (before == '\\') return match[2];

      var ctx = object, expr = match[3],
          pattern = /^([^.[]+|\[((?:.*?[^\\])?)\])(\.|\[|$)/;
          
      match = pattern.exec(expr);
      if (match == null) return before;

      while (match != null) {
        var comp = match[1].startsWith('[') ? match[2].replace(/\\\\]/g, ']') : match[1];
        ctx = ctx[comp];
        if (null == ctx || '' == match[3]) break;
        expr = expr.substring('[' == match[3] ? match[1].length : match[0].length);
        match = pattern.exec(expr);
      }

      return before + String.interpret(ctx);
    });
  }
});
Template.Pattern = /(^|.|\r|\n)(#\{(.*?)\})/;
