// iVisDesigner
// Author: Donghao Ren, PKUVIS, Peking University, 2013.04
// See LICENSE.txt for copyright information.

(function() {

Tools.Circle = {
    onActive: function() {
        var $this = this;
        IV.set("status", "Circle: Select the center.");
        Tools.beginSelectLocation(function(loc) {
            var path = IV.get("selected-path");
            if(IV.data.getSchema(path)) {
                var circle = new IV.objects.Circle(path, {
                    center: loc,
                    style: IV.panels.style.createStyle()
                });
                IV.vis.addObject(circle);
            }
        }, "tools:Circle");
    },
    onInactive: function() {
        Tools.endSelectLocation("tools:Circle");
    }
};

})();
