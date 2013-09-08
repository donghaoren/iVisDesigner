IV.popups.beginContextMenu = function(anchor, list, callback) {
    var data = IV.popups.create();
    var ul = $("<ul />").addClass("context-menu");
    list.forEach(function(text) {
        ul.append($("<li />").text(text).click(function() {
            data.hide();
            callback(text);
        }));
    });
    data.selector.children(".content").append(ul);
    data.show(anchor, 100, 100);
};
