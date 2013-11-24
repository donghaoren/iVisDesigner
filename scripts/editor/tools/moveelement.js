(function() {

Tools.MoveElement = {
    onActive: function() {
        var $this = this;
        if(Editor.vis) Editor.vis.clearSelection();
        Tools.triggerRender(["main", "back"]);
        IV.set("status", "Select element.");

        Tools.beginSelectObject(function(context, e_down) {
            if(context) {
            } else {
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
                    Tools.triggerRender("main,back");
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
