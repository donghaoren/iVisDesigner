// iVisDesigner
// Author: Donghao Ren, PKUVIS, Peking University, 2013.04
// See LICENSE.txt for copyright information.

(function() {

var Circle = function(path, anchor_center, f_radius, s_style) {
    this.anchor_center = anchor_center;
    this.f_radius = radius;
    this.s_style = s_style;
    this.path = path;
};

Circle.prototype = {
    render: function(g, context) {
        var pt = this.anchor_center.getPoint(context);
        var radius = this.f_radius.getNumber(context);
        var style = this.s_style.getStyle(context);
        g.beginPath();
        g.arc(pt.x, pt.y, radius, 0, Math.PI * 2);
        if(style.fill_style) {
            g.fillStyle = style.fill_style;
            g.fill();
        }
        if(style.stroke_style) {
            g.strokeStyle = style.stroke_style;
            g.stroke();
        }
    }
};

IV.objects.circle = Circle;

})();
