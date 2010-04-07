/**
 * @author Ryan Johnson <http://syntacticx.com/>
 * @copyright 2008 PersonalGrid Corporation <http://personalgrid.com/>
 * @package LivePipe UI
 * @license MIT
 * @url http://livepipe.net/core
 * @require prototype.js
 */

if(typeof(Control) == 'undefined')
    Control = {};
    
var $proc = function(proc){
    return typeof(proc) == 'function' ? proc : function(){return proc};
};

var $value = function(value){
    return typeof(value) == 'function' ? value() : value;
};

Object.Event = {
    extend: function(object){
        object._objectEventSetup = function(event_name){
            this._observers = this._observers || {};
            this._observers[event_name] = this._observers[event_name] || [];
        };
        object.observe = function(event_name,observer){
            if(typeof(event_name) == 'string' && typeof(observer) != 'undefined'){
                this._objectEventSetup(event_name);
                if(!this._observers[event_name].include(observer))
                    this._observers[event_name].push(observer);
            }else
                for(var e in event_name)
                    this.observe(e,event_name[e]);
        };
        object.stopObserving = function(event_name,observer){
            this._objectEventSetup(event_name);
            if(event_name && observer)
                this._observers[event_name] = this._observers[event_name].without(observer);
            else if(event_name)
                this._observers[event_name] = [];
            else
                this._observers = {};
        };
        object.observeOnce = function(event_name,outer_observer){
            var inner_observer = function(){
                outer_observer.apply(this,arguments);
                this.stopObserving(event_name,inner_observer);
            }.bind(this);
            this._objectEventSetup(event_name);
            this._observers[event_name].push(inner_observer);
        };
        object.notify = function(event_name){
            this._objectEventSetup(event_name);
            var collected_return_values = [];
            var args = $A(arguments).slice(1);
            try{
                for(var i = 0; i < this._observers[event_name].length; ++i)
                    collected_return_values.push(this._observers[event_name][i].apply(this._observers[event_name][i],args) || null);
            }catch(e){
                if(e == $break)
                    return false;
                else
                    throw e;
            }
            return collected_return_values;
        };
        if(object.prototype){
            object.prototype._objectEventSetup = object._objectEventSetup;
            object.prototype.observe = object.observe;
            object.prototype.stopObserving = object.stopObserving;
            object.prototype.observeOnce = object.observeOnce;
            object.prototype.notify = function(event_name){
                if(object.notify){
                    var args = $A(arguments).slice(1);
                    args.unshift(this);
                    args.unshift(event_name);
                    object.notify.apply(object,args);
                }
                this._objectEventSetup(event_name);
                var args = $A(arguments).slice(1);
                var collected_return_values = [];
                try{
                    if(this.options && this.options[event_name] && typeof(this.options[event_name]) == 'function')
                        collected_return_values.push(this.options[event_name].apply(this,args) || null);
                    for(var i = 0; i < this._observers[event_name].length; ++i)
                        collected_return_values.push(this._observers[event_name][i].apply(this._observers[event_name][i],args) || null);
                }catch(e){
                    if(e == $break)
                        return false;
                    else
                        throw e;
                }
                return collected_return_values;
            };
        }
    }
};

/* Begin Core Extensions */

//Element.observeOnce
Element.addMethods({
    observeOnce: function(element,event_name,outer_callback){
        var inner_callback = function(){
            outer_callback.apply(this,arguments);
            Element.stopObserving(element,event_name,inner_callback);
        };
        Element.observe(element,event_name,inner_callback);
    }
});

