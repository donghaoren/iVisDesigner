// iVisDesigner - File: scripts/editor/tools/geometry.js
// Copyright (c) 2013-2014, Donghao Ren
// University of California Santa Barbara, Peking University
// Advised by Prof. Tobias Hollerer and previously by Prof. Xiaoru Yuan.
//
// All rights reserved.
//
// Redistribution and use in source and binary forms, with or without
// modification, are permitted provided that the following conditions are met:
//
// 1. Redistributions of source code must retain the above copyright notice,
//    this list of conditions and the following disclaimer.
//
// 2. Redistributions in binary form must reproduce the above copyright
//    notice, this list of conditions and the following disclaimer in the
//    documentation and/or other materials provided with the distribution.
//
// THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS
// IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO,
// THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR
// PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR
// CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
// EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,
// PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS;
// OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY,
// WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR
// OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF
// ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

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
