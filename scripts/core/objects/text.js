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
            $this.style.renderText(context, g, text, p.x, p.y, font);
        });
    },
    can: function(cap) {
        if(cap == "get-point") return true;
    },
    get: function(context) {
        return this.anchor.getPoint(context);
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
            }
        ]);
    },
    select: function(pt, data, action) {
        var rslt = null;
        return rslt;
    }
});
IV.serializer.registerObjectType("Text", Objects.Text);
