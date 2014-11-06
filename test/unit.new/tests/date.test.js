suite('Date', function () {
  this.name = 'date';

  test('#toJSON', function () {
    assert.match(
      new Date(Date.UTC(1970, 0, 1)).toJSON(),
      /^1970-01-01T00:00:00(\.000)?Z$/
    );
  });

  test('#toISOString', function () {
    assert.match(
      new Date(Date.UTC(1970, 0, 1)).toISOString(),
      /^1970-01-01T00:00:00(\.000)?Z$/
    );
  });

});