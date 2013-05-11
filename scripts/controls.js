// This file can be considered as a set of jQuery plugins, independent of IV's files.

$.fn.IVInputNumeric = function(num) {
    var $this = this;
    var data = $this.data();
    if(!data.is_created) {
        data.delta_scale = 1;
        data.min = 0;
        data.max = 1;
        if($this.attr("data-delta-scale") !== undefined) {
            data.delta_scale = parseFloat($this.attr("data-delta-scale"));
        }
        if($this.attr("data-min") !== undefined) {
            data.min = parseFloat($this.attr("data-min"));
        }
        if($this.attr("data-max") !== undefined) {
            data.max = parseFloat($this.attr("data-max"));
        }
        var input = $('<input type="text" />');
        var btn_show_slider = $('<span/>').html('↕');

        var fire = function() {
            if(data.changed) data.changed(data.get());
        };

        $this.append(input);
        $this.append(btn_show_slider);
        var slider_context = null;
        btn_show_slider.mousedown();
        IV.trackMouseEvents(btn_show_slider, {
            down: function(e) {
                slider_context = { y: e.pageY, val: data.get() };
                if(slider_context.val === null) slider_context.val = 0;
                return;
            },
            move: function(e) {
                if(slider_context) {
                    var dy = -e.pageY + slider_context.y;
                    var newval = slider_context.val + dy * 0.02 * data.delta_scale;
                    if(newval < data.min) newval = data.min;
                    if(newval > data.max) newval = data.max;
                    data.set(newval.toFixed(2));
                    fire();
                }
            },
            up: function() {
                if(slider_context) {
                    slider_context = null;
                    fire();
                }
            }
        });
        input.focusout(fire);
        input.keydown(function(e) {
            if(e.which == 13) {
                fire();
            }
        });
        data.get = function() {
            var v = input.val().trim();
            if(v == "") return null;
            var r = parseFloat(v);
            if(isNaN(r)) return null;
            return r;
        };
        data.set = function(num) {
            if(num === undefined || num === null || isNaN(num)) {
                input.val("");
            } else {
                input.val(num);
            }
        };
        data.set(null);
        data.is_created = true;
    }
    var input = $this.children("input");
    if(num !== undefined) {
        if(typeof(num) == "function") {
            data.changed = num;
        } else {
            data.set(num);
        }
        return this;
    } else {
        return data.get();
    }
};

$.fn.IVInputString = function(str) {
    var $this = this;
    var data = $this.data();
    if(!data.is_created) {
        var input = $('<input type="text" />');
        var fire = function() {
            if(data.changed) data.changed(data.get());
        };
        $this.append(input);
        input.focusout(fire);
        input.keydown(function(e) {
            if(e.which == 13) {
                fire();
            }
        });
        data.get = function() {
            return input.val();
        };
        data.set = function(str) {
            input.val(str);
        };
        if($this.attr("data-default")) data.set($this.attr("data-default"));
        else data.set("");
        data.is_created = true;
    }
    var input = $this.children("input");
    if(str !== undefined) {
        if(typeof(str) == "function") {
            data.changed = str;
        } else {
            data.set(str);
        }
        return this;
    } else {
        return data.get();
    }
};

$.fn.IVInputPath = function(str) {
    var $this = this;
    var data = $this.data();
    if(!data.is_created) {
        var input = $('<span />');
        data.path = null;
        var fire = function() {
            if(data.changed) data.changed(data.get());
        };
        $this.append(input);
        input.click(function() {
            data.set(IV.get("selected-path"));
            fire();
        });
        data.get = function() {
            return data.path;
        };
        data.set = function(str) {
            data.path = str;
            if(!data.path) input.text("[]");
            else input.text("[" + data.path + "]");
        };
        data.set(null);
        data.is_created = true;
    }
    if(str !== undefined) {
        if(typeof(str) == "function") {
            data.changed = str;
        } else {
            data.set(str);
        }
        return this;
    } else {
        return data.get();
    }
};

