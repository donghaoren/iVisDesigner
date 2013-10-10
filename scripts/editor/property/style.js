// Style editor.

(function() {

var Style = Editor.Style = { };

IV.makeEventSource(Style);

var current = null; //new IV.objects.PathStyle;

Style.beginEditStyle = function(style) {
    current = style;
    render();
};

Style.endEditStyle = function() {
    current = null;
    //if(current) current = current.clone();
    render();
};

Editor.bind("selection", function() {
    if(Editor.vis.selection.length == 1) {
        var selobj = Editor.vis.selection[0].obj;
        if(selobj.style) {
            Editor.Style.beginEditStyle(selobj.style);
        } else {
            Editor.Style.endEditStyle();
        }
    } else {
        Editor.Style.endEditStyle();
    }
});

var build_style_property_item = function(name, act, key, type, args) {
    return render_property_field({
        name: name,
        args: args,
        type: type,
        get: function() {
            return act[key];
        },
        set: function(val) {
            act[key] = val;
        }
    });
};

var render = function() {
    var container = $("#panel-style-display");
    container.children().remove();
    if(!current) {
        container.append(render_info("Nothing Selected"));
        return;
    }

    current.actions.forEach(function(act) {
        var target = $("<div />").addClass("item-action");
        var cap = "Unknown";
        if(act.type == "stroke") {
            container.append(render_caption("Stroke"));
            target.append(build_style_property_item("Color", act, "color", "color"));
            target.append(build_style_property_item("Width", act, "width", "number"));
            target.append(build_style_property_item("Join", act, "join", "list", [ "bevel", "round", "miter" ]));
            target.append(build_style_property_item("Cap", act, "cap", "list", [ "butt", "round", "square" ]));
        }
        if(act.type == "fill") {
            container.append(render_caption("Fill"));
            target.append(build_style_property_item("Color", act, "color", "color"));
        }
        container.append(target);
    });
};

render();

})();
