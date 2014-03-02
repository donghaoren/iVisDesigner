//. iVisDesigner - File: scripts/editor/popups/createmap.js
//. Copyright 2013-2014 Donghao Ren
//. Peking University, University of California, Santa Barbara
//. See LICENSE.md for more information.

IV.popups.CreateMap = function() {
    var data = IV.popups.create();
    data.addActions([ "ok", "cancel" ]);

    var p = data.selector;
    p.children(".content").html(IV.strings("popup_create_map"));

    p.default_width = 300;
    p.default_height = 130;
    var data = p.data();

    var input_longitude = p.find(".input-longitude");
    var input_latitude = p.find(".input-latitude");
    var input_scale = p.find(".input-scale");

    input_longitude.IVInputNumeric(104.1);
    input_latitude.IVInputNumeric(35.6);
    input_scale.IVInputNumeric(6);

    data.onOk = function() {
        var info = {
            longitude: input_longitude.data().get(),
            latitude: input_latitude.data().get(),
            path_longitude: p.find('[data-field="path-longitude"]').data().get(),
            path_latitude: p.find('[data-field="path-latitude"]').data().get(),
            scale: input_scale.data().get()
        };
        Editor.tools.beginSelectLocation(function(loc) {
            if(loc && loc.type == "Plain") {
                info.center = loc.obj;
                var map = new IV.objects.GoogleMap(info);
                Editor.doAddObject(map);
            }
            Editor.tools.endSelectLocation("tools:GoogleMap");
            data.hide();
        }, "tools:GoogleMap");
        /*
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
        */
    };
    data.onCancel = function() {
        data.hide();
    };
    return data;
};
