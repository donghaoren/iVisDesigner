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

{{include: client/client.js}}

IV.loadVisualization = function(vis) {
    if(!vis) IV.editor.unsetVisualization();
    else IV.editor.setVisualization(vis);
};

IV.newVisualization = function() {
    // Just construct one for testing.
    var vis = new IV.Visualization;
    IV.editor.setVisualization(vis);
};

IV.loadData = function(data, schema) {
    IV.data = new IV.DataObject(data, schema);
    IV.editor.setData(IV.data);
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
    IV.raise("command:toolkit.start");
    IV.server.reload_account();
});

