//. iVisDesigner - File: scripts/editor/property/objects.js
//. Copyright 2013-2014 Donghao Ren
//. Peking University, University of California, Santa Barbara
//. See LICENSE.md for more information.

object_renderers.Plain = function(item, args, callback) {
    var obj = item.obj;
    var _listen = function(elem) {
        var listener = IV.bindObjectEvents(item,
        ["set:obj"],
        function(ev, val) {
            elem.data().reload();
        });
        elem.bind("destroyed", function() { listener.unbind(); });
        return elem;
    }
    if(obj.constructor == Number) {
        return _listen(primitives.Number(function() { return item.obj; }, function(new_val) {
            Actions.add(new Actions.SetDirectly(item, "obj", new_val));
            Actions.commit();
            callback();
            return new_val;
        }, args));
    }
    if(obj.constructor == String) {
        return _listen(primitives.String(function() { return item.obj; }, function(new_val) {
            Actions.add(new Actions.SetDirectly(item, "obj", new_val));
            Actions.commit();
            callback();
            return new_val;
        }, args));
    }
    if(obj instanceof IV.Vector) {
        return IV._E("span", "plain-vector", "(" + obj.x + ", " + obj.y + ")");
    }
    if(obj instanceof IV.Color) {
        return _listen(primitives.Color(function() { return item.obj; }, function(new_val) {
            Actions.add(new Actions.SetDirectly(item, "obj", new_val));
            Actions.commit();
            callback();
            return new_val;
        }, args));
    }
};

object_renderers.CategoricalMapping = function(item, args, callback) {
    var path = primitives.Path(function() { return item.path; }, function(new_val) {
        item.path = new_val;
        callback();
        return new_val;
    });
    var value_primitive = function(get, set) {
        if(item.value_type == "string")
            return primitives.String(get, set, args);
        if(item.value_type == "number")
            return primitives.Number(get, set);
        if(item.value_type == "color")
            return primitives.Color(get, set);
    };
    var r = IV._E("span");
    var kv_container = IV._E("span");
    r.append(kv_container);
    var rebuild_key_values = function() {
        kv_container.children().remove();
        for(var i = 0; i < item.keys_values.length; i++) {
            (function(index) {
                var sp = primitives.String(function() {
                    if(item.keys_values[index].key === null) return "null";
                    return item.keys_values[index].key.toString();
                }, function(new_val) {
                    if(new_val == "true") new_val = true;
                    if(new_val == "false") new_val = false;
                    if(new_val == "null") new_val = null;
                    var new_kv = { key: new_val, value: item.keys_values[index].value };
                    Actions.add(new Actions.SetArrayDirectly(item, "keys_values", "set", index, new_kv));
                    Actions.commit();
                    callback();
                    return new_val;
                });
                var ss = value_primitive(function() { return item.keys_values[index].value; }, function(new_val) {
                    var new_kv = { key: item.keys_values[index].key, value: new_val };
                    Actions.add(new Actions.SetArrayDirectly(item, "keys_values", "set", index, new_kv));
                    Actions.commit();
                    callback();
                    return new_val;
                });
                var btn_remove = $("<span />").addClass("btn").append($('<i class="xicon-cross"></i>')).click(function() {
                    Actions.add(new Actions.SetArrayDirectly(item, "keys_values", "splice", index, 1, []));
                    Actions.commit();
                    callback();
                });
                var elem = make_table("|", ss, "|", ":", "|", sp, "|", btn_remove);
                elem.addClass("keyvalue-item");
                kv_container.append(elem);
                return {
                    elem: elem,
                    reload: function() {
                        sp.reload();
                        ss.reload();
                    }
                };
            })(i);
        }
    };

    rebuild_key_values();

    var btn_add = $("<span />").addClass("btn").text("+").click(function() {
        var nv = null;
        if(item.value_type == "number")
            nv = { key: "new", value: 0 };
        else if(item.value_type == "color")
            nv = { key: "new", value: new IV.Color(0, 0, 0, 1) };
        else
            nv = { key: "new", value: null };
        Actions.add(new Actions.SetArrayDirectly(item, "keys_values", "push", nv));
        Actions.commit();
        callback();
    });
    var fallback_control = value_primitive(function() { return item.fallback; }, function(new_val) {
        Actions.add(new Actions.SetProperty(item, "fallback", new_val));
        Actions.commit();
        callback();
        return new_val;
    });
    r.append(make_table("|", fallback_control, "|", btn_add));
    r.append(path);
    var listener = IV.bindObjectEvents(item,
        ["set:fallback", "set:keys_values"],
    function(ev, val) {
        if(ev == "set:fallback") fallback_control.data().reload();
        if(ev == "set:keys_values") rebuild_key_values();
    });
    r.bind("destroyed", function() { listener.unbind(); });
    return r;
};

