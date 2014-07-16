//. iVisDesigner - File: scripts/editor/ui.js
//. Copyright 2013-2014 Donghao Ren
//. University of California, Santa Barbara, Peking University
//. See LICENSE.md for more information.

// Panels
IV.addListener("command:panels.reset", function() {
    $("#panel-schema").IVPanel({ left: 10, top: 10, width: 180, height: 400 }).IVPanel("show");
    $("#panel-objects").IVPanel({ left: 10, top: 420, width: 180, bottom: 10 }).IVPanel("show");
    $("#panel-tools").IVPanel({ left: 200, top: 10, right: 220, height: 38, min_height: 38 }).IVPanel("show");
    $("#panel-log").IVPanel({ left: 10, bottom: 10, right: 10, height: 100 }).IVPanel("hide");
    $("#panel-page").IVPanel({ vcenter: 0, bottom: 200, top: 60, width: 600 }).IVPanel("hide");
    $("#panel-style").IVPanel({ right: 10, top: 10, width: 200, height: 300 }).IVPanel("show");
    $("#panel-property").IVPanel({ right: 10, top: 320, width: 200, bottom: 10 }).IVPanel("show");
    $("#panel-inspector").IVPanel({ right: 220, bottom: 10, width: 200, height: 200 }).IVPanel("hide");
});
IV.raiseEvent("command:panels.reset");

IV.add("status", "string");
IV.listen("status", function(s) {
    $(".status-text").text(s);
});

(function() {
    // Mouse events.
    var mouse_state = false;

    IV.isTrackingMouse = function() { return mouse_state; }

    $(window).contextmenu(function(e) {
        if(e.target.tagName == "INPUT") return;
        e.preventDefault();
    });

    $("#view").mousedown(function(e) {
        var offsetX = e.pageX - $("#view").offset().left;
        var offsetY = e.pageY - $("#view").offset().top;
        var pt = new IV.Vector(offsetX, offsetY);
        pt = Editor.renderer.getOffsetFromScreen(pt);
        var o = { offset: pt,
                  page: new IV.Vector(e.pageX, e.pageY),
                  shift: e.shiftKey };
        mouse_state = true;
        Editor.raise("view:mousedown", o);
        Editor.renderer.render();
    });
    $(window).mousemove(function(e) {
        var offsetX = e.pageX - $("#view").offset().left;
        var offsetY = e.pageY - $("#view").offset().top;
        var pt = new IV.Vector(offsetX, offsetY);
        pt = Editor.renderer.getOffsetFromScreen(pt);
        var o = { offset: pt,
                  page: new IV.Vector(e.pageX, e.pageY),
                  shift: e.shiftKey };
        var w = $("#view").width();
        var h = $("#view").height();
        var insideView = offsetX >= 0 && offsetX < w && offsetY >= 0 && offsetY < h;
        if(mouse_state || insideView) {
            Editor.raise("view:mousemove", o);
            Editor.renderer.render();
        }
        return true;
    });
    $(window).mouseup(function(e) {
        var offsetX = e.pageX - $("#view").offset().left;
        var offsetY = e.pageY - $("#view").offset().top;
        var pt = new IV.Vector(offsetX, offsetY);
        pt = Editor.renderer.getOffsetFromScreen(pt);
        var o = { offset: pt,
                  page: new IV.Vector(e.pageX, e.pageY),
                  shift: e.shiftKey };
        mouse_state = false;
        Editor.raise("view:mouseup", o);
        Editor.renderer.render();
        return true;
    });
    // For iPad like platforms:
    // attach the touchstart, touchmove, touchend event listeners.
    var view_elem = document.getElementById("view");
    var touch_state = false;
    view_elem.addEventListener('touchstart',function(e) {
        //if(e.target != view_elem && e.target != canvas_front) return;
        e.preventDefault();
        touch_state = true;
        var offsetX = e.touches[0].pageX - $("#view").offset().left;
        var offsetY = e.touches[0].pageY - $("#view").offset().top;
        var pt = new IV.Vector(offsetX, offsetY);
        pt = Editor.renderer.getOffsetFromScreen(pt);
        var o = { offset: pt,
                  page: new IV.Vector(e.pageX, e.pageY),
                  shift: false };
        Editor.raise("view:mousedown", o);
        Editor.renderer.render();
    });
    view_elem.addEventListener('touchmove',function(e) {
        var offsetX = e.touches[0].pageX - $("#view").offset().left;
        var offsetY = e.touches[0].pageY - $("#view").offset().top;
        var pt = new IV.Vector(offsetX, offsetY);
        pt = Editor.renderer.getOffsetFromScreen(pt);
        var o = { offset: pt,
                  page: new IV.Vector(e.pageX, e.pageY),
                  shift: false };
        Editor.raise("view:mousemove", o);
        Editor.renderer.render();
    });
    view_elem.addEventListener('touchend', function(e) {
        var offsetX = e.changedTouches[0].pageX - $("#view").offset().left;
        var offsetY = e.changedTouches[0].pageY - $("#view").offset().top;
        var pt = new IV.Vector(offsetX, offsetY);
        pt = Editor.renderer.getOffsetFromScreen(pt);
        var o = { offset: pt,
                  page: new IV.Vector(e.pageX, e.pageY),
                  shift: false };
        Editor.raise("view:mouseup", o);
        Editor.renderer.render();
    });

    IV.log = function(str) {
        var s;
        if(typeof(str) == "string") s = str;
        else s = JSON.stringify(str, null, " ");
        $("#log-container > ul").prepend($("<li></li>").append($("<pre></pre>").text(s)));
    };


    Editor.status = {
        start: function() {
            $(".status-text").html("");
            return this;
        },
        add: function(info) {
            this.append(info);
            return this;
        },
        append: function(info) { // append will return a descriptor, while add return the obj.
            var sp = $("<span />").text(info);
            $(".status-text").append(sp);
            var ctx = {
                set: function(info) {
                    sp.text(info);
                }
            };
            return ctx;
        },
        end: function() {
            $(".status-text").html("");
            return this;
        }
    };

    var editor_messages = {};

    Editor.showMessage = function(str) {
        var s;
        if(editor_messages[str]) {
            s = editor_messages[str];
            clearTimeout(s.data().timeout);
        } else {
            s = IV._E("div").append(IV._E("span", type ? "msg-" + type : "message", str));
            editor_messages[str] = s;
            $("#editor-messages").append(s);
        }
        s.data().timeout = setTimeout(function() {
            s.remove();
            delete editor_messages[str];
        }, 2000);
    };

    $(window).keydown(function(e) {
        if(e.keyCode == 8 && e.target == document.body) {
            e.preventDefault();
        }
    });
    $(document).bind('touchmove', function(e) {
        e.preventDefault();
    });
})();
