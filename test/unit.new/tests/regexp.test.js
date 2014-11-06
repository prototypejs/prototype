
suite('RegExp', function () {
  this.name = 'regexp';

  test('#escape', function () {
    assert.equal('word', RegExp.escape('word'));
    assert.equal('\\/slashes\\/', RegExp.escape('/slashes/'));
    assert.equal('\\\\backslashes\\\\', RegExp.escape('\\backslashes\\'));
    assert.equal('\\\\border of word', RegExp.escape('\\border of word'));

    assert.equal('\\(\\?\\:non-capturing\\)', RegExp.escape('(?:non-capturing)'));
    assert.equal('non-capturing', new RegExp(RegExp.escape('(?:') + '([^)]+)').exec('(?:non-capturing)')[1]);

    assert.equal('\\(\\?\\=positive-lookahead\\)', RegExp.escape('(?=positive-lookahead)'));
    assert.equal('positive-lookahead', new RegExp(RegExp.escape('(?=') + '([^)]+)').exec('(?=positive-lookahead)')[1]);

    assert.equal('\\(\\?<\\=positive-lookbehind\\)', RegExp.escape('(?<=positive-lookbehind)'));
    assert.equal('positive-lookbehind', new RegExp(RegExp.escape('(?<=') + '([^)]+)').exec('(?<=positive-lookbehind)')[1]);

    assert.equal('\\(\\?\\!negative-lookahead\\)', RegExp.escape('(?!negative-lookahead)'));
    assert.equal('negative-lookahead', new RegExp(RegExp.escape('(?!') + '([^)]+)').exec('(?!negative-lookahead)')[1]);

    assert.equal('\\(\\?<\\!negative-lookbehind\\)', RegExp.escape('(?<!negative-lookbehind)'));
    assert.equal('negative-lookbehind', new RegExp(RegExp.escape('(?<!') + '([^)]+)').exec('(?<!negative-lookbehind)')[1]);

    assert.equal('\\[\\\\w\\]\\+', RegExp.escape('[\\w]+'));
    assert.equal('character class', new RegExp(RegExp.escape('[') + '([^\\]]+)').exec('[character class]')[1]);

    assert.equal('<div>', new RegExp(RegExp.escape('<div>')).exec('<td><div></td>')[0]);

    assert.equal('false', RegExp.escape(false));
    assert.equal('undefined', RegExp.escape());
    assert.equal('null', RegExp.escape(null));
    assert.equal('42', RegExp.escape(42));

    assert.equal('\\\\n\\\\r\\\\t', RegExp.escape('\\n\\r\\t'));
    assert.equal('\n\r\t', RegExp.escape('\n\r\t'));
    assert.equal('\\{5,2\\}', RegExp.escape('{5,2}'));

    assert.equal(
      '\\/\\(\\[\\.\\*\\+\\?\\^\\=\\!\\:\\$\\{\\}\\(\\)\\|\\[\\\\\\]\\\\\\\/\\\\\\\\\\]\\)\\/g',
      RegExp.escape('/([.*+?^=!:${}()|[\\]\\/\\\\])/g')
    );
  });

});
