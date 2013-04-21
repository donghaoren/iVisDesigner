// iVisDesigner
// Author: Donghao Ren, PKUVIS, Peking University, 2013.04
// See LICENSE.txt for copyright information.

// scripts/interface.js:
// Initialize and manage the interface of iVisDesigner, dispatch events.
// Including:
//   panels, menus, window resize, mouse events, keyboard events, etc.

(function() {
    $(".control-numeric-value").each(function() {
        $(this).IVNumericValue();
    });
    // Controls.
    $(".input-numeric").each(function() {
        $(this).IVInputNumeric();
    });

    // Popups
    IV.popups = { };
    $(".popup").each(function() {
        var $this = $(this);
        var key = $this.attr("data-popup");
        IV.popups[key] = $this;
        $this.mousedown(function(e) {
            e.stopPropagation();
        });
        var resize_button = $this.children(".resize");
        var mouse_state = null;
        resize_button.mousedown(function(e) {
            mouse_state = [
                "resize",
                e.pageX, e.pageY,
                $this.width(),
                $this.height()
            ];
        });
        $(window).mousemove(function(e) {
            if(mouse_state && mouse_state[0] == "resize") {
                var nx = e.pageX - mouse_state[1] + mouse_state[3];
                var ny = e.pageY - mouse_state[2] + mouse_state[4];
                if(nx < 50) nx = 50;
                if(ny < 40) ny = 40;
                $this.css("width", nx + "px");
                $this.css("height", ny + "px");
            }
        });
        $(window).mouseup(function(e) {
            mouse_state = null;
        });
        $this.detach();
    });
    IV.popups.show = function(key, anchor, width, height, info) {
        var p = IV.popups[key];
        $("#popup-container").children().detach();
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

        p.data().selector = p;
        p.data().hide = function() {
            p.detach();
        }
        if(p.data().onShow) p.data().onShow(info);
        return p.data();
    };
    $(window).mousedown(function() {
        $("#popup-container").children().each(function() {
            var data = $(this).data();
            if(data.finalize) data.finalize();
            $(this).detach();
        });
    });

    // Panels
    IV.addListener("command:panels.reset", function() {
        $("#panel-schema").IVPanel({ right: 10, top: 40, width: 200, height: 400 }).IVPanel("show");
        $("#panel-tools").IVPanel({ left: 10, top: 40, width: 100, height: 400 }).IVPanel("show");
        $("#panel-log").IVPanel({ left: 10, bottom: 10, right: 10, height: 100 }).IVPanel("hide");
        $("#panel-page").IVPanel({ vcenter: 0, bottom: 200, top: 50, width: 600 }).IVPanel("hide");
        $("#panel-style").IVPanel({ right: 220, top: 40, left: 120, height: 50 }).IVPanel("show");
    });
    IV.raiseEvent("command:panels.reset");

    {{include: panels/panels.js}}

    // data-toggle
    $("span[data-toggle]").each(function() {
        var id = $(this).attr("data-toggle");
        $(id).data().toggle_selector = $(this);
        if($(id).is(":visible")) {
            $(this).addClass("toggle-on");
        } else {
            $(this).removeClass("toggle-on");
        }
        $(this).click(function() {
            $(id).toggle();
            $(this).toggleClass("toggle-on");
        });
    });
    // data-switch
    $("span[data-switch]").each(function() {
        var key = $(this).attr("data-switch");
        var value = $(this).attr("data-value");
        var $this = $(this);
        if(!IV.exists(key)) IV.add(key, "string");
        IV.listen(key, function(v) {
            if(v == value) {
                $this.addClass("active");
            } else {
                $this.removeClass("active");
            }
        });
        $(this).click(function() {
            IV.set(key, value);
        });
    });
    // data-href
    $("span[data-open-page]").each(function() {
        var href = $(this).attr("data-open-page");
        var title = $(this).attr("data-open-page-title");
        $(this).click(function() {
            $("#panel-page").IVPanel("show");
            $("#panel-page").IVPanel("front");
            if(title) {
                $("#panel-page").IVPanel({ title: title });
            }
            if(href[0] == "#") {
                $("#panel-page-container").html($(href).html());
            } else {
                if(href.substr(0, 7) == "base64:") {
                    var ht = atob(href.substr(7));
                    $("#panel-page-container").html(ht);
                } else {
                    $("#panel-page-container").load(href);
                }
            }
        });
    });
    $("span[data-command]").each(function() {
        var command = $(this).attr("data-command");
        $(this).click(function() {
            IV.raiseEvent("command:" + command);
        });
    });
    // Window resize.
    var resize_function = function() {
        var w = $("#view").width();
        var h = $("#view").height();
        for(var i in IV.canvas) {
            IV.canvas[i].width = w;
            IV.canvas[i].height = h;
        }
        IV.needs_render.main = true;
        IV.needs_render.front = true;
        IV.needs_render.back = true;
        IV.render();
    };
    var resize_doit;
    $(window).resize(function(){
        clearTimeout(resize_doit);
        resize_doit = setTimeout(resize_function, 500);
    });
    resize_function();

    // Mouse events.
    var mouse_state = false;

    $("#view").mousedown(function(e) {
        var offsetX = e.pageX - $("#view").offset().left;
        var offsetY = e.pageY - $("#view").offset().top;
        var o = { offsetX: offsetX,
                  offsetY: offsetY,
                  pageX: e.pageX,
                  pageY: e.pageY, shift: e.shiftKey };
        mouse_state = true;
        IV.raiseEvent("view-mousedown", o);
        IV.render();
    });
    $(window).mousemove(function(e) {
        var offsetX = e.pageX - $("#view").offset().left;
        var offsetY = e.pageY - $("#view").offset().top;
        var o = { offsetX: offsetX,
                  offsetY: offsetY,
                  pageX: e.pageX,
                  pageY: e.pageY, shift: e.shiftKey };
        var w = $("#view").width();
        var h = $("#view").height();
        var insideView = offsetX >= 0 && offsetX < w && offsetY >= 0 && offsetY < h;
        if(mouse_state || insideView) {
            IV.raiseEvent("view-mousemove", o);
            IV.render();
        }
        return true;
    });
    $(window).mouseup(function(e) {
        var offsetX = e.pageX - $("#view").offset().left;
        var offsetY = e.pageY - $("#view").offset().top;
        var o = { offsetX: offsetX,
                  offsetY: offsetY,
                  pageX: e.pageX,
                  pageY: e.pageY, shift: e.shiftKey };
        mouse_state = false;
        IV.raiseEvent("view-mouseup", o);
        IV.render();
        return true;
    });
    // For iPad like platforms:
    // attach the touchstart, touchmove, touchend event listeners.
    var view_elem = document.getElementById("view");
    var touch_state = false;
    view_elem.addEventListener('touchstart',function(e) {
        if(e.target != view_elem && e.target != canvas_front) return;
        e.preventDefault();
        touch_state = true;
        var offsetX = e.touches[0].pageX - $("#view").offset().left;
        var offsetY = e.touches[0].pageY - $("#view").offset().top;
        var o = { offsetX: offsetX,
                  offsetY: offsetY,
                  pageX: e.pageX,
                  pageY: e.pageY, shift: false };
        IV.raiseEvent("view-mousedown", o);
        IV.render();
    });
    view_elem.addEventListener('touchmove',function(e) {
        var offsetX = e.touches[0].pageX - $("#view").offset().left;
        var offsetY = e.touches[0].pageY - $("#view").offset().top;
        var o = { offsetX: offsetX,
                  offsetY: offsetY,
                  pageX: e.pageX,
                  pageY: e.pageY, shift: false };
        IV.raiseEvent("view-mousemove", o);
        IV.render();
    });
    view_elem.addEventListener('touchend', function(e) {
        var offsetX = e.changedTouches[0].pageX - $("#view").offset().left;
        var offsetY = e.changedTouches[0].pageY - $("#view").offset().top;
        var o = { offsetX: offsetX,
                  offsetY: offsetY,
                  pageX: e.pageX,
                  pageY: e.pageY, shift: false };
        IV.raiseEvent("view-mouseup", o);
        IV.render();
    });

    IV.log = function(str) {
        var s;
        if(typeof(str) == "string") s = str;
        else s = JSON.stringify(str, null, " ");
        $("#log-container > ul").prepend($("<li></li>").append($("<pre></pre>").text(s)));
    };
})();
