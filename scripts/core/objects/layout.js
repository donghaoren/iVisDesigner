// iVisDesigner
// Author: Donghao Ren, PKUVIS, Peking University, 2013.04
// See LICENSE.txt for copyright information.

// scripts/objects/base.js
// Base objects.

(function() {

Objects.ForceLayout = IV.extend(Objects.Object, function(info) {
    Objects.Object.call(this);
    this.path_nodes = info.path_nodes;
    this.path_edgeA = info.path_edgeA;
    this.path_edgeB = info.path_edgeB;
    this.points = null;
    this._validated = false;
    this.type = "ForceLayout";
    this.enabled = false;
}, {
    onAttach: function(vis) {
        this.vis = vis;
    },
    validate: function(data) {
        if(!this._validated) {
            this._runStep(data);
            this._validated = true;
        }
    },
    onDetach: function(vis) {
    },
    timerTick: function(data) {
        if(this.enabled) {
            this._runStep(data);
            if(this.vis) this.vis.setNeedsRender();
        }
    },
    getAttachedSchemas: function() {
        return [
            {
                path: this.path_nodes,
                schema: {
                    type: "object",
                    fields: {
                        x: { type: "number", min: -1, max: 1 },
                        y: { type: "number", min: -1, max: 1 }
                    }
                }
            }
        ];
    },
    getPropertyContext: function(data) {
        var $this = this;
        return Objects.Object.prototype.getPropertyContext.call(this).concat([
            {
                name: "Enabled",
                group: "ForceLayout",
                type: "plain-bool",
                get: function() { return $this.enabled; },
                set: function(val) { return $this.enabled = val; }
            }
        ]);
    },
    _runStep: function(data) {
        var $this = this;
        var objs = { };
        var edges = [];
        if(!this.points) this.points = { };
        $this.path_edgeA.enumerate(data, function(context) {
            var idA = data.getObjectID(context.get($this.path_edgeA).val());
            var idB = data.getObjectID(context.get($this.path_edgeB).val());
            edges.push([ idA, idB ]);
        });
        var count = 0;
        $this.path_nodes.enumerate(data, function(context) {
            var id = data.getObjectID(context.val());
            if($this.points[id]) {
                var pt = $this.points[id];
                objs[id] = {
                    x: pt.x, y: pt.y,
                    dx: 0, dy: 0
                };
            } else {
                objs[id] = {
                    x: Math.random() - 0.5, y: Math.random() - 0.5,
                    dx: 0, dy: 0
                };
            }
            count++;
        });
        var N_iterate = 10;
        var gravity = 10;
        var speed = 0.05;
        var k = Math.sqrt(4) / Math.sqrt(1 + count);
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
            var edges_l = edges.length;
            for(var i = 0; i < edges_l; i++) {
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

        data.setAttached($this.uuid, $this.points);
    }
});
IV.serializer.registerObjectType("ForceLayout", Objects.ForceLayout);

})();
