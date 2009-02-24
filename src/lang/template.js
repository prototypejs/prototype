/** section: lang
 * class Template
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
   *  Applies the template to given `object`’s data, producing a formatted string
   *  with symbols replaced by corresponding object’s properties.
  **/
  evaluate: function(object) {
    if (Object.isFunction(object.toTemplateReplacements))
      object = object.toTemplateReplacements();

    return this.template.gsub(this.pattern, function(match) {
      if (object == null) return '';
      
      var before = match[1] || '';
      if (before == '\\') return match[2];
      
      var ctx = object, expr = match[3];
      var pattern = /^([^.[]+|\[((?:.*?[^\\])?)\])(\.|\[|$)/;
      match = pattern.exec(expr);
      if (match == null) return before;

      while (match != null) {
        var comp = match[1].startsWith('[') ? match[2].gsub('\\\\]', ']') : match[1];
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
