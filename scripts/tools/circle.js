(function() {

IV.tools.Circle = {
    onActive: function() {
        var $this = this;
        IV.tools.beginSelectObject(function(context) {
            if(!context) return;
            var path = IV.get("selected-path");
            if(IV.data.schemaAtPath(path)) {
                var circle = new IV.objects.Circle(path, {
                    center: context.obj
                });
                IV.vis.addObject(circle);
                IV.triggerRender("main");
            }
        }, "tools:Circle");
    },
    onInactive: function() {
        IV.tools.endSelectObject("tools:Circle");
    }
};

})();
