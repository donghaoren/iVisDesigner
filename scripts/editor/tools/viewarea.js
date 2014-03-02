//. iVisDesigner - File: scripts/editor/tools/viewarea.js
//. Copyright 2013-2014 Donghao Ren
//. Peking University, University of California, Santa Barbara
//. See LICENSE.md for more information.

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
