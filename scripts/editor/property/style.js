// iVisDesigner - File: scripts/editor/property/style.js
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

var Style = Editor.Style = { };

IV.makeEventSource(Style);

var current = null; //new IV.objects.PathStyle;

Style.beginEditStyle = function(style) {
    current = style;
    render();
};

Style.endEditStyle = function() {
    current = null;
    //if(current) current = current.clone();
    render();
};

Editor.bind("selection", function() {
    if(Editor.vis && Editor.vis.selection.length == 1) {
        var selobj = Editor.vis.selection[0].obj;
        if(Editor.vis.selection[0].selected_object)
            selobj = Editor.vis.selection[0].selected_object;
        if(selobj.style) {
            Editor.Style.beginEditStyle(selobj.style);
        } else {
            Editor.Style.endEditStyle();
        }
    } else {
        Editor.Style.endEditStyle();
    }
});

var build_style_property_item = function(name, act, key, type, args) {
    return render_property_field({
        name: name,
        args: args,
        type: type,
        owner: act,
        property: key,
        get: function() {
            return act[key];
        },
        set: function(val) {
            act[key] = val;
        },
        set_action: function(val) {
            return new IV.actions.SetDirectly(act, key, val);
        }
    });
};

var render = function() {
    var container = $("#panel-style-display");
    container.children().remove();
    if(!current) {
        container.append(render_info("Nothing Selected"));
        return;
    }
    var actions = current.actions;

    var make_caption = function(text, act) {
        var r = render_caption(text);
        r.append($("<span />").addClass("rightmost btn").append($('<i class="xicon-cross"></i>')).click(function() {
            var idx = actions.indexOf(act);
            if(idx >= 0) {
                actions.splice(idx, 1);
                render();
                Editor.renderer.trigger();
                Editor.renderer.render();
            }
        }));
        var tracking_idx = null;
        IV.trackMouseEvents(r, {
            down: function() { tracking_idx = null; },
            move: function(e) {
                var items = container.children(".item-caption");
                var min_diff = 1e100;
                var cidx = -1;
                items.each(function(idx) {
                    var t = $(this).offset().top;
                    var h = $(this).height() + $(this).next().height();
                    t += h / 2;
                    var diff = Math.abs(e.pageY - t);
                    if(diff < min_diff) {
                        cidx = e.pageY > t ? idx + 1 : idx;
                        min_diff = diff;
                    }
                });
                container.children(".item-divider").remove();
                var myidx = actions.indexOf(act);
                if(cidx >= 0 && cidx != myidx && cidx != myidx + 1) {
                    var pl = $("<div />").addClass("item-divider");
                    if(cidx == items.length) items.eq(cidx - 1).next().after(pl);
                    else items.eq(cidx).before(pl);
                    tracking_idx = cidx;
                }
            },
            up: function(e) {
                container.children(".item-divider").remove();
                if(tracking_idx !== null) {
                    var myidx = actions.indexOf(act);
                    if(myidx < 0) return;
                    if(myidx > tracking_idx) {
                        actions.splice(tracking_idx, 0, act);
                        actions.splice(myidx + 1, 1);
                        render();
                    } else if(myidx < tracking_idx) {
                        actions.splice(tracking_idx, 0, act);
                        actions.splice(myidx, 1);
                        render();
                    }
                }
            }
        });
        return r;
    };

    var toolbar = $("<div />").addClass("item-tools");
    toolbar.append($("<span />").addClass("btn").text("+").click(function() {
        IV.popups.beginContextMenu($(this), [ "Stroke", "Fill" ], function(s) {
            if(s == "Fill") {
                actions.push({
                    type: "fill",
                    color: new IV.objects.Plain(new IV.Color(128, 128, 128, 1))
                });
            }
            if(s == "Stroke") {
                actions.push({
                    type: "stroke",
                    color: new IV.objects.Plain(new IV.Color(0, 0, 0, 1)),
                    width: new IV.objects.Plain(1),
                    join: new IV.objects.Plain("round"),
                    cap: new IV.objects.Plain("round")
                });
            }
            render();
            Editor.renderer.trigger();
            Editor.renderer.render();
        });
    }));

    actions.forEach(function(act) {
        var target = $("<div />").addClass("item-action");
        var cap = "Unknown";
        if(act.type == "stroke") {
            container.append(make_caption("Stroke", act));
            target.append(build_style_property_item("Color", act, "color", "color"));
            target.append(build_style_property_item("Width", act, "width", "number"));
            target.append(build_style_property_item("Join", act, "join", "list", [ "bevel", "round", "miter" ]));
            target.append(build_style_property_item("Cap", act, "cap", "list", [ "butt", "round", "square" ]));
        }
        if(act.type == "fill") {
            container.append(make_caption("Fill", act));
            target.append(build_style_property_item("Color", act, "color", "color"));
        }
        container.append(target);
    });
    container.append(toolbar);
};

render();

})();
