// scripts/utils.js
// A framework for our application.

var IV = (function() {
// The namespace to output.
var NS = { };

// ======== Utility Functions ========

// Date.getString:
//   Date.getFullString()   Jan 17th, 2012 21:34
//   Date.getDayString()    Jan 17th, 2012
//   Date.getTimeString()   21:34

(function(){
    var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    var num_pad = function(s) {
        var j = s.toString();
        while(j.length < 2) j = '0' + j;
        return j;
    };
    // add th,nd,rd to small integers. example: 23 to 23rd.
    var addth = function(day) {
        if(day % 100 == 11 || day % 100 == 12 || day % 100 == 13) return day + "th";
        if(day % 10 == 1) return day + "st";
        if(day % 10 == 2) return day + "nd";
        if(day % 10 == 3) return day + "rd";
        return day + "th";

    };
    Date.prototype.getFullString = function() {
        return months[this.getMonth()] + " " +
               addth(this.getDate()) + ", " +
               this.getFullYear() + " " +
               num_pad(this.getHours()) + ":" +
               num_pad(this.getMinutes());
    };
    Date.prototype.getDayString = function() {
        return months[this.getMonth()] + " " + addth(this.getDate()) + ", " + this.getFullYear();
    };
    Date.prototype.getTimeString = function() {
        return num_pad(this.getHours()) + ":" + num_pad(this.getMinutes());
    };
	//Array.prototype.end = function() {
	//	if (this.length <= 0) return;
	//	return this[this.length-1];
	//}
})();

// Timing functions.
//   waitUntil(condition, on_finished, interval, timeout)
//     wait until condition() == true, call on_finished(true/false).
//     interval and timeout in milliseconds, default interval = 100, timeout = inf.
//   tryRetry(f, on_finished, max_count)
//     try f(callback), if callback(null, result) is called, pass them to on_finished.
//     otherwise, retry f(callback), until success or max_count reached.
//     when failed, on_finished(last_error) is called.

NS.waitUntil = function(condition, on_finished, interval, timeout) {
    if(!timeout) timeout = 1e100;
    var time_started = new Date().getTime();
    var timer = setInterval(function() {
        if(condition()) {
            clearInterval(timer);
            if(on_finished) on_finished(true);
        }
        if(new Date().getTime() - time_started > timeout) {
            clearInterval(timer);
            if(on_finished) on_finished(false);
        }
    }, interval ? interval : 100);
};


NS.tryRetry = function(f, on_finished, max_count) {
    var tried = 0;
    var try_once = function() {
        f(function(error, result) {
            if(error) {
                tried++;
                if(tried == max_count) {
                    on_finished(error);
                } else {
                    try_once();
                }
            } else {
                on_finished(null, result);
            }
        });
    };
    try_once();
};

// Object Array.
//   packObjects(objects, scheme)
//   unpackObjects(array, scheme)

NS.packObjects = function(objects, scheme) {
    var r = [];
    return objects.map(function(obj) {
        return scheme.map(function(def) {
            var val;
            if(typeof(def) == "string") {
                val = obj[def];
            } else {
                val = obj[def.key];
                if(def.encode) val = def.encode(val);
            }
            x.push(val);
        });
    });
};

NS.unpackObjects = function(array, scheme) {
    var r = [];
    return array.map(function(x) {
        var obj = { };
        scheme.forEach(function(def) {
            var val = x[j];
            if(typeof(def) == "string") {
                obj[def] = val;
            } else {
                if(def.decode) val = def.decode(val);
                obj[def.key] = val;
            }
        });
        r.push(obj);
    });
};

NS.getQuery = function(name) {
    return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)')
             .exec(location.search)||[,""])[1]
             .replace(/\+/g, '%20'))||null;
};

// Colors.
//   from http://colorbrewer2.org
var color_qualitative = [
    "166,206,227","31,120,180","178,223,138","51,160,44","251,154,153","227,26,28",
    "253,191,111","255,127,0","202,178,214","106,61,154","255,255,153"
];
color_qualitative.getColor = function(index) {
    return color_qualitative[index % color_qualitative.length];
}
var color_qualitative_warm = [
    "255,247,236","254,232,200","253,212,158","253,187,132",
    "252,141,89","239,101,72","215,48,31","179,0,0","127,0,0"
];
var color_qualitative_gray = [
    "255,255,255","240,240,240","217,217,217","189,189,189",
    "150,150,150","115,115,115","82,82,82","37,37,37","0,0,0"
];
var color_qualitative_cold = [
    "255,247,251","236,231,242","208,209,230","166,189,219",
    "116,169,207","54,144,192","5,112,176","4,90,141","2,56,88"
];
var color_qualitative_nodes = [
// red one.
    "#F8AB8E", "#EA9378", "#DA7C64", "#C86652", "#B45241", "#9F3F32", "#882D24", "#701E18", "#57100E", "#3F0500"
// blue
    // "#CFD0FD", "#B3BAEF", "#98A4DF", "#7D8ECD", "#647AB9", "#4D65A3", "#37528C", "#233F73", "#102D59", "#031D3E"
];
var color_qualitative_hcl = [
    "#7D99C6", "#5CA0C3", "#39A5B9", "#1DA8AA", "#1FAA96", "#39AA81", "#54A96B",
    "#6EA656", "#87A145", "#9E9B39", "#B59436", "#C88B3C", "#D98249", "#E47A5B"];