object_renderers.ColorLinear = function(item, args, callback) {
    var c1 = primitives.Color(function() { return item.color1; }, function(new_val) {
        Actions.add(new Actions.SetProperty(item, "color1", new_val));
        Actions.commit();
        callback();
        return new_val;
    });
    var c2 = primitives.Color(function() { return item.color2; }, function(new_val) {
        Actions.add(new Actions.SetProperty(item, "color2", new_val));
        Actions.commit();
        callback();
        return new_val;
    });
    var vmin = primitives.Number(function() { return item.min; }, function(new_val) {
        Actions.add(new Actions.SetProperty(item, "min", new_val));
        Actions.commit();
        callback();
        return new_val;
    });
    var vmax = primitives.Number(function() { return item.max; }, function(new_val) {
        Actions.add(new Actions.SetProperty(item, "max", new_val));
        Actions.commit();
        callback();
        return new_val;
    });
    var path = primitives.Path(function() { return item.path; }, function(new_val) {
        var stat = Editor.computePathStatistics(new_val);
        Actions.add(new Actions.SetProperty(item, "path", new_val));
        Actions.add(new Actions.SetProperty(item, "min", stat.min));
        Actions.add(new Actions.SetProperty(item, "max", stat.max));
        Actions.commit();
        vmin.data().reload();
        vmax.data().reload();
        callback();
        return new_val;
    });
    var mapping_type = primitives.String(function() { return item.mapping ? item.mapping : "linear"; }, function(new_val) {
        item.mapping = new_val;
        callback();
        return new_val;
    }, [{ name: "linear", display: "Linear" }, { name: "logarithmic", display: "Logarithmic" }]);
    var r = $("<span />");
    r.append(c1)
     .append("<span> - </span>")
     .append(c2)
     .append("<br />")
     .append(make_table(vmin, " - ", vmax))
     .append(mapping_type).append("<br />")
     .append(path);
    var listener = IV.bindObjectEvents(item,
        ["set:min", "set:max", "set:color1", "set:color2", "set:mapping", "set:path"],
    function(ev, val) {
        if(ev == "set:color1") c1.data().reload();
        if(ev == "set:color2") c2.data().reload();
        if(ev == "set:min") vmin.data().reload();
        if(ev == "set:max") vmax.data().reload();
        if(ev == "set:mapping") mapping_type.data().reload();
        if(ev == "set:path") path.data().reload();
    });
    r.bind("destroyed", function() { listener.unbind(); });
    return r;
};
object_renderers.NumberLinear = function(item, args, callback) {
    var c1 = primitives.Number(function() { return item.num1; }, function(new_val) {
        Actions.add(new Actions.SetProperty(item, "num1", new_val));
        Actions.commit();
        callback();
        return new_val;
    });
    var c2 = primitives.Number(function() { return item.num2; }, function(new_val) {
        Actions.add(new Actions.SetProperty(item, "num2", new_val));
        Actions.commit();
        callback();
        return new_val;
    });
    var path = primitives.Path(function() { return item.path; }, function(new_val) {
        var stat = Editor.computePathStatistics(new_val);
        Actions.add(new Actions.SetProperty(item, "path", new_val));
        Actions.add(new Actions.SetProperty(item, "min", stat.min));
        Actions.add(new Actions.SetProperty(item, "max", stat.max));
        Actions.commit();
        vmin.data().reload();
        vmax.data().reload();
        callback();
        return new_val;
    });
    var vmin = primitives.Number(function() { return item.min; }, function(new_val) {
        Actions.add(new Actions.SetProperty(item, "min", new_val));
        Actions.commit();
        callback();
        return new_val;
    });
    var vmax = primitives.Number(function() { return item.max; }, function(new_val) {
        Actions.add(new Actions.SetProperty(item, "max", new_val));
        Actions.commit();
        callback();
        return new_val;
    });
    var mapping_type = primitives.String(function() { return item.mapping ? item.mapping : "linear"; }, function(new_val) {
        Actions.add(new Actions.SetProperty(item, "mapping", new_val));
        Actions.commit();
        callback();
        return new_val;
    }, [{ name: "linear", display: "Linear" }, { name: "logarithmic", display: "Logarithmic" }]);

    var r = IV._E("span");
    r.append(make_table(c1, " - ", c2))
     .append(make_table(vmin, " - ", vmax))
     .append(mapping_type).append("<br />")
     .append(path);
    var listener = IV.bindObjectEvents(item,
        ["set:min", "set:max", "set:num1", "set:num2", "set:mapping", "set:path"],
    function(ev, val) {
        if(ev == "set:num1") c1.data().reload();
        if(ev == "set:num2") c2.data().reload();
        if(ev == "set:min") vmin.data().reload();
        if(ev == "set:max") vmax.data().reload();
        if(ev == "set:mapping") mapping_type.data().reload();
        if(ev == "set:path") path.data().reload();
    });
    r.bind("destroyed", function() { listener.unbind(); });
    return r;
};

