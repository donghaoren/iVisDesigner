// Initialize editor.
IV.editor = {
    data: null,
    vis: null,
    renderer: new IV.Renderer(),
    canvas: new IV.CanvasManager()
};

IV.makeEventSource(IV.editor);

IV.editor.renderer.setCanvasManager(IV.editor.canvas);

IV.editor.canvas.add("main", document.getElementById("canvas-main"));
IV.editor.canvas.add("front", document.getElementById("canvas-front"));
IV.editor.canvas.add("back", document.getElementById("canvas-back"));
IV.editor.canvas.add("overlay", document.getElementById("canvas-overlay"));
$(window).resize(function() {
    var v = $("#view");
    IV.editor.canvas.resize(v.width(), v.height(), true);
}).resize();

IV.editor.bind("objects", function() {
    IV.generateObjectList();
});

IV.editor.bind("selection", function() {
    $("#object-list").children(".item").each(function() {
        $(this).data().update();
    });
});

{{include: objectlist.js}}
{{include: schemaview.js}}

{{include: ui.js}}

{{include: tools/tools.js}}

IV.editor.setData = function(data, schema) {
    IV.editor.data = data;
    IV.editor.renderer.setData(data);
    if(schema) {
        IV.editor.schema = schema;
        IV.editor.renderDataSchema(IV.editor.schema);
    }
};

IV.editor.setVisualization = function(vis) {
    IV.editor.vis = vis;
    IV.editor.raise("reset");
    IV.editor.renderer.setVisualization(vis);
    this.vis_listener = {
        objects: function() {
            IV.editor.renderer.trigger();
            IV.editor.renderer.render();
        }
    };
    vis.bind("objects", this.vis_listener.objects);
};

IV.editor.unsetVisualization = function() {
    IV.editor.vis.unbind("objects", this.vis_listener.objects);
    IV.editor.vis = null;
    IV.editor.raise("reset");
};

IV.editor.bind("reset", function() {
    IV.editor.renderer.trigger();
    IV.editor.renderer.render();
});
