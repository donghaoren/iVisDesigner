// iVisDesigner
// Author: Donghao Ren, PKUVIS, Peking University, 2013.04
// See LICENSE.txt for copyright information.

// toolkit.js
// The main javascript file for the toolkit.

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
    IV.needs_render[name] = true;
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

};
IV.renderFront = function() {
    var ctx = IV.canvas.front.getContext("2d");
    ctx.clearRect(0, 0, IV.canvas.front.width, IV.canvas.front.height);
};
IV.renderBack = function() {
    var ctx = IV.canvas.back.getContext("2d");
    ctx.clearRect(0, 0, IV.canvas.back.width, IV.canvas.back.height);
};

// ------------------------------------------------------------------------
// Global Events
// ------------------------------------------------------------------------
IV.addEvent("view-mousedown");
IV.addEvent("view-mousemove");
IV.addEvent("view-mouseup");
IV.addEvent("select-schema");
// Reset everything.
IV.addEvent("reset");

IV.addListener("reset", function() {
    IV.data = {
        name: null,
        schema: null,
        content: null
    };
});

// ------------------------------------------------------------------------
// Loading data schema and contents
// ------------------------------------------------------------------------
IV.renderSchema = function(schema, prev_path) {
    var elem = $("<ul></ul>");
    for(var key in schema) {
        var this_path = prev_path + ":" + key;
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
    $("#data-schema").append(IV.renderSchema(schema, ""));
    $("#data-schema span.key").each(function() {
        var $this = $(this);
        $this.click(function() {
            $("#data-schema span.key").removeClass("active");
            $this.addClass("active");
            var data = $this.data();
            IV.raiseEvent("select-schema", data.path);
        });
    });
};

IV.loadData = function(data) {
    IV.data.content = data;
};

IV.updateData = function() {
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
{{include: objects/objects.js}}
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
