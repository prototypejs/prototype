// base class
var Animal = Class.create({
  initialize: function(name) {
    this.name = name;
  },
  name: "",
  eat: function() {
    return this.say("Yum!");
  },
  say: function(message) {
    return this.name + ": " + message;
  }
});

// subclass that augments a method
var Cat = Class.create(Animal, {
  eat: function($super, food) {
    if (food instanceof Mouse) return $super();
    else return this.say("Yuk! I only eat mice.");
  }
});

// empty subclass
var Mouse = Class.create(Animal, {});

//mixins
var Sellable = {
  getValue: function(pricePerKilo) {
    return this.weight * pricePerKilo;
  },

  inspect: function() {
    return '#<Sellable: #{weight}kg>'.interpolate(this);
  }
};

var Reproduceable = {
  reproduce: function(partner) {
    if (partner.constructor != this.constructor || partner.sex == this.sex)
      return null;
    var weight = this.weight / 10, sex = Math.random(1).round() ? 'male' : 'female';
    return new this.constructor('baby', weight, sex);
  }
};

// base class with mixin
var Plant = Class.create(Sellable, {
  initialize: function(name, weight) {
    this.name = name;
    this.weight = weight;
  },

  inspect: function() {
    return '#<Plant: #{name}>'.interpolate(this);
  }
});

// subclass with mixin
var Dog = Class.create(Animal, Reproduceable, {
  initialize: function($super, name, weight, sex) {
    this.weight = weight;
    this.sex = sex;
    $super(name);
  }
});

// subclass with mixins
var Ox = Class.create(Animal, Sellable, Reproduceable, {
  initialize: function($super, name, weight, sex) {
    this.weight = weight;
    this.sex = sex;
    $super(name);
  },

  eat: function(food) {
    if (food instanceof Plant)
      this.weight += food.weight;
  },

  inspect: function() {
    return '#<Ox: #{name}>'.interpolate(this);
  }
});




suite("Class", function () {
  this.name = 'class';

  test('create', function () {
    assert(Object.isFunction(Animal), 'Animal is not a constructor');
  });

  test('instantiation', function () {
    var pet = new Animal('Nibbles');
    assert.equal('Nibbles', pet.name, 'property not initialized');
    assert.equal('Nibbles: Hi!', pet.say('Hi!'));
    assert.equal(Animal, pet.constructor, 'bad constructor reference');
    assert.isUndefined(pet.superclass);

    var Empty = Class.create();
    assert.equal('object', typeof new Empty);
  });

  test('inheritance', function () {
    var tom = new Cat('Tom');
    assert.equal(Cat, tom.constructor, 'bad constructor reference');
    assert.equal(Animal, tom.constructor.superclass, 'bad superclass reference');
    assert.equal('Tom', tom.name);
    assert.equal('Tom: meow', tom.say('meow'));
    assert.equal('Tom: Yuk! I only eat mice.', tom.eat(new Animal));
  });

  test('superclass method call', function () {
    var tom = new Cat('Tom');
    assert.equal('Tom: Yum!', tom.eat(new Mouse));

    var Dodo = Class.create(Animal, {
      initialize: function ($super, name) {
        $super(name);
        this.extinct = true;
      },

      say: function ($super, message) {
        return $super(message) + " honk honk";
      }
    });

    var gonzo = new Dodo('Gonzo');
    assert.equal('Gonzo', gonzo.name);
    assert(gonzo.extinct, 'Dodo birds should be extinct');
    assert.equal('Gonzo: hello honk honk', gonzo.say('hello'));
  });

  test('addMethods', function () {
    var tom   = new Cat('Tom');
    var jerry = new Mouse('Jerry');

    Animal.addMethods({
      sleep: function () {
        return this.say('ZZZ');
      }
    });

    Mouse.addMethods({
      sleep: function ($super) {
        return $super() + " ... no, can't sleep! Gotta steal cheese!";
      },

      escape: function (cat) {
        return this.say('(from a mousehole) Take that, ' + cat.name + '!');
      }
    });

    assert.equal('Tom: ZZZ', tom.sleep(),
     'added instance method not available to subclass');
    assert.equal("Jerry: ZZZ ... no, can't sleep! Gotta steal cheese!",
     jerry.sleep());
    assert.equal("Jerry: (from a mousehole) Take that, Tom!",
     jerry.escape(tom));

    // Ensure that a method has not propagated _up_ the prototype chain.
    assert.isUndefined(tom.escape);
    assert.isUndefined(new Animal().escape);

    Animal.addMethods({
      sleep: function () {
        return this.say('zZzZ');
      }
    });

    assert.equal("Jerry: zZzZ ... no, can't sleep! Gotta steal cheese!",
     jerry.sleep());

  });

  test('base class with mixin', function () {
    var grass = new Plant('grass', 3);
    assert.respondsTo('getValue', grass);
    assert.equal('#<Plant: grass>', grass.inspect());
  });

  test('subclass with mixin', function () {
    var snoopy = new Dog('Snoopy', 12, 'male');
    assert.respondsTo('reproduce', snoopy);
  });

  test('subclass with mixins', function () {
    var cow = new Ox('cow', 400, 'female');
    assert.equal('#<Ox: cow>', cow.inspect());
    assert.respondsTo('reproduce', cow);
    assert.respondsTo('getValue', cow);
  });

  test('class with toString and valueOf methods', function () {
    var Foo = Class.create({
      toString: function() { return "toString"; },
      valueOf:  function() { return "valueOf";  }
    });

    var Bar = Class.create(Foo, {
      valueOf: function() { return "myValueOf"; }
    });

    var Parent = Class.create({
      m1: function(){ return 'm1'; },
      m2: function(){ return 'm2'; }
    });
    var Child = Class.create(Parent, {
      m1: function($super) { return 'm1 child'; },
      m2: function($super) { return 'm2 child'; }
    });

    assert(new Child().m1.toString().indexOf('m1 child') > -1);

    assert.equal("toString",  new Foo().toString());
    assert.equal("valueOf",   new Foo().valueOf() );
    assert.equal("toString",  new Bar().toString());
    assert.equal("myValueOf", new Bar().valueOf() );
  });

});