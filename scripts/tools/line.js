(function() {

IV.tools.Line = {
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
                var line = new IV.objects.Line(path, {
                    point1: $this.loc1,
                    point2: $this.loc2,
                    style: IV.panels.style.createStyle()
                });
                IV.vis.addObject(line);
                IV.triggerRender("main,back");
                $this.loc1 = null;
                $this.loc2 = null;
            }
        }, "tools:Line");
    },
    onInactive: function() {
        IV.tools.endSelectLocation("tools:Line");
    }
};
/*
IV.tools.Line = {
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
                    if(obj1.can("get-point") && obj2.can("get-point")) {
                        var line = new IV.objects.Line(path, {
                            point1: obj1,
                            point2: obj2,
                            style: IV.panels.style.createStyle()
                        });
                        IV.vis.addObject(line);
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
*/
IV.tools.LineThrough = {
    onActive: function() {
        var $this = this;
        IV.tools.beginSelectLocation(function(loc) {
            var path = IV.get("selected-path");
            if(IV.data.schemaAtPath(path)) {
                var circle = new IV.objects.LineThrough(path, {
                    points: loc,
                    style: IV.panels.style.createStyle()
                });
                IV.vis.addObject(circle);
                IV.triggerRender("main");
            }
        }, "tools:LineThrough");
    },
    onInactive: function() {
        IV.tools.endSelectLocation("tools:LineThrough");
    }
};

})();
