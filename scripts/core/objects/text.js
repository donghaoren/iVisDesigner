Objects.Text = IV.extend(Objects.Object, function(info) {
    Objects.Object.call(this, info);
    this.type = "Text";
    this.path = info.path;
    // Center.
    this.anchor = IV.notNull(info.anchor) ? info.anchor : new Objects.Plain(new IV.Vector(0, 0));
    this.text = IV.notNull(info.text) ? info.text : new Objects.Plain("text");
    this.text_align = IV.notNull(info.text_align) ? info.text_align : new Objects.Plain("left");
    this.font_family = IV.notNull(info.font_family) ? info.font_family : new Objects.Plain("Arial");
    this.font_size = IV.notNull(info.font_size) ? info.font_size : new Objects.Plain(10);
    this.style = IV.notNull(info.style) ? info.style : new Objects.PathStyle();
}, {
    $auto_properties: [ "path", "anchor", "text", "text_align", "font_family", "font_size" ],
    onAttach: function(vis) {
        this.vis = vis;
    },
    _get_rect: function(context, no_offset) {
        var text = this.text.get(context);
        if(text === null) return null;
        var text_align = this.text_align.get(context);
        if(text_align === null) return null;
        var font = {
            family: this.font_family.get(context),
            size: this.font_size.get(context)
        };
        if(font.family === null || font.size === null) return null;
        var p = this.anchor.get(context);
        if(p === null) return null;
        var x0 = p.x;
        var y0 = p.y;
        var w = IV.measureText(text, "36px " + font.family).width / 36 * font.size;
        var h = font.size;
        y0 += h / 2;
        if(text_align == "left")
            x0 += w / 2;
        if(text_align == "right")
            x0 -= w / 2;
        if(!no_offset && this.offsets) {
            var oid = context.data.getObjectID(context.val());
            if(this.offsets[oid]) {
                x0 += this.offsets[oid].x;
                y0 += this.offsets[oid].y;
            }
        }
        return [ x0, y0, w, h ];
    },
    render: function(g, data) {
        var $this = this;
        $this.path.enumerate(data, function(context) {
            var text = $this.text.get(context);
            var text_align = $this.text_align.get(context);
            if(text_align === null) return;
            var font = {
                family: $this.font_family.get(context),
                size: $this.font_size.get(context)
            };
            if(font.family === null || font.size === null) return;
            var p = $this.anchor.get(context);
            if(p === null) return;
            g.textAlign = $this.text_align.get(context);
            if($this.offsets) {
                var oid = data.getObjectID(context.val());
                if(oid && $this.offsets[oid]) {
                    p.x += $this.offsets[oid].x;
                    p.y += $this.offsets[oid].y;
                }
            }
            $this.style.renderText(context, g, text, p.x, p.y, font);
        });
    },
    renderSelected: function(g, data, context) {
        var $this = this;
        var draw_with_context = function(context) {
            var r = $this._get_rect(context);
            if(r === null) return;
            g.ivGuideLineWidth();
            g.strokeStyle = IV.colors.selection.toRGBA();
            g.fillStyle = IV.colors.selection.toRGBA();
            g.beginPath();
            var w = r[2] / 2, h = r[3] / 2;
            g.moveTo(r[0] - w, r[1] - h);
            g.lineTo(r[0] + w, r[1] - h);
            g.lineTo(r[0] + w, r[1] + h);
            g.lineTo(r[0] - w, r[1] + h);
            g.closePath();
            g.stroke();
        };
        if(context) draw_with_context(context);
        else $this.path.enumerate(data, draw_with_context);
    },
    can: function(cap) {
        if(cap == "get-point") return true;
    },
    get: function(context) {
        return this.anchor.getPoint(context);
    },
    _label_adjust: function() {
        var $this = this;
        if(!this.offsets) this.offsets = { };
        var data = this.vis.data;
        var rects = [];
        $this.path.enumerate(data, function(context) {
            var r = $this._get_rect(context, true);
            if(r === null) return;
            rects.push([ data.getObjectID(context.val()), r[0], r[1], r[2] * 1.05, r[3] * 1.05 ]);
        });
        var Y = [];
        for(var i = 0; i < rects.length; i++) {
            Y[i*2] = 0;
            Y[i*2+1] = 0;
        }
        var k_spring = 1;
        var k_collision = 20;
        var dydt = function(t, y) {
            var r = [];
            for(var i = 0; i < rects.length; i++) {
                r[i*2] = -k_spring * y[i*2];
                r[i*2+1] = -k_spring * y[i*2+1];
            }
            for(var i = 0; i < rects.length; i++) {
                for(var j = i + 1; j < rects.length; j++) {
                    var dx = y[j*2] + rects[j][1] - y[i*2] - rects[i][1];
                    var dy = y[j*2+1] + rects[j][2] - y[i*2+1] - rects[i][2];
                    var dfx = (rects[i][3] + rects[j][3]) / 2 - Math.abs(dx);
                    var dfy = (rects[i][4] + rects[j][4]) / 2 - Math.abs(dy);
                    if(dfx > 0 && dfy > 0) {
                        var area = Math.sqrt(dfx * dfy);
                        var s = k_collision / Math.sqrt(dx * dx + dy * dy);
                        r[i*2] -= area * dx * s;
                        r[j*2] += area * dx * s;
                        r[i*2+1] -= area * dy * s;
                        r[j*2+1] += area * dy * s;
                    }
                }
            }
            return r;
        };
        var sol = numeric.dopri(0, 20, Y, dydt);
        for(var i = 0; i < rects.length; i++) {
            var y_last = sol.y[sol.y.length - 1];
            this.offsets[rects[i][0]] = {
                x: y_last[i*2],
                y: y_last[i*2+1]
            };
        }
    },
    getPropertyContext: function() {
        var $this = this;
        return Objects.Object.prototype.getPropertyContext.call(this).concat([
            make_prop_ctx(this, "path", "Path", "Text", "path"),
            make_prop_ctx(this, "text", "Text", "Text", "string"),
            make_prop_ctx(this, "anchor", "Anchor", "Text", "point"),
            make_prop_ctx(this, "text_align", "Align", "Text", "string", [
                { name: "left", display: "Left" },
                { name: "center", display: "Center" },
                { name: "right", display: "Right" }
            ]),
            make_prop_ctx(this, "font_family", "Family", "Text", "string"),
            make_prop_ctx(this, "font_size", "Size", "Text", "number"),
            {
                name: "Adjust",
                group: "Text",
                type: "button",
                get: function() { return "Run,Reset"; },
                set: function(val) {
                    if(val == "Run")
                        $this._label_adjust();
                    if(val == "Reset")
                        $this.offsets = {};
                }
            }
        ]);
    },
    select: function(pt, data, action) {
        var rslt = null;
        var $this = this;
        this.path.enumerate(data, function(context) {
            var r = $this._get_rect(context);
            if(r === null) return;
            if(Math.abs(pt.x - r[0]) < r[2] / 2 && Math.abs(pt.y - r[1]) < r[3] / 2) {
                var d = pt.distance(new IV.Vector(r[0], r[1]));
                if(!rslt || rslt.distance > d) {
                    rslt = { distance: d, context: context.clone() };
                    make_anchor_move_context(rslt, $this.anchor, action);
                }
            }
        });
        return rslt;
    }
});
IV.serializer.registerObjectType("Text", Objects.Text);
