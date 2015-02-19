// iVisDesigner - scripts/node/allomain.js
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
{{include: panorama.js}}

var configuration = require("./alloconfig");


var prefix_string = function(prefix, str) {
    return prefix + str.replace(/[\r\n]/g, "\n").replace(/[\n]/g, "\n" + prefix);
};

var RenderSlaveProcess = function(info) {
    var SharedMemory = require("node_sharedmemory").SharedMemory;
    if(!info.width) info.width = 2000;
    if(!info.height) info.height = 2000;
    var tex = new SharedTexture(info, true);
    tex.surface = new graphics.Surface2D(info.width, info.height, tex.buffer);
    tex.timestamp = null;
    this.texture = tex;
    this.index = info.index;

    var spawn = require('child_process').spawn;
    this.process = spawn("node", [__dirname + "/" + info.script, JSON.stringify(info)]);
    this.process.stdout.on('data', function(data) {
        var prefix = 'renderer(' + info.index + '): stdout > ';
        console.log(prefix_string(prefix, data.toString("utf8").trim()));
    });

    this.process.stderr.on('data', function(data) {
        var prefix = 'renderer(' + info.index + '): stderr > ';
        console.log(prefix_string(prefix, data.toString("utf8").trim()));
    });

    this.process.on('close', function(code, signal) {
      console.log('renderer(' + info.index + '): terminated with code ' + code + ' signal ' + signal);
    });
};

RenderSlaveProcess.prototype.stop = function() {
    this.process.kill("SIGTERM");
    this.texture.shm.delete();
};

var RenderViewportProcess = function(info) {
    var SharedMemory = require("node_sharedmemory").SharedMemory;
    var ivtexture_args = [];
    var textures = { };

    info.textures.forEach(function(desc) {
        var texture_info = { };
        texture_info.width = desc.width;
        texture_info.height = desc.height;
        texture_info.key = desc.key;

        if(!texture_info.width) texture_info.width = 2000;
        if(!texture_info.height) texture_info.height = 2000;
        var shminfo = { width: texture_info.width, height: texture_info.height };
        var tex = new SharedTexture(shminfo, true);
        tex.surface = new graphics.Surface2D(texture_info.width, texture_info.height, tex.buffer);
        texture_info.texture = tex;
        texture_info.timestamp = null;
        ivtexture_args.push("-ivTexture"
            + ":"
            + texture_info.key
            + "=" + shminfo.shm_id
            + "," + shminfo.sem_id
            + "," + shminfo.shm_size
            + "," + shminfo.width
            + "," + shminfo.height
        );
        textures[desc.key] = texture_info;
    });

    this.textures = textures;

    var spawn = require('child_process').spawn;

    if(!info.arguments) info.arguments = [];
    this.process = spawn(info.command, info.arguments.concat(ivtexture_args), info.options);

    this.process.stdout.on('data', function(data) {
        var prefix = info.name + ': stdout > ';
        console.log(prefix_string(prefix, data.toString("utf8").trim()));
    });

    this.process.stderr.on('data', function(data) {
        var prefix = info.name + ': stderr > ';
        console.log(prefix_string(prefix, data.toString("utf8").trim()));
    });

    this.process.on('close', function(code, signal) {
      console.log(info.name + ': terminated with code ' + code + ' signal ' + signal);
    });
};

RenderViewportProcess.prototype.stop = function() {
    this.process.kill("SIGTERM");
    for(var key in this.textures) {
        this.textures[key].texture.shm.delete();
    }
};

var slave_processes = [
    new RenderSlaveProcess({ script: "renderslave.js", index: 0 }),
    new RenderSlaveProcess({ script: "renderslave.js", index: 1 }),
    new RenderSlaveProcess({ script: "renderslave.js", index: 2 }),
    new RenderSlaveProcess({ script: "renderslave.js", index: 3 })
];

var connection = new MessageTransportTCP(configuration, false);
var index = 0;
var workspace = null;

var viewport_processes = { };

var workspace_sync = new WorkspaceSync();
workspace_sync.onUpdate = function() {
    workspace = workspace_sync.workspace;
};

var dataset, synced_object;

