
suite('Prototype', function () {
  this.name = 'prototype';

  test('browser detection', function () {
    var results = $H(Prototype.Browser).map(function(engine){
      return engine;
    }).partition(function(engine){
      return engine[1] === true;
    });
    var trues = results[0], falses = results[1];

    var ua = navigator.userAgent;

    info('User agent string is: ' + ua);

    // It's OK for there to be two true values if we're on MobileSafari,
    // since it's also a WebKit browser.
    if (Prototype.Browser.MobileSafari) {
      assert(trues.size() === 2, 'MobileSafari should also identify as WebKit.');
    } else {
      assert(trues.size() === 0 || trues.size() === 1,
       'There should be only one or no browser detected.');
    }

    // we should have definite trues or falses here
    trues.each(function(result) {
      assert(result[1] === true);
    }, this);
    falses.each(function(result) {
      assert(result[1] === false);
    }, this);

    if (ua.indexOf('AppleWebKit/') > -1) {
      info('Running on WebKit');
      assert(Prototype.Browser.WebKit);
    }

    if (!!window.opera) {
      info('Running on Opera');
      assert(Prototype.Browser.Opera);
    }

    if (ua.indexOf('MSIE') > -1 && !window.opera) {
      info('Running on IE');
      assert(Prototype.Browser.IE);
    }

    if (ua.indexOf('Gecko') > -1 && ua.indexOf('KHTML') == -1) {
      info('Running on Gecko');
      assert(Prototype.Browser.Gecko);
    }
  });

});
