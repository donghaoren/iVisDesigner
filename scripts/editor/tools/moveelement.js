// iVisDesigner - scripts/editor/tools/moveelement.js
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

Tools.MoveElement = {
    onActive: function() {
        var $this = this;
        if(Editor.vis) Editor.vis.clearSelection();
        Tools.triggerRender(["main", "back"]);
        IV.set("status", "Select element.");

        Tools.beginSelectObject(function(context, e_down) {
            if(context) {
                if(Editor.vis) {
                    Editor.vis.clearSelection();
                    Editor.vis.appendSelection(context);
                }
            } else {
                Editor.vis.clearSelection();
                return;
            }
            if(context.onMove) {
                var handle_r = function(r) {
                    if(!r) return;
                    if(r.trigger_render) Tools.triggerRender(r.trigger_render);
                };
                e_down.move(function(e_move) {
                    var p0 = e_down.offset;
                    var p1 = e_move.offset;
                    var r = context.onMove(p0, p1);
                    Tools.triggerRender("main,back,front,overlay");
                    handle_r(r);
                });
                e_down.release(function(e_release) {
                    var p0 = e_down.offset;
                    var p1 = e_release.offset;
                    if(context.onRelease) {
                        var r = context.onRelease(p0, p1);
                        handle_r(r);
                    }
                });
            }
        }, "tools:MoveElement", "move-element");
    },
    onInactive: function() {
        Tools.endSelectObject("tools:MoveElement");
    }
};

})();
