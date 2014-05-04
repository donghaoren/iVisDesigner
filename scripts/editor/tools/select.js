//. iVisDesigner - File: scripts/editor/tools/select.js
//. Copyright 2013-2014 Donghao Ren
//. Peking University, University of California, Santa Barbara
//. See LICENSE.md for more information.

(function() {

Tools.createMagnetics = function() {
    var points = [];
    for(var i in Editor.vis.objects) {
        var obj = Editor.vis.objects[i];
        if(obj.getAnchors) {
            var r = obj.getAnchors();
            points = points.concat(r);
        }
    }
    return new IV.MagneticAlign(points);
};

Tools.Select = {
    onActive: function() {
        var $this = this;
        Tools.triggerRender("main,front,back,overlay");
        IV.set("status", "Select object.");

        Tools.beginSelectObject(function(context, e_down) {
            if(context) {
                if(!e_down.shift) Editor.vis.clearSelection();
                Editor.vis.appendSelection(context);
                Tools.triggerRender("main,front,back,overlay");
            } else {
                Editor.vis.clearSelection();
                Tools.triggerRender("main,front,back,overlay");
                return;
            }
            if(context.onMove) {
                $this.magnetics = Tools.createMagnetics();
                $this.magnetics.threshold = 5 / e_down.offset.view_scale;
                var handle_r = function(r) {
                    if(!r) return;
                    if(r.actions) {
                        r.actions.forEach(function(act) {
                            Actions.add(act);
                        });
                        Actions.commit();
                    }
                    if(r.trigger_render) Tools.triggerRender(r.trigger_render);
                };
                e_down.move(function(e_move) {
                    var p0 = e_down.offset;
                    var p1 = e_move.offset;
                    $this.magnetics.reset();
                    var r = context.onMove(p0, p1, $this.magnetics);
                    handle_r(r);
                });
                e_down.release(function(e_release) {
                    $this.magnetics = null;
                    var p0 = e_down.offset;
                    var p1 = e_release.offset;
                    if(context.onRelease) {
                        var r = context.onRelease(p0, p1);
                        handle_r(r);
                    }
                });
            }
        }, "tools:Select", "move");
    },
    renderOverlay: function(g) {
        if(this.magnetics) {
            g.ivSave();
            g.ivGuideLineWidth();
            this.magnetics.render(g);
            g.ivRestore();
        }
    },
    onInactive: function() {
        Tools.endSelectObject("tools:Select");
    }
};

})();
