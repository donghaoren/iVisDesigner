// iVisDesigner
// Author: Donghao Ren, PKUVIS, Peking University, 2013.04
// See LICENSE.txt for copyright information.

// scripts/toolkit.js
// The main javascript file for the toolkit.

// ------------------------------------------------------------------------
// Include Core
// ------------------------------------------------------------------------

{{include: core.js}}

// ------------------------------------------------------------------------
// Process Configuration
// ------------------------------------------------------------------------

IV.config = $.extend({
    key: "defualt"
}, IV_Config);

// ------------------------------------------------------------------------
// Canvas and Rendering
// ------------------------------------------------------------------------

IV.viewarea = {
    // The origin in screen coordinates.
    width: 0, height: 0,
    location: new IV.Vector(0.5, 0.5),
    // Scale factor.
    scale: 1,
    set: function(g) {
        var dev_ratio = window.devicePixelRatio || 1;
        var backing_ratio = g.webkitBackingStorePixelRatio ||
                                g.mozBackingStorePixelRatio ||
                                g.msBackingStorePixelRatio ||
                                g.oBackingStorePixelRatio ||
                                g.backingStorePixelRatio || 1;
        var ratio = dev_ratio / backing_ratio;
        g.scale(ratio, ratio);
        g.translate(this.location.x + this.width / 2, this.location.y + this.height / 2);
        g.scale(this.scale, this.scale);
    },
    transformRAWLocation: function(x, y) {
        var px = (x - this.location.x - this.width / 2) / this.scale;
        var py = (y - this.location.y - this.height / 2) / this.scale;
        return new IV.Vector(px, py);
    }
};

IV.canvas = {
    main: document.getElementById("canvas-main"),
    front: document.getElementById("canvas-front"),
    back: document.getElementById("canvas-back"),
    overlay: document.getElementById("canvas-overlay")
};

IV.needs_render = {
    main: false, front: false, back: false, overlay: false
};

IV.triggerRender = function(name) {
    var names = name.split(",");
    var map = {
        "tools": "front",
        "front": "front",
        "back": "back",
        "overlay": "overlay",
        "main": "main"
    };
    for(var i in names) {
        IV.needs_render[map[names[i]]] = true;
    }
};

IV.render = function() {
    if(IV.needs_render.main) {
        IV.renderMain();
        IV.needs_render.main = false;
    }
    if(IV.needs_render.front) {
        IV.renderFront();
        IV.needs_render.front = false;
    }
    if(IV.needs_render.back) {
        IV.renderBack();
        IV.needs_render.back = false;
    }
    if(IV.needs_render.overlay) {
        IV.renderOverlay();
        IV.needs_render.overlay = false;
    }
};

// Render functions.
IV.renderMain = function() {
    var ctx = IV.canvas.main.getContext("2d");
    ctx.clearRect(0, 0, IV.canvas.main.width, IV.canvas.main.height);
    ctx.save();
    IV.viewarea.set(ctx);

    if(IV.vis && IV.data) {
        IV.vis.render(ctx, IV.data);
    }
    ctx.restore();
};

IV.renderFront = function() {
    var ctx = IV.canvas.front.getContext("2d");
    ctx.clearRect(0, 0, IV.canvas.front.width, IV.canvas.front.height);
    ctx.save();
    IV.viewarea.set(ctx);

    if(IV.current_tool && IV.current_tool.render) {
        IV.current_tool.render(ctx, IV.data);
    }
    ctx.restore();
};

IV.renderBack = function() {
    var ctx = IV.canvas.back.getContext("2d");
    ctx.clearRect(0, 0, IV.canvas.back.width, IV.canvas.back.height);
    ctx.save();
    IV.viewarea.set(ctx);

    if(IV.vis && IV.data) {
        if(IV.get("visible-guide"))
            IV.vis.renderGuide(ctx, IV.data);
    }

    ctx.restore();
};

IV.renderOverlay = function() {
    var ctx = IV.canvas.overlay.getContext("2d");
    ctx.clearRect(0, 0, IV.canvas.overlay.width, IV.canvas.overlay.height);
    ctx.save();
    IV.viewarea.set(ctx);

    IV.tools.renderOverlay(ctx);

    ctx.restore();
};

// ------------------------------------------------------------------------
// Global Colors
// ------------------------------------------------------------------------
IV.colors = {
    selection: IV.parseColorHEX("1F77B4")
};

// ------------------------------------------------------------------------
// Global Events
// ------------------------------------------------------------------------
IV.addEvent("view-mousedown");
IV.addEvent("view-mousemove");
IV.addEvent("view-mouseup");

// Reset everything.
IV.addEvent("reset");

// Selected path
IV.add("selected-path", "string");

IV.add("visible-guide", "bool", true);
IV.listen("visible-guide", function(val) {
    IV.triggerRender("back");
    IV.render();
});

