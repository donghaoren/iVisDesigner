// iVisDesigner - scripts/allosphere/allosphere.js
// Author: Donghao Ren
//
// LICENSE
//
// Copyright (c) 2014, The Regents of the University of California
// All rights reserved.
//
// Redistribution and use in source and binary forms, with or without modification,
// are permitted provided that the following conditions are met:
//
// 1. Redistributions of source code must retain the above copyright notice, this
//    list of conditions and the following disclaimer.
//
// 2. Redistributions in binary form must reproduce the above copyright notice,
//    this list of conditions and the following disclaimer in the documentation
//    and/or other materials provided with the distribution.
//
// 3. Neither the name of the copyright holder nor the names of its contributors
//    may be used to endorse or promote products derived from this software without
//    specific prior written permission.
//
// THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
// ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
// WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED.
// IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT,
// INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING,
// BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
// DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
// LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE
// OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED
// OF THE POSSIBILITY OF SUCH DAMAGE.

if(IV.getQuery("allosphere") == "true" || IV_Config.allosphere_slave) {(function() {

IV.set("colormode-black", true);
$("#pose-view-toggle").click();

IV.allosphere = { };
IV.allosphere.F = { };

$("body").addClass("allosphere");

window.isAllosphere = true;
window.isAllosphereMaster = IV.getQuery("allosphere-master") == "true";

var SyncAllosphere = function() {
    // IV.server.wamp.publish("iv.allosphere.message", JSON.stringify({
    //     type: "workspace.set",
    //     workspace: IV.serializer.serialize(IV.editor.workspace)
    // }));
};

if(window.isAllosphereMaster) {
    IV.editor.renderer.bind("main", SyncAllosphere);
    IV.SyncAllosphere = SyncAllosphere;
    IV.allosphere.postMessage = function(data) {
        IV.server.wamp.publish("iv.allosphere.message", JSON.stringify(data));
    };
    // IV.on("dataset:set", function(c) {
    //     if(c.type == "plain") {
    //         IV.allosphere.postMessage({
    //             type: "data.set",
    //             data: c.data,
    //             schema: c.schema
    //         });
    //     }
    // });
    IV.allosphere.preloadPanorama = function(path) {
        IV.allosphere.postMessage({
            type: "panorama.preload",
            filename: path
        });
    };
    IV.allosphere.unloadPanorama = function(path) {
        IV.allosphere.postMessage({
            type: "panorama.preload",
            filename: path
        });
    };
    IV.allosphere.loadPanorama = function(path, is_stereo) {
        IV.allosphere.postMessage({
            type: "panorama.load",
            filename: path,
            is_stereo: is_stereo
        });
    };
    var loop_timer = null;
    IV.allosphere.preloadPanoramas = function(info) {
        if(!info.start) info.start = 0;
        if(!info.end) info.end = 100;
        if(!info.step) info.step = 1;
        for(var index = info.start; index <= info.end; index++) {
            var file = info.template.replace("$index", d3.format("04d")(index));
            IV.allosphere.preloadPanorama(file);
        }
    };
    IV.allosphere.unloadPanoramas = function(info) {
        if(!info.start) info.start = 0;
        if(!info.end) info.end = 100;
        if(!info.step) info.step = 1;
        for(var index = info.start; index <= info.end; index++) {
            var file = info.template.replace("$index", d3.format("04d")(index));
            IV.allosphere.unloadPanorama(file);
        }
    };
    IV.allosphere.loopPanoramas = function(info) {
        if(loop_timer) { clearInterval(loop_timer); loop_timer = null; }
        if(!info.interval) info.interval = 100;
        if(!info.start) info.start = 0;
        if(!info.end) info.end = 100;
        if(!info.step) info.step = 1;
        var index = info.start;
        loop_timer = setInterval(function() {
            var file = info.template.replace("$index", d3.format("04d")(index));
            IV.allosphere.loadPanorama(file, info.is_stereo);
            index += info.step;
            if(index > info.end) index = info.start;
            if(index < info.start) index = info.end;
        }, info.interval ? info.interval : 100);
    };

    IV.allosphere.sync = { };
    // Dataset.
    IV.on("dataset:set", function(c) {
        IV.allosphere.sync.setData(c);
    });
    IV.on("command:allosphere.sync", function() {
        IV.allosphere.sync.startup();
    });
    IV.allosphere.sync.setData = function(c) {
        if(c.type == "synced") {
            IV.allosphere.postMessage({
                type: "data.set.synced",
                name: c.name,
                schema: c.schema
            });
            c.data.onMessage = function(msg) {
                IV.allosphere.postMessage({
                    type: "data.set.synced.message",
                    message: msg
                });
            };
        } else if(c.type == "plain") {
            IV.allosphere.postMessage({
                type: "data.set",
                data: c.data,
                schema: c.schema
            });
        }
    };
    IV.allosphere.sync.setDynamicData = function() {
    };
    // Incremental synchronization.
    var current_serializer = new IV.Serializer();
    IV.allosphere.sync.startup = function() {
        current_serializer = new IV.Serializer();
        var data = current_serializer.serialize(IV.editor.workspace);
        IV.allosphere.postMessage({
            type: "sync.startup",
            workspace: data
        });
    };
    IV.allosphere.sync.perform = function(actions) {
        var actions = current_serializer.serialize({ "actions": actions });
        IV.allosphere.postMessage({
            type: "sync.perform",
            actions: actions
        });
    };
    IV.allosphere.sync.rollback = function(actions) {
        var actions = current_serializer.serialize({ "actions": actions });
        IV.allosphere.postMessage({
            type: "sync.rollback",
            actions: actions
        });
    };
    IV.server.wamp.subscribe("iv.allosphere.message", function(message) {
        var content = JSON.parse(message);
        if(content.type == "sync.perform") {
            var actions = current_serializer.deserialize(content.actions);
            actions.actions.forEach(function(action) {
                action.perform();
            });
            IV.editor._tmp_onUpdatePose();
        }
    });
}

// This code is obsolete!
//
// if(IV_Config.allosphere_slave) {
//     $(window).load(function() {
//         var embed = new IV.EmbeddedCanvas($("#container"), {
//             width: $("#container").width(),
//             height: $("#container").height()
//         });
//         F = { };
//         F['data.set'] = function(params) {
//             var ds = new IV.PlainDataset(params.data, params.schema);
//             embed.renderer.setData(new IV.DataObject(ds.obj, ds.schema));
//             embed.redraw();
//         };

//         F['visualization.set'] = function(params) {
//             var vis_data = params.visualization;
//             var vis = IV.serializer.deserialize(vis_data);
//             embed.renderer.setVisualization(vis);
//             embed.redraw();
//         };

//         F['workspace.set'] = function(params) {
//             var vis_data = params.visualization;
//             var vis = IV.serializer.deserialize(vis_data);
//             embed.renderer.setVisualization(vis);
//             embed.redraw();
//         };

//         if(IV.getQuery("load")) {
//             var vis_id = IV.getQuery("load");
//             IV.server.get("visualizations/" + vis_id + "/", function(err, data) {
//                 data_content = jsyaml.load(data.dataset_info.data);
//                 data_schema = jsyaml.load(data.dataset_info.schema);
//                 var ds = new IV.PlainDataset(data_content, data_schema);
//                 var dataobj = new IV.DataObject(ds.obj, ds.schema);
//                 embed.renderer.setData(dataobj);
//                 var vis_data = JSON.parse(data.content);
//                 var vis = IV.serializer.deserialize(vis_data);
//                 embed.renderer.setVisualization(vis);
//                 embed.redraw();
//             });
//         }

//         IV.server.wamp.subscribe("iv.allosphere.message", function(message) {
//             var content = JSON.parse(message);
//             F[content.type](content);
//         });
//         var fx = { };
//         IV.allosphere.fx = fx;

//         var prev_vp = "unknown";
//         fx.resize_render = function(x, y, width, height, shx, shy, scale) {
//             var desc = [x, y, width, height, shx, shy, scale].join(",");
//             if(desc == prev_vp) return;
//             prev_vp = desc;
//             embed.resize(width, height);
//             embed.renderer.setView(new IV.Vector(-x - width / 2 + shx, y + height / 2 - shy), scale);
//             embed.redraw();
//         };
//     });
// }

})();}
