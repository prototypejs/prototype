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
   *  Note that `stripTags` will only strip HTML 4.01 tags &mdash; like `div`,
   *  `span`, and `abbr`. It _will not_ strip namespace-prefixed tags such
   *  as `h:table` or `xsl:template`.
   *
   *  <h5>Caveat User</h5>
   *
   *  Note that the processing `stripTags` does is good enough for most purposes, but
   *  you cannot rely on it for security purposes. If you're processing end-user-supplied
   *  content, `stripTags` is probably _not_ sufficiently robust to ensure that the content
   *  is completely devoid of HTML tags in the case of a user intentionally trying to circumvent
   *  tag restrictions. But then, you'll be running them through [[String#escapeHTML]] anyway,
   *  won't you?
  **/
  function stripTags() {
    return this.replace(/<\w+(\s+("[^"]*"|'[^']*'|[^>])+)?>|<\/\w+>/gi, '');
  }

  /**
   *  String#stripScripts() -> String
   *
   *  Strips a string of things that look like an HTML script blocks.
   *
   *  <h5>Example</h5>
   *
   *      "<p>This is a test.<script>alert("Look, a test!");</script>End of test</p>".stripScripts();
   *      // => "<p>This is a test.End of test</p>"
   *
   *  <h5>Caveat User</h5>
   *
   *  Note that the processing `stripScripts` does is good enough for most purposes,
   *  but you cannot rely on it for security purposes. If you're processing end-user-supplied
   *  content, `stripScripts` is probably not sufficiently robust to prevent hack attacks.
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
    var matchAll = new RegExp(Prototype.ScriptFragment, 'img'),
        matchOne = new RegExp(Prototype.ScriptFragment, 'im');
    return (this.match(matchAll) || []).map(function(scriptTag) {
      return (scriptTag.match(matchOne) || ['', ''])[1];
    });
  }

  /**
   *  String#evalScripts() -> Array
   *
   *  Evaluates the content of any inline `<script>` block present in the string.
   *  Returns an array containing the value returned by each script.
   *  `<script>`  blocks referencing external files will be treated as though
   *  they were empty (the result for that position in the array will be `undefined`);
   *  external files are _not_ loaded and processed by `evalScripts`.
   *
   *  <h5>About `evalScripts`, `var`s, and defining functions</h5>
   *
   *  `evalScripts` evaluates script blocks, but this **does not** mean they are
   *  evaluated in the global scope. They aren't, they're evaluated in the scope of
   *  the `evalScripts` method. This has important ramifications for your scripts:
   *
   *  * Anything in your script declared with the `var` keyword will be
   *    discarded momentarily after evaluation, and will be invisible to any
   *    other scope.
   *  * If any `<script>` blocks _define functions_, they will need to be assigned to
   *    properties of the `window` object.
   *
   *  For example, this won't work:
   *
   *      // This kind of script won't work if processed by evalScripts:
   *      function coolFunc() {
   *        // Amazing stuff!
   *      }
   *
   *  Instead, use the following syntax:
   *
   *      // This kind of script WILL work if processed by evalScripts:
   *      window.coolFunc = function() {
   *        // Amazing stuff!
   *      }
   *
   *  (You can leave off the `window.` part of that, but it's bad form.)
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
    return this.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }

  /** related to: String#escapeHTML
   *  String#unescapeHTML() -> String
   *
   *  Strips tags and converts the entity forms of special HTML characters
   *  to their normal form.
  **/
  function unescapeHTML() {
    // Warning: In 1.7 String#unescapeHTML will no longer call String#stripTags.
    return this.stripTags().replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&amp;/g,'&');
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
        var key = decodeURIComponent(pair.shift()),
            value = pair.length > 1 ? pair.join('=') : pair[0];
            
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
   *
   *  <h5>Examples</h5>
   *
   *      'background-color'.camelize();
   *      // -> 'backgroundColor'
   *
   *      '-moz-binding'.camelize();
   *      // -> 'MozBinding'
  **/
  function camelize() {
    return this.replace(/-+(.)?/g, function(match, chr) {
      return chr ? chr.toUpperCase() : '';
    });
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
    return this.replace(/::/g, '/')
               .replace(/([A-Z]+)([A-Z][a-z])/g, '$1_$2')
               .replace(/([a-z\d])([A-Z])/g, '$1_$2')
               .replace(/-/g, '_')
               .toLowerCase();
  }

  /**
   *  String#dasherize() -> String
   *
   *  Replaces every instance of the underscore character ("_") by a dash ("-").
  **/
  function dasherize() {
    return this.replace(/_/g, '-');
  }

  /** related to: Object.inspect
   *  String#inspect([useDoubleQuotes = false]) -> String
   *
   *  Returns a debug-oriented version of the string (i.e. wrapped in single or
   *  double quotes, with backslashes and quotes escaped).
  **/
  function inspect(useDoubleQuotes) {
    var escapedString = this.replace(/[\x00-\x1f\\]/g, function(character) {
      if (character in String.specialChar) {
        return String.specialChar[character];
      }
      return '\\u00' + character.charCodeAt().toPaddedString(2, 16);
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
    return this.replace(filter || Prototype.JSONFilter, '$1');
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
    // We use `lastIndexOf` instead of `indexOf` to avoid tying execution
    // time to string length when string doesn't start with pattern.
    return this.lastIndexOf(pattern, 0) === 0;
  }

  /**
   *  String#endsWith(substring) -> Boolean
   *
   *  Checks if the string ends with `substring`.
  **/
  function endsWith(pattern) {
    var d = this.length - pattern.length;
    // We use `indexOf` instead of `lastIndexOf` to avoid tying execution
    // time to string length when string doesn't end with pattern.
    return d >= 0 && this.indexOf(pattern, d) === d;
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
   *  Check if the string is "blank" &mdash; either empty (length of `0`) or containing
   *  only whitespace.
  **/
  function blank() {
    return /^\s*$/.test(this);
  }

  /**
   *  String#interpolate(object[, pattern]) -> String
   *
   *  Treats the string as a [[Template]] and fills it with `object`'s
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
    strip:          String.prototype.trim || strip,
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

