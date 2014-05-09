//. iVisDesigner - File: scripts/allosphere/allosphere.js
//. Copyright 2013-2014 Donghao Ren
//. Peking University, University of California, Santa Barbara
//. See LICENSE.md for more information.

// Enable iVisDesigner to work in the UCSB Allosphere environment.

if(IV.getQuery("allosphere") == "true" || IV_Config.allosphere_slave) {(function() {

IV.allosphere = { };
IV.allosphere.F = { };

$("body").addClass("allosphere");
window.isAllosphere = true;
window.isAllosphereMaster = IV.getQuery("allosphere-master") == "true";

var SyncAllosphere = function() {
    IV.server.wamp.publish("iv.allosphere.message", JSON.stringify({
        type: "visualization.set",
        visualization: IV.serializer.serialize(IV.editor.vis)
    }));
};

if(window.isAllosphereMaster) {
    IV.editor.renderer.bind("main", SyncAllosphere);
    IV.on("dataset:set", function(c) {
        IV.server.wamp.publish("iv.allosphere.message", JSON.stringify({
            type: "data.set",
            data: c.data,
            schema: c.schema
        }));
    });
}

if(IV_Config.allosphere_slave) {
    $(window).load(function() {
        var embed = new IV.EmbeddedCanvas($("#container"), {
            width: $("#container").width(),
            height: $("#container").height()
        });
        F = { };
        F['data.set'] = function(params) {
            var ds = new IV.PlainDataset(params.data, params.schema);
            embed.renderer.setData(new IV.DataObject(ds.obj, ds.schema));
            embed.redraw();
        };

        F['visualization.set'] = function(params) {
            var vis_data = params.visualization;
            var vis = IV.serializer.deserialize(vis_data);
            embed.renderer.setVisualization(vis);
            embed.redraw();
        };

        if(IV.getQuery("load")) {
            var vis_id = IV.getQuery("load");
            IV.server.get("visualizations/" + vis_id + "/", function(err, data) {
                data_content = jsyaml.load(data.dataset_info.data);
                data_schema = jsyaml.load(data.dataset_info.schema);
                var ds = new IV.PlainDataset(data_content, data_schema);
                var dataobj = new IV.DataObject(ds.obj, ds.schema);
                embed.renderer.setData(dataobj);
                var vis_data = JSON.parse(data.content);
                var vis = IV.serializer.deserialize(vis_data);
                embed.renderer.setVisualization(vis);
                embed.redraw();
            });
        }

        IV.server.wamp.subscribe("iv.allosphere.message", function(message) {
            var content = JSON.parse(message);
            F[content.type](content);
        });
        var fx = { };
        IV.allosphere.fx = fx;

        var prev_vp = "unknown";
        fx.resize_render = function(x, y, width, height, shx, shy, scale) {
            var desc = [x, y, width, height, shx, shy, scale].join(",");
            if(desc == prev_vp) return;
            prev_vp = desc;
            embed.resize(width, height);
            embed.renderer.setView(new IV.Vector(-x - width / 2 + shx, y + height / 2 - shy), scale);
            embed.redraw();
        };
    });
}

})();}
