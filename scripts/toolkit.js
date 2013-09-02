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

IV.newVisualization = function() {
    var vis = new IV.Visualization;
    IV.editor.setVisualization(vis);
    var line1 = new IV.objects.Line({
        path: new IV.Path(""),
        point1: new IV.objects.Plain(new IV.Vector(10, 0)),
        point2: new IV.objects.Plain(new IV.Vector(10, 100))
    });
    vis.addObject(line1);
};

IV.loadData = function(data, schema) {
    IV.editor.setData(data, schema);
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

$(function() {
    if(!browserTest()) return;
    // Remove the loading indicator.
    $("#system-loading").remove();
    IV.raise("initialize:before");
    IV.raise("initialize");
    IV.raise("initialize:after");
    IV.loadDataset("cardata", function() {

    });
});

