//. iVisDesigner - File: scripts/utils/colors.js
//. Copyright 2013-2014 Donghao Ren
//. Peking University, University of California, Santa Barbara
//. See LICENSE.md for more information.

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
    equals: function(c) {
        return this.r == c.r && this.g == c.g && this.b == c.b && this.a == c.a;
    },
    serialize: function() {
        return { de: "Color", r: this.r, g: this.g, b: this.b, a: this.a };
    }
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
