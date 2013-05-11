// iVisDesigner
// Author: Donghao Ren, PKUVIS, Peking University, 2013.04
// See LICENSE.txt for copyright information.

// scripts/dataprovider.js
// Load data schema and data contents.

(function() {

IV.dataprovider = { };

var PlainDataset = function(obj, schema) {
    // Preprocess object.
    var process_subtree = function(obj, schema, parent, onobject) {
        onobject(obj, schema, parent);
        if(schema.type == "object") {
            if(schema.fields) {
                for(var f in schema.fields) {
                    var ss = schema.fields[f];
                    var so = obj[f];
                    process_subtree(so, ss, obj, onobject);
                }
            }
        }
        if(schema.type == "collection" || schema.type == "sequence") {
            if(schema.fields) {
                obj.forEach(function(o) {
                    onobject(o, schema, parent, "item");
                    for(var f in schema.fields) {
                        var ss = schema.fields[f];
                        var so = o[f];
                        process_subtree(so, ss, o, onobject);
                    }
                });
            }
        }
    };
    var id_map = { };
    process_subtree(obj, schema, null, function(obj, schema, parent, rtype) {
        if(schema.type == "object" || rtype == "item")
            obj._parent = parent;
        if(obj._id) {
            id_map[obj._id] = obj;
            obj.__id = obj._id;
        } else {
            if(schema.type == "object" || rtype == "item")
                obj.__id = IV.generateUUID("::");
        }
    });
    process_subtree(obj, schema, null, function(obj, schema, parent) {
        if(schema.type == "reference") {
            obj._target = id_map[obj.id];
        }
    });
    this.id_map = id_map;
    this.obj = obj;
    this.schema = schema;
    this.schema_cache = { };
};
var PlainDatasetContext = function() {
    this.cache = { };
    this.list = [];
};
PlainDatasetContext.prototype = {
    get: function(path) {
        if(this.cache[path] !== undefined) return this.cache[path];
        var spath = path ? path.split(":") : [];
        var rtree = this.tree;
        var i = 0;
        var obj = null;
        for(; i < spath.length; i++)
            if(this.list[i] !== undefined && this.list[i].cpath == spath[i])
                obj = this.list[i].obj;
            else break;
        if(obj !== null) {
            for(; i < spath.length; i++) {
                if(obj[spath[i]] === undefined) {
                    obj = null;
                    break;
                }
                obj = obj[spath[i]];
            }
        }
        this.cache[path] = obj;
        return obj;
    },
    enumeratePath: function(path, callback) {
        var rctx = this.duplicate();
        var spath = path ? path.split(":") : [];
        var schema = this.data.getSchema(this.path);
        var obj;
        if(this.depth > 0) obj = this.list[this.depth - 1].obj;
        else obj = this.data.obj;
        enumerate_path_subtree(rctx, spath, this.depth, obj, schema, callback);
    },
    getSchema: function(path) {
        return this.data.getSchema(path);
    },
    referenceContext: function(path) {
        var ref = this.get(path);
        return this.data.contextForItem(ref._target, this.getSchema(path).of);
    },
    referenceItem: function(path) {
        var ref = this.get(path);
        return ref._target;
    },
    duplicate: function() {
        var r = new PlainDatasetContext();
        // Data: reference of the data object.
        r.data = this.data;
        // List: { obj: object, cpath: path component }
        r.list = this.list.slice();
        // Depth: depth in the tree.
        r.depth = this.depth;
        // Path: path to reference this.
        r.path = this.path;
        r.cache = { };
        return r;
    }
};
var enumerate_path_subtree = function(context, spath, idx, obj, schema, callback) {
    if(idx == spath.length) {
        // Clear cache.
        context.cache = { };
        context.depth = idx;
        context.path = spath.join(":");
        return callback(context);
    }
    var cpath = spath[idx];
    var cschema = schema.fields[cpath];
    var cobj = obj[cpath];
    if(cschema.type == "collection" || cschema.type == "sequence") {
        var cobj_length = cobj.length;
        for(var i = 0; i < cobj_length; i++) {
            var o = cobj[i];
            context.list[idx] = {
                obj: o,
                cpath: cpath
            };
            var r = enumerate_path_subtree(context, spath, idx + 1, o, cschema, callback);
            if(r === false) return false;
        }
        return;
    } else {
        var o = cobj;
        context.list[idx] = {
            obj: o,
            cpath: cpath
        };
        var r = enumerate_path_subtree(context, spath, idx + 1, o, cschema, callback);
        if(r === false) return false;
        else return;
    }
    return false;
};
PlainDataset.prototype = {
    enumeratePath: function(path, callback) {
        var ctx = new PlainDatasetContext();
        ctx.data = this;
        var spath = path ? path.split(":") : [];
        enumerate_path_subtree(ctx, spath, 0, this.obj, this.schema, callback);
    },
    contextForItem: function(item, path) {
        var ctx = new PlainDatasetContext();
        var spath = path ? path.split(":") : [];
        ctx.data = this;
        ctx.list = [];
        ctx.depth = spath.length;
        ctx.path = path;
        var pi = item;
        var items = [];
        while(pi) {
            if(pi != this.obj) // Don't add the root object.
                items.push(pi);
            pi = pi._parent;
        }
        items = items.reverse();
        for(var i = 0; i < items.length; i++) {
            ctx.list[i] = {
                obj: items[i],
                cpath: spath[i]
            };
        }
        return ctx;
    },
    //schemaAtPath: function(path) { return this.getSchema(path); },
    getSchema: function(path) {
        if(this.schema_cache[path]) return this.schema_cache[path];
        var s = this.schema;
        var spath = path ? path.split(":") : [];
        for(var i = 0; i < spath.length; i++) {
            s = s.fields[spath[i]];
        }
        this.schema_cache[path] = s;
        return s;
    },
    assignSchema: function(path, schema) {
        // Clear the schema cache.
        this.schema_cache = { };
        var $this = this;
        var pfx = path.lastIndexOf(":");
        var last = path.substr(pfx + 1);
        pfx = pfx < 0 ? "" : path.substr(0, pfx);
        var sch = this.getSchema(pfx);
        sch.fields[last] = schema;
        var update = function() {
            $this.enumeratePath(pfx, function(context) {
                var item = context.get(pfx);
                var obj = schema.get(item, context);
                item[last] = obj;
            });
            $this._raiseEvent("onContentUpdate");
        };
        var detach = function() {
            delete sch.fields[last];
            $this._raiseEvent("onSchemaUpdate");
        };
        schema.update = update;
        schema.detach = detach;

        this._raiseEvent("onSchemaUpdate");

        return schema;
    },
    _raiseEvent: function(name, arg) {
        if(this[name]) this[name](arg);
    }
};
function make_async(obj, done, fail) {
    if(!obj) obj = { };
    if(done) obj.ondone = done;
    else obj.ondone = function() {};
    if(fail) obj.onfail = fail;
    else obj.onfail = function() {};
    obj.done = function(f) {
        obj.ondone = f;
        return obj;
    };
    obj.fail = function(f) {
        obj.onfail = f;
        return obj;
    };
    return obj;
};

IV.dataprovider.listDatasets = function(done, fail) {
    var r = make_async(done, fail);
    setTimeout(function() {
        r.ondone([ "cardata", "temperature" ]);
    }, 1);
    return r;
};

IV.dataprovider.loadData = function(name, done, fail) {
    var r = make_async(done, fail);
    $.get("datasets/" + name + ".schema", function(data) {
        jsyaml.loadAll(data, function(doc) {
            var schema = doc;
            $.get("datasets/" + name + ".data", function(data) {
                jsyaml.loadAll(data, function(doc) {
                    var x = new PlainDataset(doc, schema);
                    r.ondone(x);
                });
            });
        });
    });

    return r;
};

})();
