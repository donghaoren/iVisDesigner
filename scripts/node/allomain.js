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
{{include: allofwutils.js}}

var configuration = require("./alloconfig");

G_render_config = {
    radius: 5,
    chart_mode: "mono"
};

G_viewport_restriction_socket = null;


var prefix_string = function(prefix, str) {
    return prefix + str.replace(/[\r\n]/g, "\n").replace(/[\n]/g, "\n" + prefix);
};

var RenderSlaveProcess = function(info) {
    var SharedMemory = require("allofw").SharedMemory;
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
    var SharedMemory = require("allofw").SharedMemory;
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

var light_position = new IV.Vector3(0, 0, 0);

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
        console.log("Loading panorama...");
        panorama_texture.submitImageFile(object.filename, object.stereo_mode);
        panorama_texture_loaded = true;
        console.log("Loading panorama done");
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
            console.log(e.stack);
        }
    }
    if(object.type == "pose.set_rotation_z") {
        var q = IV.Quaternion.rotation(new IV.Vector3(0, 0, 1), object.angle);
        omnistereo.setPose(0, 0, 0, q.v.y, q.v.z, q.v.x, q.w);
    }
    if(object.type == "viewport_restriction") {
        var code = IV.multiline(function() {/*@preserve
            uniform vec2 viewport_angles = vec2(50, 40);
            uniform float viewport_blur = 1;
            uniform vec3 viewport_y = vec3(0, 1, 0);
            uniform vec3 viewport_x = vec3(1, 0, 0);
            uniform int calibrate_mode = 0;
            uniform int background_affected = 0;

            vec4 omni_composite_panorama_no_rotation() {
                vec3 panov = warp;
                float theta = atan(-panov.x, panov.z);
                float phi = atan(panov.y, length(panov.xz));
                vec4 panorama_color = texture(texPanorama, vec2((theta / PI + 1.0) / 2, -phi / PI + 0.5));
                return panorama_color;
            }

            vec4 viewport_restrict(vec4 color) {
                float blur = 1.0 / (viewport_blur / 180.0 * PI);
                vec2 xyspan = viewport_angles / 180.0 * PI;
                vec3 viewport_z = cross(viewport_y, viewport_x);
                vec3 warp_x = normalize(warp - viewport_y * dot(warp, viewport_y));
                vec3 warp_y = normalize(warp - viewport_x * dot(warp, viewport_x));
                vec2 xyangle = vec2(atan(dot(warp_x, viewport_x), dot(warp_x, viewport_z)),
                                    atan(dot(warp_y, viewport_y), dot(warp_y, viewport_z)));
                xyangle = abs(xyangle);
                vec2 xyscale = vec2(1, 1) - max(vec2(0, 0), min(vec2(1, 1), (xyspan / 2.0 - xyangle) * blur));
                float scale = max(0, (1 - dot(xyscale, xyscale)));
                if(calibrate_mode == 0) {
                    float scale_color = (scale - 0.5) * (scale - 0.5) * 4.0;
                    return omni_blend_pm(vec4(0, 0, 0, 1.0 - scale_color), color * scale);
                } else {
                    return vec4(scale, scale, scale, 1);
                }
            }

            void main() {
                omni_composite_init();
                vec4 scene = omni_composite_scene();
                if(background_affected == 0) {
                    scene = viewport_restrict(scene);
                }
                if((drawMask & kCompositeMask_Panorama) != 0) {
                    vec4 panorama;
                    if(background_affected == 0) {
                        panorama = omni_composite_panorama_no_rotation();
                    } else {
                        panorama = omni_composite_panorama();
                    }
                    scene = omni_blend_pm(scene, panorama);
                }
                if(background_affected != 0) {
                    scene = viewport_restrict(scene);
                }
                omni_composite_final(scene);
            }
        */console.log});

        if(G_viewport_restriction_socket) {
            G_viewport_restriction_socket.close();
            G_viewport_restriction_socket = null;
        }
        if(object.mode == "disabled") {
            omnistereo.compositeRestoreShader();
        } else {
            var shader = omnistereo.compositeCustomizeShader(code);
            var zmq = require("zmq");
            var sub = zmq.socket("sub");
            // sub.connect(configuration.broadcast_phasespace[require("os").hostname()]);
            sub.connect("tcp://192.168.10.80:60155");
            sub.subscribe("");
            sub.on("message", function(msg) {
                var data = JSON.parse(msg.toString("utf-8"));
                if(data.type == "view_angles") {
                    GL.useProgram(shader);
                    GL.uniform2f(GL.getUniformLocation(shader, "viewport_angles"), data.x, data.y);
                    GL.useProgram(0);
                }
                if(data.type == "view_directions") {
                    GL.useProgram(shader);
                    GL.uniform3f(GL.getUniformLocation(shader, "viewport_x"), data.vp_x.x, data.vp_x.y, data.vp_x.z);
                    GL.uniform3f(GL.getUniformLocation(shader, "viewport_y"), data.vp_y.x, data.vp_y.y, data.vp_y.z);
                    GL.useProgram(0);
                    omnistereo.setPose(data.pose.x, data.pose.y, data.pose.z,
                        data.pose.qx, data.pose.qy, data.pose.qz, data.pose.qw);
                }
                if(data.type == "calibrate_mode") {
                    GL.useProgram(shader);
                    GL.uniform1i(GL.getUniformLocation(shader, "calibrate_mode"), data.value);
                    GL.useProgram(0);
                }
            });
            G_viewport_restriction_socket = sub;
            if(object.mode == "content") {
                GL.useProgram(shader);
                GL.uniform1i(GL.getUniformLocation(shader, "background_affected"), 0);
                GL.useProgram(0);
            }
            if(object.mode == "both") {
                GL.useProgram(shader);
                GL.uniform1i(GL.getUniformLocation(shader, "background_affected"), 1);
                GL.useProgram(0);
            }
        }
    }
    if(object.type == "light.position") {
        light_position.x = object.x;
        light_position.y = object.y;
        light_position.z = object.z;
    }
    if(object.type == "stereo.mode") {
        // mono or stereo.
        if(object.mode == "stereo")
            G_render_config.chart_mode = "stereo";
        if(object.mode == "hybrid")
            G_render_config.chart_mode = "mono";
        if(object.mode == "mono") {
            G_render_config.chart_mode = "mono";
            omnistereo.setLens(0, 5);
        } else {
            omnistereo.setLens(0.065, 5);
        }
    }
    if(object.type == "chart.mode") {
        // mono or stereo.
        G_render_config.chart_mode = object.mode;
    }
    workspace_sync.processMessage(object);
};

