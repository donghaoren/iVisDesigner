(function() {

Tools.Select = {
    onActive: function() {
        var $this = this;
        if(IV.editor.vis) IV.editor.vis.clearSelection();
        Tools.triggerRender(["main", "back"]);
        IV.set("status", "Select object.");

        Tools.beginSelectObject(function(context, e_down) {
            if(context) {
                if(!e_down.shift) IV.editor.vis.clearSelection();
                IV.editor.vis.appendSelection(context);
                IV.triggerRender("main,back");
                IV.raise("vis:objects:selection");
            } else {
                IV.editor.vis.clearSelection();
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
        Tools.endSelectObject("tools:Select");
    }
};

})();
