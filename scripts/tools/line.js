(function() {

IV.tools.Line = {
    onActive: function() {
        var obj1 = null;
        var obj2 = null;
        IV.tools.beginSelectObject(function(context) {
            var path = IV.get("selected-path");
            if(!context) {
                obj1 = null;
                obj2 = null;
                return;
            }
            if(!obj1) obj1 = context.obj;
            else if(!obj2) {
                obj2 = context.obj;
                if(IV.data.schemaAtPath(path)) {
                    var line = new IV.objects.Line(path, {
                        point1: obj1,
                        point2: obj2
                    });
                    IV.vis.addObject(line);
                    IV.triggerRender("main");
                }
                obj1 = null;
                obj2 = null;
            }
        }, "tools:Circle");
    },
    onInactive: function() {
        IV.tools.endSelectObject("tools:Circle");
    }
};

})();
