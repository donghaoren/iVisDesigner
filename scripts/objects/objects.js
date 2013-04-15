// iVisDesigner
// Author: Donghao Ren, PKUVIS, Peking University, 2013.04
// See LICENSE.txt for copyright information.

IV.objects = { };

IV.objects.BaseObject = function(proto) {
    for(var i in proto) {
        this[i] = proto[i];
    }
};
IV.objects.BaseObject.prototype = {
    can: function(cap) { return false; },
    render: function() { },
    renderGuide: function() { },
    select: function() { return null; }
};

{{include: base.js}}
{{include: track.js}}
{{include: shapes.js}}
