// iVisDesigner
// Author: Donghao Ren, PKUVIS, Peking University, 2013.04
// See LICENSE.txt for copyright information.

// scripts/objects/shapes.js
// Define objects for various shapes.

(function() {

var Circle = function(path, info) {
    this.type = "Circle";
    this.path = path;
    // Center
    this.center = info.center;
    // Style
    if(info.style)
        this.style = info.style;
    else {
        this.style = new IV.objects.Style({
            fill_style: new IV.Color(0, 0, 0, 1),
            radius: 3
        });
    }
};

Circle.prototype = new IV.objects.BaseObject({
    render: function(g, context) {
        var pt = this.center.getPoint(context);
        var style = this.style.getStyle(context);
        var radius = style.radius;
        g.beginPath();
        g.arc(pt.x, pt.y, radius, 0, Math.PI * 2);
        if(style.fill_style) {
            g.fillStyle = style.fill_style.toRGBA();
            g.fill();
        }
        if(style.stroke_style) {
            g.strokeStyle = style.stroke_style.toRGBA();
            g.stroke();
        }
    },
    renderSelected: function(g, context) {
        var pt = this.center.getPoint(context);
        var style = this.style.getStyle(context);
        var radius = style.radius;
        g.beginPath();
        g.arc(pt.x, pt.y, radius, 0, Math.PI * 2);
        g.strokeStyle = IV.colors.selection.toRGBA(0.1);
        g.stroke();
    },
    select: function(pt, data, action) {
        var selected = false;
        var $this = this;
        data.enumeratePath(this.path, function(context) {
            var c = $this.center.getPoint(context);
            var style = $this.style.getStyle(context);
            var radius = style.radius;
            if(pt.distance(c) <= radius) {
                selected = true;
            }
        });
        if(selected) return { };
        return null;
    }
});

IV.objects.Circle = Circle;

var Line = function(path, info) {
    this.path = path;
    this.point1 = info.point1;
    this.point2 = info.point2;
    // Style
    if(info.style)
        this.style = info.style;
    else {
        this.style = new IV.objects.Style({
            stroke_style: new IV.Color(0, 0, 0, 1),
            width: 1
        });
    }
};

Line.prototype = new IV.objects.BaseObject({
    render: function(g, context) {
        var p1 = this.point1.getPoint(context);
        var p2 = this.point2.getPoint(context);
        var style = this.style.getStyle(context);
        g.beginPath();
        g.moveTo(p1.x, p1.y);
        g.lineTo(p2.x, p2.y);
        if(style.stroke_style) {
            g.strokeStyle = style.stroke_style.toRGBA();
            if(style.width) g.lineWidth = style.width;
            g.stroke();
        }
    },
    renderSelected: function(g, context) {
        var p1 = this.point1.getPoint(context);
        var p2 = this.point2.getPoint(context);
        var style = this.style.getStyle(context);
        g.beginPath();
        g.moveTo(p1.x, p1.y);
        g.lineTo(p2.x, p2.y);
        g.strokeStyle = IV.colors.selection.toRGBA(0.1);
        g.stroke();
    },
    select: function(pt, data, action) {
        var selected = false;
        var $this = this;
        data.enumeratePath(this.path, function(context) {
            var p1 = $this.point1.getPoint(context);
            var p2 = $this.point2.getPoint(context);
            var d = IV.pointLineSegmentDistance(pt, p1, p2);
            if(d <= 4) {
                selected = true;
            }
        });
        if(selected) return { };
        return null;
    }
});

IV.objects.Line = Line;

})();
