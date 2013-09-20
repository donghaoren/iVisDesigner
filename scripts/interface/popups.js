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

        popup.mousedown(function() {
            if(data.shown) {
                should_block_popup_hide = true;
                console.log
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
        data.shown = false;

        data.hide = function() {
            popup.remove();
            if(data.onHide) data.onHide();
            return data;
        };

        data.show = function(anchor, width, height, info) {
            var p = popup;
            if(!width) width = p.default_width;
            if(!height) height = p.default_height;
            $("#popup-container").append(p);
            var margin = 5;
            var x = anchor.offset().left - width - margin;
            var y = anchor.offset().top - height - margin;
            var cx = anchor.offset().left + anchor.width() / 2;
            var cy = anchor.offset().top + anchor.height() / 2;
            if(cx < $(window).width() / 2) x = anchor.offset().left + anchor.width() + margin;
            if(cy < $(window).height() / 2) y = anchor.offset().top + anchor.height() + margin;
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
                actions.append($('<span class="btn"><i class="xicon-mark"></i></span>').click(function() {
                    if(data.onOk) data.onOk();
                }));
            }
            if(acts.indexOf("cancel") != -1) {
                actions.append($('<span class="btn"><i class="xicon-cross"></i></span>').click(function() {
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
                if(data.finalize) data.finalize();
                $(this).remove();
            });
        }
        should_block_popup_hide = false;
    });

})();

{{include: popups/colorselect.js}}
{{include: popups/pathselect.js}}
{{include: popups/createlayout.js}}
