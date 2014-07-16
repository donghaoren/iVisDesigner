//. iVisDesigner - File: scripts/utils/oop.js
//. Copyright 2013-2014 Donghao Ren
//. University of California, Santa Barbara, Peking University
//. See LICENSE.md for more information.

NS.forEachReversed = function(array, f) {
    var i = array.length;
    while(i--) {
        f(array[i]);
    };
};

NS.forEachInObject = function(obj, f) {
    for(var i in obj) {
        f(i, obj[i]);
    }
};

NS.deepClone = function(myObj) {
    if(myObj == null || myObj == undefined) return myObj;
    // If we have clone method, call it.
    if(myObj.clone) return myObj.clone();
    // Not object type, return itself.
    if(typeof(myObj) != 'object') return myObj;
    if(myObj instanceof Array) {
        var r = [];
        for(var i = 0; i < myObj.length; i++)
            r[i] = NS.deepClone(myObj[i]);
        return r;
    } else {
        var myNewObj = new Object();
        for(var i in myObj) myNewObj[i] = NS.deepClone(myObj[i]);
        return myNewObj;
    }
};

NS.extend = function(base, sub, funcs) {
    function inheritance() { };
    inheritance.prototype = base.prototype;
    sub.prototype = new inheritance();
    sub.prototype.constructor = sub;
    sub._base_constructor = base;
    if(funcs) {
        for(var i in funcs) {
            if(i == "$auto_properties") {
                funcs[i].forEach(function(p) {
                    if(funcs["$auto_properties_after"]) {
                        var fafter = funcs["$auto_properties_after"];
                        sub.prototype["_set_" + p] = function(val) {
                            this[p] = val;
                            fafter.call(this, p, val);
                            NS.raiseObjectEvent(this, "set:" + p, val);
                            return val;
                        };
                    } else {
                        sub.prototype["_set_" + p] = function(val) {
                            this[p] = val;
                            NS.raiseObjectEvent(this, "set:" + p, val);
                            return val;
                        };
                    }
                    sub.prototype["_get_" + p] = function() {
                        return this[p];
                    };
                });
            } else {
                sub.prototype[i] = funcs[i];
            }
        }
    }
    return sub;
};

NS.implement = function(base, sub) {
    for(var k in base.prototype) {
        sub.prototype[k] = base.prototype[k];
    }
};
