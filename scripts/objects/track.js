// iVisDesigner
// Author: Donghao Ren, PKUVIS, Peking University, 2013.04
// See LICENSE.txt for copyright information.

// scripts/objects/track.js
// Track and scatter object.

(function() {

var Track = function(path, anchor1, anchor2) {
    this.type = "Track";
    this.anchor1 = anchor1;
    this.anchor2 = anchor2;
    this.path = path;
    this.guide_path = IV.path.deepest([ anchor1.getPath(), anchor2.getPath() ]);
};

Track.prototype = new IV.objects.BaseObject({
    can: function(cap) {
        if(cap == "get-point") return true;
    },
    get: function(context) {
        var p1 = this.anchor1.getPoint(context);
        var p2 = this.anchor2.getPoint(context);
        var value = context.get(this.path);
        var s = context.getSchema(this.path);
        if(s.max !== undefined && s.min !== undefined)
            value = (value - s.min) / (s.max - s.min);
        return p1.interp(p2, value);
    },
    enumerateGuide: function(data, callback) {
        var $this = this;
        var count = 0;
        data.enumeratePath(this.guide_path, function(context) {
            var p1 = $this.anchor1.getPoint(context);
            var p2 = $this.anchor2.getPoint(context);
            callback(p1, p2, context);
            count++;
            if(count >= 3) return false;
        });
    },
    renderGuide: function(g, data) {
        this.enumerateGuide(data, function(p1, p2) {
            g.strokeStyle = "rgba(128,128,128,0.5)";
            g.fillStyle = "rgba(128,128,128,1)";

            g.beginPath();
            g.moveTo(p1.x, p1.y);
            g.lineTo(p2.x, p2.y);
            g.stroke();

            g.beginPath();
            g.arc(p1.x, p1.y, 1.5, 0, Math.PI * 2);
            g.fill();

            g.beginPath();
            g.arc(p2.x, p2.y, 1.5, 0, Math.PI * 2);
            g.fill();
        });
    },
    renderGuideSelected: function(g, data) {
        this.enumerateGuide(data, function(p1, p2) {
            g.strokeStyle = IV.colors.selection.toRGBA();
            g.fillStyle = IV.colors.selection.toRGBA();

            g.beginPath();
            g.moveTo(p1.x, p1.y);
            g.lineTo(p2.x, p2.y);
            g.stroke();

            g.beginPath();
            g.arc(p1.x, p1.y, 2, 0, Math.PI * 2);
            g.fill();

            g.beginPath();
            g.arc(p2.x, p2.y, 2, 0, Math.PI * 2);
            g.fill();
        });
    },
    select: function(pt, data, action) {
        if(!IV.get("visible-guide")) return null;
        var $this = this;
        var rslt = null;
        this.enumerateGuide(data, function(p1, p2) {
            var d = IV.pointLineSegmentDistance(pt, p1, p2);
            if(d < 4.0) {
                rslt = { distance: d };
                if(action == "move") {
                    var move_targets = [];
                    var can_move = function(a) { return a.type == "plain" || a.type == "PointOffset"; };
                    if(p1.distance(pt) < 4.0) {
                        if(can_move($this.anchor1)) {
                            move_targets.push($this.anchor1);
                        }
                    } else if(p2.distance(pt) < 4.0) {
                        if(can_move($this.anchor2)) {
                            move_targets.push($this.anchor2);
                        }
                    } else if(can_move($this.anchor1) && can_move($this.anchor2)) {
                        move_targets.push($this.anchor1);
                        move_targets.push($this.anchor2);
                    }
                    if(move_targets.length > 0) {
                        rslt.originals = move_targets.map(function(plain) {
                            if(plain.type == "plain")
                                return plain.obj;
                            if(plain.type == "PointOffset")
                                return plain.offset;
                        });
                        rslt.onMove = function(p0, p1) {
                            for(var i = 0; i < move_targets.length; i++) {
                                if(move_targets[i].type == "plain")
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
    }
});

var Scatter = function(track1, track2) {
    this.type = "Scatter";
    this.track1 = track1;
    this.track2 = track2;
    this.path = IV.path.deepest([ track1.getPath(), track2.getPath() ]);
    this.guide_path = IV.path.deepest([ track1.getGuidePath(), track2.getGuidePath() ]);
};

Scatter.prototype = new IV.objects.BaseObject({
    can: function(cap) {
        if(cap == "get-point") return true;
    },
    get: function(context) {
        var p1 = this.track1.getPoint(context);
        var p2 = this.track2.getPoint(context);


        var d2 = this.track1.anchor2.getPoint(context)
                .sub(this.track1.anchor1.getPoint(context)).rotate90();
        var d1 = this.track2.anchor2.getPoint(context)
                .sub(this.track2.anchor1.getPoint(context));

        var p = d1.scale(p2.sub(p1).dot(d2) / d1.dot(d2)).add(p1);
        return p;
    },
    enumerateGuide: function(data, callback) {
        var $this = this;
        var count = 0;
        data.enumeratePath(this.guide_path, function(context) {
            var p1 = $this.track1.anchor1.getPoint(context);
            var p2 = $this.track1.anchor2.getPoint(context);
            var q1 = $this.track2.anchor1.getPoint(context);
            var q2 = $this.track2.anchor2.getPoint(context);
            callback(p1, p2, q1, q2, context);
            count++;
            if(count >= 3) return false;
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
        var a11 = kscatter(0.1, 0.1);
        var a12 = kscatter(0.1, 0.9);
        var a21 = kscatter(0.9, 0.1);
        var a22 = kscatter(0.9, 0.9);
        var lines = [[kscatter(0.2, 0.1), a11], [a11, kscatter(0.1, 0.2)],
                     [kscatter(0.2, 0.9), a12], [a12, kscatter(0.1, 0.8)],
                     [kscatter(0.8, 0.1), a21], [a21, kscatter(0.9, 0.2)],
                     [kscatter(0.8, 0.9), a22], [a22, kscatter(0.9, 0.8)]];
        return lines;
    },
    renderGuide: function(g, data) {
        var $this = this;
        $this.enumerateGuide(data, function(p1, p2, q1, q2) {
            g.strokeStyle = "rgba(128,128,128,0.5)";
            g.fillStyle = "rgba(128,128,128,1)";
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
            $this._getmarkers(p1, p2, q1, q2).forEach(function(l) {
                g.beginPath();
                l[0].callMoveTo(g);
                l[1].callLineTo(g);
                g.stroke();
            });
        });
    },
    select: function(pt, data, action) {
        if(!IV.get("visible-guide")) return null;
        var $this = this;
        var rslt = null;
        $this.enumerateGuide(data, function(p1, p2, q1, q2) {
            $this._getmarkers(p1, p2, q1, q2).forEach(function(l) {
                var d = IV.pointLineSegmentDistance(pt, l[0], l[1]);
                if(d < 4.0) rslt = { distance: d };
            });
        });
        return rslt;
    }
});

IV.objects.Track = Track;
IV.objects.Scatter = Scatter;

})();