var gradient_interpolate = function(p, gradient) {
    if(p < 0) return gradient[0];
    if(p >= 1) return gradient[gradient.length - 1];
    var pos = p * (gradient.length - 1);
    var idx = Math.floor(pos);
    var dp = pos - idx;
    var dq = 1 - dp;
    var v1 = idx < gradient.length ? gradient[idx] : gradient[gradient.length - 1];
    var v2 = idx + 1 < gradient.length ? gradient[idx + 1] : gradient[gradient.length - 1];
    return [parseInt(v1[0] * dq + v2[0] * dp),
            parseInt(v1[1] * dq + v2[1] * dp),
            parseInt(v1[2] * dq + v2[2] * dp)];
};
var create_gradient = function(str_array) {
    var obj = str_array.map(function(x) {
        if(x[0] == '#') {
            var hex2z = function(hex) {
                if(hex == '0') return 0;
                if(hex == '1') return 1;
                if(hex == '2') return 2;
                if(hex == '3') return 3;
                if(hex == '4') return 4;
                if(hex == '5') return 5;
                if(hex == '6') return 6;
                if(hex == '7') return 7;
                if(hex == '8') return 8;
                if(hex == '9') return 9;
                if(hex == 'A') return 10;
                if(hex == 'B') return 11;
                if(hex == 'C') return 12;
                if(hex == 'D') return 13;
                if(hex == 'E') return 14;
                if(hex == 'F') return 15;
                if(hex == 'a') return 10;
                if(hex == 'b') return 11;
                if(hex == 'c') return 12;
                if(hex == 'd') return 13;
                if(hex == 'e') return 14;
                if(hex == 'f') return 15;
            };
            return [
                hex2z(x[1]) * 16 + hex2z(x[2]),
                hex2z(x[3]) * 16 + hex2z(x[4]),
                hex2z(x[5]) * 16 + hex2z(x[6])
            ];
        } else {
            var s = x.split(",");
            return [parseInt(s[0]), parseInt(s[1]), parseInt(s[2])];
        }
    });
    obj.getColor = function(p) {
        return gradient_interpolate(p, obj).join(",");
    };
    return obj;
};
NS.colormap = { };
NS.colormap.cold = create_gradient(color_qualitative_cold);
NS.colormap.warm = create_gradient(color_qualitative_warm);
NS.colormap.gray = create_gradient(color_qualitative_gray);
NS.colormap.hcl = create_gradient(color_qualitative_hcl);
NS.colormap.nodes = create_gradient(color_qualitative_nodes);
NS.colormap.qualitative = color_qualitative;

NS.addGradient = function(name, desc) {
    NS.colormap[name] = create_gradient(desc);
};

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

// ======== SHA-1 Checksum ========
(function() {
// Calculate SHA1 of the bytes array.
// Convert UTF-8 string to bytes array.
function sha1_str2bytes(str) {
    var bytes = [];
    for(var i = 0; i < str.length; i++) {
        bytes.push(str.charCodeAt(i) & 0xff);
    }
    return bytes;
}
// Convert UTF-8 bytes array back to string.
function sha1_bytes2str(bytes) {
    var string = "";
    var i = 0;
    var c;
    while(i < bytes.length) {
        c = bytes[i];
        string += String.fromCharCode(c);
        i++;
    }
    return string;
}
// Convert a hex string to bytes array.
function sha1_hex2bytes(hexstr) {
    var bytes = [];
    var trans = function(c) {
        if(c <= 0x39 && c >= 0x30) return c - 0x30;
        if(c <= 0x66 && c >= 0x61) return c - 0x61 + 10;
        if(c <= 0x46 && c >= 0x41) return c - 0x41 + 10;
        return 0;
    }
    for(var i = 0; i < hexstr.length; i += 2) {
        bytes.push(trans(hexstr.charCodeAt(i)) << 4 | trans(hexstr.charCodeAt(i + 1)));
    }
    return bytes;
}
// Convert bytes array to hex string.
function sha1_bytes2hex(bytes) {
    var str = "";
    var hex_digits = "0123456789abcdef";
    for(var i = 0; i < bytes.length; i++) {
        str += hex_digits[bytes[i] >> 4];
        str += hex_digits[bytes[i] % 16];
        //str += "("+bytes[i] + ")";
    }
    return str;
}
function sha1_hash(data) {
    var sha1_add = function(x, y) {
        var lb = (x & 0xFFFF) + (y & 0xFFFF);
        var hb = (x >> 16) + (y >> 16) + (lb >> 16);
        return (hb << 16) | (lb & 0xFFFF);
    };
    var sha1_S = function(n, x) {
        return (x << n) | (x >>> (32 - n));
    };
    var sha1_const_K = function(t) {
        if(t < 20) return 0x5A827999;
        if(t < 40) return 0x6ED9EBA1;
        if(t < 60) return 0x8F1BBCDC;
        return 0xCA62C1D6;
    };
    var sha1_func = function(t, B, C, D) {
        if(t < 20) return (B & C) | ((~B) & D);
        if(t < 40) return B ^ C ^ D;
        if(t < 60) return (B & C) | (B & D) | (C & D);
        return B ^ C ^ D;
    };
    var sha1_append = function(bytes) {
        var len = 8 * bytes.length;
        bytes.push(128);
        var n_append = 56 - bytes.length % 64;
        if(n_append < 0) n_append += 64;
        for(var i = 0; i < n_append; i++) bytes.push(0);
        bytes.push(0); bytes.push(0); bytes.push(0); bytes.push(0);
        bytes.push((len >> 24) & 0xFF);
        bytes.push((len >> 16) & 0xFF);
        bytes.push((len >> 8) & 0xFF);
        bytes.push(len & 0xFF);
        return bytes;
    };
    bytes = sha1_append(data);
    words = [];
    for(var i = 0; i < bytes.length; i += 4) {
        var w = bytes[i] << 24 | bytes[i + 1] << 16 | bytes[i + 2] << 8 | bytes[i + 3];
        words.push(w);
    }
    H = [0x67452301, 0xEFCDAB89, 0x98BADCFE, 0x10325476, 0xC3D2E1F0];
    for(var i = 0; i < words.length; i += 16) {
        W = [];
        for(var t = 0; t < 16; t++) W[t] = words[i + t];
        for(var t = 16; t < 80; t++)
            W[t] = sha1_S(1, W[t - 3] ^ W[t - 8] ^ W[t - 14] ^ W[t - 16]);
        A = H[0]; B = H[1]; C = H[2]; D = H[3]; E = H[4];
        for(var t = 0; t < 80; t++) {
            tmp = sha1_add(sha1_S(5, A),
                    sha1_add(sha1_add(sha1_add(sha1_func(t, B, C, D), E), W[t]), sha1_const_K(t)));
            E = D; D = C; C = sha1_S(30, B); B = A; A = tmp;
        }
        H[0] = sha1_add(H[0], A);
        H[1] = sha1_add(H[1], B);
        H[2] = sha1_add(H[2], C);
        H[3] = sha1_add(H[3], D);
        H[4] = sha1_add(H[4], E);
    }
    var rslt = [];
    for(var i = 0; i < 5; i++) {
        rslt.push((H[i] >> 24) & 0xFF);
        rslt.push((H[i] >> 16) & 0xFF);
        rslt.push((H[i] >> 8) & 0xFF);
        rslt.push(H[i] & 0xFF);
    }
    return rslt;
}
NS.sha1str = function(s) {
    return sha1_bytes2hex(sha1_hash(sha1_str2bytes(s)));
};
})();

