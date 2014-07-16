//. iVisDesigner - File: scripts/utils/misc.js
//. Copyright 2013-2014 Donghao Ren
//. University of California, Santa Barbara, Peking University
//. See LICENSE.md for more information.

NS.getQuery = function(name) {
    return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)')
             .exec(location.search)||[,""])[1]
             .replace(/\+/g, '%20'))||null;
};
NS.buildQuery = function(params) {
    if(!params) return "";
    var params_array = [];
    for(var key in params) {
        params_array.push(encodeURIComponent(key) + "=" + encodeURIComponent(params[key]));
    }
    return params_array.join("&");
};

var tmp_canvas = document.createElement("canvas");
NS.measureText = function(text, font) {
    var tc = tmp_canvas.getContext("2d");
    tc.font = font;
    return tc.measureText(text);
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
};

NS.attachMouseEvents = function(handlers) {
    var move_handler = function(e) {
        if(handlers.move) handlers.move(e);
    };
    var up_handler = function(e) {
        if(handlers.move) $(window).unbind("mousemove", move_handler);
        $(window).unbind("mouseup", up_handler);
        if(handlers.up) handlers.up(e);
    };
    if(handlers.move) $(window).bind("mousemove", move_handler);
    $(window).bind("mouseup", up_handler);
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

NS.startsWith = function(str, start) {
    return str.substr(0, start.length) == start;
};

NS.ObjectSet = function() {
    this.set = { };
};

NS.ObjectSet.prototype.add = function(obj) {
    if(!obj.uuid) obj.uuid = NS.generateUUID();
    this.set[obj.uuid] = true;
};

NS.ObjectSet.prototype.unionWith = function(another) {
    for(var k in another.set) {
        if(another.set.hasOwnProperty(k)) this.set[k] = true;
    }
};

NS.ObjectSet.prototype.subtractWith = function(another) {
    for(var k in another.set) {
        if(another.set.hasOwnProperty(k)) delete this.set[k];
    }
};

NS.ObjectSet.prototype.union = function(another) {
    var r = new NS.ObjectSet();
    r.unionWith(this);
    r.unionWith(another);
    return r;
};

NS.ObjectSet.prototype.subtract = function(another) {
    var r = new NS.ObjectSet();
    r.unionWith(this);
    r.subtractWith(another);
    return r;
};

NS.printNumber = function(num) {
    if(Math.abs(num) < 1e10) {
        if(num == Math.round(num)) return num.toString(); // is a integer.
        return num.toPrecision(6);
    } else {
        return num.toPrecision(6);
    }
};

NS.fillDefault = function(obj, defaults) {
    for(var key in defaults) {
        if(obj[key] === undefined) obj[key] = defaults[key];
    }
};
