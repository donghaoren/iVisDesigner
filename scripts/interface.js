// iVisDesigner
// Author: Donghao Ren, PKUVIS, Peking University, 2013.04
// See LICENSE.txt for copyright information.

// scripts/interface.js:
// Initialize and manage the interface of iVisDesigner, dispatch events.
// Including:
//   panels, menus, window resize, mouse events, keyboard events, etc.

(function() {
    // Data-apply-children:
    $("[data-apply-children]").each(function() {
        var attr = $(this).attr("data-apply-children");
        var kvs = attr.split(";").map(function(x) {
            var k = x.split("=");
            return { key: k[0], value: k[1] };
        });
        $(this).children().each(function() {
            var $this = $(this);
            kvs.forEach(function(t) {
                $this.attr(t.key, t.value);
            });
        });
    });
    $("[ivfilter-remove-text-nodes]").each(function() {
        $(this).contents().filter(function() { return this.nodeType === 3; }).remove();
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

    $(".control-numeric-value").each(function() {
        $(this).IVNumericValue();
    });
    $(".control-color-value").each(function() {
        $(this).IVColorValue();
    });
    $(".control-select-value").each(function() {
        $(this).IVSelectValue();
    });
    // Controls.
    $(".input-numeric").each(function() {
        $(this).IVInputNumeric();
    });
    $(".input-path").each(function() {
        $(this).IVInputPath();
    });
    $(".input-string").each(function() {
        $(this).IVInputString();
    });
    $(".color-selector").each(function() {
        $(this).IVColorPicker();
    });

    $(".scrollview").each(function() {
        $(this).ScrollView();
    });

    $(".tab").each(function() {
        $(this).IVTab();
    });

    {{include: popups.js}}

    // Panels
    IV.addListener("command:panels.reset", function() {
        $("#panel-schema").IVPanel({ right: 10, top: 10, width: 200, height: 400 }).IVPanel("show");
        $("#panel-objects").IVPanel({ right: 10, top: 420, width: 200, bottom: 10 }).IVPanel("show");
        $("#panel-tools").IVPanel({ left: 10, top: 10, width: 69, height: 400 }).IVPanel("show");
        $("#panel-log").IVPanel({ left: 10, bottom: 10, right: 10, height: 100 }).IVPanel("hide");
        $("#panel-page").IVPanel({ vcenter: 0, bottom: 200, top: 50, width: 600 }).IVPanel("hide");
        $("#panel-style").IVPanel({ right: 220, top: 10, left: 120, height: 50 }).IVPanel("show");
        $("#panel-property").IVPanel({ left: 10, height: 54, width: 400, bottom: 10 }).IVPanel("show");
    });
    IV.raiseEvent("command:panels.reset");

    {{include: panels/panels.js}}

    // data-toggle
    $("span[data-toggle]").each(function() {
        var id = $(this).attr("data-toggle");
        if(id[0] == "#") {
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
        } else {
            if(!IV.exists(id)) IV.add(id, "bool");
            if(IV.get(id)) {
                $(this).addClass("toggle-on");
            } else {
                $(this).removeClass("toggle-on");
            }
            $(this).click(function() {
                IV.set(id, !IV.get(id));
                $(this).toggleClass("toggle-on");
            });
        }
    });
    // data-popup
    $("span[data-popup]").each(function() {
        var key = $(this).attr("data-popup");
        $(this).click(function() {
            var data = IV.popups[key]();
            data.show($(this));
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
        var dev_ratio = window.devicePixelRatio || 1;
        var g = IV.canvas["main"].getContext("2d");
        var backing_ratio = g.webkitBackingStorePixelRatio ||
                                g.mozBackingStorePixelRatio ||
                                g.msBackingStorePixelRatio ||
                                g.oBackingStorePixelRatio ||
                                g.backingStorePixelRatio || 1;
        var ratio = dev_ratio / backing_ratio;
        for(var i in IV.canvas) {
            IV.canvas[i].width = Math.round(w * ratio);
            IV.canvas[i].height = Math.round(h * ratio);
            $(IV.canvas[i]).css("width", w + "px");
            $(IV.canvas[i]).css("height", h + "px");
        }
        IV.viewarea.width = w;
        IV.viewarea.height = h;
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

    IV.isTrackingMouse = function() { return mouse_state; }

    $("#view").mousedown(function(e) {
        var offsetX = e.pageX - $("#view").offset().left;
        var offsetY = e.pageY - $("#view").offset().top;
        var pt = IV.viewarea.transformRAWLocation(offsetX, offsetY);
        var o = { offset: pt,
                  offsetX: pt.x,
                  offsetY: pt.y,
                  pageX: e.pageX,
                  pageY: e.pageY,
                  page: new IV.Vector(e.pageX, e.pageY),
                  shift: e.shiftKey };
        mouse_state = true;
        IV.raiseEvent("view-mousedown", o);
        IV.render();
    });
    $(window).mousemove(function(e) {
        var offsetX = e.pageX - $("#view").offset().left;
        var offsetY = e.pageY - $("#view").offset().top;
        var pt = IV.viewarea.transformRAWLocation(offsetX, offsetY);
        var o = { offset: pt,
                  offsetX: pt.x,
                  offsetY: pt.y,
                  pageX: e.pageX,
                  pageY: e.pageY,
                  page: new IV.Vector(e.pageX, e.pageY),
                  shift: e.shiftKey };
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
        var pt = IV.viewarea.transformRAWLocation(offsetX, offsetY);
        var o = { offset: pt,
                  offsetX: pt.x,
                  offsetY: pt.y,
                  pageX: e.pageX,
                  pageY: e.pageY,
                  page: new IV.Vector(e.pageX, e.pageY),
                  shift: e.shiftKey };
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
        var pt = IV.viewarea.transformRAWLocation(offsetX, offsetY);
        var o = { offsetX: pt.x,
                  offsetY: pt.y,
                  pageX: e.pageX,
                  pageY: e.pageY,
                  page: new IV.Vector(e.pageX, e.pageY),
                  shift: false };
        IV.raiseEvent("view-mousedown", o);
        IV.render();
    });
    view_elem.addEventListener('touchmove',function(e) {
        var offsetX = e.touches[0].pageX - $("#view").offset().left;
        var offsetY = e.touches[0].pageY - $("#view").offset().top;
        var pt = IV.viewarea.transformRAWLocation(offsetX, offsetY);
        var o = { offsetX: pt.x,
                  offsetY: pt.y,
                  pageX: e.pageX,
                  pageY: e.pageY,
                  page: new IV.Vector(e.pageX, e.pageY),
                  shift: false };
        IV.raiseEvent("view-mousemove", o);
        IV.render();
    });
    view_elem.addEventListener('touchend', function(e) {
        var offsetX = e.changedTouches[0].pageX - $("#view").offset().left;
        var offsetY = e.changedTouches[0].pageY - $("#view").offset().top;
        var pt = IV.viewarea.transformRAWLocation(offsetX, offsetY);
        var o = { offsetX: pt.x,
                  offsetY: pt.y,
                  pageX: e.pageX,
                  pageY: e.pageY,
                  page: new IV.Vector(e.pageX, e.pageY),
                  shift: false };
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
