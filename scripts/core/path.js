IV.Path = function(str) {
    if(!str || str == "[ROOT]") str = "";
    if(typeof(str) == "string") {
        this.components = [];
        var slices = str == "" ? [] : str.split(":");
        for(var i = 0; i < slices.length; i++) {
            var c = slices[i];
            if(c == "&") {
                this.components.push({
                    type: "reference",
                    name: "_target"
                });
            } else if(c[0] == "[" && c[c.length - 1] == "]") {
                this.components.push({
                    type: "iterate",
                    name: c.substr(1, c.length - 2)
                });
            } else if(c[0] == "{" && c[c.length - 1] == "}") {
                var key = c.substr(1, c.length - 2).split("@");
                this.components.push({
                    type: "attached",
                    ns: key[1],
                    name: key[0]
                });
            } else {
                this.components.push({
                    type: "object",
                    name: c
                });
            }
        }
    } else {
        this.components = str;
    }
};

IV.Path.prototype.slice = function(start, length) {
    var sliced = new IV.Path();
    sliced.components = this.components.slice(start, length);
    return sliced;
};
IV.Path.prototype.clone = IV.Path.prototype.slice;

IV.Path.prototype._enumerate_internal = function(ctx, subdata, index, cb) {
    if(index >= this.components.length) {
        return cb(ctx);
    } else {
        var c = this.components[index];
        if(c.type == "iterate") {
            if(subdata) {
                var array = subdata[c.name];
                for(var i = 0; i < array.length; i++) {
                    ctx.components[index].obj = array[i];
                    var r = this._enumerate_internal(ctx, array[i], index + 1, cb);
                    if(r === false) return false;
                }
            }
        } else if(c.type == "attached") {
            var obj = subdata ? ctx.data.getAttached(c.ns, ctx.data.getObjectID(subdata)) : null;
            ctx.components[index].obj = obj;
            var r = this._enumerate_internal(ctx, obj, index + 1, cb);
            if(r === false) return false;
        } else {
            var obj = subdata ? subdata[c.name] : null;
            ctx.components[index].obj = obj;
            var r = this._enumerate_internal(ctx, obj, index + 1, cb);
            if(r === false) return false;
        }
    }
};

IV.PathContext = function(data, root, components) {
    this.data = data;
    this.root = root;
    this.components = components;
};

IV.PathContext.prototype.clone = function() {
    return new IV.PathContext(this.data, this.root, this.components.map(function(c) {
        return {
            type: c.type,
            name: c.name,
            obj: c.obj
        };
    }));
};

IV.PathContext.prototype.val = function() {
    if(this.components.length > 0)
        return this.components[this.components.length - 1].obj;
    return this.root;
};

IV.PathContext.prototype.getEntity = function(path) {
    var i = 0;
    var rc = [];
    var obj = this.root;
    for(; i < this.components.length && i < path.components.length; i++) {
        var tc = this.components[i];
        var pc = path.components[i];
        if(tc.name != pc.name || tc.type != pc.type) {
            break;
        } else {
            rc.push(tc);
            obj = tc.obj;
        }
    }
    if(i >= path.components.length)
        return new IV.PathContext(this.data, this.root, rc);
    else
        return null;
};

// Get value from another path.
IV.PathContext.prototype.get = function(path) {
    var i = 0;
    var rc = [];
    var obj = this.root;
    for(; i < this.components.length && i < path.components.length; i++) {
        var tc = this.components[i];
        var pc = path.components[i];
        if(tc.name != pc.name || tc.type != pc.type) {
            break;
        } else {
            rc.push(tc);
            obj = tc.obj;
        }
    }
    for(; i < path.components.length; i++) {
        var pc = path.components[i];
        var nc;
        if(pc.type == "attached") {
            nc = {
                type: pc.type,
                name: pc.name,
                ns: pc.ns,
                obj: obj ? this.data.getAttached(pc.ns, this.data.getObjectID(obj)) : null
            };
        } else {
            if(pc.type == "iterate") {
                nc = {
                    type: pc.type,
                    name: pc.name,
                    obj: obj ? obj[pc.name][0] : null
                };
            } else {
                nc = {
                    type: pc.type,
                    name: pc.name,
                    obj: obj ? obj[pc.name] : null
                };
            }
        }
        obj = nc.obj;
        rc.push(nc);
    }
    return new IV.PathContext(this.data, this.root, rc);
};

IV.PathContext.prototype.set = function(path, value) {
    var i = 0;
    var obj = this.root;
    for(; i < this.components.length && i < path.components.length - 1; i++) {
        var tc = this.components[i];
        var pc = path.components[i];
        if(tc.name != pc.name || tc.type != pc.type) {
            break;
        } else {
            obj = tc.obj;
        }
    }
    for(; i < path.components.length - 1; i++) {
        var pc = path.components[i];
        var nc;
        if(pc.type == "attached") {
            obj = this.data.getAttached(pc.ns, this.data.getObjectID(obj));
        } else {
            obj = obj[pc.name];
        }
        //obj = nc.obj;
    }
    var pc = path.components[i];
    obj[pc.name] = value;
};