// ======== Controls ========

// Slider.
// params: value, value_inverse, label, default_value
// functions:
//  setParams: set new parameters.
//  sliderSet: set value of the slider.
//  sliderEvent(new_value, is_up)
NS.createSlider = function(object, params) {
    if(!params) params = {};
    var value_func = params.value ? params.value : function(x) { return x; };
    var value_ifunc = params.value_inverse ? params.value_inverse : function(x) { return x; };
    var label_func = params.label ? params.label : function(x) { return x.toFixed(2); };
    var default_value = params.default_value ? params.default_value : 0;

    // object should be a div element.
    var elem = object;
    var width = parseInt($(elem).css("width").replace('px',''));
    $(elem).addClass("slider");
    elem.innerHTML = '<div class="bg"></div><div class="label"></div><div class="box"></div>';
    var box = $(elem).children('.box');
    box.css("left", "0px");
    var label = $(elem).children('.label');
    var box_w = box.width();
    var is_dragging = false;
    var x0 = 0, tx0 = 0;

    elem.setParams = function(params) {
        if(params.value) value_func = params.value;
        if(params.value_inverse) value_ifunc = params.value_inverse;
        if(params.label) label_func = params.label;
        elem.sliderSet(elem.sliderValue);
    };

    var onchange = function(x) {
        var t = x / (width - box_w);
        slider_set(t);
        if(elem.sliderEvent != undefined) {
            elem.sliderEvent(elem.sliderValue, false);
        }
    };
    var onchange_up = function() {
        if(elem.sliderEvent != undefined) {
            elem.sliderEvent(elem.sliderValue, true);
        }
    };
    var this_t = 0;
    var slider_set = function(t) {
        this_t = t;
        var x = t * (width - box_w);
        box.css('left', x + "px");
        if(x + box_w / 2 > width / 2)
            label.css("text-align", "left");
        else
            label.css("text-align", "right");
        elem.sliderValue = value_func(t);
        label.html(label_func(elem.sliderValue));
    };

    elem.sliderSet = function(val) {
        slider_set(value_ifunc(val));
    };

    box.mousedown(function(e) {
        is_dragging = true;
        x0 = e.pageX;
        tx0 = parseInt(box.css('left').replace('px',''));
        e.stopPropagation();
        e.preventDefault();
    });
    $(elem).mousedown(function(e) {
        var xx = e.pageX - $(elem).offset().left - box_w / 2;
        if(xx < 0) xx = 0;
        if(xx > width - box_w) xx = width - box_w;
        onchange(xx);
        is_dragging = true;
        x0 = e.pageX;
        tx0 = parseInt(box.css('left').replace('px',''));
        e.stopPropagation();
        e.preventDefault();
    });
    $(window).mousemove(function(e) {
        if(is_dragging) {
            var xx = tx0 + e.pageX - x0;
            if(xx < 0) xx = 0;
            if(xx > width - box_w) xx = width - box_w;
            onchange(xx);
        }
    });

    $(window).mouseup(function() {
        if(is_dragging) {
            is_dragging = false;
            onchange_up();
        }
    });
    elem.sliderSet(default_value);
    return object;
};

// ======== Local Storage ========

NS.localStoragePrefix = "wbvis_events_";

NS.addEvent("storage");

NS.saveObject = function(key, object) {
    window.localStorage.setItem(this.localStoragePrefix + key, JSON.stringify(object));
};
NS.saveString = function(key, str) {
    window.localStorage.setItem(this.localStoragePrefix + key, str);
};

NS.removeObject = function(key) {
    window.localStorage.removeItem(this.localStoragePrefix + key);
};

NS.loadObject = function(key) {
    var item = window.localStorage.getItem(this.localStoragePrefix + key);
    if(item) return JSON.parse(item);
    return null;
};
NS.loadString = function(key) {
    var item = window.localStorage.getItem(this.localStoragePrefix + key);
    if(item) return item;
    return null;
};

NS.storageKeys = function() {
    var keys = [];
    for(var i in window.localStorage) {
        if(i.substr(0, NS.localStoragePrefix.length) == NS.localStoragePrefix) {
            var key = i.substr(NS.localStoragePrefix.length);
            keys.push(key)
        }
    }
    return keys;
};

