// iVisDesigner
// Author: Donghao Ren, PKUVIS, Peking University, 2013.04
// See LICENSE.txt for copyright information.

// scripts/objects/base.js
// Base objects.

(function() {

var ForceLayout = function(path_item, cpath, path_edgeA, path_edgeB) {
    this.path_item = path_item;
    this.cpath = cpath;
    this.path_output = this.path_item + ":" + this.cpath;
    this.path_edgeA = path_edgeA;
    this.path_edgeB = path_edgeB;
    this.points = { };
    this.type = "ForceLayout";
    this.assigned_schema = null;
};

ForceLayout.prototype = new IV.objects.BaseObject({
    timerTick: function(data) {
        this._runStep(data);
    },
    _runStep: function(data) {
        var $this = this;
        var objs = { };
        var edges = [];
        data.enumeratePath($this.path_edgeA, function(context) {
            var refA = context.referenceItem($this.path_edgeA);
            var refB = context.referenceItem($this.path_edgeB);
            edges.push([ refA.__id, refB.__id ]);
        });
        var count = 0;
        data.enumeratePath($this.path_item, function(context) {
            var item = context.get($this.path_item);
            if($this.points[item.__id]) {
                var pt = $this.points[item.__id];
                objs[item.__id] = {
                    x: pt.x, y: pt.y,
                    dx: 0, dy: 0
                };
            } else {
                objs[item.__id] = {
                    x: Math.random() - 0.5, y: Math.random() - 0.5,
                    dx: 0, dy: 0
                };
            }
            count++;
        });
        var N_iterate = 10;
        var gravity = 10;
        var speed = 0.05;
        var k = Math.sqrt(4) / (1 + count);
        var max_displace = 0.1;
        var eps = 1e-8;
        for(var iterate = 0; iterate < N_iterate; iterate++) {
            // Accumulate forces.
            for(var i in objs) for(var j in objs) {
                if(i == j) continue;
                var p = objs[i];
                var q = objs[j];
                var dx = p.x - q.x;
                var dy = p.y - q.y;
                var d = Math.sqrt(dx * dx + dy * dy);
                if(d < eps) d = eps;
                var f = k * k / d;
                p.dx += dx / d * f;
                p.dy += dy / d * f;
            }
            for(var i in edges) {
                var p = objs[edges[i][0]];
                var q = objs[edges[i][1]];
                var dx = p.x - q.x;
                var dy = p.y - q.y;
                var d = Math.sqrt(dx * dx + dy * dy);
                if(d < eps) d = eps;
                var f = d * d / k;
                p.dx -= dx / d * f;
                p.dy -= dy / d * f;
                q.dx += dx / d * f;
                q.dy += dy / d * f;
            }
            for(var i in objs) {
                var p = objs[i];
                var dx = p.x, dy = p.y;
                var d = Math.sqrt(dx * dx + dy * dy);
                if(d < eps) d = eps;
                var f = 0.01 * k * gravity * d;
                p.dx -= dx / d * f;
                p.dy -= dy / d * f;
            }
            for(var i in objs) {
                var p = objs[i];
                p.dx *= speed;
                p.dy *= speed;
                var d = Math.sqrt(p.dx * p.dx + p.dy * p.dy);
                if(d < eps) d = eps;
                var dl = Math.min(max_displace * speed, d);
                var dx = p.dx / d * dl;
                var dy = p.dy / d * dl;
                p.x += dx;
                p.y += dy;
            }
        }
        for(var i in objs) {
            if(!$this.points[i]) {
                $this.points[i] = { x: objs[i].x, y: objs[i].y };
            } else {
                $this.points[i].x = objs[i].x;
                $this.points[i].y = objs[i].y;
            }
        }

        if(!this.assigned_schema) {
            this.assigned_schema = data.assignSchema($this.path_output, {
                type: "object",
                fields: {
                    x: { type: "number", min: -1, max: 1 },
                    y: { type: "number", min: -1, max: 1 }
                },
                get: function(item, context) {
                    return $this.points[item.__id];
                }
            });
        }
        this.assigned_schema.update();
    }
});

IV.objects.ForceLayout = ForceLayout;
})();
