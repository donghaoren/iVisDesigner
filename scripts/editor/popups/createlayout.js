IV.popups.CreateLayout = function() {
    var data = IV.popups.create();
    data.addActions([ "ok", "cancel" ]);

    var p = data.selector;
    p.children(".content").html(IV.strings("popup_create_layout"));

    p.default_width = 300;
    p.default_height = 120;
    var data = p.data();
    data.onOk = function() {
        var vertex_path = p.find('[data-field="vertex-path"]').data().get();
        var field = p.find('[data-field="point-field"]').data().get();
        var edgeA = p.find('[data-field="edge-a"]').data().get();
        var edgeB = p.find('[data-field="edge-b"]').data().get();
        var algo = p.find('[data-field="algorithm"]').data().get();
        var obj = new IV.objects.ForceLayout(vertex_path, field, edgeA, edgeB);
        Editor.doAddObject(obj);
        data.hide();
    };
    data.onCancel = function() {
        data.hide();
    };
    return data;
};
