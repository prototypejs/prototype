new Test.Unit.Runner({
  testDateToJSON: function() {
    this.assertMatch(/^1970-01-01T00:00:00(\.000)?Z$/, new Date(Date.UTC(1970, 0, 1)).toJSON());
  },
  
  testDateToISOString: function() {
    this.assertMatch(/^1970-01-01T00:00:00(\.000)?Z$/, new Date(Date.UTC(1970, 0, 1)).toISOString());
  },

  testSucc: function() {
    this.assertEqual((new Date(2016, 1, 29)).succ().getTime(), (new Date(2016, 2, 1)).getTime());
  }

});