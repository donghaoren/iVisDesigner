Editor.generateObjectList = function() {
    var olist = $("#object-list");
    olist.children().remove();
    var vis = Editor.vis;
    if(!vis) return;

    var classes = { };

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
            vis.removeObject(obj);
            e.stopPropagation();
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
