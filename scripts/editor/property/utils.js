// First we define functions to create elements for primitive values.
// Including Color, String, Number, Path, etc.

var primitives = { };

primitives.Color = function(get, set, args) {
    var r = $("<span />")
        .addClass("plain-color")
        .append($("<span />"))
        .click(function() {
            var $this = $(this);
            var cc = get();
            IV.popups.beginColorSelect($this, cc, function(new_color) {
                if(!new_color) new_color = new IV.Color(0, 0, 0, 0);
                set(new_color);
                reload();
            });
        });
    var reload = function() {
        var c = get();
        if(c == null)
            r.children("span").css("background-color", "transparent");
        else
            r.children("span").css("background-color", c.toRGBA());
    };
    reload();
    r.data().reload = reload;
    return r;
};

primitives.String = function(get, set, args) {
    if(!args) {
        var val0;
        var r =  $("<input />")
            .addClass("plain-string")
            .bind("keydown focusout", function(e) {
                if(e.type == "focusout" || e.which == 13) {
                    $(this).removeClass("dirty");
                    set($(this).val());
                    reload();
                } else if($(this).val() != val0) {
                    $(this).addClass("dirty");
                }
            });
        var reload = function() {
            val0 = get();
            r.val(val0);
        };
        reload();
        r.data().reload = reload;
        return r;
    } else if(args instanceof Array) {
        var r = $("<span />")
            .addClass("btn")
            .append($("<span />"))
            .append($('<i class="icon-caret-down" /></i>'))
            .click(function() {
                var $this = $(this);
                IV.popups.beginContextMenu($this, args, function(val) {
                    set(val);
                    reload();
                });
            });
        var reload = function() {
            var val0 = get();
            r.children("span").text(val0 + " ");
        };
        reload();
        r.data().reload = reload;
        return r;
    }
};

primitives.Number = function(get, set, args) {
    var val0;
    var r;
    var inp = $("<input />")
        .addClass("plain-string")
        .bind("keydown focusout", function(e) {
            if(e.type == "focusout" || e.which == 13) {
                $(this).removeClass("dirty");
                val0 = +$(this).val();
                set(val0);
                reload();
            } else if($(this).val() != val0) {
                $(this).addClass("dirty");
            }
        });
    var btn = $("<span />")
        .addClass("btn")
        .text("↕")
        .bind("mousedown", function(e) {
            var v0 = +val0;
            var vmin = -1e100;
            var vmax = 1e100;
            if(args) {
                if(args.min !== undefined) vmin = args.min;
                if(args.max !== undefined) vmax = args.max;
            }
            var vs = (Math.abs(v0) + 0.01) / 100;
            var mousemove = function(e2) {
                var dy = e.pageY - e2.pageY;
                var v = v0 + dy * vs;
                v = +v.toFixed(3);
                if(v < vmin) v = vmin;
                if(v > vmax) v = vmax;
                set(v);
                reload();
            };
            var mouseup = function(e2) {
                $(window).unbind("mousemove", mousemove);
                $(window).unbind("mouseup", mouseup);
            };
            $(window).bind("mousemove", mousemove);
            $(window).bind("mouseup", mouseup);
        });
    var r = $("<span />").addClass("input-group").append(inp).append(btn);
    var reload = function() {
        val0 = get();
        inp.val(val0);
    };
    reload();
    r.data().reload = reload;
    return r;
};

primitives.Path = function(get, set, args) {
    var r = $("<span />")
        .addClass("btn plain-path")
        .append($('<span />').text('¶'))
        .append($('<span />').addClass("text"))
        .click(function() {
            var $this = $(this);
            var popup = IV.popups.PathSelect();
            popup.onSelectPath = function(path, ref) {
                var new_path = new IV.Path(path);
                set(new_path);
                if(r.data().reload)
                    reload();
            };
            popup.onHide = function() {
                $this.removeClass("active");
            };
            popup.show($this, 200, 150);
            $this.addClass("active");
        });
    var reload = function() {
        val0 = get();
        r.children(".text").text(" " + val0.toString());
    };
    reload();
    r.data().reload = reload;
    return r;
};

// Plain value.
var render_plain_value = function(item, args, callback) {
    var obj = item.obj;
    if(obj.constructor == Number) {
        return primitives.Number(function() { return item.obj; }, function(new_val) {
            item.obj = new_val;
            callback();
            return new_val;
        }, args);
    }
    if(obj.constructor == String) {
        return primitives.String(function() { return item.obj; }, function(new_val) {
            item.obj = new_val;
            callback();
            return new_val;
        }, args);
    }
    if(obj instanceof IV.Vector) {
        return $("<span />").addClass("plain-vector").text("(" + obj.x + ", " + obj.y + ")");
    }
    if(obj instanceof IV.Color) {
        return primitives.Color(function() { return item.obj; }, function(new_val) {
            item.obj = new_val;
            callback();
            return new_val;
        }, args);
    }
};

