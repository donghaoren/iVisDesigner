// iVisDesigner
// Author: Donghao Ren, PKUVIS, Peking University, 2013.04
// See LICENSE.txt for copyright information.

// scripts/objects/shapes.js
// Define objects for various shapes.

Objects.Shape = IV.extend(Objects.Object,function(info) {
    this.path = info.path;
    if(info.style)
        this.style = info.style;
    else
        this.style = new Objects.PathStyle();
}, {
    render: function(g, data) {
        var $this = this;
        $this.path.enumerate(data, function(context) {
            $this.shapePaths(context, function(path) {
                $this.style.renderPath(context, g, path);
            });
        });
    },
    renderSelected: function(g, data, context) {
        var $this = this;
        var draw_with_context = function(context) {
            $this.shapePaths(context, function(path) {
                $this.style.renderSelection(context, g, path);
            });
        };
        if(context) draw_with_context(context);
        else $this.path.enumerate(data, draw_with_context);
    },
    getPropertyContext: function() {
        var $this = this;
        return Objects.Object.prototype.getPropertyContext.call(this).concat([
            {
                name: "Path",
                group: "Shape",
                type: "path",
                get: function() { return $this.path; },
                set: function(val) { return $this.path = val; }
            }
        ]);
    }
});

Objects.Circle = IV.extend(Objects.Shape, function(info) {
    Objects.Shape.call(this, info);
    this.type = "Circle";
    // Center.
    this.center = info.center ? info.center : new Objects.Plain(new IV.Vector(0, 0));
    this.radius = info.radius ? info.radius : new Objects.Plain(2);
}, {
    shapePaths: function(context, cb) {
        var c = this.center.getPoint(context);
        var r = this.radius.get(context);
        if(c === null || r === null) return;
        cb([ "C", c, r ]);
    },
    can: function(cap) {
        if(cap == "get-point") return true;
    },
    get: function(context) {
        return this.center.getPoint(context);
    },
    getPropertyContext: function() {
        var $this = this;
        return Objects.Shape.prototype.getPropertyContext.call(this).concat([
            {
                name: "Center",
                group: "Shape",
                type: "point",
                get: function() { return $this.center; },
                set: function(val) { return $this.center = val; }
            },
            {
                name: "Radius",
                group: "Shape",
                type: "number",
                get: function() { return $this.radius; },
                set: function(val) { return $this.radius = val; }
            }
        ]);
    },
    select: function(pt, data, action) {
        var rslt = null;
        var $this = this;
        this.path.enumerate(data, function(context) {
            var c = $this.center.getPoint(context);
            var radius = $this.radius.get(context);
            if(c === null || radius === null) return;
            var d = Math.abs(pt.distance(c) - radius);
            if(d <= 4.0 / pt.view_scale) {
                if(!rslt || rslt.distance > d) {
                    rslt = { distance: d, context: context.clone() };
                    if(action == "move") {
                        if($this.center.type == "Plain") {
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
                    if(action == "move-element") {
                        if($this.center.beginMoveElement) {
                            var c = $this.center.beginMoveElement(rslt.context);
                            rslt.onMove = function(p0, p1) {
                                c.onMove(p0, p1);
                            };
                        }
                    }
                }
            }
        });
        return rslt;
    }
});

Objects.Line = IV.extend(Objects.Shape, function(info) {
    Objects.Shape.call(this, info);
    this.type = "Line";
    this.point1 = info.point1;
    this.point2 = info.point2;
}, {
    shapePaths: function(context, cb) {
        var p1 = this.point1.getPoint(context);
        var p2 = this.point2.getPoint(context);
        if(p1 === null || p2 === null) return;
        cb([ "M", p1, "L", p2 ]);
    },
    select: function(pt, data, action) {
        var rslt = null;
        var $this = this;
        this.path.enumerate(data, function(context) {
            var p1 = $this.point1.getPoint(context);
            var p2 = $this.point2.getPoint(context);
            if(p1 === null || p2 === null) return;
            var d = IV.pointLineSegmentDistance(pt, p1, p2);
            var threshold = 4.0 / pt.view_scale;
            if(d < threshold) {
                if(!rslt || rslt.distance > d)
                    rslt = { distance: d, context: context.clone() };
            }
        });
        return rslt;
    }
});

Objects.Bar = IV.extend(Objects.Shape, function(info) {
    Objects.Shape.call(this, info);
    this.type = "Bar";
    this.point1 = info.point1;
    this.point2 = info.point2;
    this.width = info.width;
}, {
    shapePaths: function(context, cb) {
        var p1 = this.point1.getPoint(context);
        var p2 = this.point2.getPoint(context);
        if(p1 === null || p2 === null) return;
        var d = p1.sub(p2).normalize().rotate90().scale(0.5 * this.width.get(context));
        cb([
            "M", p1.add(d),
            "L", p1.sub(d),
            "L", p2.sub(d),
            "L", p2.add(d),
            "Z"
        ]);
    },
    getPropertyContext: function() {
        var $this = this;
        return Objects.Shape.prototype.getPropertyContext.call(this).concat([
            {
                name: "Width",
                group: "Shape",
                type: "number",
                get: function() { return $this.width; },
                set: function(val) { return $this.width = val; }
            }
        ]);
    },
    select: function(pt, data, action) {
        var rslt = null;
        var $this = this;
        this.path.enumerate(data, function(context) {
            var p1 = $this.point1.getPoint(context);
            var p2 = $this.point2.getPoint(context);
            if(p1 === null || p2 === null) return;
            var d = IV.pointLineSegmentDistance(pt, p1, p2);
            var threshold = 4.0 / pt.view_scale;
            if(d < threshold) {
                if(!rslt || rslt.distance > d)
                    rslt = { distance: d, context: context.clone() };
            }
        });
        return rslt;
    }
});

Objects.LineThrough = IV.extend(Objects.Shape, function(info) {
    Objects.Shape.call(this, info);
    this.points = info.points;
    this.type = "LineThrough";
}, {
    shapePaths: function(context, cb) {
        var $this = this;
        var line = [];
        $this.points.getPath().enumerateAtContext(context, function(ctx) {
            var pt = $this.points.getPoint(ctx);
            if(pt === null) return;
            if(line.length == 0) {
                line.push("M");
            } else {
                line.push("L");
            }
            line.push(pt);
        });
        cb(line);
    },
    can: function(cap) {
        if(cap == "get-point") return true;
    },
    get: function(context) {
        return this.points.getPoint(context);
    },
    select: function(pt, data, action) {
        var rslt = null;
        var $this = this;
        $this.path.enumerate(data, function(fctx) {
            var pts = [];
            $this.points.getPath().enumerateAtContext(fctx, function(context) {
                var pt = $this.points.getPoint(context);
                if(pt !== null)
                    pts.push(pt);
            });
            for(var i = 0; i < pts.length - 1; i++) {
                var d = IV.pointLineSegmentDistance(pt, pts[i], pts[i + 1]);
                if(d <= 4.0 / pt.view_scale) {
                    if(!rslt || rslt.distance > d)
                        rslt = { distance: d, context: fctx.clone() };
                }
            }
        });
        return rslt;
    }
});

IV.serializer.registerObjectType("Circle", Objects.Circle);
IV.serializer.registerObjectType("Line", Objects.Line);
IV.serializer.registerObjectType("Bar", Objects.Bar);
IV.serializer.registerObjectType("LineThrough", Objects.LineThrough);
