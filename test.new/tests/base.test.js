
suite('Base', function () {

  this.name = 'base';

  test('Browser detection', function () {

    var results = $H(Prototype.Browser).map(function (engine) {
      return engine;
    }).partition(function (engine) {
      return engine[1] === true;
    });
    var trues = results[0], falses = results[1];

    info('User agent string is: ' + navigator.userAgent);

    assert(trues.size() === 0 || trues.size() === 1,
     'There should be only one or no browser detected.');

     // we should have definite trues or falses here
     trues.each(function(result) {
       assert(result[1] === true);
     }, this);
     falses.each(function(result) {
       assert(result[1] === false);
     }, this);

     var ua = navigator.userAgent;

     if (ua.indexOf('AppleWebKit/') > -1) {
       info('Running on WebKit');
       assert(Prototype.Browser.WebKit);
     }

     if (Object.prototype.toString.call(window.opera) === '[object Opera]') {
       info('Running on Opera');
       assert(Prototype.Browser.Opera);
     }

     if (ua.indexOf('MSIE') > -1) {
       info('Running on IE');
       assert(Prototype.Browser.IE);
     }

     if (ua.indexOf('Gecko') > -1 && ua.indexOf('KHTML') === -1) {
       info('Running on Gecko');
       assert(Prototype.Browser.Gecko);
     }

  });

});