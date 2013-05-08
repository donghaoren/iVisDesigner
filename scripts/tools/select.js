(function() {

IV.tools.Select = {
    onActive: function() {
        var $this = this;
        if(IV.vis) IV.vis.clearSelection();
        IV.raise("vis:objects:selection");
        IV.triggerRender("main,back");

        IV.tools.beginSelectObject(function(context, e_down) {
            if(context) {
                if(!e_down.shift) IV.vis.clearSelection();
                IV.vis.appendSelection(context);
                IV.triggerRender("main,back");
                IV.raise("vis:objects:selection");
            } else {
                IV.vis.clearSelection();
                IV.triggerRender("main,back");
                IV.raise("vis:objects:selection");
                return;
            }
            if(context.onMove) {
                var handle_r = function(r) {
                    if(!r) return;
                    if(r.trigger_render) IV.triggerRender(r.trigger_render);
                };
                e_down.move(function(e_move) {
                    var p0 = new IV.Vector(e_down.offsetX, e_down.offsetY);
                    var p1 = new IV.Vector(e_move.offsetX, e_move.offsetY);
                    var r = context.onMove(p0, p1);
                    handle_r(r);
                });
                e_down.release(function(e_release) {
                    var p0 = new IV.Vector(e_down.offsetX, e_down.offsetY);
                    var p1 = new IV.Vector(e_release.offsetX, e_release.offsetY);
                    if(context.onRelease) {
                        var r = context.onRelease(p0, p1);
                        handle_r(r);
                    }
                });
            }
        }, "tools:Select", "move");
    },
    onInactive: function() {
        IV.tools.endSelectObject("tools:Select");
    }
};

})();
