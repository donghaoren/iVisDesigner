// ------------------------------------------------------------------------
// Loading data schema and contents
// ------------------------------------------------------------------------
IV.editor.renderSchema = function(schema, prev_path, set_active) {
    var elem = $("<ul></ul>");
    for(var key in schema) {
        var this_path = prev_path + ":" + key;
        if(prev_path == "") this_path = key;
        // Ignore all keys starting with _
        if(key[0] == '_') continue;
        // The child element.
        var child = schema[key];
        // Fix abbreviations.
        if(typeof(child) == "string") child = { "type": child };
        // The text for key.
        var span = $("<span></span>").text(key).addClass("key");
        // Types.
        if(child.type == "number")
            span.append($("<span />").addClass("type").text("num"));
        if(child.type == "collection")
            span.append($("<span />").addClass("type").text("set"));
        if(child.type == "object")
            span.append($("<span />").addClass("type").text("obj"));
        if(child.type == "sequence")
            span.append($("<span />").addClass("type").text("seq"));
        if(child.type == "reference")
            span.append($("<span />").addClass("type ref").text("ref"));
        span.data().schema = schema;
        span.data().key = key;
        span.data().path = this_path;
        if(set_active) {
            //if(this_path == IV.get("selected-path")) span.addClass("active");
            //if(this_path == IV.get("selected-reference")) span.children(".ref").addClass("active");
        }
        var li = $("<li></li>")
            .append(span);
        if(child.type == "collection" || child.type == "object" || child.type == "sequence")
            li.append(IV.editor.renderSchema(child.fields, this_path, set_active));
        elem.append(li);
    }
    return elem;
};

IV.editor.renderDataSchema = function(schema) {
    $("#data-schema").children().remove();
    var rootelem_span = $('<span class="key">ROOT</span>');
    var rootelem = $("<li/>").append(rootelem_span);
    rootelem_span.data().path = "";
    $("#data-schema").append($('<ul style="margin-bottom: 2px"></ul>').append(rootelem));
    $("#data-schema").append(IV.editor.renderSchema(schema.fields, "", true));
    $("#data-schema span.key").each(function() {
        var $this = $(this);
        $this.click(function() {
            $("#data-schema span.key").removeClass("active");
            $this.addClass("active");
            var data = $this.data();
            //IV.set("selected-path", data.path);
        });
    });
    $("#data-schema span.ref").each(function() {
        var $this = $(this);
        var p = $this.parent();
        $this.click(function(e) {
            if($this.is(".active")) {
                $("#data-schema span.ref").removeClass("active");
                //IV.set("selected-reference", null);
            } else {
                $("#data-schema span.ref").removeClass("active");
                $this.addClass("active");
                var data = p.data();
                //IV.set("selected-reference", data.path);
            }
            e.stopPropagation();
        });
    });
};