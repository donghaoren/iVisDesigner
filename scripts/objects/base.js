// iVisDesigner
// Author: Donghao Ren, PKUVIS, Peking University, 2013.04
// See LICENSE.txt for copyright information.

// scripts/objects/base.js
// Base objects.

(function() {

var Plain = function(obj) {
    this.obj = obj;
    this.type = "plain";
};
var plain_get = function() { return this.obj; };
Plain.prototype = new IV.objects.BaseObject({
    can: function(cap) {
        if(cap == "get-point") return true;
        if(cap == "get-number") return true;
        if(cap == "get-style") return true;
    },
    get: plain_get,
    clone: function() {
        return new Plain(IV.deepClone(this.obj));
    }
});

IV.objects.Plain = Plain;
IV.objects.Number = Plain;
IV.objects.Style = Plain;
IV.objects.Point = Plain;

// Composite
var Composite = function(obj, wrap) {
    // Copy all fields.
    var fields = { };
    for(var i in obj) {
        if(i[0] != "_") {
            fields[i] = obj[i];
            if(wrap) { fields[i] = new IV.objects.Plain(fields[i]); }
        }
    }
    this.fields = fields;
    this.type = "Composite";
};
Composite.prototype = new IV.objects.BaseObject({
    get: function(context) {
        var obj = { };
        for(var i in this.fields) {
            obj[i] = this.fields[i].get(context);
        }
        return obj;
    },
    clone: function() {
        var obj = { };
        for(var i in this.fields) {
            obj[i] = this.fields[i].clone();
        }
        return new Composite(obj);
    }
});
IV.objects.Composite = Composite;

var CompositeColorAlpha = function(color, alpha) {
    this.color = color;
    this.alpha = alpha;
    this.type = "CompositeColorAlpha";
};
CompositeColorAlpha.prototype = new IV.objects.BaseObject({
    get: function(context) {
        var c = this.color.get(context);
        c.a = this.alpha.get(context);
        return new IV.Color(c.r, c.g, c.b, c.a);
    },
    clone: function() {
        return new CompositeColorAlpha(this.color.clone(), this.alpha.clone());
    }
});
IV.objects.CompositeColorAlpha = CompositeColorAlpha;

// Linear
var NumberLinear = function(path, min, max) {
    this.path = path;
    this.min = min;
    this.max = max;
    this.type = "NumberLinear";
};
NumberLinear.prototype = new IV.objects.BaseObject({
    get: function(context) {
        var value = context.get(this.path);
        var s = context.getSchema(this.path);
        if(s.max !== undefined && s.min !== undefined)
            value = (value - s.min) / (s.max - s.min);
        return this.min + value * (this.max - this.min);
    },
    clone: function() {
        return new NumberLinear(this.path, this.min, this.max);
    }
});
IV.objects.NumberLinear = NumberLinear;

})();
