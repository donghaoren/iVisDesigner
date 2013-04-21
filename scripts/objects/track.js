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
    getLongPath: function() {
        return IV.longestStrong([this.anchor1.path, this.anchor2.path]);
    },
    enumerateGuide: function(callback) {
        var $this = this;
        IV.enumeratePath(this.getLongPath(), function(context) {
            var p1 = $this.anchor1.getPoint(context);
            var p2 = $this.anchor2.getPoint(context);
            callback(p1, p2);
        });
    },
    renderGuide: function(g) {
        if(this.selected) return;
        this.enumerateGuide(function(p1, p2) {
            g.strokeStyle = "gray";
            g.fillStyle = "white";

            g.beginPath();
            g.moveTo(p1.x, p1.y);
            g.lineTo(p2.x, p2.y);
            g.stroke();

            g.beginPath();
            g.arc(p1.x, p1.y, 3, 0, Math.PI * 2);
            g.fill();
            g.stroke();

            g.beginPath();
            g.arc(p2.x, p2.y, 3, 0, Math.PI * 2);
            g.fill();
            g.stroke();
        });
    },
    renderGuideSelected: function(g) {
        this.enumerateGuide(function(p1, p2) {
            g.strokeStyle = IV.colors.selection.toRGBA();
            g.fillStyle = "white";

            g.beginPath();
            g.moveTo(p1.x, p1.y);
            g.lineTo(p2.x, p2.y);
            g.stroke();

            g.beginPath();
            g.arc(p1.x, p1.y, 3, 0, Math.PI * 2);
            g.fill();
            g.stroke();

            g.beginPath();
            g.arc(p2.x, p2.y, 3, 0, Math.PI * 2);
            g.fill();
            g.stroke();
        });
    },
    select: function(pt, data, action) {
        var $this = this;
        var rslt = null;
        this.enumerateGuide(function(p1, p2) {
            var d = IV.pointLineSegmentDistance(pt, p1, p2);
            if(d < 4.0) {
                rslt = { distance: d };
                if(action == "move") {
                    var move_targets = [];
                    if(p1.distance(pt) < 4.0) {
                        if($this.anchor1.type == "plain") {
                            move_targets.push($this.anchor1);
                        }
                    } else if(p2.distance(pt) < 4.0) {
                        if($this.anchor2.type == "plain") {
                            move_targets.push($this.anchor2);
                        }
                    } else if($this.anchor1.type == "plain" && $this.anchor2.type == "plain") {
                        move_targets.push($this.anchor1);
                        move_targets.push($this.anchor2);
                    }
                    if(move_targets.length > 0) {
                        rslt.originals = move_targets.map(function(plain) {
                            return plain.obj;
                        });
                        rslt.onMove = function(p0, p1) {
                            for(var i in move_targets) {
                                move_targets[i].obj = p1.sub(p0).add(this.originals[i]);
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
    }
});

IV.objects.Track = Track;
IV.objects.Scatter = Scatter;

})();
