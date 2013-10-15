IV.popups.beginContextMenu = function(anchor, list, callback) {
    var data = IV.popups.create();
    var ul = $("<ul />").addClass("context-menu");
    var max_width = 50;
    list.forEach(function(text) {
        var disp = text;
        var name = text;
        if(typeof(text) == "object") {
            disp = text.display;
            name = text.name;
        }
        ul.append($("<li />").text(disp).click(function() {
            data.hide();
            callback(name);
        }));
        // TODO: Font hardcoded.
        var m = IV.measureText(disp, "12px 'Lucida Sans Unicode', 'Lucida Grande', sans-serif");
        if(m.width > max_width) max_width = m.width;
    });
    data.selector.children(".content").append(ul);
    // TODO: Auto compute metrics.
    data.show(anchor, max_width + 14, 18 * list.length - 2);
};
