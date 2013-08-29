// Initialize editor.
IV.editor = {
    data: null,
    vis: null,
    renderer: new IV.Renderer(),
    canvas: new IV.CanvasManager()
};

IV.makeEventSource(IV.editor);

IV.editor.canvas.add("main", document.getElementById("canvas-main"));
IV.editor.canvas.add("font", document.getElementById("canvas-font"));
IV.editor.canvas.add("back", document.getElementById("canvas-back"));
IV.editor.canvas.add("overlay", document.getElementById("canvas-overlay"));

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
    if(schema) {
        IV.editor.schema = schema;
        IV.editor.renderDataSchema(IV.editor.schema);
    }
};

IV.editor.setVisualization = function(vis) {
    IV.editor.vis = vis;
    IV.editor.raise("reset");
};

IV.editor.unsetVisualization = function() {
    IV.editor.vis = null;
    IV.editor.raise("reset");
};

IV.editor.bind("reset", function() {
    IV.editor.renderer.trigger();
    IV.editor.renderer.render();
});
