// iVisDesigner
// Author: Donghao Ren, PKUVIS, Peking University, 2013.04
// See LICENSE.txt for copyright information.

Editor.tools = { };


// Mouse event dispatcher
(function() {
    var Tools = Editor.tools;

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

    Editor.bind("view:mousedown", function(e) {
        current_context = new MouseContext();
        current_context.dispatchDown(e);
        Editor.renderer.render();
    });
    Editor.bind("view:mousemove", function(e) {
        if(current_context) current_context.dispatchMove(e);
        for(var i in mousemove_handlers) {
            mousemove_handlers[i](e, current_context != null);
        }
        Editor.renderer.render();
    });
    Editor.bind("view:mouseup", function(e) {
        var tc = current_context;
        current_context = null;
        if(tc) tc.dispatchRelease(e);
        Editor.renderer.render();
    });

    Tools.beginTrackMouse = function(f, key) {
        mouse_trackers[key] = f;
    };
    Tools.endTrackMouse = function(key) {
        delete mouse_trackers[key];
    };
    Tools.beginTrackMouseMove = function(f, key) {
        mousemove_handlers[key] = f;
    };
    Tools.endTrackMouseMove = function(key) {
        delete mousemove_handlers[key];
    };

    var overlay_info = null;

    Tools.beginSelectObject = function(f, key, action) {
        overlay_info = {
            action: "select-object",
            hover: null
        };
        Tools.beginTrackMouse(function(e) {
            var context;
            if(Editor.vis && Editor.data)
                context = Editor.vis.selectObject(Editor.data, e.offset, action);
            f(context, e);
        }, key);
        Tools.beginTrackMouseMove(function(e, tracking) {
            if(tracking) {
                overlay_info.hover = null;
            } else {
                var context;
                if(Editor.vis && Editor.data)
                    context = Editor.vis.selectObject(Editor.data, e.offset);
                if(context && context.obj) {
                    overlay_info.hover = context;
                } else {
                    overlay_info.hover = null;
                }
            }
            Tools.triggerRender("overlay");
        }, key);
    };
    Tools.endSelectObject = function(key) {
        Tools.endTrackMouse(key);
        Tools.endTrackMouseMove(key);
        overlay_info = null;
    };

    Tools.beginSelectLocation = function(f, key) {
        overlay_info = {
            action: "select-location",
            hover: null
        };

        Tools.beginTrackMouse(function(e) {
            var p0 = e.offset;
            var context = Editor.vis.selectObject(Editor.data, p0);
            var current_component = Editor.get("current-component");
            if(context && current_component) {
                context = current_component.resolveSelection(context);
            }

            var captured_object = function(obj) {
                var ref_path = Editor.get("selected-reference");
                var refd_path = Editor.get("selected-reference-target");
                if(ref_path) f(new IV.objects.ReferenceWrapper(ref_path, refd_path, obj));
                else f(obj);
            };

            if(context && context.obj.can("get-point")) {
                var diff = null;
                e.move(function(e_move) {
                    diff = new IV.Vector(e_move.offset.x - p0.x, e_move.offset.y - p0.y);
                    overlay_info.line = [ p0, new IV.Vector(e_move.offset.x, e_move.offset.y) ];
                });
                e.release(function() {
                    overlay_info.line = null;
                    if(diff == null) {
                        captured_object(context.obj);
                    } else {
                        captured_object(new IV.objects.PointOffset(context.obj, diff));
                    }
                });
            } else {
                e.release(function() {
                    var pt = e.offset;
                    // To component coordinate if editing a component.
                    var current_component = Editor.get("current-component");
                    if(current_component) {
                        pt = current_component.toLocalCoordinate(pt);
                    }
                    // Captured the point.
                    captured_object(new IV.objects.Plain(pt));
                });
            }
        }, key);

        Tools.beginTrackMouseMove(function(e, tracking) {
            if(tracking) {
                overlay_info.hover = null;
            } else {
                var context = Editor.vis.selectObject(Editor.data, e.offset);
                if(context && context.obj) {
                    overlay_info.hover = context;
                } else {
                    overlay_info.hover = null;
                }
            }
            Tools.triggerRender("overlay");
        }, key);
    };
    Tools.endSelectLocation = function(key) {
        Tools.endTrackMouse(key);
        Tools.endTrackMouseMove(key);
        overlay_info = null;
    };

    Tools.renderOverlay = function(g) {
        if(overlay_info) {
            if(overlay_info.hover) {
                var obj = overlay_info.hover.obj;
                g.ivSave();
                if(obj.renderSelected) obj.renderSelected(g, IV.data, overlay_info.hover.context, overlay_info.hover);
                if(obj.renderGuideSelected) obj.renderGuideSelected(g, IV.data,  overlay_info.hover.context, overlay_info.hover);
                g.ivRestore();
            }
            if(overlay_info.line) {
                g.ivGuideLineWidth();
                g.beginPath();
                overlay_info.line[0].callMoveTo(g);
                overlay_info.line[1].callLineTo(g);
                g.strokeStyle = IV.colors.selection.toRGBA();
                g.stroke();
            }
        }
        if(IV.current_tool.renderOverlay)
            IV.current_tool.renderOverlay(g);

        var current_component = Editor.get("current-component");
        if(current_component) {
            var pc = current_component.fromLocalCoordinate(new IV.Vector(0, 0));
            g.ivGuideLineWidth();
            g.beginPath();
            g.moveTo(pc.x - 10, pc.y);
            g.lineTo(pc.x + 10, pc.y);
            g.moveTo(pc.x, pc.y - 10);
            g.lineTo(pc.x, pc.y + 10);
            g.strokeStyle = "rgba(0, 0, 0, 0.5)";
            g.stroke();

        }
    };

    Tools.triggerRender = function(items) {
        Editor.renderer.trigger(items);
    };

    Editor.renderer.bind("overlay", function(data, g) {
        Tools.renderOverlay(g);
    });
    Editor.listen("current-component", function() {
        Tools.triggerRender("overlay");
    });

IV.listen("tools:current", function(val) {
    if(IV.current_tool && IV.current_tool.onInactive)
        IV.current_tool.onInactive();

    if(Tools[val]) {
        IV.current_tool = Tools[val];
    } else {
        IV.current_tool = {
            onActive: function() {
                Editor.showMessage("This tool is not implemeted yet.");
            }
        };
    }

    if(IV.current_tool.onActive)
        IV.current_tool.onActive();
});

{{include: select.js}}
{{include: track.js}}
{{include: circle.js}}
{{include: line.js}}
{{include: component.js}}
{{include: text.js}}
{{include: viewarea.js}}
{{include: moveelement.js}}

IV.set("tools:current", "Select");

})();
