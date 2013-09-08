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
    IV.generateObjectList();
});

Editor.bind("selection", function() {
    $("#object-list").children(".item").each(function() {
        $(this).data().update();
    });
});

{{include: objectlist.js}}
{{include: schemaview.js}}

{{include: style/style.js}}

{{include: ui.js}}

{{include: tools/tools.js}}

Editor.setData = function(data, schema) {
    Editor.data = data;
    Editor.renderer.setData(data);
    if(schema) {
        Editor.schema = schema;
        Editor.renderDataSchema(Editor.schema);
    }
};

Editor.setVisualization = function(vis) {
    Editor.vis = vis;
    Editor.raise("reset");
    Editor.renderer.setVisualization(vis);
    this.vis_listener = {
        objects: function() {
            Editor.renderer.trigger();
            Editor.renderer.render();
        }
    };
    vis.bind("objects", this.vis_listener.objects);
};

Editor.unsetVisualization = function() {
    Editor.vis.unbind("objects", this.vis_listener.objects);
    Editor.vis = null;
    Editor.raise("reset");
};

Editor.bind("reset", function() {
    Editor.renderer.trigger();
    Editor.renderer.render();
});

})();
