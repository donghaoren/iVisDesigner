object_renderers.Plain = function(item, args, callback) {
    return render_plain_value(item, args, callback);
};

object_renderers.CategoricalMapping = function(item, args, callback) {
    var path = primitives.Path(function() { return item.path; }, function(new_val) {
        item.path = new_val;
        callback();
        return new_val;
    });
    var r = IV._E("span");
    for(var i = 0; i < item.keys.length; i++) {
        (function(index) {

            var sp = primitives.String(function() {
                if(item.keys[index] === null) return "null";
                return item.keys[index].toString();
            }, function(new_val) {
                if(new_val == "true") new_val = true;
                if(new_val == "false") new_val = false;
                if(new_val == "null") new_val = null;
                item.keys[index] = new_val;
                callback();
                return new_val;
            });
            var ss;
            if(item.value_type == "number") {
                ss = primitives.Number(function() { return item.values[index]; }, function(new_val) {
                    item.values[index] = new_val;
                    callback();
                    return new_val;
                });
            }
            if(item.value_type == "color") {
                ss = primitives.Color(function() { return item.values[index]; }, function(new_val) {
                    item.values[index] = new_val;
                    callback();
                    return new_val;
                });
            }
            var btn_remove = $("<span />").addClass("btn").append($('<i class="xicon-cross"></i>')).click(function() {
                item.keys.splice(index, 1);
                item.values.splice(index, 1);
                callback(item);
            });
            r.append(make_table("|", ss, "|", ":", "|", sp, "|", btn_remove));
        })(i);
    }

    var btn_add = $("<span />").addClass("btn").text("+").click(function() {
        item.keys.push("new");
        if(item.value_type == "number")
            item.values.push(0);
        else if(item.value_type == "color")
            item.values.push(new IV.Color(0, 0, 0, 1));
        else
            item.values.push(null);
        callback(item);
    });
    var fallback_control;
    if(item.value_type == "number") {
        fallback_control = primitives.Number(function() { return item.fallback; }, function(new_val) {
            item.fallback = new_val;
            callback();
            return new_val;
        });
    }
    if(item.value_type == "color") {
        fallback_control = primitives.Color(function() { return item.fallback; }, function(new_val) {
            item.fallback = new_val;
            callback();
            return new_val;
        });
    }
    r.append(make_table("|", fallback_control, "|", btn_add));
    r.append(path);
    return r;
};
object_renderers.ColorLinear = function(item, args, callback) {
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
    var path = primitives.Path(function() { return item.path; }, function(new_val) {
        var stat = Editor.computePathStatistics(new_val);
        item.path = new_val;
        item.min = stat.min;
        item.max = stat.max;
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
    return r;
};
object_renderers.NumberLinear = function(item, args, callback) {
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
        vmin.data().reload();
        vmax.data().reload();
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
    var mapping_type = primitives.String(function() { return item.mapping ? item.mapping : "linear"; }, function(new_val) {
        item.mapping = new_val;
        callback();
        return new_val;
    }, [{ name: "linear", display: "Linear" }, { name: "logarithmic", display: "Logarithmic" }]);

    var r = IV._E("span");
    r.append(make_table(c1, " - ", c2))
     .append(make_table(vmin, " - ", vmax))
     .append(mapping_type).append("<br />")
     .append(path);
    return r;
};

object_renderers.PassThrough = function(item, args, callback) {
    var path = primitives.Path(function() { return item.path; }, function(new_val) {
        item.path = new_val;
        callback();
        return new_val;
    });
    return IV._E("span").append(path);
};
