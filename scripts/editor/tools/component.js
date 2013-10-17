// iVisDesigner
// Author: Donghao Ren, PKUVIS, Peking University, 2013.04
// See LICENSE.txt for copyright information.

(function() {

Tools.Component = {
    onActive: function() {
        var $this = this;
        IV.set("status", "Component: Select the center.");
        Tools.beginSelectLocation(function(loc) {
            var path = Editor.get("selected-path");
            if(path) {
                var circle = new IV.objects.Component({
                    path: path,
                    center: loc
                });
                Editor.doAddObject(circle);
            }
        }, "tools:Component");
    },
    onInactive: function() {
        Tools.endSelectLocation("tools:Component");
    }
};

})();
