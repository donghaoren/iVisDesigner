// Copyright (c) 2014, The Regents of the University of California
// All rights reserved.
//
// Redistribution and use in source and binary forms, with or without modification,
// are permitted provided that the following conditions are met:
//
// 1. Redistributions of source code must retain the above copyright notice, this
//    list of conditions and the following disclaimer.
//
// 2. Redistributions in binary form must reproduce the above copyright notice,
//    this list of conditions and the following disclaimer in the documentation
//    and/or other materials provided with the distribution.
//
// 3. Neither the name of the copyright holder nor the names of its contributors
//    may be used to endorse or promote products derived from this software without
//    specific prior written permission.
//
// THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
// ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
// WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED.
// IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT,
// INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING,
// BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
// DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
// LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE
// OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED
// OF THE POSSIBILITY OF SUCH DAMAGE.

IV.config = $.extend({
    key: "defualt"
}, IV_Config);

// Data provider

{{include: client/client.js}}

IV.loadVisualization = function(vis) {
    if(!vis) {
        IV.editor.unsetVisualization();
        IV.editor.unsetWorkspace();
    } else {
        var workspace = vis;
        if(vis instanceof IV.Visualization) {
            IV.editor.setVisualization(vis);
            workspace = new IV.Workspace();
            var canvas = {
                name: "Canvas1",
                visualization: vis
            };
            workspace.addCanvas(canvas);
            workspace.default_canvas = canvas;
        }
        IV.editor.setWorkspace(workspace);
    }
};

IV.newVisualization = function() {
    // Just construct one for testing.
    var workspace = new IV.Workspace();
    workspace.addCanvas();
    IV.editor.setWorkspace(workspace);
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

    IV.server.reload_account(function() {
        if(window.isAllosphere) {
            return;
        }
        if(IV.get("user") && !IV.get("user").anonymous) IV.raise("command:toolkit.start");
        else {
            IV.raise("command:account.login");
        }
    });
});

