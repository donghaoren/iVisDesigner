//. iVisDesigner - File: scripts/interface/popup.js
//. Copyright 2013-2014 Donghao Ren
//. Peking University, University of California, Santa Barbara
//. See LICENSE.md for more information.

(function() {
    // Popups
    IV.popups = { };
    var should_block_popup_hide = false;
    IV.popups.create = function() {
        var popup = $("<div />").addClass("popup");
        var data = popup.data();

        var mouse_state = null;

        popup.append('<div class="content"></div>');
        popup.append('<div class="topbar"></div>');
        popup.append('<div class="resize"></div>');

        var resize_button = popup.children(".resize");
        var topbar_move = popup.children(".topbar");

        popup.mousedown(function(e) {
            if(data.shown) {
                should_block_popup_hide = true;
            }
        });

        resize_button.mousedown(function(e) {
            mouse_state = [
                "resize",
                e.pageX, e.pageY,
                popup.width(),
                popup.height()
            ];
            $(window).bind("mousemove", my_move);
            $(window).bind("mouseup", my_up);
        });

        topbar_move.mousedown(function(e) {
            var l = popup.css("left");
            var t = popup.css("top");
            if(!l) l = 0; else l = parseFloat(l.replace("px"), "");
            if(!t) t = 0; else t = parseFloat(t.replace("px"), "");

            mouse_state = [
                "move",
                e.pageX, e.pageY,
                l, t
            ];
            $(window).bind("mousemove", my_move);
            $(window).bind("mouseup", my_up);
        });

        var my_move = function(e) {
            if(mouse_state && mouse_state[0] == "resize") {
                var nx = e.pageX - mouse_state[1] + mouse_state[3];
                var ny = e.pageY - mouse_state[2] + mouse_state[4];
                if(nx < 50) nx = 50;
                if(ny < 40) ny = 40;
                popup.css("width", nx + "px");
                popup.css("height", ny + "px");
            }
            if(mouse_state && mouse_state[0] == "move") {
                var nx = e.pageX - mouse_state[1] + mouse_state[3];
                var ny = e.pageY - mouse_state[2] + mouse_state[4];
                if(nx < 50) nx = 50;
                if(ny < 40) ny = 40;
                popup.css("left", nx + "px");
                popup.css("top", ny + "px");
            }
        };

        var my_up = function(e) {
            mouse_state = null;
            $(window).unbind("mousemove", my_move);
            $(window).unbind("mouseup", my_up);
        };

        data.selector = popup;

        data.hide = function() {
            popup.remove();
            if(data.onHide) data.onHide();
            if(data.finalize) data.finalize();
            return data;
        };

        var get_real_bounds = function(elem) {
            if(elem instanceof IV.Vector) {
                return { x0: elem.x, y0: elem.y, x1: elem.x, y1: elem.y };
            }
            var bound = { x0: -1e10, y0: -1e10, x1: 1e10, y1: 1e10 };
            while(elem) {
                var off = elem.offset();
                var w = elem.outerWidth();
                var h = elem.outerHeight();
                if(off && w != 0 && h != 0) {
                    var x0 = off.left;
                    var y0 = off.top;
                    var x1 = x0 + w;
                    var y1 = y0 + h;
                    if(bound.x0 < x0) bound.x0 = x0;
                    if(bound.y0 < y0) bound.y0 = y0;
                    if(bound.x1 > x1) bound.x1 = x1;
                    if(bound.y1 > y1) bound.y1 = y1;
                }
                if(elem.get(0) == elem.parent().get(0)) break;
                elem = elem.parent();
            }
            return bound;
        };

        data.show = function(anchor, width, height, info) {
            var p = popup;
            if(!width) width = p.default_width;
            if(!height) height = p.default_height;
            $("#popup-container").append(p);
            var margin = 5;
            var bound = get_real_bounds(anchor);
            var x = bound.x1 - width - 2;
            var y = bound.y0 - height - margin - 7;
            var cx = (bound.x0 + bound.x1) / 2;
            var cy = (bound.y0 + bound.y1) / 2;
            if(cx < $(window).width() / 2) x = bound.x0;
            if(cy < $(window).height() / 2) y = bound.y1 + margin;
            p.css({
                width: width + "px",
                height: height + "px",
                left: x + "px",
                top: y + "px"
            });

            if(p.data().onShow) p.data().onShow(info);
            data.shown = true;
            return p.data();
        };

        data.addActions = function(acts) {
            var actions = $('<div class="actions"></div>');
            popup.append(actions);
            if(!acts) acts = [];
            if(acts.indexOf("ok") != -1) {
                actions.append($('<span class="btn btn-s"><i class="xicon-mark"></i></span>').click(function() {
                    if(data.onOk) data.onOk();
                }));
            }
            if(acts.indexOf("cancel") != -1) {
                actions.append($('<span class="btn btn-s"><i class="xicon-cross"></i></span>').click(function() {
                    if(data.onCancel) data.onCancel();
                }));
            }
            popup.addClass("has-actions");
            popup.append(resize_button);
            return actions;
        };

        return data;
    };

    $(window).mousedown(function() {
        if(!should_block_popup_hide) {
            $("#popup-container").children().each(function() {
                var data = $(this).data();
                data.hide();
            });
        }
        should_block_popup_hide = false;
    });

})();

{{include: popups/popups.js}}
