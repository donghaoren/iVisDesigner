// iVisDesigner - scripts/editor/workspace.js
// Author: Donghao Ren
//
// LICENSE
//
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

(function() {

Editor.renderWorkspaceMenu = function() {
    var container = $("#workspace-container");
    container.children().remove();
    if(!Editor.workspace) return;
    var w = Editor.workspace;
    w.canvases.forEach(function(canvas) {
        var li = IV._E("li");
        var span = IV._E("span", "", canvas.name);
        span.append('<span class="toggle-indicator"><i class="xicon-mark"></i></span>');
        li.append(span);
        span.click(function() {
            Editor.workspaceSwitchCanvas(canvas);
        });
        if(w.default_canvas == canvas) {
            span.addClass("toggle-on");
        }
        container.append(li);
    });
    container.append(IV._E("li", "divider"));
    var li = IV._E("li");
    var span = IV._E("span", "", "New Canvas");
    span.click(function() {
        var info = {
            visualization: new IV.Visualization(),
        }
        Editor.workspace.addCanvas(info);
        Editor.workspaceSwitchCanvas(info);
        Editor.renderWorkspaceMenu();
    });
    li.append(span);
    container.append(li);
};

})();
