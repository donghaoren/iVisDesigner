// iVisDesigner
// Author: Donghao Ren, PKUVIS, Peking University, 2013.04
// See LICENSE.txt for copyright information.

IV.tools = { };


// Mouse event dispatcher
(function() {
    var mouse_trackers = { };

    var MouseContext = function() {
        this.move_listeners = [];
        this.release_listeners = [];
    };
    MouseContext.prototype = {
        dispatchDown: function(e) {
            var $this = this;
            e.move = function(f) { $this.move_listeners.push(f); };
            e.release = function(f) { $this.release_listeners.push(f); };
            for(var i in mouse_trackers) {
                (mouse_trackers[i])(e);
            }
        },
        dispatchMove: function(e) {
            this.move_listeners.forEach(function(f) {
                f(e);
            });
        },
        dispatchRelease: function(e) {
            this.release_listeners.forEach(function(f) {
                f(e);
            });
        }
    };
    var current_context = null;

    IV.on("view-mousedown", function(e) {
        current_context = new MouseContext();
        current_context.dispatchDown(e);
    });
    IV.on("view-mousemove", function(e) {
        if(current_context) current_context.dispatchMove(e);
    });
    IV.on("view-mouseup", function(e) {
        var tc = current_context;
        current_context = null;
        if(tc) tc.dispatchRelease(e);
    });

    IV.tools.beginTrackMouse = function(f, key) {
        mouse_trackers[key] = f;
    };
    IV.tools.endTrackMouse = function(key) {
        delete mouse_trackers[key];
    };

    IV.tools.beginSelectObject = function(f, key, action) {
        IV.tools.beginTrackMouse(function(e) {
            var context = IV.vis.selectObject(new IV.Vector(e.offsetX, e.offsetY), IV.data, action);
            f(context, e);
        }, key);
    };
    IV.tools.endSelectObject = IV.tools.endTrackMouse;
})();

IV.listen("tools:current", function(val) {
    if(IV.current_tool && IV.current_tool.onInactive)
        IV.current_tool.onInactive();

    IV.current_tool = IV.tools[val];

    if(IV.current_tool.onActive)
        IV.current_tool.onActive();
});

{{include: select.js}}
{{include: track.js}}
{{include: circle.js}}
{{include: line.js}}

IV.set("tools:current", "Select");