IV.on("reset", function() {
    IV.data = null; /*{
        name: null,
        schema: null,
        content: null
    };*/
    IV.vis = new IV.Visualization();
    IV.selection = [];
    /*
    IV.data.enumeratePath = IV.enumeratePath;
    IV.data.schemaAtPath = IV.schemaAtPath;
    */
});

// ------------------------------------------------------------------------
// Loading data schema and contents
// ------------------------------------------------------------------------
IV.renderSchema = function(schema, prev_path) {
    var elem = $("<ul></ul>");
    for(var key in schema) {
        var this_path = prev_path + ":" + key;
        if(prev_path == "") this_path = key;
        // Ignore all keys starting with _
        if(key[0] == '_') continue;
        // The child element.
        var child = schema[key];
        // Fix abbreviations.
        if(typeof(child) == "string") child = { "type": child };
        // The text for key.
        var span = $("<span></span>").text(key).addClass("key");
        // Types.
        if(child.type == "number")
            span.append($("<span />").text("num"));
        if(child.type == "collection")
            span.append($("<span />").text("set"));
        if(child.type == "object")
            span.append($("<span />").text("obj"));
        if(child.type == "sequence")
            span.append($("<span />").text("seq"));
        if(child.type == "reference")
            span.append($("<span />").text("ref"));
        span.data().schema = schema;
        span.data().key = key;
        span.data().path = this_path;
        var li = $("<li></li>")
            .append(span);
        // Append children.
        if(child.type == "collection" || child.type == "object" || child.type == "sequence")
            li.append(IV.renderSchema(child.fields, this_path));
        elem.append(li);
    }
    return elem;
};

IV.loadDataSchema = function(schema) {
    $("#data-schema").children().remove();
    $("#data-schema").append(IV.renderSchema(schema.fields, ""));
    $("#data-schema span.key").each(function() {
        var $this = $(this);
        $this.click(function() {
            $("#data-schema span.key").removeClass("active");
            $this.addClass("active");
            var data = $this.data();
            IV.set("selected-path", data.path);
        });
    });
};

IV.loadData = function(data) {
    IV.data = data;
};

IV.updateData = function() {
};

IV.loadDataset = function(name) {
    IV.raiseEvent("reset");
    IV.dataprovider.loadSchema(name)
    .done(function(schema) {
        // Set schema.
        IV.loadDataSchema(schema);
        // Load data content.
        IV.dataprovider.loadData(name)
        .done(function(data) {
            // We assume that the data follows the schema correctly.
            // Need some code to verify the above statement.
            IV.loadData(data);
        })
        .fail(function() {
            IV.log("Failed to load data content.");
        });
    })
    .fail(function() {
        IV.log("Failed to load data schema.");
    });
};

// ------------------------------------------------------------------------
// Include Other Files
// ------------------------------------------------------------------------

{{include: interface.js}}
{{include: dataprovider.js}}
{{include: tools/tools.js}}

// ------------------------------------------------------------------------
// System Initialization
// ------------------------------------------------------------------------
function browserTest() {
    if(!document.createElement("canvas").getContext) return false;
    return true;
}

$(function() {
    if(!browserTest()) return;
    // Remove the loading indicator.
    $("#system-loading").remove();
    // Default dataset: cardata.
    IV.loadDataset("cardata");
});

IV.test = function() {
    var track1 = new IV.objects.Track("days:min",
        new IV.objects.Point(new IV.Vector(200,100)),
        new IV.objects.Point(new IV.Vector(200,400)));
    var track2 = new IV.objects.Track("days:day",
        new IV.objects.Point(new IV.Vector(200,100)),
        new IV.objects.Point(new IV.Vector(500,100)));
    var track3 = new IV.objects.Track("days:max",
        new IV.objects.Point(new IV.Vector(600,400)),
        new IV.objects.Point(new IV.Vector(600,100)));
    var scatter = new IV.objects.Scatter(track1, track2);
    var circle = new IV.objects.Circle("days", {
        center: scatter,
        style: new IV.objects.Style({
            fill_style: new IV.Color(0, 0, 0, 0.2),
            radius: 5
        })
    });
    var line = new IV.objects.LineThrough("days", {
        points: scatter,
        point2: track3,
        style: new IV.objects.Style({
            stroke_style: new IV.Color(0, 0, 0, 0.2),
            width: 1,
            line_cap: "round",
            line_join: "round"
        })
    });

    IV.vis.addObject(track1);
    IV.vis.addObject(track2);
    IV.vis.addObject(track3);
    IV.vis.addObject(scatter);
    IV.vis.addObject(line);
    IV.vis.addObject(circle);
    IV.triggerRender("main,back");
    IV.render();
};
//setTimeout(IV.test, 300);
