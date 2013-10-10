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
    var actions = current.actions;

    var make_caption = function(text, act) {
        var r = render_caption(text);
        r.append($("<span />").addClass("rightmost btn").append($('<i class="xicon-cross"></i>')).click(function() {
            var idx = actions.indexOf(act);
            if(idx >= 0) {
                actions.splice(idx, 1);
                render();
                Editor.renderer.trigger();
                Editor.renderer.render();
            }
        }))
        return r;
    };

    var toolbar = $("<div />").addClass("item-tools");
    toolbar.append($("<span />").addClass("btn").text("+").click(function() {
        IV.popups.beginContextMenu($(this), [ "Stroke", "Fill" ], function(s) {
            if(s == "Fill") {
                actions.push({
                    type: "fill",
                    color: new IV.objects.Plain(new IV.Color(128, 128, 128, 1))
                });
            }
            if(s == "Stroke") {
                actions.push({
                    type: "stroke",
                    color: new IV.objects.Plain(new IV.Color(0, 0, 0, 1)),
                    width: new IV.objects.Plain(1),
                    join: new IV.objects.Plain("round"),
                    cap: new IV.objects.Plain("round")
                });
            }
            render();
            Editor.renderer.trigger();
            Editor.renderer.render();
        });
    }));

    actions.forEach(function(act) {
        var target = $("<div />").addClass("item-action");
        var cap = "Unknown";
        if(act.type == "stroke") {
            container.append(make_caption("Stroke", act));
            target.append(build_style_property_item("Color", act, "color", "color"));
            target.append(build_style_property_item("Width", act, "width", "number"));
            target.append(build_style_property_item("Join", act, "join", "list", [ "bevel", "round", "miter" ]));
            target.append(build_style_property_item("Cap", act, "cap", "list", [ "butt", "round", "square" ]));
        }
        if(act.type == "fill") {
            container.append(make_caption("Fill", act));
            target.append(build_style_property_item("Color", act, "color", "color"));
        }
        container.append(target);
    });
    container.append(toolbar);
};

render();

})();
