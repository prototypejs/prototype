/** section: DOM
 * Form
**/

var Form = {
  /**
   *  Form.reset(form) -> Element
   *  
   *  Resets a form to its default values.
  **/
  reset: function(form) {
    form = $(form);
    form.reset();
    return form;
  },
  
  /**
   *  Form.serializeElements(elements[, options]) -> String | Object
   *  - elements (Array): A collection of elements to include in the
   *    serialization.
   *  - options (Object): A list of options that affect the return value
   *    of the method.
   *  
   *  Serialize an array of form elements to a string suitable for Ajax
   *  requests. 
   *  
   *  If `options.hash` is `true`, returns an object of key/value pairs
   *  instead (where keys are control names).
  **/
  serializeElements: function(elements, options) {
    if (typeof options != 'object') options = { hash: !!options };
    else if (Object.isUndefined(options.hash)) options.hash = true;
    var key, value, submitted = false, submit = options.submit;
    
    var data = elements.inject({ }, function(result, element) {
      if (!element.disabled && element.name) {
        key = element.name; value = $(element).getValue();
        if (value != null && element.type != 'file' && (element.type != 'submit' || (!submitted &&
            submit !== false && (!submit || key == submit) && (submitted = true)))) { 
          if (key in result) {
            // a key is already present; construct an array of values
            if (!Object.isArray(result[key])) result[key] = [result[key]];
            result[key].push(value);
          }
          else result[key] = value;
        }
      }
      return result;
    });
    
    return options.hash ? data : Object.toQueryString(data);
  }
};

Form.Methods = {
  /**
   *  Form#serialize(@form[, options]) -> String | Object
   *  - options (Object): A list of options that affect the return value
   *    of the method.
   *  
   *  Serialize form data to a string suitable for Ajax requests.
   *  
   *  If `options.hash` is `true`, returns an object of key/value pairs
   *  instead (where keys are control names).
  **/
  serialize: function(form, options) {
    return Form.serializeElements(Form.getElements(form), options);
  },
  
  /**
   *  Form#getElements(@form) -> [Element...]
   *  
   *  Returns a collection of all controls within a form.
  **/
  getElements: function(form) {
    return $A($(form).getElementsByTagName('*')).inject([], 
      function(elements, child) {
        if (Form.Element.Serializers[child.tagName.toLowerCase()])
          elements.push(Element.extend(child));
        return elements;
      }
    );
  },
  
  /**
   *  Form#getInputs(@form [, type [, name]]) -> [Element...]
   *  - type (String): A value for the `type` attribute against which to
   *    filter.
   *  - name (String): A value for the `name` attribute against which to
   *    filter.
   *  
   *  Returns a collection of all `INPUT` elements in a form.
   *  
   *  Use optional `type` and `name` arguments to restrict the search on
   *  these attributes.
  **/
  getInputs: function(form, typeName, name) {
    form = $(form);
    var inputs = form.getElementsByTagName('input');
    
    if (!typeName && !name) return $A(inputs).map(Element.extend);
      
    for (var i = 0, matchingInputs = [], length = inputs.length; i < length; i++) {
      var input = inputs[i];
      if ((typeName && input.type != typeName) || (name && input.name != name))
        continue;
      matchingInputs.push(Element.extend(input));
    }

    return matchingInputs;
  },

  /**
   *  Form#disable(@form) -> Element
   *  
   *  Disables the form as a whole. Form controls will be visible but
   *  uneditable.
  **/
  disable: function(form) {
    form = $(form);
    Form.getElements(form).invoke('disable');
    return form;
  },

  /**
   *  Form#enable(@form) -> Element
   *  
   *  Enables a fully- or partially-disabled form.
  **/
  enable: function(form) {
    form = $(form);
    Form.getElements(form).invoke('enable');
    return form;
  },

  /**
   *  Form#findFirstElement(@form) -> Element
   *  
   *  Finds the first non-hidden, non-disabled control within the form.
  **/
  findFirstElement: function(form) {
    var elements = $(form).getElements().findAll(function(element) {
      return 'hidden' != element.type && !element.disabled;
    });
    var firstByIndex = elements.findAll(function(element) {
      return element.hasAttribute('tabIndex') && element.tabIndex >= 0;
    }).sortBy(function(element) { return element.tabIndex }).first();
    
    return firstByIndex ? firstByIndex : elements.find(function(element) {
      return ['input', 'select', 'textarea'].include(element.tagName.toLowerCase());
    });
  },

  /**
   *  Form#focusFirstElement(@form) -> Element
   *  
   *  Gives keyboard focus to the first element of the form. Returns the form.
  **/
  focusFirstElement: function(form) {
    form = $(form);
    form.findFirstElement().activate();
    return form;
  },
  
  /**
   *  Form#request([options]) -> Ajax.Request
   *  - options (Object): Options to pass along to the `Ajax.Request`
   *    constructor.
   *  
   *  A convenience method for serializing and submitting the form via an
   *  [[Ajax.Request]] to the URL of the form’s `action` attribute.
   *  
   *  The `options` parameter is passed to the `Ajax.Request` instance,
   *  allowing one to override the HTTP method and/or specify additional
   *  parameters and callbacks.
  **/
  request: function(form, options) {
    form = $(form), options = Object.clone(options || { });

    var params = options.parameters, action = form.readAttribute('action') || '';
    if (action.blank()) action = window.location.href;
    options.parameters = form.serialize(true);
    
    if (params) {
      if (Object.isString(params)) params = params.toQueryParams();
      Object.extend(options.parameters, params);
    }
    
    if (form.hasAttribute('method') && !options.method)
      options.method = form.method;
    
    return new Ajax.Request(action, options);
  }
};

