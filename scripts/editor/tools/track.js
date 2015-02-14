// iVisDesigner - scripts/editor/tools/track.js
// Author: Donghao Ren
//
// LICENSE
//
// Copyright (c) 2014, The Regents of the University of California
// All rights reserved.
//
// Redistribution and use in source and binary forms, with or without modification,
// are permitted provided that the following conditions are met:
//
// 1. Redistributions of source code must retain the above copyright notice, this
//    list of conditions and the following disclaimer.
//
// 2. Redistributions in binary form must reproduce the above copyright notice,
//    this list of conditions and the following disclaimer in the documentation
//    and/or other materials provided with the distribution.
//
// 3. Neither the name of the copyright holder nor the names of its contributors
//    may be used to endorse or promote products derived from this software without
//    specific prior written permission.
//
// THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
// ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
// WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED.
// IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT,
// INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING,
// BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
// DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
// LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE
// OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED
// OF THE POSSIBILITY OF SUCH DAMAGE.

(function() {

Tools.Track = {
    magneticsLocation2: function(loc, e) {
        var $this = this;
        if(loc.type == "Plain") {
            var magnetics = Tools.createMagnetics();
            magnetics.threshold = 5 / e.offset.view_scale;
            if($this.loc1) {
                $this.loc1.getPath().enumerate(Editor.data, function(context) {
                    $this.overlay_p1 = $this.loc1.getPoint(context);
                    return false;
                });
                magnetics.points.push($this.overlay_p1);
            }
            var new_pos = new IV.Vector(loc.obj.x, loc.obj.y);
            var np = magnetics.modify(new_pos.x, new_pos.y);
            if(np) {
                loc.obj.x = np.x;
                loc.obj.y = np.y;
            }
        }
    },
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
                    $this.magneticsLocation2(loc, mouse_event);
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
                        guide_count = 0;
                        var num = track.enumerateGuide(Editor.data, function() { guide_count += 1; });
                        if(guide_count > 10) {
                            track.tick_style.show_ticks = false;
                        }
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
                    var magnetics = Tools.createMagnetics();
                    magnetics.threshold = 5 / e.offset.view_scale;
                    magnetics.points.push($this.overlay_p1);
                    var new_pos = new IV.Vector(e.offset.x, e.offset.y);
                    var np = magnetics.modify(new_pos.x, new_pos.y);
                    if(np) {
                        new_pos.x = np.x;
                        new_pos.y = np.y;
                        magnetics.accept(np, new_pos.x, new_pos.y);
                    }
                    $this.overlay_p2 = new_pos;
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
