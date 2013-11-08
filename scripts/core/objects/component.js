Objects.Component = IV.extend(Objects.Object, function(info) {
    Objects.Object.call(this, info);
    this.type = "Component";
    // Center.
    this.path = info.path;
    this.center = info.center ? info.center : new Objects.Plain(new IV.Vector(0, 0));
    this.vis = new IV.Visualization();
}, {
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
            }
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
            var radius = 0;
            var d = pt.distance(c);
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
                }
            }
        });
        return rslt;
    }
});
IV.serializer.registerObjectType("Component", Objects.Component);
