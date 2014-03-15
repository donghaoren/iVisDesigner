//. iVisDesigner - File: scripts/editor/tools/track.js
//. Copyright 2013-2014 Donghao Ren
//. Peking University, University of California, Santa Barbara
//. See LICENSE.md for more information.

(function() {

Tools.Track = {
    onActive: function() {
        var $this = this;
        $this.loc1 = null;
        $this.loc2 = null;
        var sA = Editor.status.start()
            .add("Track: ")
            .append("A: [please select]");

        var popup = IV.popups.PathSelect();
        popup.show($("#tool-icon-track"), 200, 200);
        popup.onSelectPath = function(selected_path, selected_ref) {
            Tools.beginSelectLocation(function(loc, mouse_event) {
                if(!$this.loc1) {
                    $this.loc1 = loc;
                    sA.set("A: " + loc.type);
                    Editor.status.append("B: [please select]");
                    return;
                } else {
                    $this.loc2 = loc;
                    var path = new IV.Path(selected_path);
                    if(true) {
                        var stat = Editor.computePathStatistics(path);
                        var diff = stat.max - stat.min;
                        stat.min -= diff * 0.05;
                        stat.max += diff * 0.05;
                        var track = new IV.objects.Track({
                            path: path,
                            anchor1: $this.loc1,
                            anchor2: $this.loc2,
                            min: new IV.objects.Plain(stat.min),
                            max: new IV.objects.Plain(stat.max)
                        });
                        Editor.doAddObject(track);
                    }
                    $this.loc1 = null;
                    $this.loc2 = null;
                    sA = Editor.status.start()
                        .add("Track: ")
                        .append("A: [please select]");
                }
            }, "tools:Track").mousemove(function(e) {
                if($this.loc1 && !$this.loc2) {
                    $this.loc1.getPath().enumerate(Editor.data, function(context) {
                        $this.overlay_p1 = $this.loc1.getPoint(context);
                        return false;
                    });
                    $this.overlay_p2 = e.offset;
                }
            });
        };
    },
    renderOverlay: function(g) {
        if(this.loc1 && !this.loc2) {
            g.beginPath();
            g.moveTo(this.overlay_p1.x, this.overlay_p1.y);
            g.lineTo(this.overlay_p2.x, this.overlay_p2.y);
            g.ivGuideLineWidth();
            g.strokeStyle = IV.colors.selection.toRGBA();
            g.stroke();
        }
    },
    onInactive: function() {
        Tools.endSelectLocation("tools:Track");
    }
};

})();

(function() {

Tools.Scatter = {
    onActive: function() {
        var obj1 = null;
        var obj2 = null;
        Editor.vis.clearSelection();

        var sA = Editor.status.start()
            .add("Scatter: ")
            .append("A: [please select]");

        var get_inner_object = function(context) {
            var current_component = Editor.get("current-component");
            if(current_component) {
                context = current_component.resolveSelection(context);
            }
            var ref_path = Editor.get("selected-reference");
            var refd_path = Editor.get("selected-reference-target");
            if(ref_path) return new IV.objects.ReferenceWrapper(ref_path, refd_path, context.obj);
            return context.obj;
        };

        Tools.beginSelectObject(function(context) {
            var path = Editor.get("selected-path");
            if(!context) {
                obj1 = null;
                obj2 = null;
                Editor.vis.clearSelection();
                sA = Editor.status.start()
                    .add("Scatter: ")
                    .append("A: [please select]");
                return;
            }
            if(!obj1) {
                obj1 = get_inner_object(context);
                Editor.vis.appendSelection(context);
                sA.set("A: " + obj1.type);
                Editor.status.append("B: [please select]");
            } else if(!obj2) {
                obj2 = get_inner_object(context);
                var is_track = function(t) {
                    if(t.type == "Track") return true;
                    if(t.type == "ReferenceWrapper") {
                        return is_track(t.obj);
                    }
                };
                if(is_track(obj1) && is_track(obj2)) {
                    var scatter = new IV.objects.Scatter({
                        track1: obj1, track2: obj2
                    });
                    Editor.doAddObject(scatter);
                }
                obj1 = null;
                obj2 = null;
                Editor.vis.clearSelection();
                sA = Editor.status.start()
                    .add("Track: ")
                    .append("A: [please select]");
            }
        }, "tools:Line");
    },
    onInactive: function() {
        Tools.endSelectObject("tools:Line");
    }
};

})();