var draw_quad_shader = null;

function draw_quad_shader_create() {
    draw_quad_shader = compileShaders(GL,
        "#version 330\n" + omnistereo.getShaderCode() + "\n" + IV.multiline(function() {/*@preserve
            uniform vec3 uCenter, uEx, uEy;
            uniform int tweak_depth;
            layout(location = 0) in vec2 vertex;
            out vec4 clip_position;
            out vec2 tex_coord;

            vec4 iv_to_al(in vec4 v) {
                return vec4(v.y, v.z, v.x, v.w);
            }
            vec3 iv_to_al_3(in vec3 v) {
                return vec3(v.y, v.z, v.x);
            }
            void main() {
                vec2 T = vertex;
                vec3 position = uCenter + uEx * (T.x * 2.0 - 1.0) + uEy * (1.0 - T.y * 2.0);
                if(tweak_depth == 1) {
                    position = position * 5.0 / length(position);
                }
                tex_coord = T.xy;
                gl_Position = omni_render(omni_transform(position));
                clip_position = gl_Position;
            }
        */console.log}),
        "#version 330\n" + omnistereo.getShaderCode() + "\n" + IV.multiline(function() {/*@preserve
            uniform int tweak_depth;
            uniform sampler2D texture0;
            in vec4 clip_position;
            in vec2 tex_coord;
            layout(location = 0) out vec4 fragment_color;
            void main() {
                // Shading.
                fragment_color = texture(texture0, tex_coord);
                vec4 clip = clip_position;
                // Depth adjustments.
                // if(tweak_depth == 1 && tweak_depth == 0) {
                //     vec3 pixel_position;
                //     pixel_position.xy = clip_position.xy;
                //     pixel_position.z = -clip_position.w;
                //     pixel_position = pixel_position * (5.0 / length(pixel_position));
                //     float z2 = (pixel_position.z * (omni_far + omni_near) + omni_far * omni_near * 2.0f) / (omni_near - omni_far);
                //     gl_FragDepth = (z2 / -pixel_position.z * 0.5 + 0.5);
                // } else {
                //     gl_FragDepth = gl_FragCoord.z;
                // }
            }
        */console.log})
    );
}

