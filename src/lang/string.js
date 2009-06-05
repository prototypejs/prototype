/** section: Language
 * class String
 *  
 *  Extensions to the built-in `String` class.
 *  
 *  Prototype enhances the `String` object with a series of useful methods for
 *  ranging from the trivial to the complex. Tired of stripping trailing
 *  whitespace? Try [[String#strip]]. Want to replace `replace`? Have a look at
 *  [[String#sub]] and [[String#gsub]]. Need to parse a query string? We have
 *  [[String#toQueryParams]].
**/
Object.extend(String, {
  /**
   *  String.interpret(value) -> String
   *
   *  Coerces `value` into a string. Returns an empty string for `null`.
  **/
  interpret: function(value) {
    return value == null ? '' : String(value);
  },
  specialChar: {
    '\b': '\\b',
    '\t': '\\t',
    '\n': '\\n',
    '\f': '\\f',
    '\r': '\\r',
    '\\': '\\\\'
  }
});

Object.extend(String.prototype, (function() {
  
  function prepareReplacement(replacement) {
    if (Object.isFunction(replacement)) return replacement;
    var template = new Template(replacement);
    return function(match) { return template.evaluate(match) };
  }
  
  /**
   *  String#gsub(pattern, replacement) -> String
   *
   *  Returns the string with every occurence of a given pattern replaced by either
   *  a regular string, the returned value of a function or a [[Template]] string.
   *  The pattern can be a string or a regular expression.
  **/
  function gsub(pattern, replacement) {
    var result = '', source = this, match;
    replacement = prepareReplacement(replacement);
    
    if (Object.isString(pattern))
      pattern = RegExp.escape(pattern);

    if (!(pattern.length || pattern.source)) {
      replacement = replacement('');
      return replacement + source.split('').join(replacement) + replacement;
    }

    while (source.length > 0) {
      if (match = source.match(pattern)) {
        result += source.slice(0, match.index);
        result += String.interpret(replacement(match));
        source  = source.slice(match.index + match[0].length);
      } else {
        result += source, source = '';
      }
    }
    return result;
  }

  /**
   *  String#sub(pattern, replacement[, count = 1]) -> String
   *
   *  Returns a string with the first count occurrences of pattern replaced by either
   *  a regular string, the returned value of a function or a [[Template]] string.
   *  The pattern can be a string or a regular expression.
  **/
  function sub(pattern, replacement, count) {
    replacement = prepareReplacement(replacement);
    count = Object.isUndefined(count) ? 1 : count;

    return this.gsub(pattern, function(match) {
      if (--count < 0) return match[0];
      return replacement(match);
    });
  }

  /** related to: String#gsub
   *  String#scan(pattern, iterator) -> String
   *
   *  Allows iterating over every occurrence of the given pattern (which can be a 
   *  string or a regular expression).
   *  Returns the original string.
  **/
  function scan(pattern, iterator) {
    this.gsub(pattern, iterator);
    return String(this);
  }

  /**
   *  String#truncate([length = 30[, suffix = '...']]) -> String
   *
   *  Truncates a string to given `length` and appends `suffix` to it (indicating
   *  that it is only an excerpt).
  **/
  function truncate(length, truncation) {
    length = length || 30;
    truncation = Object.isUndefined(truncation) ? '...' : truncation;
    return this.length > length ? 
      this.slice(0, length - truncation.length) + truncation : String(this);
  }

  /**
   *  String#strip() -> String
   *
   *  Strips all leading and trailing whitespace from a string.
  **/
  function strip() {
    return this.replace(/^\s+/, '').replace(/\s+$/, '');
  }

  /**
   *  String#stripTags() -> String
   *
   *  Strips a string of any HTML tags.
   *
   *  Note that `stripTags` will only strip HTML 4.01 tags — like `div`,
   *  `span`, and `abbr`. It _will not_ strip namespace-prefixed tags such
   *  as `h:table` or `xsl:template`.
  **/
  function stripTags() {
    return this.replace(/<\w+(\s+("[^"]*"|'[^']*'|[^>])+)?>|<\/\w+>/gi, '');
  }

  /**
   *  String#stripScripts() -> String
   *
   *  Strips a string of anything that looks like an HTML script block.
  **/
  function stripScripts() {
    return this.replace(new RegExp(Prototype.ScriptFragment, 'img'), '');
  }

  /**
   *  String#extractScripts() -> Array
   *
   *  Extracts the content of any script blocks present in the string and
   *  returns them as an array of strings.
  **/
  function extractScripts() {
    var matchAll = new RegExp(Prototype.ScriptFragment, 'img');
    var matchOne = new RegExp(Prototype.ScriptFragment, 'im');
    return (this.match(matchAll) || []).map(function(scriptTag) {
      return (scriptTag.match(matchOne) || ['', ''])[1];
    });
  }

  /**
   *  String#evalScripts() -> Array
   *
   *  Evaluates the content of any script block present in the string.
   *  Returns an array containing the value returned by each script.
  **/
  function evalScripts() {
    return this.extractScripts().map(function(script) { return eval(script) });
  }

  /**
   *  String#escapeHTML() -> String
   *
   *  Converts HTML special characters to their entity equivalents.
  **/
  function escapeHTML() {
    escapeHTML.text.data = this;
    return escapeHTML.div.innerHTML;
  }

  /** related to: String#escapeHTML
   *  String#unescapeHTML() -> String
   *
   *  Strips tags and converts the entity forms of special HTML characters
   *  to their normal form.
  **/
  function unescapeHTML() {
    var div = document.createElement('div');
    div.innerHTML = this.stripTags();
    return div.childNodes[0] ? (div.childNodes.length > 1 ? 
      $A(div.childNodes).inject('', function(memo, node) { return memo+node.nodeValue }) : 
      div.childNodes[0].nodeValue) : '';
  }
  
  /**
   *  String#parseQuery([separator = '&']) -> Object
  **/

  /** alias of: String#parseQuery, related to: Hash#toQueryString
   *  String#toQueryParams([separator = '&']) -> Object
   *
   *  Parses a URI-like query string and returns an object composed of
   *  parameter/value pairs.
  **/
  function toQueryParams(separator) {
    var match = this.strip().match(/([^?#]*)(#.*)?$/);
    if (!match) return { };

    return match[1].split(separator || '&').inject({ }, function(hash, pair) {
      if ((pair = pair.split('='))[0]) {
        var key = decodeURIComponent(pair.shift());
        var value = pair.length > 1 ? pair.join('=') : pair[0];
        if (value != undefined) value = decodeURIComponent(value);

        if (key in hash) {
          if (!Object.isArray(hash[key])) hash[key] = [hash[key]];
          hash[key].push(value);
        }
        else hash[key] = value;
      }
      return hash;
    });
  }

  /**
   *  String#toArray() -> Array
   *
   *  Splits the string character-by-character and returns an array with
   *  the result.
  **/
  function toArray() {
    return this.split('');
  }

  /**
   *  String#succ() -> String
   *
   *  Used internally by ObjectRange.
   *  Converts the last character of the string to the following character in
   *  the Unicode alphabet.
  **/
  function succ() {
    return this.slice(0, this.length - 1) +
      String.fromCharCode(this.charCodeAt(this.length - 1) + 1);
  }

  /**
   *  String#times(count) -> String
   *
   *  Concatenates the string `count` times.
  **/
  function times(count) {
    return count < 1 ? '' : new Array(count + 1).join(this);
  }

  /**
   *  String#camelize() -> String
   *
   *  Converts a string separated by dashes into a camelCase equivalent. 
   *  For instance, 'foo-bar' would be converted to 'fooBar'.
  **/
  function camelize() {
    var parts = this.split('-'), len = parts.length;
    if (len == 1) return parts[0];

    var camelized = this.charAt(0) == '-' 
      ? parts[0].charAt(0).toUpperCase() + parts[0].substring(1)
      : parts[0];

    for (var i = 1; i < len; i++)
      camelized += parts[i].charAt(0).toUpperCase() + parts[i].substring(1);

    return camelized;
  }

  /**
   *  String#capitalize() -> String
   *
   *  Capitalizes the first letter of a string and downcases all the others.
  **/
  function capitalize() {
    return this.charAt(0).toUpperCase() + this.substring(1).toLowerCase();
  }

  /**
   *  String#underscore() -> String
   *
   *  Converts a camelized string into a series of words separated by an
   *  underscore (`_`).
  **/
  function underscore() {
    return this.gsub(/::/, '/').gsub(/([A-Z]+)([A-Z][a-z])/,'#{1}_#{2}').gsub(/([a-z\d])([A-Z])/,'#{1}_#{2}').gsub(/-/,'_').toLowerCase();
  }

  /**
   *  String#dasherize() -> String
   *
   *  Replaces every instance of the underscore character ("_") by a dash ("-").
  **/
  function dasherize() {
    return this.gsub(/_/,'-');
  }

  /** related to: Object.inspect
   *  String#inspect([useDoubleQuotes = false]) -> String
   *
   *  Returns a debug-oriented version of the string (i.e. wrapped in single or 
   *  double quotes, with backslashes and quotes escaped).
  **/
  function inspect(useDoubleQuotes) {
    var escapedString = this.gsub(/[\x00-\x1f\\]/, function(match) {
      var character = String.specialChar[match[0]];
      return character ? character : '\\u00' + match[0].charCodeAt().toPaddedString(2, 16);
    });
    if (useDoubleQuotes) return '"' + escapedString.replace(/"/g, '\\"') + '"';
    return "'" + escapedString.replace(/'/g, '\\\'') + "'";
  }

  /** related to: Object.toJSON
   *  String#toJSON() -> String
   *
   *  Returns a JSON string.
  **/
  function toJSON() {
    return this.inspect(true);
  }

  /**
   *  String#unfilterJSON([filter = Prototype.JSONFilter]) -> String
   *
   *  Strips comment delimiters around Ajax JSON or JavaScript responses.
   *  This security method is called internally.
  **/
  function unfilterJSON(filter) {
    return this.sub(filter || Prototype.JSONFilter, '#{1}');
  }

  /**
   *  String#isJSON() -> Boolean
   *
   *  Check if the string is valid JSON by the use of regular expressions. 
   *  This security method is called internally.
  **/
  function isJSON() {
    var str = this;
    if (str.blank()) return false;
    str = this.replace(/\\./g, '@').replace(/"[^"\\\n\r]*"/g, '');
    return (/^[,:{}\[\]0-9.\-+Eaeflnr-u \n\r\t]*$/).test(str);
  }

  /**
   *  String#evalJSON([sanitize = false]) -> object
   *
   *  Evaluates the JSON in the string and returns the resulting object.
   *  
   *  If the optional `sanitize` parameter is set to `true`, the string is
   *  checked for possible malicious attempts; if one is detected, `eval`
   *  is _not called_.
  **/
  function evalJSON(sanitize) {
    var json = this.unfilterJSON();
    try {
      if (!sanitize || json.isJSON()) return eval('(' + json + ')');
    } catch (e) { }
    throw new SyntaxError('Badly formed JSON string: ' + this.inspect());
  }

  /**
   *  String#include(substring) -> Boolean
   *
   *  Checks if the string contains `substring`.
  **/
  function include(pattern) {
    return this.indexOf(pattern) > -1;
  }

  /**
   *  String#startsWith(substring) -> Boolean
   *
   *  Checks if the string starts with `substring`.
  **/
  function startsWith(pattern) {
    return this.indexOf(pattern) === 0;
  }

  /**
   *  String#endsWith(substring) -> Boolean
   *
   *  Checks if the string ends with `substring`.
  **/
  function endsWith(pattern) {
    var d = this.length - pattern.length;
    return d >= 0 && this.lastIndexOf(pattern) === d;
  }

  /**
   *  String#empty() -> Boolean
   *
   *  Checks if the string is empty.
  **/
  function empty() {
    return this == '';
  }

  /**
   *  String#blank() -> Boolean
   *
   *  Check if the string is "blank" — either empty (length of `0`) or containing
   *  only whitespace.
  **/
  function blank() {
    return /^\s*$/.test(this);
  }

  /**
   *  String#interpolate(object[, pattern]) -> String
   *
   *  Treats the string as a [[Template]] and fills it with `object`’s
   *  properties.
  **/
  function interpolate(object, pattern) {
    return new Template(this, pattern).evaluate(object);
  }
  
  return {
    gsub:           gsub,
    sub:            sub,
    scan:           scan,
    truncate:       truncate,
    // Firefox 3.5+ supports String.prototype.trim
    // (`trim` is ~ 5x faster than `strip` in FF3.5)
    strip:          String.prototype.trim ? String.prototype.trim : strip,
    stripTags:      stripTags,
    stripScripts:   stripScripts,
    extractScripts: extractScripts,
    evalScripts:    evalScripts,
    escapeHTML:     escapeHTML,
    unescapeHTML:   unescapeHTML,
    toQueryParams:  toQueryParams,
    parseQuery:     toQueryParams,
    toArray:        toArray,
    succ:           succ,
    times:          times,
    camelize:       camelize,
    capitalize:     capitalize,
    underscore:     underscore,
    dasherize:      dasherize,
    inspect:        inspect,
    toJSON:         toJSON,
    unfilterJSON:   unfilterJSON,
    isJSON:         isJSON,
    evalJSON:       evalJSON,
    include:        include,
    startsWith:     startsWith,
    endsWith:       endsWith,
    empty:          empty,
    blank:          blank,
    interpolate:    interpolate
  };
})());

Object.extend(String.prototype.escapeHTML, {
  div:  document.createElement('div'),
  text: document.createTextNode('')
});

String.prototype.escapeHTML.div.appendChild(String.prototype.escapeHTML.text);

if ('<\n>'.escapeHTML() !== '&lt;\n&gt;') {
  String.prototype.escapeHTML = function() {
    return this.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  };
}

if ('&lt;\n&gt;'.unescapeHTML() !== '<\n>') {
  String.prototype.unescapeHTML = function() {
    return this.stripTags().replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&amp;/g,'&');
  };
}