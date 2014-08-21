//. iVisDesigner - File: scripts/node/wrappers.js
//. Copyright 2013-2014 Donghao Ren
//. University of California, Santa Barbara, Peking University
//. See LICENSE.md for more information.
var allosphere = require("../nodejs/allosphere/build/Release/node_allosphere");
allosphere.initialize();
var d3 = require("d3");
var graphics = require("../nodejs/allosphere/build/Release/node_graphics");

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

var CanvasRenderingContext2D = function(surface) {
    this.__surface = surface;
    this.__g = new graphics.GraphicalContext2D(this.__surface);
    this.__paint = this.__g.paint();
};

(function() {

    var _p = CanvasRenderingContext2D.prototype;

    _p.__setColor = function(rgba) {
        var t = rgba.split("(")[1].split(")")[0];
        var s = t.split(",").map(parseFloat);
        this.__paint.setColor(s[0], s[1], s[2], s[3]);
    };

    _p.clearRect = function(x, y, w, h) {
        this.__g.clear(255, 255, 255, 1);
    };

    _p.save = function() {
        this.__g.push();
    };

    _p.restore = function() {
        this.__g.pop();
    };

    _p.ivSave = _p.save;
    _p.ivRestore = _p.restore;

    _p.transform = function(a, b, c, d, e, f) {
        this.__g.concatTransform(a, b, c, d, e, f);
    };

    _p.ivSetTransform = function(tr) {
        this.__g.setTransform(tr.m[0], tr.m[1], tr.m[3], tr.m[4], tr.m[2], tr.m[5]);
    };

    _p.ivAppendTransform = function(tr) {
        console.log(tr.m[0], tr.m[1], tr.m[3], tr.m[4], tr.m[2], tr.m[5]);
        //this.transform(tr.m[0], tr.m[1], tr.m[3], tr.m[4], tr.m[2], tr.m[5]);
        console.log(this.ivGetTransform());
    };

    CanvasRenderingContext2D.prototype.ivGetTransform = function(tr) {
        var r = this.__g.getTransform();
        return new IV.affineTransform([
            r[0], r[2], r[4],
            r[1], r[3], r[5],
            0, 0, 1
        ]);
    };

    CanvasRenderingContext2D.prototype.ivGetGuideWidth = function() {
        return 1.0 / Math.sqrt(Math.abs(this.ivGetTransform().det()));
    };

    CanvasRenderingContext2D.prototype.ivGuideLineWidth = function(scale) {
        return this.lineWidth = this.ivGetGuideWidth() * (scale !== undefined ? scale : 1);
    };

    CanvasRenderingContext2D.prototype.ivSetFont = function(font_info) {
        var sz = font_info.size ? font_info.size : 12;
        var f = font_info.family ? font_info.family : "Arial";
        this.__paint.setTypeface(f);
        this.__paint.setTextSize(sz);
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
        this.__setColor(this.strokeStyle);
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
        this.__setColor(this.fillStyle);
        if(this.textAlign == "center") {
           this.__paint.setTextAlign(graphics.TEXTALIGN_CENTER);
        } else if(this.textAlign == "right") {
            this.__paint.setTextAlign(graphics.TEXTALIGN_RIGHT);
        } else {
            this.__paint.setTextAlign(graphics.TEXTALIGN_LEFT);
        }
        this.__g.drawText(text, x, y, this.__paint);
    };

    _p.ivStrokeText = _p.strokeText;
    _p.ivFillText = _p.fillText;
    _p.ivMeasureText = _p.measureText;

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
        this.__setColor(this.strokeStyle);
        if(this.lineWidth === undefined) this.lineWidth = 1;
        this.__paint.setStrokeWidth(this.lineWidth);
        this.__g.drawPath(this.__path, this.__paint);
    };
    _p.fill = function() {
        this.__paint.setMode(graphics.PAINTMODE_FILL);
        this.__setColor(this.fillStyle);
        this.__g.drawPath(this.__path, this.__paint);
    };

})();

var IVWrappers = {
    CreateCanvas: function() {
        return new Canvas;
    }
};
