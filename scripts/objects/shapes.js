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
    can: function(cap) {
        if(cap == "get-point") return true;
    },
    get: function(context) {
        return this.center.getPoint(context);
    },
    render: function(g, data) {
        var $this = this;
        data.enumeratePath($this.path, function(context) {
            var pt = $this.center.getPoint(context);
            var style = $this.style.getStyle(context);
            var radius = style.radius;
            g.beginPath();
            g.arc(pt.x, pt.y, radius, 0, Math.PI * 2);
            if(style.fill_style) {
                g.fillStyle = style.fill_style.toRGBA();
                g.fill();
            }
            if(style.stroke_style) {
                g.strokeStyle = style.stroke_style.toRGBA();
                if(style.width) g.lineWidth = style.width;
                g.stroke();
            }
        });
    },
    renderSelected: function(g, data) {
        var $this = this;
        data.enumeratePath($this.path, function(context) {
            var pt = $this.center.getPoint(context);
            var style = $this.style.getStyle(context);
            var radius = style.radius;
            g.beginPath();
            g.arc(pt.x, pt.y, radius, 0, Math.PI * 2);
            g.strokeStyle = IV.colors.selection.toRGBA();
            g.lineWidth = 1.0 / IV.viewarea.scale;
            g.stroke();
        });
    },
    select: function(pt, data, action) {
        var rslt = null;
        var $this = this;
        data.enumeratePath(this.path, function(context) {
            var c = $this.center.getPoint(context);
            var style = $this.style.getStyle(context);
            var radius = style.radius || 0;
            var d = Math.abs(pt.distance(c) - radius);
            if(d <= 4) {
                if(!rslt || rslt.distance > d) {
                    rslt = { distance: d };
                    if(action == "move") {
                        if($this.center.type == "plain") {
                            rslt.original = $this.center.obj;
                            rslt.onMove = function(p0, p1) {
                                $this.center.obj = rslt.original.sub(p0).add(p1);
                                return { trigger_render: "main" };
                            };
                        }
                        if($this.center.type == "PointOffset") {
                            rslt.original = $this.center.offset;
                            rslt.onMove = function(p0, p1) {
                                $this.center.offset = rslt.original.sub(p0).add(p1);
                                return { trigger_render: "main" };
                            };
                        }
                    }
                }
            }
        });
        return rslt;
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
    render: function(g, data) {
        var $this = this;
        data.enumeratePath($this.path, function(context) {
            var p1 = $this.point1.getPoint(context);
            var p2 = $this.point2.getPoint(context);
            var style = $this.style.getStyle(context);
            g.beginPath();
            g.moveTo(p1.x, p1.y);
            g.lineTo(p2.x, p2.y);
            if(style.stroke_style) {
                g.strokeStyle = style.stroke_style.toRGBA();
                if(style.width) g.lineWidth = style.width;
                if(style.line_cap) g.lineCap = style.line_cap;
                if(style.line_join) g.lineJoin = style.line_join;
                g.stroke();
            }
        });
    },
    renderSelected: function(g, data) {
        var $this = this;
        data.enumeratePath($this.path, function(context) {
            var p1 = $this.point1.getPoint(context);
            var p2 = $this.point2.getPoint(context);
            var style = $this.style.getStyle(context);
            g.beginPath();
            g.moveTo(p1.x, p1.y);
            g.lineTo(p2.x, p2.y);
            g.strokeStyle = IV.colors.selection.toRGBA();
            g.lineWidth = 1.0 / IV.viewarea.scale;
            g.stroke();
        });
    },
    select: function(pt, data, action) {
        var rslt = null;
        var $this = this;
        data.enumeratePath(this.path, function(context) {
            var p1 = $this.point1.getPoint(context);
            var p2 = $this.point2.getPoint(context);
            var d = IV.pointLineSegmentDistance(pt, p1, p2);
            if(d <= 4) {
                if(!rslt || rslt.distance > d)
                    rslt = { distance: d };
            }
        });
        return rslt;
    }
});

IV.objects.Line = Line;

var LineThrough = function(path, info) {
    this.path = path;
    this.points = info.points;
    this.type = "LineThrough";
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

LineThrough.prototype = new IV.objects.BaseObject({
    render: function(g, data) {
        var $this = this;
        var index = 0;
        var style = null;
        data.enumeratePath($this.path, function(fctx) {
            g.beginPath();
            fctx.enumeratePath($this.points.getPath(), function(context) {
                var p = $this.points.getPoint(context);
                if(!style) style = $this.style.getStyle(context);
                if(index == 0) {
                    g.moveTo(p.x, p.y);
                } else {
                    g.lineTo(p.x, p.y);
                }
                index++;
            });
            if(style && style.stroke_style) {
                g.strokeStyle = style.stroke_style.toRGBA();
                if(style.width) g.lineWidth = style.width;
                if(style.line_cap) g.lineCap = style.line_cap;
                if(style.line_join) g.lineJoin = style.line_join;
                g.stroke();
            }
        });
    },
    renderSelected: function(g, data) {
        var $this = this;
        var index = 0;
        var style = null;
        data.enumeratePath($this.path, function(fctx) {
            g.beginPath();
            fctx.enumeratePath($this.points.getPath(), function(context) {
                var p = $this.points.getPoint(context);
                if(!style) style = $this.style.getStyle(context);
                if(index == 0) {
                    g.moveTo(p.x, p.y);
                } else {
                    g.lineTo(p.x, p.y);
                }
                index++;
            });
            g.lineJoin = "round";
            g.strokeStyle = IV.colors.selection.toRGBA();
            g.lineWidth = 1.0 / IV.viewarea.scale;
            g.stroke();
        });
    },
    select: function(pt, data, action) {
        var rslt = null;
        var $this = this;
        data.enumeratePath($this.path, function(fctx) {
            var pts = [];
            fctx.enumeratePath($this.points.getPath(), function(context) {
                pts.push($this.points.getPoint(context));
            });
            for(var i = 0; i < pts.length - 1; i++) {
                var d = IV.pointLineSegmentDistance(pt, pts[i], pts[i + 1]);
                if(d <= 4) {
                    if(!rslt || rslt.distance > d)
                        rslt = { distance: d };
                }
            }
        });
        return rslt;
    }
});

IV.objects.LineThrough = LineThrough;

})();
