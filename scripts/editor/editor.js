(function() {

// Initialize editor.
var Editor = {
    data: null,
    vis: null,
    renderer: new IV.Renderer(),
    canvas: new IV.CanvasManager()
};

IV.editor = Editor;

IV.makeEventSource(Editor);

Editor.renderer.setCanvasManager(Editor.canvas);

Editor.canvas.add("main", document.getElementById("canvas-main"));
Editor.canvas.add("front", document.getElementById("canvas-front"));
Editor.canvas.add("back", document.getElementById("canvas-back"));
Editor.canvas.add("overlay", document.getElementById("canvas-overlay"));

$(window).resize(function() {
    var v = $("#view");
    Editor.canvas.resize(v.width(), v.height(), true);
    Editor.renderer.trigger();
    Editor.renderer.render();
}).resize();

Editor.bind("objects", function() {
    Editor.generateObjectList();
    if(Editor.schema) {
        Editor.renderDataSchema(Editor.schema);
    }
});

Editor.bind("selection", function() {
    $("#object-list").children(".item").each(function() {
        $(this).data().update();
    });
    Editor.generateObjectList();
});

Editor.set("selected-path", new IV.Path());

Editor.doAddObject = function(obj) {
    if(Editor.vis) {
        Editor.vis.addObject(obj);
    }
};

{{include: objectlist.js}}
{{include: schemaview.js}}

{{include: popups/popups.js}}

{{include: property/property.js}}

{{include: ui.js}}

{{include: tools/tools.js}}

Editor.setData = function(data) {
    Editor.data = data;
    Editor.renderer.setData(Editor.data);
    Editor.schema = data.getSchema();
    Editor.renderDataSchema(Editor.schema);
    if(Editor.vis) {
        Editor.vis.data = Editor.data;
    }
};

Editor.setVisualization = function(vis) {
    Editor.unsetVisualization();
    Editor.vis = vis;
    if(Editor.data) {
        Editor.vis.data = Editor.data;
    }
    Editor.raise("reset");
    Editor.renderer.setVisualization(vis);
    this.vis_listener = {
        objects: function() {
            Editor.raise("objects");
            Editor.renderer.trigger();
            Editor.renderer.render();
        },
        selection: function() {
            Editor.raise("selection");
            Editor.renderer.trigger();
            Editor.renderer.render();
        }
    };
    vis.bind("objects", this.vis_listener.objects);
    vis.bind("selection", this.vis_listener.selection);
};

Editor.unsetVisualization = function() {
    if(Editor.vis) {
        Editor.vis.unbind("objects", this.vis_listener.objects);
        Editor.vis.unbind("selection", this.vis_listener.selection);
        Editor.vis = null;
        Editor.raise("reset");
    }
};

Editor.component_stack = [];
Editor.beginEditingComponent = function(path, context, component_vis) {
    Editor.component_stack.push({
        data: Editor.data,
        vis: Editor.vis,
        view: Editor.renderer.getView()
    });
    Editor.setData(Editor.data.createSubset(path, context));
    Editor.setVisualization(component_vis);
    Editor.raise("reset");
};
Editor.endEditingComponent = function() {
    var item = Editor.component_stack.pop();
    if(item) {
        Editor.setData(item.data);
        Editor.setVisualization(item.vis);
        Editor.renderer.setView(item.view.center, item.view.scale);
        Editor.raise("reset");
    }
};

Editor.bind("reset", function() {
    Editor.renderer.trigger();
    Editor.renderer.render();
});

setInterval(function() {
    if(Editor.vis && Editor.data) {
        Editor.vis.timerTick(Editor.data);
        Editor.vis.triggerRenderer(Editor.renderer);
        Editor.renderer.render();
    }
}, 30);

})();
