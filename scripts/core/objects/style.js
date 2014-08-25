// iVisDesigner - File: scripts/core/objects/style.js
// Copyright (c) 2013-2014, Donghao Ren
// University of California Santa Barbara, Peking University
// Advised by Prof. Tobias Hollerer and previously by Prof. Xiaoru Yuan.
//
// All rights reserved.
//
// Redistribution and use in source and binary forms, with or without
// modification, are permitted provided that the following conditions are met:
//
// 1. Redistributions of source code must retain the above copyright notice,
//    this list of conditions and the following disclaimer.
//
// 2. Redistributions in binary form must reproduce the above copyright
//    notice, this list of conditions and the following disclaimer in the
//    documentation and/or other materials provided with the distribution.
//
// THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS
// IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO,
// THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR
// PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR
// CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
// EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,
// PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS;
// OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY,
// WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR
// OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF
// ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

Objects.PathStyle = IV.extend(Objects.Object, function(type) {
    Objects.Object.call(this);
    if(type == "Circle" || type == "Text" || type == "Bar") {
        this.actions = [
            {
                type: "fill",
                color: new Objects.Plain(new IV.Color(0, 0, 0, 1))
            }
        ];
    } else if(type == "Line" || type == "Arc" || type == "Polyline" || type == "LineThrough") {
        this.actions = [
            {
                type: "stroke",
                color: new Objects.Plain(new IV.Color(0, 0, 0, 1)),
                width: new Objects.Plain(1),
                join: new Objects.Plain("bevel"),
                cap: new Objects.Plain("butt")
            }
        ];
    } else {
        // Default attributes.
        this.actions = [
            {
                type: "fill",
                color: new Objects.Plain(new IV.Color(128, 128, 128, 1))
            },
            {
                type: "stroke",
                color: new Objects.Plain(new IV.Color(0, 0, 0, 1)),
                width: new Objects.Plain(1),
                join: new Objects.Plain("bevel"),
                cap: new Objects.Plain("butt")
            }
        ];
    }
    this.type = "PathStyle";
}, {
    // path should be an array:
    // string: command, IV.Vector: location.
    renderPath: function(context, g, path) {
        var $this = this;
        this.actions.forEach(function(act) {
            if(act.enabled) {
                if(!act.enabled.get(context)) return;
            }
            $this["_perform_" + act.type](act, context, g, path);
        });
    },
    renderGuide: function(context, g, path) {
        g.strokeStyle = "#888";
        g.lineCap = "butt";
        g.lineJoin = "bevel";
        g.ivGuideLineWidth();
        g.beginPath();
        this._run_path(g, path);
        g.stroke();
    },
    renderSelection: function(context, g, path) {
        g.strokeStyle = IV.colors.selection.toRGBA();
        g.lineCap = "butt";
        g.lineJoin = "bevel";
        g.ivGuideLineWidth();
        g.beginPath();
        this._run_path(g, path);
        g.stroke();
    },
    renderText: function(context, g, text, x, y, font) {
        var $this = this;
        this.actions.forEach(function(act) {
            if(act.enabled) {
                if(!act.enabled.get(context)) return;
            }
            $this["_perform_" + act.type + "_text"](act, context, g, text, x, y, font);
        });
    },
    clone: function() {
        var r = new Objects.PathStyle();
        r.actions = this.actions.map(function(act) {
            var c = { type: act.type };
            if(act.color) c.color = act.color.clone();
            if(act.width) c.width = act.width.clone();
            if(act.join) c.join = act.join.clone();
            if(act.cap) c.cap = act.cap.clone();
            return c;
        });
        return r;
    },
    _run_path: function(g, path) {
        // See http://www.w3.org/TR/2013/CR-2dcontext-20130806
        // for canvas's path specification.
        var i = 0;
        while(i < path.length) {
            var cmd = path[i++];
            // M pt: move to
            if(cmd == "M") {
                g.moveTo(path[i].x, path[i].y);
                i += 1;
            }
            // L pt: line to
            if(cmd == "L") {
                g.lineTo(path[i].x, path[i].y);
                i += 1;
            }
            if(cmd == "AT") {
                g.arcTo(path[i].x, path[i].y,
                        path[i + 1].x, path[i + 1].y,
                        path[i + 2]);
                i += 3;
            }
            // Z: close path
            if(cmd == "Z") {
                g.closePath();
            }
            // B c1 c2 pt: bezier curve
            if(cmd == "B") {
                g.bezierCurveTo(path[i].x, path[i].y,
                                path[i + 1].x, path[i + 1].y,
                                path[i + 2].x, path[i + 2].y);
                i += 3;
            }
            // Q c pt: quadratic curve
            if(cmd == "Q") {
                g.quadraticCurveTo(path[i].x, path[i].y,
                                path[i + 1].x, path[i + 1].y);
                i += 2;
            }
            // A pt radius angle1 angle2: arc
            // from angle1 to angle2, clockwise.
            if(cmd == "A") {
                if(path[i + 1] > 0) {
                    g.arc(path[i].x, path[i].y, path[i + 1], path[i + 2], path[i + 3]);
                }
                i += 4;
            }
            // E pt radiusX radiusY rotation angle1 angle2: ellipse
            if(cmd == "E") {
                if(path[i + 1] > 0 && path[i + 2] > 0) {
                    g.ellipse(path[i].x, path[i].y,
                              path[i + 1], path[i + 2],
                              path[i + 3],
                              path[i + 4],  path[i + 5]);
                }
                i += 6;
            }
            // C pt radius: circle
            if(cmd == "C") {
                if(path[i + 1] > 0) {
                    g.arc(path[i].x, path[i].y, path[i + 1], 0, Math.PI * 2);
                }
                i += 2;
            }
            if(cmd == "POLYLINE") {
                var n = path[i++];
                var c = path[i++];
                if(c == "C") {
                    for(var k = 0; k < n; k++) {
                        var p2 = path[i + (k + 1) % n];
                        g.lineTo(p2.x, p2.y);
                    }
                } else {
                    for(var k = 0; k < n - 1; k++) {
                        var p2 = path[i + k + 1];
                        g.lineTo(p2.x, p2.y);
                    }
                }
                i += n;
            }
            if(cmd == "CATMULLROM") {
                var n = path[i++];
                var c = path[i++];
                if(c == "C") {
                    for(var k = 0; k < n; k++) {
                        var p0 = path[i + (n + k - 1) % n];
                        var p1 = path[i + k];
                        var p2 = path[i + (k + 1) % n];
                        var p3 = path[i + (k + 2) % n];
                        IV.catmullRomCurveTo(g, p0.x, p0.y, p1.x, p1.y, p2.x, p2.y, p3.x, p3.y);
                    }
                } else {
                    for(var k = 0; k < n - 1; k++) {
                        var p0 = path[i + Math.max(0, k - 1)];
                        var p1 = path[i + k];
                        var p2 = path[i + k + 1];
                        var p3 = path[i + Math.min(n - 1, k + 2)];
                        IV.catmullRomCurveTo(g, p0.x, p0.y, p1.x, p1.y, p2.x, p2.y, p3.x, p3.y);
                    }
                }
                i += n;
            }
        }
    },
    _perform_stroke: function(act, context, g, path) {
        var w = act.width.get(context);
        if(w <= 0) return;
        var color = act.color.get(context).toRGBA();
        g.strokeStyle = color;
        g.lineWidth = w;
        g.lineCap = act.cap.get(context);
        g.lineJoin = act.join.get(context);
        g.miterLimit = 10 * g.iv_pre_ratio; // adapt with pre-scale ratio.
        g.beginPath();
        this._run_path(g, path);
        g.stroke();
    },
    _perform_fill: function(act, context, g, path) {
        var color = act.color.get(context).toRGBA();
        g.fillStyle = color;
        g.beginPath();
        this._run_path(g, path);
        g.fill();
    },
    _perform_stroke_text: function(act, context, g, text, x, y, font) {
        var w = act.width.get(context);
        if(w <= 0) return;
        var color = act.color.get(context).toRGBA();
        g.strokeStyle = color;
        g.lineWidth = w;
        g.lineCap = act.cap.get(context);
        g.lineJoin = act.join.get(context);
        g.miterLimit = 10 * g.iv_pre_ratio; // adapt with pre-scale ratio.
        g.ivSetFont(font);
        g.ivStrokeText(text, x, y);
    },
    _perform_fill_text: function(act, context, g, text, x, y, font) {
        var color = act.color.get(context).toRGBA();
        g.fillStyle = color;
        g.ivSetFont(font);
        g.ivFillText(text, x, y);
    }
});