window.addEventListener("storage", function(e) {
    if(!e) e = window.event;
    if(e.key.substr(0, NS.localStoragePrefix.length) == NS.localStoragePrefix) {
        var key = e.key.substr(NS.localStoragePrefix.length);
        NS.raiseEvent("storage", {
            key: key,
            old_value: JSON.parse(e.oldValue),
            new_value: JSON.parse(e.newValue),
            url: e.url });
    }
}, false);

// ======== Bindings ========

// Bind HTML elements to values or events.
//   bindButton(selection, event_key)
//   bindToggle(selection, key)
//   bindOption(selection, key)
//   bindText(selection, key, connector)
//   bindSlider(selection, key, connector)
//     element_state = connector.in(value);
//     value = connector.out(element_state);
//   bindElement(selection, key, transformer), HTML = transformer(value);

NS.bindButton = function(selection, event) {
    selection.click(function() {
        NS.raiseEvent(event);
    });
    return NS;
};

NS.bindToggle = function(selection, key) {
    var state = NS.getValue(key);
    if(state) selection.addClass("active");
    else selection.removeClass("active");
    selection.click(function() {
        state = !state;
        NS.setValue(key, state, true);
    });
    NS.addValueListener(key, function(new_state) {
        state = new_state;
        if(state) selection.addClass("active");
        else selection.removeClass("active");
    });
    return NS;
};

NS.bindOption = function(selection, key, cls) {
    if(!cls) cls = "active";
    selection.removeClass(cls);
    selection.filter(".option-" + NS.getValue(key)).addClass(cls);
    selection.click(function() {
        var cls = $(this).attr("class");
        if(!cls) return;
        var option = cls.match(/option-([0-9a-zA-Z\_\-\.]+)/)[1];
        NS.setValue(key, option, true);
    });
    NS.addValueListener(key, function(state) {
        selection.removeClass(cls);
        selection.filter(".option-" + state).addClass(cls);
    });
    return NS;
};

NS.makeOption = function(selection, value, cls) {
    if(!cls) cls = "active";
    selection.removeClass(cls);
    selection.filter(".option-" + value).addClass(cls);
    var rr = {
        value: value,
        setValue: function(state) {
            selection.removeClass(cls);
            selection.filter(".option-" + state).addClass(cls);
            this.value = state;
        }
    };
    selection.click(function() {
        var option = $(this).attr("class").match(/option-([0-9a-zA-Z\_\-\.]+)/)[1];
        rr.setValue(option);
    });
    return rr;
};

NS.bindText = function(selection, key, connector) {
    if(!connector) connector = { };
    var fin = connector.filter_in ? connector.filter_in : function(x) { return x; };
    var fout = connector.filter_out ? connector.filter_out : function(x) { return x; };
    selection.val(NS.getValue(key));
    var forbid_this = false;
    selection.change(function() {
        forbid_this = true;
        NS.setValue(key, fout($(selection).val()), true);
        forbid_this = false;
    });
    NS.addValueListener(key, function(value) {
        if(forbid_this) return;
        selection.val(fin(value));
    });
    return NS;
};

NS.bindSlider = function(selection, key, continuous, connector) {
    if(!connector) connector = { };
    var fin = connector.filter_in ? connector.filter_in : function(x) { return x; };
    var fout = connector.filter_out ? connector.filter_out : function(x) { return x; };
    selection.each(function() {
        var slider = this;
        slider.sliderEvent = function(val, is_up) {
            if(continuous || is_up) {
                // changed.
                NS.setValue(key, fout(slider.sliderValue));
            }
        };
    });
    var update = function(value) {
        selection.each(function() {
            this.sliderSet(fin(value));
        });
    };
    update(NS.getValue(key));
    NS.addValueListener(key, update);
};

NS.bindElement = function(selection, key, transformer) {
    var rep = transformer ? transformer(NS.getValue(key)) : NS.getValue(key);
    selection.html(rep);
    NS.addValueListener(key, function(value) {
        var rep = transformer ? transformer(value) : value;
        selection.html(rep);
    });
    return NS;
};

// ======== i18n Support ========

var langs = { };

NS.language = function(name) {
    if(langs[name] == undefined) {
        langs[name] = {
            // key: string
            add: function(data) {
                for(var key in data) {
                    this[key] = data[key];
                    if(!langs._[key]) {
                        langs._[key] = data[key];
                    }
                }
                return this;
            },
            set: function() {
                NS.switchLanguage(name);
                return this;
            }
        };
    }
    return langs[name];
};

NS.str = function(key) {
    var k = langs[NS.currentLanguage][key];
    if(!k) {
        if(langs["_"][key]) return langs["_"][key];
        return "@.@";
    }
    else return k;
};

NS.switchLanguage = function(name) {
    NS.currentLanguage = name;
    $("*[i18n]").each(function() {
        var key = $(this).attr("i18n");
        $(this).html(NS.str(key));
    });
};

NS.language("_");
NS.language("en");
NS.language("zh");
NS.currentLanguage = "en";

NS.getTemplate = function(template_name) {
    var ht = $("#" + template_name + "-" + NS.currentLanguage).html();
    if(ht) return ht;
    //console.log("Warning: template '" + template_name + "-" + NS.currentLanguage + "' not found.");
    return $("#" + template_name).html();
};
NS.render = function(template_name, object) {
    var template = NS.getTemplate(template_name);
    if(template) {
        template = template.replace(/\{\> *([0-9a-zA-Z\-\_\.]+) *\<\}/g, function(g, a) {
            return '<span i18n="' + a + '">' + NS.str(a) + '</span>';
        });
        return Mustache.render(template, object);
    }
    return "";
};

