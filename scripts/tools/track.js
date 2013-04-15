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
