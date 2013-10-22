// iVisDesigner
// Author: Donghao Ren, PKUVIS, Peking University, 2013.04
// See LICENSE.txt for copyright information.

// scripts/toolkit.js
// The main javascript file for the toolkit.

// Configuration

IV.config = $.extend({
    key: "defualt"
}, IV_Config);

// Data provider

{{include: dataprovider.js}}
{{include: client.js}}

IV.newVisualization = function() {
    // Just construct one for testing.
    var vis = new IV.Visualization;
    IV.editor.setVisualization(vis);

    var stat = IV.Path.computeBasicStatistics(new IV.Path("[cars]:mpg"), IV.data);
    var axis1 = new IV.objects.Track({
        path: new IV.Path("[cars]:mpg"),
        anchor1: new IV.objects.Plain(new IV.Vector(-5, 0)),
        anchor2: new IV.objects.Plain(new IV.Vector(-5, 100)),
        min: new IV.objects.Plain(stat.min - stat.range / 10),
        max: new IV.objects.Plain(stat.max + stat.range / 10)
    });
    var stat = IV.Path.computeBasicStatistics(new IV.Path("[cars]:horsepower"), IV.data);
    var axis2 = new IV.objects.Track({
        path: new IV.Path("[cars]:horsepower"),
        anchor1: new IV.objects.Plain(new IV.Vector(100, -5)),
        anchor2: new IV.objects.Plain(new IV.Vector(0, -5)),
        min: new IV.objects.Plain(stat.min - stat.range / 10),
        max: new IV.objects.Plain(stat.max + stat.range / 10)
    });
    var scatter = new IV.objects.Scatter({
        track1: axis1,
        track2: axis2
    });
    var pt = new IV.objects.Circle({
        path: new IV.Path("[cars]"),
        center: scatter,
        radius: new IV.objects.Plain(2)
    });
    vis.addObject(axis1);
    vis.addObject(axis2);
    vis.addObject(scatter);
    vis.addObject(pt);

    var stat = IV.Path.computeBasicStatistics(new IV.Path("[days]:day"), IV.data);
    var axis1 = new IV.objects.Track({
        path: new IV.Path("[days]:day"),
        anchor1: new IV.objects.Plain(new IV.Vector(-300 - 20, -5)),
        anchor2: new IV.objects.Plain(new IV.Vector(-20, -5)),
        min: new IV.objects.Plain(stat.min - stat.range / 10),
        max: new IV.objects.Plain(stat.max + stat.range / 10)
    });
    var stat = IV.Path.computeBasicStatistics(new IV.Path("[days]:min"), IV.data);
    var axis2 = new IV.objects.Track({
        path: new IV.Path("[days]:min"),
        anchor1: new IV.objects.Plain(new IV.Vector(-15, 0)),
        anchor2: new IV.objects.Plain(new IV.Vector(-15, 100)),
        min: new IV.objects.Plain(stat.min - stat.range / 10),
        max: new IV.objects.Plain(stat.max + stat.range / 10)
    });
    var scatter = new IV.objects.Scatter({
        track1: axis1,
        track2: axis2
    });
    var cc = new IV.objects.Circle({
        path: new IV.Path("[days]"),
        center: scatter,
        radius: new IV.objects.Plain(2)
    });
    var pt = new IV.objects.LineThrough({
        path: new IV.Path(),
        points: scatter
    });

    var layout = new IV.objects.ForceLayout({
        path_nodes: new IV.Path("[nodes]"),
        path_edgeA: new IV.Path("[links]:source:&"),
        path_edgeB: new IV.Path("[links]:target:&")
    });

    pt.style.actions.splice(0, 1);
    vis.addObject(axis1);
    vis.addObject(axis2);
    vis.addObject(scatter);
    vis.addObject(pt);
    vis.addObject(layout);
};

IV.newVisualization2 = function() {
    // Just construct one for testing.
    var vis = new IV.Visualization;
    IV.editor.setVisualization(vis);

    var stat = IV.Path.computeBasicStatistics(new IV.Path("[cars]:mpg"), IV.data);
    var axis1 = new IV.objects.Track({
        path: new IV.Path("[cars]:mpg"),
        anchor1: new IV.objects.Plain(new IV.Vector(-205, -200)),
        anchor2: new IV.objects.Plain(new IV.Vector(-205, 200)),
        min: new IV.objects.Plain(stat.min - stat.range / 10),
        max: new IV.objects.Plain(stat.max + stat.range / 10)
    });
    var stat = IV.Path.computeBasicStatistics(new IV.Path("[cars]:horsepower"), IV.data);
    var axis2 = new IV.objects.Track({
        path: new IV.Path("[cars]:horsepower"),
        anchor1: new IV.objects.Plain(new IV.Vector(200, -205)),
        anchor2: new IV.objects.Plain(new IV.Vector(-200, -205)),
        min: new IV.objects.Plain(stat.min - stat.range / 10),
        max: new IV.objects.Plain(stat.max + stat.range / 10)
    });
    var scatter = new IV.objects.Scatter({
        track1: axis1,
        track2: axis2
    });
    var pt = new IV.objects.Component({
        path: new IV.Path("[cars]"),
        center: scatter
    });
    var circle = new IV.objects.Circle({
        path: new IV.Path(""),
        radius: new IV.objects.NumberLinear(new IV.Path("acceleration"), 2, 5, 7, 25)
    });
    pt.vis.addObject(circle);
    vis.addObject(axis1);
    vis.addObject(axis2);
    vis.addObject(scatter);
    vis.addObject(pt);
};

IV.loadData = function(data, schema) {
    IV.data = new IV.DataObject(data, schema);
    IV.editor.setData(IV.data);
    IV.newVisualization();
};

IV.loadDataset = function(name, callback) {
    // Load data content.
    IV.dataprovider.loadData(name)
    .done(function(data) {
        // We assume that the data follows the schema correctly.
        // Need some code to verify the above statement.
        IV.loadData(data.obj, data.schema);
        if(callback) callback();
    })
    .fail(function() {
        IV.log("Failed to load data content.");
    });
};

// ------------------------------------------------------------------------
// System Initialization
// ------------------------------------------------------------------------
function browserTest() {
    if(!document.createElement("canvas").getContext) return false;
    return true;
}

IV.user = null;

$(function() {
    if(!browserTest()) return;
    // Remove the loading indicator.
    $("#system-loading").remove();
    IV.raise("initialize:before");
    IV.raise("initialize");
    IV.raise("initialize:after");
    IV.loadDataset("test", function() {

    });

    IV.server.get("account", function(err, data) {
        if(err) {
        } else {
            IV.set("user", data);
        }
    });
});