var before_render, after_render;

var draw_quad_with_pose_array = null;
var draw_quad_with_pose_array_buffer = null;
var draw_quad_with_pose_array_slices = 50;
function draw_quad_with_pose_build_array() {
    if(draw_quad_with_pose_array == null) {
        draw_quad_with_pose_array = new GL.VertexArray();
        draw_quad_with_pose_array_buffer = new GL.Buffer();
        GL.bindVertexArray(draw_quad_with_pose_array)
        GL.bindBuffer(GL.ARRAY_BUFFER, draw_quad_with_pose_array_buffer);
        var slices = draw_quad_with_pose_array_slices;
        var idx = 0;
        var array_data = new Float32Array(slices * slices * 12);
        for(var x = 0; x < slices; x++) {
            for(var y = 0; y < slices; y++) {
                var xk1 = x / slices;
                var yk1 = y / slices;
                var xk2 = (x + 1) / slices;
                var yk2 = (y + 1) / slices;
                array_data[idx++] = xk1;
                array_data[idx++] = yk1;
                array_data[idx++] = xk1;
                array_data[idx++] = yk2;
                array_data[idx++] = xk2;
                array_data[idx++] = yk2;

                array_data[idx++] = xk1;
                array_data[idx++] = yk1;
                array_data[idx++] = xk2;
                array_data[idx++] = yk2;
                array_data[idx++] = xk2;
                array_data[idx++] = yk1;
            }
        }
        var buf = new Buffer(array_data.length * 4);
        for(var i = 0; i < array_data.length; i++) {
            buf.writeFloatLE(array_data[i], i * 4);
        }
        GL.bufferData(GL.ARRAY_BUFFER, 4 * array_data.length, buf, GL.STATIC_DRAW);
        GL.enableVertexAttribArray(0)
        GL.vertexAttribPointer(0, 2, GL.FLOAT, GL.FALSE, 8, 0)
        GL.bindVertexArray(0)
    }
}

