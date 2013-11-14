// scripts/panel.js
// Implements a jQuery plugin IVPanel.

(function($) {
  $.fn.IVPanel = function(params) {
    var $this = this;
    var data = this.data();

    if(!data.is_created) {
        var min_width = 50;
        var min_height = 38;
        if(params.min_width !== undefined) min_width = params.min_width;
        if(params.min_height !== undefined) min_height = params.min_height;
        var container = $(
            '<div class="content-wrapper"></div>' +
            '<div class="title-wrapper">' +
                '<div class="title">' + $this.attr("data-title") + '</div>' +
                '<div class="buttons">' +
                    '<div class="button-minimize" title="Minimize"><i class="icon-angle-up"></i></div>' +
                    '<div class="button-close" title="Close"><i class="xicon-cross"></i></div>' +
                '</div>' +
            '</div>' +
            '<div class="resize"></div>'
        );
        $(container[0]).append($this.children());

        $this.append(container);

        $this.css({
            left: "0px", top: "0px",
            width: "100px", height: "100px"
        });

        var title_wrapper = $this.children(".title-wrapper");
        var resize_button = $this.children(".resize");

        title_wrapper.children(".buttons").children(".button-close").click(function() {
            $this.hide();
            if(data.toggle_selector)
                data.toggle_selector.removeClass("toggle-on");
        });

        title_wrapper.children(".buttons").children(".button-minimize").click(function() {
            $this.toggleClass("minimized");
        });

        var mouse_state = null;

        title_wrapper.mousedown(function(e) {
            mouse_state = [
                "move",
                e.pageX, e.pageY,
                parseFloat($this.css("left").replace("px", "")),
                parseFloat($this.css("top").replace("px", ""))
            ];
            $(window).bind("mousemove", my_move);
            $(window).bind("mouseup", my_up);
        });
        resize_button.mousedown(function(e) {
            mouse_state = [
                "resize",
                e.pageX, e.pageY,
                $this.width(),
                $this.height()
            ];
            e.stopPropagation();
            e.preventDefault();
            $(window).bind("mousemove", my_move);
            $(window).bind("mouseup", my_up);
        });
        var my_move = function(e) {
            if(mouse_state && mouse_state[0] == "move") {
                var nx = e.pageX - mouse_state[1] + mouse_state[3];
                var ny = e.pageY - mouse_state[2] + mouse_state[4];
                if(ny < 30) ny = 30;
                $this.css("left", nx + "px");
                $this.css("top", ny + "px");
            }
            if(mouse_state && mouse_state[0] == "resize") {
                var nx = e.pageX - mouse_state[1] + mouse_state[3];
                var ny = e.pageY - mouse_state[2] + mouse_state[4];
                if(nx < min_width) nx = min_width;
                if(ny < min_height) ny = min_height;
                $this.css("width", nx + "px");
                $this.css("height", ny + "px");
            }
        };
        var my_up = function(e) {
            mouse_state = null;
            $(window).unbind("mousemove", my_move);
            $(window).unbind("mouseup", my_up);
        };
        data.reorder = function() {
            // Reorder panels.
            var panels = $("#panel-container > .panel");
            var zidxs = [];
            var myidx = null;
            panels.each(function() {
                var zidx = parseInt($(this).css("z-index"));
                if($this.get(0) == this) myidx = zidxs.length;
                zidxs.push(zidx);
            });
            zidxs[myidx] = 100000;
            var base_idx = 10;
            var order = zidxs.map(function(z, i) { return [ z, i ] })
                                .sort(function(a, b) { return a[0] - b[0] })
                                .map(function(f) { return f[1] });
            for(var i = 0; i < order.length; i++) {
                zidxs[order[i]] = base_idx + +i;
            }
            var idx = 0;
            panels.each(function() {
                $(this).css("z-index", zidxs[idx++]);
            });
        };
        $this.mousedown(function(e) {
            data.reorder();
        });
        data.is_created = true;
    }
    if(params == "show") {
        $this.show();
        if(data.toggle_selector)
            data.toggle_selector.addClass("toggle-on");
        return;
    }
    if(params == "hide") {
        $this.hide();
        if(data.toggle_selector)
            data.toggle_selector.removeClass("toggle-on");
        return;
    }
    if(params == "front") {
        data.reorder();
        return;
    }
    var menu_height = 30;
    var status_height = 18;
    var border_width = 1;
    var area_width = $(window).width();
    var area_height = $(window).height() - menu_height - status_height;

    if(params.width) {
        $(this).css("width", params.width + "px");
    }
    if(params.height) {
        $(this).css("height", params.height + "px");
    }
    if(params.top) {
        $(this).css("top", menu_height + params.top - border_width + "px");
        if(params.bottom) {
            $(this).css("height", area_height - (params.top + params.bottom) + "px");
        }
    } else if(params.bottom) {
        $(this).css("top", $(window).height() - status_height - params.bottom - $this.height() + "px");
    }
    if(params.left) {
        $(this).css("left", params.left - border_width + "px");
        if(params.right) {
            $(this).css("width", area_width - (params.left + params.right) + "px");
        }
    } else if(params.right) {
        $(this).css("left", area_width - params.right - $this.width() - border_width + "px");
    }
    if(params.vcenter !== undefined) {
        var l = (area_width - $this.width()) / 2.0 + params.vcenter;
        $this.css("left", l - border_width + "px");
    }
    if(params.hcenter !== undefined) {
        var l = (area_height - $this.height()) / 2.0 + menu_height + params.hcenter;
        $this.css("top", l - border_width + "px");
    }
    if(params.title) {
        $this.children(".title-wrapper").children(".title").text(params.title);
    }
    return $this;
  };
})(jQuery);

{{include: panels/panels.js}}
