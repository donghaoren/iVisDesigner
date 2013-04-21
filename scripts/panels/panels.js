// iVisDesigner
// Author: Donghao Ren, PKUVIS, Peking University, 2013.04
// See LICENSE.txt for copyright information.

// scripts/panels.js
// Edit panels.

IV.panels = { };

IV.panels.beginEdit = function(objects, callback) {
    if(objects.length == 1) {
        var obj = objects[0];
        if(obj.style) {
            var s = obj.style;
            IV.panels.style.loadStyle(s);
            IV.panels.style.listener = function(style) {
                obj.style = style;
                callback({ "style": style });
            };
        }
    }
};

{{include: style.js}}
