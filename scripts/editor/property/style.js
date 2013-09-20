// Style editor.

(function() {

var Style = Editor.Style = { };

IV.makeEventSource(Style);

var current = new IV.objects.PathStyle;

Style.beginEditStyle = function(style) {
    current = style;
    render();
};

Style.endEditStyle = function() {
    if(current) current = current.clone();
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

var style_changed = function(obj, key) {
    return function(replace_val) {
        if(replace_val !== undefined) {
            obj[key] = replace_val;
            render();
        }
        Editor.renderer.trigger();
        Editor.renderer.render();
    };
};

var render = function() {
    var container = $("#panel-style-display");
    container.children().remove();
    if(!current) return;

    current.actions.forEach(function(act) {
        var target = $("<div />").addClass("item-action");
        var cap = "Unknown";
        if(act.type == "stroke") {
            container.append(render_caption("Stroke"));
            target.append(render_field("Color", act.color, "color", style_changed(act, "color")));
            target.append(render_field("Width", act.width, "number", style_changed(act, "width")));
            target.append(render_field("Join", act.join, "list", style_changed(act, "join"), [ "bevel", "round", "miter" ]));
            target.append(render_field("Cap", act.cap, "list", style_changed(act, "cap"), [ "butt", "round", "square" ]));
        }
        if(act.type == "fill") {
            container.append(render_caption("Fill"));
            target.append(render_field("Color", act.color, "color", style_changed(act, "color")));
        }
        container.append(target);
    });
};

render();

})();
