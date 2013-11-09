// iVisDesigner
// Author: Donghao Ren, PKUVIS, Peking University, 2013.04
// See LICENSE.txt for copyright information.

// scripts/objects/track.js
// Track and scatter object.

(function() {

var Track = IV.extend(Objects.Object, function(info) {
    Objects.Object.call(this);
    this.path = info.path;
    this.type = "Track";
    this.anchor1 = info.anchor1;
    this.anchor2 = info.anchor2;
    this.min = info.min !== undefined ? info.min : new IV.objects.Plain(0);
    this.max = info.max !== undefined ? info.max : new IV.objects.Plain(100);
    this.guide_path = IV.Path.commonPrefix([ this.anchor1.getPath(), this.anchor2.getPath() ]);
    this.mapping = "linear";
    this.show_ticks = false;
    this.tick_size = 2;
    this.tick_color = new IV.Color(0, 0, 0, 1);
}, {
    postDeserialize: function() {
        if(this.show_ticks === undefined) this.show_ticks = true;
        if(this.tick_size === undefined) this.tick_size = 2;
        if(this.tick_color === undefined) this.tick_color = new IV.Color(0, 0, 0, 1);
        if(this.tick_format === undefined) this.tick_format = "4.2f";
    },
    can: function(cap) {
        if(cap == "get-point") return true;
    },
    getPath: function() {
        return this.path;
    },
    getGuidePath: function() {
        return this.guide_path;
    },
    get: function(context) {
        var p1 = this.anchor1.getPoint(context);
        var p2 = this.anchor2.getPoint(context);
        var min = this.min.get(context);
        var max = this.max.get(context);
        var value = context.get(this.path).val();
        if(value === null || p1 === null || p2 === null || min === null || max === null) return null;
        if(this.mapping == "logarithmic") {
            value = (Math.log10(value) - Math.log10(min)) / (Math.log10(max) - Math.log10(min));
        } else {
            value = (value - min) / (max - min);
        }
        return p1.interp(p2, value);
    },
    getPropertyContext: function() {
        var $this = this;
        return Objects.Object.prototype.getPropertyContext.call(this).concat([
            {
                name: "Path",
                group: "Track",
                type: "path",
                get: function() { return $this.guide_path; },
                set: function(val) { return $this.guide_path = val; }
            },
            {
                name: "Value",
                group: "Track",
                type: "path",
                get: function() { return $this.path; },
                set: function(val) { return $this.path = val; }
            },
            {
                name: "Min",
                group: "Track",
                type: "number",
                get: function() { return $this.min; },
                set: function(val) { return $this.min = val; }
            },
            {
                name: "Max",
                group: "Track",
                type: "number",
                get: function() { return $this.max; },
                set: function(val) { return $this.max = val; }
            },
            {
                name: "Anchor1",
                group: "Track",
                type: "point",
                get: function() { return $this.anchor1; },
                set: function(val) { return $this.anchor1 = val; }
            },
            {
                name: "Anchor2",
                group: "Track",
                type: "point",
                get: function() { return $this.anchor2; },
                set: function(val) { return $this.anchor2 = val; }
            },
            {
                name: "Mapping",
                group: "Track",
                type: "string",
                args: [{ name: "linear", display: "Linear" }, { name: "logarithmic", display: "Logarithmic" }],
                get: function() { return $this.mapping ? $this.mapping : "linear"; },
                set: function(val) { return $this.mapping = val; }
            },
            {
                name: "Ticks",
                group: "Track",
                type: "plain-bool",
                get: function() { return $this.show_ticks; },
                set: function(val) { return $this.show_ticks = val; }
            },
            {
                name: "TickSize",
                group: "Track",
                type: "plain-number",
                get: function() { return $this.tick_size; },
                set: function(val) { return $this.tick_size = val; }
            },
            {
                name: "TickColor",
                group: "Track",
                type: "plain-color",
                get: function() { return $this.tick_color; },
                set: function(val) { return $this.tick_color = val; }
            },
            {
                name: "TickFormat",
                group: "Track",
                type: "plain-string",
                get: function() { return $this.tick_format; },
                set: function(val) { return $this.tick_format = val; }
            }
        ]);
    },
    enumerateGuide: function(data, callback) {
        var $this = this;
        this.guide_path.enumerate(data, function(context) {
            var p1 = $this.anchor1.getPoint(context);
            var p2 = $this.anchor2.getPoint(context);
            callback(p1, p2, context);
            return false;
        });
    },
    renderGuide: function(g, data) {
        this.enumerateGuide(data, function(p1, p2) {
            g.strokeStyle = "rgba(128,128,128,0.5)";
            g.fillStyle = "rgba(128,128,128,1)";

            var r = g.ivGuideLineWidth() * 2;

            g.beginPath();
            g.moveTo(p1.x, p1.y);
            g.lineTo(p2.x, p2.y);
            g.stroke();

            g.beginPath();
            g.arc(p1.x, p1.y, r, 0, Math.PI * 2);
            g.fill();

            g.beginPath();
            g.arc(p2.x, p2.y, r, 0, Math.PI * 2);
            g.fill();
        });
    },
    renderGuideSelected: function(g, data) {
        this.enumerateGuide(data, function(p1, p2) {
            g.strokeStyle = IV.colors.selection.toRGBA();
            g.fillStyle = IV.colors.selection.toRGBA();

            var r = g.ivGuideLineWidth() * 3;

            g.beginPath();
            g.moveTo(p1.x, p1.y);
            g.lineTo(p2.x, p2.y);
            g.stroke();

            g.beginPath();
            g.arc(p1.x, p1.y, r, 0, Math.PI * 2);
            g.fill();

            g.beginPath();
            g.arc(p2.x, p2.y, r, 0, Math.PI * 2);
            g.fill();
        });
    },
    getD3Scale: function(context) {
        var scale = d3.scale.linear();
        if(this.mapping == "logarithmic") {
            scale = d3.scale.log();
            scale.base(10);
        }
        scale.domain([ this.min.get(context), this.max.get(context) ]);
        scale.range([0, 1]);
        return scale;
    },
    render: function(g, data) {
        var $this = this;
        if(true || $this.show_ticks) {
            g.strokeStyle = $this.tick_color.toRGBA();
            var format = d3.format($this.tick_format);
            $this.enumerateGuide(data, function(p1, p2, ctx) {
                var dir = p2.sub(p1).normalize();
                var len = p2.distance(p1);
                g.save();
                g.translate(p1.x, p1.y);
                g.rotate(Math.atan2(dir.y, dir.x));
                g.scale(1, -1);

                g.beginPath();
                g.moveTo(0, 0);
                g.lineTo(len, 0);
                g.stroke();

                var scale = $this.getD3Scale(ctx);
                scale.range([0, len]);

                var ts = $this.tick_size;
                var ticks = scale.ticks(5);
                for(var i = 0; i < ticks.length; i++) {
                    var v = scale(ticks[i]);
                    g.beginPath();
                    g.moveTo(v, -ts);
                    g.lineTo(v, ts);
                    g.stroke();
                }
                for(var i = 0; i < ticks.length; i++) {
                    var v = scale(ticks[i]);
                    g.textAlign = "center";
                    g.fillText(format(ticks[i]), v, -2 - ts);
                }
                g.restore();
            });
        }
    },
    select: function(pt, data, action) {
        var $this = this;
        var rslt = null;
        this.enumerateGuide(data, function(p1, p2) {
            var d = IV.pointLineSegmentDistance(pt, p1, p2);
            var threshold = 4.0 / pt.view_scale;
            if(d < threshold) {
                rslt = { distance: d };
                if(action == "move") {
                    var move_targets = [];
                    var can_move = function(a) { return a.type == "Plain" || a.type == "PointOffset"; };
                    if(p1.distance(pt) < threshold) {
                        if(can_move($this.anchor1)) {
                            move_targets.push($this.anchor1);
                        }
                    } else if(p2.distance(pt) < threshold) {
                        if(can_move($this.anchor2)) {
                            move_targets.push($this.anchor2);
                        }
                    } else if(can_move($this.anchor1) && can_move($this.anchor2)) {
                        move_targets.push($this.anchor1);
                        move_targets.push($this.anchor2);
                    }
                    if(move_targets.length > 0) {
                        rslt.originals = move_targets.map(function(plain) {
                            if(plain.type == "Plain")
                                return plain.obj;
                            if(plain.type == "PointOffset")
                                return plain.offset;
                        });
                        rslt.onMove = function(p0, p1) {
                            for(var i = 0; i < move_targets.length; i++) {
                                if(move_targets[i].type == "Plain")
                                    move_targets[i].obj = p1.sub(p0).add(this.originals[i]);
                                if(move_targets[i].type == "PointOffset")
                                    move_targets[i].offset = p1.sub(p0).add(this.originals[i]);
                            }
                            return { trigger_render: "main,back" };
                        };
                    }
                }
            }
        });
        return rslt;
    },
    beginMoveElement: function(context, d) {
        var $this = this;
        var a1 = this.anchor1.getPoint(context);
        var a2 = this.anchor2.getPoint(context);
        var min = this.min.get(context);
        var max = this.max.get(context);
        if(!d) d = a2.sub(a1).rotate90();
        return {
            onMove: function(p0, p1) {
                var new_value = p1.sub(a1).cross(d) / a2.sub(a1).cross(d);
                if($this.mapping == "logarithmic") {
                    new_value = Math.exp(new_value * (Math.log10(max) - Math.log10(min)) + Math.log10(min));
                } else {
                    new_value = new_value * (max - min) + min;
                }
                context.set($this.path, new_value);
            }
        };
    }
});

var Scatter = IV.extend(Objects.Object, function(info) {
    Objects.Object.call(this);
    this.type = "Scatter";
    this.track1 = info.track1;
    this.track2 = info.track2;
    this.path = IV.Path.commonPrefix([ this.track1.getPath(), this.track2.getPath() ]);
    this.guide_path = IV.Path.commonPrefix([ this.track1.getGuidePath(), this.track2.getGuidePath() ]);
    this.show_x_ticks = false;
    this.show_y_ticks = false;
}, {
    postDeserialize: function() {
        if(this.show_x_ticks === undefined) this.show_x_ticks = true;
        if(this.show_y_ticks === undefined) this.show_y_ticks = true;
    },
    can: function(cap) {
        if(cap == "get-point") return true;
    },
    getPath: function() {
        return this.path;
    },
    getGuidePath: function() {
        return this.guide_path;
    },
    get: function(context) {
        var p1 = this.track1.getPoint(context);
        var p2 = this.track2.getPoint(context);
        if(p1 === null || p2 === null) return null;

        var d2 = this.track1.anchor2.getPoint(context)
                .sub(this.track1.anchor1.getPoint(context)).rotate90();
        var d1 = this.track2.anchor2.getPoint(context)
                .sub(this.track2.anchor1.getPoint(context));

        var p = d1.scale(p2.sub(p1).dot(d2) / d1.dot(d2)).add(p1);
        return p;
    },
    enumerateGuide: function(data, callback) {
        var $this = this;
        this.guide_path.enumerate(data, function(context) {
            var p1 = $this.track1.anchor1.getPoint(context);
            var p2 = $this.track1.anchor2.getPoint(context);
            var q1 = $this.track2.anchor1.getPoint(context);
            var q2 = $this.track2.anchor2.getPoint(context);
            callback(p1, p2, q1, q2, context);
            return false;
        });
    },
    _getmarkers: function(p1, p2, q1, q2) {
        var d2 = p2.sub(p1).rotate90();
        var d1 = q2.sub(q1);
        var scatter = function(p1, p2) {
            return d1.scale(p2.sub(p1).dot(d2) / d1.dot(d2)).add(p1);
        };
        var kscatter = function(k1, k2) {
            return scatter(p1.interp(p2, k1), q1.interp(q2, k2));
        };
        var s = 0.05;
        var lines = [[kscatter(0, s), kscatter(0, 1 - s)],
                     [kscatter(1, s), kscatter(1, 1 - s)],
                     [kscatter(s, 0), kscatter(1 - s, 0)],
                     [kscatter(s, 1), kscatter(1 - s, 1)]];
        return lines;
    },
    renderGuide: function(g, data) {
        var $this = this;
        $this.enumerateGuide(data, function(p1, p2, q1, q2) {
            g.strokeStyle = "rgba(128,128,128,0.5)";
            g.fillStyle = "rgba(128,128,128,1)";
            g.ivGuideLineWidth();
            $this._getmarkers(p1, p2, q1, q2).forEach(function(l) {
                g.beginPath();
                l[0].callMoveTo(g);
                l[1].callLineTo(g);
                g.stroke();
            });
        });
    },
    renderGuideSelected: function(g, data) {
        var $this = this;
        $this.enumerateGuide(data, function(p1, p2, q1, q2) {
            g.strokeStyle = IV.colors.selection.toRGBA();
            g.fillStyle = IV.colors.selection.toRGBA();
            g.ivGuideLineWidth();
            $this._getmarkers(p1, p2, q1, q2).forEach(function(l) {
                g.beginPath();
                l[0].callMoveTo(g);
                l[1].callLineTo(g);
                g.stroke();
            });
        });
    },
    select: function(pt, data, action) {
        var $this = this;
        var rslt = null;
        $this.enumerateGuide(data, function(p1, p2, q1, q2) {
            $this._getmarkers(p1, p2, q1, q2).forEach(function(l) {
                var d = IV.pointLineSegmentDistance(pt, l[0], l[1]);
                if(d < 4.0 / pt.view_scale) rslt = { distance: d };
            });
        });
        return rslt;
    },
    beginMoveElement: function(context) {
        d1 = this.track1.anchor1.getPoint(context).sub(this.track1.anchor2.getPoint(context));
        d2 = this.track2.anchor1.getPoint(context).sub(this.track2.anchor2.getPoint(context));
        var c1 = this.track1.beginMoveElement(context, d2);
        var c2 = this.track2.beginMoveElement(context, d1);
        return {
            onMove: function(p0, p1) {
                c1.onMove(p0, p1);
                c2.onMove(p0, p1);
            }
        };
    }
});

Objects.Track = Track;
Objects.Scatter = Scatter;

IV.serializer.registerObjectType("Track", Track);
IV.serializer.registerObjectType("Scatter", Scatter);
})();
