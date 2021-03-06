// iVisDesigner - scripts/editor/objectlist.js
// Author: Donghao Ren
//
// LICENSE
//
// Copyright (c) 2014, The Regents of the University of California
// All rights reserved.
//
// Redistribution and use in source and binary forms, with or without modification,
// are permitted provided that the following conditions are met:
//
// 1. Redistributions of source code must retain the above copyright notice, this
//    list of conditions and the following disclaimer.
//
// 2. Redistributions in binary form must reproduce the above copyright notice,
//    this list of conditions and the following disclaimer in the documentation
//    and/or other materials provided with the distribution.
//
// 3. Neither the name of the copyright holder nor the names of its contributors
//    may be used to endorse or promote products derived from this software without
//    specific prior written permission.
//
// THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
// ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
// WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED.
// IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT,
// INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING,
// BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
// DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
// LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE
// OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED
// OF THE POSSIBILITY OF SUCH DAMAGE.

(function() {

var staged_paths = { };

var olist = $("#object-list");
var panel_objects = $("#panel-objects");
panel_objects.bind("drop", function(e) {
    var p = new IV.Path(e.originalEvent.dataTransfer.getData("iv/path"));
    p = p.toEntityPath();
    staged_paths[p.toString()] = true;
    Editor.generateObjectList();
});
panel_objects.bind("dragover", function(e) {
    e.preventDefault();
});

Editor.bind("reset", function() {
    staged_paths = { };
    staged_paths['[ROOT]'] = true;
});

var object_icons = {
    "Track": "xicon-tools-track",
    "Scatter": "xicon-tools-scatter",
    "Arc": "xicon-tools-arc",
    "Circle": "xicon-tools-circle",
    "Line": "xicon-tools-line",
    "Polyline": "xicon-tools-polyline",
    "LineThrough": "xicon-tools-linethrough",
    "Text": "xicon-tools-text",
    "Component": "xicon-tools-component",
    "Statistics": "xicon-tools-statistics",
    "Expression": "xicon-tools-expression",
    "BrushingValue": "xicon-tools-brushing",
    "ForceLayout": "xicon-tools-graph-layout",
    "GoogleMap": "xicon-tools-map",
    "Line3D": "xicon-tools-line3d"
};

IV.editor.object_icons = object_icons;

var generate_prefix_tree = function(paths) {
    var root = { name: "[ROOT]", children: { } };
    for(var i = 0; i < paths.length; i++) {
        if(paths[i] == "[ROOT]") continue;
        var cs = paths[i].split(":");
        var w = root;
        for(var j = 0; j < cs.length; j++) {
            var c = cs[j];
            if(!w.children[c]) {
                w.children[c] = { name: w == root ? c : w.name + ":" + c, children: { } };
            }
            w = w.children[c];
        }
    }
    return root;
};

Editor.generateObjectList = function() {
    olist.children().remove();
    var vis = Editor.vis;
    if(!vis) return;

    var classes = { };

    for(var p in staged_paths) classes[p] = [];

    var all_objects = vis.objects.slice();
    if(Editor.workspace && Editor.workspace.objects) all_objects = all_objects.concat(Editor.workspace.objects);

    all_objects.forEach(function(obj) {
        var p = obj.getPath();
        if(!p) p = new IV.Path();
        p = p.toEntityPath();
        var s = p.toString();
        if(!classes[s]) classes[s] = [];
        classes[s].push(obj);
    });

    var classes_array = [];
    for(var s in classes) {
        classes_array.push(s);
    }

    var tree = generate_prefix_tree(classes_array);

    var render_object = function(obj, ul, parents) {
        var li = IV._E("li", "object group");
        ul.append(li);
        if(object_icons[obj.type]) {
            var icon = IV._E("i", "icon " + object_icons[obj.type]);
            li.append(icon);
            li.append(IV._E("span", "name", " " + obj.name));
        } else {
            li.append(IV._E("span", "name", obj.name));
            li.append(IV._E("span", "type", " " + obj.type));
        }
        var buttons = $("<span >").addClass("buttons");
        li.append(buttons);
        buttons.append($("<span >").append($('<i class="xicon-cross"></i>')).click(function(e) {
            vis.clearSelection();
            e.stopPropagation();
            if(parents.length == 0) {
                if(vis.objects.indexOf(obj) >= 0) {
                    Actions.add(new IV.actions.Add(vis, "removeObject", "addObject", obj));
                    Actions.commit();
                } else if(Editor.workspace.objects.indexOf(obj) >= 0) {
                    var idx = Editor.workspace.objects.indexOf(obj);
                    console.log("Remove from workspace.objects", obj, idx);
                }
            } else {
                var parent_collection = parents[parents.length - 1].objects;
                var idx = parent_collection.indexOf(obj);
                if(idx >= 0) {
                    parent_collection.splice(idx, 1);
                }
                vis.raise("objects");
            }
        }));
        li.click(function(e) {
            if(!e.shiftKey) vis.clearSelection();
            var ctx = obj.selectObject(Editor.data);
            ctx.obj = obj;
            var po = obj;
            for(var i = parents.length - 1; i >= 0; i--) {
                ctx = parents[i].selectObject(Editor.data, po, ctx);
                ctx.obj = parents[i];
                po = parents[i];
            }
            vis.appendSelection(ctx);
            if(li.is(".selected") && !li.is(".target")) {
                if(obj.type == "Component") {
                    // Create a editing context for this component.
                    var context = null;
                    obj.path.enumerate(Editor.data, function(ctx) {
                        context = ctx.clone();
                        return false;
                    });
                    Editor.set("current-component", {
                        component: obj,
                        context: context,
                        toLocalCoordinate: function(pt) {
                            return obj.toLocalCoordinate(pt, this.context);
                        },
                        fromLocalCoordinate: function(pt) {
                            return obj.fromLocalCoordinate(pt, this.context);
                        },
                        addObjectAction: function(o) {
                            return new IV.actions.Add(obj, "addObject", "removeObject", o);
                        },
                        addObject: function(o) {
                            obj.addObject(o);
                            Editor.vis.raise("objects");
                        },
                        resolveSelection: function(selection) {
                            console.log(selection);
                            return selection.inner;
                        }
                    });
                }
            }
            if(li.is(".target")) {
                Editor.set("current-component", null);
            }
        });
        li.contextmenu(function(e) {
            var parent_collection = parents.length == 0 ? all_objects : parents[parents.length - 1].objects;
            IV.popups.beginContextMenu(new IV.Vector(e.pageX, e.pageY), [
              { name: "F", display: "Bring to front" },
              { name: "-", display: "Bring forward" },
              { name: "+", display: "Bring backward" },
              { name: "B", display: "Bring to back" }
            ], function(c) {
                var idx = parent_collection.indexOf(obj);
                var target = 0;
                if(c == "F") target = 0;
                if(c == "-") target = idx - 1;
                if(c == "+") target = idx + 1;
                if(c == "B") target = parent_collection.length - 1;
                if(idx >= 0 && idx < parent_collection.length &&
                   target >= 0 && target < parent_collection.length &&
                   idx != target) {
                    if(idx > target) {
                        for(var t = idx; t > target; t--) {
                            parent_collection[t] = parent_collection[t - 1];
                        }
                        parent_collection[target] = obj;
                    }
                    if(idx < target) {
                        for(var t = idx; t < target; t++) {
                            parent_collection[t] = parent_collection[t + 1];
                        }
                        parent_collection[target] = obj;
                    }
                    Editor.generateObjectList();
                }
            });
        });
        var data = li.data();
        data.update = function() {
            if(parents.length == 0) {
                if(obj.selected) {
                    li.addClass("selected");
                } else {
                    li.removeClass("selected");
                }
            } else {
                if(parents[0].selected) {
                    var c = parents[0]._selection_context;
                    for(var k = 1; k < parents.length; k++) {
                        if(c.selected_object == parents[k]) {
                            c = c.selected_object;
                        } else {
                            break;
                        }
                    }
                    if(c.selected_object == obj) li.addClass("selected");
                    else li.removeClass("selected");
                } else {
                    li.removeClass("selected");
                }
            }
            if(Editor.get("current-component") && Editor.get("current-component").component == obj) {
                li.addClass("target");
            } else {
                li.removeClass("target");
            }
        };
        data.update();
        if(obj.type == "Component") {
            var ul2 = IV._E("ul");
            ul.append(ul2);
            obj.objects.forEach(function(o) {
                render_object(o, ul2, parents.concat([obj]));
            });
        }
    };

    var render_tree_node = function(tree, output) {
        var p = tree.name;
        var div_sel = IV._E("div", "selector", p);
        var p_selected = Editor.get("selected-path").toEntityPath();
        if(p_selected.toString() == p) {
            div_sel.addClass("active");
        }
        div_sel.click(function() {
            Editor.set("selected-path", new IV.Path(p))
        });
        output.append(div_sel);
        var ul = IV._E("ul", "objects");
        output.append(ul);
        if(classes[p]) {
            classes[p].forEach(function(obj) {
                render_object(obj, ul, []);
            });
        }
        var ul_children = IV._E("ul", "children");
        output.append(ul_children);
        for(var c in tree.children) {
            render_tree_node(tree.children[c], ul_children);
        }
    };
    render_tree_node({ name: "[ROOT]", children: { } }, olist);
    for(var c in tree.children) {
        render_tree_node(tree.children[c], olist);
    }
    for(var p in classes) { (function(p) {

    })(p); }
};

Editor.listen("selected-path", function() {
    Editor.generateObjectList();
});

Editor.listen("current-component", function() {
    Editor.generateObjectList();
});

})();
