//. iVisDesigner - File: scripts/core/objects/track.js
//. Copyright 2013-2014 Donghao Ren
//. Peking University, University of California, Santa Barbara
//. See LICENSE.md for more information.

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
    this.fillDefault();
}, {
    $auto_properties: [ "path", "anchor1", "anchor2", "min", "max", "mapping", "guide_path" ],
    fillDefault: function() {
        if(this.tick_style === undefined) this.tick_style = new TickStyle();
        if(this.mapping === undefined) this.mapping = "linear";
        //if(this.additional_paths === undefined) this.additional_paths = [];
    },
    postDeserialize: function() {
        this.fillDefault();
    },
    can: function(cap) {
        if(cap == "get-point") return true;
    },
    getPath: function() {
        return this.path;
    },
    getAnchors: function() {
        var r = [];
        if(this.anchor1.type == "Plain") r.push(this.anchor1.obj);
        if(this.anchor2.type == "Plain") r.push(this.anchor2.obj);
        return r;
    },
    getGuidePath: function() {
        return this.guide_path;
    },
    get: function(context, type) {
        var p1 = this.anchor1.getPoint(context);
        var p2 = this.anchor2.getPoint(context);
        if(type == "anchor1") return p1;
        if(type == "anchor2") return p2;
        var min = this.min.get(context);
        var max = this.max.get(context);
        var value;
        if(type && type.constructor == IV.Path) {
            value = context.get(type).val();
        } else {
            value = context.get(this.path).val();
        }
        if(value === null || p1 === null || p2 === null || min === null || max === null) return null;
        if(this.mapping == "logarithmic") {
            if(value <= 0) value = -0.05;
            else value = (Math.log10(value) - Math.log10(min)) / (Math.log10(max) - Math.log10(min));
        } else {
            value = (value - min) / (max - min);
        }
        var r = p1.interp(p2, value);
        r.ex = p2.sub(p1).normalize();
        r.ey = r.ex.rotate90();
        return r;
    },
    getPropertyContext: function() {
        var $this = this;
        return Objects.Object.prototype.getPropertyContext.call(this).concat([
            make_prop_ctx($this, "guide_path", "Selector", "Track", "path"),
            make_prop_ctx($this, "path", "Value", "Track", "path"),
            //make_prop_ctx($this, "additional_paths", "Values", "Track", "*path"),
            make_prop_ctx($this, "min", "Min", "Track", "number"),
            make_prop_ctx($this, "max", "Max", "Track", "number"),
            make_prop_ctx($this, "anchor1", "Anchor1", "Track", "point"),
            make_prop_ctx($this, "anchor2", "Anchor2", "Track", "point"),
            make_prop_ctx($this, "mapping", "Mapping", "Track", "string",
                [{ name: "linear", display: "Linear" }, { name: "logarithmic", display: "Logarithmic" }]
            ),
            {
                name: "Tick",
                group: "Track",
                type: "nested",
                properties: $this.tick_style.getPropertyContext()
            }
        ]);
    },
    enumerateGuide: function(data, callback) {
        var $this = this;
        this.guide_path.enumerate(data, function(context) {
            var p1 = $this.anchor1.getPoint(context);
            var p2 = $this.anchor2.getPoint(context);
            callback(p1, p2, context);
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
        var tick_style = $this.tick_style;
        if(tick_style.show_ticks) {
            g.strokeStyle = tick_style.tick_color.toRGBA();
            g.fillStyle = tick_style.tick_color.toRGBA();
            g.lineWidth = tick_style.tick_width;
            g.ivSetFont(tick_style.font.getFont());
            var format = d3.format(tick_style.tick_format);
            if(tick_style.tick_format.slice(-2) == ".T") {
                var tf = d3.time.format(tick_style.tick_format.slice(0, -2));
                format = function(val) {
                    return tf(new Date(val * 1000));
                };
            }
            $this.enumerateGuide(data, function(p1, p2, ctx) {
                var dir = p2.sub(p1).normalize();
                var len = p2.distance(p1);
                g.save();
                g.translate(p1.x, p1.y);
                g.rotate(Math.atan2(dir.y, dir.x));

                g.beginPath();
                g.moveTo(0, 0);
                g.lineTo(len, 0);
                g.stroke();

                var scale = $this.getD3Scale(ctx);
                scale.range([0, len]);

                var ts = tick_style.tick_size;
                var ticks = scale.ticks(Math.round(tick_style.tick_count));
                for(var i = 0; i < ticks.length; i++) {
                    var v = scale(ticks[i]);
                    g.beginPath();
                    g.moveTo(v, -ts);
                    g.lineTo(v, ts);
                    g.stroke();
                }
                for(var i = 0; i < ticks.length; i++) {
                    var ti = ticks[i];
                    if($this.mapping == "logarithmic")
                        if(Math.abs(Math.round(Math.log10(ti)) - Math.log10(ti)) > 1e-6)
                            continue;
                    var v = scale(ti);
                    var text = format(ti);

                    var font_height = tick_style.font.font_size;
                    var rotation = tick_style.rotation;
                    // Make rotation within -180 to 180.
                    rotation = rotation % 360;
                    if(rotation < 0) rotation += 360;
                    if(rotation > 180) rotation -= 360;
                    var rotation_rad = rotation / 180.0 * Math.PI;
                    var font_width = g.ivMeasureText(text).width;
                    var sh = Math.min(Math.abs(rotation) / 10, 1);
                    g.textAlign = "center";
                    var roffset = tick_style.font.font_size / 5;
                    if(ts >= 0) {
                        var rsh = Math.cos(rotation_rad) * font_width / 2 * sh;
                        if(rotation > 0) rsh = -rsh;
                        var rsw = 0;
                        if(Math.abs(rotation) < 90) rsw = Math.abs(Math.cos(rotation_rad)) * font_height;
                        g.save();
                        g.translate(v + rsh, -roffset - ts - Math.abs(Math.sin(rotation_rad)) * font_width / 2 - rsw);
                        g.rotate(rotation_rad);
                        g.ivFillText(text, 0, 0);
                        g.restore();
                    } else {
                        var rsh = Math.cos(rotation_rad) * font_width / 2 * sh;
                        if(rotation < 0) rsh = -rsh;
                        var rsw = 0;
                        if(Math.abs(rotation) > 90) rsw = Math.abs(Math.cos(rotation_rad)) * font_height;
                        g.save();
                        g.translate(v + rsh, roffset - ts + Math.abs(Math.sin(rotation_rad)) * font_width / 2 + rsw);
                        g.rotate(rotation_rad);
                        g.ivFillText(text, 0, 0);
                        g.restore();
                        //g.fillText(text, v, -ts + font_height);
                    }
                }
                g.restore();
            });
        }
    },
    select: function(pt, data, action) {
        if(action == "move-element") return null;
        var $this = this;
        var rslt = null;
        this.enumerateGuide(data, function(p1, p2) {
            var d = IV.geometry.pointLineSegmentDistance(pt, p1, p2);
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
                        rslt.onMove = function(p0, p1, magnetics) {
                            var best_shift = { x: 0, y: 0 };
                            var accept_info = null;
                            var best_distance = 1e100;
                            var actions = [];

                            for(var i = 0; i < move_targets.length; i++) {
                                if(move_targets[i].type == "Plain") {
                                    var p = p1.sub(p0).add(this.originals[i]);
                                    var np = magnetics.modify(p.x, p.y);
                                    if(np) {
                                        (function(np) {
                                            var sh = { x: np.x - p.x, y: np.y - p.y };
                                            var d = sh.x * sh.x + sh.y * sh.y;
                                            if(best_distance > d) {
                                                best_distance = d;
                                                best_shift = sh;
                                                accept_info = [ np, np.x, np.y ];
                                            }
                                        })(np);
                                    }
                                }
                            }

                            if(accept_info) {
                                magnetics.accept(accept_info[0], accept_info[1], accept_info[2]);
                            }

                            for(var i = 0; i < move_targets.length; i++) {
                                if(move_targets[i].type == "Plain") {
                                    var p = p1.sub(p0).add(this.originals[i]);
                                    p.x += best_shift.x;
                                    p.y += best_shift.y;
                                    actions.push(new IV.actions.SetDirectly(move_targets[i], "obj", p));
                                }
                                if(move_targets[i].type == "PointOffset")
                                    var new_offset = p1.sub(p0).add(this.originals[i]).add(
                                        new IV.Vector(best_shift.x, best_shift.y)
                                    );
                                    actions.push(new IV.actions.SetDirectly(move_targets[i], "offset", p));
                            }
                            return {
                                actions: actions,
                                trigger_render: "main,back,front"
                            };
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
                    new_value = Math.exp10(new_value * (Math.log10(max) - Math.log10(min)) + Math.log10(min));
                } else {
                    new_value = new_value * (max - min) + min;
                }
                context.set($this.path, new_value);
            }
        };
    }
});

// Point Offset.
var TrackWrapper = IV.extend(Objects.Object, function(track, path) {
    Objects.Object.call(this);
    this.track = track;
    this.path = path;
    this.type = "TrackWrapper";
}, {
    get: function(context) {
        var pt = this.track.get(context, this.path);
        return pt;
    },
    can: function(cap) {
        if(cap == "get-point") return true;
        return false;
    },
    clone: function() {
        return new TrackWrapper(this.track, this.path);
    }
});
Objects.TrackWrapper = TrackWrapper;
IV.serializer.registerObjectType("TrackWrapper", TrackWrapper);

var Scatter = IV.extend(Objects.Object, function(info) {
    Objects.Object.call(this);
    this.type = "Scatter";
    this.track1 = info.track1;
    this.track2 = info.track2;
    var resolve_wrapper = function(o) {
        if(o.type == "ReferenceWrapper") return resolve_wrapper(o.obj);
        return o;
    };
    this.real_track1 = resolve_wrapper(this.track1);
    this.real_track2 = resolve_wrapper(this.track2);
    this.path = IV.Path.commonPrefix([ this.track1.getPath(), this.track2.getPath() ]);
    this.guide_path = IV.Path.commonPrefix([ this.real_track1.getGuidePath(), this.real_track2.getGuidePath() ]);
    this.fillDefault();
}, {
    $auto_properties: [ "show_x_ticks", "show_y_ticks", "track1", "track2", "path", "guide_path" ],
    fillDefault: function() {
        if(this.show_x_ticks === undefined) this.show_x_ticks = true;
        if(this.show_y_ticks === undefined) this.show_y_ticks = true;
        if(!this.real_track1) this.real_track1 = this.track1;
        if(!this.real_track2) this.real_track2 = this.track2;
    },
    postDeserialize: function() {
        this.fillDefault();
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

        var d2 = this.track1.get(context, "anchor2")
                .sub(this.track1.get(context, "anchor1")).rotate90();
        var d1 = this.track2.get(context, "anchor2")
                .sub(this.track2.get(context, "anchor1"));

        var p = d1.scale(p2.sub(p1).dot(d2) / d1.dot(d2)).add(p1);
        p.ex = d1.normalize();
        p.ey = d2.rotate90().normalize();
        return p;
    },
    enumerateGuide: function(data, callback) {
        var $this = this;
        this.guide_path.enumerate(data, function(context) {
            var p1 = $this.track1.get(context, "anchor1");
            var p2 = $this.track1.get(context, "anchor2");
            var q1 = $this.track2.get(context, "anchor1");
            var q2 = $this.track2.get(context, "anchor2");
            callback(p1, p2, q1, q2, context);
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
        var s1 = 0.06;
        var s2 = 0.04;
        var lines = [
            [kscatter(0, s), kscatter(0, 1 - s)],
            [kscatter(1, s), kscatter(1, 1 - s)],
            [kscatter(s, 0), kscatter(1 - s, 0)],
            [kscatter(s, 1), kscatter(1 - s, 1)],
            [kscatter(s1, s), kscatter(s2, s)],
            [kscatter(1 - s1, s), kscatter(1 - s2, s)],
            [kscatter(s1, 1 - s), kscatter(s2, 1 - s)],
            [kscatter(1 - s1, 1 - s), kscatter(1 - s2, 1 - s)],
            [kscatter(s, s1), kscatter(s, s2)],
            [kscatter(s, 1 - s1), kscatter(s, 1 - s2)],
            [kscatter(1 - s, s1), kscatter(1 - s, s2)],
            [kscatter(1 - s, 1 - s1), kscatter(1 - s, 1 - s2)]
        ];
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
    render: function(g, data) {
        var $this = this;
        $this.enumerateGuide(data, function(p1, p2, q1, q2, context) {
            var scale1 = $this.real_track1.getD3Scale(context);
            var scale2 = $this.real_track2.getD3Scale(context);
            var d2 = p2.sub(p1);
            var d2r = d2.rotate90();
            var d1 = q2.sub(q1);
            var p = d1.scale(q1.sub(p1).dot(d2r) / d1.dot(d2r)).add(p1);
            if($this.show_x_ticks) {
                g.strokeStyle = $this.real_track1.tick_style.tick_color.toRGBA(0.1);
                var ticks = scale1.ticks($this.real_track2.tick_style.tick_count).map(scale1);
                for(var i = 0; i < ticks.length; i++) {
                    var s = p.add(d2.scale(ticks[i]));
                    var t = s.add(d1);
                    g.beginPath();
                    s.callMoveTo(g);
                    t.callLineTo(g);
                    g.stroke();
                }
            }
            if($this.show_y_ticks) {
                g.strokeStyle = $this.real_track2.tick_style.tick_color.toRGBA(0.1);
                var ticks = scale2.ticks($this.real_track2.tick_style.tick_count).map(scale2);
                for(var i = 0; i < ticks.length; i++) {
                    var s = p.add(d1.scale(ticks[i]));
                    var t = s.add(d2);
                    g.beginPath();
                    s.callMoveTo(g);
                    t.callLineTo(g);
                    g.stroke();
                }
            }
        });
    },
    select: function(pt, data, action) {
        if(action == "move-element") return null;
        var $this = this;
        var rslt = null;
        $this.enumerateGuide(data, function(p1, p2, q1, q2) {
            $this._getmarkers(p1, p2, q1, q2).forEach(function(l) {
                var d = IV.geometry.pointLineSegmentDistance(pt, l[0], l[1]);
                if(d < 4.0 / pt.view_scale) rslt = { distance: d };
            });
        });
        return rslt;
    },
    beginMoveElement: function(context) {
        d1 = this.track1.get(context, "anchor1").sub(this.track1.get(context, "anchor2"));
        d2 = this.track2.get(context, "anchor1").sub(this.track2.get(context, "anchor2"));
        var c1 = this.track1.beginMoveElement(context, d2);
        var c2 = this.track2.beginMoveElement(context, d1);
        return {
            onMove: function(p0, p1) {
                c1.onMove(p0, p1);
                c2.onMove(p0, p1);
            }
        };
    },
    getPropertyContext: function() {
        var $this = this;
        return Objects.Object.prototype.getPropertyContext.call(this).concat([
            make_prop_ctx($this, "guide_path", "Selector", "Scatter", "path"),
            make_prop_ctx($this, "path", "Value", "Scatter", "path"),
            make_prop_ctx(this, "show_x_ticks", "XTicks", "Scatter", "plain-bool"),
            make_prop_ctx(this, "show_y_ticks", "YTicks", "Scatter", "plain-bool")
        ]);
    }
});

Objects.Track = Track;
Objects.Scatter = Scatter;

IV.serializer.registerObjectType("Track", Track);
IV.serializer.registerObjectType("Scatter", Scatter);
})();