//mouseenter, mouseleave
//from http://dev.rubyonrails.org/attachment/ticket/8354/event_mouseenter_106rc1.patch
Object.extend(Event, (function() {
    var cache = Event.cache;

    function getEventID(element) {
        if (element._prototypeEventID) return element._prototypeEventID[0];
        arguments.callee.id = arguments.callee.id || 1;
        return element._prototypeEventID = [++arguments.callee.id];
    }

    function getDOMEventName(eventName) {
        if (eventName && eventName.include(':')) return "dataavailable";
        //begin extension
        if(!Prototype.Browser.IE){
            eventName = {
                mouseenter: 'mouseover',
                mouseleave: 'mouseout'
            }[eventName] || eventName;
        }
        //end extension
        return eventName;
    }

    function getCacheForID(id) {
        return cache[id] = cache[id] || { };
    }

    function getWrappersForEventName(id, eventName) {
        var c = getCacheForID(id);
        return c[eventName] = c[eventName] || [];
    }

    function createWrapper(element, eventName, handler) {
        var id = getEventID(element);
        var c = getWrappersForEventName(id, eventName);
        if (c.pluck("handler").include(handler)) return false;

        var wrapper = function(event) {
            if (!Event || !Event.extend ||
                (event.eventName && event.eventName != eventName))
                    return false;

            Event.extend(event);
            handler.call(element, event);
        };
        
        //begin extension
        if(!(Prototype.Browser.IE) && ['mouseenter','mouseleave'].include(eventName)){
            wrapper = wrapper.wrap(function(proceed,event) {    
                var rel = event.relatedTarget;
                var cur = event.currentTarget;             
                if(rel && rel.nodeType == Node.TEXT_NODE)
                    rel = rel.parentNode;      
                if(rel && rel != cur && !rel.descendantOf(cur))      
                    return proceed(event);   
            });     
        }
        //end extension

        wrapper.handler = handler;
        c.push(wrapper);
        return wrapper;
    }

    function findWrapper(id, eventName, handler) {
        var c = getWrappersForEventName(id, eventName);
        return c.find(function(wrapper) { return wrapper.handler == handler });
    }

    function destroyWrapper(id, eventName, handler) {
        var c = getCacheForID(id);
        if (!c[eventName]) return false;
        c[eventName] = c[eventName].without(findWrapper(id, eventName, handler));
    }

    function destroyCache() {
        for (var id in cache)
            for (var eventName in cache[id])
                cache[id][eventName] = null;
    }

    if (window.attachEvent) {
        window.attachEvent("onunload", destroyCache);
    }

    return {
        observe: function(element, eventName, handler) {
            element = $(element);
            var name = getDOMEventName(eventName);

            var wrapper = createWrapper(element, eventName, handler);
            if (!wrapper) return element;

            if (element.addEventListener) {
                element.addEventListener(name, wrapper, false);
            } else {
                element.attachEvent("on" + name, wrapper);
            }

            return element;
        },

        stopObserving: function(element, eventName, handler) {
            element = $(element);
            var id = getEventID(element), name = getDOMEventName(eventName);

            if (!handler && eventName) {
                getWrappersForEventName(id, eventName).each(function(wrapper) {
                    element.stopObserving(eventName, wrapper.handler);
                });
                return element;

            } else if (!eventName) {
                Object.keys(getCacheForID(id)).each(function(eventName) {
                    element.stopObserving(eventName);
                });
                return element;
            }

            var wrapper = findWrapper(id, eventName, handler);
            if (!wrapper) return element;

            if (element.removeEventListener) {
                element.removeEventListener(name, wrapper, false);
            } else {
                element.detachEvent("on" + name, wrapper);
            }

            destroyWrapper(id, eventName, handler);

            return element;
        },

        fire: function(element, eventName, memo) {
            element = $(element);
            if (element == document && document.createEvent && !element.dispatchEvent)
                element = document.documentElement;

            var event;
            if (document.createEvent) {
                event = document.createEvent("HTMLEvents");
                event.initEvent("dataavailable", true, true);
            } else {
                event = document.createEventObject();
                event.eventType = "ondataavailable";
            }

            event.eventName = eventName;
            event.memo = memo || { };

            if (document.createEvent) {
                element.dispatchEvent(event);
            } else {
                element.fireEvent(event.eventType, event);
            }

            return Event.extend(event);
        }
    };
})());

Object.extend(Event, Event.Methods);

Element.addMethods({
    fire:            Event.fire,
    observe:        Event.observe,
    stopObserving:    Event.stopObserving
});

Object.extend(document, {
    fire:            Element.Methods.fire.methodize(),
    observe:        Element.Methods.observe.methodize(),
    stopObserving:    Element.Methods.stopObserving.methodize()
});

//mouse:wheel
(function(){
    function wheel(event){
        var delta;
        // normalize the delta
        if(event.wheelDelta) // IE & Opera
            delta = event.wheelDelta / 120;
        else if (event.detail) // W3C
            delta =- event.detail / 3;
        if(!delta)
            return;
        var custom_event = Event.element(event).fire('mouse:wheel',{
            delta: delta
        });
        if(custom_event.stopped){
            Event.stop(event);
            return false;
        }
    }
    document.observe('mousewheel',wheel);
    document.observe('DOMMouseScroll',wheel);
})();

/* End Core Extensions */

//from PrototypeUI
var IframeShim = Class.create({
    initialize: function() {
        this.element = new Element('iframe',{
            style: 'position:absolute;filter:progid:DXImageTransform.Microsoft.Alpha(opacity=0);display:none',
            src: 'javascript:void(0);',
            frameborder: 0 
        });
        $(document.body).insert(this.element);
    },
    hide: function() {
        this.element.hide();
        return this;
    },
    show: function() {
        this.element.show();
        return this;
    },
    positionUnder: function(element) {
        var element = $(element);
        var offset = element.cumulativeOffset();
        var dimensions = element.getDimensions();
        this.element.setStyle({
            left: offset[0] + 'px',
            top: offset[1] + 'px',
            width: dimensions.width + 'px',
            height: dimensions.height + 'px',
            zIndex: element.getStyle('zIndex') - 1
        }).show();
        return this;
    },
    setBounds: function(bounds) {
        for(prop in bounds)
            bounds[prop] += 'px';
        this.element.setStyle(bounds);
        return this;
    },
    destroy: function() {
        if(this.element)
            this.element.remove();
        return this;
    }
});

/**
 * @author Ryan Johnson <http://syntacticx.com/>
 * @copyright 2008 PersonalGrid Corporation <http://personalgrid.com/>
 * @package LivePipe UI
 * @license MIT
 * @url http://livepipe.net/control/tabs
 * @require prototype.js, livepipe.js
 */

