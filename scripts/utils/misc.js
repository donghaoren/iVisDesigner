NS.getQuery = function(name) {
    return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)')
             .exec(location.search)||[,""])[1]
             .replace(/\+/g, '%20'))||null;
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

NS.isNull = function(val) {
    return val === null || val === undefined;
};

NS.notNull = function(val) {
    return val !== null && val !== undefined;
};

NS.strings = function(key) {
    return DATA_Strings[key];
};

NS.fillDefault = function(obj, defaults) {
    for(var key in defaults) {
        if(obj[key] === undefined) obj[key] = defaults[key];
    }
};
