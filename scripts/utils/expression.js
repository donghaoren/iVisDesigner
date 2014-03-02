NS.expression = { };

NS.expression.Context = function() {
};

NS.expression.Context.prototype = {
    "+": function(a, b) {
        if(typeof(a) == "number" && typeof(b) == "number") return a + b;
        if(typeof(a) == "string" && typeof(b) == "string") return a + b;
        throw "Invalid operands for operator '+'."
    },
    "-": function(a, b) {
        if(typeof(a) == "number" && typeof(b) == "number") return a - b;
        throw "Invalid operands for operator '-'."
    },
    "unary:-": function(a) {
        if(typeof(a) == "number") return -a;
        throw "Invalid operands for operator '-'."
    },
    "*": function(a, b) {
        if(typeof(a) == "number" && typeof(b) == "number") return a * b;
        throw "Invalid operands for operator '*'."
    },
    "/": function(a, b) {
        if(typeof(a) == "number" && typeof(b) == "number") return a / b;
        throw "Invalid operands for operator '/'."
    },
    "^": function(a, b) {
        if(typeof(a) == "number" && typeof(b) == "number") return Math.pow(a, b);
        throw "Invalid operands for operator '^'."
    },
    "e": Math.e,
    "pi": Math.PI,
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

{{include: parser.js}}

NS.expression.parse = function(expr) {
    return NS.expression.parser.parse(expr);
};

NS.expression.eval = function(expr) {
    var ctx = new NS.expression.Context();
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
