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
    if(!obj) return "";
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

})();
