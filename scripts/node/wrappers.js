//. iVisDesigner - File: scripts/node/wrappers.js
//. Copyright 2013-2014 Donghao Ren
//. University of California, Santa Barbara, Peking University
//. See LICENSE.md for more information.

var d3 = require("d3");
var graphics = require("node_graphics");

var IV_Config = {
};

var Canvas = function() {
    this.__setSize(100, 100);
};

Canvas.prototype.__setSize = function(w, h) {
    if(w) this.__width = w;
    if(h) this.__height = h;
    if(this.__width && this.__height) {
        this.__surface = new graphics.Surface2D(w, h);
        this.__context = new CanvasRenderingContext2D(this.__surface);
    }
};

Object.defineProperty(Canvas.prototype, "width", {
    get: function() {
        return this.__surface.width();
    },
    set: function(value) {
        this.__setSize(value, this.height);
    }
});

Object.defineProperty(Canvas.prototype, "height", {
    get: function() {
        return this.__surface.width();
    },
    set: function(value) {
        this.__setSize(this.width, value);
    }
});

Canvas.prototype.getContext = function() {
    return this.__context;
};

Canvas.prototype.savePNG = function(filename) {
    return this.__surface.save(filename);
};

Canvas.prototype.uploadTexture = function() {
    this.__surface.uploadTexture();
};

var CanvasRenderingContext2D = function(surface) {
    this.__surface = surface;
    this.__g = new graphics.GraphicalContext2D(this.__surface);
    this.__paint = this.__g.paint();
    this.__paint_stack = [];
};

