NS.shiftModify = function(x0, y0, x1, y1) {
    var angle = Math.atan2(Math.abs(y1 - y0), Math.abs(x1 - x0)) / Math.PI * 180.0;
    if(angle < 22.5 || angle > 67.5) {
        if(Math.abs(x1 - x0) > Math.abs(y1 - y0)) y1 = y0;
        else x1 = x0;
    } else {
        if(Math.abs(x1 - x0) < Math.abs(y1 - y0))
            y1 = y0 + ((y1 - y0) > 0 ? 1 : -1) * Math.abs(x1 - x0);
        else
            x1 = x0 + ((x1 - x0) > 0 ? 1 : -1) * Math.abs(y1 - y0);
    }
    return [x1, y1];
};

NS.shiftModifyNoDiagnoal = function(x0, y0, x1, y1) {
    if(Math.abs(x1 - x0) > Math.abs(y1 - y0)) y1 = y0;
    else x1 = x0;
    return [x1, y1];
};

NS.MagneticAlign = function(points) {
    this.accepted = [];
    this.points = points;
    this.threshold = 5;
}

NS.MagneticAlign.prototype.modify = function(x, y) {
    var angles = [ 0, 45, 90, 135 ];

    // Find the first line.
    var min_v = 1e100;
    var min_s = null, min_a = null, min_d;
    for(var i in this.points) {
        var pt = this.points[i];
        var dv = new IV.Vector(x - pt.x, y - pt.y);
        for(var j in angles) {
            var v = dv.rotate(angles[j] / 180.0 * Math.PI);
            if(Math.abs(v.y) < min_v) {
                min_v = Math.abs(v.y);
                v.y = 0;
                v = v.rotate(-angles[j] / 180.0 * Math.PI);
                min_s = new IV.Vector(v.x + pt.x, v.y + pt.y);
                min_a = new IV.Vector(pt.x, pt.y);
                min_d = (new IV.Vector(1, 0)).rotate(-angles[j] / 180.0 * Math.PI);
            }
        }
    }
    if(min_v <= this.threshold) {
        // Find another line that intersect with the first one, test the intersection point.
        var min2_v = 1e100;
        var min2_s = null, min2_a = null;
        for(var i in this.points) {
            var pt = this.points[i];
            for(var j in angles) {
                var dpt = (new IV.Vector(1, 0)).rotate(-angles[j] / 180.0 * Math.PI);
                // cross: pt->dpt, min_a->min_d.
                var p = IV.geometry.lineIntersection(pt, dpt, min_a, min_d);
                if(p) {
                    var d = IV.geometry.distance(min_s.x, min_s.y, p.x, p.y);
                    if(d < min2_v) {
                        min2_v = d;
                        min2_s = p;
                        min2_a = pt;
                    }
                }
            }
        }
        var rp = min_s;
        if(min2_v <= this.threshold) rp = min2_s;

        var anchors = [];

        for(var i in this.points) {
            var pt = this.points[i];
            var dv = new IV.Vector(rp.x - pt.x, rp.y - pt.y);
            for(var j in angles) {
                var v = dv.rotate(angles[j] / 180.0 * Math.PI);
                if(Math.abs(v.y) < 1e-3) {
                    anchors.push(pt);
                }
            }
        }
        var ret = new IV.Vector(rp.x, rp.y);
        ret.anchors = anchors;
        return ret;

    } else return;

};
NS.MagneticAlign.prototype.accept = function(p, x, y) {
    var pt = new IV.Vector(x, y);
    for(var i in p.anchors) {
        this.accepted.push({ dest: pt, src: p.anchors[i] });
    }
};
NS.MagneticAlign.prototype.reset = function() {
    this.accepted = [];
};
NS.MagneticAlign.prototype.render = function(ctx) {
    for(var i in this.accepted) {
        var al = this.accepted[i];
        var x0 = al.dest.x;
        var y0 = al.dest.y;
        var x1 = al.src.x;
        var y1 = al.src.y;
        var d = IV.geometry.distance(x0, y0, x1, y1);
        if(d > 1) {
            var kx = (x1 - x0) / d, ky = (y1 - y0) / d;
            x0 -= kx * 5000;
            y0 -= ky * 5000;
            x1 += kx * 5000;
            y1 += ky * 5000;
            ctx.beginPath();
            ctx.moveTo(x0, y0);
            ctx.lineTo(x1, y1);
            ctx.strokeStyle = IV.colors.selection.toRGBA(0.3);
            ctx.stroke();
        }
    }
};
