// iVisDesigner - scripts/utils/expression.js
// Author: Donghao Ren
//
// LICENSE
//
// Copyright (c) 2014, The Regents of the University of California
// All rights reserved.
//
// Redistribution and use in source and binary forms, with or without modification,
// are permitted provided that the following conditions are met:
//
// 1. Redistributions of source code must retain the above copyright notice, this
//    list of conditions and the following disclaimer.
//
// 2. Redistributions in binary form must reproduce the above copyright notice,
//    this list of conditions and the following disclaimer in the documentation
//    and/or other materials provided with the distribution.
//
// 3. Neither the name of the copyright holder nor the names of its contributors
//    may be used to endorse or promote products derived from this software without
//    specific prior written permission.
//
// THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
// ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
// WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED.
// IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT,
// INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING,
// BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
// DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
// LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE
// OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED
// OF THE POSSIBILITY OF SUCH DAMAGE.

NS.expression = { };

NS.expression.Context = function() {
};

NS.expression.Context.prototype = {
    "+": function(a, b) {
        if(typeof(a) == "number" && typeof(b) == "number") return a + b;
        if(typeof(a) == "string" && typeof(b) == "string") return a + b;
        throw "Invalid operands for operator '+'.";
    },
    "-": function(a, b) {
        if(typeof(a) == "number" && typeof(b) == "number") return a - b;
        throw "Invalid operands for operator '-'.";
    },
    "unary:-": function(a) {
        if(typeof(a) == "number") return -a;
        throw "Invalid operands for operator '-'.";
    },
    "*": function(a, b) {
        if(typeof(a) == "number" && typeof(b) == "number") return a * b;
        throw "Invalid operands for operator '*'.";
    },
    "/": function(a, b) {
        if(typeof(a) == "number" && typeof(b) == "number") return a / b;
        console.log(a, b);
        throw "Invalid operands for operator '/'.";
    },
    "^": function(a, b) {
        if(typeof(a) == "number" && typeof(b) == "number") return Math.pow(a, b);
        throw "Invalid operands for operator '^'.";
    },
    "e": Math.e,
    "pi": Math.PI,
    "year": function(timestamp) { return new Date(timestamp * 1000).getYear(); },
    "month": function(timestamp) { return new Date(timestamp * 1000).getMonth(); },
    "day": function(timestamp) { return new Date(timestamp * 1000).getDay(); },
    "hour": function(timestamp) { return new Date(timestamp * 1000).getHours(); },
    "minutes": function(timestamp) { return new Date(timestamp * 1000).getMinutes(); },
    "seconds": function(timestamp) { return new Date(timestamp * 1000).getSeconds(); },
    "rgba": function(r, g, b, a) { return new IV.Color(r, g, b, a); },
    "rgb": function(r, g, b) { return new IV.Color(r, g, b); },
    "hcl": function(h, c, l) { return NS.parseColorChroma(chroma.lch(l, c, h)); },
    "hcla": function(h, c, l, a) { return NS.parseColorChroma(chroma.lch(l, c, h), a); }
};

(function() {
    var keys = "abs,acos,asin,atan,atan2,ceil,cos,exp,floor,log,max,min,pow,random,round,sin,sqrt,tan";
    keys.split(",").forEach(function(key) {
        NS.expression.Context.prototype[key] = Math[key];
    });
})();

{{include: parser.js.gen}}

NS.expression.parse = function(expr) {
    return NS.expression.parser.parse(expr);
};

NS.expression.eval = function(expr, context) {
    var ctx = new NS.expression.Context();
    for(var f in context) ctx[f] = context[f];
    var p = NS.expression.parse(expr);
    return p(ctx);
};

NS.expression.test = function() {
    var cases = {
        "1+2+3": 6,
        " 1 + 2 + 3 ": 6,
        '"asdf"': "asdf",
        "-sin(34) + cos(12) * tan(1 + cos(2) )": 0.028442790259514683,
        "1 + 3 / -8 ": 0.625,
        "2*3*4*5+99": 219,
        "4 * (9 - 4) / (2 * 6 - 2) + 8": 10,
        "1 + ((123 * 3 - 69) / 100)": 4,
        "2.45/8.5*9.27": 2.6719411764705883,
        "2.45/8.5*9.27+(5*0.0023)": 2.683441176470588
    };
    for(var expr in cases) {
        var evald;
        try {
            evald = NS.expression.eval(expr);
        } catch(e) {
            console.log("RuntimeError: ", expr);
            console.trace(e);
            continue;
        }
        if(evald != cases[expr]) {
            console.log("Error: ", expr, evald, cases[expr]);
        } else {
            console.log("Pass: ", expr, evald, cases[expr]);
        }
    }
};
