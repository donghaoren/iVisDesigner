// iVisDesigner
// Author: Donghao Ren, PKUVIS, Peking University, 2013.04
// See LICENSE.txt for copyright information.

// scripts/objects/shapes.js
// Define objects for various shapes.

IV.objects.Shape = IV.extend(IV.objects.Object,function(info) {
    this.path = info.path;
    if(info.style)
        this.style = info.style;
    else
        this.style = new IV.objects.PathStyle();
}, {
    render: function(g, data) {
        var $this = this;
        $this.path.enumerate(data, function(context) {
            $this.shapePaths(context, function(path) {
                $this.style.renderPath(context, g, path);
            });
        });
    },
    renderSelected: function(g, data) {
        var $this = this;
        $this.path.enumerate(data, function(context) {
            $this.shapePaths(context, function(path) {
                $this.style.renderPath(context, g, path);
            });
        });
    }
});

IV.objects.Circle = IV.extend(IV.objects.Shape, function(info) {
    IV.objects.Shape.call(this, info);
    this.type = "Circle";
    // Center.
    this.center = info.center ? info.center : new IV.objects.Plain(new IV.Vector(0, 0));
    this.radius = info.radius ? info.center : new IV.objects.Plain(2);
}, {
    shapePaths: function(context, cb) {
        cb([
            "C", this.center.getPoint(context), this.radius.get(context)
        ]);
    },
    can: function(cap) {
        if(cap == "get-point") return true;
    },
    get: function(context) {
        return this.center.getPoint(context);
    },
    select: function(pt, data, action) {
        var rslt = null;
        var $this = this;
        data.enumeratePath(this.path, function(context) {
            var c = $this.center.getPoint(context);
            var style = $this.style.getStyle(context);
            var radius = style.radius || 0;
            var d = Math.abs(pt.distance(c) - radius);
            if(d <= 4.0 / IV.viewarea.scale) {
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

IV.objects.Line = IV.extend(IV.objects.Shape, function(info) {
    IV.objects.Shape.call(this, info);
    this.type = "Line";
    this.point1 = info.point1;
    this.point2 = info.point2;
}, {
    shapePaths: function(context, cb) {
        cb([
            "M", this.point1.getPoint(context),
            "L", this.point2.getPoint(context)
        ]);
    },
    select: function(pt, data, action) {
        var rslt = null;
        var $this = this;
        data.enumeratePath(this.path, function(context) {
            var p1 = $this.point1.getPoint(context);
            var p2 = $this.point2.getPoint(context);
            var d = IV.pointLineSegmentDistance(pt, p1, p2);
            if(d <= 4.0 / IV.viewarea.scale) {
                if(!rslt || rslt.distance > d)
                    rslt = { distance: d };
            }
        });
        return rslt;
    }
});


IV.objects.LineThrough = IV.extend(IV.objects.Shape, function(info) {
    IV.objects.Shape.call(this, info);
    this.points = info.points;
    this.type = "LineThrough";
}, {
    shapePaths: function(context, cb) {
        var $this = this;
        var line = [];
        $this.points.getPath().enumerate(context.val(), function(ctx) {
            if(line.length == 0) {
                line.push("M");
            } else {
                line.push("L");
            }
            line.push($this.points.getPoint(ctx));
        });
        cb(line);
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
                if(d <= 4.0 / IV.viewarea.scale) {
                    if(!rslt || rslt.distance > d)
                        rslt = { distance: d };
                }
            }
        });
        return rslt;
    }
});
