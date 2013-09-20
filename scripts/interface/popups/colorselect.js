IV.popups.ColorSelect = function() {
    var data = IV.popups.create();

    var p = data.selector;
    p.children(".content").html($("#popup-color-select").html());
    p.attr("data-popup", "color-selector");

    data.addActions([ "ok", "cancel" ])
        .prepend($('<span class="btn" data-action="remove">Remove</span>'))
        .prepend($('<span class="selected-color"><span class="selected-color-inner"></span></span>'));

    var mycolor = null;
    var inp_r = p.find(".input-red");
    var inp_g = p.find(".input-green");
    var inp_b = p.find(".input-blue");
    var refresh = function() {
        p.find(".selected-color-inner").css({
            "background-color": mycolor ? mycolor.toRGBA() : "transparent"
        });
        p.find(".predefined span[data-color]").each(function() {
            var c = $(this).attr("data-color");
            var color = IV.parseColorHEX(c.substr(1));
            if(mycolor) {
                if(color.r == mycolor.r && color.g == mycolor.g && color.b == mycolor.b) {
                    $(this).addClass("active");
                } else {
                    $(this).removeClass("active");
                }
            } else {
                $(this).removeClass("active");
            }
        });
        if(mycolor) {
            inp_r.IVInputNumeric(mycolor.r);
            inp_g.IVInputNumeric(mycolor.g);
            inp_b.IVInputNumeric(mycolor.b);
        }
    };
    data.onOk = function() {
        if(data.onSelectColor) data.onSelectColor(mycolor ? mycolor.clone() : null);
        data.hide();
    };
    data.onCancel = function() {
        data.hide();
    };
    p.find('[data-action="remove"]').click(function() {
        mycolor = null;
        refresh();
        if(data.onSelectColor) data.onSelectColor(mycolor ? mycolor.clone() : null);
        data.hide();
    });
    p.find(".predefined").each(function() {
        var ht = $(this).html().trim();
        ht = ht.split(",").map(function(x) {
            return '<span data-color="#' + x.trim() + '"></span>';
        }).join("");
        $(this).html(ht);
    });
    p.find(".predefined span[data-color]").each(function() {
        var c = $(this).attr("data-color");
        var color = IV.parseColorHEX(c.substr(1));
        $(this).css("background-color", color.toRGBA());
        $(this).click(function() {
            if(!mycolor) mycolor = new IV.Color(0, 0, 0, 1);
            mycolor.r = color.r;
            mycolor.g = color.g;
            mycolor.b = color.b;
            if(mycolor) hclpicker_load(mycolor);
            refresh();
        });
    });
    p.find(".input-alpha").IVInputNumeric(function(val) {
        if(!mycolor) mycolor = new IV.Color(0, 0, 0, 1);
        mycolor.a = val;
        refresh();
    });
    inp_r.IVInputNumeric(function(val) {
        if(!mycolor) mycolor = new IV.Color(0, 0, 0, 1);
        val = Math.floor(val);
        if(val < 0) val = 0; if(val > 255) val = 255;
        mycolor.r = val;
        refresh();
        if(mycolor) hclpicker_load(mycolor);
    });
    inp_g.IVInputNumeric(function(val) {
        if(!mycolor) mycolor = new IV.Color(0, 0, 0, 1);
        val = Math.floor(val);
        if(val < 0) val = 0; if(val > 255) val = 255;
        mycolor.g = val;
        refresh();
        if(mycolor) hclpicker_load(mycolor);
    });
    inp_b.IVInputNumeric(function(val) {
        if(!mycolor) mycolor = new IV.Color(0, 0, 0, 1);
        val = Math.floor(val);
        if(val < 0) val = 0; if(val > 255) val = 255;
        mycolor.b = val;
        refresh();
        if(mycolor) hclpicker_load(mycolor);
    });
    data.onShow = function(color) {
        if(color) {
            mycolor = new IV.Color(color.r, color.g, color.b, color.a);
            p.find(".input-alpha").IVInputNumeric(mycolor.a);
            refresh();
        } else {
            mycolor = null;
            p.find(".input-alpha").IVInputNumeric(1);
            refresh();
        }
        if(mycolor) hclpicker_load(mycolor);
    };
    var hclpicker_load;
    (function() {
        // HCL picker.
        var H_range = 360;
        var C_range = 140;
        var L_range = 100;
        var mode = "L";
        var px = 0.5, py = 0.5, pl = 0.5; // selected positins, [0, 1]
        var get_hcl = function(px, py, pl) {
            var h, c, l;
            var mp;
            if(mode == "C") mp = [ px, 1 - pl, 1 - py ];
            if(mode == "H") mp = [ 1 - pl, px, 1 - py ];
            if(mode == "L") mp = [ px, 1 - py, 1 - pl ];
            h = mp[0] * H_range;
            c = mp[1] * C_range;
            l = mp[2] * L_range;
            return [ h, c, l ];
        };
        var from_hcl = function(h, c, l) {
            var a0 = h / H_range;
            var a1 = c / C_range;
            var a2 = l / L_range;
            if(mode == "C") return [ a0, 1 - a2, 1 - a1 ];
            if(mode == "H") return [ a1, 1 - a2, 1 - a0 ];
            if(mode == "L") return [ a0, 1 - a1, 1 - a2 ];
        };
        var get_color = function(px, py, pl) {
            var hcl = get_hcl(px, py, pl);
            var c = chroma.lch(hcl[2], hcl[1], hcl[0]);
            return c;
        };
        var cpicker = p.find(".picker-canvas")[0];
        var cside = p.find(".picker-canvas-side")[0];
        var ctx_picker = cpicker.getContext("2d");
        var ctx_side = cside.getContext("2d");
        var cpicker_w = 250;
        var cpicker_h = 100;
        var cside_h = 100;
        var draw_hcl_picker = function() {
            ctx_picker.clearRect(0, 0, cpicker.width, cpicker.height);
            ctx_side.clearRect(0, 0, cside.width, cside.height);
            var idata = ctx_picker.createImageData(cpicker.width, cpicker.height);
            for(var i = 0; i < idata.width; i++) {
                for(var j = 0; j < idata.height; j++) {
                    var color = get_color(i / (idata.width - 1), j / (idata.height - 1), pl);
                    if(color) {
                        var rgb = color.rgb();
                        var k = idata.width * 4 * j + i * 4;
                        idata.data[k] = rgb[0];
                        idata.data[k + 1] = rgb[1];
                        idata.data[k + 2] = rgb[2];
                        idata.data[k + 3] = 255;
                    }
                }
            }
            ctx_picker.putImageData(idata, 0, 0);
            for(var i = 0; i < cside.height; i++) {
                var color = get_color(px, py, i / (cside.height - 1));
                if(color) {
                    ctx_side.fillStyle = color.hex();
                    ctx_side.fillRect(0, i, cside.width, 1);
                }
            }
            p.find(".xy-marker").css({
                left: (px * cpicker_w - 0.5 - 2) + "px",
                top: (py * cpicker_h - 0.5 - 2) + "px",
            });
            p.find(".l-marker").css({
                top: (pl * cside_h - 0.5 - 1.5) + "px"
            });
        };
        var picker_mouse_mode = null;
        var picker_move_f = function(e) {
            if(picker_mouse_mode == "xy") {
                var x = e.pageX - $(cpicker).offset().left;
                var y = e.pageY - $(cpicker).offset().top;
                px = (x + 0.5) / cpicker_w;
                py = (y + 0.5) / cpicker_h;
                if(px < 0) px = 0; if(px > 1) px = 1;
                if(py < 0) py = 0; if(py > 1) py = 1;
                draw_hcl_picker();
                mycolor = IV.parseColorChroma(get_color(px, py, pl));
                refresh();
            }
            if(picker_mouse_mode == "l") {
                var y = e.pageY - $(cside).offset().top;
                pl = (y + 0.5) / cside_h;
                if(pl < 0) pl = 0; if(pl > 1) pl = 1;
                draw_hcl_picker();
                mycolor = IV.parseColorChroma(get_color(px, py, pl));
                refresh();
            }
        };
        $(cpicker).parent().mousedown(function(e) {
            picker_mouse_mode = "xy";
            picker_move_f(e);
            $(window).bind("mousemove", picker_move_f);
            $(window).bind("mouseup", picker_up);
        });
        $(cside).parent().mousedown(function(e) {
            picker_mouse_mode = "l";
            picker_move_f(e);
            $(window).bind("mousemove", picker_move_f);
            $(window).bind("mouseup", picker_up);
        });
        var picker_up = function() {
            if(picker_mouse_mode) {
                picker_mouse_mode = null;
                if(mycolor) hclpicker_load(mycolor);
            }
            $(window).unbind("mousemove", picker_move_f);
            $(window).unbind("mouseup", picker_up);
        };
        p.find(".hcl-picker .method").change(function() {
            var val = $(this).val();
            var hcl = get_hcl(px, py, pl);
            mode = val;
            var xyl = from_hcl(hcl[0], hcl[1], hcl[2]);
            px = xyl[0]; py = xyl[1]; pl = xyl[2];
            draw_hcl_picker();
        });
        hclpicker_load = function(color) {
            var lch = color.toChroma().lch();
            while(lch[2] > 360) lch[2] -= 360;
            while(lch[2] < 0) lch[2] += 360;
            var xyl = from_hcl(lch[2], lch[1], lch[0]);
            px = xyl[0]; py = xyl[1]; pl = xyl[2];
            draw_hcl_picker();
        };
        draw_hcl_picker();
    })();

    refresh();

    return data;
};

IV.popups.beginColorSelect = function(anchor, cur_color, callback) {
    var d = IV.popups.ColorSelect();
    var ref = d.show(anchor, 302, 220, cur_color);
    ref.onSelectColor = function(color) {
        callback(color);
    };
    return d;
};