IV.serializer.registerObjectType("PathStyle", Objects.PathStyle);

var FontStyle = IV.extend(Objects.Object, function(info) {
    this.fillDefault();
    this.type = "FontStyle";
}, {
    $auto_properties: [ "font_family", "font_size" ],
    fillDefault: function() {
        if(this.font_family === undefined) this.font_family = "Arial";
        if(this.font_size === undefined) this.font_size = 14;
    },
    postDeserialize: function() {
        this.fillDefault();
    },
    getPropertyContext: function() {
        var $this = this;
        return [
            make_prop_ctx(this, "font_family", "Family", undefined, "plain-string"),
            make_prop_ctx(this, "font_size", "Size", undefined, "plain-number")
        ];
    },
    getFont: function() {
        return {
            family: this.font_family,
            size: this.font_size
        };
    }
});
IV.serializer.registerObjectType("FontStyle", FontStyle);

var TickStyle = IV.extend(Objects.Object, function(info) {
    this.fillDefault();
    this.type = "TickStyle";
}, {
    $auto_properties: [ "show_ticks", "tick_size", "tick_width", "rotation", "tick_count", "tick_color", "tick_format" ],
    fillDefault: function() {
        if(this.show_ticks === undefined) this.show_ticks = true;
        if(this.tick_width === undefined) this.tick_width = 1;
        if(this.tick_size === undefined) this.tick_size = 2;
        if(this.tick_count === undefined) this.tick_count = 5;
        if(this.tick_color === undefined) this.tick_color = new IV.Color(0, 0, 0, 1);
        if(this.tick_format === undefined) this.tick_format = "g";
        if(this.rotation === undefined) this.rotation = 0;
        if(this.font === undefined) this.font = new FontStyle();
    },
    postDeserialize: function() {
        this.fillDefault();
    },
    getPropertyContext: function() {
        var $this = this;
        return [
            make_prop_ctx(this, "show_ticks", "Show", undefined, "plain-bool"),
            make_prop_ctx(this, "tick_size", "Size", undefined, "plain-number"),
            make_prop_ctx(this, "tick_width", "Width", undefined, "plain-number"),
            make_prop_ctx(this, "rotation", "Rotation", undefined, "plain-number"),
            make_prop_ctx(this, "tick_count", "Count", undefined, "plain-string"),
            make_prop_ctx(this, "tick_color", "Color", undefined, "plain-color"),
            make_prop_ctx(this, "tick_format", "Format", undefined, "plain-string"),
            {
                name: "Font",
                type: "nested",
                properties: $this.font.getPropertyContext()
            }
        ];
    }
});
IV.serializer.registerObjectType("TickStyle", TickStyle);