var draw_quad_with_pose = function(pose, texture_info) {
    draw_quad_with_pose_build_array();

    var ex = pose.up.cross(pose.normal).normalize();
    var ey = pose.normal.cross(ex).normalize();

    if(!texture_info) texture_info = { };
    // aspect_ratio = width / height.
    if(texture_info.aspect_ratio === undefined) texture_info.aspect_ratio = 1;

    ex = ex.scale(pose.width / 2);
    ey = ey.scale(pose.width / texture_info.aspect_ratio / 2);
    if(texture_info.flip_y) ey = ey.scale(-1);

    GL.uniform3f(GL.getUniformLocation(draw_quad_shader, "uCenter"), pose.center.y, pose.center.z, pose.center.x);
    GL.uniform3f(GL.getUniformLocation(draw_quad_shader, "uEx"), ex.y, ex.z, ex.x);
    GL.uniform3f(GL.getUniformLocation(draw_quad_shader, "uEy"), ey.y, ey.z, ey.x);

    GL.bindVertexArray(draw_quad_with_pose_array);
    GL.drawArrays(GL.TRIANGLES, 0, draw_quad_with_pose_array_slices * draw_quad_with_pose_array_slices * 6);
    GL.bindVertexArray(0);

    var err = GL.getError();
    if(err) console.log("draw_quad_with_pose:", err);

    // GL.begin(GL.QUADS);

    // var subdiv = 30;
    // //if(chart_mode == "stereo") subdiv = 10;

    // for(var x = 0; x < subdiv; x++) {
    //     for(var y = 0; y < subdiv; y++) {
    //         var tx1 = x / subdiv;
    //         var ty1 = y / subdiv;
    //         var tx2 = (x + 1) / subdiv;
    //         var ty2 = (y + 1) / subdiv;
    //         var p1 = pose.center.add(ex.scale(tx1 * 2 - 1)).add(ey.scale(1 - ty1 * 2));
    //         var p2 = pose.center.add(ex.scale(tx1 * 2 - 1)).add(ey.scale(1 - ty2 * 2));
    //         var p3 = pose.center.add(ex.scale(tx2 * 2 - 1)).add(ey.scale(1 - ty2 * 2));
    //         var p4 = pose.center.add(ex.scale(tx2 * 2 - 1)).add(ey.scale(1 - ty1 * 2));

    //         if(chart_mode == "mono") {
    //             p1 = p1.scale(5 / p1.length());
    //             p2 = p2.scale(5 / p2.length());
    //             p3 = p3.scale(5 / p3.length());
    //             p4 = p4.scale(5 / p4.length());
    //         }

    //         GL.texCoord2f(tx1, ty1);
    //         GL.normal3f(pose.normal.x, pose.normal.y, pose.normal.z);
    //         GL.vertex3f(p1.x, p1.y, p1.z);

    //         GL.texCoord2f(tx1, ty2);
    //         GL.normal3f(pose.normal.x, pose.normal.y, pose.normal.z);
    //         GL.vertex3f(p2.x, p2.y, p2.z);

    //         GL.texCoord2f(tx2, ty2);
    //         GL.normal3f(pose.normal.x, pose.normal.y, pose.normal.z);
    //         GL.vertex3f(p3.x, p3.y, p3.z);

    //         GL.texCoord2f(tx2, ty1);
    //         GL.normal3f(pose.normal.x, pose.normal.y, pose.normal.z);
    //         GL.vertex3f(p4.x, p4.y, p4.z);
    //     }
    // }
    // GL.end();
};