// This control allows binding to specific data path.
$.fn.IVNumericValue = function(obj) {
    var $this = this;
    var data = $this.data();
    if(!data.is_created) {
        data.val_min = 0;
        data.val_max = 0;
        data.path = null;
        data.min = 0;
        data.max = 1;
        data.delta_scale = 1;
        if($this.attr("data-min") !== undefined) {
            data.min = parseFloat($this.attr("data-min"));
        }
        if($this.attr("data-max") !== undefined) {
            data.max = parseFloat($this.attr("data-max"));
        }
        if($this.attr("data-delta-scale") !== undefined) {
            data.delta_scale = parseFloat($this.attr("data-delta-scale"));
        }
        var onchanged = function() {
            if(data.current_mode == "plain") {
            } else {
                if(data.path === undefined || data.path == "" || data.path === null)
                    data.btn_path.text("-[]-");
                else data.btn_path.text("-[" + data.path + "]-");
            }
            var obj = data.get();
            if(obj && data.changed) {
                data.changed(obj);
            }
        };
        data.num_min = $("<span/>")
            .addClass("input-numeric")
            .IVInputNumeric(function(val) {
                data.val_min = val;
                onchanged();
            });
        data.num_min.data().min = data.min;
        data.num_min.data().max = data.max;
        data.num_min.data().delta_scale = data.delta_scale;
        data.num_max = $("<span/>")
            .addClass("input-numeric")
            .IVInputNumeric(function(val) {
                data.val_max = val;
                onchanged();
            });
        data.num_max.data().min = data.min;
        data.num_max.data().max = data.max;
        data.num_max.data().delta_scale = data.delta_scale;
        data.btn_path = $("<span/>")
            .addClass("path")
            .text("-[]-")
            .click(function() {
                data.path = IV.get("selected-path");
                onchanged();
            });
        data.btn_toggle = $("<span/>")
            .addClass("toggle")
            .html('<i class="icon-angle-right"></i>')
            .click(function() {
                if(data.current_mode == "plain") data.mode_bind();
                else data.mode_plain();
                onchanged();
            });
        data.mode_plain = function() {
            $this.children().detach();
            $this.append(data.btn_toggle);
            $this.append(data.num_min);
            data.current_mode = "plain";
        };
        data.mode_bind = function() {
            $this.children().detach();
            $this.append(data.btn_toggle);
            $this.append(data.num_min);
            $this.append(data.btn_path);
            $this.append(data.num_max);
            data.current_mode = "bind";
        };
        data.is_created = true;
        data.get = function() {
            if(data.current_mode == "plain") {
                if(data.val_min !== null)
                    return new IV.objects.Number(data.val_min);
            } else {
                if(data.path && data.val_min !== null && data.val_max !== null)
                    return new IV.objects.NumberLinear(data.path, data.val_min, data.val_max);
            }
            return null;
        };
        data.set = function(obj) {
            if(!obj) {
                data.path = null;
                data.val_min = null;
                data.val_max = null;
                data.num_min.IVInputNumeric(data.val_min);
                data.num_max.IVInputNumeric(data.val_max);
                data.mode_plain();
                return;
            }
            if(obj.type == "NumberLinear") {
                data.path = obj.path;
                data.val_min = obj.min;
                data.val_max = obj.max;
                data.btn_path.text("-[" + data.path + "]-");
                data.num_min.IVInputNumeric(data.val_min);
                data.num_max.IVInputNumeric(data.val_max);
                data.mode_bind();
            } else {
                data.num_min.IVInputNumeric(obj.obj);
                data.mode_plain();
            }
        };
        data.mode_plain();
    }
    if(obj === undefined) return data.get();
    if(typeof(obj) == "function")
        data.changed = obj;
    else data.set(obj);
    return this;
};

// Color selectors.
$.fn.IVColorPicker = function(obj) {
    var $this = $(this);
    var data = $this.data();
    if(!data.is_created) {
        data.is_created = true;
        data.set = function(color) {
            if(!color) {
                data.color = null;
                $this.css("background-color", "transparent");
                $this.addClass("empty");
            } else {
                data.color = color.clone();
                $this.css("background-color", color.toRGBA());
                $this.removeClass("empty");
            }
        };
        data.get = function() {
            if(data.color)
                return data.color.clone();
            return null;
        };
        $this.click(function() {
            IV.popups.beginColorSelect($this, data.get(), function(value) {
                data.set(value);
                if(data.changed)
                    data.changed(value);
            });
        });
    }
    if(obj === undefined) return data.get();
    if(typeof(obj) == "function") {
        data.changed = obj;
    }
    if(typeof(obj) == "object") {
        data.set(obj);
    }
    return this;
};