NS.Vector = function(x, y) {
    if(!x) x = 0;
    if(!y) y = 0;
    this.x = x;
    this.y = y;
};
NS.Vector.getVector = function(p) {
	return new NS.Vector(p.x, p.y);
};
NS.Vector.prototype = {
	clone: function() {
		return new NS.Vector(this.x, this.y);
	},
    add: function(v) {
        return new NS.Vector(v.x + this.x, v.y + this.y);
    },
    sub: function(v) {
        return new NS.Vector(this.x - v.x, this.y - v.y);
    },
    dot: function(v) {
        return this.x * v.x + this.y * v.y;
    },
    scale: function(s) {
        return new NS.Vector(this.x * s, this.y * s);
    },
    cross: function(v) {
        return this.x * v.y - this.y * v.x;
    },
    length: function() { return Math.sqrt(this.x * this.x + this.y * this.y); },
    normalize: function() {
        var l = this.length();
        return new NS.Vector(this.x / l, this.y / l);
    },
    distance2: function(p) {
        return (this.x - p.x) * (this.x - p.x) + (this.y - p.y) * (this.y - p.y);
    },
    distance: function(p) {
        return Math.sqrt(this.distance2(p));
    },
    rotate: function(angle) {
        return new NS.Vector(this.x * Math.cos(angle) - this.y * Math.sin(angle),
                             this.x * Math.sin(angle) + this.y * Math.cos(angle));
    },
    rotate90: function() {
        return new NS.Vector(-this.y, this.x);
    },
	angle: function() {
		var l = this.length();
		if (l == 0) return NaN;
		var a = Math.acos(this.x / l);
		if (this.y < 0) a = -a;
		return a;
	},
    interp: function(v, t) {
        return new NS.Vector(this.x + (v.x - this.x) * t,
                             this.y + (v.y - this.y) * t);
    },
    callMoveTo: function(g) { g.moveTo(this.x, this.y); },
    callLineTo: function(g) { g.lineTo(this.x, this.y); },
    serialize: function() {
        return { de: "Vector", x: this.x, y: this.y };
    }
};

NS.array_unique = function(array) {
    var a = [];
    var l = array.length;
    for(var i = 0; i < l; i++) {
        var found = false;
        for(var j = i + 1; j < l; j++) {
            if(array[i] === array[j]) {
                found = true;
                break;
            }
        }
        if(!found) a.push(array[i]);
    }
    return a;
};

NS.insidePolygon = function(poly, pt) {
    for(var c = false, i = -1, l = poly.length, j = l - 1; ++i < l; j = i) {
       if ( ((poly[i].y <= pt.y && pt.y < poly[j].y) || (poly[j].y <= pt.y && pt.y < poly[i].y))
        && (pt.x < (poly[j].x - poly[i].x) * (pt.y - poly[i].y) / (poly[j].y - poly[i].y) + poly[i].x) )
         (c = !c);
     }
    return c;
};

(function() {
// Convex Hull
// Copyright 2001, softSurfer (www.softsurfer.com)
// This code may be freely used and modified for any purpose
// providing that this copyright notice is included with it.
// SoftSurfer makes no warranty for this code, and cannot be held
// liable for any real or imagined damage resulting from its use.
// Users of this code must verify correctness for their application.
// http://softsurfer.com/Archive/algorithm_0203/algorithm_0203.htm
// Assume that a class is already given for the object:
//    Point with coordinates {float x, y;}
//===================================================================

// isLeft(): tests if a point is Left|On|Right of an infinite line.
//    Input:  three points P0, P1, and P2
//    Return: >0 for P2 left of the line through P0 and P1
//            =0 for P2 on the line
//            <0 for P2 right of the line

function sortPointX(a, b) {
    return a.x - b.x;
}
function sortPointY(a, b) {
    return a.y - b.y;
}

function isLeft(P0, P1, P2) {
    return (P1.x - P0.x) * (P2.y - P0.y) - (P2.x - P0.x) * (P1.y - P0.y);
}
//===================================================================

// chainHull_2D(): A.M. Andrew's monotone chain 2D convex hull algorithm
// http://softsurfer.com/Archive/algorithm_0109/algorithm_0109.htm
//
//     Input:  P[] = an array of 2D points
//                   presorted by increasing x- and y-coordinates
//             n = the number of points in P[]
//     Output: H[] = an array of the convex hull vertices (max is n)
//     Return: the number of points in H[]


function chainHull_2D(P, n, H) {
    // the output array H[] will be used as the stack
    var bot = 0,
    top = (-1); // indices for bottom and top of the stack
    var i; // array scan index
    // Get the indices of points with min x-coord and min|max y-coord
    var minmin = 0,
        minmax;

    var xmin = P[0].x;
    for (i = 1; i < n; i++) {
        if (P[i].x != xmin) {
            break;
        }
    }

    minmax = i - 1;
    if (minmax == n - 1) { // degenerate case: all x-coords == xmin
        H[++top] = P[minmin];
        if (P[minmax].y != P[minmin].y) // a nontrivial segment
            H[++top] = P[minmax];
        H[++top] = P[minmin]; // add polygon endpoint
        return top + 1;
    }

    // Get the indices of points with max x-coord and min|max y-coord
    var maxmin, maxmax = n - 1;
    var xmax = P[n - 1].x;
    for (i = n - 2; i >= 0; i--) {
        if (P[i].x != xmax) {
            break;
        }
    }
    maxmin = i + 1;

    // Compute the lower hull on the stack H
    H[++top] = P[minmin]; // push minmin point onto stack
    i = minmax;
    while (++i <= maxmin) {
        // the lower line joins P[minmin] with P[maxmin]
        if (isLeft(P[minmin], P[maxmin], P[i]) >= 0 && i < maxmin) {
            continue; // ignore P[i] above or on the lower line
        }

        while (top > 0) { // there are at least 2 points on the stack
            // test if P[i] is left of the line at the stack top
            if (isLeft(H[top - 1], H[top], P[i]) > 0) {
                break; // P[i] is a new hull vertex
            }
            else {
                top--; // pop top point off stack
            }
        }

        H[++top] = P[i]; // push P[i] onto stack
    }

    // Next, compute the upper hull on the stack H above the bottom hull
    if (maxmax != maxmin) { // if distinct xmax points
        H[++top] = P[maxmax]; // push maxmax point onto stack
    }

    bot = top; // the bottom point of the upper hull stack
    i = maxmin;
    while (--i >= minmax) {
        // the upper line joins P[maxmax] with P[minmax]
        if (isLeft(P[maxmax], P[minmax], P[i]) >= 0 && i > minmax) {
            continue; // ignore P[i] below or on the upper line
        }

        while (top > bot) { // at least 2 points on the upper stack
            // test if P[i] is left of the line at the stack top
            if (isLeft(H[top - 1], H[top], P[i]) > 0) {
                break;  // P[i] is a new hull vertex
            }
            else {
                top--; // pop top point off stack
            }
        }

        if (P[i].x == H[0].x && P[i].y == H[0].y) {
            return top + 1; // special case (mgomes)
        }

        H[++top] = P[i]; // push P[i] onto stack
    }

    if (minmax != minmin) {
        H[++top] = P[minmin]; // push joining endpoint onto stack
    }

    return top + 1;
}
NS.convexHull = function(points) {
    var H = [];
    var pts = [];
    for(var i = 0; i < points.length; i++) pts.push(points[i]);
    pts.sort(sortPointY);
    pts.sort(sortPointX);
    var n = chainHull_2D(pts, points.length, H);
    H = H.slice(0, n);
    return H;
};
})();