object_renderers.MappingExpression = function(item, args, callback) {
    var path = primitives.Path(function() { return item.path; }, function(new_val) {
        Actions.add(new Actions.SetProperty(item, "path", new_val));
        Actions.commit();
        callback();
        return new_val;
    });
    var expr = primitives.String(function() { return item.expression; }, function(new_val) {
        Actions.add(new Actions.SetProperty(item, "expression", new_val));
        Actions.commit();
        callback();
        return new_val;
    });
    var r = IV._E("span").append(path).append("<br />").append(expr);
    var listener = IV.bindObjectEvents(item,
        ["set:path", "set:expression"],
    function(ev, val) {
        if(ev == "set:path") path.data().reload();
        if(ev == "set:expression") expr.data().reload();
    });
    r.bind("destroyed", function() { listener.unbind(); });
    return r;
};

object_renderers.RangeFilter = function(item, args, callback) {
    var path = primitives.Path(function() { return item.path; }, function(new_val) {
        var stat = Editor.computePathStatistics(new_val);
        Actions.add(new Actions.SetProperty(item, "path", new_val));
        Actions.add(new Actions.SetProperty(item, "min", stat.min));
        Actions.add(new Actions.SetProperty(item, "max", stat.max));
        Actions.commit();
        vmin.data().reload();
        vmax.data().reload();
        callback();
        return new_val;
    });
    var vmin = primitives.Number(function() { return item.min; }, function(new_val) {
        Actions.add(new Actions.SetProperty(item, "min", new_val));
        Actions.commit();
        callback();
        return new_val;
    });
    var vmax = primitives.Number(function() { return item.max; }, function(new_val) {
        Actions.add(new Actions.SetProperty(item, "max", new_val));
        Actions.commit();
        callback();
        return new_val;
    });
    var r = IV._E("span");
    r.append(make_table(vmin, " - ", vmax))
     .append(path);
    var listener = IV.bindObjectEvents(item,
        ["set:min", "set:max", "set:path"],
    function(ev, val) {
        if(ev == "set:min") vmin.data().reload();
        if(ev == "set:max") vmax.data().reload();
        if(ev == "set:path") path.data().reload();
    });
    r.bind("destroyed", function() { listener.unbind(); });
    return r;
};

