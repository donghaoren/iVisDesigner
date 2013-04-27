(function() {

IV.tools.Track = {
    onActive: function() {
        var $this = this;
        IV.tools.beginTrackMouse(function(e) {
            $this.onMouseDown(e);
        }, "tools:Track");
    },
    onInactive: function() {
        IV.tools.endTrackMouse("tools:Track");
    },
    onMouseDown: function(e_down) {
        var path = IV.get("selected-path");
        var $this = this;
        var p0 = new IV.Vector(e_down.offsetX, e_down.offsetY);
        e_down.move(function(e_move) {
            var p1 = new IV.Vector(e_move.offsetX, e_move.offsetY);
            $this.current_job = {
                p0: p0,
                p1: p1
            };
            IV.triggerRender("tools");
        });
        e_down.release(function(e_release) {
            if($this.current_job) {
                if(IV.data.schemaAtPath(path) && IV.data.schemaAtPath(path).type == "number") {
                    var track = new IV.objects.Track(
                        path,
                        new IV.objects.Point($this.current_job.p0),
                        new IV.objects.Point($this.current_job.p1)
                    );
                    IV.vis.addObject(track);
                    IV.triggerRender("main,back");
                }
            }
            $this.current_job = null;
            IV.triggerRender("tools");
        });
    },
    render: function(g) {
        if(this.current_job) {
            g.beginPath();
            g.moveTo(this.current_job.p0.x, this.current_job.p0.y);
            g.lineTo(this.current_job.p1.x, this.current_job.p1.y);
            g.stroke();
        }
    }
};

})();

(function() {

IV.tools.Scatter = {
    onActive: function() {
        var obj1 = null;
        var obj2 = null;
        IV.vis.clearSelection();
        IV.triggerRender("main,back");

        IV.tools.beginSelectObject(function(context) {
            var path = IV.get("selected-path");
            if(!context) {
                obj1 = null;
                obj2 = null;
                IV.vis.clearSelection();
                IV.triggerRender("main,back");
                return;
            }
            if(!obj1) {
                obj1 = context.obj;
                IV.vis.appendSelection(context);
                IV.triggerRender("main,back");
            } else if(!obj2) {
                obj2 = context.obj;
                if(IV.data.schemaAtPath(path)) {
                    if(obj1.type == "Track" && obj2.type == "Track") {
                        var scatter = new IV.objects.Scatter(obj1, obj2);
                        IV.vis.addObject(scatter);
                    }
                }
                obj1 = null;
                obj2 = null;
                IV.vis.clearSelection();
                IV.triggerRender("main,back");
            }
        }, "tools:Line");
    },
    onInactive: function() {
        IV.tools.endSelectObject("tools:Line");
    }
};

})();