NS.affineTransform = function(matrix) {
    if(!matrix) matrix = [ 1, 0, 0, 0, 1, 0, 0, 0, 1 ];
    this.m = matrix;
    /*
     0 1 2
     3 4 5
     6 7 8
    */
};

NS.makeTransform = {
    scale: function(sx, sy) {
        return new NS.affineTransform([
            sx,  0,  0,
             0, sy,  0,
             0,  0,  1
        ]);
    },
    translate: function(tx, ty) {
        return new NS.affineTransform([
            1,  0, tx,
            0,  1, ty,
            0,  0,  1
        ]);
    },
    rotate: function(radian) {
        var c = Math.cos(radian), s = Math.sin(radian);
        return new NS.affineTransform([
            c,  -s,  0,
            s,  c,  0,
            0,  0,  1
        ]);
    }
}

NS.affineTransform.prototype = {
    point: function(p) {
        var m = this.m;
        return [m[0] * p.x + m[1] * p.y + m[2],
                m[3] * p.x + m[4] * p.y + m[5]];
    },
    vector: function(v) {
        var m = this.m;
        return [m[0] * v.x + m[1] * v.y,
                m[3] * v.x + m[4] * v.y];
    },
    point_h: function(p) {
        var m = this.m;
        return [m[0] * p[0] + m[1] * p[1] + m[2] * p[2],
                m[3] * p[0] + m[4] * p[1] + m[5] * p[2],
                m[6] * p[0] + m[7] * p[1] + m[8] * p[2]];
    },
    // A.concat(B).point(p) = A.point(B.point(p)).
    concat: function(tr) {
        var m1 = this.m;
        var m2 = tr.m;
        return new NS.affineTransform([
            m1[0] * m2[0] + m1[1] * m2[3] + m1[2] * m2[6],
            m1[0] * m2[1] + m1[1] * m2[4] + m1[2] * m2[7],
            m1[0] * m2[2] + m1[1] * m2[5] + m1[2] * m2[8],
            m1[3] * m2[0] + m1[4] * m2[3] + m1[5] * m2[6],
            m1[3] * m2[1] + m1[4] * m2[4] + m1[5] * m2[7],
            m1[3] * m2[2] + m1[4] * m2[5] + m1[5] * m2[8],
            m1[6] * m2[0] + m1[7] * m2[3] + m1[8] * m2[6],
            m1[6] * m2[1] + m1[7] * m2[4] + m1[8] * m2[7],
            m1[6] * m2[2] + m1[7] * m2[5] + m1[8] * m2[8]
        ]);
    },
    svd: function() {
        var m = this.m;
        var k = [[m[0], m[1]], [m[3], m[4]]];
        var s = numeric.svd(k);
        var S = Math.sqrt((s.S[0] * s.S[0] + s.S[1] * s.S[1]) / 2);
        var U = s.U;
        var V = s.V;
        // VT
        var tmp = V[0][1];
        V[0][1] = V[1][0];
        V[1][0] = tmp;
        return new NS.affineTransform([
            S * U[0][0] * V[0][0] + S * U[0][1] * V[1][0],
            S * U[0][0] * V[0][1] + S * U[0][1] * V[1][1], m[2],
            S * U[1][0] * V[0][0] + S * U[1][1] * V[1][0],
            S * U[1][0] * V[0][1] + S * U[1][1] * V[1][1], m[5],
            0, 0, 1
        ]);
    },
    det: function() {
        var m = this.m;
        return m[0] * m[4] - m[1] * m[3];
    }
};

