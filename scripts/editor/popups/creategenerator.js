//. iVisDesigner - File: scripts/editor/popups/creategenerator.js
//. Copyright 2013-2014 Donghao Ren
//. Peking University, University of California, Santa Barbara
//. See LICENSE.md for more information.

IV.popups.CreateStatistics = function() {
    // We put statistics and generators together.
    var data = IV.popups.create();
    data.addActions([ "ok", "cancel" ]);

    var p = data.selector;
    p.children(".content").html(IV.strings("popup_create_statistics"));

    p.default_width = 300;
    p.default_height = 130;
    var data = p.data();
    data.onOk = function() {
        var active_tab = p.find(".tab").data().current;
        if(active_tab == "statistics") {
            var tab = p.find('[data-tab="statistics"]');
            var path = tab.find('[data-field="path"]').data().get();
            var path_data = tab.find('[data-field="path-data"]').data().get();
            var obj = new IV.objects.Statistics({
                path: path,
                path_data: path_data
            });
            Editor.doAddObject(obj);
        }
        if(active_tab == "expression") {
            var tab = p.find('[data-tab="expression"]');
            var path = tab.find('[data-field="path"]').data().get();
            var expression = tab.find('[data-field="expression"]').data().get();
            var obj = new IV.objects.Expression({
                path: path,
                expression: expression
            });
            Editor.doAddObject(obj);
        }
        if(active_tab == "brushing") {
            var tab = p.find('[data-tab="brushing"]');
            var path = tab.find('[data-field="path"]').data().get();
            var obj = new IV.objects.BrushingValue({
                path: path
            });
            Editor.doAddObject(obj);
        }
        data.hide();
    };
    data.onCancel = function() {
        data.hide();
    };
    return data;
};