/*--------------------------------------------------------------------------*/

/** section: DOM
 * Form.Element
**/

Form.Element = {
  /**
   *  Form.Element.focus(element) -> Element
   *  
   *  Gives keyboard focus to an element. Returns the element.
  **/
  focus: function(element) {
    $(element).focus();
    return element;
  },

  /**
   *  Form.Element.select(element) -> Element
   *  
   *  Selects the current text in a text input. Returns the element.
  **/
  select: function(element) {
    $(element).select();
    return element;
  }
};

Form.Element.Methods = {
  
  /**
   *  Form.Element#serialize(@element) -> String
   *  
   *  Returns a URL-encoded string representation of a form control in the
   *  `name=value` format.
  **/
  serialize: function(element) {
    element = $(element);
    if (!element.disabled && element.name) {
      var value = element.getValue();
      if (value != undefined) {
        var pair = { };
        pair[element.name] = value;
        return Object.toQueryString(pair);
      }
    }
    return '';
  },
  
  /** alias of: $F
   *  Form.Element#getValue(@element) -> String | Array
   *  
   *  Returns the current value of a form control.
   *  
   *  A string is returned for most controls; only multiple `select` boxes
   *  return an array of values.
   *  
   *  The global shortcut for this method is [[$F]].
  **/
  getValue: function(element) {
    element = $(element);
    var method = element.tagName.toLowerCase();
    return Form.Element.Serializers[method](element);
  },

  /**
   *  Form.Element#setValue(@element, value) -> Element
   *  
   *  Sets `value` to be the value of the form control. Returns the element.
  **/
  setValue: function(element, value) {
    element = $(element);
    var method = element.tagName.toLowerCase();
    Form.Element.Serializers[method](element, value);
    return element;
  },

  /**
   *  Form.Element#clear(@element) -> Element
   *  
   *  Clears the contents of a text input. Returns the element.
  **/
  clear: function(element) {
    $(element).value = '';
    return element;
  },

  /**
   *  Form.Element#present(@element) -> Element
   *  
   *  Returns `true` if a text input has contents, `false` otherwise.
  **/
  present: function(element) {
    return $(element).value != '';
  },
  
  /**
   *  Form.Element#activate(element) -> Element
   *  
   *  Gives focus to a form control and selects its contents if it is a text
   *  input.
  **/
  activate: function(element) {
    element = $(element);
    try {
      element.focus();
      if (element.select && (element.tagName.toLowerCase() != 'input' ||
          !['button', 'reset', 'submit'].include(element.type)))
        element.select();
    } catch (e) { }
    return element;
  },
  
  /**
   *  Form.Element#disable(@element) -> Element
   *  
   *  Disables a form control, effectively preventing its value from changing
   *  until it is enabled again.
  **/
  disable: function(element) {
    element = $(element);
    element.disabled = true;
    return element;
  },
  
  /**
   *  Form.Element#enable(@element) -> Element
   *  
   *  Enables a previously disabled form control.
  **/
  enable: function(element) {
    element = $(element);
    element.disabled = false;
    return element;
  }
};

/*--------------------------------------------------------------------------*/

var Field = Form.Element;

/** section: DOM, alias of: Form.Element.getValue
 *  $F(element) -> String | Array
**/
var $F = Form.Element.Methods.getValue;

/*--------------------------------------------------------------------------*/

