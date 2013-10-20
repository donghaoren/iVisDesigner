(function() {

IV.serializer = { };

var deserializers = { };
var object_types = { };

var is_basic_type = function(x) {
    if(typeof(x) == "string") return true;
    if(typeof(x) == "number") return true;
    if(typeof(x) == "boolean") return true;
    if(typeof(x) == "undefined") return true;
    if(x === null) return true;
    return false;
};

var serialize_internal = function(item, context) {
    if(is_basic_type(item)) {
        return item;
    } else if(item.constructor == Array) {
        var r = item.map(function(single) {
            return serialize_internal(single, context);
        });
        return r;
    } else if(item.serialize) {
        return item.serialize(context);
    } else {
        if(!item.uuid) item.uuid = IV.generateUUID();
        if(context.objects[item.uuid])
            return { u: item.uuid };
        var obj = { };
        if(item.type === undefined) {
            console.log("Can't serialize:", item);
        }
        context.objects[item.uuid] = { u: item.uuid, p: obj, t: item.type };
        var fields = item.serializeFields ? item.serializeFields() : null;
        if(fields) {
            for(var k = 0; k < fields.length; k++) {
                var i = fields[k];
                obj[i] = serialize_internal(item[i], context);
            }
        } else {
            for(var i in item) {
                if(item.hasOwnProperty(i) && i[0] != '_') {
                    obj[i] = serialize_internal(item[i], context);
                }
            }
        }
        return { u: item.uuid };
    }
};

IV.serializer.registerDeserializer = function(de, func) {
    deserializers[de] = func;
};

IV.serializer.registerObjectType = function(type, constructor) {
    object_types[type] = constructor;
};

IV.serializer.serialize = function(element) {
    var context = {
        objects: { }
    };
    context.root = serialize_internal(element, context);
    return context;
};

var deserialize_internal = function(item, context) {
    if(is_basic_type(item)) {
        return item;
    } else if(item.constructor == Array) {
        var r = item.map(function(single) {
            return deserialize_internal(single, context);
        });
        return r;
    } else if(item.de) {
        return deserializers[item.de](item);
    } else {
        var obj = context.objects[item.u];
        if(obj.__waiting__) {
            delete obj.__waiting__;
            var p = context.data[item.u].p;
            for(var f in p) {
                obj[f] = deserialize_internal(p[f], context);
            }
            obj.type = context.data[item.u].t;
        }
        return obj;
    }
};

IV.serializer.deserialize = function(d) {
    var context = {
        objects: { },
        data: d.objects
    };
    for(var u in d.objects) {
        var item = d.objects[u];
        var constructor = Object;
        if(object_types[item.t]) constructor = object_types[item.t];
        else console.log("Unknown type: " + item.t);
        context.objects[u] = Object.create(constructor.prototype);
        context.objects[u].__waiting__ = true;
    }

    var o = deserialize_internal(d.root, context);

    for(var u in d.objects) {
        var obj = context.objects[u];
        if(obj.postDeserialize)
            obj.postDeserialize(context);
    }
    return o;
};

// Initialize for types defined in utils.h.

IV.serializer.registerDeserializer("Vector", function(item) {
    return new IV.Vector(item.x, item.y);
});
IV.serializer.registerDeserializer("Color", function(item) {
    return new IV.Color(item.r, item.g, item.b, item.a);
});

IV.serializer.test = function() {
    var d = IV.serializer.serialize(IV.editor.vis);
    var j = JSON.stringify(d, undefined, 2);
    console.log(j);
    var de = IV.serializer.deserialize(JSON.parse(j));
    console.log(de);
    IV.editor.setVisualization(de);
    return "Test done."
};

})();

// IV.serializer.serilize(vis);