NS.lineCross = function(p1, d1, p2, d2) {
    // ( p1 + t d1 - p2 )  dot d2.rotate90 == 0
    // t = (p2 - p1).dot(d2.rotate90) / d1.dot(d2.rotate90);
    var rd2 = { x: -d2.y, y: d2.x };
    var b = d1.x * rd2.x + d1.y * rd2.y;
    var a = (p2.x - p1.x) * rd2.x + (p2.y - p1.y) * rd2.y;
    if(Math.abs(b) < 1e-5) return null;
    var t = a / b;
    return {
        x: p1.x + t * d1.x,
        y: p1.y + t * d1.y
    };
};

NS.distance = function(x0, y0, x1, y1) {
    return Math.sqrt((x0 - x1) * (x0 - x1) + (y0 - y1) * (y0 - y1));
};
NS.distance2 = function(a,b) {
    return Math.sqrt((a.x - b.x) * (a.x - b.x) + (a.y - b.y) * (a.y - b.y));
};

NS.pointLineSegmentDistance = function(pt, p1, p2) {
    var d = p2.sub(p1);
    var t = pt.sub(p1).dot(d) / d.dot(d);
    if(t < 0)
        return pt.distance(p1);
    if(t > 1)
        return pt.distance(p2);
    var pfoot = p1.interp(p2, t);
    return pt.distance(pfoot);
};

// width, height may be negative.
NS.Rectangle = function(x0, y0, width, height, angle) {
    if(!angle) angle = 0;
    this.x0 = x0; this.y0 = y0;
    this.width = width;
    this.height = height;
    this.angle = angle;
};

NS.Rectangle.prototype = {
    clone: function() {
        return new NS.Rectangle(this.x0, this.y0, this.width, this.height, this.angle);
    },
    map: function(x, y) {
        var dx = x - this.x0;
        var dy = y - this.y0;
        var p = new NS.Vector(dx, dy).rotate(-this.angle);
        return p;
    },
    inside: function(x, y) {
        var p = this.map(x, y);
        return Math.abs(p.x) < Math.abs(this.width / 2) &&
               Math.abs(p.y) < Math.abs(this.height / 2);
    },
    // 1 -- 2
    // | -> |
    // 4 -- 3
    corner1: function() {
        var p = new NS.Vector(-this.width / 2, -this.height / 2).rotate(this.angle);
        return {
            x: this.x0 + p.x,
            y: this.y0 + p.y
        };
    },
    corner2: function() {
        var p = new NS.Vector(this.width / 2, -this.height / 2).rotate(this.angle);
        return {
            x: this.x0 + p.x,
            y: this.y0 + p.y
        };
    },
    corner3: function() {
        var p = new NS.Vector(this.width / 2, this.height / 2).rotate(this.angle);
        return {
            x: this.x0 + p.x,
            y: this.y0 + p.y
        };
    },
    corner4: function() {
        var p = new NS.Vector(-this.width / 2, this.height / 2).rotate(this.angle);
        return {
            x: this.x0 + p.x,
            y: this.y0 + p.y
        };
    },
    getCorners: function() {
        return [ this.corner1(), this.corner2(), this.corner3(), this.corner4() ];
    }
};

NS.Color = function(r, g, b, a) {
    this.r = parseFloat(r);
    this.g = parseFloat(g);
    this.b = parseFloat(b);
    this.a = (a !== undefined) ? parseFloat(a) : 1;
};
NS.parseColorChroma = function(c, a) {
    var rgb = c.rgb();
    return new NS.Color(rgb[0], rgb[1], rgb[2], a);
};
NS.parseColorINT = function(s) {
    var v = s.split(",");
    var r = parseInt(v[0]);
    var g = parseInt(v[1]);
    var b = parseInt(v[2]);
    return new NS.Color(r, g, b);
};
NS.parseColorHEX = function(s) {
    var hex2int = {
        "0": 0, "1": 1, "2": 2, "3": 3, "4": 4, "5": 5, "6": 6, "7": 7, "8": 8, "9": 9,
        "a": 10, "b": 11, "c": 12, "d": 13, "e": 14, "f": 15,
        "A": 10, "B": 11, "C": 12, "D": 13, "E": 14, "F": 15
    };
    if(s.length == 6) {
        var r = hex2int[s[0]] * 16 + hex2int[s[1]];
        var g = hex2int[s[2]] * 16 + hex2int[s[3]];
        var b = hex2int[s[4]] * 16 + hex2int[s[5]];
        return new NS.Color(r, g, b);
    } else {
        var r = hex2int[s[0]] * 16 + hex2int[s[0]];
        var g = hex2int[s[1]] * 16 + hex2int[s[1]];
        var b = hex2int[s[2]] * 16 + hex2int[s[2]];
        return new NS.Color(r, g, b);
    }
};
NS.parseColorINTA = function(s) {
    var v = s.split(",");
    var r = parseInt(v[0]);
    var g = parseInt(v[1]);
    var b = parseInt(v[2]);
    var a = parseFloat(v[3]);
    return new NS.Color(r, g, b, a);
};
NS.Color.prototype = {
    toINT : function() {
        return parseInt(this.r) + "," + parseInt(this.g) + "," + parseInt(this.b);
    },
    toINTA : function() {
        return parseInt(this.r) + "," + parseInt(this.g) + "," + parseInt(this.b) + "," + this.a.toFixed(3);
    },
    toRGB : function() {
        return "rgb(" + this.toINT() + ")";
    },
    toRGBA : function(alpha) {
        if(alpha === undefined) alpha = 1;
        return "rgba(" + this.toINT() + "," + (this.a * alpha).toFixed(3) + ")";
    },
    toChroma: function() {
        return chroma.color(this.r, this.g, this.b);
    },
    interp: function(dest, s) {
        return new NS.Color(
            this.r + s * (dest.r - this.r),
            this.g + s * (dest.g - this.g),
            this.b + s * (dest.b - this.b),
            this.a + s * (dest.a - this.a)
        );
    },
    interpLab: function(dest, s) {
        var scale = chroma.scale([ this.toChroma(), dest.toChroma() ]);
        var r = NS.parseColorChroma(scale.mode('lab')(s));
        r.a = this.a + s * (dest.a - this.a);
        return r;
    },
    clone: function() {
        return new NS.Color(this.r, this.g, this.b, this.a);
    },
    serialize: function() {
        return { de: "Color", r: this.r, g: this.g, b: this.b, a: this.a };
    }
};

