//. iVisDesigner - File: scripts/editor/tools/brushing.js
//. Copyright 2013-2014 Donghao Ren
//. Peking University, University of California, Santa Barbara
//. See LICENSE.md for more information.

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
