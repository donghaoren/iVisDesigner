Objects.Component = IV.extend(Objects.Object, function(info) {
    Objects.Object.call(this, info);
    this.type = "Component";
    // Center.
    this.path = info.path;
    this.center = info.center ? info.center : new Objects.Plain(new IV.Vector(0, 0));
    this.vis = new IV.Visualization();
}, {
    $auto_properties: [ "path", "center" ],
    can: function(cap) {
        if(cap == "get-point") return true;
    },
    get: function(context) {
        return this.center.getPoint(context);
    },
    getPropertyContext: function() {
        var $this = this;
        return Objects.Object.prototype.getPropertyContext.call(this).concat([
            make_prop_ctx($this, "center", "Center", "Shape", "point")
        ]);
    },
    render: function(g, data) {
        var $this = this;
        this.path.enumerate(data, function(context) {
            g.ivSave();
            var p = $this.center.getPoint(context);
            if(p !== null) {
                var cdata = data.createSubset($this.path, context);
                g.ivAppendTransform(IV.makeTransform.translate(p.x, p.y));
                try {
                    $this.vis.render(cdata, g);
                } catch(e) {
                    console.trace(e.stack);
                }
            }
            g.ivRestore();
        });
    },
    select: function(pt, data, action) {
        var rslt = null;
        var $this = this;
        this.path.enumerate(data, function(context) {
            var c = $this.center.getPoint(context);
            if(c === null) return;
            var d = pt.distance(c);
            if(d <= 4.0 / pt.view_scale) {
                if(!rslt || rslt.distance > d) {
                    rslt = { distance: d, context: context.clone() };
                    make_anchor_move_context(rslt, $this.center, action);
                }
            }
        });
        return rslt;
    }
});
IV.serializer.registerObjectType("Component", Objects.Component);
