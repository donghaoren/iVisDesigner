//. iVisDesigner - File: scripts/interface/panel.js
//. Copyright 2013-2014 Donghao Ren
//. University of California, Santa Barbara, Peking University
//. See LICENSE.md for more information.

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
                    '<div class="button-minimize" title="Minimize"><i class="icon-up-open-mini"></i></div>' +
                    '<div class="button-close" title="Close"><i class="xicon-cross"></i></div>' +
                '</div>' +
            '</div>' +
            '<div class="resize rb" data-resize="0+0+"></div>' +
            '<div class="resize lb" data-resize="+-0+"></div>' +
            '<div class="resize lt" data-resize="+-+-"></div>'
        );
        $(container[0]).append($this.children());

        $this.append(container);

        $this.css({
            left: "0px", top: "0px",
            width: "100px", height: "100px"
        });

        var title_wrapper = $this.children(".title-wrapper");

        title_wrapper.children(".buttons").children(".button-close").click(function() {
            $this.hide();
            if(data.toggle_selector)
                data.toggle_selector.removeClass("toggle-on");
        });

        title_wrapper.children(".buttons").children(".button-minimize").click(function() {
            $this.toggleClass("minimized");
        });

        title_wrapper.mousedown(function(e) {
            var left0 = parseFloat($this.css("left").replace("px", ""));
            var top0 = parseFloat($this.css("top").replace("px", ""));
            IV.attachMouseEvents({
                move: function(emove) {
                    var nx = emove.pageX - e.pageX + left0;
                    var ny = emove.pageY - e.pageY + top0;
                    if(ny < 30) ny = 30;
                    $this.css("left", nx + "px");
                    $this.css("top", ny + "px");
                }
            });
        });

        $this.children(".resize").mousedown(function(e) {
            var x0 = parseFloat($this.css("left").replace("px", ""));
            var y0 = parseFloat($this.css("top").replace("px", ""));
            var w0 = $this.width();
            var h0 = $this.height();
            var info = $(this).attr("data-resize");
            e.stopPropagation();
            e.preventDefault();
            IV.attachMouseEvents({
                move: function(emove) {
                    var dx = emove.pageX - e.pageX;
                    var dy = emove.pageY - e.pageY;
                    if(emove.shiftKey) {
                        var r = IV.shiftModifyNoDiagnoal(0, 0, dx, dy);
                        dx = r[0]; dy = r[1];
                    }
                    var x1 = x0, y1 = y0, w1 = w0, h1 = h0;
                    if(info[0] == '+') x1 += dx; if(info[2] == '+') y1 += dy;
                    if(info[0] == '-') x1 -= dx; if(info[2] == '-') y1 -= dy;
                    if(info[1] == '+') w1 += dx; if(info[3] == '+') h1 += dy;
                    if(info[1] == '-') w1 -= dx; if(info[3] == '-') h1 -= dy;
                    if(w1 < min_width) w1 = min_width;
                    if(h1 < min_height) h1 = min_height;
                    if(y1 < 30) y1 = 30;
                    $this.css("left", x1 + "px");
                    $this.css("top", y1 + "px");
                    $this.css("width", w1 + "px");
                    $this.css("height", h1 + "px");
                }
            });
        });

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