Form.Element.Serializers = {
  input: function(element, value) {
    switch (element.type.toLowerCase()) {
      case 'checkbox':  
      case 'radio':
        return Form.Element.Serializers.inputSelector(element, value);
      default:
        return Form.Element.Serializers.textarea(element, value);
    }
  },

  inputSelector: function(element, value) {
    if (Object.isUndefined(value)) return element.checked ? element.value : null;
    else element.checked = !!value;
  },

  textarea: function(element, value) {
    if (Object.isUndefined(value)) return element.value;
    else element.value = value;
  },
  
  select: function(element, value) {
    if (Object.isUndefined(value))
      return this[element.type == 'select-one' ? 
        'selectOne' : 'selectMany'](element);
    else {
      var opt, currentValue, single = !Object.isArray(value);
      for (var i = 0, length = element.length; i < length; i++) {
        opt = element.options[i];
        currentValue = this.optionValue(opt);
        if (single) {
          if (currentValue == value) {
            opt.selected = true;
            return;
          }
        }
        else opt.selected = value.include(currentValue);
      }
    }
  },
  
  selectOne: function(element) {
    var index = element.selectedIndex;
    return index >= 0 ? this.optionValue(element.options[index]) : null;
  },
  
  selectMany: function(element) {
    var values, length = element.length;
    if (!length) return null;
    
    for (var i = 0, values = []; i < length; i++) {
      var opt = element.options[i];
      if (opt.selected) values.push(this.optionValue(opt));
    }
    return values;
  },
  
  optionValue: function(opt) {
    // extend element because hasAttribute may not be native
    return Element.extend(opt).hasAttribute('value') ? opt.value : opt.text;
  }
};

/*--------------------------------------------------------------------------*/

/** section: DOM
 * Abstract
**/

/** section: DOM
 *  class Abstract.TimedObserver
**/
Abstract.TimedObserver = Class.create(PeriodicalExecuter, {
  initialize: function($super, element, frequency, callback) {
    $super(callback, frequency);
    this.element   = $(element);
    this.lastValue = this.getValue();
  },
  
  execute: function() {
    var value = this.getValue();
    if (Object.isString(this.lastValue) && Object.isString(value) ?
        this.lastValue != value : String(this.lastValue) != String(value)) {
      this.callback(this.element, value);
      this.lastValue = value;
    }
  }
});

/** section: DOM
 *  class Form.Element.Observer < Abstract.TimedObserver
**/
Form.Element.Observer = Class.create(Abstract.TimedObserver, {
  /**
   *  new Form.Element.Observer(element, frequency, callback)
   *  
   *  Creates a timed observer for a specific form control.
  **/
  getValue: function() {
    return Form.Element.getValue(this.element);
  }
});

/** section: DOM
 *  class Form.Observer < Abstract.TimedObserver
**/
Form.Observer = Class.create(Abstract.TimedObserver, {
  /**
   *  new Form.Observer(element, frequency, callback)
   *  
   *  Creates a timed observer that triggers when any value changes within
   *  the form.
  **/
  getValue: function() {
    return Form.serialize(this.element);
  }
});

/*--------------------------------------------------------------------------*/

/** section: DOM
 *  class Abstract.EventObserver
**/
Abstract.EventObserver = Class.create({
  initialize: function(element, callback) {
    this.element  = $(element);
    this.callback = callback;
    
    this.lastValue = this.getValue();
    if (this.element.tagName.toLowerCase() == 'form')
      this.registerFormCallbacks();
    else
      this.registerCallback(this.element);
  },
  
  onElementEvent: function() {
    var value = this.getValue();
    if (this.lastValue != value) {
      this.callback(this.element, value);
      this.lastValue = value;
    }
  },
  
  registerFormCallbacks: function() {
    Form.getElements(this.element).each(this.registerCallback, this);
  },
  
  registerCallback: function(element) {
    if (element.type) {
      switch (element.type.toLowerCase()) {
        case 'checkbox':  
        case 'radio':
          Event.observe(element, 'click', this.onElementEvent.bind(this));
          break;
        default:
          Event.observe(element, 'change', this.onElementEvent.bind(this));
          break;
      }
    }    
  }
});

/** section: DOM
 *  class Form.Element.EventObserver < Abstract.EventObserver
**/
Form.Element.EventObserver = Class.create(Abstract.EventObserver, {
  getValue: function() {
    return Form.Element.getValue(this.element);
  }
});

/** section: DOM
 *  class Form.Element.EventObserver < Abstract.EventObserver
**/
Form.EventObserver = Class.create(Abstract.EventObserver, {
  getValue: function() {
    return Form.serialize(this.element);
  }
});
