(function() {

IV.tools.Move = {
    onActive: function() {
        var $this = this;
        IV.set("status", "Drag to move the canvas.");
        IV.tools.beginTrackMouse(function(e_down) {
            var p0 = e_down.page;
            var l0 = IV.viewarea.location.clone();
            e_down.move(function(e_move) {
                var p1 = e_move.page;
                IV.viewarea.location = l0.sub(p0).add(p1);
                IV.triggerRender();
                IV.render();
            });
        }, "tools:Move");
    },
    onInactive: function() {
        IV.tools.endTrackMouse("tools:Move");
    }
};

IV.tools.Zoom = {
    onActive: function() {
        var $this = this;
        IV.set("status", "Drag to zoom the canvas.");
        IV.tools.beginTrackMouse(function(e_down) {
            var y0 = e_down.page.y;
            var l0 = IV.viewarea.location.clone();
            var s0 = IV.viewarea.scale;
            var p0 = e_down.offset;

            e_down.move(function(e_move) {
                var new_scale = s0 * Math.exp((e_move.pageY - y0) / -200.0);
                IV.viewarea.scale = new_scale;
                IV.viewarea.location = l0.add(p0.scale(s0 - new_scale));
                IV.triggerRender();
                IV.render();
            });
        }, "tools:Move");
    },
    onInactive: function() {
        IV.tools.endTrackMouse("tools:Move");
    }
};

})();
