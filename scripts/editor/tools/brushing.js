// iVisDesigner - File: scripts/editor/tools/brushing.js
// Copyright (c) 2013-2014, Donghao Ren
// University of California Santa Barbara, Peking University
// Advised by Prof. Tobias Hollerer and previously by Prof. Xiaoru Yuan.
//
// All rights reserved.
//
// Redistribution and use in source and binary forms, with or without
// modification, are permitted provided that the following conditions are met:
//
// 1. Redistributions of source code must retain the above copyright notice,
//    this list of conditions and the following disclaimer.
//
// 2. Redistributions in binary form must reproduce the above copyright
//    notice, this list of conditions and the following disclaimer in the
//    documentation and/or other materials provided with the distribution.
//
// THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS
// IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO,
// THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR
// PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR
// CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
// EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,
// PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS;
// OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY,
// WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR
// OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF
// ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

(function() {

Tools.Brushing = {
    onActive: function() {
        this.lasso = [];
        var $this = this;

        if(Editor.vis && Editor.data) {
            if(Editor.vis.selection.length != 1 || !Editor.vis.selection[0].obj.performBrushing) {
                Editor.vis.clearSelection();
                for(var i = 0; i < Editor.vis.objects.length; i++) {
                    var o = Editor.vis.objects[i];
                    console.log(o);
                    if(o.performBrushing) {
                        var ctx = o.selectObject(Editor.data);
                        ctx.obj = o;
                        Editor.vis.appendSelection(ctx);
                        break;
                    }
                }
            }
        }

        Tools.beginTrackMouse(function(e) {
            $this.lasso.push(e.offset);

            e.move(function(e_move) {
                $this.lasso.push(e_move.offset);
                Tools.triggerRender("overlay");
            });
            e.release(function(e_release) {
                var lasso = $this.lasso;
                $this.lasso = [];
                Tools.triggerRender("overlay");
                if(Editor.vis) {
                    if(Editor.vis.selection.length == 1) {
                        var target = Editor.vis.selection[0].obj;
                        if(target.performBrushing) {
                            var r = Editor.vis.lassoObject(Editor.data, lasso, function(object, context) {
                                target.performBrushing(Editor.data, context);
                            });
                        }
                    }
                    Tools.triggerRender();
                }
            });
        }, "tools:Brushing");
    },
    renderOverlay: function(g) {
        if(this.lasso.length >= 3) {
            g.ivGuideLineWidth(2);
            g.beginPath();
            for(var i = 0; i < this.lasso.length; i++) {
                if(i == 0) g.moveTo(this.lasso[i].x, this.lasso[i].y);
                else g.lineTo(this.lasso[i].x, this.lasso[i].y);
            }
            g.closePath();
            g.strokeStyle = IV.colors.selection.toRGBA();
            g.fillStyle = IV.colors.selection.toRGBA(0.1);
            g.lineJoin = "round";
            g.fill();
            g.stroke();
        }
    },
    onInactive: function() {
        Tools.endTrackMouse("tools:Brushing");
    }
};

})();
