// iVisDesigner
// Author: Donghao Ren, PKUVIS, Peking University, 2013.04
// See LICENSE.txt for copyright information.

// scripts/objects/base.js
// Base objects.

(function() {

// Plain Object.
var Plain = IV.extend(Objects.Object, function(obj) {
    Objects.Object.call(this);
    this.obj = obj;
    this.type = "Plain";
}, {
    can: function(cap) {
        if(cap == "get-point") return true;
        if(cap == "get-number") return true;
        if(cap == "get-style") return true;
    },
    getPath: function() { return new IV.Path(""); },
    getGuidePath: function() { return new IV.Path(""); },
    get: function() { return this.obj; },
    clone: function() {
        return new Plain(IV.deepClone(this.obj));
    }
});

IV.serializer.registerObjectType("Plain", Plain);

Objects.Plain = Plain;
Objects.Number = Plain;
Objects.Style = Plain;
Objects.Point = Plain;

// Composite Object.
var Composite = IV.extend(Objects.Object, function(obj, wrap) {
    Objects.Object.call(this);
    // Copy all fields.
    var fields = { };
    for(var i in obj) {
        if(i[0] != "_") {
            fields[i] = obj[i];
            if(wrap) { fields[i] = new Objects.Plain(fields[i]); }
        }
    }
    this.fields = fields;
    this.type = "Composite";
}, {
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
Objects.Composite = Composite;

// Composite Color and Alpha.
var CompositeColorAlpha = IV.extend(Objects.Object, function(color, alpha) {
    Objects.Object.call(this);
    this.color = color;
    this.alpha = alpha;
    this.type = "CompositeColorAlpha";
}, {
    get: function(context) {
        var c = this.color.get(context);
        c.a = this.alpha.get(context);
        return new IV.Color(c.r, c.g, c.b, c.a);
    },
    clone: function() {
        return new CompositeColorAlpha(this.color.clone(), this.alpha.clone());
    }
});
Objects.CompositeColorAlpha = CompositeColorAlpha;

// Point Offset.
var PointOffset = IV.extend(Objects.Object, function(point, offset) {
    Objects.Object.call(this);
    this.offset = offset;
    this.point = point;
    this.path = point.path;
    this.type = "PointOffset";
}, {
    get: function(context) {
        var pt = this.point.getPoint(context);
        return pt.add(this.offset);
    },
    getPath: function() {
        return this.point.getPath();
    },
    can: function(cap) {
        if(cap == "get-point") return true;
        return false;
    },
    clone: function() {
        return new PointOffset(this.point, this.offset);
    }
});
Objects.PointOffset = PointOffset;
IV.serializer.registerObjectType("PointOffset", PointOffset);

// Linear Mapping.
var NumberLinear = IV.extend(Objects.Object, function(path, num1, num2, min, max) {
    Objects.Object.call(this);
    this.path = path;
    this.num1 = num1;
    this.num2 = num2;
    this.min = min;
    this.max = max;
    this.type = "NumberLinear";
}, {
    get: function(context) {
        if(!this.path) return null;
        var value = context.get(this.path).val();
        if(value === null) return null;
        if(this.max !== undefined && this.min !== undefined) {
            if(this.mapping == "logarithmic")
                value = (Math.log(value) - Math.log(this.min)) / (Math.log(this.max) - Math.log(this.min));
            else
                value = (value - this.min) / (this.max - this.min);
        }
        return this.num1 + value * (this.num2 - this.num1);
    },
    clone: function() {
        return new NumberLinear(this.path, this.num1, this.num2, this.min, this.max);
    }
});
Objects.NumberLinear = NumberLinear;
IV.serializer.registerObjectType("NumberLinear", NumberLinear);

// Color Linear Mapping.
var ColorLinear = IV.extend(Objects.Object, function(path, color1, color2, min, max) {
    Objects.Object.call(this);
    this.path = path;
    this.color1 = color1;
    this.color2 = color2;
    this.min = min;
    this.max = max;

    this.propertyUpdate();

    this.type = "ColorLinear";
    this.mapping = "linear";
}, {
    get: function(context) {
        if(!this.path || this.min === undefined || this.max === undefined)
            return null;
        var value = context.get(this.path).val();
        if(value === null) return null;
        if(this.mapping == "logarithmic")
            value = (Math.log(value) - Math.log(this.min)) / (Math.log(this.max) - Math.log(this.min));
        else
            value = (value - this.min) / (this.max - this.min);
        if(value < 0) value = 0; if(value > 1) value = 1;
        var tp = this.stops.length - 1;
        var idx1 = Math.floor(value * tp);
        if(idx1 < 0) idx1 = 0;
        if(idx1 >= tp) idx1 = tp - 1;
        var idx2 = idx1 + 1;
        var t = value * tp - idx1;
        return this.stops[idx1].interp(this.stops[idx2], t);
    },
    propertyUpdate: function() {
        var $this = this;
        this.stops = [ 0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1 ].map(function(x) {
            return $this.color1.interpLab($this.color2, x);
        });
    },
    clone: function() {
        return new ColorLinear(this.path, this.color1, this.color2, this.min, this.max);
    }
});
Objects.ColorLinear = ColorLinear;
IV.serializer.registerObjectType("ColorLinear", ColorLinear);

// Linear Mapping.
var CategoricalMapping = IV.extend(Objects.Object, function(path, keys, values, fallback, value_type) {
    this.type = "CategoricalMapping";
    this.path = path;
    this.keys = keys;
    this.values = values;
    this.fallback = fallback;
    this.value_type = value_type;
}, {
    get: function(context) {
        if(!this.path)
            return null;
        var value = context.get(this.path).val();
        for(var i = 0; i < this.keys.length; i++)
            if(value == this.keys[i]) return this.values[i];
        return this.fallback;
    },
    clone: function() {
        return new CategoricalMapping(this.path, this.keys.slice(), this.values.slice(), this.fallback, this.value_type);
    }
});
Objects.CategoricalMapping = CategoricalMapping;
IV.serializer.registerObjectType("CategoricalMapping", CategoricalMapping);

var ReferenceWrapper = IV.extend(Objects.Object, function(ref_path, refd_path, object) {
    Objects.Object.call(this);
    this.type = "ReferenceWrapper";
    this.obj = object;
    this.reference_path = ref_path;
    this.referenced_path = refd_path;
}, {
    get: function(context) {
        var ref_context = context.get(this.reference_path).getReference(this.referenced_path);
        return this.obj.get(ref_context);
    },
    clone: function() {
        return new ReferenceWrapper(this.reference_path, this.obj);
    }
});
Objects.ReferenceWrapper = ReferenceWrapper;
IV.serializer.registerObjectType("ReferenceWrapper", ReferenceWrapper);

})();
