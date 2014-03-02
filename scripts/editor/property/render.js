//. iVisDesigner - File: scripts/editor/property/render.js
//. Copyright 2013-2014 Donghao Ren
//. Peking University, University of California, Santa Barbara
//. See LICENSE.md for more information.

// First we define functions to create elements for primitive values.
// Including Color, String, Number, Path, etc.

var primitives = { };
var object_renderers = { };

{{include: utils.js}}
{{include: primitives.js}}
{{include: objects.js}}

// Object value.
var render_object_value = function(item, args, callback) {
    if(item === undefined || item === null) return IV._E("span").text("None");
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
        return primitives.Toggle(function() { return item; }, function(new_val) {
            callback(new_val);
            return new_val;
        }, args);
    }
    if(item instanceof IV.Color) {
        return primitives.Color(function() { return item; }, function(new_val) {
            callback(new_val);
            return new_val;
        });
    }
    if(item instanceof IV.Path) {
        return primitives.Path(function() { return item; }, function(new_val) {
            callback(new_val);
            return new_val;
        }, args);
    }
    if(object_renderers[item.type]) {
        return object_renderers[item.type](item, args, callback);
    }
    if(!item.name) {
        return IV._E("span").append(
            IV._E("span", "gray", " " + item.type)
        );
    } else {
        return IV._E("span").text(item.name).append(
            IV._E("span", "gray", " " + item.type)
        );
    }
    return r;
};

var property_clipboard = null;

var make_set_action = function(item, val) {
    if(item.set_action) return item.set_action(val);
    return new Actions.SetProperty(item, val);
};

