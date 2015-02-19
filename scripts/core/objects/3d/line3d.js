// iVisDesigner - scripts/core/objects/3d/line3d.js
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

/*
IV.editor.workspace.objects.push(new IV.objects.Line3D({ path: new IV.Path("[cars]"), point1: new IV.objects.CanvasWrapper3D(IV.editor.workspace.canvases[0], IV.editor.workspace.canvases[0].visualization.objects[5]), point2: new IV.objects.CanvasWrapper3D(IV.editor.workspace.canvases[1], IV.editor.workspace.canvases[0].visualization.objects[0]) }));
*/

Objects.CanvasWrapper3D = IV.extend(Objects.Object, function(canvas, point) {
    this.type = "CanvasWrapper3D";
    this.canvas = canvas;
    this.point = point;
}, {
    get: function(context) {
        var pt = this.point.get(context);
        var pose = this.canvas.pose;
        // Compute the position of `pt` in 3D space.
        var ab = this.canvas.visualization.artboard;
        var w = 2000, h = 2000;
        var scale = Math.min(
            (w - 10) / ab.width,
            (h - 10) / ab.height
        );
        var center = new IV.Vector(-(ab.x0 + ab.width / 2) * scale,
                                   -(ab.y0 + ab.height / 2) * scale);
        pt = pt.scale(scale).add(center);
        var ex = pose.up.cross(pose.normal).normalize();
        var ey = pose.normal.cross(ex).normalize();
        ex = ex.scale(pose.width / 2000);
        ey = ey.scale(pose.width / 2000);
        return pose.center.add(ex.scale(pt.x - 0.5)).add(ey.scale(pt.y - 0.5));
    },
    getPath: function() {
        return this.point.getPath();
    },
    clone: function() {
        return new Objects.CanvasWrapper3D(this.canvas, this.point);
    }
});

Objects.Line3D = IV.extend(Objects.Shape, function(info) {
    this.type = "Line3D";
    this.path = info.path;
    if(info.color)
        this.color = info.color;
    else
        this.color = null;
    if(info.filter)
        this.filter = info.filter;
    else
        this.filter = null;
    this.point1 = info.point1;
    this.point2 = info.point2;
}, {
    $auto_properties: [ "path", "filter", "point1", "point2", "color" ],
    render: function(g, data) {
        var $this = this;
        g.GL.begin(g.GL.LINES);
        $this.path.enumerate(data, function(context) {
            if($this.filter && !$this.filter.get(context)) return;
            var p1 = $this.point1.get(context);
            var p2 = $this.point2.get(context);
            var color;
            if($this.color) color = $this.color.get(context);
            else color = new IV.Color(255, 255, 255, 1);
            g.GL.color4f(color.r / 255.0, color.g / 255.0, color.b / 255.0, color.a);
            g.GL.normal3f(0, 0, 1);
            var tick_count = 30;
            for(var tick = 0; tick < tick_count; tick++) {
                var a = p1.interp(p2, tick / tick_count);
                var b = p1.interp(p2, (tick + 1) / tick_count);
                g.GL.vertex3f(a.x, a.y, a.z);
                g.GL.vertex3f(b.x, b.y, b.z);
            }
        });
        g.GL.end();
    },
    getPropertyContext: function() {
        var $this = this;
        return Objects.Object.prototype.getPropertyContext.call(this).concat([
            make_prop_ctx($this, "path", "Selector", "Shape", "path"),
            make_prop_ctx($this, "filter", "Filter", "Shape", "filter"),
            make_prop_ctx($this, "color", "Color", "Line3D", "color"),
            make_prop_ctx($this, "point1", "Point1", "Line3D", "point"),
            make_prop_ctx($this, "point2", "Point2", "Line3D", "point")
        ]);
    }
});

IV.serializer.registerObjectType("Line3D", Objects.Line3D);
IV.serializer.registerObjectType("CanvasWrapper3D", Objects.CanvasWrapper3D);
