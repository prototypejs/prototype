
function reduce(arr) {
  return arr.length > 1 ? arr : arr[0];
}


suite('Selector', function () {
  this.name = 'selector';

  test('tag (div)', function () {
    assert.enumEqual($A(document.getElementsByTagName('li')), $$('li'));
    assert.enumEqual([$('strong')], $$('strong'));
    assert.enumEqual([], $$('nonexistent'));

    var allNodes = $A(document.getElementsByTagName('*')).select( function(node) {
      return node.tagName !== '!';
    });
    assert.enumEqual(allNodes, $$('*'));
  });

  test('ID (#some_id)', function () {
    assert.enumEqual([$('fixtures')], $$('#fixtures'));
    assert.enumEqual([], $$('#nonexistent'));
    assert.enumEqual([$('troubleForm')], $$('#troubleForm'));
  });

  test('class (.some-class)', function () {
    assert.enumEqual($('p', 'link_1', 'item_1'), $$('.first'));
    assert.enumEqual([], $$('.second'));
  });

  test('tag + ID (div#some_id)', function () {
    assert.enumEqual([$('strong')], $$('strong#strong'));
    assert.enumEqual([], $$('p#strong'));
  });

  test('tag + class (div.some-class)', function () {
    assert.enumEqual($('link_1', 'link_2'), $$('a.internal'));
    assert.enumEqual([$('link_2')], $$('a.internal.highlight'));
    assert.enumEqual([$('link_2')], $$('a.highlight.internal'));
    assert.enumEqual([], $$('a.highlight.internal.nonexistent'));
  });

  test('id + class (#some_id.some-class)', function () {
    assert.enumEqual([$('link_2')], $$('#link_2.internal'));
    assert.enumEqual([$('link_2')], $$('.internal#link_2'));
    assert.enumEqual([$('link_2')], $$('#link_2.internal.highlight'));
    assert.enumEqual([], $$('#link_2.internal.nonexistent'));
  });

  test('tag + id + class (div#some_id.some-class)', function () {
    assert.enumEqual([$('link_2')], $$('a#link_2.internal'));
    assert.enumEqual([$('link_2')], $$('a.internal#link_2'));
    assert.enumEqual([$('item_1')], $$('li#item_1.first'));
    assert.enumEqual([], $$('li#item_1.nonexistent'));
    assert.enumEqual([], $$('li#item_1.first.nonexistent'));
  });

  test('descendant combinator', function () {
    assert.enumEqual($('em2', 'em', 'span'), $$('#fixtures a *'));
    assert.enumEqual([$('p')], $$('div#fixtures p'));
  });

  test('combines results when multiple expressions are passed', function () {
    assert.enumEqual(
      $('link_1', 'link_2', 'item_1', 'item_2', 'item_3'),
      $$('#p a', ' ul#list li ')
    );
  });

  test('tag + attr existence (a[href])', function () {
    assert.enumEqual($$('#fixtures h1'), $$('h1[class]'), 'h1[class]');
    assert.enumEqual($$('#fixtures h1'), $$('h1[CLASS]'), 'h1[CLASS]');
    assert.enumEqual([$('item_3')], $$('li#item_3[class]'), 'li#item_3[class]');
  });

  test('tag + attr equality (a[href="#"])', function () {
    assert.enumEqual($('link_1', 'link_2', 'link_3'), $$('#fixtures a[href="#"]'));
    assert.enumEqual($('link_1', 'link_2', 'link_3'), $$('#fixtures a[href=#]'));
  });

  test('tag + attr whitespace-tokenized (a[class~="internal"])', function () {
    assert.enumEqual($('link_1', 'link_2'), $$('a[class~="internal"]'), "a[class~=\"internal\"]");
    assert.enumEqual($('link_1', 'link_2'), $$('a[class~=internal]'), "a[class~=internal]");
  });

  test('attr ([href])', function () {
    assert.enumEqual(document.body.select('a[href]'), document.body.select('[href]'));
    assert.enumEqual($$('a[class~="internal"]'), $$('[class~=internal]'));
    assert.enumEqual($$('*[id]'), $$('[id]'));
    assert.enumEqual($('checked_radio', 'unchecked_radio'), $$('[type=radio]'));
    assert.enumEqual($$('*[type=checkbox]'), $$('[type=checkbox]'));
    assert.enumEqual($('with_title', 'commaParent'), $$('[title]'));
    assert.enumEqual($$('#troubleForm *[type=radio]'), $$('#troubleForm [type=radio]'));
    assert.enumEqual($$('#troubleForm *[type]'), $$('#troubleForm [type]'));
  });

  test('attr (with hyphen) ([foo-bar])', function () {
    assert.enumEqual([$('attr_with_dash')], $$('[foo-bar]'), "attribute with hyphen");
  });

  test('attr negation a[href!="#"]', function () {
    assert.enumEqual($('item_2', 'item_3'), $$('#list li[id!="item_1"]'));
    // assert.enumEqual([], $$('a[href!="#"]'));
  });

  test('attr (value with brackets) (input[name="brackets[5][]"])', function () {
    assert.enumEqual(
      $('chk_1', 'chk_2'),
      $$('#troubleForm2 input[name="brackets[5][]"]')
    );
    assert.enumEqual(
      [$('chk_1')],
      $$('#troubleForm2 input[name="brackets[5][]"]:checked')
    );
    assert.enumEqual(
      [$('chk_2')],
      $$('#troubleForm2 input[name="brackets[5][]"][value=2]')
    );
    try {
      $$('#troubleForm2 input[name=brackets[5][]]');
      assert(false, 'Error not thrown');
    } catch (e) {
      assert(true, 'Error thrown');
    }
  });

  test('attr (multiple) (div[style] p[id] strong)', function () {
    assert.enumEqual([$('strong')], $$('div[style] p[id] strong'), 'div[style] p[id] strong');
  });

  test('a (multiple) ([class~=external][href="#"])', function () {
    assert.enumEqual([$('link_3')], $$('a[class~=external][href="#"]'),
     'a[class~=external][href="#"]');
    assert.enumEqual([], $$('a[class~=external][href!="#"]'),
     'a[class~=external][href!="#"]');
  });

  test('.matchElements', function () {
    assert.elementsMatch(Selector.matchElements($('list').descendants(), 'li'), '#item_1', '#item_2', '#item_3');
    assert.elementsMatch(Selector.matchElements($('fixtures').descendants(), 'a.internal'), '#link_1', '#link_2');
    assert.enumEqual([], Selector.matchElements($('fixtures').descendants(), 'p.last'));
    assert.elementsMatch(Selector.matchElements($('fixtures').descendants(), '.inexistant, a.internal'), '#link_1', '#link_2');
  });

  test('.findElement', function () {
    assert.elementMatches(Selector.findElement($('list').descendants(), 'li'), 'li#item_1.first');
    assert.elementMatches(Selector.findElement($('list').descendants(), 'li', 1), 'li#item_2');
    assert.elementMatches(Selector.findElement($('list').descendants(), 'li#item_3'), 'li');
    assert.equal(undefined, Selector.findElement($('list').descendants(), 'em'));
  });

  test('Element#match', function () {
    var span = $('dupL1');

    // tests that should pass
    assert(span.match('span'));
    assert(span.match('span#dupL1'));
    assert(span.match('div > span'), 'child combinator');
    assert(span.match('#dupContainer span'), 'descendant combinator');
    assert(span.match('#dupL1'), 'ID only');
    assert(span.match('span.span_foo'), 'class name 1');
    assert(span.match('span.span_bar'), 'class name 2');
    assert(span.match('span:first-child'), 'first-child pseudoclass');

    assert(!span.match('span.span_wtf'), 'bogus class name');
    assert(!span.match('#dupL2'), 'different ID');
    assert(!span.match('div'), 'different tag name');
    assert(!span.match('span span'), 'different ancestry');
    assert(!span.match('span > span'), 'different parent');
    assert(!span.match('span:nth-child(5)'), 'different pseudoclass');

    assert(!$('link_2').match('a[rel^=external]'));
    assert($('link_1').match('a[rel^=external]'));
    assert($('link_1').match('a[rel^="external"]'));
    assert($('link_1').match("a[rel^='external']"));

    assert(span.match({ match: function(element) { return true; }}), 'custom selector');
    assert(!span.match({ match: function(element) { return false; }}), 'custom selector');
  });

  test('attr (space in value) (cite[title="hello world!"])', function () {
    assert.enumEqual([$('with_title')], $$('cite[title="hello world!"]'));
  });

  test('> combinator', function () {
    assert.enumEqual($('link_1', 'link_2'), $$('p.first > a'));
    assert.enumEqual($('father', 'uncle'), $$('div#grandfather > div'));
    assert.enumEqual($('level2_1', 'level2_2'), $$('#level1>span'));
    assert.enumEqual($('level2_1', 'level2_2'), $$('#level1 > span'));
    assert.enumEqual($('level3_1', 'level3_2'), $$('#level2_1 > *'));
    assert.enumEqual([], $$('div > #nonexistent'));
  });

  test('+ combinator', function () {
    assert.enumEqual([$('uncle')], $$('div.brothers + div.brothers'));
    assert.enumEqual([$('uncle')], $$('div.brothers + div'));
    assert.equal($('level2_2'), reduce($$('#level2_1+span')));
    assert.equal($('level2_2'), reduce($$('#level2_1 + span')));
    assert.equal($('level2_2'), reduce($$('#level2_1 + *')));
    assert.enumEqual([], $$('#level2_2 + span'));
    assert.equal($('level3_2'), reduce($$('#level3_1 + span')));
    assert.equal($('level3_2'), reduce($$('#level3_1 + *')));
    assert.enumEqual([], $$('#level3_2 + *'));
    assert.enumEqual([], $$('#level3_1 + em'));
  });

  test('~ combinator', function () {
    assert.enumEqual([$('list')], $$('#fixtures h1 ~ ul'));
    assert.equal($('level2_2'), reduce($$('#level2_1 ~ span')));
    assert.enumEqual($('level2_2', 'level2_3'), reduce($$('#level2_1 ~ *')));
    assert.enumEqual([], $$('#level2_2 ~ span'));
    assert.enumEqual([], $$('#level3_2 ~ *'));
    assert.enumEqual([], $$('#level3_1 ~ em'));
    assert.enumEqual([$('level3_2')], $$('#level3_1 ~ #level3_2'));
    assert.enumEqual([$('level3_2')], $$('span ~ #level3_2'));
    assert.enumEqual([], $$('div ~ #level3_2'));
    assert.enumEqual([], $$('div ~ #level2_3'));
  });

  test('attr (weird operators)', function () {
    assert.enumEqual($('father', 'uncle'), $$('div[class^=bro]'), 'matching beginning of string');
    assert.enumEqual($('father', 'uncle'), $$('div[class$=men]'), 'matching end of string');
    assert.enumEqual($('father', 'uncle'), $$('div[class*="ers m"]'), 'matching substring');
    assert.enumEqual($('level2_1', 'level2_2', 'level2_3'), $$('#level1 *[id^="level2_"]'));
    assert.enumEqual($('level2_1', 'level2_2', 'level2_3'), $$('#level1 *[id^=level2_]'));
    assert.enumEqual($('level2_1', 'level3_1'), $$('#level1 *[id$="_1"]'));
    assert.enumEqual($('level2_1', 'level3_1'), $$('#level1 *[id$=_1]'));
    assert.enumEqual($('level2_1', 'level3_2', 'level2_2', 'level2_3'), $$('#level1 *[id*="2"]'));
    assert.enumEqual($('level2_1', 'level3_2', 'level2_2', 'level2_3'), $$('#level1 *[id*=2]'));
  });

  test('selectors with duplicates', function () {
    assert.enumEqual($$('div div'), $$('div div').uniq());
    assert.enumEqual($('dupL2', 'dupL3', 'dupL4', 'dupL5'), $$('#dupContainer span span'));
  });

  test(':(first|last|only|nth|nth-last)-child', function () {
    assert.enumEqual([$('level2_1')], $$('#level1>*:first-child'));
    assert.enumEqual($('level2_1', 'level3_1', 'level_only_child'), $$('#level1 *:first-child'));
    assert.enumEqual([$('level2_3')], $$('#level1>*:last-child'));
    assert.enumEqual($('level3_2', 'level_only_child', 'level2_3'), $$('#level1 *:last-child'));
    assert.enumEqual([$('level2_3')], $$('#level1>div:last-child'));
    assert.enumEqual([$('level2_3')], $$('#level1 div:last-child'));
    assert.enumEqual([], $$('#level1>div:first-child'));
    assert.enumEqual([], $$('#level1>span:last-child'));
    assert.enumEqual($('level2_1', 'level3_1'), $$('#level1 span:first-child'));
    assert.enumEqual([], $$('#level1:first-child'));
    assert.enumEqual([], $$('#level1>*:only-child'));
    assert.enumEqual([$('level_only_child')], $$('#level1 *:only-child'));
    assert.enumEqual([], $$('#level1:only-child'));
    assert.enumEqual([$('link_2')], $$('#p *:nth-last-child(2)'), 'nth-last-child');
    assert.enumEqual([$('link_2')], $$('#p *:nth-child(3)'), 'nth-child');
    assert.enumEqual([$('link_2')], $$('#p a:nth-child(3)'), 'nth-child');
    assert.enumEqual($('item_2', 'item_3'), $$('#list > li:nth-child(n+2)'));
    assert.enumEqual($('item_1', 'item_2'), $$('#list > li:nth-child(-n+2)'));
  });

  test(':(first|last|nth|nth-last)-of-type', function () {
    assert.enumEqual([$('link_2')], $$('#p a:nth-of-type(2)'), 'nth-of-type');
    assert.enumEqual([$('link_1')], $$('#p a:nth-of-type(1)'), 'nth-of-type');
    assert.enumEqual([$('link_2')], $$('#p a:nth-last-of-type(1)'), 'nth-last-of-type');
    assert.enumEqual([$('link_1')], $$('#p a:first-of-type'), 'first-of-type');
    assert.enumEqual([$('link_2')], $$('#p a:last-of-type'), 'last-of-type');
  });

  test(':not', function () {
    assert.enumEqual([$('link_2')], $$('#p a:not(a:first-of-type)'), 'first-of-type');
    assert.enumEqual([$('link_1')], $$('#p a:not(a:last-of-type)'), 'last-of-type');
    assert.enumEqual([$('link_2')], $$('#p a:not(a:nth-of-type(1))'), 'nth-of-type');
    assert.enumEqual([$('link_1')], $$('#p a:not(a:nth-last-of-type(1))'), 'nth-last-of-type');
    assert.enumEqual([$('link_2')], $$('#p a:not([rel~=nofollow])'), 'attribute 1');
    assert.enumEqual([$('link_2')], $$('#p a:not(a[rel^=external])'), 'attribute 2');
    assert.enumEqual([$('link_2')], $$('#p a:not(a[rel$=nofollow])'), 'attribute 3');
    assert.enumEqual([$('em')], $$('#p a:not(a[rel$="nofollow"]) > em'), 'attribute 4');
    assert.enumEqual([$('item_2')], $$('#list li:not(#item_1):not(#item_3)'), 'adjacent :not clauses');
    assert.enumEqual([$('son')], $$('#grandfather > div:not(#uncle) #son'));
    assert.enumEqual([$('em')], $$('#p a:not(a[rel$="nofollow"]) em'), 'attribute 4 + all descendants');
    assert.enumEqual([$('em')], $$('#p a:not(a[rel$="nofollow"])>em'), 'attribute 4 (without whitespace)');
  });

  test(':enabled, :disabled, :checked', function () {
    assert.enumEqual(
      [$('disabled_text_field')],
      $$('#troubleForm > *:disabled'),
      ':disabled'
    );
    assert.enumEqual(
      $('troubleForm').getInputs().without($('disabled_text_field')),
      $$('#troubleForm > *:enabled'),
      ':enabled'
    );
    assert.enumEqual(
      $('checked_box', 'checked_radio'),
      $$('#troubleForm *:checked'),
      ':checked'
    );
  });

  test('identical results from equivalent selectors', function () {
    assert.enumEqual($$('div.brothers'), $$('div[class~=brothers]'));
    assert.enumEqual($$('div.brothers'), $$('div[class~=brothers].brothers'));
    assert.enumEqual($$('div:not(.brothers)'), $$('div:not([class~=brothers])'));
    assert.enumEqual($$('li ~ li'), $$('li:not(:first-child)'));
    assert.enumEqual($$('ul > li'), $$('ul > li:nth-child(n)'));
    assert.enumEqual($$('ul > li:nth-child(even)'), $$('ul > li:nth-child(2n)'));
    assert.enumEqual($$('ul > li:nth-child(odd)'), $$('ul > li:nth-child(2n+1)'));
    assert.enumEqual($$('ul > li:first-child'), $$('ul > li:nth-child(1)'));
    assert.enumEqual($$('ul > li:last-child'), $$('ul > li:nth-last-child(1)'));
    assert.enumEqual($$('ul > li:nth-child(n-999)'), $$('ul > li'));
    assert.enumEqual($$('ul>li'), $$('ul > li'));
    assert.enumEqual($$('#p a:not(a[rel$="nofollow"])>em'), $$('#p a:not(a[rel$="nofollow"]) > em'));
  });

  test('selectors that should return nothing', function () {
    assert.enumEqual([], $$('span:empty > *'));
    assert.enumEqual([], $$('div.brothers:not(.brothers)'));
    assert.enumEqual([], $$('#level2_2 :only-child:not(:last-child)'));
    assert.enumEqual([], $$('#level2_2 :only-child:not(:first-child)'));
  });

  test('$$ (separates selectors properly)', function () {
    assert.enumEqual($('p', 'link_1', 'list', 'item_1', 'item_3', 'troubleForm'), $$('#list, .first,#item_3 , #troubleForm'));
    assert.enumEqual($('p', 'link_1', 'list', 'item_1', 'item_3', 'troubleForm'), $$('#list, .first', '#item_3 , #troubleForm'));
    assert.enumEqual($('commaParent', 'commaChild'), $$('form[title*="commas,"], input[value="#commaOne,#commaTwo"]'));
    assert.enumEqual($('commaParent', 'commaChild'), $$('form[title*="commas,"]', 'input[value="#commaOne,#commaTwo"]'));
  });

  test('$$ (extends all nodes)', function () {
    var element = document.createElement('div');
    (3).times(function(){
      element.appendChild(document.createElement('div'));
    });
    element.setAttribute('id', 'scratch_element');
    $$('body')[0].appendChild(element);

    var results = $$('#scratch_element div');
    assert(typeof results[0].show == 'function');
    assert(typeof results[1].show == 'function');
    assert(typeof results[2].show == 'function');
  });

  test('copied nodes get included', function () {
    assert.elementsMatch(
      Selector.matchElements($('counted_container').descendants(), 'div'),
      'div.is_counted'
    );
    $('counted_container').innerHTML += $('counted_container').innerHTML;
    assert.elementsMatch(
      Selector.matchElements($('counted_container').descendants(), 'div'), 'div.is_counted',
      'div.is_counted'
    );
  });

  test('#select (on detached nodes)', function () {
    var wrapper = new Element("div");
    wrapper.update("<table><tr><td id='myTD'></td></tr></table>");
    assert.isNotNullOrUndefined(wrapper.select('[id=myTD]')[0],
      'selecting: [id=myTD]');
    assert.isNotNullOrUndefined(wrapper.select('#myTD')[0],
      'selecting: #myTD');
    assert.isNotNullOrUndefined(wrapper.select('td')[0],
      'selecting: td');
    assert($$('#myTD').length == 0,
      'should not turn up in document-rooted search');
  });

  test('#down', function () {
    var a = $('dupL4');
    var b = $('dupContainer').down('#dupL4');

    assert.equal(a, b);
  });

  test('#down (with dot and colon)', function () {
    var a = $('dupL4_dotcolon');
    var b = $('dupContainer.withdot:active').down('#dupL4_dotcolon');
    var c = $('dupContainer.withdot:active').select('#dupL4_dotcolon');

    assert.equal(a, b);
    assert.enumEqual([a], c);
  });

  test('descendant selector bugs', function () {
    var el = document.createElement('div');
    el.innerHTML = '<ul><li></li></ul><div><ul><li></li></ul></div>';
    document.body.appendChild(el);
    assert.equal(2, $(el).select('ul li').length);
    document.body.removeChild(el);
  });

  test('.findElement (with index when elements are not in document order)', function () {
    var ancestors = $("target_1").ancestors();
    assert.equal(
      $("container_2"),
      Selector.findElement(ancestors, "[container], .container", 0)
    );
    assert.equal(
      $("container_1"),
      Selector.findElement(ancestors, "[container], .container", 1)
    );
  });


});
