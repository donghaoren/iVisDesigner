(function() {

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

})();
