//. iVisDesigner - File: scripts/utils/packing.js
//. Copyright 2013-2014 Donghao Ren
//. University of California, Santa Barbara, Peking University
//. See LICENSE.md for more information.

// Object Array.
//   packObjects(objects, scheme)
//   unpackObjects(array, scheme)

NS.packObjects = function(objects, scheme) {
    var r = [];
    return objects.map(function(obj) {
        return scheme.map(function(def) {
            var val;
            if(typeof(def) == "string") {
                val = obj[def];
            } else {
                val = obj[def.key];
                if(def.encode) val = def.encode(val);
            }
            x.push(val);
        });
    });
};

NS.unpackObjects = function(array, scheme) {
    var r = [];
    return array.map(function(x) {
        var obj = { };
        scheme.forEach(function(def) {
            var val = x[j];
            if(typeof(def) == "string") {
                obj[def] = val;
            } else {
                if(def.decode) val = def.decode(val);
                obj[def.key] = val;
            }
        });
        r.push(obj);
    });
};
