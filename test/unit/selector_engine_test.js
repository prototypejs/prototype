/*
<div id="test_div_parent" class="test_class">
  <div id="test_div_child" class="test_class">
  </div>
</div>
*/

new Test.Unit.Runner({
  testEngine: function() {
    this.assert(Prototype.Selector.engine);
  },
  
  testSelect: function() {
    var elements = Prototype.Selector.select('.test_class');
    
    this.assert(Object.isArray(elements));
    this.assertEqual(2, elements.length);
    this.assertEqual('test_div_parent', elements[0].id);
    this.assertEqual('test_div_child', elements[1].id);
  },
  
  testSelectWithContext: function() {
    var elements = Prototype.Selector.select('.test_class', $('test_div_parent'));
    
    this.assert(Object.isArray(elements));
    this.assertEqual(1, elements.length);
    this.assertEqual('test_div_child', elements[0].id);
  },
  
  testSelectWithEmptyResult: function() {
    var elements = Prototype.Selector.select('.non_existent');
    
    this.assert(Object.isArray(elements));
    this.assertEqual(0, elements.length);
  },
  
  testMatch: function() {
    var element = $('test_div_parent');
    
    this.assertEqual(true, Prototype.Selector.match(element, '.test_class'));
    this.assertEqual(false, Prototype.Selector.match(element, '.non_existent'));
  },
  
  testFilter: function() {
    var elements = document.getElementsByTagName('*'),
        filtered = Prototype.Selector.filter(elements, '.test_class');
        
    this.assert(Object.isArray(filtered));
    this.assertEqual(2, filtered.length);
    this.assertEqual('test_div_parent', filtered[0].id);
    this.assertEqual('test_div_child', filtered[1].id);
  }
});