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
                    onobject(o, schema, parent);
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
    process_subtree(obj, schema, null, function(obj, schema, parent) {
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
PlainDataset.prototype = {
    enumeratePath: function(path) {
    },
    schemaAtPath: function(path) {
    }
};

IV.dataprovider.loadData = function(name, done, fail) {
    var r = make_async(done, fail);
    $.get("datasets/" + name + ".schema", function(data) {
        jsyaml.loadAll(data, function(doc) {
            var schema = doc;
            $.get("datasets/" + name + ".data", function(data) {
                jsyaml.loadAll(data, function(doc) {
                    var obj = doc;
                    r.ondone(doc);
                    var x = new PlainDataset(obj, schema);
                });
            });
        });
    });

    return r;
};

})();