NS.parseCSV = function(string) {
    var lines = string.replace("\r", "").split("\n");
    var filtered_lines = [];
    for(var i = 0; i < lines.length; i++) {
        lines[i] = lines[i].trim();
        if(lines[i].length > 0) filtered_lines.push(lines[i]);
    }
    var parse_line = function(l) {
        var r = l.split(",").map(function(x) {
            return x.trim();
        });;
        return r;
    };
    var data = filtered_lines.slice(1).map(parse_line);
    var head = parse_line(filtered_lines[0]);
    return {
        data: data,
        head: head
    };
};

NS.deepClone = function(myObj) {
    if(myObj == null || myObj == undefined) return myObj;
    // If we have clone method, call it.
    if(myObj.clone) return myObj.clone();
    // Not object type, return itself.
    if(typeof(myObj) != 'object') return myObj;
    if(myObj instanceof Array) {
        var r = [];
        for(var i = 0; i < myObj.length; i++)
            r[i] = NS.deepClone(myObj[i]);
        return r;
    } else {
        var myNewObj = new Object();
        for(var i in myObj) myNewObj[i] = NS.deepClone(myObj[i]);
        return myNewObj;
    }
};

NS.wrapText = function(context, text, x, y, maxWidth, lineHeight) {
	var words = text.split(' ');
	var line = '';

	for(var n = 0; n < words.length; n++) {
		var testLine = line + words[n] + ' ';
		var metrics = context.measureText(testLine);
		var testWidth = metrics.width;
		if(testWidth > maxWidth) {
			context.fillText(line, x, y);
			line = words[n] + ' ';
			y += lineHeight;
		}
		else {
			line = testLine;
		}
	}
	context.fillText(line, x, y);
	if (line !== '') y += lineHeight;
	return y;
};

var tmp_canvas = document.createElement("canvas");
NS.measureText = function(text, font) {
    var tc = tmp_canvas.getContext("2d");
    tc.font = font;
    return tc.measureText(text);
};

NS.longestString = function(strs) {
    var slong = null;
    for(var i = 0; i < strs.length; i++) {
        var s = strs[i];
        if(!s) continue;
        if(slong == null || s.length > slong.length) slong = s;
    }
    return slong;
};

NS.trackMouseEvents = function(elem, handlers) {
    var move_handler = function(e) {
        if(handlers.move) handlers.move(e);
    };
    var up_handler = function(e) {
        if(handlers.move) $(window).unbind("mousemove", move_handler);
        $(window).unbind("mouseup", up_handler);
        if(handlers.up) handlers.up(e);
    };
    elem.mousedown(function(e) {
        if(handlers.move) $(window).bind("mousemove", move_handler);
        $(window).bind("mouseup", up_handler);
        if(handlers.down) handlers.down(e);
    });
}

Array.prototype.forEachReversed = function(f) {
    var i = this.length;
    while(i--) {
        f(this[i]);
    };
};

NS.forEachInObject = function(obj, f) {
    for(var i in obj) {
        f(i, obj[i]);
    }
};

NS.extend = function(base, sub, funcs) {
    function inheritance() { };
    inheritance.prototype = base.prototype;
    sub.prototype = new inheritance();
    sub.prototype.constructor = sub;
    sub._base_constructor = base;
    if(funcs) {
        for(var i in funcs) {
            if(i == "$auto_properties") {
                funcs[i].forEach(function(p) {
                    if(funcs["$auto_properties_after"]) {
                        var fafter = funcs["$auto_properties_after"];
                        sub.prototype["_set_" + p] = function(val) {
                            this[p] = val;
                            fafter.call(this, p, val);
                            NS.raiseObjectEvent(this, "set:" + p, val);
                            return val;
                        };
                    } else {
                        sub.prototype["_set_" + p] = function(val) {
                            this[p] = val;
                            NS.raiseObjectEvent(this, "set:" + p, val);
                            return val;
                        };
                    }
                    sub.prototype["_get_" + p] = function() {
                        return this[p];
                    };
                });
            } else {
                sub.prototype[i] = funcs[i];
            }
        }
    }
    return sub;
};

NS.implement = function(base, sub) {
    for(var k in base.prototype) {
        sub.prototype[k] = base.prototype[k];
    }
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

// ### Generate UUID

// UUID is used for object id.
var guid_chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890abcdefghijklmnopqrstuvwxyz~!@#$%^&*()_+=-{}][:;?><,./|";
NS.generateUUID = function(prefix) {
    // Current format is like `prefix-xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx`
    var r = 'xxxxxxxxxx'.replace(/x/g, function(c) {
        var r = Math.random() * guid_chars.length | 0;
        return guid_chars[r];
    });
    if(prefix) return prefix + r;
    return r;
};

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

NS.isNull = function(val) {
    return val === null || val === undefined;
};

NS.notNull = function(val) {
    return val !== null && val !== undefined;
};

NS.strings = function(key) {
    return DATA_Strings[key];
};

Math.log10 = function(v) {
    return Math.log(v) / 2.302585092994046;
};

Math.exp10 = function(v) {
    return Math.pow(10, v);
};

return NS;

})(); // main nested function.
