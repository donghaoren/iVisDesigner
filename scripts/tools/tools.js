// iVisDesigner
// Author: Donghao Ren, PKUVIS, Peking University, 2013.04
// See LICENSE.txt for copyright information.

IV.tools = { };


// Mouse event dispatcher
(function() {
    var mouse_trackers = { };
    var mousemove_handlers = { };

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
        for(var i in mousemove_handlers) {
            mousemove_handlers[i](e, current_context != null);
        }
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
    IV.tools.beginTrackMouseMove = function(f, key) {
        mousemove_handlers[key] = f;
    };
    IV.tools.endTrackMouseMove = function(key) {
        delete mousemove_handlers[key];
    };

    var overlay_info = null;

    IV.tools.beginSelectObject = function(f, key, action) {
        overlay_info = {
            action: "select-object",
            hover: null
        };
        IV.tools.beginTrackMouse(function(e) {
            var context = IV.vis.selectObject(new IV.Vector(e.offsetX, e.offsetY), IV.data, action);
            f(context, e);
        }, key);
        IV.tools.beginTrackMouseMove(function(e, tracking) {
            if(tracking) {
                overlay_info.hover = null;
            } else {
                var context = IV.vis.selectObject(new IV.Vector(e.offsetX, e.offsetY), IV.data);
                if(context && context.obj) {
                    overlay_info.hover = context.obj;
                } else {
                    overlay_info.hover = null;
                }
            }
            IV.triggerRender("overlay");
        }, key);
    };
    IV.tools.endSelectObject = function(key) {
        IV.tools.endTrackMouse(key);
        IV.tools.endTrackMouseMove(key);
        overlay_info = null;
    };

    IV.tools.beginSelectLocation = function(f, key) {
        overlay_info = {
            action: "select-location",
            hover: null
        };

        IV.tools.beginTrackMouse(function(e) {
            var p0 = new IV.Vector(e.offsetX, e.offsetY)
            var context = IV.vis.selectObject(p0, IV.data);
            if(context && context.obj.can("get-point")) {
                var diff = null;
                e.move(function(e_move) {
                    diff = new IV.Vector(e_move.offsetX - p0.x, e_move.offsetY - p0.y);
                    overlay_info.line = [ p0, new IV.Vector(e_move.offsetX, e_move.offsetY) ];
                });
                e.release(function() {
                    overlay_info.line = null;
                    if(diff == null) {
                        f(context.obj);
                    } else {
                        f(new IV.objects.PointOffset(context.obj, diff));
                    }
                });
            } else {
                e.release(function() {
                    f(new IV.objects.Plain(new IV.Vector(e.offsetX, e.offsetY)));
                });
            }
        }, key);

        IV.tools.beginTrackMouseMove(function(e, tracking) {
            if(tracking) {
                overlay_info.hover = null;
            } else {
                var context = IV.vis.selectObject(new IV.Vector(e.offsetX, e.offsetY), IV.data);
                if(context && context.obj) {
                    overlay_info.hover = context.obj;
                } else {
                    overlay_info.hover = null;
                }
            }
            IV.triggerRender("overlay");
        }, key);
    };
    IV.tools.endSelectLocation = function(key) {
        IV.tools.endTrackMouse(key);
        IV.tools.endTrackMouseMove(key);
        overlay_info = null;
    };

    IV.tools.renderOverlay = function(g) {
        if(overlay_info) {
            if(overlay_info.hover) {
                var obj = overlay_info.hover;
                g.save();
                if(obj.renderSelected) obj.renderSelected(g, IV.data);
                if(obj.renderGuideSelected) obj.renderGuideSelected(g, IV.data);
                g.restore();
            }
            if(overlay_info.line) {
                g.beginPath();
                overlay_info.line[0].callMoveTo(g);
                overlay_info.line[1].callLineTo(g);
                g.strokeStyle = IV.colors.selection.toRGBA();
                g.stroke();
            }
        }
    };
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
