var attackTarget;
var evalScriptsCounter = 0,
    largeTextEscaped = '&lt;span&gt;test&lt;/span&gt;',
    largeTextUnescaped = '<span>test</span>';
(2048).times(function(){
  largeTextEscaped += ' ABC';
  largeTextUnescaped += ' ABC';
});


///

suite('String', function () {
  this.name = 'string';

  test('.interpret', function () {
    assert.strictEqual('true', String.interpret(true));
    assert.strictEqual('123',  String.interpret(123));
    assert.strictEqual('foo bar', String.interpret('foo bar'));
    assert.strictEqual(
      'object string',
      String.interpret({ toString: function (){ return 'object string'; } })
    );
    assert.strictEqual('0', String.interpret(0));
    assert.strictEqual('false', String.interpret(false));
    assert.strictEqual('', String.interpret(undefined));
    assert.strictEqual('', String.interpret(null));
    assert.strictEqual('', String.interpret(''));
  });

  test('#gsub (with replacement function)', function () {
    var source = 'foo boo boz';

    assert.equal('Foo Boo BoZ',
      source.gsub(/[^o]+/, function(match) {
        return match[0].toUpperCase();
      }));
    assert.equal('f2 b2 b1z',
      source.gsub(/o+/, function(match) {
        return match[0].length;
      }));
    assert.equal('f0 b0 b1z',
      source.gsub(/o+/, function(match) {
        return match[0].length % 2;
      }));
  });

  test('#gsub (with replacement string)', function () {
    var source = 'foo boo boz';

    assert.equal('foobooboz',
      source.gsub(/\s+/, ''));
    assert.equal('  z',
      source.gsub(/(.)(o+)/, ''));

    assert.equal('ウィメンズ2007<br/>クルーズコレクション',
      'ウィメンズ2007\nクルーズコレクション'.gsub(/\n/,'<br/>'));
    assert.equal('ウィメンズ2007<br/>クルーズコレクション',
      'ウィメンズ2007\nクルーズコレクション'.gsub('\n','<br/>'));

    assert.equal('barfbarobarobar barbbarobarobar barbbarobarzbar',
      source.gsub('', 'bar'));
    assert.equal('barfbarobarobar barbbarobarobar barbbarobarzbar',
      source.gsub(new RegExp(''), 'bar'));
  });

  test('#gsub (with replacement template string)', function () {
    var source = 'foo boo boz';

    assert.equal('-oo-#{1}- -oo-#{1}- -o-#{1}-z',
      source.gsub(/(.)(o+)/, '-#{2}-\\#{1}-'));
    assert.equal('-foo-f- -boo-b- -bo-b-z',
      source.gsub(/(.)(o+)/, '-#{0}-#{1}-'));
    assert.equal('-oo-f- -oo-b- -o-b-z',
      source.gsub(/(.)(o+)/, '-#{2}-#{1}-'));
    assert.equal('  z',
      source.gsub(/(.)(o+)/, '#{3}'));
  });

  test('#gsub (with troublesome characters)', function () {
    assert.equal('ab', 'a|b'.gsub('|', ''));
    assert.equal('ab', 'ab(?:)'.gsub('(?:)', ''));
    assert.equal('ab', 'ab()'.gsub('()', ''));
    assert.equal('ab', 'ab'.gsub('^', ''));
    assert.equal('ab', 'a?b'.gsub('?', ''));
    assert.equal('ab', 'a+b'.gsub('+', ''));
    assert.equal('ab', 'a*b'.gsub('*', ''));
    assert.equal('ab', 'a{1}b'.gsub('{1}', ''));
    assert.equal('ab', 'a.b'.gsub('.', ''));
  });

  test('#gsub (with zero-length match)', function () {
    assert.equal('ab', 'ab'.gsub('', ''));
    assert.equal('a', 'a'.gsub(/b*/, 'c'));
    assert.equal('abc', 'abc'.gsub(/b{0}/, ''));
  });

  test('#sub (with replacement function)', function () {
    var source = 'foo boo boz';

    assert.equal('Foo boo boz',
      source.sub(/[^o]+/, function(match) {
        return match[0].toUpperCase();
      }), 1);
    assert.equal('Foo Boo boz',
      source.sub(/[^o]+/, function(match) {
        return match[0].toUpperCase();
      }, 2), 2);
    assert.equal(source,
      source.sub(/[^o]+/, function(match) {
        return match[0].toUpperCase();
      }, 0), 0);
    assert.equal(source,
      source.sub(/[^o]+/, function(match) {
        return match[0].toUpperCase();
      }, -1), -1);
  });

  test('#sub (with replacement string)', function () {
    var source = 'foo boo boz';

    assert.equal('oo boo boz',
      source.sub(/[^o]+/, ''));
    assert.equal('oooo boz',
      source.sub(/[^o]+/, '', 2));
    assert.equal('-f-oo boo boz',
      source.sub(/[^o]+/, '-#{0}-'));
    assert.equal('-f-oo- b-oo boz',
      source.sub(/[^o]+/, '-#{0}-', 2));
  });

  test('#scan', function () {
    var source = 'foo boo boz', results = [];
    var str = source.scan(/[o]+/, function(match) {
      results.push(match[0].length);
    });
    assert.enumEqual([2, 2, 1], results);
    assert.equal(source, source.scan(/x/, function () {
      assert(false, 'this iterator should never get called');
    }));
    assert(typeof str == 'string');
  });

  test('#toArray', function () {
    assert.enumEqual([],''.toArray());
    assert.enumEqual(['a'],'a'.toArray());
    assert.enumEqual(['a','b'],'ab'.toArray());
    assert.enumEqual(['f','o','o'],'foo'.toArray());
  });

  test('#camelize', function () {
    assert.equal('', ''.camelize());
    assert.equal('', '-'.camelize());
    assert.equal('foo', 'foo'.camelize());
    assert.equal('foo_bar', 'foo_bar'.camelize());
    assert.equal('FooBar', '-foo-bar'.camelize());
    assert.equal('FooBar', 'FooBar'.camelize());

    assert.equal('fooBar', 'foo-bar'.camelize());
    assert.equal('borderBottomWidth', 'border-bottom-width'.camelize());

    assert.equal('classNameTest','class-name-test'.camelize());
    assert.equal('classNameTest','className-test'.camelize());
    assert.equal('classNameTest','class-nameTest'.camelize());
  });

  test('#capitalize', function () {
    assert.equal('',''.capitalize());
    assert.equal('Ä','ä'.capitalize());
    assert.equal('A','A'.capitalize());
    assert.equal('Hello','hello'.capitalize());
    assert.equal('Hello','HELLO'.capitalize());
    assert.equal('Hello','Hello'.capitalize());
    assert.equal('Hello world','hello WORLD'.capitalize());
  });

  test('#underscore', function () {
    assert.equal('', ''.underscore());
    assert.equal('_', '-'.underscore());
    assert.equal('foo', 'foo'.underscore());
    assert.equal('foo', 'Foo'.underscore());
    assert.equal('foo_bar', 'foo_bar'.underscore());
    assert.equal('border_bottom', 'borderBottom'.underscore());
    assert.equal('border_bottom_width', 'borderBottomWidth'.underscore());
    assert.equal('border_bottom_width', 'border-Bottom-Width'.underscore());    });

  test('#dasherize', function () {
    assert.equal('', ''.dasherize());
    assert.equal('foo', 'foo'.dasherize());
    assert.equal('Foo', 'Foo'.dasherize());
    assert.equal('foo-bar', 'foo-bar'.dasherize());
    assert.equal('border-bottom-width', 'border_bottom_width'.dasherize());
  });

  test('#truncate', function () {
    var source = 'foo boo boz foo boo boz foo boo boz foo boo boz';
    assert.equal(source, source.truncate(source.length));
    assert.equal('foo boo boz foo boo boz foo...', source.truncate(0));
    assert.equal('fo...', source.truncate(5));
    assert.equal('foo b', source.truncate(5, ''));

    assert(typeof 'foo'.truncate(5) == 'string');
    assert(typeof 'foo bar baz'.truncate(5) == 'string');
  });

  test('#strip', function () {
    assert.equal('hello world', '   hello world  '.strip());
    assert.equal('hello world', 'hello world'.strip());
    assert.equal('hello  \n  world', '  hello  \n  world  '.strip());
    assert.equal('', ' '.strip());
  });

  test('#stripTags', function () {
    assert.equal('hello world', 'hello world'.stripTags());
    assert.equal('hello world', 'hello <span>world</span>'.stripTags());
    assert.equal('hello world', '<a href="#" onclick="moo!">hello</a> world'.stripTags());
    assert.equal('hello world', 'h<b><em>e</em></b>l<i>l</i>o w<span class="moo" id="x"><b>o</b></span>rld'.stripTags());
    assert.equal('1\n2', '1\n2'.stripTags());
    assert.equal('one < two blah baz', 'one < two <a href="#" title="foo > bar">blah</a> <input disabled>baz'.stripTags());
    assert.equal('hello world abc', 'hello world <br/>abc'.stripTags());
    assert.equal('hello world abc', 'hello world <br />abc'.stripTags());
    assert.equal('hello world abc', 'hello<br/> <p>world</p><br /> <hr/>abc'.stripTags());
  });

  test('#stripScripts', function () {
    assert.equal('foo bar', 'foo bar'.stripScripts());
    assert.equal('foo bar', ('foo <script>boo();<'+'/script>bar').stripScripts());
    assert.equal('foo bar', ('foo <script type="text/javascript">boo();\nmoo();<'+'/script>bar').stripScripts());

    assert.equal('foo bar', ('foo <script>boo();<'+'/script >bar').stripScripts(),
     'should properly handle whitespace in closing tag');
  });

  test('#extractScripts', function () {
    assert.enumEqual([], 'foo bar'.extractScripts());
    assert.enumEqual(['boo();'], ('foo <script>boo();<'+'/script>bar').extractScripts());
    assert.enumEqual(['boo();','boo();\nmoo();'],
      ('foo <script>boo();<'+'/script><script type="text/javascript">boo();\nmoo();<'+'/script>bar').extractScripts());
    assert.enumEqual(['boo();','boo();\nmoo();'],
      ('foo <script>boo();<'+'/script>blub\nblub<script type="text/javascript">boo();\nmoo();<'+'/script>bar').extractScripts());

    assert.enumEqual([], ('<' + 'script type="x-something">wat();<' + '/script>').extractScripts());
    assert.enumEqual(['wat();'], ('<' + 'script type="text/javascript">wat();<' + '/script>').extractScripts());
  });

  test('#evalScripts', function () {
    assert.equal(0, evalScriptsCounter);

    ('foo <script>evalScriptsCounter++<'+'/script>bar').evalScripts();
    assert.equal(1, evalScriptsCounter);

    var stringWithScripts = '';
    (3).times(function(){ stringWithScripts += 'foo <script>evalScriptsCounter++<'+'/script>bar' });
    stringWithScripts.evalScripts();
    assert.equal(4, evalScriptsCounter);

   // Other executable MIME-types.
    ('foo <script type="text/javascript">evalScriptsCounter++<'+'/script>bar')
      .evalScripts();
    ('foo <script type="application/javascript">evalScriptsCounter++<'+'/script>bar')
      .evalScripts();
    ('foo <script type="application/x-javascript">evalScriptsCounter++<'+'/script>bar')
      .evalScripts();
    ('foo <script type="text/x-javascript">evalScriptsCounter++<'+'/script>bar')
      .evalScripts();
    ('foo <script type="application/ecmascript">evalScriptsCounter++<'+'/script>bar')
      .evalScripts();
    ('foo <script type="text/ecmascript">evalScriptsCounter++<'+'/script>bar')
      .evalScripts();

    assert.equal(10, evalScriptsCounter);

    // a wrong one
    ('foo <script type="text/x-dot-template">evalScriptsCounter++<'+'/script>bar').evalScripts();

    assert.equal(10, evalScriptsCounter);
  });

  test('#escapeHTML', function () {
    assert.equal('foo bar', 'foo bar'.escapeHTML());
    assert.equal('foo &lt;span&gt;bar&lt;/span&gt;', 'foo <span>bar</span>'.escapeHTML());
    assert.equal('foo ß bar', 'foo ß bar'.escapeHTML());

    assert.equal('ウィメンズ2007\nクルーズコレクション',
      'ウィメンズ2007\nクルーズコレクション'.escapeHTML());

    assert.equal('a&lt;a href="blah"&gt;blub&lt;/a&gt;b&lt;span&gt;&lt;div&gt;&lt;/div&gt;&lt;/span&gt;cdef&lt;strong&gt;!!!!&lt;/strong&gt;g',
      'a<a href="blah">blub</a>b<span><div></div></span>cdef<strong>!!!!</strong>g'.escapeHTML());

    assert.equal(largeTextEscaped, largeTextUnescaped.escapeHTML());

    assert.equal('1\n2', '1\n2'.escapeHTML());
  });

  test('#unescapeHTML', function () {
    assert.equal('foo bar', 'foo bar'.unescapeHTML());
    assert.equal('foo <span>bar</span>', 'foo &lt;span&gt;bar&lt;/span&gt;'.unescapeHTML());
    assert.equal('foo ß bar', 'foo ß bar'.unescapeHTML());

    assert.equal('a<a href="blah">blub</a>b<span><div></div></span>cdef<strong>!!!!</strong>g',
      'a&lt;a href="blah"&gt;blub&lt;/a&gt;b&lt;span&gt;&lt;div&gt;&lt;/div&gt;&lt;/span&gt;cdef&lt;strong&gt;!!!!&lt;/strong&gt;g'.unescapeHTML());

    assert.equal(largeTextUnescaped, largeTextEscaped.unescapeHTML());

    assert.equal('1\n2', '1\n2'.unescapeHTML());
    assert.equal('Pride & Prejudice', '<h1>Pride &amp; Prejudice</h1>'.unescapeHTML());

    assert.strictEqual('&lt;', '&amp;lt;'.unescapeHTML());
  });

  test('#interpolate', function () {
    var subject = { name: 'Stephan' };
    var pattern = /(^|.|\r|\n)(#\((.*?)\))/;
    assert.equal('#{name}: Stephan', '\\#{name}: #{name}'.interpolate(subject));
    assert.equal('#(name): Stephan', '\\#(name): #(name)'.interpolate(subject, pattern));
  });

  test('#toQueryParams', function () {
    // only the query part
    var result = {a:undefined, b:'c'};
    assert.hashEqual({}, ''.toQueryParams(), 'empty query');
    assert.hashEqual({}, 'foo?'.toQueryParams(), 'empty query with URL');
    assert.hashEqual(result, 'foo?a&b=c'.toQueryParams(), 'query with URL');
    assert.hashEqual(result, 'foo?a&b=c#fragment'.toQueryParams(), 'query with URL and fragment');
    assert.hashEqual(result, 'a;b=c'.toQueryParams(';'), 'custom delimiter');

    assert.hashEqual({a:undefined}, 'a'.toQueryParams(), 'key without value');
    assert.hashEqual({a:'b'},  'a=b&=c'.toQueryParams(), 'empty key');
    assert.hashEqual({a:'b', c:''}, 'a=b&c='.toQueryParams(), 'empty value');
    assert.hashEqual({a:'  '}, 'a=++'.toQueryParams(), 'value of spaces');

    assert.hashEqual({'a b':'c', d:'e f', g:'h'},
      'a%20b=c&d=e%20f&g=h'.toQueryParams(), 'proper decoding');
    assert.hashEqual({a:'b=c=d'}, 'a=b=c=d'.toQueryParams(), 'multiple equal signs');
    assert.hashEqual({a:'b', c:'d'}, '&a=b&&&c=d'.toQueryParams(), 'proper splitting');

    assert.enumEqual($w('r g b'), 'col=r&col=g&col=b'.toQueryParams()['col'],
      'collection without square brackets');
    var msg = 'empty values inside collection';
    assert.enumEqual(['r', '', 'b'], 'c=r&c=&c=b'.toQueryParams()['c'], msg);
    assert.enumEqual(['', 'blue'],   'c=&c=blue'.toQueryParams()['c'], msg);
    assert.enumEqual(['blue', ''],   'c=blue&c='.toQueryParams()['c'], msg);
  });

  test('#inspect', function () {
    assert.equal('\'\'', ''.inspect());
    assert.equal('\'test\'', 'test'.inspect());
    assert.equal('\'test \\\'test\\\' "test"\'', 'test \'test\' "test"'.inspect());
    assert.equal('\"test \'test\' \\"test\\"\"', 'test \'test\' "test"'.inspect(true));
    assert.equal('\'\\b\\t\\n\\f\\r"\\\\\'', '\b\t\n\f\r"\\'.inspect());
    assert.equal('\"\\b\\t\\n\\f\\r\\"\\\\\"', '\b\t\n\f\r"\\'.inspect(true));
    assert.equal('\'\\b\\t\\n\\f\\r\'', '\x08\x09\x0a\x0c\x0d'.inspect());
    assert.equal('\'\\u001a\'', '\x1a'.inspect());
  });

  test('#include', function () {
    assert('hello world'.include('h'));
    assert('hello world'.include('hello'));
    assert('hello world'.include('llo w'));
    assert('hello world'.include('world'));
    assert(!'hello world'.include('bye'));
    assert(!''.include('bye'));
  });

  test('#startsWith', function () {
    assert('hello world'.startsWith('h'));
    assert('hello world'.startsWith('hello'));
    assert(!'hello world'.startsWith('bye'));
    assert(!''.startsWith('bye'));
    assert(!'hell'.startsWith('hello'));

    var str = "To be, or not to be, that is the question";
    assert(str.startsWith("To be"), 'str.startsWith("To be")');
    assert(!str.startsWith("not to be"), 'str.startsWith("not to be")');
    assert(str.startsWith("not to be", 10), 'str.startsWith("not to be", 10)');
  });

  test('#endsWith', function () {
    assert('hello world'.endsWith('d'));
    assert('hello world'.endsWith(' world'));
    assert(!'hello world'.endsWith('planet'));
    assert(!''.endsWith('planet'));
    assert('hello world world'.endsWith(' world'));
    assert(!'z'.endsWith('az'));

    var str = "To be, or not to be, that is the question";
    assert(str.endsWith("question"), 'str.endsWith("question")');
    assert(!str.endsWith("to be"), 'str.endsWith("to be")');
    assert(str.endsWith("to be", 19), 'str.endsWith("to be", 19)');

    str = "12345";
    assert(str.endsWith("5"));
    assert(str.endsWith("5", 6));
    assert(str.endsWith("5", 5));
    assert(!str.endsWith("5", 4));
    assert(!str.endsWith("5", 1));
    assert(!str.endsWith("5", 0));

    assert(str.endsWith("1", 1));
    assert(!str.endsWith("1", 0));
    assert(!str.endsWith("1", -1));

    assert(str.endsWith("", 0));
  });

  test('#blank', function () {
    assert(''.blank());
    assert(' '.blank());
    assert('\t\r\n '.blank());
    assert(!'a'.blank());
    assert(!'\t y \n'.blank());
  });

  test('#empty', function () {
    assert(''.empty());
    assert(!' '.empty());
    assert(!'\t\r\n '.empty());
    assert(!'a'.empty());
    assert(!'\t y \n'.empty());
  });

  test('#succ', function () {
    assert.equal('b', 'a'.succ());
    assert.equal('B', 'A'.succ());
    assert.equal('1', '0'.succ());
    assert.equal('abce', 'abcd'.succ());
    assert.equal('{', 'z'.succ());
    assert.equal(':', '9'.succ());
  });

  test('#times', function () {
    assert.equal('', ''.times(0));
    assert.equal('', ''.times(5));
    assert.equal('', 'a'.times(-1));
    assert.equal('', 'a'.times(0));
    assert.equal('a', 'a'.times(1));
    assert.equal('aa', 'a'.times(2));
    assert.equal('aaaaa', 'a'.times(5));
    assert.equal('foofoofoofoofoo', 'foo'.times(5));
    assert.equal('', 'foo'.times(-5));
  });

  test('#isJSON', function () {
    assert(!''.isJSON());
    assert(!'     '.isJSON());
    assert('""'.isJSON());
    assert('"foo"'.isJSON());
    assert('{}'.isJSON());
    assert('[]'.isJSON());
    assert('null'.isJSON());
    assert('123'.isJSON());
    assert('true'.isJSON());
    assert('false'.isJSON());
    assert('"\\""'.isJSON());
    assert(!'\\"'.isJSON());
    assert(!'new'.isJSON());
    assert(!'\u0028\u0029'.isJSON());
    // we use '@' as a placeholder for characters authorized only inside brackets,
    // so this tests make sure it is not considered authorized elsewhere.
    assert(!'@'.isJSON());
  });

  test('#evalJSON', function () {
    var valid = '{"test": \n\r"hello world!"}';
    var invalid = '{"test": "hello world!"';
    var dangerous = '{});attackTarget = "attack succeeded!";({}';

    // use smaller huge string size for KHTML
    var size = navigator.userAgent.include('KHTML') ? 20 : 100;
    var longString = '"' + '123456789\\"'.times(size * 10) + '"';
    var object = '{' + longString + ': ' + longString + '},';
    var huge = '[' + object.times(size) + '{"test": 123}]';

    assert.equal('hello world!', valid.evalJSON().test);
    assert.equal('hello world!', valid.evalJSON(true).test);
    assert.raise('SyntaxError', function() { invalid.evalJSON() });
    assert.raise('SyntaxError', function() { invalid.evalJSON(true) });

    attackTarget = "Not scared!";
    assert.raise('SyntaxError', function(){dangerous.evalJSON(true)});
    assert.equal("Not scared!", attackTarget);

    assert.equal('hello world!', ('/*-secure- \r  \n ' + valid + ' \n  */').evalJSON().test);
    var temp = Prototype.JSONFilter;
    Prototype.JSONFilter = /^\/\*([\s\S]*)\*\/$/; // test custom delimiters.
    assert.equal('hello world!', ('/*' + valid + '*/').evalJSON().test);
    Prototype.JSONFilter = temp;

    assert.equal(123, huge.evalJSON(true).last().test);

    assert.equal('', '""'.evalJSON());
    assert.equal('foo', '"foo"'.evalJSON());
    assert('object', typeof '{}'.evalJSON());
    assert(Object.isArray('[]'.evalJSON()));
    assert.isNull('null'.evalJSON());
    assert(123, '123'.evalJSON());
    assert.strictEqual(true, 'true'.evalJSON());
    assert.strictEqual(false, 'false'.evalJSON());
    assert.equal('"', '"\\""'.evalJSON());
  });



  suite('Template', function () {

    test('#evaluate', function () {
      var source = '<tr><td>#{name}</td><td>#{age}</td></tr>';
      var person = {name: 'Sam', age: 21};
      var template = new Template(source);

      assert.equal('<tr><td>Sam</td><td>21</td></tr>',
        template.evaluate(person));
      assert.equal('<tr><td></td><td></td></tr>',
        template.evaluate({}));
    });

    test('#evaluate (with empty replacement)', function () {
      var template = new Template('##{}');
      assert.equal('#', template.evaluate({}));
      assert.equal('#', template.evaluate({foo: 'bar'}));

      template = new Template('#{}');
      assert.equal('', template.evaluate({}));
    });

    test('#evaluate (with falses)', function () {
      var source = '<tr><td>#{zero}</td><td>#{_false}</td><td>#{undef}</td><td>#{_null}</td><td>#{empty}</td></tr>';
      var falses = {zero:0, _false:false, undef:undefined, _null:null, empty:""};
      var template = new Template(source);

      assert.equal('<tr><td>0</td><td>false</td><td></td><td></td><td></td></tr>',
        template.evaluate(falses));
    });

    test('#evaluate (with nested properties)', function () {
      var source = '#{name} #{manager.name} #{manager.age} #{manager.undef} #{manager.age.undef} #{colleagues.first.name}';
      var subject = { manager: { name: 'John', age: 29 }, name: 'Stephan', age: 22, colleagues: { first: { name: 'Mark' }} };
      assert.equal('Stephan', new Template('#{name}').evaluate(subject));
      assert.equal('John', new Template('#{manager.name}').evaluate(subject));
      assert.equal('29', new Template('#{manager.age}').evaluate(subject));
      assert.equal('', new Template('#{manager.undef}').evaluate(subject));
      assert.equal('', new Template('#{manager.age.undef}').evaluate(subject));
      assert.equal('Mark', new Template('#{colleagues.first.name}').evaluate(subject));
      assert.equal('Stephan John 29   Mark', new Template(source).evaluate(subject));
    });

    test('#evaluate (with indices)', function () {
      var source = '#{0} = #{[0]} - #{1} = #{[1]} - #{[2][0]} - #{[2].name} - #{first[0]} - #{[first][0]} - #{[\]]} - #{first[\]]}';
      var subject = [ 'zero', 'one', [ 'two-zero' ] ];
      subject[2].name = 'two-zero-name';
      subject.first = subject[2];
      subject[']'] = '\\';
      subject.first[']'] = 'first\\';
      assert.equal('zero', new Template('#{[0]}').evaluate(subject), "#{[0]}");
      assert.equal('one', new Template('#{[1]}').evaluate(subject), "#{[1]}");
      assert.equal('two-zero', new Template('#{[2][0]}').evaluate(subject), '#{[2][0]}');
      assert.equal('two-zero-name', new Template('#{[2].name}').evaluate(subject), '#{[2].name}');
      assert.equal('two-zero', new Template('#{first[0]}').evaluate(subject), '#{first[0]}');
      assert.equal('\\', new Template('#{[\]]}').evaluate(subject), '#{[\]]}');
      assert.equal('first\\', new Template('#{first[\]]}').evaluate(subject), '#{first[\]]}');
      assert.equal('empty - empty2', new Template('#{[]} - #{m[]}').evaluate({ '': 'empty', m: {'': 'empty2'}}), '#{[]} - #{m[]}');
      assert.equal('zero = zero - one = one - two-zero - two-zero-name - two-zero - two-zero - \\ - first\\', new Template(source).evaluate(subject));
    });

    test('#evaluate (complex)', function () {
      var source = '#{name} is #{age} years old, managed by #{manager.name}, #{manager.age}.\n' +
        'Colleagues include #{colleagues[0].name} and #{colleagues[1].name}.';
      var subject = {
        name: 'Stephan', age: 22,
        manager: { name: 'John', age: 29 },
        colleagues: [ { name: 'Mark' }, { name: 'Indy' } ]
      };
      assert.equal('Stephan is 22 years old, managed by John, 29.\n' +
        'Colleagues include Mark and Indy.',
        new Template(source).evaluate(subject));
    });

    test('#toTemplateReplacements', function () {
      var source = 'My name is #{name}, my job is #{job}';
      var subject = {
        name: 'Stephan',
        getJob: function() { return 'Web developer'; },
        toTemplateReplacements: function() { return { name: this.name, job: this.getJob() } }
      };
      assert.equal('My name is Stephan, my job is Web developer', new Template(source).evaluate(subject));

      var strActual = new Template('foo #{bar} baz').evaluate({
        toTemplateReplacements: function(){ return null; }
      });
      assert.strictEqual('foo  baz', strActual);
      assert.strictEqual('foo', new Template('foo#{bar}').evaluate(null));
    });

  });


});
