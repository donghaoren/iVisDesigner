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