// Render a property field's value part.
var render_property_field = function(item) {
    var target = IV._E("div", "field group");
    var iName = IV._E("span", "name").append(
        IV._E("span").text(item.name).click(function() {
            var $this = $(this);
            IV.popups.beginContextMenu($this, [ "Copy", "Paste", "Reference" ], function(val) {
                if(val == "Copy") {
                    property_clipboard = item.get();
                }
                if(val == "Paste" && property_clipboard) {
                    item.set(property_clipboard.clone());
                    reload_item();
                    Editor.renderer.trigger();
                    Editor.renderer.render();
                }
                if(val == "Reference" && property_clipboard) {
                    item.set(property_clipboard);
                    reload_item();
                    Editor.renderer.trigger();
                    Editor.renderer.render();
                }
            });
        })
    );
    var iVal = IV._E("span", "val");
    var type = item.type;
    var reload_item = function(val) {
        if(val !== undefined) {
            Actions.add(make_set_action(item, val));
            Actions.commit();
            Editor.renderer.trigger();
            Editor.renderer.render();
        }
        iVal.children().remove();
        if(item.type == "button") {
            item.get().split(",").forEach(function(name) {
                iVal.append(IV._E("span", "btn", name).click(function() {
                    item.set(name);
                    Editor.renderer.trigger();
                    Editor.renderer.render();
                }));
            });
        } else {
            iVal.append(render_object_value(item.get(), item.args, function(new_val) {
                if(new_val !== undefined) {
                    Actions.add(make_set_action(item, new_val));
                    Actions.commit();
                    //item.set(new_val);
                    reload_item();
                }
                Editor.renderer.trigger();
                Editor.renderer.render();
            }));
        }
    };
    target.append(iName);
    target.append(iVal);

    var make_switch_button = function(list, callback) {
        target.append(
           IV._E("span")
            .append(IV._icon("xicon-tools-list"))
            .addClass("multi btn").click(function() {
                IV.popups.beginContextMenu($(this), list, function(val) {
                    callback(val);
                    Editor.renderer.trigger();
                    Editor.renderer.render();
                });
            })
        );
    };

    if(type == "color") {
        make_switch_button([ "Plain", "Linear", "Categorical", "Expression", "Equals"], function(val) {
            if(val == "Plain") {
                reload_item(new IV.objects.Plain(new IV.Color(0, 0, 0, 1)));
            }
            if(val == "Linear") {
                reload_item(new IV.objects.ColorLinear(new IV.Path(), new IV.Color(0, 0, 0, 1), new IV.Color(255, 255, 255, 1)));
            }
            if(val == "Categorical") {
                reload_item(new IV.objects.CategoricalMapping(new IV.Path(), [], new IV.Color(0, 0, 0, 1), "color"));
            }
            if(val == "Expression") {
                reload_item(new IV.objects.MappingExpression(new IV.Path(), "rgb(0, 0, 0)"));
            }
            if(val == "Equals") {
                reload_item(new IV.objects.PassThrough(new IV.Path()));
            }
        });
    }
    if(type == "number") {
        make_switch_button([ "Plain", "Linear", "Categorical", "Expression", "Equals" ], function(val) {
            if(val == "Plain") {
                reload_item(new IV.objects.Plain(0));
            }
            if(val == "Linear") {
                reload_item(new IV.objects.NumberLinear(new IV.Path(), 0, 1, 0, 1));
            }
            if(val == "Categorical") {
                reload_item(new IV.objects.CategoricalMapping(new IV.Path(), [], 0, "number"));
            }
            if(val == "Expression") {
                reload_item(new IV.objects.MappingExpression(new IV.Path(), "0"));
            }
            if(val == "Equals") {
                reload_item(new IV.objects.PassThrough(new IV.Path()));
            }
        });
    }
    if(type == "string") {
        make_switch_button([ "Plain", "Categorical", "Equals"], function(val) {
            if(val == "Plain") {
                reload_item(new IV.objects.Plain(""));
            }
            if(val == "Categorical") {
                reload_item(new IV.objects.CategoricalMapping(new IV.Path(), [], "", "string"));
            }
            if(val == "Equals") {
                reload_item(new IV.objects.PassThrough(new IV.Path()));
            }
        });
    }
    if(type == "filter") {
        make_switch_button([ "None", "Range", "Categorical", "Combined"], function(val) {
            if(val == "None") {
                reload_item(null);
            }
            if(val == "Range") {
                reload_item(new IV.objects.RangeFilter(new IV.Path(), 0, 1));
            }
            if(val == "Categorical") {
                reload_item(new IV.objects.CategoricalFilter(new IV.Path(), [], false));
            }
            if(val == "Combined") {
                reload_item(new IV.objects.CombinedFilter([], false));
            }
        });
    }
    if(type == "point") {
        target.append(
           IV._E("span")
            .append(IV._icon("xicon-tools-arrow"))
            .addClass("multi btn").click(function() {
                Editor.tools.disable();
                Editor.tools.beginSelectLocation(function(loc) {
                    Editor.tools.endSelectLocation("temporary");
                    Editor.tools.enable();
                    reload_item(loc);
                }, "temporary");
            })
        );
    }
    reload_item();
    if(item.owner && item.property) {
        var listener = IV.bindObjectEvents(item.owner,
            ["set:" + item.property],
        function(ev, val) {
            reload_item();
        });
        target.bind("destroyed", function() { listener.unbind(); });
    }

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
    return IV._E("div", "item-caption", " " + cap)
        .prepend($('<i class="icon-caret-right" style="display:none" /></i>'))
        .prepend($('<i class="icon-caret-down" /></i>'))
        .click(function() {
            $(this).children(".icon-caret-right").toggle();
            $(this).children(".icon-caret-down").toggle();
            $(this).next().toggle();
        });
};
// Render the caption of the property field.
var render_nested_caption = function(cap) {
    return IV._E("div", "nested-caption", " " + cap)
        .prepend($('<i class="icon-caret-right" style="display:none" /></i>'))
        .prepend($('<i class="icon-caret-down" /></i>'))
        .click(function() {
            $(this).children(".icon-caret-right").toggle();
            $(this).children(".icon-caret-down").toggle();
            $(this).parent().children(":not(:first-child)").toggle();
        });
};
// Render the caption of the property field.
var render_info = function(cap) {
    return IV._E("div", "item-info", cap);
};
