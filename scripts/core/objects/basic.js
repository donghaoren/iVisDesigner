// iVisDesigner - scripts/core/objects/basic.js
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
