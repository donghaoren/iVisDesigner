//. iVisDesigner - File: scripts/toolkit.js
//. Copyright 2013-2014 Donghao Ren
//. University of California, Santa Barbara, Peking University
//. See LICENSE.md for more information.

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

window.addEventListener("beforeunload", function (e) {
  var confirmationMessage = "Really want to exit iVisDesigner?";
  (e || window.event).returnValue = confirmationMessage;     //Gecko + IE
  return confirmationMessage;                                //Webkit, Safari, Chrome etc.
});

$(window).ready(function() {
    if(!browserTest()) return;
    // Remove the loading indicator.
    $("#system-loading").remove();
    IV.raise("initialize:before");
    IV.raise("initialize");
    IV.raise("initialize:after");
    if(window.isAllosphere) {

        return;
    }
    IV.server.reload_account(function() {
        if(IV.get("user") && !IV.get("user").anonymous) IV.raise("command:toolkit.start");
        else {
            IV.raise("command:account.login");
        }
    });
});

