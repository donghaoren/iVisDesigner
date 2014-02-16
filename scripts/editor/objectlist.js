(function() {

var staged_paths = { };

var olist = $("#object-list");
var panel_objects = $("#panel-objects");
panel_objects.bind("drop", function(e) {
    var p = new IV.Path(e.originalEvent.dataTransfer.getData("iv/path"));
    p = p.toEntityPath();
    staged_paths[p.toString()] = true;
    Editor.generateObjectList();
});
panel_objects.bind("dragover", function(e) {
    e.preventDefault();
});



Editor.generateObjectList = function() {
    olist.children().remove();
    var vis = Editor.vis;
    if(!vis) return;

    var classes = { };

    for(var p in staged_paths) classes[p] = [];

    vis.objects.forEach(function(obj) {
        var p = obj.getPath();
        if(!p) p = new IV.Path();
        p = p.toEntityPath();
        var s = p.toString();
        if(!classes[s]) classes[s] = [];
        classes[s].push(obj);
    });



    var render_object = function(obj, ul, parents) {
        var li = IV._E("li", "object group");
        ul.append(li);
        li.append(IV._E("span", "name", obj.name));
        li.append(IV._E("span", "type", " " + obj.type));
        var buttons = $("<span >").addClass("buttons");
        li.append(buttons);
        buttons.append($("<span >").append($('<i class="xicon-cross"></i>')).click(function(e) {
            vis.clearSelection();
            e.stopPropagation();
            if(parents.length == 0) {
                vis.removeObject(obj);
            } else {
                var parent_collection = parents[parents.length - 1].objects;
                var idx = parent_collection.indexOf(obj);
                if(idx >= 0) {
                    parent_collection.splice(idx, 1);
                }
                vis.raise("objects");
            }
        }));
        li.click(function(e) {
            if(!e.shiftKey) vis.clearSelection();
            var ctx = obj.selectObject(Editor.data);
            ctx.obj = obj;
            var po = obj;
            for(var i = parents.length - 1; i >= 0; i--) {
                ctx = parents[i].selectObject(Editor.data, po, ctx);
                ctx.obj = parents[i];
                po = parents[i];
            }
            vis.appendSelection(ctx);
        });
        li.contextmenu(function(e) {
            var parent_collection = parents.length == 0 ? Editor.vis.objects : parents[parents.length - 1].objects;
            IV.popups.beginContextMenu(new IV.Vector(e.pageX, e.pageY), [
              { name: "F", display: "Bring to front" },
              { name: "-", display: "Bring forward" },
              { name: "+", display: "Bring backward" },
              { name: "B", display: "Bring to back" }
            ], function(c) {
                var idx = parent_collection.indexOf(obj);
                var target = 0;
                if(c == "F") target = 0;
                if(c == "-") target = idx - 1;
                if(c == "+") target = idx + 1;
                if(c == "B") target = parent_collection.length - 1;
                if(idx >= 0 && idx < parent_collection.length &&
                   target >= 0 && target < parent_collection.length &&
                   idx != target) {
                    if(idx > target) {
                        for(var t = idx; t > target; t--) {
                            parent_collection[t] = parent_collection[t - 1];
                        }
                        parent_collection[target] = obj;
                    }
                    if(idx < target) {
                        for(var t = idx; t < target; t++) {
                            parent_collection[t] = parent_collection[t + 1];
                        }
                        parent_collection[target] = obj;
                    }
                    Editor.generateObjectList();
                }
            });
        });
        var data = li.data();
        data.update = function() {
            if(parents.length == 0) {
                if(obj.selected) {
                    li.addClass("selected");
                } else {
                    li.removeClass("selected");
                }
            } else {
                if(parents[0].selected) {
                    var c = parents[0]._selection_context;
                    for(var k = 1; k < parents.length; k++) {
                        if(c.selected_object == parents[k]) {
                            c = c.selected_object;
                        } else {
                            break;
                        }
                    }
                    if(c.selected_object == obj) li.addClass("selected");
                    else li.removeClass("selected");
                } else {
                    li.removeClass("selected");
                }
            }
        };
        data.update();
        if(obj.type == "Component") {
            var ul2 = IV._E("ul");
            ul.append(ul2);
            obj.objects.forEach(function(o) {
                render_object(o, ul2, parents.concat([obj]));
            });
        }
    };

    for(var p in classes) {
        olist.append(IV._E("div", "selector", p));
        var ul = IV._E("ul", "objects");
        olist.append(ul);
        classes[p].forEach(function(obj) {
            render_object(obj, ul, []);
        });
    }
};

})();
