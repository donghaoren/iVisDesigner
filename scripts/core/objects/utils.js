// Take a selection context, a anchor object, and action, add dragging handlers to the context.
var make_anchor_move_context = function(rslt, anchor, action) {
    if(action == "move") {
        if(anchor.type == "Plain") {
            rslt.original = anchor.obj;
            rslt.onMove = function(p0, p1, magnetics) {
                anchor.obj = rslt.original.sub(p0).add(p1);
                var np = magnetics.modify(anchor.obj.x, anchor.obj.y);
                if(np) {
                    anchor.obj.x = np.x;
                    anchor.obj.y = np.y;
                    magnetics.accept(np, anchor.obj.x, anchor.obj.y);
                }
                return { trigger_render: "main,front" };
            };
        }
        if(anchor.type == "PointOffset") {
            rslt.original = anchor.offset;
            rslt.onMove = function(p0, p1) {
                anchor.offset = rslt.original.sub(p0).add(p1);
                return { trigger_render: "main,front" };
            };
        }
    }
    if(action == "move-element") {
        if(anchor.beginMoveElement) {
            var c = anchor.beginMoveElement(rslt.context);
            rslt.onMove = function(p0, p1) {
                c.onMove(p0, p1);
            };
        }
    }
    return rslt;
};

// Convenient way to create property context.
var make_prop_ctx = function(obj, property, name, group, type, args) {
    var ctx = { name: name, group: group, type: type, property: property, owner: obj, args: args };
    ctx.get = function() {
        return obj["_get_" + property]();
    };
    ctx.set = function(val) {
        return obj["_set_" + property](val);
    };
    return ctx;
};

var compile_expression = function(expression, base_path) {
    var new_expression = expression.replace(/\_(\.[a-zA-Z\_][a-zA-Z0-9\_\-]*)+/, function(expr) {
        var params = expr.split(".").slice(1);
        var rpath = params.join(":");
        var p = base_path.toString();
        if(p != "") rpath = p + ":" + rpath;
        return "get(" + JSON.stringify(rpath) + ")";
    });
    var compiled = IV.math.compile(new_expression);
    return function(variables, context) {
        variables.get = function(fs) {
            var p = new IV.Path(fs);
            return context.get(p).val();
        };
        return compiled.eval(variables);
    };
};
