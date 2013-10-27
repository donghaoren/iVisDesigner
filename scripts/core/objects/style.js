// The path style object.

Objects.PathStyle = IV.extend(Objects.Object, function() {
    Objects.Object.call(this);
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
    }
});

IV.serializer.registerObjectType("PathStyle", Objects.PathStyle);
