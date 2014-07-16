//. iVisDesigner - File: scripts/editor/property/property.js
//. Copyright 2013-2014 Donghao Ren
//. University of California, Santa Barbara, Peking University
//. See LICENSE.md for more information.

(function() {

{{include: render.js}}

{{include: style.js}}

// Style editor.

(function() {

var Property = Editor.Property = { };

IV.makeEventSource(Property);

var current = null;
//var current_context = null;

Property.beginEditProperty = function(obj) {
    current = obj;
    render();
};

Property.endEditProperty = function() {
    current = null;
    render();
};

var make_inspector = function(obj) {
    var r = IV._E("span");
    if(typeof(obj) == "object") {
        if(obj instanceof Array) {
        } else {
            var ul = IV._E("ul");
            for(var key in obj) {
                if(obj.hasOwnProperty(key) && key[0] != '_') {
                    var nest = make_inspector(obj[key]);
                    var li = IV._E("li");
                    li.append(IV._E("span", "", key + ":")).append(nest);
                    ul.append(li);
                }
            }
            r.append(ul);
        }
    } else {
        r.text(obj.toString());
    }
    return r;
};

Editor.bind("selection", function() {
    if(Editor.vis && Editor.vis.selection.length == 1) {
        current = Editor.vis.selection[0].obj;
        if(Editor.vis.selection[0].selected_object)
            current = Editor.vis.selection[0].selected_object;
        //current_context = Editor.vis.selection[0].context;
        Property.beginEditProperty(current);
        var context = Editor.vis.selection[0].context;
        if(context) {
            $("#data-inspector").children().remove();
            $("#data-inspector").append(make_inspector(context.val()));
        }
    } else {
        Property.endEditProperty();
    }
});

var render = function() {
    var container = $("#panel-property-display");
    container.children().remove();
    if(!current || !current.getPropertyContext) {
        container.append(render_info("Nothing Selected"));
        return;
    }
    var context = current.getPropertyContext();

    var groups = {};
    context.forEach(function(c) {
        if(!groups[c.group]) groups[c.group] = [];
        groups[c.group].push(c);
    });

    var render_item = function(item, target) {
        if(item.type == "nested") {
            var nested_group = IV._E("div", "nested");
            nested_group.append(render_nested_caption(item.name));
            item.properties.forEach(function(subitem) {
                render_item(subitem, nested_group);
            });
            target.append(nested_group);
        } else {
            target.append(render_property_field(item));
        }
    };

    IV.forEachInObject(groups, function(g, group) {
        container.append(render_caption(g));
        var target = $("<div />").addClass("item-action");
        group.forEach(function(item) {
            render_item(item, target);
        });

        container.append(target);
    });
};

render();

})();

})();
