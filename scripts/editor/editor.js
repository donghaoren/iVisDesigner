//. iVisDesigner - File: scripts/editor/editor.js
//. Copyright 2013-2014 Donghao Ren
//. University of California, Santa Barbara, Peking University
//. See LICENSE.md for more information.

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
Editor.set("selected-reference", null);

Editor.set("current-component", null);

Editor.doAddObject = function(obj) {
    if(Editor.vis) {
        var current_component = Editor.get("current-component");
        if(current_component) {
            obj.parent = current_component;
            current_component.addObject(obj);
        } else {
            Editor.vis.addObject(obj);
            Editor.vis.clearSelection();
            var ctx = obj.selectObject(Editor.data);
            ctx.obj = obj;
            Editor.vis.appendSelection(ctx);
        }
    }
};

{{include: objectlist.js}}
{{include: schemaview.js}}

{{include: popups/popups.js}}

{{include: property/property.js}}

{{include: ui.js}}

{{include: tools/tools.js}}

{{include: actionmanager.js}}

Editor.setData = function(data) {
    Editor.data = data;
    Editor.renderer.setData(Editor.data);
    Editor.schema = data.getSchema();
    Editor.computeDataStatistics();
    Editor.renderDataSchema(Editor.schema);
    data.bind("update", function() {
        Editor.computeDataStatistics();
        Editor.renderDataSchema(Editor.schema);
        Editor.renderer.trigger();
        Editor.renderer.render();
    });
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

    Editor.raise("reset");
};

Editor.unsetVisualization = function() {
    if(Editor.vis) {
        Editor.vis.unbind("objects", this.vis_listener.objects);
        Editor.vis.unbind("selection", this.vis_listener.selection);
        Editor.renderer.setVisualization(null);
        Editor.vis = null;
        Editor.raise("reset");
    }
};

Editor.component_stack = [];
Editor.beginEditingComponent = function(path, context, component_vis) {
    Editor.component_stack.push({
        data: Editor.data,
        vis: Editor.vis,
        render_config: Editor.renderer.getConfig()
    });
    Editor.component_path = path;
    Editor.setData(Editor.data.createSubset(path, context));
    Editor.setVisualization(component_vis);
    Editor.raise("reset");
};
Editor.endEditingComponent = function() {
    var item = Editor.component_stack.pop();
    if(item) {
        Editor.setData(item.data);
        Editor.setVisualization(item.vis);
        Editor.renderer.setConfig(item.render_config);
        Editor.raise("reset");
    }
};

Editor.computePathStatistics = function(path) {
    return Editor.data.computeFullStatistics(path);
};

Editor.bind("reset", function() {
    Editor.raise("selection");
    Editor.raise("objects");

    Editor.set("selected-path", new IV.Path());
    Editor.set("selected-reference", null);

    Editor.set("current-component", null);

    if(Editor.vis)
        Editor.renderer.autoView(Editor.vis);
    Editor.renderer.trigger();
    Editor.renderer.render();
    if(Editor.component_stack.length > 0) {
        $('[data-for="component-view"]').show();
    } else {
        $('[data-for="component-view"]').hide();
    }
});

IV.set("visible-guide", true);
IV.set("visible-grid", false);
IV.set("render-2x", IV.getOptimalRatio() == 2);

IV.listen("visible-guide", function(val) {
    Editor.renderer.show_guide = val;
    Editor.renderer.trigger();
    Editor.renderer.render();
});

IV.listen("visible-grid", function(val) {
    Editor.renderer.frame_origin = val;
    Editor.renderer.frame_grid = val;
    Editor.renderer.trigger();
    Editor.renderer.render();
});


IV.listen("render-2x", function(val) {
    if(val) {
        Editor.renderer.manager.setResolutionRatio(2);
    } else {
        Editor.renderer.manager.setResolutionRatio(1);
    }
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

Editor.exportBitmap = function(scale) {
    if(!scale) scale = 2; // default as 2x

    var vis = Editor.vis;
    var data = Editor.data;

    var manager = new IV.CanvasManager(Math.ceil(vis.artboard.width), Math.ceil(vis.artboard.height));
    var add_canvas = function() {
        var c = document.createElement("canvas");
        return c;
    };

    manager.add("main", add_canvas());
    manager.add("front", add_canvas());
    manager.add("back", add_canvas());
    manager.add("overlay", add_canvas());
    manager.setResolutionRatio(scale);


    var renderer = new IV.Renderer();
    renderer.setCanvasManager(manager);
    renderer.setData(data);
    renderer.setVisualization(vis);

    renderer.frame_grid = false;
    renderer.show_guide = false;
    renderer.autoView(vis);

    renderer.trigger();
    renderer.render();

    var back = manager.get("back");
    var ctx = back.getContext("2d");
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.drawImage(manager.get("main"), 0, 0);
    ctx.drawImage(manager.get("front"), 0, 0);
    return back.toDataURL("image/png");
};

IV.on("command:toolkit.export.svg", function() {
    var svg = Editor.renderer.renderSVG();
    IV.downloadFile(svg, "image/svg", "ivisdesigner.svg");
});
IV.on("command:toolkit.export.bitmap", function() {
    var bmp_base64 = Editor.renderer.renderBitmap(2);
    IV.downloadFile(bmp_base64, "image/png", "ivisdesigner.png", "base64");
});

})();
