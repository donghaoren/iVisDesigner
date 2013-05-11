(function() {

IV.tools.Track = {
    onActive: function() {
        var $this = this;
        $this.loc1 = null;
        $this.loc2 = null;
        IV.set("status", "Track: Select point A.");
        IV.tools.beginSelectLocation(function(loc) {
            if(!$this.loc1) {
                $this.loc1 = loc;
                IV.set("status", "Track: Select point B.");
                return;
            } else {
                $this.loc2 = loc;
                var path = IV.get("selected-path");
                if(IV.data.getSchema(path) && IV.data.getSchema(path).type == "number") {
                    var track = new IV.objects.Track(
                        path, $this.loc1, $this.loc2
                    );
                    IV.vis.addObject(track);
                    IV.raise("vis:objects");
                    IV.triggerRender("main,back");
                }
                $this.loc1 = null;
                $this.loc2 = null;
                IV.set("status", "Track: Select point A.");
            }
        }, "tools:Track");
    },
    onInactive: function() {
        IV.tools.endSelectLocation("tools:Track");
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

        IV.set("status", "Scatter: Select track A.");

        IV.tools.beginSelectObject(function(context) {
            var path = IV.get("selected-path");
            if(!context) {
                obj1 = null;
                obj2 = null;
                IV.vis.clearSelection();
                IV.raise("vis:objects:selection");
                IV.triggerRender("main,back");
                IV.set("status", "Scatter: Select track A.");
                return;
            }
            if(!obj1) {
                obj1 = context.obj;
                IV.vis.appendSelection(context);
                IV.raise("vis:objects:selection");
                IV.triggerRender("main,back");
                IV.set("status", "Scatter: Select track B.");
            } else if(!obj2) {
                obj2 = context.obj;
                if(IV.data.getSchema(path)) {
                    if(obj1.type == "Track" && obj2.type == "Track") {
                        var scatter = new IV.objects.Scatter(obj1, obj2);
                        IV.vis.addObject(scatter);
                        IV.raise("vis:objects");
                    }
                }
                obj1 = null;
                obj2 = null;
                IV.vis.clearSelection();
                IV.raise("vis:objects:selection");
                IV.triggerRender("main,back");
                IV.set("status", "Scatter: Select track A.");
            }
        }, "tools:Line");
    },
    onInactive: function() {
        IV.tools.endSelectObject("tools:Line");
    }
};

})();
