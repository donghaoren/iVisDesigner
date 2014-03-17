//. iVisDesigner - File: scripts/editor/tools/geometry.js
//. Copyright 2013-2014 Donghao Ren
//. Peking University, University of California, Santa Barbara
//. See LICENSE.md for more information.

(function() {

Tools.LineIntersection = {
    onActive: function() {
        var obj1 = null;
        var obj2 = null;
        Editor.vis.clearSelection();

        var sA = Editor.status.start()
            .add("LineIntersection: ")
            .append("A: [please select]");

        var get_inner_object = function(context) {
            var current_component = Editor.get("current-component");
            if(current_component) {
                context = current_component.resolveSelection(context);
            }
            var ref_path = Editor.get("selected-reference");
            var refd_path = Editor.get("selected-reference-target");
            if(ref_path) return new IV.objects.ReferenceWrapper(ref_path, refd_path, context.obj);
            return context.obj;
        };

        Tools.beginSelectObject(function(context) {
            var path = Editor.get("selected-path");
            if(!context) {
                obj1 = null;
                obj2 = null;
                Editor.vis.clearSelection();
                sA = Editor.status.start()
                    .add("LineIntersection: ")
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
                var is_line = function(t) {
                    if(t.type == "Line") return true;
                    if(t.type == "ReferenceWrapper") {
                        return is_line(t.obj);
                    }
                };
                if(is_line(obj1) && is_line(obj2)) {
                    var intersection = new IV.objects.LineIntersection(obj1, obj2);
                    var circle = new IV.objects.Circle({
                        path: intersection.getPath(),
                        center: intersection
                    });
                    Editor.doAddObject(circle);
                }
                obj1 = null;
                obj2 = null;
                Editor.vis.clearSelection();
                sA = Editor.status.start()
                    .add("LineIntersection: ")
                    .append("A: [please select]");
            }
        }, "tools:LineIntersection");
    },
    onInactive: function() {
        Tools.endSelectObject("tools:LineIntersection");
    }
};

})();
