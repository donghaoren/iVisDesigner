// iVisDesigner
// Author: Donghao Ren, PKUVIS, Peking University, 2013.04
// See LICENSE.txt for copyright information.

// scripts/panels.js
// Edit panels.

IV.panels = { };

IV.panels.beginEdit = function(objects, callback) {
    if(objects.length >= 1) {
        var obj = objects[0];
        if(obj.style) {
            var s = obj.style;
            IV.panels.style.loadStyle(s);
            IV.panels.style.listener = function(style) {
                for(var i in objects) {
                    objects[i].style = style;
                }
                callback({ "style": style });
            };
        }
    }
};

IV.on("vis:objects:selection", function() {
    if(!IV.vis) return;
    var selected_objects = IV.vis.selection.map(function(x) { return x.obj; });
    IV.panels.beginEdit(selected_objects, function(edit) {
        IV.triggerRender("main,back");
        IV.render();
    });
});

{{include: style.js}}
