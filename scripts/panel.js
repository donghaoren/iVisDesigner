// iVisDesigner
// Author: Donghao Ren, PKUVIS, Peking University, 2013.04
// See LICENSE.txt for copyright information.

// panel.js
// Implements a jQuery plugin IVPanel.

(function($) {
  $.fn.IVPanel = function(params) {
    var $this = this;
    var data = this.data();

    if(!data.is_created) {
        var container = $(
            '<div class="title-wrapper">' +
                '<span class="title">' + $this.attr("data-title") + '</span>' +
                '<span class="buttons">' +
                    '<span class="button-minimize"><img src="imgs/stroke.svg" ondragstart="return false;" /></span>' +
                    '<span class="button-close"><img src="imgs/cross.svg" ondragstart="return false;" /></span>' +
                '</span>' +
            '</div>' +
            '<div class="content-wrapper"></div>' +
            '<div class="resize"></div>'
        );
        $(container[1]).append($this.children());

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
        });
        resize_button.mousedown(function(e) {
            mouse_state = [
                "resize",
                e.pageX, e.pageY,
                $this.width(),
                $this.height()
            ];
        });
        $(window).mousemove(function(e) {
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
                if(nx < 50) nx = 50;
                if(ny < 40) ny = 40;
                $this.css("width", nx + "px");
                $this.css("height", ny + "px");
            }
        });
        $this.mousedown(function(e) {
            e.stopPropagation();
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
            for(var i in order) {
                zidxs[order[i]] = base_idx + +i;
            }
            var idx = 0;
            panels.each(function() {
                $(this).css("z-index", zidxs[idx++]);
            });
            /*
            setTimeout(function() {
                var parent = $("#panel-container").get(0);
                var t = $this.get(0);
                parent.appendChild(t);
            }, 1);*/
            //$("#panel-container").append($this);

        });
        $(window).mouseup(function(e) {
            mouse_state = null;
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
    if(params.width) {
        $(this).css("width", params.width + "px");
    }
    if(params.height) {
        $(this).css("height", params.height + "px");
    }
    if(params.top) {
        $(this).css("top", params.top + "px");
        if(params.bottom) {
            $(this).css("height", $(window).height() - (params.top + params.bottom) + "px");
        }
    } else if(params.bottom) {
        $(this).css("top", $(window).height() - params.bottom - $this.height() + "px");
    }
    if(params.left) {
        $(this).css("left", params.left + "px");
        if(params.right) {
            $(this).css("width", $(window).width() - (params.left + params.right) + "px");
        }
    } else if(params.right) {
        $(this).css("left", $(window).width() - params.right - $this.width() + "px");
    }
    if(params.vcenter !== undefined) {
        var l = ($(window).width() - $this.width()) / 2.0 + params.vcenter;
        console.log(l);
        $this.css("left", l + "px");
    }
    if(params.hcenter !== undefined) {
        var l = ($(window).height() - $this.height()) / 2.0 + params.hcenter;
        $this.css("top", l + "px");
    }
    if(params.title) {
        $this.children(".title-wrapper").children(".title").text(params.title);
    }
    return $this;
  };
})(jQuery);
