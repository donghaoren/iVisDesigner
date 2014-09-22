// iVisDesigner - scripts/editor/popups/templates.js
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

var templates = { };

var beginSelectingRectangle = function(callback) {
    var p0 = null, p1 = null;
    Editor.tools.beginOverlay({
        renderOverlay: function(g) {
            g.strokeStyle = IV.colors.guide.toRGBA();
            if(p0 && p1) {
                g.beginPath();
                g.rect(Math.min(p0.x, p1.x), Math.min(p0.y, p1.y), Math.abs(p0.x - p1.x), Math.abs(p0.y - p1.y));
                g.stroke();
            }
        }
    });
    Editor.tools.beginTrackMouse(function(e) {
        p0 = e.offset;
        e.move(function(e_move) {
            p1 = e_move.offset;
            IV.editor.tools.triggerRender("overlay");
            IV.editor.renderer.render();
        });
        e.release(function(e_release) {
            Editor.tools.endTrackMouse("temporary");
            Editor.tools.endOverlay();
            var minp = new IV.Vector(Math.min(e.offset.x, e_release.offset.x), Math.min(e.offset.y, e_release.offset.y));
            var maxp = new IV.Vector(Math.max(e.offset.x, e_release.offset.x), Math.max(e.offset.y, e_release.offset.y));
            callback(minp, maxp);
        });
    }, "temporary");
};

templates.Scatterplot = function() {
    var data = IV.popups.create();
    data.addActions([ "ok", "cancel" ]);

    var p = data.selector;
    p.children(".content").html(IV.strings("popup_template_scatterplot"));

    p.default_width = 300;
    p.default_height = 130;
    var data = p.data();
    data.onOk = function() {
        var path_x = p.find('[data-field="path-x"]').data().get();
        var path_y = p.find('[data-field="path-y"]').data().get();
        var stat_x = Editor.computePathStatistics(path_x);
        var stat_y = Editor.computePathStatistics(path_y);
        beginSelectingRectangle(function(p0, p1) {
            var track_x = new IV.objects.Track({
                path: path_x,
                anchor1: new IV.objects.Plain(new IV.Vector(p0.x, p0.y - 10)),
                anchor2: new IV.objects.Plain(new IV.Vector(p1.x, p0.y - 10)),
                min: new IV.objects.Plain(stat_x.min),
                max: new IV.objects.Plain(stat_x.max)
            });
            var track_y = new IV.objects.Track({
                path: path_y,
                anchor1: new IV.objects.Plain(new IV.Vector(p0.x - 10, p0.y)),
                anchor2: new IV.objects.Plain(new IV.Vector(p0.x - 10, p1.y)),
                min: new IV.objects.Plain(stat_y.min),
                max: new IV.objects.Plain(stat_y.max)
            });
            track_y.tick_style.tick_size = -2;
            track_y.tick_style.rotation = -90;
            var scatter = new IV.objects.Scatter({
                track1: track_x, track2: track_y
            });
            var circle = new IV.objects.Circle({
                path: path_x.toEntityPath(),
                center: scatter
            });
            circle.style.actions = [{
                type: "fill",
                color: new IV.objects.Plain(IV.colors.default_fill)
            }];
            Editor.doAddObject(track_x);
            Editor.doAddObject(track_y);
            Editor.doAddObject(scatter);
            Editor.doAddObject(circle);
        });
        data.hide();
    };
    data.onCancel = function() {
        data.hide();
    };
    data.show();
};