(function() {

    var _p = CanvasRenderingContext2D.prototype;

    // TODO: clearRect will clear the entire canvas instead, the parameters won't work.
    _p.clearRect = function(x, y, w, h) {
        this.__g.clear(255, 255, 255, 0);
    };

    _p.save = function() {
        this.__g.save();
        this.__paint_stack.push(this.__paint);
        this.__paint = this.__paint.clone();
    };

    _p.restore = function() {
        this.__g.restore();
        this.__paint = this.__paint_stack.pop();
    };

    _p.transform = function(a, b, c, d, e, f) {
        this.__g.concatTransform(a, b, c, d, e, f);
    };

    _p.setTransform = function(a, b, c, d, e, f) {
        this.__g.setTransform(a, b, c, d, e, f);
    };

    _p.translate = function(x, y) {
        this.__g.translate(x, y);
    };
    _p.rotate = function(r) {
        this.__g.rotate(r);
    };
    _p.scale = function(x, y) {
        this.__g.scale(x, y);
    };

    _p.measureText = function(text) {
        var r = { width: this.__paint.measureText(text) };
        return r;
    };

    _p.strokeRect = function() {
    };

    _p.strokeText = function(text, x, y) {
        this.__paint.setMode(graphics.PAINTMODE_STROKE);
        this.__paint.setColor(this.__strokeColor[0], this.__strokeColor[1], this.__strokeColor[2], this.__strokeColor[3]);
        if(this.textAlign == "center") {
           this.__paint.setTextAlign(graphics.TEXTALIGN_CENTER);
        } else if(this.textAlign == "right") {
            this.__paint.setTextAlign(graphics.TEXTALIGN_RIGHT);
        } else {
            this.__paint.setTextAlign(graphics.TEXTALIGN_LEFT);
        }
        this.__g.drawText(text, x, y, this.__paint);
    };
    _p.fillText = function(text, x, y) {
        this.__paint.setMode(graphics.PAINTMODE_FILL);
        this.__paint.setColor(this.__fillColor[0], this.__fillColor[1], this.__fillColor[2], this.__fillColor[3]);
        if(this.textAlign == "center") {
           this.__paint.setTextAlign(graphics.TEXTALIGN_CENTER);
        } else if(this.textAlign == "right") {
            this.__paint.setTextAlign(graphics.TEXTALIGN_RIGHT);
        } else {
            this.__paint.setTextAlign(graphics.TEXTALIGN_LEFT);
        }
        this.__g.drawText(text, x, y, this.__paint);
    };

    _p.beginPath = function() {
        this.__path = this.__g.path();
    };
    _p.moveTo = function(x, y) {
        this.__path.moveTo(x, y);
    };
    _p.lineTo = function(x, y) {
        this.__path.lineTo(x, y);
    };
    _p.arc = function(x, y, r, a1, a2) {
        this.__path.arc(x, y, r, a1, a2);
    };
    _p.bezierCurveTo = function(c1x, c1y, c2x, c2y, x, y) {
        this.__path.bezierCurveTo(c1x, c1y, c2x, c2y, x, y);
    };
    _p.quadraticCurveTo = function() {
    };
    _p.stroke = function() {
        this.__paint.setMode(graphics.PAINTMODE_STROKE);
        this.__paint.setColor(this.__strokeColor[0], this.__strokeColor[1], this.__strokeColor[2], this.__strokeColor[3]);
        this.__g.drawPath(this.__path, this.__paint);
    };
    _p.fill = function() {
        this.__paint.setMode(graphics.PAINTMODE_FILL);
        this.__paint.setColor(this.__fillColor[0], this.__fillColor[1], this.__fillColor[2], this.__fillColor[3]);
        this.__g.drawPath(this.__path, this.__paint);
    };

    Object.defineProperty(_p, "lineWidth", {
        get: function() {
            return this.__strokeWidth;
        },
        set: function(value) {
            this.__strokeWidth = value;
            this.__paint.setStrokeWidth(this.__strokeWidth);
        }
    });

    var predefined_colors = {
        'black': [ 0, 0, 0, 1 ],
        'white': [ 255, 255, 255, 1 ],
        'gray': [ 128, 128, 128, 1 ]
    };
    var parse_color_string = function(color) {
        if(color === null || color === undefined) return [ 0, 0, 0, 0 ];
        color = color.replace(" ", "").toLowerCase();
        if(predefined_colors[color]) return predefined_colors[color];
        if(color.substr(0, 4) == "rgba") {
            var t = color.split("(")[1].split(")")[0];
            var s = t.split(",").map(parseFloat);
            return s;
        }
        if(color.substr(0, 3) == "rgb") {
            var t = color.split("(")[1].split(")")[0];
            var s = t.split(",").map(parseFloat);
            return [ s[0], s[1], s[2], 1 ];
        }
    };

    // var parse_color_string2 = parse_color_string;
    // parse_color_string = function(s) {
    //     var r = parse_color_string2(s);
    //     return [ 255 - r[0], 255 - r[1], 255, r[3] ];
    // };

    Object.defineProperty(_p, "strokeStyle", {
        get: function() {
            return this.__strokeStyle;
        },
        set: function(value) {
            this.__strokeStyle = value;
            this.__strokeColor = parse_color_string(value);
        }
    });

    Object.defineProperty(_p, "fillStyle", {
        get: function() {
            return this.__fillStyle;
        },
        set: function(value) {
            this.__fillStyle = value;
            this.__fillColor = parse_color_string(value);
        }
    });

    _p.ivSave = function() {
        this.save();
    };

    _p.ivRestore = function() {
        this.restore();
    };

    _p.ivSetTransform = function(tr) {
        this.setTransform(tr.m[0], tr.m[1], tr.m[3], tr.m[4], tr.m[2], tr.m[5]);
    };

    _p.ivAppendTransform = function(tr) {
        this.transform(tr.m[0], tr.m[1], tr.m[3], tr.m[4], tr.m[2], tr.m[5]);
    };

    _p.ivGetTransform = function() {
        var t = this.__g.getTransform();
        return new IV.affineTransform([t[0], t[2], t[4], t[1], t[3], t[5], 0, 0, 1]);
    };

    _p.ivGetGuideWidth = function() {
        return 1.0 / Math.sqrt(Math.abs(this.ivGetTransform().det()));
    };

    _p.ivGuideLineWidth = function(scale) {
        return this.lineWidth = this.ivGetGuideWidth() * (scale !== undefined ? scale : 1);
    };

    _p.ivSetFont = function(font_info) {
        var sz = font_info.size ? font_info.size : 12;
        var f = font_info.family ? font_info.family : "Arial";
        this.__paint.setTextSize(sz);
        this.__paint.setTypeface(f);
    };

    _p.ivMeasureText = function(s) {
        return this.measureText(s);
    };

    _p.ivFillText = function(s, x, y) {
        this.save();
        this.translate(x, y);
        this.scale(1, -1);
        this.fillText(s, 0, 0);
        this.restore();
    };
    _p.ivStrokeText = function(s, x, y) {
        this.save();
        this.translate(x, y);
        this.scale(1, -1);
        this.strokeText(s, 0, 0);
        this.restore();
    };

})();

var IVWrappers = {
    CreateCanvas: function() {
        return new Canvas;
    }
};
