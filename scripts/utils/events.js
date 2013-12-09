// ======== Values and Events ========

// Key-Value Management:
//   addValue(key, type, initial), alias: add
//   setValue(key, value, post_event[default: true]), alias: set
//   getValue(key), alias: get
//   addValueListener(key, listener, priority), alias: listen
// Event Management:
//   addEvent(key)
//   addListener(key, listener, priority), alias: on
//   raiseEvent(key, parameters), alias: raise

NS_values = { };
NS_events = { };

var value_event_prefix = "__value:";

NS.addValue = function(key, type, initial) {
    if(initial === undefined || initial === null) {
        initial = "";
        if(type == "bool") initial = false;
        if(type == "string") initial = "";
        if(type == "number") initial = 0;
        if(type == "object") initial = { };
    }
    NS_values[key] = {
        type: type,
        value: initial
    };
    NS.addEvent(value_event_prefix + key);
    return NS;
};
NS.add = NS.addValue;

NS.setValue = function(key, value, post_event) {
    NS_values[key].value = value;
    if(post_event === null || post_event === undefined || post_event === true) {
        NS.raiseEvent(value_event_prefix + key, value);
    }
    return NS;
};
NS.set = NS.setValue;

NS.existsValue = function(key) {
    return NS_values[key] != undefined;
};
NS.exists = NS.existsValue;

NS.getValue = function(key) {
    return NS_values[key].value;
};
NS.get = NS.getValue;

NS.addValueListener = function(key, listener, priority) {
    NS.addListener(value_event_prefix + key, listener, priority);
    return NS;
};
NS.listen = NS.addValueListener;

NS.addListener = function(key, listener, priority) {
    if(!priority) priority = 1;
    var ev = NS_events[key];
    if(!ev) {
        NS.addEvent(key);
        ev = NS_events[key];
    }
    ev.listeners.push({ f: listener, p: priority });
    ev.listeners.sort(function(a, b) {
        return b.p - a.p;
    });
    return NS;
};
NS.on = NS.addListener;

NS.addEvent = function(key) {
    NS_events[key] = {
        listeners: [],
        running: false
    };
    return NS;
};

NS.raiseEvent = function(key) {
    var args = Array.prototype.slice.call(arguments, 1);
    var ev = NS_events[key];
    if(!ev) return NS;
    if(ev.running) return NS;
    ev.running = true;
    ev.listeners.some(function(listener) {
        var r;
        try {
            r = listener.f.apply(NS, args);
        } catch(e) {
            console.log(e.stack);
        }
        if(r) return true;
        return false;
    });
    ev.running = false;
    return NS;
};
NS.raise = NS.raiseEvent;

// ### Object event passing system.

var object_event_listeners = {};

NS.bindObjectEvent = function(obj, event_key, listener) {
    if(!obj._euid) obj._euid = NS.generateUUID();
    var ll = object_event_listeners[obj._euid];
    if(!ll) ll = object_event_listeners[obj._euid] = {};
    if(!ll[event_key]) ll[event_key] = [];
    ll[event_key].push(listener);
    return {
        unbind: function() {
            var idx = ll[event_key].indexOf(listener);
            if(idx >= 0) {
                ll[event_key].splice(idx, 1);
            }
            if(ll[event_key].length == 0) delete ll[event_key];
        }
    };
};

NS.bindObjectEvents = function(obj, event_keys, listener) {
    var ls = event_keys.map(function(key) {
        return NS.bindObjectEvent(obj, key, function(val) {
            listener(key, val);
        });
    });
    return {
        unbind: function() {
            ls.forEach(function(l) { l.unbind(); });
        }
    };
};

NS.raiseObjectEvent = function(obj, event_key) {
    if(!obj._euid) return;
    if(!object_event_listeners[obj._euid]) return;
    if(!object_event_listeners[obj._euid][event_key]) return;
    var args = [];
    for(var i = 2; i < arguments.length; i++) {
        args.push(arguments[i]);
    }
    object_event_listeners[obj._euid][event_key].forEach(function(f) {
        f.apply(obj, args);
    });
};

NS.EventSource = function() {
    this._event_source_handlers = { };
    this._event_source_values = { };
};

NS.EventSource.prototype.raise = function(event) {
    var $this = this;
    var args = Array.prototype.slice.call(arguments, 1);
    if(this._event_source_handlers[event]) {
        this._event_source_handlers[event].forEach(function(f) {
            f.apply($this, args);
        });
    }
};

NS.EventSource.prototype.bind = function(event, f) {
    if(this._event_source_handlers[event]) {
        this._event_source_handlers[event].push(f);
    } else {
        this._event_source_handlers[event] = [ f ];
    }
};

NS.EventSource.prototype.unbind = function(event, f) {
    if(this._event_source_handlers[event]) {
        var idx = this._event_source_handlers[event].indexOf(f);
        if(idx >= 0) this._event_source_handlers[event].splice(idx, 1);
    }
};

NS.EventSource.prototype.set = function(key, value) {
    this._event_source_values[key] = value;
    this.raise("_value_" + key, value);
};

NS.EventSource.prototype.get = function(key, value) {
    return this._event_source_values[key];
};

NS.EventSource.prototype.listen = function(key, callback) {
    this.bind("_value_" + key, callback);
};

NS.EventSource.prototype.unlisten = function(key, callback) {
    this.unbind("_value_" + key, callback);
};

NS.makeEventSource = function(obj) {
    for(var key in NS.EventSource.prototype) {
        obj[key] = NS.EventSource.prototype[key];
    }
    NS.EventSource.call(obj);
};
