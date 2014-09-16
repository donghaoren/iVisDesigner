// iVisDesigner - scripts/core/serializer.js
// Author: Donghao Ren
//
// LICENSE
//
// Copyright (c) 2014, The Regents of the University of California
// All rights reserved.
//
// Redistribution and use in source and binary forms, with or without modification,
// are permitted provided that the following conditions are met:
//
// 1. Redistributions of source code must retain the above copyright notice, this
//    list of conditions and the following disclaimer.
//
// 2. Redistributions in binary form must reproduce the above copyright notice,
//    this list of conditions and the following disclaimer in the documentation
//    and/or other materials provided with the distribution.
//
// 3. Neither the name of the copyright holder nor the names of its contributors
//    may be used to endorse or promote products derived from this software without
//    specific prior written permission.
//
// THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
// ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
// WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED.
// IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT,
// INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING,
// BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
// DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
// LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE
// OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED
// OF THE POSSIBILITY OF SUCH DAMAGE.

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

var serialize_internal = function(item, context, existings) {
    if(is_basic_type(item)) {
        return item;
    } else if(item.constructor == Array) {
        var r = item.map(function(single) {
            return serialize_internal(single, context, existings);
        });
        return r;
    } else if(item.serialize) {
        return item.serialize(context);
    } else {
        if(!item.uuid) item.uuid = IV.generateUUID();
        if(context.objects[item.uuid] || existings[item.uuid])
            return { u: item.uuid };
        var obj = { };
        /*if(item.type === undefined) {
            console.log("Can't serialize:", item);
        }*/
        context.objects[item.uuid] = { u: item.uuid, p: obj, t: item.type };
        existings[item.uuid] = item;
        var fields = item.serializeFields ? item.serializeFields() : null;
        if(fields) {
            for(var k = 0; k < fields.length; k++) {
                var i = fields[k];
                obj[i] = serialize_internal(item[i], context, existings);
            }
        } else {
            for(var i in item) {
                if(item.hasOwnProperty(i) && i[0] != '_') {
                    obj[i] = serialize_internal(item[i], context, existings);
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

IV.Serializer = function() {
    this.serialized_objects = { };
};


IV.Serializer.prototype.serialize = function(element) {
    var context = {
        objects: { }
    };
    context.root = serialize_internal(element, context, this.serialized_objects);
    return context;
};

IV.Serializer.prototype.deserialize = function(d) {
    var context = {
        objects: this.serialized_objects,
        data: d.objects
    };
    for(var u in d.objects) {
        var item = d.objects[u];
        var constructor = Object;
        if(object_types[item.t]) constructor = object_types[item.t];
        //else console.log("Unknown type: " + item.t);
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

IV.serializer.serialize = function(object) {
    var s = new IV.Serializer();
    return s.serialize(object);
};

IV.serializer.deserialize = function(object) {
    var s = new IV.Serializer();
    return s.deserialize(object);
};

IV.serializer.unitTest = function() {
    var object = {
        "uuid": "object1",
        "keyA": "valueA",
        "keyB": "valueB",
        "vector": new IV.Vector(10, 20)
    };
    var object2 = {
        "ref": object,
        "vector": new IV.Vector(20, 30)
    };
    var s = new IV.Serializer();
    var repr = s.serialize(object);
    var repr2 = s.serialize(object2);
    console.log(repr, repr2);
    var d = new IV.Serializer();
    var obj = d.deserialize(repr);
    var obj2 = d.deserialize(repr2);
    console.log(obj, obj2);
};

// Initialize for types defined in utils.h.

IV.serializer.registerDeserializer("Vector", function(item) {
    return new IV.Vector(item.x, item.y);
});

IV.serializer.registerDeserializer("Vector3", function(item) {
    return new IV.Vector3(item.x, item.y, item.z);
});

IV.serializer.registerDeserializer("Rectangle", function(item) {
    return new IV.Rectangle(item.x0, item.y0, item.width, item.height, item.angle);
});

IV.serializer.registerDeserializer("Color", function(item) {
    return new IV.Color(item.r, item.g, item.b, item.a);
});

})();
