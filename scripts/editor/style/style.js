// Style editor.

(function() {

var Style = Editor.Style = { };

IV.makeEventSource(Style);

var current = new IV.objects.PathStyle;

Style.beginEditStyle = function(style) {
    current = style;
    render();
};

Style.endEditStyle = function() {
    if(current) current = current.clone();
    render();
};

var render = function() {
    var container = $("#panel-style-display");
    container.children().remove();
    if(!current) return;

    var render_object_value = function(item, callback) {
        if(item.type == "Plain") {
            var obj = item.obj;
            if(obj.constructor == Number) {
                return $("<input />")
                    .addClass("plain-number")
                    .val(obj.toString())
                    .bind("keydown focusout", function(e) {
                        if(e.type == "focusout" || e.which == 13) {
                            var num = parseFloat($(this).val());
                            if(num == num) item.obj = num;
                            $(this).val(item.obj.toString());
                            $(this).removeClass("dirty");
                            callback();
                        } else if($(this).val() != item.obj.toString()) {
                            $(this).addClass("dirty");
                        }
                    });
            }
            if(obj.constructor == String) {
                return $("<input />")
                    .addClass("plain-string")
                    .val(obj)
                    .bind("keydown focusout", function(e) {
                        if(e.type == "focusout" || e.which == 13) {
                            item.obj = $(this).val;
                            $(this).removeClass("dirty");
                            callback();
                        } else if($(this).val() != item.obj) {
                            $(this).addClass("dirty");
                        }
                    });
            }
            if(obj instanceof IV.Vector) {
                return $("<span />").addClass("plain-vector").text(obj.x + ", " + obj.y);
            }
            if(obj instanceof IV.Color) {
                return $("<span />")
                    .addClass("plain-color")
                    .css("background-color", obj.toRGBA())
                    .click(function() {
                        var $this = $(this);
                        IV.popups.beginColorSelect($(this), item.obj, function(new_color) {
                            if(new_color == null) new_color = new IV.Color(0, 0, 0, 0);
                            item.obj = new_color;
                            $this.css("background-color", item.obj.toRGBA());
                            callback();
                        });
                    });
            }
        }
    };
    var render_field = function(name, item, type, callback) {
        var target = $("<div />").addClass("field group");
        var iName = $("<span />").addClass("name").append($("<span />").text(name));
        var iVal = $("<span />").addClass("val").append(render_object_value(item, function() {
            callback();
        }));
        target.append(iName);
        target.append(iVal);
        return target;
    };

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

    var style_changed = function() {
        Style.raise("changed");
    };

    current.actions.forEach(function(act) {
        var target = $("<div />").addClass("item-action");
        var cap = "Unknown";
        if(act.type == "stroke") {
            container.append(render_caption("Stroke"));
            target.append(render_field("Color", act.color, "color", style_changed));
            target.append(render_field("Width", act.width, "color", style_changed));
        }
        if(act.type == "fill") {
            container.append(render_caption("Fill"));
            target.append(render_field("Color", act.color, "color", style_changed));
        }
        container.append(target);
    });
};

render();

})();
