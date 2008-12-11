new Test.Unit.Runner({
  testPeriodicalExecuterStop: function() {
    var peEventCount = 0;
    function peEventFired(pe) {
      if (++peEventCount > 2) pe.stop();
    }

    // peEventFired will stop the PeriodicalExecuter after 3 callbacks
    new PeriodicalExecuter(peEventFired, 0.05);

    this.wait(600, function() {
      this.assertEqual(3, peEventCount);
    });
  }
});