// First we define functions to create elements for primitive values.
// Including Color, String, Number, Path, etc.

var primitives = { };

primitives.Color = function(curr, args, callback) {
    return $("<span />")
        .addClass("plain-color")
        .append($("<span />").css("background-color", curr.toRGBA()))
        .click(function() {
            var $this = $(this);
            IV.popups.beginColorSelect($(this), curr, function(new_color) {
                if(new_color == null) new_color = new IV.Color(0, 0, 0, 0);
                new_color = callback(new_color);
                $this.children("span").css("background-color", new_color.toRGBA());
                curr = new_color;
            });
        });
};

primitives.String = function(curr, args, callback) {
    if(!args) {
        var val0 = curr;
        return $("<input />")
            .addClass("plain-string")
            .val(curr)
            .bind("keydown focusout", function(e) {
                if(e.type == "focusout" || e.which == 13) {
                    $(this).removeClass("dirty");
                    val0 = $(this).val();
                    val0 = callback(val0);
                    $(this).text(val0);
                } else if($(this).val() != val0) {
                    $(this).addClass("dirty");
                }
            });
    } else if(args instanceof Array) {
        return $("<span />")
            .addClass("btn")
            .append($("<span />").text(curr + " "))
            .append($('<i class="icon-caret-down" /></i>'))
            .click(function() {
                var $this = $(this);
                IV.popups.beginContextMenu($this, args, function(val) {
                    val = callback(val);
                    $this.children("span").text(val + " ");
                    curr = val;
                });
            });
    }
};

primitives.Number = function(curr, args, callback) {
    var val0 = curr;
    var inp = $("<input />")
        .addClass("plain-string")
        .val(curr)
        .bind("keydown focusout", function(e) {
            if(e.type == "focusout" || e.which == 13) {
                $(this).removeClass("dirty");
                val0 = +$(this).val();
                val0 = +callback(val0);
                $(this).val(val0);
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
                val0 = +callback(v);
                inp.val(val0);
            };
            var mouseup = function(e2) {
                $(window).unbind("mousemove", mousemove);
                $(window).unbind("mouseup", mouseup);
            };
            $(window).bind("mousemove", mousemove);
            $(window).bind("mouseup", mouseup);
        });
    return $("<span />").addClass("input-group").append(inp).append(btn);
};
primitives.Select = function(curr, args, callback) {
    var s = $("<select />");

};

primitives.Path = function(curr, args, callback) {
    return $("<span />")
        .addClass("btn plain-path")
        .append($('<span />').text('¶'))
        .append($('<span />').addClass("text").text(" " + curr.toString()))
        .click(function() {
            var $this = $(this);
            var popup = IV.popups.PathSelect();
            popup.onSelectPath = function(path, ref) {
                var new_path = new IV.Path(path);
                var str = callback(new_path).toString();
                var rstr = str;
                if(rstr.length > 18) {
                    rstr = "..." + rstr.substr(str.length - 12);
                }
                $this.children(".text").text(" " + rstr).attr("title", str);
            };
            popup.onHide = function() {
                $this.removeClass("active");
            };
            popup.show($this, 200, 150);
            $this.addClass("active");
        });
};

// Plain value.
var render_plain_value = function(item, args, callback) {
    var obj = item.obj;
    if(obj.constructor == Number) {
        return primitives.Number(item.obj, args, function(new_val) {
            item.obj = new_val;
            callback();
            return new_val;
        });
    }
    if(obj.constructor == String) {
        return primitives.String(item.obj, args, function(new_val) {
            item.obj = new_val;
            callback();
            return new_val;
        });
    }
    if(obj instanceof IV.Vector) {
        return $("<span />").addClass("plain-vector").text("(" + obj.x + ", " + obj.y + ")");
    }
    if(obj instanceof IV.Color) {
        return primitives.Color(item.obj, args, function(new_val) {
            item.obj = new_val;
            callback();
            return new_val;
        });
    }
};

// Plain/Object value.
var render_object_value = function(item, args, callback) {
    if(item instanceof IV.Path) {
        return primitives.Path(item, args, function(new_val) {
            callback(new_val);
            return new_val;
        });
    }
    if(item.type == "Plain") {
        return render_plain_value(item, args, callback);
    }
    if(item.type == "ColorLinear") {
        var c1 = primitives.Color(item.color1, null, function(new_val) {
            item.color1 = new_val;
            item.propertyUpdate();
            callback();
            return new_val;
        });
        var c2 = primitives.Color(item.color2, null, function(new_val) {
            item.color2 = new_val;
            item.propertyUpdate();
            callback();
            return new_val;
        });
        var path = primitives.Path(item.path, null, function(new_val) {
            var stat = IV.Path.computeBasicStatistics(new_val, IV.editor.data);
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
        var c1 = primitives.Number(item.num1, null, function(new_val) {
            item.num1 = new_val;
            item.propertyUpdate();
            callback();
            return new_val;
        });
        var c2 = primitives.Number(item.num2, null, function(new_val) {
            item.num2 = new_val;
            item.propertyUpdate();
            callback();
            return new_val;
        });
        var path = primitives.Path(item.path, null, function(new_val) {
            var stat = IV.Path.computeBasicStatistics(new_val, IV.editor.data);
            item.path = new_val;
            item.min = stat.min;
            item.max = stat.max;
            callback();
            return new_val;
        });
        var t = $("<tr />");
        t.append($("<td />").append(c1))
         .append($("<td />").text(" - "))
         .append($("<td />").append(c2));
        var r = $("<span />");
        r.append($("<table />").addClass("linear-ftf").append(t))
         .append(path);
        return r;
    }
    var r = $("<span />").text("[" + item.type + "]");
    return r;
};

// Render a property field's value part.
var render_field = function(name, item, type, callback, args) {
    var target = $("<div />").addClass("field group");
    var iName = $("<span />").addClass("name").append($("<span />").text(name));
    var iVal = $("<span />").addClass("val").append(render_object_value(item, args, callback));
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
                callback(new IV.objects.Plain(new IV.Color(0, 0, 0, 1)));
            }
            if(val == "Linear") {
                callback(new IV.objects.ColorLinear(new IV.Path(), new IV.Color(0, 0, 0, 1), new IV.Color(255, 255, 255, 1)));
            }
        });
    }
    if(type == "number") {
        make_switch_button([ "Plain", "Linear" ], function(val) {
            if(val == "Plain") {
                callback(new IV.objects.Plain(0));
            }
            if(val == "Linear") {
                callback(new IV.objects.NumberLinear(new IV.Path(), 0, 1, 0, 1));
            }
        });
    }
    return target;
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
