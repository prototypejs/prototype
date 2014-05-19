
suite('Form', function () {
  this.timeout(5000);
  this.name = 'form';

  setup(function () {
    // $$('div.form-tests form').invoke('reset');
    $$('div.form-tests form').each(function (f) {
      Form.reset(f);
    });
    // for some reason, hidden value does not reset
    $('form-test-bigform')['tf_hidden'].value = '';
  });

  test('$F', function () {
    assert.equal("4", $F('input_enabled'));
  });

  test('reset', function () {
    assert(!Object.isUndefined(Form.reset('form-test-form').reset));
  });

  test('Element.EventObserver', function () {
    var callbackCounter = 0;
    var observer = new Form.Element.EventObserver('input_enabled', function () {
      callbackCounter++;
    });

    assert.equal(0, callbackCounter, 'callbacks should be 0');

    $('input_enabled').value = 'boo!';

    // Can't test the event directly, so we simulate it.
    observer.onElementEvent();

    assert.equal(1, callbackCounter, 'callbacks should be 1');
  });

  test('Element.Observer', function (done) {
    var timedCounter = 0;

    // FIRST: Test a regular field.
    var observer = new Form.Element.Observer('input_enabled', 0.5, function () {
      ++timedCounter;
    });

    assert.equal(0, timedCounter);

    // Test it doesn't change on first check.
    setTimeout(function () {
      assert.equal(0, timedCounter);

      // Change it, ensure it hasn't changed immediately.
      $('input_enabled').value = 'yowza!';
      assert.equal(0, timedCounter);

      // Ensure it changes on next check, but not again on the next.
      setTimeout(function () {
        assert.equal(1, timedCounter);
        setTimeout(function () {
          assert.equal(1, timedCounter);
          done();

        }, 550);
      }, 550);
    }, 550);
  });

  test('Element.Observer with multi-select', function (done) {
    // SECOND: Test a multiple-select.
    [1, 2, 3].each(function (index) {
      $('multiSel1_opt' + index).selected = (1 === index);
    });

    var timedCounter = 0;
    var observer = new Form.Element.Observer('multiSel1', 0.5, function () {
      ++timedCounter;
    });

    assert.equal(0, timedCounter);

    // Test it doesn't change on first check.
    setTimeout(function () {
      assert.equal(0, timedCounter, 'before we change it');

      // Change it, ensure it hasn't changed immediately.
      // NOTE: it is important that the 3rd be re-selected, for the
      // serialize form to obtain the expected value :-)
      $('multiSel1_opt3').selected = true;
      assert.equal(0, timedCounter, "while we're changing it");

      // Ensure it changes on next check, but not again on the next.
      setTimeout(function () {
        assert.equal(1, timedCounter, "just after we've changed it");
        setTimeout(function () {
          assert.equal(1, timedCounter, "long after we've changed it");
          done();
        }, 550);
      }, 550);
    }, 550);
  });

  test('Observer', function (done) {
    var timedCounter = 0;

    // Should work the same way as Form.Element.Observer;
    var observer = new Form.Observer('form-test-form', 0.5, function (form, value) {
      ++timedCounter;
    });

    assert.equal(0, timedCounter);

    // Test it doesn't change on first check.
    wait(550, done, function () {
      assert.equal(0, timedCounter, 'callbacks should be 0');

      // Change it, ensure it hasn't changed immediately.
      $('input_enabled').value = 'yowza!';
      assert.equal(0, timedCounter, 'callbacks should be 0 still');

      wait(550, done, function () {
        assert.equal(1, timedCounter, 'callbacks should be 1');

        wait(550, done, function () {
          assert.equal(1, timedCounter, 'callbacks should be 1 still');
          observer.stop();
          done();
        });
      });
    });

  });

  test('enabling forms', function () {
    var form = $('form-test-bigform');
    var input1 = $('dummy_disabled');
    var input2 = $('focus_text');

    assert.disabled(input1);
    assert.enabled(input2);

    form.disable();
    assert.disabled(input1, input2);

    form.enable();
    assert.enabled(input1, input2);

    input1.disable();
    assert.disabled(input1);

    // Non-form elements
    var fieldset = $('selects_fieldset');
    var fields = fieldset.immediateDescendants();

    fields.each(function (select) { assert.enabled(select); });

    Form.disable(fieldset);
    fields.each(function (select) { assert.disabled(select); });

    Form.enable(fieldset);
    fields.each(function (select) { assert.enabled(select);  });
  });

  test('enabling elements', function () {
    var field = $('input_disabled');
    field.enable();
    assert.enabled(field);
    field.disable();
    assert.disabled(field);

    field = $('input_enabled');
    assert.enabled(field);
    field.disable();
    assert.disabled(field);
    field.enable();
    assert.enabled(field);
  });

  test('activating forms', function () {
    function getSelection (element) {
      try {
        if (typeof element.selectionStart === 'number') {
          return element.value.substring(element.selectionStart,
           element.selectionEnd);
        } else if (document.selection && document.selection.createRange) {
          return document.selection.createRange().text;
        }
      } catch (e) {
        return null;
      }
    }

    var element = Form.findFirstElement('form-test-bigform');
    assert.equal('submit', element.id,
     'Form.findFirstElement should skip disabled elements');

    Form.focusFirstElement('form-test-bigform');
    assert.equal($('submit'), document.activeElement, 'active element');
    if (document.selection) {
      assert.equal('', getSelection(element),
       "shouldn't select text on buttons");
    }

    element = $('focus_text');
    assert.equal('', getSelection(element),
     "shouldn't select text on buttons");

    element.activate();
    assert.equal('Hello', getSelection(element),
     "Form.Element.activate should select text on text fields");

    assert.nothingRaised(function () {
      $('form_focus_hidden').focusFirstElement();
    }, "Form.Element.activate shouldn't raise an exception when the form or field is hidden");

    assert.nothingRaised(function () {
      $('form_empty').focusFirstElement();
    }, "Form.focusFirstElement shouldn't raise an exception when the form has no fields");

  });

  test('getElements', function () {
    var elements = Form.getElements('various');
    var names = $w('tf_selectOne tf_textarea tf_checkbox tf_selectMany tf_text tf_radio tf_hidden tf_password tf_button');

    assert.enumEqual(names, elements.pluck('name'));
  });

  test('getInputs', function () {
    var form = $('form-test-form');
    [form.getInputs(), Form.getInputs(form)].each(function (inputs) {
      assert.equal(inputs.length, 5);
      assert.isInstanceOf(inputs, Array);
      assert(inputs.all(function (input) { return input.tagName === 'INPUT'; }));
    });
  });

  test('findFirstElement', function () {
    assert.equal($('ffe_checkbox'), $('ffe').findFirstElement());
    assert.equal($('ffe_ti_submit'), $('ffe_ti').findFirstElement());
    assert.equal($('ffe_ti2_checkbox'), $('ffe_ti2').findFirstElement());
  });

  test('serialize', function () {
    // Form is initially empty.
    var form = $('form-test-bigform');
    var expected = {
      tf_selectOne: '',
      tf_textarea:  '',
      tf_text:      '',
      tf_hidden:    '',
      tf_password:  '',
      tf_button:    ''
    };

    assert.deepEqual(expected, Form.serialize('various', true));

    // set up some stuff
    form['tf_selectOne'].selectedIndex = 1;
    form['tf_textarea'].value = "boo hoo!";
    form['tf_text'].value = "123öäü";
    form['tf_hidden'].value = "moo%hoo&test";
    form['tf_password'].value = 'sekrit code';
    form['tf_button'].value = 'foo bar';
    form['tf_checkbox'].checked = true;
    form['tf_radio'].checked = true;

    expected = {
      tf_selectOne: 1, tf_textarea: "boo hoo!",
      tf_text: "123öäü",
      tf_hidden: "moo%hoo&test",
      tf_password: 'sekrit code',
      tf_button: 'foo bar',
      tf_checkbox: 'on',
      tf_radio: 'on'
    };

    // return params
    assert.deepEqual(expected, Form.serialize('various', true),
     "test the whole form (as a hash)");

    // return string
    assert.deepEqual(
      Object.toQueryString(expected).split('&').sort(),
      Form.serialize('various').split('&').sort(),
      "test the whole form (as a string)"
    );


  });

});