// Object value.
var render_object_value = function(item, args, callback) {
    if(item.constructor == Number) {
        return primitives.Number(function() { return item; }, function(new_val) {
            callback(new_val);
            return new_val;
        }, args);
    }
    if(item.constructor == String) {
        return primitives.String(function() { return item; }, function(new_val) {
            callback(new_val);
            return new_val;
        }, args);
    }
    if(item.constructor == Boolean) {
        return primitives.String(function() { return item ? "true" : "false"; }, function(new_val) {
            new_val = new_val == "true" ? true : false
            callback(new_val);
            return new_val;
        }, ["true", "false"]);
    }
    if(item instanceof IV.Path) {
        return primitives.Path(function() { return item; }, function(new_val) {
            callback(new_val);
            return new_val;
        }, args);
    }
    if(item.type == "Plain") {
        return render_plain_value(item, args, callback);
    }
    if(item.type == "ColorLinear") {
        var c1 = primitives.Color(function() { return item.color1; }, function(new_val) {
            item.color1 = new_val;
            item.propertyUpdate();
            callback();
            return new_val;
        });
        var c2 = primitives.Color(function() { return item.color2; }, function(new_val) {
            item.color2 = new_val;
            item.propertyUpdate();
            callback();
            return new_val;
        });
        var path = primitives.Path(function() { return item.path; }, function(new_val) {
            var stat = Editor.computePathStatistics(new_val);
            item.path = new_val;
            item.min = stat.min;
            item.max = stat.max;
            callback();
            return new_val;
        });
        var r = $("<span />");
        r.append(c1)
         .append("<span> - </span>")
         .append(c2)
         .append("<br />")
         .append(path);
        return r;
    }
    if(item.type == "NumberLinear") {
        var c1 = primitives.Number(function() { return item.num1; }, function(new_val) {
            item.num1 = new_val;
            item.propertyUpdate();
            callback();
            return new_val;
        });
        var c2 = primitives.Number(function() { return item.num2; }, function(new_val) {
            item.num2 = new_val;
            item.propertyUpdate();
            callback();
            return new_val;
        });
        var path = primitives.Path(function() { return item.path; }, function(new_val) {
            var stat = Editor.computePathStatistics(new_val);
            item.path = new_val;
            item.min = stat.min;
            item.max = stat.max;
            callback();
            return new_val;
        });
        var vmin = primitives.Number(function() { return item.min; }, function(new_val) {
            item.min = new_val;
            item.propertyUpdate();
            callback();
            return new_val;
        });
        var vmax = primitives.Number(function() { return item.max; }, function(new_val) {
            item.max = new_val;
            item.propertyUpdate();
            callback();
            return new_val;
        });
        var t1 = $("<tr />");
        t1.append($("<td />").append(c1))
          .append($("<td />").text(" - "))
          .append($("<td />").append(c2));
        var t2 = $("<tr />");
        t2.append($("<td />").append(vmin))
          .append($("<td />").text(" - "))
          .append($("<td />").append(vmax));
        var r = $("<span />");
        r.append($("<table />").addClass("linear-ftf").append(t1))
         .append($("<table />").addClass("linear-ftf").append(t2))
         .append(path);
        return r;
    }
    if(!item.name) {
        return $("<span />").addClass("small").text("[" + item.type + "]");
    } else {
        return $("<span />").addClass("small").text(item.name).append(
            $("<span />").addClass("gray").text(" " + item.type)
        );
    }
    return r;
};

// Render a property field's value part.
var render_property_field = function(item) {
    var target = $("<div />").addClass("field group");
    var iName = $("<span />").addClass("name").append($("<span />").text(item.name));
    var iVal = $("<span />").addClass("val");
    var type = item.type;
    var reload_item = function(val) {
        if(val !== undefined) item.set(val);
        iVal.children().remove();
        iVal.append(render_object_value(item.get(), item.args, function(new_val) {
            if(new_val !== undefined) {
                item.set(new_val);
                reload_item();
            }
            Editor.renderer.trigger();
            Editor.renderer.render();
        }));

    };
    target.append(iName);
    target.append(iVal);

    var make_switch_button = function(list, callback) {
        target.append(
          $('<span />')
            .append($('<i class="icon-list-ul" /></i>'))
            .addClass("multi btn").click(function() {
                IV.popups.beginContextMenu($(this), list, callback);
            })
        );
    };

    if(type == "color") {
        make_switch_button([ "Plain", "Linear" ], function(val) {
            if(val == "Plain") {
                reload_item(new IV.objects.Plain(new IV.Color(0, 0, 0, 1)));
            }
            if(val == "Linear") {
                reload_item(new IV.objects.ColorLinear(new IV.Path(), new IV.Color(0, 0, 0, 1), new IV.Color(255, 255, 255, 1)));
            }
        });
    }
    if(type == "number") {
        make_switch_button([ "Plain", "Linear" ], function(val) {
            if(val == "Plain") {
                reload_item(new IV.objects.Plain(0));
            }
            if(val == "Linear") {
                reload_item(new IV.objects.NumberLinear(new IV.Path(), 0, 1, 0, 1));
            }
        });
    }
    reload_item();

    return target;
};

var render_field = function(name, item, type, callback, args) {
    return render_property_field({
        name: name,
        get: function() { return item; },
        type: type,
        set: callback,
        args: args
    });
};

// Render the caption of the property field.
var render_caption = function(cap) {
    return $("<div />").addClass("item-caption").text(" " + cap)
        .prepend($('<i class="icon-caret-right" style="display:none" /></i>'))
        .prepend($('<i class="icon-caret-down" /></i>'))
        .click(function() {
            $(this).children(".icon-caret-right").toggle();
            $(this).children(".icon-caret-down").toggle();
            $(this).next().toggle();
        });
};
// Render the caption of the property field.
var render_info = function(cap) {
    return $("<div />").addClass("item-info").text(cap);
};
