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
        var property_context = { items: [] };
        if(obj.getPropertyContext) {
            property_context = obj.getPropertyContext(IV.data);
        }
        var default_items = [
            { name: "Name", type: "string",
              value: obj.name,
              set: function(val) {
                obj.name = val;
                IV.raise("vis:objects");
              }
          }
        ];
        property_context.items = default_items.concat(property_context.items);
        IV.panels.property.loadContext(property_context);
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
{{include: property.js}}
