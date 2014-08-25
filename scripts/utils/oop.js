// iVisDesigner - File: scripts/utils/oop.js
// Copyright (c) 2013-2014, Donghao Ren
// University of California Santa Barbara, Peking University
// Advised by Prof. Tobias Hollerer and previously by Prof. Xiaoru Yuan.
//
// All rights reserved.
//
// Redistribution and use in source and binary forms, with or without
// modification, are permitted provided that the following conditions are met:
//
// 1. Redistributions of source code must retain the above copyright notice,
//    this list of conditions and the following disclaimer.
//
// 2. Redistributions in binary form must reproduce the above copyright
//    notice, this list of conditions and the following disclaimer in the
//    documentation and/or other materials provided with the distribution.
//
// THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS
// IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO,
// THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR
// PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR
// CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
// EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,
// PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS;
// OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY,
// WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR
// OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF
// ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

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
