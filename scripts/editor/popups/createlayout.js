IV.popups.CreateLayout = function() {
    var data = IV.popups.create();
    data.addActions([ "ok", "cancel" ]);

    var p = data.selector;
    p.children(".content").html(IV.strings("popup_create_layout"));

    p.default_width = 300;
    p.default_height = 130;
    var data = p.data();
    data.onOk = function() {
        var vertex_path = p.find('[data-field="vertex-path"]').data().get();
        var edgeA = p.find('[data-field="edge-a"]').data().get();
        var edgeB = p.find('[data-field="edge-b"]').data().get();
        var algo = p.find('[data-field="algorithm"]').data().get();
        var obj = new IV.objects.ForceLayout({
            path_nodes: vertex_path,
            path_edgeA: edgeA,
            path_edgeB: edgeB
        });
        Editor.doAddObject(obj);
        data.hide();
    };
    data.onCancel = function() {
        data.hide();
    };
    return data;
};

IV.popups.CreateStatistics = function() {
    var data = IV.popups.create();
    data.addActions([ "ok", "cancel" ]);

    var p = data.selector;
    p.children(".content").html(IV.strings("popup_create_statistics"));

    p.default_width = 300;
    p.default_height = 130;
    var data = p.data();
    data.onOk = function() {
        var path = p.find('[data-field="path"]').data().get();
        var path_data = p.find('[data-field="path-data"]').data().get();
        var obj = new IV.objects.Statistics({
            path: path,
            path_data: path_data
        });
        Editor.doAddObject(obj);
        data.hide();
    };
    data.onCancel = function() {
        data.hide();
    };
    return data;
};
