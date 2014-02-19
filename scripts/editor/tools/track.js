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
                    var stat = Editor.computePathStatistics(path);
                    var track = new IV.objects.Track({
                        path: path,
                        anchor1: $this.loc1,
                        anchor2: $this.loc2,
                        min: new IV.objects.Plain(stat.min),
                        max: new IV.objects.Plain(stat.max)
                    });
                    Editor.doAddObject(track);
                }
                $this.loc1 = null;
                $this.loc2 = null;
                sA = Editor.status.start()
                    .add("Track: ")
                    .append("A: [please select]");
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
        Editor.vis.clearSelection();

        var sA = Editor.status.start()
            .add("Scatter: ")
            .append("A: [please select]");

        var get_inner_object = function(context) {
            var current_component = Editor.get("current-component");
            if(current_component) {
                context = current_component.resolveSelection(context);
            }
            return context.obj;
        };

        Tools.beginSelectObject(function(context) {
            var path = Editor.get("selected-path");
            if(!context) {
                obj1 = null;
                obj2 = null;
                Editor.vis.clearSelection();
                sA = Editor.status.start()
                    .add("Scatter: ")
                    .append("A: [please select]");
                return;
            }
            if(!obj1) {
                obj1 = get_inner_object(context);
                Editor.vis.appendSelection(context);
                sA.set("A: " + obj1.type);
                Editor.status.append("B: [please select]");
            } else if(!obj2) {
                obj2 = get_inner_object(context);
                if(true) {
                    if(obj1.type == "Track" && obj2.type == "Track") {
                        var scatter = new IV.objects.Scatter({
                            track1: obj1, track2: obj2
                        });
                        Editor.doAddObject(scatter);
                    }
                }
                obj1 = null;
                obj2 = null;
                Editor.vis.clearSelection();
                sA = Editor.status.start()
                    .add("Track: ")
                    .append("A: [please select]");
            }
        }, "tools:Line");
    },
    onInactive: function() {
        Tools.endSelectObject("tools:Line");
    }
};

})();
