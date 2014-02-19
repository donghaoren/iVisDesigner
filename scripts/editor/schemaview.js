// ------------------------------------------------------------------------
// Loading data schema and contents
// ------------------------------------------------------------------------
Editor.renderSchema = function(schema, prev_path, set_active, attached_paths) {
    if(!attached_paths) {
        attached_paths = { };
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
    }
    var elem = $("<ul></ul>");
    for(var key in schema) {
        // Ignore all keys starting with _
        if(key[0] == '_') continue;
        // The child element.
        var child = schema[key];
        var this_path;
        if(child.type == "collection" || child.type == "sequence") {
            this_path = prev_path + ":[" + key + "]";
            if(prev_path == "") this_path = "[" + key + "]";
        } else if(child.type == "reference") {
            this_path = prev_path + ":" + key + ":&";
            if(prev_path == "") this_path = key;
        } else {
            this_path = prev_path + ":" + key;
            if(prev_path == "") this_path = key;
        }
        // Fix abbreviations.
        if(typeof(child) == "string") child = { "type": child };
        // The text for key.
        var span = $("<span></span>").text(key).addClass("key");
        // Types.
        if(child.type == "number")
            span.append($("<span />").addClass("type").text("num"));
        if(child.type == "collection")
            span.append($("<span />1").addClass("type").text("set"));
        if(child.type == "object")
            span.append($("<span />").addClass("type").text("obj"));
        if(child.type == "sequence")
            span.append($("<span />").addClass("type").text("seq"));
        if(child.type == "reference")
            span.append($("<span />").addClass("ref").text("ref"));
        span.data().schema = schema;
        span.data().key = key;
        span.data().path = this_path;
        if(child.type == "reference")
            span.data().ref_target = child.of;
        if(set_active) {
            if(Editor.get("selected-path") && this_path == Editor.get("selected-path").toString())
                span.addClass("active");
            if(Editor.get("selected-reference") && this_path == Editor.get("selected-reference").toString())
                span.children(".ref").addClass("active");
        }
        var li = $("<li></li>")
            .append(span);
        (function(this_path) {
            span.attr("draggable", true);
            span.bind("dragstart", function(e) {
                e.originalEvent.dataTransfer.setData("iv/path", this_path);
            });
        })(this_path);
        if(child.type == "collection" || child.type == "object" || child.type == "sequence")
            li.append(Editor.renderSchema(child.fields, this_path, set_active, attached_paths));
        elem.append(li);
    }
    if(attached_paths[prev_path]) {
        attached_paths[prev_path].forEach(function(item) {
            var iul = $("<ul />");
            var ili = $("<li />").append($("<span />").text(item.name));
            var new_path = "{" + item.name + "@" + item.ns + "}";
            if(prev_path != "") new_path = prev_path + ":" + new_path;
            ili.append(Editor.renderSchema(item.schema.fields, new_path, set_active, {}));
            iul.append(ili);
            elem = elem.add(iul);
            //console.log(item);
        });
    }
    return elem;
};

Editor.renderDataSchema = function(schema) {
    $("#data-schema").children().remove();
    var rootelem_span = $('<span class="key">ROOT</span>');
    var rootelem = $("<li/>").append(rootelem_span);
    rootelem_span.data().path = "";
    if(Editor.get("selected-path").toString() == "[ROOT]") rootelem_span.addClass("active");
    $("#data-schema").append($('<ul style="margin-bottom: 2px"></ul>').append(rootelem));
    $("#data-schema").append(Editor.renderSchema(schema.fields, "", true));
    $("#data-schema span.key").each(function() {
        var $this = $(this);
        $this.click(function() {
            $("#data-schema span.key").removeClass("active");
            $this.addClass("active");
            var data = $this.data();
            Editor.set("selected-path", new IV.Path(data.path));
        });
    });
    $("#data-schema span.ref").each(function() {
        var $this = $(this);
        var p = $this.parent();
        $this.click(function(e) {
            if($this.is(".active")) {
                $("#data-schema span.ref").removeClass("active");
                Editor.set("selected-reference", null);
            } else {
                $("#data-schema span.ref").removeClass("active");
                $this.addClass("active");
                var data = p.data();
                Editor.set("selected-reference", new IV.Path(data.path));
                Editor.set("selected-reference-target", new IV.Path(data.ref_target));
            }
            e.stopPropagation();
        });
    });
};

Editor.listen("selected-path", function() {
    Editor.renderDataSchema(Editor.schema);
});