$.fn.IVColorValue = function(obj) {
    var $this = this;
    var data = $this.data();
    if(!data.is_created) {
        data.val_min = new IV.Color(0, 0, 0, 1);
        data.val_max = new IV.Color(0, 0, 0, 1);
        data.path = null;
        var onchanged = function() {
            if(data.current_mode == "plain") {
            } else {
                if(data.path === undefined || data.path == "")
                    data.btn_path.text("-[]-");
                else data.btn_path.text("-[" + data.path + "]-");
            }
            var obj = data.get();
            if(obj && data.changed) {
                data.changed(obj);
            }
        };
        data.num_min = $("<span/>")
            .addClass("color-selector")
            .IVColorPicker(function(val) {
                data.val_min = val;
                onchanged();
            });
        data.num_max = $("<span/>")
            .addClass("color-selector")
            .IVColorPicker(function(val) {
                data.val_max = val;
                onchanged();
            });
        data.btn_path = $("<span/>")
            .addClass("path")
            .text("-[]-")
            .click(function() {
                data.path = IV.get("selected-path");
                onchanged();
            });
        data.btn_toggle = $("<span/>")
            .addClass("toggle")
            .html('<i class="icon-angle-right"></i>')
            .click(function() {
                if(data.current_mode == "plain") data.mode_bind();
                else data.mode_plain();
                onchanged();
            });
        data.mode_plain = function() {
            $this.children().detach();
            $this.append(data.btn_toggle);
            $this.append(data.num_min);
            data.current_mode = "plain";
        };
        data.mode_bind = function() {
            $this.children().detach();
            $this.append(data.btn_toggle);
            $this.append(data.num_min);
            $this.append(data.btn_path);
            $this.append(data.num_max);
            data.current_mode = "bind";
        };
        data.is_created = true;
        data.get = function() {
            if(data.current_mode == "plain") {
                return new IV.objects.Plain(data.val_min);
            } else {
                if(data.path && data.val_min && data.val_max)
                    return new IV.objects.ColorLinear(data.path, data.val_min, data.val_max);
            }
            return null;
        };
        data.set = function(obj) {
            if(!obj) {
                data.path = null;
                data.val_min = null;
                data.num_min.IVColorPicker(data.val_min);
                data.val_max = null;
                data.num_max.IVColorPicker(data.val_max);
                data.mode_plain();
            } else {
                if(obj.type == "ColorLinear") {
                    data.path = obj.path;
                    data.val_min = obj.color1;
                    data.val_max = obj.color2;
                    data.btn_path.text("-[" + data.path + "]-");
                    data.num_min.IVColorPicker(data.val_min);
                    data.num_max.IVColorPicker(data.val_max);
                    data.mode_bind();
                } else {
                    data.num_min.IVColorPicker(obj.obj);
                    data.mode_plain();
                }
            }
        };
        data.mode_plain();
    }
    if(obj === undefined) return data.get();
    if(typeof(obj) == "function")
        data.changed = obj;
    else data.set(obj);
    return this;
};

$.fn.IVSelectValue = function(obj) {
    var $this = this;
    var data = $this.data();
    if(!data.is_created) {

        data.select = $("<select />");
        data.options = $this.attr("data-options").split(",").map(function(s) {
            var sp = s.split("|");
            if(sp.length == 1) return { name: s, display: s };
            return { name: sp[0], display: sp[1] };
        });
        data.options.forEach(function(o) {
            data.select.append($("<option />").text(o.display).attr("value", o.name));
        });
        $this.append(data.select);

        data.select.change(function() {
            if(data.changed) data.changed(data.get());
        });

        if($this.attr("data-default")) data.select.val($this.attr("data-default"));

        data.get = function() {
            return new IV.objects.Plain(data.select.val());
        };
        data.set = function(v) {
            if(v) data.select.val(v.obj);
            else {
                if($this.attr("data-default"))
                    data.select.val($this.attr("data-default"));
            }
        };
        data.is_created = true;
    }
    if(obj === undefined) return data.get();
    if(typeof(obj) == "function")
        data.changed = obj;
    else data.set(obj);
    return this;
};

$.fn.ScrollView = function() {
    var container = this;
    var $this = this;
    var data = $this.data();

    if(!data.is_created) {
        data.is_created = true;

        var view = container.children("div");
        view.addClass("scrollview-content");
        var scrollbar = $("<div />").addClass("scrollbar");
        var guide = $("<div />").addClass("guide");
        scrollbar.append(guide);
        container.append(scrollbar);

        var get_top = function() {
            var top = view.css("top");
            if(!top) top = 0;
            else top = parseFloat(top.replace("px", ""));
            if(isNaN(top)) top = 0;
            return top;
        };
        var set_top = function(top) {
            var view_h = view.outerHeight();
            var cont_h = container.height();
            if(view_h < cont_h || view_h == 0) {
                top = 0;
                scrollbar.addClass("hide");
            } else {
                if(top > 0) top = 0;
                if(top < cont_h - view_h) top = cont_h - view_h;
                scrollbar.removeClass("hide");
                guide.css({
                    height: (cont_h / view_h * cont_h) + "px",
                    top: (-top / view_h * cont_h) + "px"
                });
            }
            view.css("top", top + "px");
        };
        container.mousewheel(function(e, delta) {
            set_top(get_top() + delta);
        });

        var check_size = function() {
            set_top(get_top());
        };
        data.check_size_timer = setInterval(check_size, 200);

        IV.trackMouseEvents(guide, {
            down: function(e) {
                this.top0 = parseFloat(guide.css("top").replace("px", ""));
                this.mouse0 = e.pageY;
                e.preventDefault();
                scrollbar.addClass("dragging");
            },
            move: function(e) {
                var new_top = this.top0 + e.pageY - this.mouse0;
                var view_h = view.outerHeight();
                var cont_h = container.height();
                var rtop = -new_top * view_h / cont_h;
                set_top(rtop);
            },
            up: function() {
                scrollbar.removeClass("dragging");
            }
        });
    }
};
