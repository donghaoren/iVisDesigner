(function() {

{{include: utils.js}}

{{include: style.js}}

// Style editor.

(function() {

var Property = Editor.Property = { };

IV.makeEventSource(Property);

var current = null;

Property.beginEditProperty = function(obj) {
    current = obj;
    render();
};

Property.endEditProperty = function() {
    current = null;
    render();
};

Editor.bind("selection", function() {
    if(Editor.vis.selection.length == 1) {
        current = Editor.vis.selection[0].obj;
        Property.beginEditProperty(current);
    } else {
        Property.endEditProperty();
    }
});

var render = function() {
    var container = $("#panel-property-display");
    container.children().remove();
    if(!current || !current.getPropertyContext) return;
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
            target.append(render_field(item.name, item.get(), item.type, function(val) {
                if(val !== undefined) {
                    item.set(val);
                    render();
                    Editor.renderer.trigger();
                    Editor.renderer.render();
                }
            }));
        });

        container.append(target);
    });
};

render();

})();

})();
