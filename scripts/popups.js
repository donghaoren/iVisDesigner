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
// Color select popup initialization.
(function() {
    var p = IV.popups["color-selector"];
    var data = p.data();
    var mycolor = new IV.Color(0, 0, 0, 1);

    p.find('[data-action="ok"]').click(function() {
        if(data.onSelectColor) data.onSelectColor(mycolor ? mycolor.clone() : null);
        data.hide();
    });
    p.find('[data-action="cancel"]').click(function() {
        data.hide();
    });
    p.find(".predefined span[data-color]").each(function() {
        var c = $(this).attr("data-color");
        var color = IV.parseColorHEX(c.substr(1));
        $(this).css("background-color", color.toRGBA());
        $(this).click(function() {
            mycolor.r = color.r;
            mycolor.g = color.g;
            mycolor.b = color.b;
        });
    });
    p.find(".input-alpha").IVInputNumeric(function(val) {
        mycolor.a = val;
    });
    data.onShow = function(color) {
        if(color) {
            mycolor = new IV.Color(color.r, color.g, color.b, color.a);
            p.find(".input-alpha").IVInputNumeric(mycolor.a);
        }
    };
    IV.popups.beginColorSelect = function(anchor, cur_color, callback) {
        var ref = IV.popups.show("color-selector", anchor, 200, 200, cur_color);
        ref.onSelectColor = function(color) {
            callback(color);
        };
    };
})();