connection.onMessage = function(object) {
    // if(object.type == "workspace.set") {
    //     workspace = IV.serializer.deserialize(object.workspace);
    // }
    if(object.type == "viewport.launch") {
        // {
        //   name: "process-name",
        //   command: "command-to-launch",
        //   arguments: ["arg1", "arg2", ...],
        //   options: { env: { ... }, cwd: }
        // }
        if(viewport_processes[object.name]) {
            viewport_processes[object.name].stop();
        }
        viewport_processes[object.name] = new RenderViewportProcess(object);
    }
    if(object.type == "viewport.stop") {
        if(viewport_processes[object.name]) {
            viewport_processes[object.name].stop();
        }
    }
    if(object.type == "panorama.load") {
        panorama_texture.submitImageFile(object.filename, object.stereo_mode);
        panorama_texture_loaded = true;
    }
    if(object.type == "panorama.preload") {
        panorama_texture.preloadImageFile(object.filename);
    }
    if(object.type == "panorama.unload") {
        panorama_texture.unloadImageFile(object.filename);
    }
    if(object.type == "panorama.video.load") {
        loaded_video = new graphics.VideoSurface2D(object.filename);
        loaded_video.stereo_mode = object.stereo_mode;
    }
    if(object.type == "panorama.video.next") {
        loaded_video.nextFrame();
        panorama_texture_loaded = true;
        panorama_texture.submit(loaded_video, loaded_video.stereo_mode);
    }
    if(object.type == "panorama.video.seek") {
        loaded_video.seek(object.timestamp);
    }
    if(object.type == "data.set") {
        var ds = new IV.PlainDataset(object.data, object.schema);
        dataset = new IV.DataObject(ds.obj, ds.schema);
    }
    if(object.type == "data.set.synced") {
        synced_object = new IV.SyncedObjectClient(object.name);
        synced_object.onUpdate = function(data) {
            var ds = new IV.PlainDataset(data, object.schema);
            var data_obj = null;
            if(!data_obj) {
                data_obj = new IV.DataObject(ds.obj, ds.schema);
                dataset = data_obj;
            } else {
                data_obj.updateRoot(ds.obj);
                data_obj.raise("update");
            }
        };
    }
    if(object.type == "data.set.synced.message") {
        synced_object.processMessage(object.message);
    }
    if(object.type == "eval") {
        try {
            eval(object.script);
        } catch(e) {
            console.trace(e);
        }
    }
    workspace_sync.processMessage(object);
};

var before_render, after_render;

var draw_quad_with_pose = function(pose, texture_info) {
    var ex = pose.up.cross(pose.normal).normalize();
    var ey = pose.normal.cross(ex).normalize();

    if(!texture_info) texture_info = { };
    // aspect_ratio = width / height.
    if(texture_info.aspect_ratio === undefined) texture_info.aspect_ratio = 1;

    ex = ex.scale(pose.width / 2);
    ey = ey.scale(pose.width / texture_info.aspect_ratio / 2);
    if(texture_info.flip_y) ey = ey.scale(-1);

    var p1 = pose.center.sub(ex).add(ey);
    var p2 = pose.center.sub(ex).sub(ey);
    var p3 = pose.center.add(ex).sub(ey);
    var p4 = pose.center.add(ex).add(ey);

    GL.begin(GL.QUADS);

    GL.texCoord2f(0, 0);
    GL.normal3f(pose.normal.x, pose.normal.y, pose.normal.z);
    GL.vertex3f(p1.x, p1.y, p1.z);

    GL.texCoord2f(0, 1);
    GL.normal3f(pose.normal.x, pose.normal.y, pose.normal.z);
    GL.vertex3f(p2.x, p2.y, p2.z);

    GL.texCoord2f(1, 1);
    GL.normal3f(pose.normal.x, pose.normal.y, pose.normal.z);
    GL.vertex3f(p3.x, p3.y, p3.z);

    GL.texCoord2f(1, 0);
    GL.normal3f(pose.normal.x, pose.normal.y, pose.normal.z);
    GL.vertex3f(p4.x, p4.y, p4.z);

    GL.end();
};

