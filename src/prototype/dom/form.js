/** section: DOM
 * Form
 *
 *  Utilities for dealing with forms in the DOM.
 *
 *  [[Form]] is a namespace for all things form-related, packed with form
 *  manipulation and serialization goodness. While it holds methods dealing
 *  with forms as a whole, its submodule [[Form.Element]] deals with specific
 *  form controls.
 *
 *  Many of these methods are also available directly on `form` elements.
**/

var Form = {
  /**
   *  Form.reset(@form) -> Element
   *
   *  Resets a form to its default values.
   *
   *  Example usage:
   *
   *      Form.reset('contact')
   *
   *      // equivalent:
   *      $('contact').reset()
   *
   *      // both have the same effect as pressing the reset button
   *
   *  This method allows you to programatically reset a form. It is a wrapper
   *  for the `reset()` method native to `HTMLFormElement`.
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
   *  - options (Object): _(Optional)_ A set of options that affect the return
   *    value of the method.
   *
   *  Serialize an array of form elements to an object or string suitable
   *  for [[Ajax]] requests.
   *
   *  As per the HTML spec, disabled fields are not included.
   *
   *  If multiple elements have the same name and we're returning an object,
   *  the value for that key in the object will be an array of the field values
   *  in the order they appeared on the array of elements.
   *
   *  The preferred method to serialize a form is [[Form.serialize]]. Refer to
   *  it for further information and examples on the `hash` option. However,
   *  with [[Form.serializeElements]] you can serialize *specific* input
   *  elements of your choice, allowing you to specify a subset of form elements
   *  that you want to serialize data from.
   *
   *  ##### The Options
   *
   *  The options allow you to control two things: What kind of return
   *  value you get (an object or a string), and whether and which `submit`
   *  fields are included in that object or string.
   *
   *  If you do not supply an `options` object _at all_, the options
   *  `{ hash: false }` are used.
   *
   *  If you supply an `options` object, it may have the following options:
   *
   *  * `hash` ([[Boolean]]): `true` to return a plain object with keys and
   *    values (not a [[Hash]]; see below), `false` to return a String in query
   *    string format. If you supply an `options` object with no `hash` member,
   *    `hash` defaults to `true`. Note that this is __not__ the same as leaving
   *    off the `options` object entirely (see above).
   *
   *  * `submit` ([[Boolean]] | [[String]]): In essence: If you omit this option
   *    the first submit button in the form is included; if you supply `false`,
   *    no submit buttons are included; if you supply the name of a submit
   *    button, the first button with that name is included. Note that the
   *    `false` value __must__ really be `false`, not _falsey_;
   *    falsey-but-not-false is like omitting the option.
   *
   *  _(Deprecated)_ If you pass in a [[Boolean]] instead of an object for
   *  `options`, it is used as the `hash` option and all other options are
   *  defaulted.
   *
   *  ##### A _hash_, not a [[Hash]]
   *
   *  If you opt to receive an object, it is a plain JavaScript object with keys
   *  and values, __not__ a [[Hash]]. All JavaScript objects are hashes in the
   *  lower-case sense of the word, which is why the option has that
   *  somewhat-confusing name.
   *
   *  ##### Examples
   *
   *  To serialize all input elements of type "text":
   *
   *      Form.serializeElements( $('myform').getInputs('text') )
   *      // -> serialized data
  **/
  serializeElements: function(elements, options) {
    // An earlier version accepted a boolean second parameter (hash) where
    // the default if omitted was false; respect that, but if they pass in an
    // options object (e.g., the new signature) but don't specify the hash option,
    // default true, as that's the new preferred approach.
    if (typeof options != 'object') options = { hash: !!options };
    else if (Object.isUndefined(options.hash)) options.hash = true;
    var key, value, submitted = false, submit = options.submit, accumulator, initial;

    if (options.hash) {
      initial = {};
      accumulator = function(result, key, value) {
        if (key in result) {
          if (!Object.isArray(result[key])) result[key] = [result[key]];
          result[key] = result[key].concat(value);
        } else result[key] = value;
        return result;
      };
    } else {
      initial = '';
      accumulator = function(result, key, values) {
        if (!Object.isArray(values)) {values = [values];}
        if (!values.length) {return result;}
        // According to the spec, spaces should be '+' rather than '%20'.
        var encodedKey = encodeURIComponent(key).gsub(/%20/, '+');
        return result + (result ? "&" : "") + values.map(function (value) {
          // Normalize newlines as \r\n because the HTML spec says newlines should
          // be encoded as CRLFs.
          value = value.gsub(/(\r)?\n/, '\r\n');
          value = encodeURIComponent(value);
          // According to the spec, spaces should be '+' rather than '%20'.
          value = value.gsub(/%20/, '+');
          return encodedKey + "=" + value;
        }).join("&");
      };
    }

    return elements.inject(initial, function(result, element) {
      if (!element.disabled && element.name) {
        key = element.name; value = $(element).getValue();
        if (value != null && element.type != 'file' && (element.type != 'submit' || (!submitted &&
            submit !== false && (!submit || key == submit) && (submitted = true)))) {
          result = accumulator(result, key, value);
        }
      }
      return result;
    });
  }
};

