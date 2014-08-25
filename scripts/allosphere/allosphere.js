// iVisDesigner - File: scripts/allosphere/allosphere.js
// Copyright (c) 2013-2014, Donghao Ren
// University of California Santa Barbara, Peking University
// Advised by Prof. Tobias Hollerer and previously by Prof. Xiaoru Yuan.
//
// All rights reserved.
//
// Redistribution and use in source and binary forms, with or without
// modification, are permitted provided that the following conditions are met:
//
// 1. Redistributions of source code must retain the above copyright notice,
//    this list of conditions and the following disclaimer.
//
// 2. Redistributions in binary form must reproduce the above copyright
//    notice, this list of conditions and the following disclaimer in the
//    documentation and/or other materials provided with the distribution.
//
// THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS
// IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO,
// THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR
// PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR
// CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
// EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,
// PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS;
// OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY,
// WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR
// OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF
// ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

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
