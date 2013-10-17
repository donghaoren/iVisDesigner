(function() {

{{include: utils.js}}

{{include: style.js}}

// Style editor.

(function() {

var Property = Editor.Property = { };

IV.makeEventSource(Property);

var current = null;
var current_context = null;

Property.beginEditProperty = function(obj) {
    current = obj;
    render();
};

Property.endEditProperty = function() {
    current = null;
    render();
};

Editor.bind("selection", function() {
    if(Editor.vis && Editor.vis.selection.length == 1) {
        current = Editor.vis.selection[0].obj;
        current_context = Editor.vis.selection[0].context;
        Property.beginEditProperty(current);
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
    IV.forEachInObject(groups, function(g, group) {
        container.append(render_caption(g));
        var target = $("<div />").addClass("item-action");
        group.forEach(function(item) {
            target.append(render_property_field(item));
        });

        container.append(target);
    });

    if(current.type == "Component" && context) {
        var toolbar = $("<div />").addClass("item-tools");
        toolbar.append($("<span />").addClass("btn").text("INTO").click(function() {
            Editor.beginEditingComponent(current.path, current_context, current.vis);
        }));
        container.append(toolbar);
    }
};

render();

})();

})();
