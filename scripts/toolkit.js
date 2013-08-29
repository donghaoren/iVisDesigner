// iVisDesigner
// Author: Donghao Ren, PKUVIS, Peking University, 2013.04
// See LICENSE.txt for copyright information.

// scripts/toolkit.js
// The main javascript file for the toolkit.

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

IV.timerTick = function() {
    if(IV.vis) {
        IV.vis.timerTick();
    }
};

setInterval(function() {
    IV.timerTick();
    IV.render();
}, 30);


IV.on("vis:objects", function() {
    IV.generateObjectList();
});
IV.on("vis:objects:selection", function() {
    $("#object-list").children(".item").each(function() {
        $(this).data().update();
    });
});

IV.add("status", "string");
IV.listen("status", function(s) {
    $(".status-text").text(s);
});

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
IV.add("selected-reference", "string");

IV.add("visible-guide", "bool", true);
IV.listen("visible-guide", function(val) {
    IV.triggerRender("back");
    IV.render();
});

IV.on("reset", function() {
    IV.vis = new IV.Visualization(IV.data);
    IV.selection = [];
});



IV.loadData = function(data) {
    IV.data = data;
    IV.raiseEvent("reset");
};

IV.updateData = function() {
};

IV.loadDataset = function(name, callback) {
    IV.raiseEvent("reset");
    // Load data content.
    IV.dataprovider.loadData(name)
    .done(function(data) {
        // We assume that the data follows the schema correctly.
        // Need some code to verify the above statement.
        IV.renderDataSchema(data.schema);
        IV.loadData(data);
        data.onContentUpdate = function() {
            IV.triggerRender("main,front,back");
        };
        data.onSchemaUpdate = function() {
            IV.renderDataSchema(data.schema);
        };
        if(callback) callback();
    })
    .fail(function() {
        IV.log("Failed to load data content.");
    });
};

// ------------------------------------------------------------------------
// Include Other Files
// ------------------------------------------------------------------------

{{include: dataprovider.js}}
{{include: tools/tools.js}}

// ------------------------------------------------------------------------
// System Initialization
// ------------------------------------------------------------------------
function browserTest() {
    if(!document.createElement("canvas").getContext) return false;
    return true;
}

IV.test = function() {
    var L = new IV.objects.ForceLayout("vertices", "pt", "edges:A", "edges:B");
    L._runStep(IV.data);
    var track1 = new IV.objects.Track("vertices:pt:x",
        new IV.objects.Point(new IV.Vector(-100,-100)),
        new IV.objects.Point(new IV.Vector(-100,100)));
    var track2 = new IV.objects.Track("vertices:pt:y",
        new IV.objects.Point(new IV.Vector(-100,-100)),
        new IV.objects.Point(new IV.Vector(100,-100)));
    var scatter = new IV.objects.Scatter(track1, track2);
    var circle = new IV.objects.Circle("vertices", {
        center: scatter,
        style: new IV.objects.Style({
            fill_style: new IV.Color(0, 0, 0, 0.2),
            radius: 5
        })
    });
    IV.vis.addObject(track1);
    IV.vis.addObject(track2);
    IV.vis.addObject(scatter);
    IV.vis.addObject(circle);
    IV.vis.addObject(L);
    IV.triggerRender("main,back");
    IV.render();
    IV.generateObjectList();
};


$(function() {
    if(!browserTest()) return;
    // Remove the loading indicator.
    $("#system-loading").remove();
    // Default dataset: cardata.
    IV.loadDataset("cardata", function() {
        //IV.test();
        //IV.vis.addObject(new IV.objects.GoogleMap("stations:lng", "stations:lat", new IV.Vector(0, 0), 116.37371, 39.86390, 9));
        //IV.triggerRender();
        //IV.render();
        //IV.generateObjectList();
    });
});

