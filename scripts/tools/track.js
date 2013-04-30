(function() {

IV.tools.Track = {
    onActive: function() {
        var $this = this;
        $this.loc1 = null;
        $this.loc2 = null;
        IV.tools.beginSelectLocation(function(loc) {
            if(!$this.loc1) {
                $this.loc1 = loc;
                return;
            } else {
                $this.loc2 = loc;
                var path = IV.get("selected-path");
                if(IV.data.schemaAtPath(path) && IV.data.schemaAtPath(path).type == "number") {
                    var track = new IV.objects.Track(
                        path, $this.loc1, $this.loc2
                    );
                    IV.vis.addObject(track);
                    IV.triggerRender("main,back");
                }
                $this.loc1 = null;
                $this.loc2 = null;
            }
        }, "tools:Track");
    },
    onInactive: function() {
        IV.tools.endTrackMouse("tools:Track");
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