IV.PathContext.prototype.getReference = function(referenced_path) {
    var o = this.val();
    var objs = [];
    while(o) {
        objs.push(o);
        o = o._parent;
    }
    var rc = referenced_path.components.map(function(item, idx) {
        return {
            type: item.type,
            name: item.name,
            obj: objs[objs.length - 2 - idx]
        };
    });
    return new IV.PathContext(this.data, this.root, rc);
};

IV.Path.prototype.enumerate = function(data, callback) {
    if(data.constructor == IV.PathContext) return this.enumerateAtContext(data, callback);
    var data_root = data.getRoot();
    if(!callback) return;
    var components = this.components.map(function(c) {
        return {
            type: c.type,
            name: c.name,
            obj: null
        };
    });
    var ctx = new IV.PathContext(data, data_root, components);
    this._enumerate_internal(ctx, data_root, 0, callback);
};

IV.Path.prototype.enumerateAtContext = function(context, callback) {
    var ctx = context.clone();
    var i = 0;
    var obj = ctx.data.getRoot();
    for(; i < ctx.components.length && i < this.components.length; i++) {
        var tc = ctx.components[i];
        var pc = this.components[i];
        if(tc.name != pc.name || tc.type != pc.type) {
            break;
        } else {
            obj = tc.obj;
        }
    }
    var pi = i;
    for(; i < this.components.length; i++) {
        var c = this.components[i];
        ctx.components[i] = {
            type: c.type,
            name: c.name,
            obj: null
        };
    }
    ctx.components = ctx.components.slice(0, i);
    this._enumerate_internal(ctx, obj, pi, callback);
};

IV.Path.prototype.relativePath = function(path) {
    var rp = path.clone();
    rp.components = rp.components.slice(this.components.length);
    return rp;
};

IV.Path.prototype.applyReference = function(path, target_path) {
    var rp = this.clone();
    console.log(this, path, target_path);
    rp.components = rp.components.concat(target_path.relativePath(path).components);
    return rp;
};

IV.Path.prototype.toString = function() {
    if(this.components.length == 0) return "[ROOT]";
    return this.components.map(function(c) {
        if(c.type == "iterate") return "[" + c.name + "]";
        if(c.type == "attached") return "{" + c.name + "@" + c.ns + "}";
        if(c.type == "reference") return "&";
        return c.name;
    }).join(":");
};

IV.Path.prototype.serialize = function() {
    return { de: "Path", str: this.toString() };
};
IV.serializer.registerDeserializer("Path", function(item) {
    return new IV.Path(item.str);
});

IV.Path.prototype.toStringDisplay = function() {
    if(this.components.length == 0) return "[ROOT]"
    return this.components.map(function(c) {
        if(c.type == "iterate") return "[" + c.name + "]";
        if(c.type == "attached") return "{" + c.name + "}";
        if(c.type == "reference") return "&";
        return c.name;
    }).join(":");
};

IV.Path.prototype.toEntityPath = function() {
    var np = this.clone();
    var i = np.components.length - 1;
    for(; i >= 0; i--) {
        if(np.components[i].type == "iterate") break;
    }
    np.components = np.components.slice(0, i + 1);
    return np;
};

IV.Path.prototype.getSchema = function(schema) {
    for(var i = 0; i < this.components.length; i++) {
        schema = schema.fields[this.components[i].name];
    }
    return schema;
};

IV.Path.commonPrefix = function(paths) {
    if(!paths || paths.length == 0) return new IV.Path();
    var common = paths[0].components.slice();
    for(var i = 1; i < paths.length; i++) {
        var p = paths[i].components;
        var t;
        for(t = 0; t < common.length && t < p.length; t++) {
            if(common[t].type != p[t].type || common[t].name != p[t].name) {
                break;
            }
        }
        common = common.slice(0, t);
    }
    return new IV.Path(common);
};

IV.Path.computeBasicStatistics = function(path, data) {
    var min = null;
    var max = null;
    var sum = 0;
    var count = 0;
    path.enumerate(data, function(context) {
        var val = context.val();
        if(val === undefined || val === null) return;
        if(min === null || min > val) min = val;
        if(max === null || max < val) max = val;
        sum += val;
        count += 1;
    });
    if(count == 0) {
        count = 1;
        if(min === null) min = -1;
        if(max === null) max = 1;
    }
    return { min: min, max: max, range: max - min, sum: sum, count: count, avg: sum / count };
};
