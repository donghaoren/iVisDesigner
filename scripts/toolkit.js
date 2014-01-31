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
    IV.server.reload_account(function() {
        if(IV.get("user") && !IV.get("user").anonymous) IV.raise("command:toolkit.start");
        else {
            IV.raise("command:account.login");
        }
    });
});

