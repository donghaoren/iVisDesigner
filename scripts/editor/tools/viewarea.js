(function() {

Tools.Move = {
    onActive: function() {
        var $this = this;
        IV.set("status", "Drag to move the canvas.");
        Tools.beginTrackMouse(function(e_down) {
            var p0 = e_down.page;
            var l0 = IV.editor.renderer.center.clone();
            e_down.move(function(e_move) {
                var p1 = e_move.page;
                IV.editor.renderer.setView(l0.sub(p0).add(p1), IV.editor.renderer.scale);
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
            var l0 = IV.editor.renderer.center.clone();
            var s0 = IV.editor.renderer.scale;
            var p0 = e_down.offset;

            e_down.move(function(e_move) {
                var new_scale = s0 * Math.exp((e_move.page.y - y0) / -200.0);
                IV.editor.renderer.setView(l0.add(p0.scale(s0 - new_scale)), new_scale);
                Tools.triggerRender();
            });
        }, "tools:Zoom");
    },
    onInactive: function() {
        Tools.endTrackMouse("tools:Zoom");
    }
};

})();
