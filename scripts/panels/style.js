// iVisDesigner
// Author: Donghao Ren, PKUVIS, Peking University, 2013.04
// See LICENSE.txt for copyright information.

// scripts/panels/style.js
// Implements the style panel.

(function() {
    var $panel = $("#panel-style-container");

    var handlers = [];

    // Bindings for the controls.
    $panel.find("[data-bind]").each(function() {
        $this = $(this);
        var data = $this.data();
        var bind = $this.attr("data-bind");
        handlers.push(function(style) {
            if(data.set) data.set(style.fields[bind]);
        });
        data.changed = function(value) {
            IV.panels.style._set(bind, value);
        };
    });
    // Color selectors.
    $panel.find(".color-selector").each(function() {
        var $this = $(this);
        var data = $this.data();
        data.set = function(value) {
            data.value = value;
            if(!value) {
                $this.css("background-color", "transparent");
                $this.addClass("empty").removeClass("multi");
            } else {
                if(value.type == "plain") {
                    $this.css("background-color", value.obj.toRGBA());
                    $this.removeClass("empty").removeClass("multi");
                } else {
                    $this.css("background-color", "transparent");
                    $this.removeClass("empty").addClass("multi");
                }
            }
        };
        $this.click(function() {
            IV.panels.beginColorSelect($this, data.value, function(value) {
                data.set(value);
                data.changed(value);
            });
        });
    });
    // Color select popup initialization.
    (function() {
        var p = IV.popups["color-selector"];
        var data = p.data();
        var mycolor = new IV.objects.Plain(new IV.Color(0, 0, 0, 1));
        var myalpha = new IV.objects.Number(1);

        p.find('[data-action="ok"]').click(function() {
            if(data.onSelectColor) data.onSelectColor(new IV.objects.CompositeColorAlpha(mycolor, myalpha));
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
                mycolor = new IV.objects.Plain(color);
            });
        });
        p.find(".input-alpha").IVNumericValue(function(val) {
            myalpha = val;
        });
        data.onShow = function(color) {
            if(color) {
                if(color.type == "CompositeColorAlpha") {
                    mycolor = color.color.clone();
                    myalpha = color.alpha.clone();
                } else {
                    mycolor = new IV.objects.Plain(color.obj);
                    myalpha = new IV.objects.Number(color.obj.a);
                }
                p.find(".input-alpha").IVNumericValue(myalpha);
            }
        };
    })();
    IV.panels.beginColorSelect = function(anchor, cur_color, callback) {
        var ref = IV.popups.show("color-selector", anchor, 200, 200, cur_color);
        ref.onSelectColor = function(color) {
            callback(color);
        };
    };

    var currentStyle = { };

    IV.panels.style = {
        listener: function() { },
        loadStyle: function(style) {
            if(style.type == "plain") {
                currentStyle = new IV.objects.Composite(style.obj, true);
            } else {
                currentStyle = style.clone();
            }
            handlers.forEach(function(f) {
                f(currentStyle);
            });
        },
        getStyle: function() {
            return currentStyle.clone();
        },
        createStyle: function() {
            return this.getStyle();
        },
        // This is to be called by the controls.
        _set: function(key, value) {
            currentStyle.fields[key] = value;
            this.listener(currentStyle);
        },
        setListener: function(f) {
            this.listener = f;
        }
    };

    IV.panels.style.loadStyle(new IV.objects.Plain({
        fill_style: new IV.Color(0, 0, 0, 1),
        stroke_style: new IV.Color(0, 0, 0, 1),
        width: 1,
        radius: 1
    }));
})();
