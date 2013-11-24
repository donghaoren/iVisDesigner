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
    fillDefault: function() {
        if(this.tick_style === undefined) this.tick_style = new TickStyle();
        if(this.mapping === undefined) this.mapping = "linear";
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
                get: function() { return $this.mapping; },
                set: function(val) { return $this.mapping = val; }
            },
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
    this.fillDefault();
}, {
    fillDefault: function() {
        if(this.show_x_ticks === undefined) this.show_x_ticks = true;
        if(this.show_y_ticks === undefined) this.show_y_ticks = true;
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
    render: function(g, data) {
        var $this = this;
        $this.enumerateGuide(data, function(p1, p2, q1, q2, context) {
            var scale1 = $this.track1.getD3Scale(context);
            var scale2 = $this.track2.getD3Scale(context);
            var d2 = p2.sub(p1);
            var d2r = d2.rotate90();
            var d1 = q2.sub(q1);
            var p = d1.scale(q1.sub(p1).dot(d2r) / d1.dot(d2r)).add(p1);
            if($this.show_x_ticks) {
                g.strokeStyle = $this.track1.tick_style.tick_color.toRGBA(0.1);
                var ticks = scale1.ticks($this.track1.tick_style.tick_count).map(scale1);
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
                g.strokeStyle = $this.track2.tick_style.tick_color.toRGBA(0.1);
                var ticks = scale2.ticks($this.track2.tick_style.tick_count).map(scale2);
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
    },
    getPropertyContext: function() {
        var $this = this;
        return Objects.Object.prototype.getPropertyContext.call(this).concat([
            {
                name: "XTicks",
                group: "Scatter",
                type: "plain-bool",
                get: function() { return $this.show_x_ticks; },
                set: function(val) { return $this.show_x_ticks = val; }
            },
            {
                name: "YTicks",
                group: "Scatter",
                type: "plain-bool",
                get: function() { return $this.show_y_ticks; },
                set: function(val) { return $this.show_y_ticks = val; }
            }
        ]);
    }
});

Objects.Track = Track;
Objects.Scatter = Scatter;

IV.serializer.registerObjectType("Track", Track);
IV.serializer.registerObjectType("Scatter", Scatter);
})();