if(configuration.allosphere) {
    var allofw = require("allofw");
    var GL = allofw.GL3;
    var allofw_window = new allofw.OpenGLWindow({ config: "allofw.yaml" });
    allofw_window.makeContextCurrent();
    var omnistereo = new allofw.OmniStereo({ config: "allofw.yaml" });

    var navigation = null;

    if(configuration.test_mode) {
        navigation = new (require("allofwutils").WindowNavigation)(allofw_window, omnistereo);
        // allosphere.setProjectionMode("perspective");
        // allosphere.setStereoMode("anaglyph");
        // allosphere.enableWindowNavigation();
        // allosphere.capture = function(x, y, w, h, file) {
        //     var buffer = allosphere.screenCapture(x, y, w, h);
        //     var img = graphics.Surface2D(w, h, buffer);
        //     img.save(file);
        // }
        //allosphere.setLens(5.0 / 8.0, 5.0);
    }

    // var panorama_renderer = new EquirectangularRenderer(allosphere);
    var panorama_texture = new EquirectangularTexture();

    var loaded_video = null;
    var panorama_texture_loaded = false;

    draw_quad_shader_create();

    // Draw your stuff with OpenGL.
    var safe_ondraw = function(info) {
        GL.clearColor(0, 0, 0, 0);
        GL.clear(GL.COLOR_BUFFER_BIT | GL.DEPTH_BUFFER_BIT);
        GL.enable(GL.BLEND);
        // The texture output is in premultiplied alpha!
        GL.blendFunc(GL.ONE, GL.ONE_MINUS_SRC_ALPHA);
        GL.enable(GL.DEPTH_TEST);

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
                        GL.useProgram(draw_quad_shader);

                        tex.surface.bindTexture(2);

                        omnistereo.setUniforms(draw_quad_shader.id())
                        GL.uniform1i(GL.getUniformLocation(draw_quad_shader, "texture0"), 2);
                        GL.uniform1i(GL.getUniformLocation(draw_quad_shader, "tweak_depth"), G_render_config.chart_mode == "mono" ? 1 : 0);

                        draw_quad_with_pose(item.pose, {
                            aspect_ratio: 1,
                            flip_y: true
                        });

                        tex.surface.unbindTexture(2);

                        GL.useProgram(0);
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

                    GL.useProgram(draw_quad_shader);

                    tex.surface.bindTexture(2);

                    GL.uniform1i(GL.getUniformLocation(draw_quad_shader, "texture0"), 2);
                    GL.uniform1i(GL.getUniformLocation(draw_quad_shader, "tweak_depth"), G_render_config.chart_mode == "mono" ? 1 : 0);
                    omnistereo.setUniforms(draw_quad_shader.id())

                    draw_quad_with_pose(canvas.pose);

                    tex.surface.unbindTexture(2);

                    GL.useProgram(0);
                }
            });
        });

        // Render 3D objects.
        if(workspace && workspace.objects) {
            workspace.canvases.forEach(function(obj) {
                obj.visualization.validate(dataset);
            });
            workspace.objects.forEach(function(obj) {
                try {
                    // GL.shadeModel(GL.SMOOTH);
                    // GL.lightfv(GL.LIGHT0, GL.POSITION, [ light_position.x, light_position.y, light_position.z, 1 ]);
                    // GL.lightfv(GL.LIGHT0, GL.AMBIENT, [ 0.3, 0.3, 0.3, 1 ]);
                    // GL.lightfv(GL.LIGHT0, GL.DIFFUSE, [ 0.7, 0.7, 0.7, 1 ]);
                    // GL.lightfv(GL.LIGHT0, GL.SPECULAR, [ 1, 1, 1, 1 ]);
                    obj.render3D({ GL: GL, omnistereo: omnistereo, order: "back" }, dataset);
                } catch(e) {
                    console.log(e.stack);
                }
            });
        }

        GL.blendFunc(GL.ONE, GL.ONE_MINUS_SRC_ALPHA);
        quad_renderers.forEach(function(r) {
            r.render();
        });

        // Render 3D objects.
        if(workspace && workspace.objects) {
            workspace.canvases.forEach(function(obj) {
                obj.visualization.validate(dataset);
            });
            workspace.objects.forEach(function(obj) {
                try {
                    // GL.shadeModel(GL.SMOOTH);
                    // GL.lightfv(GL.LIGHT0, GL.POSITION, [ light_position.x, light_position.y, light_position.z, 1 ]);
                    // GL.lightfv(GL.LIGHT0, GL.AMBIENT, [ 0.3, 0.3, 0.3, 1 ]);
                    // GL.lightfv(GL.LIGHT0, GL.DIFFUSE, [ 0.7, 0.7, 0.7, 1 ]);
                    // GL.lightfv(GL.LIGHT0, GL.SPECULAR, [ 1, 1, 1, 1 ]);
                    obj.render3D({ GL: GL, omnistereo: omnistereo, order: "front" }, dataset);
                } catch(e) {
                    console.log(e.stack);
                }
            });
        }

        if(after_render) {
            try {
                after_render();
            } catch(e) { }
        }
        GL.blendFunc(GL.SRC_ALPHA, GL.ONE_MINUS_SRC_ALPHA);
        GL.flush();
    };

    omnistereo.onCaptureViewport(function() {
        try {
            safe_ondraw({ });
        } catch(e) {
            console.log(e.stack);
        }
    });

    // This is called before each frame.
    var on_frame = function() {
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
    };

    var on_refresh = function() {
        var size = allofw_window.getFramebufferSize();
        on_frame();
        omnistereo.capture();
        GL.clearColor(0, 0, 0, 0);
        GL.clear(GL.COLOR_BUFFER_BIT | GL.DEPTH_BUFFER_BIT);
        GL.disable(GL.DEPTH_TEST);
        GL.disable(GL.BLEND);
        var composite_info = { };
        if(panorama_texture_loaded) {
            composite_info.panorama = [ panorama_texture.get(0).id(), panorama_texture.get(1).id() ];
        }
        omnistereo.composite(0, 0, size[0], size[1], composite_info);
        allofw_window.swapBuffers();
    };

    allofw_window.onResize(function() {
        on_refresh();
    });


    // Main event loop.
    var timer = setInterval(function() {
        if(navigation) navigation.update();
        on_refresh();
        allofw_window.pollEvents();
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

console.log("READY");
