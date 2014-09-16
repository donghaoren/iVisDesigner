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

Tools.Move = {
    onActive: function() {
        var $this = this;
        IV.set("status", "Drag to move the canvas.");
        Tools.beginTrackMouse(function(e_down) {
            var p0 = e_down.page;
            var l0 = Editor.renderer.center.clone();
            e_down.move(function(e_move) {
                var p1 = e_move.page;
                Editor.renderer.setView(l0.add(new IV.Vector(p1.x - p0.x, p0.y - p1.y)), Editor.renderer.scale);
                Tools.triggerRender();
            });
        }, "tools:Move");
    },
    onInactive: function() {
        Tools.endTrackMouse("tools:Move");
    }
};

Tools.Zoom = {
    onActive: function() {
        var $this = this;
        IV.set("status", "Drag to zoom the canvas.");
        Tools.beginTrackMouse(function(e_down) {
            var y0 = e_down.page.y;
            var l0 = Editor.renderer.center.clone();
            var s0 = Editor.renderer.scale;
            var p0 = e_down.offset;
            e_down.move(function(e_move) {
                var new_scale = s0 * Math.exp((e_move.page.y - y0) / -200.0);
                if(new_scale > 500) new_scale = 500;
                if(new_scale < 1.0 / 500) new_scale = 1.0 / 500;
                Editor.renderer.setView(l0.add(p0.scale(s0 - new_scale)), new_scale);
                Tools.triggerRender();
            });
        }, "tools:Zoom");
    },
    onInactive: function() {
        Tools.endTrackMouse("tools:Zoom");
    }
};

Tools.Artboard = {
    onActive: function() {
        var $this = this;
        IV.set("status", "Drag to change the artboard.");
        Tools.beginTrackMouse(function(e_down) {
            e_down.move(function(e_move) {
                if(Editor.vis) {
                    Editor.vis.artboard = new IV.Rectangle(
                        Math.min(e_down.offset.x, e_move.offset.x), Math.min(e_down.offset.y, e_move.offset.y),
                        Math.abs(e_down.offset.x - e_move.offset.x), Math.abs(e_down.offset.y - e_move.offset.y)
                    );
                    Tools.triggerRender();
                }
            });
        }, "tools:Zoom");
    },
    onInactive: function() {
        Tools.endTrackMouse("tools:Zoom");
    }
};

})();
