// iVisDesigner
// Author: Donghao Ren, PKUVIS, Peking University, 2013.04
// See LICENSE.txt for copyright information.

// interface.js:
// Initialize and manage the interface of iVisDesigner, dispatch events.
// Including:
//   panels, menus, window resize, mouse events, keyboard events, etc.

(function() {
    IV.addListener("command:panels.reset", function() {
        $("#panel-schema").IVPanel({ right: 10, top: 40, width: 200, height: 400 }).IVPanel("show");
        $("#panel-tools").IVPanel({ left: 10, top: 40, width: 100, height: 400 }).IVPanel("show");
        $("#panel-log").IVPanel({ left: 10, bottom: 10, right: 10, height: 100 }).IVPanel("show");
        $("#panel-page").IVPanel({ vcenter: 0, bottom: 200, top: 50, width: 600 }).IVPanel("hide");
    });
    IV.raiseEvent("command:panels.reset");
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
        var href =$(this).attr("data-open-page");
        $(this).click(function() {
            $("#panel-page").IVPanel("show");
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