if(configuration.allosphere) {
    var allosphere = require("node_allosphere");
    allosphere.initialize();

    var panorama_renderer = new EquirectangularRenderer(allosphere);
    var panorama_texture = new EquirectangularTexture(allosphere, false);
    var loaded_video = null;
    var panorama_texture_loaded = false;

    var GL = allosphere.OpenGL;

    // This is called before each frame.
    allosphere.onFrame(function() {
        // Upload textures if necessary.
        slave_processes.forEach(function(slave_process) {
            var tex = slave_process.texture;
            tex.shm.readLock();
            if(tex.timestamp != tex.getTimestamp()) {
                tex.surface.uploadTexture();
                tex.timestamp = tex.getTimestamp();
            }
            tex.shm.readUnlock();
        });
        if(workspace && workspace.viewport_poses) {
            workspace.viewport_poses.forEach(function(item) {
                var tex = viewport_processes[item.name].textures[item.key].texture;
                tex.shm.readLock();
                if(tex.timestamp != tex.getTimestamp()) {
                    tex.surface.uploadTexture();
                    tex.timestamp = tex.getTimestamp();
                }
                tex.shm.readUnlock();
            });
        }
    });

    // Draw your stuff with OpenGL.
    var safe_ondraw = function(info) {
        GL.enable(GL.BLEND);
        // The texture output is in premultiplied alpha!
        GL.blendFunc(GL.ONE, GL.ONE_MINUS_SRC_ALPHA);
        GL.disable(GL.DEPTH_TEST);

        if(panorama_texture_loaded)
            panorama_renderer.render(panorama_texture, info);

        if(before_render) {
            try {
                before_render();
            } catch(e) { }
        }

        var quad_renderers = [];

        if(workspace && workspace.viewport_poses) {
            workspace.viewport_poses.forEach(function(item) {
                quad_renderers.push({
                    distance: item.pose.center.length(),
                    render: function() {
                        var tex = viewport_processes[item.name].textures[item.key].texture;
                        allosphere.shaderBegin(allosphere.shaderDefault());

                        tex.surface.bindTexture(2);

                        allosphere.shaderUniformf("texture", 1.0);
                        allosphere.shaderUniformi("texture0", 2);
                        allosphere.shaderUniformf("lighting", 0);

                        draw_quad_with_pose(item.pose, {
                            aspect_ratio: 1,
                            flip_y: true
                        });

                        tex.surface.unbindTexture(2);

                        allosphere.shaderEnd(allosphere.shaderDefault());
                    }
                });
            });
        }

        slave_processes.forEach(function(slave_process) {
            if(!workspace) return;
            var canvas = workspace.canvases[slave_process.index];
            if(!canvas) return;

            quad_renderers.push({
                distance: canvas.pose.center.length(),
                render: function() {
                    var tex = slave_process.texture;

                    allosphere.shaderBegin(allosphere.shaderDefault());

                    tex.surface.bindTexture(2);

                    allosphere.shaderUniformf("texture", 1.0);
                    allosphere.shaderUniformi("texture0", 2);
                    allosphere.shaderUniformf("lighting", 0);

                    draw_quad_with_pose(canvas.pose);

                    tex.surface.unbindTexture(2);

                    allosphere.shaderEnd(allosphere.shaderDefault());
                }
            });
        });

        quad_renderers.forEach(function(r) {
            r.render();
        });

        // Render 3D objects.
        if(workspace && workspace.objects) {
            workspace.objects.forEach(function(obj) {
                try {
                    allosphere.shaderBegin(allosphere.shaderDefault());
                    allosphere.shaderUniformf("lighting", 1);
                    allosphere.shaderUniformf("texture", 0);
                    GL.shadeModel(GL.SMOOTH);
                    GL.hint(GL.LINE_SMOOTH_HINT, GL.NICEST);
                    GL.blendFunc(GL.SRC_ALPHA, GL.ONE_MINUS_SRC_ALPHA);
                    GL.enable(GL.DEPTH_TEST);
                    GL.lightfv(GL.LIGHT0, GL.POSITION, [ 0, 0, 2 ]);
                    GL.lightfv(GL.LIGHT0, GL.AMBIENT, [ 1, 1, 1, 1 ]);
                    obj.render({ GL: GL }, dataset);
                    allosphere.shaderEnd(allosphere.shaderDefault());
                } catch(e) { }
            });
        }

        if(after_render) {
            try {
                after_render();
            } catch(e) { }
        }
        GL.flush();
    };

    allosphere.onDraw(function(info) {
        try {
            safe_ondraw(info);
        } catch(e) {
            console.trace(e);
        }
    });

    // Main event loop.
    var timer = setInterval(function() {
        allosphere.tick();
    }, 10);

}

var should_exit = false;
var safe_exit = function() {
    should_exit = true;
    clearInterval(timer);
    slave_processes.forEach(function(p) {
        p.stop();
    });
    for(var name in viewport_processes) {
        viewport_processes[name].stop();
    }
    connection.close();
    console.log("SIGTERM");
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
