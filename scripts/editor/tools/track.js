(function() {

Tools.Track = {
    onActive: function() {
        var $this = this;
        $this.loc1 = null;
        $this.loc2 = null;
        var sA = Editor.status.start()
            .add("Track: ")
            .append("A: [please select]");

        Tools.beginSelectLocation(function(loc) {
            if(!$this.loc1) {
                $this.loc1 = loc;
                sA.set("A: " + loc.type);
                Editor.status.append("B: [please select]");
                return;
            } else {
                $this.loc2 = loc;
                var path = Editor.get("selected-path");
                if(true) {
                    var stat = IV.Path.computeBasicStatistics(path, IV.editor.data);
                    var track = new IV.objects.Track({
                        path: path,
                        anchor1: $this.loc1,
                        anchor2: $this.loc2,
                        min: stat.min,
                        max: stat.max
                    });
                    Editor.doAddObject(track);
                }
                $this.loc1 = null;
                $this.loc2 = null;
                Editor.status.end();
            }
        }, "tools:Track");
    },
    onInactive: function() {
        Tools.endSelectLocation("tools:Track");
    }
};

})();

(function() {

Tools.Scatter = {
    onActive: function() {
        var obj1 = null;
        var obj2 = null;
        IV.vis.clearSelection();
        Tools.triggerRender("main,back");

        IV.set("status", "Scatter: Select track A.");

        Tools.beginSelectObject(function(context) {
            var path = IV.get("selected-path");
            if(!context) {
                obj1 = null;
                obj2 = null;
                IV.vis.clearSelection();
                IV.raise("vis:objects:selection");
                Tools.triggerRender("main,back");
                IV.set("status", "Scatter: Select track A.");
                return;
            }
            if(!obj1) {
                obj1 = context.obj;
                IV.vis.appendSelection(context);
                IV.raise("vis:objects:selection");
                Tools.triggerRender("main,back");
                IV.set("status", "Scatter: Select track B.");
            } else if(!obj2) {
                obj2 = context.obj;
                if(IV.data.getSchema(path)) {
                    if(obj1.type == "Track" && obj2.type == "Track") {
                        var scatter = new IV.objects.Scatter(obj1, obj2);
                        Editor.doAddObject(scatter);
                    }
                }
                obj1 = null;
                obj2 = null;
                IV.vis.clearSelection();
                IV.raise("vis:objects:selection");
                Tools.triggerRender("main,back");
                IV.set("status", "Scatter: Select track A.");
            }
        }, "tools:Line");
    },
    onInactive: function() {
        Tools.endSelectObject("tools:Line");
    }
};

})();
