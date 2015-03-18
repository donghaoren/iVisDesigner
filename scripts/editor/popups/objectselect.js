IV.popups.ObjectSelect = function() {
    var data = IV.popups.create();
    data.addActions([ "cancel" ]);
    var p = data.selector;
    var content = p.children(".content");
    var c = $("<div />").addClass("object-list");
    content.append(c);
    content.addClass("scrollview").ScrollView();

    function onSelectObject(canvas, obj) {
        if(data.onSelectObject) data.onSelectObject(canvas, obj);
        data.hide();
    };
    data.onCancel = function() {
        data.hide();
    };

    var ws = IV.editor.workspace;
    ws.canvases.forEach(function(canvas) {
        c.append(IV._E("div", "selector", canvas.name));
        var ul = IV._E("ul", "objects");
        c.append(ul);
        canvas.visualization.objects.forEach(function(obj) {
            var li = IV._E("li", "object", " " + obj.name);
            li.prepend(IV._E("i", "icon " + IV.editor.object_icons[obj.type]));
            ul.append(li);
            li.click(function() {
                onSelectObject(canvas, obj);
            });
        });
    });

    return data;
/*
    var selected_ref = null;


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
*/
};
