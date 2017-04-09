var testVar = 'to be updated', testVar2 = '';

Element.addMethods({
  hashBrowns: function(element) { return 'hash browns'; }
});

Element.addMethods("LI", {
  pancakes: function(element) { return "pancakes"; }
});

Element.addMethods("DIV", {
  waffles: function(element) { return "waffles"; }
});

Element.addMethods($w("li div"), {
  orangeJuice: function(element) { return "orange juice"; }
});


function getInnerHTML (id) {
  return $(id).innerHTML.toString().toLowerCase().gsub(/[\r\n\t]/, '');
}

function createParagraph (text) {
  var p = document.createElement('p');
  p.appendChild(document.createTextNode(text));
  return p;
}

var RESIZE_DISABLED = false;

function simulateClick(node) {
  var oEvent;
  if (document.createEvent) {
    oEvent = document.createEvent('MouseEvents');
    oEvent.initMouseEvent('click', true, true, document.defaultView,
     0, 0, 0, 0, 0, false, false, false, false, 0, node);
    node.dispatchEvent(oEvent);
  } else {
    node.click();
  }
}

var documentViewportProperties = null;


suite('DOM', function () {
  this.name = 'dom';

  setup(function () {

    if (documentViewportProperties) return;

    // Based on properties check from http://www.quirksmode.org/viewport/compatibility.html.

    documentViewportProperties = {
      properties: [
        'self.pageXOffset', 'self.pageYOffset',
        'self.screenX', 'self.screenY',
        'self.innerHeight', 'self.innerWidth',
        'self.outerHeight', 'self.outerWidth',
        'self.screen.height', 'self.screen.width',
        'self.screen.availHeight', 'self.screen.availWidth',
        'self.screen.availTop', 'self.screen.availLeft',
        'self.screen.Top', 'self.screen.Left',
        'self.screenTop', 'self.screenLeft',
        'document.body.clientHeight', 'document.body.clientWidth',
        'document.body.scrollHeight', 'document.body.scrollWidth',
        'document.body.scrollLeft', 'document.body.scrollTop',
        'document.body.offsetHeight', 'document.body.offsetWidth',
        'document.body.offsetTop', 'document.body.offsetLeft'
      ].inject([], function (properties, prop) {
        if (!self.screen && prop.include('self.screen')) return;
        if (!document.body && prop.include('document.body')) return;

        properties.push(prop);

        if (prop.include('body') && document.documentElement) {
          properties.push(prop.sub('.body', '.documentElement'));
        }

        return properties;
      }),

      inspect: function () {
        var props = [];
        this.properties.each(function (prop) {
          if (eval(prop)) props[prop] = eval(prop);
        }, this);
        return props;
      }
    };
  });



  test('$', function () {
    assert.isUndefined($(), '$() should be undefined');

    assert.isNull(document.getElementById('noWayThisIDExists'),
     'nonexistent ID should return null from getElementById');

    assert.isNull($('noWayThisIDExists'),
     'nonexistent ID should return null from $');

    assert.strictEqual(document.getElementById('testdiv'), $('testdiv'),
     'getElementById and $ should return the same element');

    assert.deepEqual(
      [ $('testdiv'), $('container') ],
      $('testdiv', 'container')
    );

    assert.deepEqual(
      [ $('testdiv'), null, $('container') ],
      $('testdiv', 'noWayThisIDExists', 'container')
    );

    var elt = $('testdiv');

    assert.strictEqual(elt, $(elt));
    assert.respondsTo('hide', elt);
    assert.respondsTo('childOf', elt);
  });


  test('.insert (with HTML)', function () {

    Element.insert('insertions-main', {
      before:'<p><em>before</em> text</p><p>more testing</p>'
    });
    assert(getInnerHTML('insertions-container').startsWith('<p><em>before</em> text</p><p>more testing</p>'));

    Element.insert('insertions-main', {
      after:'<p><em>after</em> text</p><p>more testing</p>'
    });
    assert(getInnerHTML('insertions-container').endsWith('<p><em>after</em> text</p><p>more testing</p>'));

    Element.insert('insertions-main', {
      top:'<p><em>top</em> text.</p><p>more testing</p>'
    });
    assert(getInnerHTML('insertions-main').startsWith('<p><em>top</em> text.</p><p>more testing</p>'));

    Element.insert('insertions-main', {
      bottom:'<p><em>bottom</em> text.</p><p>more testing</p>'
    });
    assert(getInnerHTML('insertions-main').endsWith('<p><em>bottom</em> text.</p><p>more testing</p>'));

  });


  test('.insert (with DOM node)', function () {
    Element.insert('insertions-node-main', {
      before: createParagraph('node before')
    });
    assert(getInnerHTML('insertions-node-container').startsWith('<p>node before</p>'));

    Element.insert('insertions-node-main', {
      after: createParagraph('node after')
    });
    assert(getInnerHTML('insertions-node-container').endsWith('<p>node after</p>'));

    Element.insert('insertions-node-main', {
      top: createParagraph('node top')
    });
    assert(getInnerHTML('insertions-node-main').startsWith('<p>node top</p>'));

    Element.insert('insertions-node-main', {
      bottom: createParagraph('node bottom')}
    );
    assert(getInnerHTML('insertions-node-main').endsWith('<p>node bottom</p>'));

    assert.equal(
      $('insertions-node-main'),
      $('insertions-node-main').insert(document.createElement('p')),
      'insert should return the original node'
    );
  });


  test('.insert (with toElement method)', function () {
    Element.insert('insertions-node-main', {
      toElement: createParagraph.curry('toElement')
    });
    assert(getInnerHTML('insertions-node-main').endsWith('<p>toelement</p>'));

    Element.insert('insertions-node-main', {
      bottom: { toElement: createParagraph.curry('bottom toElement') }
    });
    assert(getInnerHTML('insertions-node-main').endsWith('<p>bottom toelement</p>'));
  });


  test('.insert (with toHTML method)', function () {
    Element.insert('insertions-node-main', {
      toHTML: function() { return '<p>toHTML</p>'; }
    });
    assert(getInnerHTML('insertions-node-main').endsWith('<p>tohtml</p>'));

    Element.insert('insertions-node-main', {
      bottom: {
        toHTML: function() { return '<p>bottom toHTML</p>'; }
      }
    });
    assert(getInnerHTML('insertions-node-main').endsWith('<p>bottom tohtml</p>'));
  });

  test('.insert (with non-string)', function () {
    Element.insert('insertions-main', { bottom: 3 });
    assert(getInnerHTML('insertions-main').endsWith('3'));
  });

  test('.insert (in tables)', function () {
    Element.insert('second_row', {
      after:'<tr id="third_row"><td>Third Row</td></tr>'
    });
    assert($('second_row').parentNode == $('table'),
     'table rows should be inserted correctly');

    $('a_cell').insert({ top: 'hello world' });
    assert($('a_cell').innerHTML.startsWith('hello world'),
     'content should be inserted into table cells correctly');

    $('a_cell').insert({ after: '<td>hi planet</td>' });
    assert.equal('hi planet', $('a_cell').next().innerHTML,
     'table cells should be inserted after existing table cells correctly');

    $('table_for_insertions').insert('<tr><td>a cell!</td></tr>');
    assert($('table_for_insertions').innerHTML.gsub('\r\n', '').toLowerCase().include('<tr><td>a cell!</td></tr>'),
     'complex content should be inserted into a table correctly');

    $('row_1').insert({ after:'<tr></tr><tr></tr><tr><td>last</td></tr>' });
    assert.equal('last', $A($('table_for_row_insertions').getElementsByTagName('tr')).last().lastChild.innerHTML,
     'complex content should be inserted after a table row correctly');
  });

  test('.insert (in select)', function () {
    var selectTop = $('select_for_insert_top');
    var selectBottom = $('select_for_insert_bottom');

    selectBottom.insert('<option value="33">option 33</option><option selected="selected">option 45</option>');
    assert.equal('option 45', selectBottom.getValue());
    selectTop.insert({top:'<option value="A">option A</option><option value="B" selected="selected">option B</option>'});
    assert.equal(4, selectTop.options.length);
  });

  test('#insert', function () {
    $('element-insertions-main').insert({before:'some text before'});
    assert(getInnerHTML('element-insertions-container').startsWith('some text before'), 'some text before');
    $('element-insertions-main').insert({after:'some text after'});
    assert(getInnerHTML('element-insertions-container').endsWith('some text after'), 'some text after');
    $('element-insertions-main').insert({top:'some text top'});
    assert(getInnerHTML('element-insertions-main').startsWith('some text top'), 'some text top');
    $('element-insertions-main').insert({bottom:'some text bottom'});
    assert(getInnerHTML('element-insertions-main').endsWith('some text bottom'), 'some text bottom');

    $('element-insertions-main').insert('some more text at the bottom');
    assert(getInnerHTML('element-insertions-main').endsWith('some more text at the bottom'),
     'some more text at the bottom');

    $('element-insertions-main').insert({TOP:'some text uppercase top'});
    assert(getInnerHTML('element-insertions-main').startsWith('some text uppercase top'), 'some text uppercase top');

    $('element-insertions-multiple-main').insert({
      top:'1', bottom:2, before: new Element('p').update('3'), after:'4'
    });
    assert(getInnerHTML('element-insertions-multiple-main').startsWith('1'), '1');
    assert(getInnerHTML('element-insertions-multiple-main').endsWith('2'), '2');
    assert(getInnerHTML('element-insertions-multiple-container').startsWith(
     '<p>3</p>'), '<p>3</p>');
    assert(getInnerHTML('element-insertions-multiple-container').endsWith('4'), '4');

    $('element-insertions-main').update('test');
    $('element-insertions-main').insert(null);
    $('element-insertions-main').insert({bottom:null});
    assert.equal('test', getInnerHTML('element-insertions-main'), 'should insert nothing when called with null');
    $('element-insertions-main').insert(1337);
    assert.equal('test1337', getInnerHTML('element-insertions-main'), 'should coerce to string when called with number');
  });


  test('#insert (with new Element)', function () {
    var container = new Element('div'), element = new Element('div');
    container.insert(element);

    element.insert({ before: '<p>a paragraph</p>' });
    assert.equal('<p>a paragraph</p><div></div>', getInnerHTML(container));
    element.insert({ after: 'some text' });
    assert.equal('<p>a paragraph</p><div></div>some text', getInnerHTML(container));

    element.insert({ top: '<p>a paragraph</p>' });
    assert.equal('<p>a paragraph</p>', getInnerHTML(element));
    element.insert('some text');
    assert.equal('<p>a paragraph</p>some text', getInnerHTML(element));

  });


  test('Insertion (backwards-compatibility)', function () {
    new Insertion.Before('element-insertions-main', 'some backward-compatibility testing before');
    assert(getInnerHTML('element-insertions-container').include('some backward-compatibility testing before'));
    new Insertion.After('element-insertions-main', 'some backward-compatibility testing after');
    assert(getInnerHTML('element-insertions-container').include('some backward-compatibility testing after'));
    new Insertion.Top('element-insertions-main', 'some backward-compatibility testing top');
    assert(getInnerHTML('element-insertions-main').startsWith('some backward-compatibility testing top'));
    new Insertion.Bottom('element-insertions-main', 'some backward-compatibility testing bottom');
    assert(getInnerHTML('element-insertions-main').endsWith('some backward-compatibility testing bottom'));
  });

  test('#wrap', function () {
    var element = $('wrap'), parent = document.createElement('div');
    element.wrap();
    assert(getInnerHTML('wrap-container').startsWith('<div><p'));
    element.wrap('div');
    assert(getInnerHTML('wrap-container').startsWith('<div><div><p'));

    element.wrap(parent);
    assert(Object.isFunction(parent.setStyle));
    assert(getInnerHTML('wrap-container').startsWith('<div><div><div><p'));

    element.wrap('div', { className: 'wrapper' });
    assert(element.up().hasClassName('wrapper'));
    element.wrap({ className: 'other-wrapper' });
    assert(element.up().hasClassName('other-wrapper'));
    element.wrap(new Element('div'), { className: 'yet-other-wrapper' });
    assert(element.up().hasClassName('yet-other-wrapper'));

    var orphan = new Element('p'), div = new Element('div');
    orphan.wrap(div);
    assert.equal(orphan.parentNode, div);
  });


  test('#wrap returns wrapper', function () {
    var element = new Element('div');
    var wrapper = element.wrap('div');
    assert.notEqual(element, wrapper);
    assert.equal(element.up(), wrapper);
  });

  test('#visible', function (done) {
    assert.notEqual('none', $('test-visible').style.display);
    assert($('test-visible').visible());
    assert.equal('none', $('test-hidden').style.display);
    assert(!$('test-hidden').visible());
    assert(!$('test-hidden-by-stylesheet').visible());
    var iframe = $('iframe');
    // Wait to make sure the IFRAME has loaded.
    setTimeout(function () {
      var paragraphs = iframe.contentWindow.document.querySelectorAll('p');
      assert(Element.visible(paragraphs[0]));
      assert(!Element.visible(paragraphs[1]));
      done();
    }, 500);
  });

  test('#toggle', function () {
    $('test-toggle-visible').toggle();
    assert(!$('test-toggle-visible').visible(), 'test-toggle-visible 1');
    $('test-toggle-visible').toggle();
    assert($('test-toggle-visible').visible()), 'test-toggle-visible 2';
    $('test-toggle-hidden').toggle();
    assert($('test-toggle-hidden').visible(), 'test-toggle-hidden 1');
    $('test-toggle-hidden').toggle();
    assert(!$('test-toggle-hidden').visible(), 'test-toggle-hidden 2');
  });

  test('#show', function () {
    $('test-show-visible').show();
    assert($('test-show-visible').visible());
    $('test-show-hidden').show();
    assert($('test-show-hidden').visible());
  });

  test('#hide', function () {
    $('test-hide-visible').hide();
    assert(!$('test-hide-visible').visible());
    $('test-hide-hidden').hide();
    assert(!$('test-hide-hidden').visible());
  });

  test('#remove', function () {
    $('removable').remove();
    assert($('removable-container').empty());
  });

  test('#update (with script)', function (done) {
    $('testdiv').update('hello from div!<script>\ntestVar="hello!";\n</'+'script>');
    assert.equal('hello from div!', $('testdiv').innerHTML);

    wait(100, done, function () {
      assert.equal('hello!', testVar);

      Element.update('testdiv','another hello from div!\n<script>testVar="another hello!"</'+'script>\nhere it goes');

      // Note: IE normalizes whitespace (like line breaks) to single spaces,
      // hence the match test.
      assert.match(
        $('testdiv').innerHTML,
        /^another hello from div!\s+here it goes$/
      );

      wait(100, done, function() {
        assert.equal('another hello!', testVar);

        Element.update('testdiv',
         'a\n<script>testVar="a"\ntestVar="b"</'+'script>');

        wait(100, done, function () {
          assert.equal('b', testVar);

          Element.update('testdiv',
            'x<script>testVar2="a"</'+'script>\nblah\n'+
            'x<script>testVar2="b"</'+'script>');
          wait(100, done, function () {
            assert.equal('b', testVar2);
            done();
          });
        });
      });
    });
  });

  test('#update (in table row)', function () {
    $('second_row').update('<td id="i_am_a_td">test</td>');
    assert.equal('test',$('i_am_a_td').innerHTML);

    Element.update('second_row','<td id="i_am_a_td">another <span>test</span></td>');
    assert.equal('another <span>test</span>',$('i_am_a_td').innerHTML.toLowerCase());
  });


  test('#update (in table cell)', function () {
    Element.update('a_cell','another <span>test</span>');
    assert.equal(
      'another <span>test</span>',
      $('a_cell').innerHTML.toLowerCase()
    );
  });

  test('#update (in table)', function () {
    Element.update('table','<tr><td>boo!</td></tr>');
    assert.match(
      $('table').innerHTML.toLowerCase(),
      /^<tr>\s*<td>boo!<\/td><\/tr>$/
    );
  });

  test('#update (in select)', function () {
    var select = $('select_for_update');
    select.update('<option value="3">option 3</option><option selected="selected">option 4</option>');
    assert.equal('option 4', select.getValue());
  });

  test('#update (with link tag)', function () {
    var div = new Element('div');
    div.update('<link rel="stylesheet" />');
    assert.equal(1, div.childNodes.length);
    var link = div.down('link');
    assert(link);
    assert(link.rel === 'stylesheet');

    div.update('<p><link rel="stylesheet"></p>')
    assert.equal(1, div.childNodes.length);
    assert.equal(1, div.firstChild.childNodes.length);

    var link = div.down('link');
    assert(link);
    assert(link.rel === 'stylesheet');
  });

  test('#update (with DOM node)', function () {
    $('testdiv').update(new Element('div').insert('bla'));
    assert.equal('<div>bla</div>', getInnerHTML('testdiv'));
  });

  test('#update (with toElement method)', function () {
    $('testdiv').update({ toElement: createParagraph.curry('foo') });
    assert.equal('<p>foo</p>', getInnerHTML('testdiv'));
  });

  test('#update (with toHTML method)', function () {
    $('testdiv').update({toHTML: function() { return 'hello world' }});
    assert.equal('hello world', getInnerHTML('testdiv'));
  });

  test('#update (with script)', function () {
    var el = new Element('script', {
      type: 'text/javascript'
    });
    assert.nothingRaised(function () {
      el.update('(function(){})');
    });
  });

  test('#replace', function () {
    $('testdiv-replace-1').replace('hello from div!');
    assert.equal('hello from div!', $('testdiv-replace-container-1').innerHTML);

    $('testdiv-replace-2').replace(123);
    assert.equal('123', $('testdiv-replace-container-2').innerHTML);

    $('testdiv-replace-3').replace();
    assert.equal('', $('testdiv-replace-container-3').innerHTML);

    $('testrow-replace').replace('<tr><td>hello</td></tr>');
    assert(getInnerHTML('testrow-replace-container').include('<tr><td>hello</td></tr>'));

    $('testoption-replace').replace('<option>hello</option>');
    assert($('testoption-replace-container').innerHTML.include('hello'));

    Element.replace('testinput-replace', '<p>hello world</p>');
    assert.equal('<p>hello world</p>', getInnerHTML('testform-replace'));

    Element.replace('testform-replace', '<form></form>');
    assert.equal('<p>some text</p><form></form><p>some text</p>', getInnerHTML('testform-replace-container'));
  });

  test('#replace (with script)', function (done) {
    $('testdiv-replace-4').replace('hello from div!<script>testVarReplace="hello!"</'+'script>');
    assert.equal('hello from div!', $('testdiv-replace-container-4').innerHTML);
    wait(100, done, function(){
      assert.equal('hello!', testVarReplace);

      $('testdiv-replace-5').replace('another hello from div!\n<script>testVarReplace="another hello!"</'+'script>\nhere it goes');

      // note: IE normalizes whitespace (like line breaks) to single spaces, thus the match test
      assert.match(
        $('testdiv-replace-container-5').innerHTML,
        /^another hello from div!\s+here it goes$/
      );
      wait(100, done, function(){
        assert.equal('another hello!', testVarReplace);
        done();
      });
    });
  });

  test('#replace (with DOM node)', function () {
    $('testdiv-replace-element').replace(createParagraph('hello'));
    assert.equal(
      '<p>hello</p>',
      getInnerHTML('testdiv-replace-container-element')
    );
  });

  test('#replace (with toElement method)', function () {
    $('testdiv-replace-toelement').replace({
      toElement: createParagraph.curry('hello')
    });
    assert.equal(
      '<p>hello</p>',
      getInnerHTML('testdiv-replace-container-toelement')
    );
  });

  test('#replace (with toHTML method)', function () {
    $('testdiv-replace-tohtml').replace({
      toHTML: function() { return 'hello' }
    });
    assert.equal('hello', getInnerHTML('testdiv-replace-container-tohtml'));
  });

  test('#select', function () {
    ['getElementsBySelector','select'].each(function (method) {
      var testSelector = $('container')[method]('p.test');
      assert.equal(testSelector.length, 4);
      assert.equal(testSelector[0], $('intended'));
      assert.equal(testSelector[0], $$('#container p.test')[0]);
    });
  });

  test('#adjacent', function () {
    var elements = $('intended').adjacent('p');
    assert.equal(elements.length, 3);
    elements.each(function(element){
      assert(element != $('intended'));
    });
  });

  test('#identify', function () {
    var parent = $('identification');
    assert.equal(parent.down().identify(), 'predefined_id',
     "identify should preserve the IDs of elements that already have them");
    assert(parent.down(1).identify().startsWith('anonymous_element_'),
     "should have #anonymous_element_1");
    assert(parent.down(2).identify().startsWith('anonymous_element_'),
     "should have #anonymous_element_2");
    assert(parent.down(3).identify().startsWith('anonymous_element_'),
     "should have #anonymous_element_3");

    assert(parent.down(3).id !== parent.down(2).id,
     "should not assign duplicate IDs");
  });

  test('#ancestors', function () {
    var ancestors = $('navigation_test_f').ancestors();
    assert.elementsMatch(ancestors, 'ul', 'li', 'ul#navigation_test',
      'div#nav_tests_isolator', 'div', 'div', 'body', 'html');
    assert.elementsMatch(ancestors.last().ancestors());

    var dummy = document.createElement('DIV');
    dummy.innerHTML = '<div></div>'.times(3);
    assert(typeof dummy.childNodes[0].ancestors()[0]['setStyle'] == 'function');
  });

  test('#descendants', function () {
    assert.elementsMatch($('navigation_test').descendants(),
      'li', 'em', 'li', 'em.dim', 'li', 'em', 'ul', 'li',
      'em.dim', 'li#navigation_test_f', 'em', 'li', 'em');
    assert.elementsMatch($('navigation_test_f').descendants(), 'em');

    var dummy = document.createElement('DIV');
    dummy.innerHTML = '<div></div>'.times(3);
    assert(typeof dummy.descendants()[0].setStyle == 'function');
  });

  test('#firstDescendant', function () {
    assert.elementMatches($('navigation_test').firstDescendant(), 'li.first');
    assert.isNull($('navigation_test_next_sibling').firstDescendant());
  });

  test('#childElements', function () {
    assert.elementsMatch($('navigation_test').childElements(),
      'li.first', 'li', 'li#navigation_test_c', 'li.last');
    assert.notEqual(0, $('navigation_test_next_sibling').childNodes.length);
    assert.enumEqual([], $('navigation_test_next_sibling').childElements());

    var dummy = document.createElement('DIV');
    dummy.innerHTML = '<div></div>'.times(3);
    assert(typeof dummy.childElements()[0].setStyle === 'function');
  });

  test('#immediateDescendants', function () {
    assert.strictEqual(
      Element.Methods.childElements,
      Element.Methods.immediateDescendants
    );
  });

  test('#previousSiblings', function () {
    assert.elementsMatch(
      $('navigation_test').previousSiblings(),
      'span#nav_test_prev_sibling', 'p.test', 'div', 'div#nav_test_first_sibling'
    );
    assert.elementsMatch($('navigation_test_f').previousSiblings(), 'li');

    var dummy = document.createElement('DIV');
    dummy.innerHTML = '<div></div>'.times(3);
    assert(typeof dummy.childNodes[1].previousSiblings()[0].setStyle == 'function');
  });

  test('#nextSiblings', function () {
    assert.elementsMatch($('navigation_test').nextSiblings(),
      'div#navigation_test_next_sibling', 'p');
    assert.elementsMatch($('navigation_test_f').nextSiblings());

    var dummy = document.createElement('DIV');
    dummy.innerHTML = '<div></div>'.times(3);
    assert(typeof dummy.childNodes[0].nextSiblings()[0].setStyle == 'function');
  });

  test('#siblings', function () {
    assert.elementsMatch($('navigation_test').siblings(),
      'div#nav_test_first_sibling', 'div', 'p.test',
      'span#nav_test_prev_sibling', 'div#navigation_test_next_sibling', 'p');

    var dummy = document.createElement('DIV');
    dummy.innerHTML = '<div></div>'.times(3);
    assert(typeof dummy.childNodes[0].siblings()[0].setStyle == 'function');
  });

  test('#up', function () {
    var element = $('navigation_test_f');
    assert.elementMatches(element.up(), 'ul');
    assert.elementMatches(element.up(0), 'ul');
    assert.elementMatches(element.up(1), 'li');
    assert.elementMatches(element.up(2), 'ul#navigation_test');
    assert.elementsMatch(element.up('li').siblings(), 'li.first', 'li', 'li.last');
    assert.elementMatches(element.up('ul', 1), 'ul#navigation_test');
    assert.equal(undefined, element.up('garbage'));
    assert.equal(undefined, element.up(8));
    assert.elementMatches(element.up('.non-existant, ul'), 'ul');

    var dummy = document.createElement('DIV');
    dummy.innerHTML = '<div></div>'.times(3);
    assert(typeof dummy.childNodes[0].up().setStyle == 'function');
  });

  test('#down', function () {
    var element = $('navigation_test');
    assert.elementMatches(element.down(), 'li.first');
    assert.elementMatches(element.down(0), 'li.first');
    assert.elementMatches(element.down(1), 'em');
    assert.elementMatches(element.down('li', 5), 'li.last');
    assert.elementMatches(element.down('ul').down('li', 1), 'li#navigation_test_f');
    assert.elementMatches(element.down('.non-existant, .first'), 'li.first');

    var dummy = document.createElement('DIV');
    dummy.innerHTML = '<div></div>'.times(3);
    assert(typeof dummy.down().setStyle == 'function');

    var input = $$('input')[0];
    assert.nothingRaised(function(){ input.down('span') });
    assert.isUndefined(input.down('span'));
  });

  test('#previous', function () {
    var element = $('navigation_test').down('li.last');
    assert.elementMatches(element.previous(), 'li#navigation_test_c');
    assert.elementMatches(element.previous(1), 'li');
    assert.elementMatches(element.previous('.first'), 'li.first');
    assert.equal(undefined, element.previous(3));
    assert.equal(undefined, $('navigation_test').down().previous());
    assert.elementMatches(element.previous('.non-existant, .first'), 'li.first');

    var dummy = document.createElement('DIV');
    dummy.innerHTML = '<div></div>'.times(3);
    assert(typeof dummy.childNodes[1].previous().setStyle == 'function');
  });

  test('#next', function () {
    var element = $('navigation_test').down('li.first');
    assert.elementMatches(element.next(), 'li');
    assert.elementMatches(element.next(1), 'li#navigation_test_c');
    assert.elementMatches(element.next(2), 'li.last');
    assert.elementMatches(element.next('.last'), 'li.last');
    assert.equal(undefined, element.next(3));
    assert.equal(undefined, element.next(2).next());
    assert.elementMatches(element.next('.non-existant, .last'), 'li.last');

    var dummy = document.createElement('DIV');
    dummy.innerHTML = '<div></div>'.times(3);
    assert(typeof dummy.childNodes[0].next().setStyle == 'function');
  });

  test('#inspect', function () {
    assert.equal('<ul id="navigation_test">', $('navigation_test').inspect());
    assert.equal('<li class="first">', $('navigation_test').down().inspect());
    assert.equal('<em>', $('navigation_test').down(1).inspect());
  });

  // TODO: Move #makeClipping to layout tests

  test('#extend', function () {
    Element.Methods.Simulated.simulatedMethod = function() {
      return 'simulated';
    };
    Element.addMethods();

    function testTag(tagName) {
      var element = document.createElement(tagName);
      assert.equal(element, Element.extend(element));
      // test method from Methods
      assert.respondsTo('show', element);
      // test method from Simulated
      assert.respondsTo('simulatedMethod', element);
    }
    var element = $('element_extend_test');
    assert.respondsTo('show', element);

    var XHTML_TAGS = $w(
      'a abbr acronym address area '+
      'b bdo big blockquote br button caption '+
      'cite code col colgroup dd del dfn div dl dt '+
      'em fieldset form h1 h2 h3 h4 h5 h6 hr '+
      'i iframe img input ins kbd label legend li '+
      'map object ol optgroup option p param pre q samp '+
      'script select small span strong style sub sup '+
      'table tbody td textarea tfoot th thead tr tt ul var');

    XHTML_TAGS.each(function(tag) {
      var element = document.createElement(tag);
      assert.equal(element, Element.extend(element));
      assert.respondsTo('show', element);
    });

    [null,'','a','aa'].each(function (content) {
      var textnode = document.createTextNode(content);
      assert.equal(textnode, Element.extend(textnode));
      assert(typeof textnode['show'] == 'undefined');
    });

    // clean up
    delete Element.Methods.Simulated.simulatedMethod;
  });

  test('#extend re-extends discarded nodes', function () {
    assert.respondsTo('show', $('discard_1'));
    $('element_reextend_test').innerHTML += '<div id="discard_2"></div>';
    assert.respondsTo('show', $('discard_1'));
  });

  test('#cleanWhitespace', function () {
    Element.cleanWhitespace("test_whitespace");
    assert.equal(3, $("test_whitespace").childNodes.length);

    assert.equal(1, $("test_whitespace").firstChild.nodeType);
    assert.equal('SPAN', $("test_whitespace").firstChild.tagName);

    assert.equal(1, $("test_whitespace").firstChild.nextSibling.nodeType);
    assert.equal('DIV', $("test_whitespace").firstChild.nextSibling.tagName);

    assert.equal(1, $("test_whitespace").firstChild.nextSibling.nextSibling.nodeType);
    assert.equal('SPAN', $("test_whitespace").firstChild.nextSibling.nextSibling.tagName);

    var element = document.createElement('DIV');
    element.appendChild(document.createTextNode(''));
    element.appendChild(document.createTextNode(''));
    assert.equal(2, element.childNodes.length);
    Element.cleanWhitespace(element);
    assert.equal(0, element.childNodes.length);
  });

  test('#empty', function () {
    assert($('test-empty').empty());
    assert($('test-empty-but-contains-whitespace').empty());
    assert(!$('test-full').empty());
  });

  test('#descendantOf', function () {
    assert($('child').descendantOf('ancestor'),
     '#child should be descendant of #ancestor');
    assert($('child').descendantOf($('ancestor')),
     '#child should be descendant of #ancestor');
    assert(!$('ancestor').descendantOf($('child')),
     '#ancestor should not be descendant of child');

    assert(!$('child').descendantOf($('non-existent-thing')), 'cannot be a descendant of a non-element');
    assert(!Element.descendantOf('non-existent-thing', $('ancestor')), 'non-element cannot be a descendant of anything');

    assert($('great-grand-child').descendantOf('ancestor'), 'great-grand-child < ancestor');
    assert($('grand-child').descendantOf('ancestor'), 'grand-child < ancestor');
    assert($('great-grand-child').descendantOf('grand-child'), 'great-grand-child < grand-child');
    assert($('grand-child').descendantOf('child'), 'grand-child < child');
    assert($('great-grand-child').descendantOf('child'), 'great-grand-child < child');

    assert($('sibling').descendantOf('ancestor'), 'sibling < ancestor');
    assert($('grand-sibling').descendantOf('sibling'), 'grand-sibling < sibling');
    assert($('grand-sibling').descendantOf('ancestor'), 'grand-sibling < ancestor');

    assert($('grand-sibling').descendantOf(document.body), 'grand-sibling < body');

    assert(!$('great-grand-child').descendantOf('great-grand-child'), 'great-grand-child < great-grand-child');
    assert(!$('great-grand-child').descendantOf('sibling'), 'great-grand-child < sibling');
    assert(!$('sibling').descendantOf('child'), 'sibling < child');
    assert(!$('great-grand-child').descendantOf('not-in-the-family'), 'great-grand-child < not-in-the-family');
    assert(!$('child').descendantOf('not-in-the-family'), 'child < not-in-the-family');

    assert(!document.body.descendantOf('great-grand-child'),
     'BODY should not be descendant of anything within it');

    // dynamically-created elements
    $('ancestor').insert(new Element('div', { id: 'weird-uncle' }));
    assert($('weird-uncle').descendantOf('ancestor'),
     'dynamically-created element should work properly');

    document.body.insert(new Element('div', { id: 'impostor' }));
    assert(!$('impostor').descendantOf('ancestor'),
     'elements inserted elsewhere in the DOM tree should not be descendants');

    // test descendantOf document
    assert(document.body.descendantOf(document),
     'descendantOf(document) should behave predictably');
    assert(document.documentElement.descendantOf(document),
     'descendantOf(document) should behave predictably');
  });

  test('#childOf', function () {
    assert($('child').childOf('ancestor'));
    assert($('child').childOf($('ancestor')));
    assert($('great-grand-child').childOf('ancestor'));
    assert(!$('great-grand-child').childOf('not-in-the-family'));
    assert.strictEqual(Element.Methods.childOf, Element.Methods.descendantOf);
  });

  test('#setStyle', function () {
    Element.setStyle('style_test_3',{ 'left': '2px' });
    assert.equal('2px', $('style_test_3').style.left);

    Element.setStyle('style_test_3',{ marginTop: '1px' });
    assert.equal('1px', $('style_test_3').style.marginTop);

    $('style_test_3').setStyle({ marginTop: '2px', left: '-1px' });
    assert.equal('-1px', $('style_test_3').style.left);
    assert.equal('2px', $('style_test_3').style.marginTop);

    assert.equal('none', $('style_test_3').getStyle('float'));
    $('style_test_3').setStyle({ 'float': 'left' });
    assert.equal('left', $('style_test_3').getStyle('float'));

    $('style_test_3').setStyle({ cssFloat: 'none' });
    assert.equal('none', $('style_test_3').getStyle('float'));

    assert.equal(1, $('style_test_3').getStyle('opacity'),
     '#style_test_3 opacity should be 1');

    $('style_test_3').setStyle({ opacity: 0.5 });
    assert.equal(0.5, $('style_test_3').getStyle('opacity'));

    $('style_test_3').setStyle({ opacity: '' });
    assert.equal(1, $('style_test_3').getStyle('opacity'),
     '#style_test_3 opacity should be 1');

    $('style_test_3').setStyle({ opacity: 0 });
    assert.equal(0, $('style_test_3').getStyle('opacity'),
     '#style_test_3 opacity should be 0');

    $('test_csstext_1').setStyle('font-size: 15px');
    assert.equal('15px', $('test_csstext_1').getStyle('font-size'));

    $('test_csstext_2').setStyle({height: '40px'});
    $('test_csstext_2').setStyle('font-size: 15px');
    assert.equal('15px', $('test_csstext_2').getStyle('font-size'));
    assert.equal('40px', $('test_csstext_2').getStyle('height'));

    $('test_csstext_3').setStyle('font-size: 15px');
    assert.equal('15px', $('test_csstext_3').getStyle('font-size'));
    assert.equal('1px', $('test_csstext_3').getStyle('border-top-width'));

    $('test_csstext_4').setStyle('font-size: 15px');
    assert.equal('15px', $('test_csstext_4').getStyle('font-size'));

    $('test_csstext_4').setStyle('float: right; font-size: 10px');
    assert.equal('right', $('test_csstext_4').getStyle('float'));
    assert.equal('10px', $('test_csstext_4').getStyle('font-size'));

    $('test_csstext_5').setStyle('float: left; opacity: .5; font-size: 10px');
    assert.equal(parseFloat('0.5'), parseFloat($('test_csstext_5').getStyle('opacity')));
  });

  test('#setStyle (with camelCased object properties)', function () {
    assert.notEqual('30px', $('style_test_3').style.marginTop);
    $('style_test_3').setStyle({ marginTop: '30px'}, true);
    assert.equal('30px', $('style_test_3').style.marginTop);
  });

  test('#getStyle', function () {
    assert.equal("none",
      $('style_test_1').getStyle('display'));

    // not displayed, so "null" ("auto" is tranlated to "null")
    assert.isNull(Element.getStyle('style_test_1', 'width'), 'elements that are hidden should return null on getStyle("width")');

    $('style_test_1').show();

    // from id rule
    assert.equal("pointer",
      Element.getStyle('style_test_1','cursor'));

    assert.equal("block",
      Element.getStyle('style_test_2','display'));

    // we should always get something for width (if displayed)
    // Firefox and Safari automatically send the correct value,
    // IE is special-cased to do the same
    assert.equal($('style_test_2').offsetWidth+'px', Element.getStyle('style_test_2','width'));

    assert.equal("static",Element.getStyle('style_test_1','position'));
    // from style
    assert.equal("11px",
      Element.getStyle('style_test_2','font-size'));
    // from class
    assert.equal("1px",
      Element.getStyle('style_test_2','margin-left'));

    ['not_floating_none','not_floating_style','not_floating_inline'].each(function(element) {

      assert.equal('none', $(element).getStyle('float'),
       'float on ' + element);
      assert.equal('none', $(element).getStyle('cssFloat'),
       'cssFloat on ' + element);
    }, this);

    ['floating_style','floating_inline'].each(function(element) {
      assert.equal('left', $(element).getStyle('float'));
      assert.equal('left', $(element).getStyle('cssFloat'));
    }, this);

    assert.equal(0.5, $('op1').getStyle('opacity'), 'get opacity on #op1');
    assert.equal(0.5, $('op2').getStyle('opacity'), 'get opacity on #op2');
    assert.equal(1.0, $('op3').getStyle('opacity'), 'get opacity on #op3');

    $('op1').setStyle({opacity: '0.3'});
    $('op2').setStyle({opacity: '0.3'});
    $('op3').setStyle({opacity: '0.3'});

    assert.equal(0.3, $('op1').getStyle('opacity'), 'get opacity on #op1');
    assert.equal(0.3, $('op2').getStyle('opacity'), 'get opacity on #op2');
    assert.equal(0.3, $('op3').getStyle('opacity'), 'get opacity on #op3');

    $('op3').setStyle({opacity: 0});
    assert.equal(0, $('op3').getStyle('opacity'), 'get opacity on #op3');

    // Opacity feature test borrowed from Modernizr.
    var STANDARD_CSS_OPACITY_SUPPORTED = (function() {
      var DIV = document.createElement('div');
      DIV.style.cssText = "opacity:.55";
      var result = /^0.55/.test(DIV.style.opacity);
      DIV = null;
      return result;
    })();

    if (!STANDARD_CSS_OPACITY_SUPPORTED) {
      // Run these tests only on older versions of IE. IE9 and 10 dropped
      // support for filters and therefore fail these tests.
      assert.equal('alpha(opacity=30)', $('op1').getStyle('filter').strip());
      assert.equal('progid:DXImageTransform.Microsoft.Blur(strength=10) alpha(opacity=30)', $('op2').getStyle('filter'));
      $('op2').setStyle({opacity:''});
      assert.equal('progid:DXImageTransform.Microsoft.Blur(strength=10)', $('op2').getStyle('filter').strip());
      assert.equal('alpha(opacity=0)', $('op3').getStyle('filter').strip());
      assert.equal(0.3, $('op4-ie').getStyle('opacity'));
    }

    // verify that value is still found when using camelized
    // strings (function previously used getPropertyValue()
    // which expected non-camelized strings)
    assert.equal("12px", $('style_test_1').getStyle('fontSize'));

    // getStyle on width/height should return values according to
    // the CSS box-model, which doesn't include
    // margin, padding, or borders
    // TODO: This test fails on IE because there seems to be no way
    // to calculate this properly (clientWidth/Height returns 0)
    if(!navigator.appVersion.match(/MSIE/)) {
      assert.equal("14px", $('style_test_dimensions').getStyle('width'));
      assert.equal("17px", $('style_test_dimensions').getStyle('height'));
    }

    // height/width could always be calculated if it's set to "auto" (Firefox)
    assert.isNotNull($('auto_dimensions').getStyle('height'));
    assert.isNotNull($('auto_dimensions').getStyle('width'));
  });

  test('#setOpacity', function () {
    [0, 0.1, 0.5, 0.999].each(function (opacity) {
      $('style_test_3').setOpacity(opacity);

      // b/c of rounding issues on IE special case
      var realOpacity = $('style_test_3').getStyle('opacity');

      // opera rounds off to two significant digits, so we check for a
      // ballpark figure
      assert(
        (Number(realOpacity) - opacity) <= 0.002,
        'setting opacity to ' + opacity + ' (actual: ' + realOpacity + ')'
      );
    });

    assert.equal(0,
      $('style_test_3').setOpacity(0.0000001).getStyle('opacity'));

    // for Firefox, we don't set to 1, because of flickering
    assert(
      $('style_test_3').setOpacity(0.9999999).getStyle('opacity') > 0.999
    );

    // setting opacity before element was added to DOM
    assert.equal(0.5, new Element('div').setOpacity(0.5).getOpacity());
  });

  test('#getOpacity', function () {
    assert.equal(0.45, $('op1').setOpacity(0.45).getOpacity());
  });

  test('#readAttribute', function () {
    assert.equal('test.html' , $('attributes_with_issues_1').readAttribute('href'));
    assert.equal('L' , $('attributes_with_issues_1').readAttribute('accesskey'));
    assert.equal('50' , $('attributes_with_issues_1').readAttribute('tabindex'));
    assert.equal('a link' , $('attributes_with_issues_1').readAttribute('title'));

    $('cloned_element_attributes_issue').readAttribute('foo')
    var clone = $('cloned_element_attributes_issue').clone(true);
    clone.writeAttribute('foo', 'cloned');
    assert.equal('cloned', clone.readAttribute('foo'));
    assert.equal('original', $('cloned_element_attributes_issue').readAttribute('foo'));

    ['href', 'accesskey', 'accesskey', 'title'].each(function(attr) {
      assert.equal('' , $('attributes_with_issues_2').readAttribute(attr));
    }, this);

    ['checked','disabled','readonly','multiple'].each(function(attr) {
      assert.equal(attr, $('attributes_with_issues_'+attr).readAttribute(attr));
    }, this);

    assert.equal("alert('hello world');", $('attributes_with_issues_1').readAttribute('onclick'));
    assert.isNull($('attributes_with_issues_1').readAttribute('onmouseover'));

    assert.equal('date', $('attributes_with_issues_type').readAttribute('type'));
    assert.equal('text', $('attributes_with_issues_readonly').readAttribute('type'));

    var elements = $('custom_attributes').immediateDescendants();
    assert.deepEqual(['1', '2'], elements.invoke('readAttribute', 'foo'));
    assert.deepEqual(['2', null], elements.invoke('readAttribute', 'bar'));

    var table = $('write_attribute_table');
    assert.equal('4', table.readAttribute('cellspacing'));
    assert.equal('6', table.readAttribute('cellpadding'));
  });

  test('#writeAttribute', function () {
    var element = document.body.appendChild(document.createElement('p'));
    assert.respondsTo('writeAttribute', element);
    assert.equal(element, element.writeAttribute('id', 'write_attribute_test'));
    assert.equal('write_attribute_test', element.id);
    assert.equal('http://prototypejs.org/', $('write_attribute_link').
      writeAttribute({href: 'http://prototypejs.org/', title: 'Home of Prototype'}).href);
    assert.equal('Home of Prototype', $('write_attribute_link').title);

    var element2 = document.createElement('p');
    element2.writeAttribute('id', 'write_attribute_without_hash');
    assert.equal('write_attribute_without_hash', element2.id);
    element2.writeAttribute('animal', 'cat');
    assert.equal('cat', element2.readAttribute('animal'));
  });

  test('#writeAttribute (with booleans)', function () {
    var input = $('write_attribute_input'),
      select = $('write_attribute_select');
    assert( input.          writeAttribute('readonly').            hasAttribute('readonly'), '1');
    assert(!input.          writeAttribute('readonly', false).     hasAttribute('readonly'), '2');
    assert( input.          writeAttribute('readonly', true).      hasAttribute('readonly'), '3');
    assert(!input.          writeAttribute('readonly', null).      hasAttribute('readonly'), '4');
    assert( input.          writeAttribute('readonly', 'readonly').hasAttribute('readonly'), '5');
    assert( select.         writeAttribute('multiple').            hasAttribute('multiple'), '6');
    assert( input.          writeAttribute('disabled').            hasAttribute('disabled'), '7');
  });

  test('#writeAttribute (for checkbox)', function () {
    var checkbox = $('write_attribute_checkbox'),
      checkedCheckbox = $('write_attribute_checked_checkbox');
    assert( checkbox.       writeAttribute('checked').             checked,                   '1');
    assert( checkbox.       writeAttribute('checked').             hasAttribute('checked'),   '2');
    assert.equal('checked', checkbox.writeAttribute('checked').readAttribute('checked'),      '3');
    assert(!checkbox.       writeAttribute('checked').             hasAttribute('undefined'), '4');
    assert( checkbox.       writeAttribute('checked', true).       checked,                   '5');
    assert( checkbox.       writeAttribute('checked', true).       hasAttribute('checked'),   '6');
    assert( checkbox.       writeAttribute('checked', 'checked').  checked,                   '7');
    assert( checkbox.       writeAttribute('checked', 'checked').  hasAttribute('checked'),   '8');
    assert(!checkbox.       writeAttribute('checked', null).       checked,                   '9');
    assert(!checkbox.       writeAttribute('checked', null).       hasAttribute('checked'),   '10');
    assert(!checkbox.       writeAttribute('checked', true).       hasAttribute('undefined'), '11');
    assert(!checkedCheckbox.writeAttribute('checked', false).      checked,                   '12');
    assert(!checkbox.       writeAttribute('checked', false).      hasAttribute('checked'),   '13');
  });

  test('#writeAttribute (for style)', function () {
    var element = document.body.appendChild(document.createElement('p'));
    assert( element.        writeAttribute('style', 'color: red'). hasAttribute('style'));
    assert(!element.        writeAttribute('style', 'color: red'). hasAttribute('undefined'));
  });

  test('#writeAttribute (problematic attributes)', function () {
    var input = $('write_attribute_input').writeAttribute({maxlength: 90, tabindex: 10}),
      td = $('write_attribute_td').writeAttribute({valign: 'bottom', colspan: 2, rowspan: 2});
    assert.equal("90", input.readAttribute('maxlength'));
    assert.equal("10", input.readAttribute('tabindex'));
    assert.equal("2",  td.readAttribute('colspan'));
    assert.equal("2",  td.readAttribute('rowspan'));
    assert.equal('bottom', td.readAttribute('valign'));

    var p = $('write_attribute_para'), label = $('write_attribute_label');
    assert.equal('some-class',     p.    writeAttribute({'class':   'some-class'}).    readAttribute('class'));
    assert.equal('some-className', p.    writeAttribute({className: 'some-className'}).readAttribute('class'));
    assert.equal('some-id',        label.writeAttribute({'for':     'some-id'}).       readAttribute('for'));
    assert.equal('some-other-id',  label.writeAttribute({htmlFor:   'some-other-id'}). readAttribute('for'));

    assert(p.writeAttribute({style: 'width: 5px;'}).readAttribute('style').toLowerCase().include('width'));

    var table = $('write_attribute_table');
    table.writeAttribute('cellspacing', '2')
    table.writeAttribute('cellpadding', '3')
    assert.equal('2', table.readAttribute('cellspacing'));
    assert.equal('3', table.readAttribute('cellpadding'));

    var iframe = new Element('iframe', { frameborder: 0 });
    assert.deepEqual(0, parseInt(iframe.readAttribute('frameborder')));
  });

  test('#writeAttribute (custom attributes)', function () {
    var p = $('write_attribute_para').writeAttribute({
     name: 'martin', location: 'stockholm', age: 26 });
    assert.equal('martin',    p.readAttribute('name'));
    assert.equal('stockholm', p.readAttribute('location'));
    assert.equal('26',        p.readAttribute('age'));
  });

  test('#hasAttribute', function () {
    var label = $('write_attribute_label');
    assert.deepEqual(true,  label.hasAttribute('for'));
    assert.deepEqual(false, label.hasAttribute('htmlFor'));
    assert.deepEqual(false, label.hasAttribute('className'));
    assert.deepEqual(false, label.hasAttribute('rainbows'));

    var input = $('write_attribute_input');
    assert.notDeepEqual(null, input.hasAttribute('readonly'));
    assert.notDeepEqual(null, input.hasAttribute('readOnly'));
  });

  test('new Element', function () {
    assert(new Element('h1'));

    var XHTML_TAGS = $w(
      'a abbr acronym address area '+
      'b bdo big blockquote br button caption '+
      'cite code col colgroup dd del dfn div dl dt '+
      'em fieldset form h1 h2 h3 h4 h5 h6 hr '+
      'i iframe img input ins kbd label legend li '+
      'map object ol optgroup option p param pre q samp '+
      'script select small span strong style sub sup '+
      'table tbody td textarea tfoot th thead tr tt ul var');

    XHTML_TAGS.each(function(tag, index) {
      var id = tag + '_' + index, element = document.body.appendChild(new Element(tag, {id: id}));
      assert.equal(tag, element.tagName.toLowerCase());
      assert.equal(element, document.body.lastChild);
      assert.equal(id, element.id);
      Element.remove(element);
    }, this);


    assert.respondsTo('update', new Element('div'));
    Element.addMethods({
      cheeseCake: function(){
        return 'Cheese cake';
      }
    });

    assert.respondsTo('cheeseCake', new Element('div'));

    assert.equal('foobar', new Element('a', {custom: 'foobar'}).readAttribute('custom'));
    var input = document.body.appendChild(new Element('input',
      {id: 'my_input_field_id', name: 'my_input_field'}));
    assert.equal(input, document.body.lastChild);
    assert.equal('my_input_field', $(document.body.lastChild).name);
    if ('outerHTML' in document.documentElement) {
      assert.match(
        $('my_input_field_id').outerHTML,
        /name=["']?my_input_field["']?/
      );
    }

    elWithClassName = new Element('div', { 'className': 'firstClassName' });
    assert(elWithClassName.hasClassName('firstClassName'));

    elWithClassName = new Element('div', { 'class': 'firstClassName' });
    assert(elWithClassName.hasClassName('firstClassName'));

    var radio = new Element('input', { type: 'radio', value: 'test' });
    assert(radio.value === 'test', 'value of a dynamically-created radio button');

    var radio2 = new Element('input', { type: 'radio', value: 'test2' });
    assert(radio2.value === 'test2', 'value of a dynamically-created radio button');

    var checkbox = new Element('input', { type : 'checkbox', checked : false });
    assert(!checkbox.checked);

  });

  // TODO: Move getHeight, getWidth, getDimensions to layout

  test('DOM attributes have precedence over extended element methods', function () {
    assert.nothingRaised(function() {
      $('dom_attribute_precedence').down('form');
    });
    assert.equal(
      $('dom_attribute_precedence').down('input'),
      $('dom_attribute_precedence').down('form').update
    );
  });

  test('#hasClassName', function () {
    assert($('class_names').down().hasClassName('A'));
    assert($('class_names_ul').hasClassName('A'));
    assert($('class_names_ul').hasClassName('B'));

    assert(!$('class_names').hasClassName('does_not_exist'));
    assert(!$('class_names').down().hasClassName('does_not_exist'));
    assert(!$('class_names_ul').hasClassName('does_not_exist'))
  });

  test('#addClassName', function () {
    $('class_names').addClassName('added_className');

    assert.enumEqual(['added_className'], $('class_names').classNames());

    // verify that className cannot be added twice.
    $('class_names').addClassName('added_className');
    assert.enumEqual(['added_className'], $('class_names').classNames(), '2');

    $('class_names').addClassName('another_added_className');
    assert.enumEqual(['added_className', 'another_added_className'], $('class_names').classNames(), '3');

  });

  test('#removeClassName', function () {
    $('class_names').removeClassName('added_className');
    assert.enumEqual(['another_added_className'], $('class_names').classNames());

    $('class_names').removeClassName('added_className'); // verify that removing a non existent className is safe.
    assert.enumEqual(['another_added_className'], $('class_names').classNames());

    $('class_names').removeClassName('another_added_className');
    assert.enumEqual([], $('class_names').classNames());
  });

  test('#toggleClassName', function () {
    $('class_names').toggleClassName('toggled_className');
    assert.enumEqual(['toggled_className'], $('class_names').classNames());

    $('class_names').toggleClassName('toggled_className');
    assert.enumEqual([], $('class_names').classNames());

    $('class_names_ul').toggleClassName('toggled_className');
    assert.enumEqual(['A', 'B', 'toggled_className'], $('class_names_ul').classNames());

    $('class_names_ul').toggleClassName('toggled_className');
    assert.enumEqual(['A', 'B'], $('class_names_ul').classNames());
  });

  test('#scrollTo', function () {
    var elem = $('scroll_test_2');
    Element.scrollTo('scroll_test_2');
    assert.equal(elem.viewportOffset().top, 0);
    window.scrollTo(0, 0);

    elem.scrollTo();
    assert.equal(elem.viewportOffset().top, 0);
    window.scrollTo(0, 0);
  });

  test('custom element methods', function () {
    var elem = $('navigation_test_f');
    assert.respondsTo('hashBrowns', elem);
    assert.equal('hash browns', elem.hashBrowns());

    assert.respondsTo('hashBrowns', Element);
    assert.equal('hash browns', Element.hashBrowns(elem));
  });

  test('specific custom element methods', function () {
    var elem = $('navigation_test_f');

    assert(Element.Methods.ByTag[elem.tagName]);
    assert.respondsTo('pancakes', elem);
    assert.equal("pancakes", elem.pancakes());

    var elem2 = $('test-visible');

    assert(Element.Methods.ByTag[elem2.tagName]);
    assert.isUndefined(elem2.pancakes);
    assert.respondsTo('waffles', elem2);
    assert.equal("waffles", elem2.waffles());

    assert.respondsTo('orangeJuice', elem);
    assert.respondsTo('orangeJuice', elem2);
    assert.equal("orange juice", elem.orangeJuice());
    assert.equal("orange juice", elem2.orangeJuice());

    assert(typeof Element.orangeJuice == 'undefined');
    assert(typeof Element.pancakes == 'undefined');
    assert(typeof Element.waffles == 'undefined');

  });

  test('script fragment', function () {
    var element = document.createElement('div');
    // Tests an issue with Safari 2.0 crashing when the ScriptFragment
    // regular expression is using a pipe-based approach for
    // matching any character.
    ['\r','\n',' '].each(function(character){
      $(element).update("<script>"+character.times(10000)+"</scr"+"ipt>");
      assert.equal('', element.innerHTML);
    });
    $(element).update("<script>var blah='"+'\\'.times(10000)+"'</scr"+"ipt>");
    assert.equal('', element.innerHTML);
  });

  // TODO: Position.* methods?

  // TODO: Move layout-related tests to layout.js


  test('node constants', function () {
    assert(window.Node, 'window.Node is unavailable');

    var constants = $H({
      ELEMENT_NODE: 1,
      ATTRIBUTE_NODE: 2,
      TEXT_NODE: 3,
      CDATA_SECTION_NODE: 4,
      ENTITY_REFERENCE_NODE: 5,
      ENTITY_NODE: 6,
      PROCESSING_INSTRUCTION_NODE: 7,
      COMMENT_NODE: 8,
      DOCUMENT_NODE: 9,
      DOCUMENT_TYPE_NODE: 10,
      DOCUMENT_FRAGMENT_NODE: 11,
      NOTATION_NODE: 12
    });

    constants.each(function(pair) {
      assert.equal(Node[pair.key], pair.value);
    });
  });

  test('element storage', function () {
    var element = $('test-empty');
    element.store('foo', 'bar');
    assert.equal("bar", element.retrieve("foo"), "Setting and reading a property");
    var result = element.store('foo', 'thud');
    assert.equal("thud", element.retrieve("foo"), "Re-setting and reading property");
    assert.strictEqual(element, result, "Element#store should return element");

    element.store('bar', 'narf');
    assert.enumEqual($w('foo bar'), element.getStorage().keys(), "Getting the storage hash");
    element.getStorage().unset('bar');
    assert.enumEqual($w('foo'), element.getStorage().keys(), "Getting the storage hash after unsetting a key");

    element.store({ 'narf': 'narf', 'zort': 'zort' });

    assert.equal("narf", element.retrieve('narf'), "Storing multiple properties at once");
    assert.equal("zort", element.retrieve('zort'), "Storing multiple properties at once");

    assert.isUndefined(element.retrieve('bar'), "Undefined key should return undefined if default value is not defined");
    assert.equal("default", element.retrieve('bar', 'default'), "Return default value if undefined key");
    assert.equal("default", element.retrieve('bar'), "Makes sure default value has been set properly");


    $('test-empty').store('foo', 'bar');
    var clonedElement = $('test-empty').clone(false);
    assert.equal(
      clonedElement.retrieve('foo', null),
      null,
      "Cloning a node should not confuse the storage engine"
    );
  });

  test('#clone', function () {
    var element = new Element('div', {
      title: 'bar'
    });
    element.className = 'foo';

    // add child
    element.update('<span id="child">child node</span>');

    // add observer
    element.observe('click', Prototype.emptyFunction);

    // add observer on a child
    element.down('span').observe('dblclick', Prototype.emptyFunction);

    element.store('foo', 'bar');
    element.down('span').store('baz', 'thud');

    var shallowClone = element.clone();
    var deepClone = element.clone(true);

    var assertCloneTraits = (function(clone) {
      assert(clone, 'clone should exist');
      assert(clone.show, 'clone should be extended');
      assert.equal('DIV', clone.nodeName.toUpperCase(),
       'clone should have proper tag name');
      assert.equal('foo', clone.className,
       'clone should have proper attributes');
      assert.equal('bar', clone.title,
       'clone should have proper title');

      assert.equal(
        clone.retrieve('foo', false),
        false,
        'clone should not share storage with original'
      );
    }).bind(this);

    // test generic traits of both deep and shallow clones first
    assertCloneTraits(shallowClone);
    assertCloneTraits(deepClone);

    // test deep clone traits
    assert(deepClone.firstChild,
     'deep clone should have children');
    assert.equal('SPAN', deepClone.firstChild.nodeName.toUpperCase(),
     "deep clone's children should have proper tag name");
    assert.equal(
      deepClone.down('span').retrieve('baz', false),
      false,
      "deep clone's child should not share storage with original's child"
    );
  });

  test('#purge', function () {
    function uidForElement(elem) {
      return elem._prototypeUID;
    }

    var element = new Element('div');
    element.store('foo', 'bar');

    var uid = uidForElement(element);
    assert(uid in Element.Storage, "newly-created element's uid should exist in `Element.Storage`");

    var storageKeysBefore = Object.keys(Element.Storage).length;
    element.purge();
    var storageKeysAfter = Object.keys(Element.Storage).length;

    assert.equal(
      storageKeysAfter,
      storageKeysBefore - 1,
      "purged element's UID should no longer exist in `Element.Storage`"
    );

    // Should purge elements replaced via innerHTML.
    var parent = new Element('div');
    var child = new Element('p').update('lorem ipsum');

    parent.insert(child);
    child.store('foo', 'bar');

    var trigger = false;
    child.observe('click', function(event) { trigger = true; });
    var childUID = child._prototypeUID;

    storageKeysBefore = Object.keys(Element.Storage).length;
    parent.update("");
    storageKeysAfter = Object.keys(Element.Storage).length;

    // At this point, `child` should have been purged.
    assert.equal(
      storageKeysAfter,
      storageKeysBefore - 1,
      "purged element's UID should no longer exist in `Element.Storage`"
    );

    // Simulate a click to be sure the element's handler has been
    // unregistered.
    simulateClick(child);
    assert(!trigger, "fired event should not have triggered handler");
  });


});
