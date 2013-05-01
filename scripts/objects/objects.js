// iVisDesigner
// Author: Donghao Ren, PKUVIS, Peking University, 2013.04
// See LICENSE.txt for copyright information.

// scripts/objects/objects.js
// Objects in iVisDesigner.

IV.objects = { };

// The base class for objects.
IV.objects.BaseObject = function(proto) {
    for(var i in proto) {
        this[i] = proto[i];
    }
};
IV.objects.BaseObject.prototype = {
    can: function(cap) { return false; },
    get: function(context) { return null; },
    getStyle: function(context) { return this.get(context); },
    getPoint: function(context) { return this.get(context); },
    getNumber: function(context) { return this.get(context); },
    getPath: function() { return this.path; },
    getGuidePath: function() { return this.guide_path; },
    render: function() { },
    renderSelected: function() { },
    renderGuide: function() { },
    renderGuideSelected: function() { },
    select: function() { return null; },
    clone: function() {
        throw new Error("Clone not implemented: " + this.type);
    }
};

{{include: base.js}}
{{include: track.js}}
{{include: shapes.js}}
