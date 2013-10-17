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
    return new IV.DataObject(new_root, s);
};

})();
