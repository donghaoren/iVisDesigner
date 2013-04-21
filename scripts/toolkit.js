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
// Canvas and Rendering
// ------------------------------------------------------------------------
IV.canvas = {
    main: document.getElementById("canvas-main"),
    front: document.getElementById("canvas-front"),
    back: document.getElementById("canvas-back")
};

IV.needs_render = {
    main: false, front: false, back: false
};

IV.triggerRender = function(name) {
    var names = name.split(",");
    var map = {
        "tools": "front",
        "front": "front",
        "back": "back",
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
};

// Render functions.
IV.renderMain = function() {
    var ctx = IV.canvas.main.getContext("2d");
    ctx.clearRect(0, 0, IV.canvas.main.width, IV.canvas.main.height);

    if(IV.vis) {
        IV.vis.render(ctx, IV.data);
    }
};

IV.renderFront = function() {
    var ctx = IV.canvas.front.getContext("2d");
    ctx.clearRect(0, 0, IV.canvas.front.width, IV.canvas.front.height);

    if(IV.current_tool && IV.current_tool.render) {
        IV.current_tool.render(ctx);
    }
};

IV.renderBack = function() {
    var ctx = IV.canvas.back.getContext("2d");
    ctx.clearRect(0, 0, IV.canvas.back.width, IV.canvas.back.height);

    if(IV.vis) {
        IV.vis.renderGuide(ctx, IV.data);
    }
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

IV.on("reset", function() {
    IV.data = {
        name: null,
        schema: null,
        content: null
    };
    IV.vis = new IV.Visualization();
    IV.selection = [];
    IV.data.enumeratePath = IV.enumeratePath;
    IV.data.schemaAtPath = IV.schemaAtPath;
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
    IV.data.schema = schema;
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
    IV.data.content = data;
};

IV.updateData = function() {
};

IV.schemaAtPath = function(path) {
    var schema = IV.data.schema;
    if(!path || path == "") return schema;
    var split = path.split(":");
    for(var i in split) {
        if(!schema || !schema.fields) return null;
        var c = split[i];
        schema = schema.fields[c];
    }
    return schema;
};

IV.enumeratePath = function(path, callback) {
    var context = { };
    context.get = function(path) {
        if(context[path] !== undefined) return context[path];
        var split = path.split(":");
        var ctx = context._tree;
        var rslt = null;
        for(var i = 0; i < split.length; i++) {
            var c = split[i];
            if(ctx[c]) {
                ctx = ctx[c];
            } else {
                rslt = ctx._obj;
                for(var j = i; j < split.length; j++) {
                    if(rslt) rslt = rslt[split[j]];
                }
                break;
            }
            if(i == split.length - 1) {
                rslt = ctx._obj;
            }
        }
        return rslt;
    };
    context._tree = { };
    context._tree._obj = IV.data.content;
    context.getSchema = IV.data.schemaAtPath;
    if(!path || path == "") {
        callback(context);
        return;
    }
    var process_level = function(prefix, spath, ctx, schema_fields, data) {
        //console.log(prefix, spath, ctx, schema_fields, data);
        if(spath.length == 0) {
            callback(context);
            return;
        }
        var here = spath[0];
        var schema_here = schema_fields[here];
        var data_here = data[here];
        var path_here = prefix.concat([here]);
        if(schema_here.type == "collection" || schema_here.type == "sequence") {
            for(var i in data_here) {
                ctx[here] = {
                    _obj: data_here[i]
                };
                context[path_here] = data_here[i];
                process_level(path_here, spath.slice(1), ctx[here], schema_here.fields, data_here[i]);
            }
        } else {
            ctx[here] = {
                _obj: data_here
            };
            var val = data_here[i];
            context[path_here] = val;
            process_level(path_here, spath.slice(1), ctx[here], schema_here.fields, data_here);
        }
    };
    process_level([], path.split(":"), context._tree, IV.data.schema.fields, IV.data.content);
};

IV.loadDataset = function(name) {
    IV.raiseEvent("reset");
    IV.dataprovider.loadSchema(name)
    .done(function(schema) {
        // Metadata.
        IV.data.name = name;
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
    var track1 = new IV.objects.Track("cars:mpg",
        new IV.objects.Point(new IV.Vector(200,100)),
        new IV.objects.Point(new IV.Vector(200,400)));
    var track2 = new IV.objects.Track("cars:displacement",
        new IV.objects.Point(new IV.Vector(200,100)),
        new IV.objects.Point(new IV.Vector(500,100)));
    var track3 = new IV.objects.Track("cars:acceleration",
        new IV.objects.Point(new IV.Vector(600,100)),
        new IV.objects.Point(new IV.Vector(600,400)));
    var scatter = new IV.objects.Scatter(track1, track2);
    var circle = new IV.objects.Circle("cars", {
        center: scatter,
        style: new IV.objects.Style({
            fill_style: new IV.Color(0, 0, 0, 0.2),
            radius: 3
        })
    });
    var line = new IV.objects.Line("cars", {
        point1: scatter,
        point2: track3,
        style: new IV.objects.Style({
            stroke_style: new IV.Color(0, 0, 0, 0.2)
        })
    });

    IV.vis.addObject(track1);
    IV.vis.addObject(track2);
    IV.vis.addObject(track3);
    IV.vis.addObject(circle);
    IV.vis.addObject(line);
    IV.triggerRender("main,back");
    IV.render();
};
setTimeout(IV.test, 300);
