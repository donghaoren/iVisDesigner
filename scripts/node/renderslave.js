// iVisDesigner - scripts/node/renderslave.js
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

{{include: transport.js}}

var configuration = require("./alloconfig");
var args = JSON.parse(process.argv[2]);
var SharedMemory = require("allofw").SharedMemory;
var texture = new SharedTexture(args);


// Setup canvas and renderer.
var manager = new IV.CanvasManager(2000, 2000);
var renderer = new IV.Renderer();

renderer.setCanvasManager(manager);

var add_canvas = function() {
    return IVWrappers.CreateCanvas();
};

manager.add("main", main = add_canvas());
manager.add("front", add_canvas());
manager.add("back", add_canvas());
manager.add("overlay", add_canvas());


var dataset, workspace, vis, synced_object;

var connection = new MessageTransportTCP(configuration, true);
var index = 0;
connection.onMessage = function(object) {
    //console.log(index++, object.type);
    if(object.type == "visualization.set") {
        vis = IV.serializer.deserialize(object.visualization);
        renderer.setVisualization(vis);
        renderer.autoView(vis);
        renderer.trigger("main");
    }
    if(object.type == "data.set") {
        var ds = new IV.PlainDataset(object.data, object.schema);
        dataset = new IV.DataObject(ds.obj, ds.schema);
        renderer.setData(dataset);
        renderer.setVisualization(vis);
        renderer.trigger("main");
    }
    if(object.type == "data.set.synced") {
        synced_object = new IV.SyncedObjectClient(object.name);
        synced_object.onUpdate = function(data) {
            var ds = new IV.PlainDataset(data, object.schema);
            var data_obj = null;
            if(!data_obj) {
                data_obj = new IV.DataObject(ds.obj, ds.schema);
                renderer.setData(data_obj);
                renderer.setVisualization(vis);
                dataset = data_obj;
                renderer.trigger("main");
            } else {
                data_obj.updateRoot(ds.obj);
                data_obj.raise("update");
            }
        };
    }
    if(object.type == "data.set.synced.message") {
        synced_object.processMessage(object.message);
    }
    workspace_sync.processMessage(object);
};

var workspace_sync = new WorkspaceSync();
workspace_sync.onUpdate = function() {
    workspace = workspace_sync.workspace;
    if(workspace && workspace.canvases[args.index]) {
        vis = workspace.canvases[args.index].visualization;
        renderer.setVisualization(vis);
        renderer.autoView(vis);
        renderer.trigger("main");
    }
};

renderer.bind("main:before", function(data, context) {
    var color = vis.background ? vis.background : new IV.Color(0, 0, 0, 0);
    context.__g.clear(color.r, color.g, color.b, color.a);
});

// This is called before each frame.
var timer = setInterval(function() {
    var t0 = new Date().getTime();
    if(vis && dataset) {
        vis.timerTick(dataset);
        vis.triggerRenderer(renderer);
        if(renderer.render()) {
            texture.shm.writeLock();
            texture.setTimestamp(new Date().getTime());
            main.__surface.pixels().copy(texture.buffer);
            texture.shm.writeUnlock();
        }
}
}, 30);

function safe_exit() {
    clearInterval(timer);
    connection.close();
    process.exit();
};

process.on("SIGHUP", safe_exit);
process.on("SIGINT", safe_exit);
process.on("SIGTERM", safe_exit);
process.on("uncaughtException", function(error) {
    console.log('Caught exception: ');
    console.trace(error);
    safe_exit();
});

console.log("READY");