/*global window, document, Prototype, $, $A, $H, $break, Class, Element, Event, Control */

if(typeof(Prototype) == "undefined") {
    throw "Control.Tabs requires Prototype to be loaded."; }
if(typeof(Object.Event) == "undefined") {
    throw "Control.Tabs requires Object.Event to be loaded."; }

Control.Tabs = Class.create({
    initialize: function(tab_list_container,options){
        if(!$(tab_list_container)) {
            throw "Control.Tabs could not find the element: " + tab_list_container; }
        this.activeContainer = false;
        this.activeLink = false;
        this.containers = $H({});
        this.links = [];
        Control.Tabs.instances.push(this);
        this.options = {
            beforeChange: Prototype.emptyFunction,
            afterChange: Prototype.emptyFunction,
            hover: false,
            linkSelector: 'li a',
            setClassOnContainer: false,
            activeClassName: 'active',
            defaultTab: 'first',
            autoLinkExternal: true,
            targetRegExp: /#(.+)$/,
            showFunction: Element.show,
            hideFunction: Element.hide
        };
        Object.extend(this.options,options || {});
        (typeof(this.options.linkSelector == 'string') ? 
            $(tab_list_container).select(this.options.linkSelector) : 
            this.options.linkSelector($(tab_list_container))
        ).findAll(function(link){
            return (/^#/).exec((Prototype.Browser.WebKit ? decodeURIComponent(link.href) : link.href).replace(window.location.href.split('#')[0],''));
        }).each(function(link){
            this.addTab(link);
        }.bind(this));
        this.containers.values().each(Element.hide);
        if(this.options.defaultTab == 'first') {
            this.setActiveTab(this.links.first());
        } else if(this.options.defaultTab == 'last') {
            this.setActiveTab(this.links.last());
        } else {
            this.setActiveTab(this.options.defaultTab); }
        var targets = this.options.targetRegExp.exec(window.location);
        if(targets && targets[1]){
            targets[1].split(',').each(function(target){
                this.setActiveTab(this.links.find(function(link){
                    return link.key == target;
                }));
            }.bind(this));
        }
        if(this.options.autoLinkExternal){
            $A(document.getElementsByTagName('a')).each(function(a){
                if(!this.links.include(a)){
                    var clean_href = a.href.replace(window.location.href.split('#')[0],'');
                    if(clean_href.substring(0,1) == '#'){
                        if(this.containers.keys().include(clean_href.substring(1))){
                            $(a).observe('click',function(event,clean_href){
                                this.setActiveTab(clean_href.substring(1));
                            }.bindAsEventListener(this,clean_href));
                        }
                    }
                }
            }.bind(this));
        }
    },
    addTab: function(link){
        this.links.push(link);
        link.key = link.getAttribute('href').replace(window.location.href.split('#')[0],'').split('#').last().replace(/#/,'');
        var container = $(link.key);
        if(!container) {
            throw "Control.Tabs: #" + link.key + " was not found on the page."; }
        this.containers.set(link.key,container);
        link[this.options.hover ? 'onmouseover' : 'onclick'] = function(link){
            if(window.event) {
                Event.stop(window.event); }
            this.setActiveTab(link);
            return false;
        }.bind(this,link);
    },
    setActiveTab: function(link){
        if(!link && typeof(link) == 'undefined') {
            return; }
        if(typeof(link) == 'string'){
            this.setActiveTab(this.links.find(function(_link){
                return _link.key == link;
            }));
        }else if(typeof(link) == 'number'){
            this.setActiveTab(this.links[link]);
        }else{
            if(this.notify('beforeChange',this.activeContainer,this.containers.get(link.key)) === false) {
                return; }
            if(this.activeContainer) {
                this.options.hideFunction(this.activeContainer); }
            this.links.each(function(item){
                (this.options.setClassOnContainer ? $(item.parentNode) : item).removeClassName(this.options.activeClassName);
            }.bind(this));
            (this.options.setClassOnContainer ? $(link.parentNode) : link).addClassName(this.options.activeClassName);
            this.activeContainer = this.containers.get(link.key);
            this.activeLink = link;
            this.options.showFunction(this.containers.get(link.key));
            this.notify('afterChange',this.containers.get(link.key));
        }
    },
    next: function(){
        this.links.each(function(link,i){
            if(this.activeLink == link && this.links[i + 1]){
                this.setActiveTab(this.links[i + 1]);
                throw $break;
            }
        }.bind(this));
    },
    previous: function(){
        this.links.each(function(link,i){
            if(this.activeLink == link && this.links[i - 1]){
                this.setActiveTab(this.links[i - 1]);
                throw $break;
            }
        }.bind(this));
    },
    first: function(){
        this.setActiveTab(this.links.first());
    },
    last: function(){
        this.setActiveTab(this.links.last());
    }
});
Object.extend(Control.Tabs,{
    instances: [],
    findByTabId: function(id){
        return Control.Tabs.instances.find(function(tab){
            return tab.links.find(function(link){
                return link.key == id;
            });
        });
    }
});
Object.Event.extend(Control.Tabs);