object_renderers.CategoricalFilter = function(item, args, callback) {
    var path = primitives.Path(function() { return item.path; }, function(new_val) {
        item.path = new_val;
        callback();
        return new_val;
    });
    var r = IV._E("span");
    var k_container = IV._E("span");
    r.append(k_container);
    var rebuild_keys = function() {
        k_container.children().remove();
        for(var i = 0; i < item.keys.length; i++) {
            (function(index) {
                var sp = primitives.String(function() {
                    if(item.keys[index] === null) return "null";
                    return item.keys[index].toString();
                }, function(new_val) {
                    Actions.add(new Actions.SetArrayDirectly(item, "keys", "set", index, new_val));
                    Actions.commit();
                    callback();
                    return new_val;
                });
                var btn_remove = $("<span />").addClass("btn").append($('<i class="xicon-cross"></i>')).click(function() {
                    Actions.add(new Actions.SetArrayDirectly(item, "keys", "splice", index, 1, []));
                    Actions.commit();
                    callback();
                });
                var elem = make_table("|", sp, "|", btn_remove);
                elem.addClass("key-item");
                k_container.append(elem);
                return {
                    elem: elem,
                    reload: function() {
                        sp.reload();
                    }
                };
            })(i);
        }
    };

    rebuild_keys();

    var btn_add = $("<span />").addClass("btn").text("+").click(function() {
        var nv = "new";
        Actions.add(new Actions.SetArrayDirectly(item, "keys", "push", nv));
        Actions.commit();
        callback();
    });
    var btn_is_black_list = primitives.Toggle(function() { return item.is_black_list; }, function(new_val) {
        Actions.add(new Actions.SetProperty(item, "is_black_list", new_val));
        Actions.commit();
        callback();
        return new_val;
    }, { "true": "Black List", "false": "White List" });
    r.append(make_table("|", btn_is_black_list, "|", btn_add));
    r.append(path);
    var listener = IV.bindObjectEvents(item,
        ["set:is_black_list", "set:keys"],
    function(ev, val) {
        if(ev == "set:is_black_list") btn_is_black_list.data().reload();
        if(ev == "set:keys") rebuild_keys();
    });
    r.bind("destroyed", function() { listener.unbind(); });
    return r;
};

object_renderers.PassThrough = function(item, args, callback) {
    var path = primitives.Path(function() { return item.path; }, function(new_val) {
        Actions.add(new Actions.SetProperty(item, "path", new_val));
        Actions.commit();
        callback();
        return new_val;
    });
    var r = IV._E("span").append(path);
    var listener = IV.bindObjectEvents(item,
        ["set:path"],
    function(ev, val) {
        if(ev == "set:path") path.data().reload();
    });
    r.bind("destroyed", function() { listener.unbind(); });
    return r;
};

object_renderers.CombinedFilter = function(item, args, callback) {
    var r = IV._E("span");
    var fc = IV._E("span");
    var render_filters = function() {
        fc.children().remove();
        for(var i = 0; i < item.filters.length; i++) { (function(index) {
            console.log("R", item.filters[index]);
            var elem = render_object_value(item.filters[index], args, function(val) {
                if(val) {
                    Actions.add(new Actions.SetArrayDirectly(item, "filters", "set", index, val));
                    Actions.commit();
                }
                callback();
                return val;
            });
            var btn_remove = $("<span />").addClass("btn").append($('<i class="xicon-cross"></i>')).click(function() {
                Actions.add(new Actions.SetArrayDirectly(item, "filters", "splice", index, 1, []));
                Actions.commit();
                callback();
            });
            fc.append(make_table(IV._E("span", "small", item.filters[index].type), "|", btn_remove));
            fc.append(elem);
        })(i) };
    };
    render_filters();
    var btn_add = $("<span />").addClass("btn").text("+").click(function() {
        IV.popups.beginContextMenu($(this), [ "Range", "Categorical", "Combined"], function(val) {
            var new_filter;
            if(val == "Range") {
                new_filter = new IV.objects.RangeFilter(new IV.Path(), 0, 1);
            }
            if(val == "Categorical") {
                new_filter = new IV.objects.CategoricalFilter(new IV.Path(), [], false);
            }
            if(val == "Combined") {
                new_filter = new IV.objects.CombinedFilter([], false);
            }
            Actions.add(new Actions.SetArrayDirectly(item, "filters", "push", new_filter));
            Actions.commit();
            callback();
        });
    });
    var btn_is_conjunctive = primitives.Toggle(function() { return item.is_conjunctive; }, function(new_val) {
        Actions.add(new Actions.SetProperty(item, "is_conjunctive", new_val));
        Actions.commit();
        callback();
        return new_val;
    }, { "true": "Conjunctive", "false": "Disjunctive" });
    r.append(fc);
    var buttons = make_table(btn_is_conjunctive, "|", btn_add);
    r.append(buttons);
    var listener = IV.bindObjectEvents(item,
        ["set:is_conjunctive", "set:filters"],
    function(ev, val) {
        if(ev == "set:is_conjunctive") btn_is_conjunctive.data().reload();
        if(ev == "set:filters") render_filters();
    });
    r.bind("destroyed", function() { listener.unbind(); });
    return r;
};
