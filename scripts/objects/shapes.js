// iVisDesigner
// Author: Donghao Ren, PKUVIS, Peking University, 2013.04
// See LICENSE.txt for copyright information.

// shapes.js
// Define objects for various shapes.

(function() {

var Circle = function(path, info) {
    this.path = path;
    // Center
    this.anchor_center = info.center;

    // Radius
    if(info.radius)
        this.f_radius = info.radius;
    else
        this.f_radius = new IV.objects.Number(2);

    // Style
    if(info.style)
        this.s_style = info.style;
    else {
        this.s_style = new IV.objects.Style({
            fill_style: new IV.Color(0, 0, 0, 1)
        });
    }
};

Circle.prototype = new IV.objects.BaseObject({
    render: function(g, context) {
        var pt = this.anchor_center.getPoint(context);
        var radius = this.f_radius.getNumber(context);
        var style = this.s_style.getStyle(context);
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
    }
});

IV.objects.Circle = Circle;

var Line = function(path, info) {
    this.path = path;
    this.point1 = info.point1;
    this.point2 = info.point2;
    // Style
    if(info.style)
        this.s_style = info.style;
    else {
        this.s_style = new IV.objects.Style({
            stroke_style: new IV.Color(0, 0, 0, 1),
            width: 1
        });
    }
};

Line.prototype = new IV.objects.BaseObject({
    render: function(g, context) {
        var p1 = this.point1.getPoint(context);
        var p2 = this.point2.getPoint(context);
        var style = this.s_style.getStyle(context);
        g.beginPath();
        g.moveTo(p1.x, p1.y);
        g.lineTo(p2.x, p2.y);
        if(style.stroke_style) {
            g.strokeStyle = style.stroke_style.toRGBA();
            if(style.width) g.lineWidth = style.width;
            g.stroke();
        }
    }
});

IV.objects.Line = Line;

})();
