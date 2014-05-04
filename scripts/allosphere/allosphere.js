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
            embed.redraw()
        };
        IV.server.wamp.subscribe("iv.allosphere.message", function(message) {
            var content = JSON.parse(message);
            console.log(content);
            F[content.type](content);
        });
    });
}

})();}
