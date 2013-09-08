IV.popups.PathSelect = function() {
    var data = IV.popups.create();
    data.addActions([ "cancel" ]);
    var p = data.selector;
    var content = p.children(".content");
    var c = $("<div />").addClass("data-schema");
    content.append(c);
    content.addClass("scrollview").ScrollView();

    var rootelem_span = $('<span class="key">ROOT</span>');
    var rootelem = $("<li/>").append(rootelem_span);
    var elem = IV.editor.renderSchema(IV.editor.schema.fields, "");
    c.append($('<ul style="margin-bottom: 2px"></ul>').append(rootelem));
    c.append(elem);

    var selected_ref = null;

    function onSelectPath(path, ref) {
        if(data.onSelectPath) data.onSelectPath(path, ref);
        data.hide();
    };
    data.onCancel = function() {
        data.hide();
    };

    c.find("span.key").each(function() {
        var $this = $(this);
        $this.click(function() {
            c.find("span.key").removeClass("active");
            $this.addClass("active");
            var data = $this.data();
            onSelectPath(data.path, selected_ref);
        });
    });
    c.find("span.ref").each(function() {
        var $this = $(this);
        var p = $this.parent();
        $this.click(function(e) {
            if($this.is(".active")) {
                c.find("span.ref").removeClass("active");
                selected_ref = null;
            } else {
                c.find("span.ref").removeClass("active");
                $this.addClass("active");
                var data = p.data();
                selected_ref = data.path;
            }
            e.stopPropagation();
        });
    });
    return data;
};
