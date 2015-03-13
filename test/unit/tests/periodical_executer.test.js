
suite('PeriodicalExecuter', function () {
  this.name = 'periodical_executer';

  test('#stop', function (done) {
    var peEventCount = 0;
    function peEventFired(pe) {
      if (++peEventCount > 2) pe.stop();
    }

    // peEventFired will stop the PeriodicalExecuter after 3 callbacks
    new PeriodicalExecuter(peEventFired, 0.05);

    wait(600, done, function() {
      assert.equal(3, peEventCount);
      done();
    });
  });

  test('#onTimerEvent', function () {
    var pe = {
      onTimerEvent: PeriodicalExecuter.prototype.onTimerEvent,
      execute: function() {
        assert(pe.currentlyExecuting);
      }
    };

    pe.onTimerEvent();
    assert(!pe.currentlyExecuting);

    pe.execute = function() {
      assert(pe.currentlyExecuting);
      throw new Error();
    };
    assert.raise('Error', pe.onTimerEvent.bind(pe));
    assert(!pe.currentlyExecuting);
  });

});
