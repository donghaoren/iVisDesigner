//. iVisDesigner - File: scripts/core/objects/basic.js
//. Copyright 2013-2014 Donghao Ren
//. University of California, Santa Barbara, Peking University
//. See LICENSE.md for more information.

(function() {

// Plain Object.
var Plain = IV.extend(Objects.Object, function(obj) {
    Objects.Object.call(this);
    this.obj = obj;
    this.type = "Plain";
}, {
    can: function(cap) {
        if(cap == "get-point") return true;
        if(cap == "get-number") return true;
        if(cap == "get-style") return true;
    },
    getPath: function() { return new IV.Path(""); },
    getGuidePath: function() { return new IV.Path(""); },
    get: function() { return this.obj; },
    clone: function() {
        return new Plain(IV.deepClone(this.obj));
    }
});

IV.serializer.registerObjectType("Plain", Plain);

Objects.Plain = Plain;
Objects.Number = Plain;
Objects.Style = Plain;
Objects.Point = Plain;

// PassThrough Object.
var PassThrough = IV.extend(Objects.Object, function(path) {
    Objects.Object.call(this);
    this.path = path;
    this.type = "PassThrough";
}, {
    $auto_properties: [ "path" ],
    can: function(cap) {
        if(cap == "get-point") return true;
        if(cap == "get-number") return true;
        if(cap == "get-style") return true;
    },
    getPath: function() { return new IV.Path(""); },
    getGuidePath: function() { return new IV.Path(""); },
    get: function(context) { return context.get(this.path).val(); },
    clone: function() {
        return new PassThrough(IV.deepClone(this.path));
    }
});
Objects.PassThrough = PassThrough;
IV.serializer.registerObjectType("PassThrough", PassThrough);

})();