Form.Methods = {
  /**
   *  Form.serialize(@form[, options]) -> String | Object
   *  - options (Object): A list of options that affect the return value
   *    of the method.
   *
   *  Serializes form data to a string suitable for [[Ajax]] requests (default
   *  behavior) or, if the `hash` option evaluates to `true`, an object hash
   *  where keys are form control names and values are data.
   *
   *  Depending of whether or not the `hash` option evaluates to `true`, the
   *  result is either an object of the form `{name: "johnny", color: "blue"}`
   *  or a [[String]] of the form `"name=johnny&color=blue"`, suitable for
   *  parameters in an [[Ajax]] request. This method mimics the way browsers
   *  serialize forms natively so that form data can be sent without refreshing
   *  the page.
   *
   *  See [[Form.serializeElements]] for more details on the options.
   *
   *  ##### Examples
   *
   *      $('person-example').serialize()
   *      // -> 'username=sulien&age=22&hobbies=coding&hobbies=hiking'
   *
   *      $('person-example').serialize(true)
   *      // -> {username: 'sulien', age: '22', hobbies: ['coding', 'hiking']}
   *
   *  ##### Notes
   *
   *  Disabled form elements are not serialized (as per W3C HTML recommendation).
   *  Also, file inputs are skipped as they cannot be serialized and sent using
   *  only JavaScript.
  **/
  serialize: function(form, options) {
    return Form.serializeElements(Form.getElements(form), options);
  },

  /**
   *  Form.getElements(@form) -> [Element...]
   *
   *  Returns a collection of all controls within a form.
   *
   *  ##### Note
   *
   *  OPTION elements are not included in the result; only their parent
   *  SELECT control is.
  **/

  getElements: function(form) {
    var elements = $(form).getElementsByTagName('*');
    var element, results = [], serializers = Form.Element.Serializers;

    for (var i = 0; element = elements[i]; i++) {
      if (serializers[element.tagName.toLowerCase()])
        results.push(element);
    }
    return results;
  },

  /**
   *  Form.getInputs(@form [, type [, name]]) -> [Element...]
   *  - type (String): A value for the `type` attribute against which to filter.
   *  - name (String): A value for the `name` attribute against which to filter.
   *
   *  Returns a collection of all INPUT elements in a form.
   *
   *  Use optional `type` and `name` arguments to restrict the search on
   *  these attributes.
   *
   *  ##### Example
   *
   *      var form = $('myform');
   *
   *      form.getInputs();       // -> all INPUT elements
   *      form.getInputs('text'); // -> only text inputs
   *
   *      var buttons = form.getInputs('radio', 'education');
   *      // -> only radio buttons of name "education"
   *
   *      // now disable these radio buttons:
   *      buttons.invoke('disable');
   *
   *  ##### Note
   *
   *  Elements are returned in the *document* order, not the
   *  [tabindex order](http://www.w3.org/TR/html4/interact/forms.html#h-17.11.1).
  **/
  getInputs: function(form, typeName, name) {
    form = $(form);
    var inputs = form.getElementsByTagName('input');

    if (!typeName && !name) return $A(inputs);

    for (var i = 0, matchingInputs = [], length = inputs.length; i < length; i++) {
      var input = inputs[i];
      if ((typeName && input.type != typeName) || (name && input.name != name))
        continue;
      matchingInputs.push(input);
    }

    return matchingInputs;
  },

  /**
   *  Form.disable(@form) -> Element
   *
   *  Disables the form as a whole. Form controls will be visible but
   *  uneditable.
   *
   *  Disabling the form is done by iterating over form elements and calling
   *  [[Form.Element.disable]] on them.
   *
   *  ##### Note
   *
   *  Keep in mind that *disabled elements are skipped* by serialization
   *  methods! You cannot serialize a disabled form.
  **/
  disable: function(form) {
    form = $(form);
    Form.getElements(form).invoke('disable');
    return form;
  },

  /**
   *  Form.enable(@form) -> Element
   *
   *  Enables a fully- or partially-disabled form.
   *
   *  Enabling the form is done by iterating over form elements and calling
   *  [[Form.Element.enable]] on them.
   *
   *  ##### Note
   *
   *  This will enable all form controls regardless of how they were disabled
   *  (by scripting or by HTML attributes).
  **/
  enable: function(form) {
    form = $(form);
    Form.getElements(form).invoke('enable');
    return form;
  },

  /**
   *  Form.findFirstElement(@form) -> Element
   *
   *  Finds the first non-hidden, non-disabled control within the form.
   *
   *  The returned object is either an INPUT, SELECT or TEXTAREA element. This
   *  method is used by the [[Form.focusFirstElement]] method.
   *
   *  ##### Note
   *
   *  The result of this method is the element that comes first in the
   *  *document* order, not the
   *  [tabindex order](http://www.w3.org/TR/html4/interact/forms.html#h-17.11.1).
  **/
  findFirstElement: function(form) {
    var elements = $(form).getElements().findAll(function(element) {
      return 'hidden' != element.type && !element.disabled;
    });
    var firstByIndex = elements.findAll(function(element) {
      return element.hasAttribute('tabIndex') && element.tabIndex >= 0;
    }).sortBy(function(element) { return element.tabIndex }).first();

    return firstByIndex ? firstByIndex : elements.find(function(element) {
      return /^(?:input|select|textarea)$/i.test(element.tagName);
    });
  },

  /**
   *  Form.focusFirstElement(@form) -> Element
   *
   *  Gives keyboard focus to the first element of the form. Returns the form.
   *
   *  Uses [[Form.findFirstElement]] to get the first element and calls
   *  [[Form.Element.activate]] on it. This is useful for enhancing usability on
   *  your site by bringing focus on page load to forms such as search forms or
   *  contact forms where a user is ready to start typing right away.
  **/
  focusFirstElement: function(form) {
    form = $(form);
    var element = form.findFirstElement();
    if (element) element.activate();
    return form;
  },

  /**
   *  Form.request(@form[, options]) -> Ajax.Request
   *  - options (Object): Options to pass along to the [[Ajax.Request]]
   *    constructor.
   *
   *  A convenience method for serializing and submitting the form via an
   *  [[Ajax.Request]] to the URL of the form's `action` attribute.
   *
   *  The `options` parameter is passed to the [[Ajax.Request]] instance,
   *  allowing one to override the HTTP method and/or specify additional
   *  parameters and callbacks.
   *
   *  - If the form has a method attribute, its value is used for the
   *  [[Ajax.Request]] `method` option. If a method option is passed to
   *  `request()`, it takes precedence over the form's method attribute. If
   *  neither is specified, method defaults to "POST".
   *
   *  - Key-value pairs specified in the `parameters` option (either as a hash
   *  or a query string) will be merged with (and *take precedence* over) the
   *  serialized form parameters.
   *
   *  ##### Example
   *
   *  Suppose you have this HTML form:
   *
   *      language: html
   *      <form id="person-example" method="POST" action="/user/info">
   *        <fieldset><legend>User info</legend>
   *          <ul>
   *            <li>
   *              <label for="username">Username:</label>
   *              <input type="text" name="username" id="username" value="" />
   *            </li>
   *            <li>
   *              <label for="age">Age:</label>
   *              <input type="text" name="age" id="age" value="" size="3" />
   *            </li>
   *            <li>
   *              <label for="hobbies">Your hobbies are:</label>
   *              <select name="hobbies[]" id="hobbies" multiple="multiple">
   *                <option>coding</option>
   *                <option>swimming</option>
   *                <option>biking</option>
   *                <option>hiking</option>
   *                <option>drawing</option>
   *              </select>
   *            </li>
   *          </ul>
   *          <input type="submit" value="serialize!" />
   *        </fieldset>
   *      </form>
   *
   *  You can easily post it with Ajax like this:
   *
   *      $('person-example').request(); //done - it's posted
   *
   *      // do the same with a callback:
   *      $('person-example').request({
   *        onComplete: function(){ alert('Form data saved!') }
   *      })
   *
   *  To override the HTTP method and add some parameters, simply use `method`
   *  and `parameters` in the options. In this example we set the method to GET
   *  and set two fixed parameters:
   *  `interests` and `hobbies`. The latter already exists in the form but this
   *  value will take precedence.
   *
   *      $('person-example').request({
   *        method: 'get',
   *        parameters: { interests:'JavaScript', 'hobbies[]':['programming', 'music'] },
   *        onComplete: function(){ alert('Form data saved!') }
   *      })
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

/**
 * Form.Element
 *
 *  Utilities for dealing with form controls in the DOM.
 *
 *  This is a collection of methods that assist in dealing with form controls.
 *  They provide ways to [[Form.Element.focus focus]], [[Form.Element.serialize
 *  serialize]], [[Form.Element.disable disable]]/[[Form.Element.enable enable]]
 *  or extract current value from a specific control.
 *
 *  Note that nearly all these methods are available directly on `input`,
 *  `select`, and `textarea` elements. Therefore, these are equivalent:
 *
 *      Form.Element.activate('myfield');
 *      $('myfield').activate();
 *
 *  Naturally, you should always prefer the shortest form suitable in a
 *  situation. Most of these methods also return the element itself (as
 *  indicated by the return type) for chainability.
**/

Form.Element = {
  /**
   *  Form.Element.focus(element) -> Element
   *
   *  Gives keyboard focus to an element. Returns the element.
   *
   *  ##### Example
   *
   *      Form.Element.focus('searchbox')
   *
   *      // Almost equivalent, but does NOT return the form element (uses the native focus() method):
   *      $('searchbox').focus()
  **/
  focus: function(element) {
    $(element).focus();
    return element;
  },

  /**
   *  Form.Element.select(element) -> Element
   *
   *  Selects the current text in a text input. Returns the element.
   *
   *  ##### Example
   *
   *  Some search boxes are set up so that they auto-select their content when they receive focus.
   *
   *        $('searchbox').onfocus = function() {
   *          Form.Element.select(this)
   *
   *          // You can also rely on the native method, but this will NOT return the element!
   *          this.select()
   *        }
   *
   *  ##### Focusing + selecting: use [[Form.Element.activate]]!
   *
   *  The [[Form.Element.activate]] method is a nifty way to both focus a form
   *  field and select its current text, all in one portable JavaScript call.
  **/
  select: function(element) {
    $(element).select();
    return element;
  }
};

Form.Element.Methods = {

  /**
   *  Form.Element.serialize(@element) -> String
   *
   *  Returns a URL-encoded string representation of a form control in the
   *  `name=value` format.
   *
   *  The result of this method is a string suitable for Ajax requests. However,
   *  it serializes only a single element - if you need to serialize the whole
   *  form use [[Form.serialize]] instead.
   *
   *  ##### Notes
   *
   *  Serializing a disabled control or a one without a name will always result
   *  in an empty string.
   *
   *  If you simply need an element's value for reasons other than Ajax
   *  requests, use [[Form.Element.getValue]] instead.
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
   *  Form.Element.getValue(@element) -> String | Array
   *
   *  Returns the current value of a form control.
   *
   *  A string is returned for most controls; only multiple `select` boxes
   *  return an array of values.
   *
   *  The global shortcut for this method is [[$F]].
   *
   *  ##### How to reference form controls by their _name_
   *
   *  This method is consistent with other DOM extensions in that it requires an
   *  element **ID** as the string argument, not the name of the
   *  form control (as some might think). If you want to reference controls by
   *  their names, first find the control the regular JavaScript way and use the
   *  node itself instead of an ID as the argument.
   *
   *  For example, if you have an `input` named "company" in a `form` with an
   *  ID "contact":
   *
   *      var form = $('contact');
   *      var input = form['company'];
   *
   *      Form.Element.getValue(input);
   *
   *      // but, the preferred call is:
   *      $(input).getValue(); // we used the $() method so the node gets extended
   *
   *      // you can also use the shortcut
   *      $F(input);
   *
   *  ##### Note
   *
   *  An error is thrown ("element has no properties") if the `element` argument
   *  is an unknown ID.
  **/
  getValue: function(element) {
    element = $(element);
    var method = element.tagName.toLowerCase();
    return Form.Element.Serializers[method](element);
  },

  /**
   *  Form.Element.setValue(@element, value) -> Element
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
   *  Form.Element.clear(@element) -> Element
   *
   *  Clears the contents of a text input. Returns the element.
   *
   *  ##### Example
   *
   *  This code sets up a text field in a way that it clears its contents the
   *  first time it receives focus:
   *
   *        $('some_field').onfocus = function() {
   *          // if already cleared, do nothing
   *          if (this._cleared) return
   *
   *          // when this code is executed, "this" keyword will in fact be the field itself
   *          this.clear()
   *          this._cleared = true
   *        }
  **/
  clear: function(element) {
    $(element).value = '';
    return element;
  },

  /**
   *  Form.Element.present(@element) -> Element
   *
   *  Returns `true` if a text input has contents, `false` otherwise.
   *
   *  ##### Example
   *
   *  This method is very handy in a generic form validation routine.
   *  On the following form's submit event, the presence of each text input is
   *  checked and lets the user know if they left a text input blank.
   *
   *      language: html
   *      <form id="example" class="example" action="#">
   *        <fieldset>
   *          <legend>User Details</legend>
   *          <p id="msg" class="message">Please fill out the following fields:</p>
   *          <p>
   *            <label for="username">Username</label>
   *            <input id="username" type="text" name="username" />
   *          </p>
   *          <p>
   *            <label for="email">Email Address</label>
   *            <input id="email" type="text" name="email" />
   *          </p>
   *          <input type="submit" value="submit" />
   *        </fieldset>
   *      </form>
   *
   *      <script type="text/javascript">
   *        $('example').onsubmit = function(){
   *          var valid, msg = $('msg')
   *
   *          // are both fields present?
   *          valid = $(this.username).present() && $(this.email).present()
   *
   *          if (valid) {
   *            // in the real world we would return true here to allow the form to be submitted
   *            // return true
   *            msg.update('Passed validation!').style.color = 'green'
   *          } else {
   *            msg.update('Please fill out <em>all</em> the fields.').style.color = 'red'
   *          }
   *          return false
   *        }
   *      </script>
  **/
  present: function(element) {
    return $(element).value != '';
  },

  /**
   *  Form.Element.activate(@element) -> Element
   *
   *  Gives focus to a form control and selects its contents if it is a text
   *  input.
   *
   *  This method is just a shortcut for focusing and selecting; therefore,
   *  these are equivalent (aside from the fact that the former one will __not__
   *  return the field) :
   *
   *      Form.Element.focus('myelement').select()
   *      $('myelement').activate()
   *
   *  Guess which call is the nicest? ;)
  **/
  activate: function(element) {
    element = $(element);
    try {
      element.focus();
      if (element.select && (element.tagName.toLowerCase() != 'input' ||
          !(/^(?:button|reset|submit)$/i.test(element.type))))
        element.select();
    } catch (e) { }
    return element;
  },

  /**
   *  Form.Element.disable(@element) -> Element
   *
   *  Disables a form control, effectively preventing its value from changing
   *  until it is enabled again.
   *
   *  This method sets the native `disabled` property of an element to `true`.
   *  You can use this property to check the state of a control.
   *
   *  ##### Notes
   *
   *  Disabled form controls are never serialized.
   *
   *  Never disable a form control as a security measure without having
   *  validation for it server-side. A user with minimal experience of
   *  JavaScript can enable these fields on your site easily using any browser.
   *  Instead, use disabling as a usability enhancement - with it you can
   *  indicate that a specific value should not be changed at the time being.
  **/
  disable: function(element) {
    element = $(element);
    element.disabled = true;
    return element;
  },

  /**
   *  Form.Element.enable(@element) -> Element
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

/** section: DOM, related to: Form
 *  $F(element) -> String | Array
 *
 *  Returns the value of a form control. This is a convenience alias of
 *  [[Form.Element.getValue]]. Refer to it for full details.
**/
var $F = Form.Element.Methods.getValue;

/*--------------------------------------------------------------------------*/

Form.Element.Serializers = (function() {
  function input(element, value) {
    switch (element.type.toLowerCase()) {
      case 'checkbox':
      case 'radio':
        return inputSelector(element, value);
      default:
        return valueSelector(element, value);
    }
  }

  function inputSelector(element, value) {
    if (Object.isUndefined(value))
      return element.checked ? element.value : null;
    else element.checked = !!value;
  }

  function valueSelector(element, value) {
    if (Object.isUndefined(value)) return element.value;
    else element.value = value;
  }

  function select(element, value) {
    if (Object.isUndefined(value))
      return (element.type === 'select-one' ? selectOne : selectMany)(element);

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

  function selectOne(element) {
    var index = element.selectedIndex;
    return index >= 0 ? optionValue(element.options[index]) : null;
  }

  function selectMany(element) {
    var values, length = element.length;
    if (!length) return null;

    for (var i = 0, values = []; i < length; i++) {
      var opt = element.options[i];
      if (opt.selected) values.push(optionValue(opt));
    }
    return values;
  }

  function optionValue(opt) {
    return Element.hasAttribute(opt, 'value') ? opt.value : opt.text;
  }

  return {
    input:         input,
    inputSelector: inputSelector,
    textarea:      valueSelector,
    select:        select,
    selectOne:     selectOne,
    selectMany:    selectMany,
    optionValue:   optionValue,
    button:        valueSelector
  };
})();

/*--------------------------------------------------------------------------*/

/** section: DOM
 * Abstract
**/

/**
 *  class Abstract.TimedObserver
 *
 *  An abstract DOM element observer class, subclasses of which can be used to
 *  periodically check a value and trigger a callback when the value has changed.
 *
 *  A `TimedObserver` object will try to check a value using the `getValue()`
 *  instance method which must be defined by the subclass. There are two
 *  out-of-the-box subclasses:
 *  [[Form.Observer]], which serializes a form and triggers when the result has
 *  changed; and [[Form.Element.Observer]], which triggers when the value of a
 *  given form field changes.
 *
 *
 *  Using `TimedObserver` implementations is straightforward; simply instantiate
 *  them with appropriate arguments. For example:
 *
 *      new Form.Element.Observer(
 *        'myelement',
 *        0.2,  // 200 milliseconds
 *        function(el, value){
 *          alert('The form control has changed value to: ' + value)
 *        }
 *      )
 *
 *  Now that we have instantiated an object, it will check the value of the form
 *  control every 0.2 seconds and alert us of any change. While it is useless to
 *  alert the user of his own input (like in the example), we could be doing
 *  something useful like updating a certain part of the UI or informing the
 *  application on server of stuff happening (over Ajax).
 *
 *  The callback function is always called with 2 arguments: the element given
 *  when the observer instance was made and the actual value that has changed
 *  and caused the callback to be triggered in the first place.
 *
 *  ##### Creating Your Own TimedObserver Implementations
 *
 *  It's easy to create your own `TimedObserver` implementations: Simply subclass
 *  `TimedObserver` and provide the `getValue()` method. For example, this is the
 *  complete source code for [[Form.Element.Observer]]:
 *
 *      Form.Element.Observer = Class.create(Abstract.TimedObserver, {
 *        getValue: function() {
 *          return Form.Element.getValue(this.element);
 *        }
 *      });
**/
Abstract.TimedObserver = Class.create(PeriodicalExecuter, {
  /**
   *  new Abstract.TimedObserver(element, frequency, callback)
   *  - element (String | Element): The DOM element to watch. Can be an element
   *    instance or an ID.
   *  - frequency (Number): The frequency, in seconds&nbsp;&mdash; e.g., 0.33 to
   *    check for changes every third of a second.
   *  - callback (Function): The callback to trigger when the value changes.
   *
   *  Initializes an [[Abstract.TimedObserver]]; used by subclasses.
  **/
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

/**
 *  class Form.Element.Observer < Abstract.TimedObserver
 *
 *  An [[Abstract.TimedObserver]] subclass that watches for changes to a form
 *  field's value. This triggers the callback when the form field's value
 *  (according to [[Form.Element.getValue]]) changes. (Note that when the value
 *  actually changes can vary from browser to browser, particularly with
 *  `select` boxes.)
 *
 *  Form.Element observer implements the `getValue()` method using
 *  [[Form.Element.getValue]] on the given element. See [[Abstract.TimedObserver]]
 *  for general documentation on timed observers.
**/
Form.Element.Observer = Class.create(Abstract.TimedObserver, {
  /**
   *  new Form.Element.Observer(element, frequency, callback)
   *  - element (String | Element): The form element to watch. Can be an element instance or an ID.
   *  - frequency (Number): The frequency, in seconds&nbsp;&mdash; e.g., 0.33 to check for changes every
   *    third of a second.
   *  - callback (Function): The callback to trigger when the value changes.
   *
   *  Creates a [[Form.Element.Observer]].
  **/
  getValue: function() {
    return Form.Element.getValue(this.element);
  }
});

/**
 *  class Form.Observer < Abstract.TimedObserver
 *
 *  An [[Abstract.TimedObserver]] subclass that watches for changes to a form.
 *  The callback is triggered when the form changes&nbsp;&mdash; e.g., when any
 *  of its fields' values changes, when fields are added/removed, etc.; anything
 *  that affects the serialized form of the form (see [[Form#serialize]]).
 *
 *  ##### Example
 *
 *  In this example an `observer` is used to change the appearance of the form
 *  if any of the values had been changed. It returns to its initial state when
 *  the data is submitted (saved).
 *
 *      language: html
 *      <form id="example" action="#">
 *        <fieldset>
 *          <legend>Login Preferences</legend>
 *          <p id="msg" class="message">Current settings:</p>
 *          <p>
 *            <label for="greeting">Greeting message</label>
 *            <input id="greeting" type="text" name="greeting" value="Hello world!" />
 *          </p>
 *          <h4>Login options</h4>
 *          <p>
 *              <input id="login-visible" type="checkbox" name="login-visible" checked="checked" />
 *              <label for="login-visible">allow others to see my last login date</label>
 *          </p>
 *          <p>
 *              <input id="land-recent" type="checkbox" name="land-recent" />
 *              <label for="land-recent">land on recent changes overview instead of the Dashboard</label>
 *          </p>
 *          <input type="submit" value="save" />
 *        </fieldset>
 *      </form>
 *
 *      <script type="text/javascript">
 *        new Form.Observer('example', 0.3, function(form, value){
 *          $('msg').update('Your preferences have changed. Resubmit to save').style.color = 'red'
 *          form.down().setStyle({ background:'lemonchiffon', borderColor:'red' })
 *        })
 *
 *        $('example').onsubmit = function() {
 *          $('msg').update('Preferences saved!').style.color = 'green'
 *          this.down().setStyle({ background:null, borderColor:null })
 *          return false
 *        }
 *      </script>
**/
Form.Observer = Class.create(Abstract.TimedObserver, {
  /**
   *  new Form.Observer(element, frequency, callback)
   *  - element (String | Element): The element of the form to watch. Can be an element
   *    instance or an ID.
   *  - frequency (Number): The frequency, in seconds -- e.g., 0.33 to check for changes every
   *    third of a second.
   *  - callback (Function): The callback to trigger when the form changes.
   *
   *  Creates a [[Form.Observer]].
  **/
  getValue: function() {
    return Form.serialize(this.element);
  }
});

/*--------------------------------------------------------------------------*/

/**
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

/**
 *  class Form.Element.EventObserver < Abstract.EventObserver
**/
Form.Element.EventObserver = Class.create(Abstract.EventObserver, {
  getValue: function() {
    return Form.Element.getValue(this.element);
  }
});

/**
 *  class Form.EventObserver < Abstract.EventObserver
**/
Form.EventObserver = Class.create(Abstract.EventObserver, {
  getValue: function() {
    return Form.serialize(this.element);
  }
});
