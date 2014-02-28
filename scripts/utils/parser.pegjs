{
    function flatten(vars) {
        if(vars instanceof Array) {
            var r = "";
            for(var i = 0; i < vars.length; i++)
                r += flatten(vars[i]);
            return r;
        } else return vars || "";
    }
    function gen_operator(left, others) {
        var r = left;
        for(var i = 0; i < others.length; i++) {
            var op = others[i][1][0];
            var rh = others[i][3];
            r = (function(r, op, rh) {
                return function(ctx) { return ctx[op](r(ctx), rh(ctx)); };
            })(r, op, rh);
        }
        return r;
    }
}

start
  = expression

expression
  = sp expr:level1 sp
    { return expr; }

level1
  = left:level2 others:( sp [+-] sp level2 )*
    { return gen_operator(left, others); }

level2
  = left:level3 others:( sp [*/] sp level3 )*
    { return gen_operator(left, others); }

level3
  = left:level4 others:( sp [\^] sp level4 )*
    { return gen_operator(left, others); }

level4
  = op:[-] expr:item
    {
        var k = "unary:" + op;
        return function(ctx) { return ctx[k](expr(ctx)); }
    }
  / item

item
  = primitive
  / function_call
  / variable
  / "(" sp expr:level1 sp ")" { return expr; }

variable
  = name:name { return function(ctx) { return ctx[name] }; }

function_call
  = name:name sp "(" sp expr:expression sp ")"
    { return function(ctx) { return ctx[name](expr(ctx)); }; }

primitive
  = floating_point
  / string

floating_point
  = str:([+-]? [0-9]+ ("." [0-9]+)? ([eE] [+-]? [0-9]+)?)
    { return function() { return parseFloat(flatten(str)); }; }

string
  = repr:("\"" [^"]* "\"")
    { var str = JSON.parse(flatten(repr)); return function(ctx) { return str; } }

name
  = name:([a-zA-Z_][a-zA-Z0-9_]*) { return flatten(name); }


sp
  = [ ]*
