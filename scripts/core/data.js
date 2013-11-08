(function() {

// This class is responsible for maintaining data updates.

IV.DataObject = function(root, schema) {
    this.root = root;
    this.schema = schema;
    this.namespaces = { };
};

IV.DataObject.prototype.getSchema = function() {
    return this.schema;
};

// Root object, javascript object.
// _parent: reference the parent object.
// _target: reference the target object for a reference.
IV.DataObject.prototype.getRoot = function() {
    return this.root;
};

IV.DataObject.prototype.getObjectID = function(obj) {
    if(!obj) return null;
    if(!obj._id) obj._id = IV.generateUUID();
    return obj._id;
};

IV.DataObject.prototype.setAttached = function(ns, map) {
    if(!this.namespaces[ns]) this.namespaces[ns] = { };
    var n = this.namespaces[ns];
    for(var i in map) {
        if(map.hasOwnProperty(i)) {
            n[i] = map[i];
        }
    }
};

IV.DataObject.prototype.getAttached = function(ns, id) {
    if(!this.namespaces[ns]) return null;
    return this.namespaces[ns][id];
};

IV.DataObject.prototype.createSubset = function(path, context) {
    var new_root = context.get(path).val();
    var s = this.schema;
    for(var i = 0; i < path.components.length; i++) {
        s = s.fields[path.components[i].name];
    }
    var r = new IV.DataObject(new_root, s);
    r.subset = {
        parent: this,
        path: path
    };
    return r;
};

IV.DataObject.prototype.enumerateOtherSubsets = function(callback) {
    if(this.subset) {
        var $this = this;
        $this.subset.parent.enumerateOtherSubsets(function(ds) {
            $this.subset.path.enumerate(ds, function(context) {
                callback($this.subset.parent.createSubset($this.subset.path, context));
            });
        });
    } else {
        callback(this);
    }
};

IV.DataObject.prototype.computeFullStatistics = function(path, context) {
    var min = null;
    var max = null;
    var sum = 0;
    var count = 0;
    var f_update = function(context) {
        var val = context.val();
        if(val === undefined || val === null) return;
        if(min === null || min > val) min = val;
        if(max === null || max < val) max = val;
        sum += val;
        count += 1;
    };
    this.enumerateOtherSubsets(function(ds) {
        path.enumerate(ds, f_update);
    });
    if(count == 0) {
        count = 1;
        if(min === null) min = -1;
        if(max === null) max = 1;
    }
    return { min: min, max: max, range: max - min, sum: sum, count: count, avg: sum / count };
}

IV.PlainDataset = function(obj, schema) {
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
        if(obj === null || obj === undefined) return;
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
        if(obj === null || obj === undefined) return;
        if(schema.type == "reference") {
            obj._target = id_map[obj.ref_id];
        }
    });
    this.id_map = id_map;
    this.obj = obj;
    this.schema = schema;
    this.schema_cache = { };
};

})();
