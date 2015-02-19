// iVisDesigner - scripts/core/objects/objects.js
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

var Objects = { };

IV.objects = Objects;

// The base class for objects.
Objects.Object = function() {
    this.uuid = IV.generateUUID();
};
Objects.Object.prototype = {
    _get_name: function() { return this.name; },
    _set_name: function(val) { return this.name = val; },
    setName: function(name) {
        if(this.name != name) {
            this.name = name;
            IV.raiseObjectEvent(this, "p:name", name);
        }
    },
    can: function(cap) { return false; },
    get: function(context) { return null; },
    getStyle: function(context) { return this.get(context); },
    getPoint: function(context) { return this.get(context); },
    getLine: function(context) { return this.get(context); },
    getNumber: function(context) { return this.get(context); },
    getPath: function() { return this.path; },
    getGuidePath: function() { return new IV.Path(""); },
    selectObject: function() { return { }; },
    render: function() { },
    propertyUpdate: function() { },
    renderSelected: function() { },
    renderGuide: function() { },
    renderGuideSelected: function() { },
    setDirty: function() { },
    select: function() { return null; },
    clone: function() {
        throw new Error("Clone not implemented: " + this.type);
    },
    getDependencies: function() { return new IV.ObjectSet(); },
    getPropertyContext: function() {
        var $this = this;
        return [
            make_prop_ctx(this, "name", "Name", "Common", "plain-string")
        ];
    }
};

{{include: utils.js}}
{{include: basic.js}}
{{include: geometry.js}}
{{include: mappings.js}}
{{include: filters.js}}
{{include: style.js}}
{{include: track.js}}
{{include: shapes.js}}
{{include: text.js}}
{{include: layout.js}}
{{include: map.js}}
{{include: generators/generators.js}}
{{include: component.js}}
{{include: 3d/3d.js}}

})();