templates.Timeline = function() {
    var data = IV.popups.create();
    data.addActions([ "ok", "cancel" ]);

    var p = data.selector;
    p.children(".content").html(IV.strings("popup_template_timeline"));

    p.default_width = 300;
    p.default_height = 130;
    var data = p.data();
    data.onOk = function() {
        var path_x = p.find('[data-field="path-x"]').data().get();
        var path_y = p.find('[data-field="path-y"]').data().get();
        var stat_x = Editor.computePathStatistics(path_x);
        var stat_y = Editor.computePathStatistics(path_y);
        beginSelectingRectangle(function(p0, p1) {
            var track_x = new IV.objects.Track({
                path: path_x,
                anchor1: new IV.objects.Plain(new IV.Vector(p0.x, p0.y - 10)),
                anchor2: new IV.objects.Plain(new IV.Vector(p1.x, p0.y - 10)),
                min: new IV.objects.Plain(stat_x.min),
                max: new IV.objects.Plain(stat_x.max)
            });
            var track_y = new IV.objects.Track({
                path: path_y,
                anchor1: new IV.objects.Plain(new IV.Vector(p0.x - 10, p0.y)),
                anchor2: new IV.objects.Plain(new IV.Vector(p0.x - 10, p1.y)),
                min: new IV.objects.Plain(stat_y.min),
                max: new IV.objects.Plain(stat_y.max)
            });
            track_y.tick_style.tick_size = -2;
            track_y.tick_style.rotation = -90;
            var scatter = new IV.objects.Scatter({
                track1: track_x, track2: track_y
            });
            var line = new IV.objects.LineThrough({
                path: path_x.toEntityPath().truncate(1),
                points: scatter
            });
            line.style.actions = [{
                type: "stroke",
                color: new IV.objects.Plain(IV.colors.default_stroke),
                width: new IV.objects.Plain(1),
                join: new IV.objects.Plain("bevel"),
                cap: new IV.objects.Plain("butt")
            }];
            Editor.doAddObject(track_x);
            Editor.doAddObject(track_y);
            Editor.doAddObject(scatter);
            Editor.doAddObject(line);
        });
        data.hide();
    };
    data.onCancel = function() {
        data.hide();
    };
    data.show();
};

templates.Graph = function() {
    var data = IV.popups.create();
    data.addActions([ "ok", "cancel" ]);

    var p = data.selector;
    p.children(".content").html(IV.strings("popup_template_graph"));

    p.default_width = 300;
    p.default_height = 130;
    var data = p.data();
    data.onOk = function() {
        var path_nodes = p.find('[data-field="path-nodes"]').data().get();
        var path_edges = p.find('[data-field="path-edges"]').data().get();
        var path_source = p.find('[data-field="path-source"]').data().get();
        var path_target = p.find('[data-field="path-target"]').data().get();
        beginSelectingRectangle(function(p0, p1) {
            var layout = new IV.objects.ForceLayout({
                path_nodes: path_nodes,
                path_edgeA: path_source,
                path_edgeB: path_target
            });
            var path_x = new IV.Path(path_nodes.toString() + ":{Layout@" + layout.uuid + "}:x");
            var path_y = new IV.Path(path_nodes.toString() + ":{Layout@" + layout.uuid + "}:y");
            var track_x = new IV.objects.Track({
                path: path_x,
                anchor1: new IV.objects.Plain(new IV.Vector(p0.x, p0.y - 10)),
                anchor2: new IV.objects.Plain(new IV.Vector(p1.x, p0.y - 10)),
                min: new IV.objects.Plain(-2),
                max: new IV.objects.Plain(2)
            });
            var track_y = new IV.objects.Track({
                path: path_y,
                anchor1: new IV.objects.Plain(new IV.Vector(p0.x - 10, p0.y)),
                anchor2: new IV.objects.Plain(new IV.Vector(p0.x - 10, p1.y)),
                min: new IV.objects.Plain(-2),
                max: new IV.objects.Plain(2)
            });
            track_y.tick_style.tick_size = -2;
            track_y.tick_style.rotation = -90;
            var scatter = new IV.objects.Scatter({
                track1: track_x, track2: track_y
            });
            var line = new IV.objects.Line({
                path: path_edges,
                point1: new IV.objects.ReferenceWrapper(path_source, path_nodes, scatter),
                point2: new IV.objects.ReferenceWrapper(path_target, path_nodes, scatter),
            });
            var circle = new IV.objects.Circle({
                path: path_nodes,
                center: scatter
            });
            circle.style.actions = [{
                type: "fill",
                color: new IV.objects.Plain(IV.colors.default_fill)
            }];
            line.style.actions = [{
                type: "stroke",
                color: new IV.objects.Plain(IV.colors.default_stroke.clone(0.2)),
                width: new IV.objects.Plain(1),
                join: new IV.objects.Plain("bevel"),
                cap: new IV.objects.Plain("butt")
            }];
            layout.enabled = true;
            Editor.doAddObject(layout);
            Editor.doAddObject(track_x);
            Editor.doAddObject(track_y);
            Editor.doAddObject(scatter);
            Editor.doAddObject(line);
            Editor.doAddObject(circle);
        });
        data.hide();
    };
    data.onCancel = function() {
        data.hide();
    };
    data.show();
};

IV.on("command:toolkit.template", function(param) {

    templates[param]();
});

})();
