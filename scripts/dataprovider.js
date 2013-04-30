// iVisDesigner
// Author: Donghao Ren, PKUVIS, Peking University, 2013.04
// See LICENSE.txt for copyright information.

// scripts/dataprovider.js
// Load data schema and data contents.

(function() {

IV.dataprovider = { };

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

IV.dataprovider.loadSchema = function(name, done, fail) {
    var r = make_async(done, fail);
    $.get("datasets/" + name + ".schema", function(data) {
        jsyaml.loadAll(data, function(doc) {
            r.ondone(doc);
        });
    });
    return r;
};

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
        if(obj._id) id_map[obj._id] = obj;
    });
    process_subtree(obj, schema, null, function(obj, schema, parent) {
        if(schema.type == "reference") {
            obj._target = id_map[obj.id];
        }
    });
    this.id_map = id_map;
    this.obj = obj;
    this.schema = schema;
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
    getSchema: function(path) {
        return this.data.schemaAtPath(path);
    },
    resolveReference: function(path, refpath) {
        var ref = this.get(path);
        var sch = this.getSchema(path);
    },
    duplicate: function() {
        var r = new PlainDatasetContext();
        r.data = this.data;
        r.list = this.list.slice();
        r.cache = { };
        return r;
    }
};
var enumerate_path_subtree = function(context, spath, idx, obj, schema, callback) {
    if(idx == spath.length) {
        // Clear cache.
        context.cache = { };
        return callback(context);
    }
    var cpath = spath[idx];
    var cschema = schema.fields[cpath];
    var cobj = obj[cpath];
    if(cschema.type == "collection" || cschema.type == "sequence") {
        for(var i in cobj) {
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
    schemaAtPath: function(path) {
        var s = this.schema;
        var spath = path ? path.split(":") : [];
        for(var i in spath) {
            s = s.fields[spath[i]];
        }
        return s;
    }
};

IV.dataprovider.loadData = function(name, done, fail) {
    var r = make_async(done, fail);
    $.get("datasets/" + name + ".schema", function(data) {
        jsyaml.loadAll(data, function(doc) {
            var schema = doc;
            $.get("datasets/" + name + ".data", function(data) {
                jsyaml.loadAll(data, function(doc) {
                    var x = new PlainDataset(doc, schema);
                    /*
                    x.enumeratePath("refs:a", function(ctx) {
                        console.log(ctx.resolveReference("refs:a"));
                    });*/
                    r.ondone(x);
                });
            });
        });
    });

    return r;
};

})();
