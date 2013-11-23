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
    onAttach: function(vis) {
        this.vis = vis;
    },
    render: function(g, data) {
        var $this = this;
        $this.path.enumerate(data, function(context) {
            var text = $this.text.get(context);
            var text_align = $this.text_align.get(context);
            var font = {
                family: $this.font_family.get(context),
                size: $this.font_size.get(context)
            };
            var p = $this.anchor.get(context);
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
            var text = $this.text.get(context);
            var text_align = $this.text_align.get(context);
            var font = {
                family: $this.font_family.get(context),
                size: $this.font_size.get(context)
            };
            var p = $this.anchor.get(context);
            var x0 = p.x;
            var y0 = p.y;
            var w = IV.measureText(text, "36px " + font.family).width / 36 * font.size;
            var h = font.size;
            y0 += h / 2;
            rects.push([ data.getObjectID(context.val()), x0, y0, w * 1.05, h * 1.05 ]);
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
        var sol = numeric.dopri(0, 5, Y, dydt);
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
            {
                name: "Path",
                group: "Text",
                type: "path",
                get: function() { return $this.path; },
                set: function(val) { return $this.path = val; }
            },
            {
                name: "Text",
                group: "Text",
                type: "string",
                get: function() { return $this.text; },
                set: function(val) { return $this.text = val; }
            },
            {
                name: "Anchor",
                group: "Text",
                type: "point",
                get: function() { return $this.anchor; },
                set: function(val) { return $this.anchor = val; }
            },
            {
                name: "Align",
                group: "Text",
                type: "string",
                get: function() { return $this.text_align; },
                set: function(val) { return $this.text_align = val; },
                args: [ "left", "right", "center" ]
            },
            {
                name: "Family",
                group: "Text",
                type: "string",
                get: function() { return $this.font_family; },
                set: function(val) { return $this.font_family = val; }
            },
            {
                name: "Size",
                group: "Text",
                type: "number",
                get: function() { return $this.font_size; },
                set: function(val) { return $this.font_size = val; }
            },
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
        return rslt;
    }
});
IV.serializer.registerObjectType("Text", Objects.Text);
