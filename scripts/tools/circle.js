// iVisDesigner
// Author: Donghao Ren, PKUVIS, Peking University, 2013.04
// See LICENSE.txt for copyright information.

(function() {

IV.tools.Circle = {
    onActive: function() {
        var $this = this;
        IV.tools.beginSelectObject(function(context) {
            if(!context) return;
            var path = IV.get("selected-path");
            if(IV.data.schemaAtPath(path)) {
                var circle = new IV.objects.Circle(path, {
                    center: context.obj,
                    style: IV.panels.style.createStyle()
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
