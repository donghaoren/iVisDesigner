// ------------------------------------------------------------------------
// Loading data schema and contents
// ------------------------------------------------------------------------

(function() {

var get_attached_schemas = function() {
    var attached_paths = { };
    if(Editor.vis) {
        Editor.vis.objects.forEach(function(obj) {
            if(obj.getAttachedSchemas) {
                obj.getAttachedSchemas().forEach(function(item) {
                    var key = item.path.toString();
                    var info = {
                        schema: item.schema,
                        path: item.path,
                        ns: obj.uuid,
                        name: obj.name
                    };
                    if(key == "[ROOT]") key = "";
                    if(!attached_paths[key]) attached_paths[key] = [ info ];
                    else attached_paths[key].push(info);
                });
            }
        });
    }
    return attached_paths;
};

var computed_statistics = { };
var compute_all_statistics = function() {
    computed_statistics = { };
    var enumerateSchema = function(s, cb, prev) {
        cb(prev, s.type);
        if(s.type == "collection" || s.type == "sequence" || s.type == "object") {
            for(var key in s.fields) {
                var name = key;
                var f = s.fields[key];
                if(f.type == "collection" || f.type == "sequence") name = "[" + name + "]";
                enumerateSchema(f, cb, prev != "" ? prev + ":" + name : name);
            }
        }
    };
    enumerateSchema(Editor.schema, function(path, type) {
        if(type == "number") {
            var stat = Editor.computePathStatistics(new IV.Path(path));
            computed_statistics[path] = stat;
        }
        if(type == "sequence" || type == "collection") {
            var count = 0;
            new IV.Path(path).enumerate(Editor.data, function() {
                count++;
            });
            computed_statistics[path] = { count: count };
        }
    }, "");
    return computed_statistics;
};

Editor.computeDataStatistics = compute_all_statistics;

Editor.renderSchemaFields = function(info, fields, previous_path) {
    if(!info.attached_paths) {
        info.attached_paths = get_attached_schemas();
    }
    var attached_paths = info.attached_paths;
    compute_all_statistics();
    var results = $("<ul></ul>");
    if(previous_path == "") {
        var rootelem_span = $('<span class="key">ROOT</span>');
        var rootelem = $("<li/>").append(rootelem_span);
        rootelem_span.data().path = "";
        if(Editor.get("selected-path").toString() == "[ROOT]") rootelem_span.addClass("active");
    }
    for(var name in fields) { if(name[0] == '_') continue; (function(name, field) {
        var this_path = "";
        if(field.type == "collection" || field.type == "sequence") {
            this_path = "[" + name + "]";
        } else if(field.type == "reference") {
            this_path = name + ":&";
        } else {
            this_path = name;
        }
        if(previous_path != "") this_path = previous_path + ":" + this_path;
        // Fix abbreviations.
        if(typeof(field) == "string") field = { "type": field };
        // The text for key.
        var span = IV._E("span", "key", name);
        // Types.
        if(field.type == "number") {
            span.append(IV._E("span", "type", "num"));
            var s = computed_statistics[this_path];
            if(s) {
                var text = "total: " + IV.printNumber(s.count) + ", min: " + IV.printNumber(s.min) + ", max: " + IV.printNumber(s.max) + ", mean: " + IV.printNumber(s.avg);
                span.attr("title", text);
            }
        }
        if(field.type == "collection" || field.type == "sequence") {
            span.append(IV._E("span", "type", "set"));
            var s = computed_statistics[this_path];
            if(s) {
                var text = "(" + s.count + ")";
                span.append(IV._E("span", "statistics", text));
            }
        }
        if(field.type == "object")
            span.append(IV._E("span", "type", "obj"));
        if(info.show_reference_button && field.type == "reference") {
            var ref_button = IV._E("span", "ref", "ref");
            span.append(ref_button);
        }

        if(info.set_active) {
            if(Editor.get("selected-path") && IV.startsWith(Editor.get("selected-path").toString(), this_path))
                span.addClass("active");
            if(Editor.get("selected-reference") && this_path == Editor.get("selected-reference").toString())
                span.children(".ref").addClass("active");
        }

        span.data().path = this_path;
        span.data().ref_target = field.of;

        if(field.type == "reference") {
            // add a reference button.
            var ref_dropdown = IV._E("i", "ref-dropdown icon-caret-down", "");
            ref_dropdown.click(function(e) {
                var of_path = new IV.Path(field.of);
                var path_select = IV.popups.PathSelect(of_path.getSchema(Editor.schema).fields, this_path);
                path_select.show($(this), 200, 150);
                path_select.onSelectPath = function(path) {
                    var new_path = path;
                    info.onSelectPath(new_path);
                };
                e.stopPropagation();
            });
            span.append(ref_dropdown);
        }

        var li = $("<li></li>").append(span);

        (function(this_path) {
            span.attr("draggable", true);
            span.bind("dragstart", function(e) {
                e.originalEvent.dataTransfer.setData("iv/path", this_path);
            });
        })(this_path);
        if(field.type == "collection" || field.type == "object" || field.type == "sequence")
            li.append(Editor.renderSchemaFields(info, field.fields, this_path));
        results.append(li);

    })(name, fields[name]); }

    if(attached_paths[previous_path]) {
        attached_paths[previous_path].forEach(function(item) {
            var iul = $("<ul />");
            var ili = $("<li />").append(IV._E("span", "attached", item.name));
            var new_path = "{" + item.name + "@" + item.ns + "}";
            if(previous_path != "") new_path = previous_path + ":" + new_path;
            ili.append(Editor.renderSchemaFields(info, item.schema.fields, new_path));
            iul.append(ili);
            results = results.add(iul);
            //console.log(item);
        });
    }

    results.find("span.key").each(function() {
        var span = $(this);
        var path = span.data().path;
        var ref_target = span.data().ref_target;
        span.click(function(e) {
            info.onSelectPath(path);
            e.stopPropagation();
        });
        span.find(".ref").click(function(e) {
            info.onSelectReference(path, ref_target);
            e.stopPropagation();
        });
    });
    return results;
};

Editor.renderDataSchema = function() {
    $("#data-schema").children().remove();
    var rootelem_span = $('<span class="key">ROOT</span>');
    var rootelem = $("<li/>").append(rootelem_span);
    rootelem_span.data().path = "";
    if(Editor.get("selected-path").toString() == "[ROOT]") rootelem_span.addClass("active");
    $("#data-schema").append($('<ul style="margin-bottom: 2px"></ul>').append(rootelem));
    var info = {
        set_active: true,
        show_reference_button: true,
        onSelectPath: function(path) {
            Editor.set("selected-path", new IV.Path(path));
            Editor.renderDataSchema();
        },
        onSelectReference: function(path, ref_target) {
            Editor.set("selected-reference", new IV.Path(path));
            Editor.set("selected-reference-target", new IV.Path(ref_target));
            Editor.renderDataSchema();
        }
    };
    $("#data-schema").append(Editor.renderSchemaFields(info, Editor.schema.fields, "", true));
};

Editor.listen("selected-path", function() {
    Editor.renderDataSchema();
});

})();
