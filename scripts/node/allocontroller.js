// iVisDesigner - scripts/node/allocontroller.js
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

var webgl_view = document.getElementById("webgl-view");
var GL = webgl_view.getContext("webgl") || webgl_view.getContext("experimental-webgl");

{{include: alloutil.js}}

var CanvasRenderer = function(index) {
    var self = this;
    this.canvas = document.createElement("canvas");
    this.canvas.width = 512;
    this.canvas.height = 512;
    this.manager = new IV.CanvasManager(512, 512);
    this.renderer = new IV.Renderer();
    this.renderer.setCanvasManager(this.manager);
    this.manager.add("main", this.canvas);
    this.texture = GL.createTexture();
    GL.bindTexture(GL.TEXTURE_2D, this.texture);
    GL.pixelStorei(GL.UNPACK_FLIP_Y_WEBGL, true);
    GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_WRAP_S, GL.CLAMP_TO_EDGE);
    GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_WRAP_T, GL.CLAMP_TO_EDGE);
    GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MAG_FILTER, GL.LINEAR);
    GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MIN_FILTER, GL.LINEAR_MIPMAP_LINEAR);
    GL.bindTexture(GL.TEXTURE_2D, null);
    this.renderer.bind("main:before", function(data, context) {
        if(!self.vis) return;
        var color = self.vis.background ? self.vis.background : new IV.Color(0, 0, 0, 0);
        context.save();
        context.setTransform(1, 0, 0, 1, 0, 0);
        context.rect(0, 0, self.canvas.width, self.canvas.height);
        context.fillStyle = color.toRGBA();
        context.globalCompositionOperation = "copy";
        context.fill();
        context.restore();
    });
};

CanvasRenderer.prototype.render = function(vis, data) {
    if(this.vis != vis || this.data != data) {
        this.vis = vis;
        this.data = data;
        this.renderer.trigger("main");
        this.renderer.setData(data);
        this.renderer.setVisualization(vis);
    }
    this.renderer.autoView(vis);
    vis.triggerRenderer(this.renderer);
    this.renderer.trigger("main");
    var r = this.renderer.render();
    if(r) {
        GL.bindTexture(GL.TEXTURE_2D, this.texture);
        GL.texImage2D(GL.TEXTURE_2D, 0, GL.RGBA, GL.RGBA, GL.UNSIGNED_BYTE, this.canvas);
        GL.generateMipmap(GL.TEXTURE_2D);
        GL.bindTexture(GL.TEXTURE_2D, null);
    }
    return r;
};

CanvasRenderer.prototype.bind = function(index) {
    if(index === undefined) index = 0;
    GL.activeTexture(GL.TEXTURE0 + index);
    GL.bindTexture(GL.TEXTURE_2D, this.texture);
    GL.activeTexture(GL.TEXTURE0);
};

CanvasRenderer.prototype.unbind = function(index) {
    if(index === undefined) index = 0;
    GL.activeTexture(GL.TEXTURE0 + index);
    GL.bindTexture(GL.TEXTURE_2D, null);
    GL.activeTexture(GL.TEXTURE0);
};

var PlaceholderRenderer = function(name, key) {
    this.canvas = document.createElement("canvas");
    this.canvas.width = 512;
    this.canvas.height = 512;
    var context = this.canvas.getContext("2d");
    context.textAlign = "center";
    context.fillStyle = "rgba(128, 128, 128, 0.5)";
    context.rect(0, 0, 512, 512);
    context.fill();
    context.fillStyle = "white";
    context.font = "64px Arial";
    context.fillText(name, 256, 220);
    context.fillText(key, 256, 300);
    this.texture = GL.createTexture();
    GL.bindTexture(GL.TEXTURE_2D, this.texture);
    GL.pixelStorei(GL.UNPACK_FLIP_Y_WEBGL, true);
    GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_WRAP_S, GL.CLAMP_TO_EDGE);
    GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_WRAP_T, GL.CLAMP_TO_EDGE);
    GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MAG_FILTER, GL.LINEAR);
    GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MIN_FILTER, GL.LINEAR_MIPMAP_LINEAR);
    GL.texImage2D(GL.TEXTURE_2D, 0, GL.RGBA, GL.RGBA, GL.UNSIGNED_BYTE, this.canvas);
    GL.generateMipmap(GL.TEXTURE_2D);
    GL.bindTexture(GL.TEXTURE_2D, null);
};

PlaceholderRenderer.prototype.bind = function(index) {
    if(index === undefined) index = 0;
    GL.activeTexture(GL.TEXTURE0 + index);
    GL.bindTexture(GL.TEXTURE_2D, this.texture);
    GL.activeTexture(GL.TEXTURE0);
};

PlaceholderRenderer.prototype.unbind = function(index) {
    if(index === undefined) index = 0;
    GL.activeTexture(GL.TEXTURE0 + index);
    GL.bindTexture(GL.TEXTURE_2D, null);
    GL.activeTexture(GL.TEXTURE0);
};

var renders = [];
function getRenderer(index) {
    if(!renders[index]) renders[index] = new CanvasRenderer();
    return renders[index];
}

var placeholders = { };
function getViewportPlaceholder(name, key) {
    var idx = name + "." + key;
    if(!placeholders[idx]) placeholders[idx] = new PlaceholderRenderer(name, key);
    return placeholders[idx];
}

var QuadRenderer = function() {
    this.buffer = GL.createBuffer();
    GL.bindBuffer(GL.ARRAY_BUFFER, this.buffer);
    var vertices = [
        +1.0, +1.0, 0.0,
        -1.0, +1.0, 0.0,
        +1.0, -1.0, 0.0,
        -1.0, -1.0, 0.0
    ];
    GL.bufferData(GL.ARRAY_BUFFER, new Float32Array(vertices), GL.STATIC_DRAW);

    var vertex_code = IV.multiline(function() {/*!
        attribute vec3 aVertexPosition;
        uniform vec3 uCenter, uNormal, uUp;
        uniform float uWidth;
        uniform mat4 uMVMatrix, uPMatrix;

        varying highp vec2 texCoord;

        void main(void) {
          vec3 ex = normalize(cross(uUp, uNormal));
          vec3 ey = normalize(cross(uNormal, ex));
          ex *= uWidth / 2.0;
          ey *= uWidth / 2.0;
          vec3 p = uCenter + ex * aVertexPosition.x + ey * aVertexPosition.y;
          texCoord.x = (aVertexPosition.x + 1.0) / 2.0;
          texCoord.y = (aVertexPosition.y + 1.0) / 2.0;
          gl_Position = uPMatrix * uMVMatrix * vec4(p, 1.0);
        }
    */});

    var fragment_code = IV.multiline(function() {/*!
        uniform sampler2D uSampler;
        varying highp vec2 texCoord;

        void main(void) {
            gl_FragColor = texture2D(uSampler, texCoord);
        }
    */});

    this.shader = new ShaderProgram(vertex_code, fragment_code);

    this.paVertexPosition = GL.getAttribLocation(this.shader.program, "aVertexPosition");
    GL.enableVertexAttribArray(this.paVertexPosition);

    this.puCenter = GL.getUniformLocation(this.shader.program, "uCenter");
    this.puUp = GL.getUniformLocation(this.shader.program, "uUp");
    this.puNormal = GL.getUniformLocation(this.shader.program, "uNormal");
    this.puWidth = GL.getUniformLocation(this.shader.program, "uWidth");
    this.puMVMatrix = GL.getUniformLocation(this.shader.program, "uMVMatrix");
    this.puPMatrix = GL.getUniformLocation(this.shader.program, "uPMatrix");
    this.puSampler = GL.getUniformLocation(this.shader.program, "uSampler");
};
QuadRenderer.prototype.render = function(info, pose) {
    this.shader.begin();
    GL.uniform3f(this.puCenter, pose.center.x, pose.center.y, pose.center.z);
    GL.uniform3f(this.puNormal, pose.normal.x, pose.normal.y, pose.normal.z);
    GL.uniform3f(this.puUp, pose.up.x, pose.up.y, pose.up.z);
    GL.uniform1f(this.puWidth, pose.width);
    GL.uniform1i(this.puSampler, 2);

    GL.uniformMatrix4fv(this.puPMatrix, false, info.projection);
    GL.uniformMatrix4fv(this.puMVMatrix, false, info.modelview);

    GL.bindBuffer(GL.ARRAY_BUFFER, this.buffer);
    GL.vertexAttribPointer(this.paVertexPosition, 3, GL.FLOAT, false, 0, 0);
    GL.drawArrays(GL.TRIANGLE_STRIP, 0, 4);
    this.shader.end();
};

QuadRenderer.prototype.select = function(center, direction, pose) {
    var t = pose.center.sub(center).dot(pose.normal) / direction.dot(pose.normal);
    if(t < 0) return null;
    var intersection = center.add(direction.scale(t));
    var ex = pose.up.cross(pose.normal).normalize();
    var ey = pose.normal.cross(ex).normalize();
    var x = intersection.sub(pose.center).dot(ex);
    var y = intersection.sub(pose.center).dot(ey);
    if(Math.abs(x) < pose.width / 2 && Math.abs(y) < pose.width / 2) {
        return t;
    }
    return null;
};

QuadRenderer.prototype.movePose = function(center, d0, d1, pose0) {
    var angle = Math.acos(d0.normalize().dot(d1.normalize()));
    var axis = d0.cross(d1).normalize();
    var q = IV.Quaternion.rotation(axis, angle);
    return {
        center: q.rotate(pose0.center),
        normal: q.rotate(pose0.normal),
        up: pose0.up,
        width: pose0.width
    };
};

var quad_renderer = new QuadRenderer();
var cubemap = new CubemapRenderTarget();
var cubemap_renderer = new CubemapRenderer();
var allosphere_model = new AllosphereModel();
var view_mode = "cubemap";

function render_scene(info) {
    GL.clearColor(1, 1, 1, 1);
    GL.enable(GL.DEPTH_TEST);
    GL.clear(GL.COLOR_BUFFER_BIT | GL.DEPTH_BUFFER_BIT);
    GL.enable(GL.BLEND);
    GL.blendFunc(GL.SRC_ALPHA, GL.ONE_MINUS_SRC_ALPHA);
    allosphere_model.render(info);
    if(workspace) {
        for(var c in workspace.canvases) {
            var canvas = workspace.canvases[c];
            var canvas_texture = getRenderer(c);
            canvas_texture.bind(2);
            quad_renderer.render(info, canvas.pose);
            canvas_texture.unbind(2);
        }
        if(workspace.viewport_poses) {
            workspace.viewport_poses.forEach(function(item) {
                var canvas_texture = getViewportPlaceholder(item.name, item.key);
                canvas_texture.bind(2);
                quad_renderer.render(info, item.pose);
                canvas_texture.unbind(2);
            });
        }
    }
}

function render_webgl_view() {
    if(view_mode == "cubemap") {
        cubemap.capture(render_scene);

        GL.viewport(0, 0, webgl_view.width, webgl_view.height);
        GL.clearColor(0, 0, 0, 1);
        GL.clear(GL.COLOR_BUFFER_BIT | GL.DEPTH_BUFFER_BIT);
        GL.enable(GL.BLEND);
        GL.blendFunc(GL.SRC_ALPHA, GL.ONE_MINUS_SRC_ALPHA);
        GL.disable(GL.DEPTH_TEST);
        cubemap_renderer.render(cubemap);
    }
}

$(window).resize(function() {
    var glview_size = Math.min($(window).width(), $(window).height());
    webgl_view.width = glview_size * 2;
    webgl_view.height = glview_size * 2;
    $(webgl_view).width(glview_size);
    $(webgl_view).height(glview_size);
    render_webgl_view();
}).resize();

var synced_object, dataset, workspace;

var scene_updated = false;
var update_blocker = 0;
var updateHandler = function() {
    if(update_blocker == 0) {
        if(scene_updated) {
            scene_updated = false;
            try {
                if(workspace) {
                    for(var c in workspace.canvases) {
                        var canvas = workspace.canvases[c];
                        if(dataset) getRenderer(c).render(canvas.visualization, dataset);
                    }
                }
                render_webgl_view();
            } catch(e) { }
        }
    }
    setTimeout(updateHandler, 200);
};

setTimeout(updateHandler, 200);

var workspace_sync = new WorkspaceSync();
workspace_sync.onUpdate = function(parameters) {
    workspace = workspace_sync.workspace;
    if(workspace) {
        if(parameters && parameters.is_pose_update) {
            render_webgl_view();
        } else {
            scene_updated = true;
            render_webgl_view();
        }
    }
};

var onMessage = function(object) {
    console.log("Message: " + object.type);
    if(object.type == "data.set") {
        var ds = new IV.PlainDataset(object.data, object.schema);
        dataset = new IV.DataObject(ds.obj, ds.schema);
    }
    if(object.type == "data.set.synced") {
        synced_object = new IV.SyncedObjectClient(object.name);
        synced_object.onUpdate = function(data) {
            var ds = new IV.PlainDataset(data, object.schema);
            if(!dataset) {
                dataset = new IV.DataObject(ds.obj, ds.schema);
            } else {
                dataset.updateRoot(ds.obj);
                dataset.raise("update");
            }
            scene_updated = true;
        };
    }
    if(object.type == "data.set.synced.message") {
        synced_object.processMessage(object.message);
    }
    workspace_sync.processMessage(object);
};

(function() {
    var url = IV_Config.api_base + "/ws/";
    if(url.substr(0, 4) == 'http') {
        url = IV_Config.api_base.replace(/^http/, "ws");
    } else {
        url = window.location.protocol.replace(/^http/, "ws") + "//" + window.location.host + IV_Config.api_base + "ws/";
    }
    if(IV_Config.url_websocket) url = IV_Config.url_websocket;
    var ws = new Wampy(url, { realm: "anonymous" });

    ws.subscribe("iv.allosphere.message", function(message) {
        var content = JSON.parse(message);
        onMessage(content);
    });

    postMessage = function(data) {
        ws.publish("iv.allosphere.message", JSON.stringify(data));
    };
})();

var postActions = function(actions, parameters) {
    var actions_send = workspace_sync.serializer.serialize({ "actions": actions });
    postMessage({
        type: "sync.perform",
        actions: actions_send,
        parameters: parameters
    });
    actions.forEach(function(act) {
        act.perform();
    });
};

var get_viewport_coordinates = function(e) {
    var x = e.pageX - $("#webgl-view").offset().left;
    var y = e.pageY - $("#webgl-view").offset().top;
    x = x / $("#webgl-view").width() * 2.0 - 1.0;
    y = y / $("#webgl-view").height() * 2.0 - 1.0;
    y = -y;
    return [ x, y ];
};

var get_viewport_coordinates_hammer = function(e) {
    var x = e.center.x;
    var y = e.center.y;
    x = x / $("#webgl-view").width() * 2.0 - 1.0;
    y = y / $("#webgl-view").height() * 2.0 - 1.0;
    y = -y;
    return [ x, y ];
};


var beginTrackMouse = function(on_down, on_free_move) {
    var is_mouse_down = false;
    $("#webgl-view").mousedown(function(e) {
        var context = on_down(e);
        is_mouse_down = true;
        if(!context) context = null;
        var f_move = function(e) {
            if(context.move) context.move(e);
        };
        var f_up = function(e) {
            $(window).unbind("mousemove", f_move);
            $(window).unbind("mouseup", f_up);
            is_mouse_down = false;
            if(context.up) context.up(e);
        };
        $(window).bind("mousemove", f_move);
        $(window).bind("mouseup", f_up);
    });
    $(window).bind("mousemove", function(e) {
        if(!is_mouse_down && on_free_move) {
            on_free_move(e);
        }
    });
};

function ensure_distance(pose) {
    sphere_radius = 5;
    var angle = Math.atan(Math.sqrt(2) * pose.width / 2 / pose.center.length());
    pose.width = sphere_radius * Math.sin(angle) * 2 / Math.sqrt(2);
    pose.center = pose.center.normalize().scale(sphere_radius * Math.cos(angle));
};

(function() {
    var multitouch_input = new Hammer(document.getElementById("webgl-view"), {});
    multitouch_input.get('pinch').set({ enable: true });

    function get_coordinates(event) {
        return new IV.Vector(event.center.x, event.center.y);
    }

    var find_canvas = function(center, direction) {
        if(!workspace) return null;
        var tmin = 1e10;
        var candidate = null;
        for(var c in workspace.canvases) {
            var canvas = workspace.canvases[c];
            var t = quad_renderer.select(center, direction, canvas.pose);
            if(t !== null && t < tmin) {
                tmin = t;
                candidate = canvas;
            }
        }
        if(workspace.viewport_poses) {
            workspace.viewport_poses.forEach(function(item) {
                var t = quad_renderer.select(center, direction, item.pose);
                if(t !== null && t < tmin) {
                    tmin = t;
                    candidate = item;
                }
            });
        }
        return candidate;
    };

    var pan_move = null;
    var pan_end = null;
    var pan_initial = function(xy) {
        pan_move = null;
        pan_end = null;
        var ray = cubemap_renderer.inverse(xy[0], xy[1]);
        var center = new IV.Vector3(0, 0, 0);
        var direction = new IV.Vector3(ray[0], ray[1], ray[2]);
        if(workspace) {
            var canvas = find_canvas(center, direction);
            if(canvas) {
                var pose0 = canvas.pose;
                var pose_new;
                var center_new;
                pan_move = function(xy_new) {
                    var ray_new = cubemap_renderer.inverse(xy_new[0], xy_new[1]);
                    var direction_new = new IV.Vector3(ray_new[0], ray_new[1], ray_new[2]);
                    if(direction.sub(direction_new).length() < 1e-10) return;
                    pose_new = quad_renderer.movePose(center, direction, direction_new, pose0);
                    ensure_distance(pose_new);
                    center_new = pose_new.center;
                    pose_new.center = pose_new.center.scale(0.9);
                    var actions = [new IV.actions.SetDirectly(canvas, "pose", pose_new)];
                    postActions(actions, { is_pose_update: true });
                    render_webgl_view();
                    pose_new.center = center_new;
                    pose0 = pose_new;
                    direction = direction_new;
                };
                pan_end = function() {
                    pose_new = {
                        center: center_new,
                        normal: pose_new.normal,
                        up: pose_new.up,
                        width: pose_new.width
                    };
                    ensure_distance(pose_new);
                    var actions = [new IV.actions.SetDirectly(canvas, "pose", pose_new)];
                    postActions(actions, { is_pose_update: true });
                    render_webgl_view();
                };
                return true;
            }
        }
    };

    var viewport_pan_initial = function(pos, event) {
        pos = get_coordinates(event);
        var pos0 = pos;
        pan_move = function(pos2, event) {
            pos2 = get_coordinates(event);
            var ey = cubemap_renderer.view_up;
            var ex = cubemap_renderer.view_direction.cross(cubemap_renderer.view_up).normalize();
            var s = 0.005;
            var phi = Math.atan2(cubemap_renderer.view_direction.y, cubemap_renderer.view_direction.x);
            var theta = Math.atan2(cubemap_renderer.view_direction.z, new IV.Vector(cubemap_renderer.view_direction.x, cubemap_renderer.view_direction.y).length());
            phi += s * (pos2.x - pos0.x);
            theta += s * (pos2.y - pos0.y);
            theta = Math.min(Math.PI / 2 * 0.99, Math.max(-Math.PI / 2 * 0.99, theta));
            cubemap_renderer.view_direction = new IV.Vector3(Math.cos(phi) * Math.cos(theta), Math.sin(phi) * Math.cos(theta), Math.sin(theta));
            pos0 = pos2;
            render_webgl_view();
        };
        pan_end = function() {
            pan_move = null;
            pan_end = null;
        };
    };

    multitouch_input.on('panstart', function(event) {
        update_blocker += 1;
        var xy = get_viewport_coordinates_hammer(event);
        if(pan_initial(xy, event)) return;
        viewport_pan_initial(xy, event);
    });
    multitouch_input.on('panmove', function(event) {
        var xy = get_viewport_coordinates_hammer(event);
        if(pan_move) pan_move(xy, event);
    });
    multitouch_input.on('panend', function(event) {
        update_blocker -= 1;
        if(pan_end) pan_end();
        pan_move = null;
        pan_end = null;
    });

    var pinch_move = null;
    var pinch_end = null;
    var pinch_initial = function(xy, scale) {
        var ray = cubemap_renderer.inverse(xy[0], xy[1]);
        var center = new IV.Vector3(0, 0, 0);
        var direction = new IV.Vector3(ray[0], ray[1], ray[2]);
        var canvas = find_canvas(center, direction);
        if(canvas) {
            var width0 = canvas.pose.width;
            var center0 = canvas.pose.center;
            var normal0 = canvas.pose.normal;
            var up0 = canvas.pose.up;
            pinch_move = function(xy, scale) {
                var new_pose = {
                    center: center0,
                    normal: normal0,
                    up: up0,
                    width: width0 * scale
                };
                ensure_distance(new_pose);
                var actions = [new IV.actions.SetDirectly(canvas, "pose", new_pose)];
                postActions(actions, { is_pose_update: true });
                render_webgl_view();
            };
            pinch_end = function() {
                pinch_move = null;
                pinch_end = null;
            }
            return true;
        }
    };

    var viewport_pinch_initial = function() {
        var angle0 = cubemap_renderer.view_angle;
        pinch_move = function(xy, scale) {
            cubemap_renderer.view_angle = angle0 / scale;
            if(cubemap_renderer.view_angle > Math.PI * 0.9) cubemap_renderer.view_angle = Math.PI * 0.9;
            render_webgl_view();
        };
        pinch_end = function() {
            pinch_move = null;
            pinch_end = null;
        };
    };

    multitouch_input.on('pinchstart', function(event) {
        update_blocker += 1;
        var xy = get_viewport_coordinates_hammer(event);
        if(pinch_initial(xy, event.scale, event)) return;
        viewport_pinch_initial(xy, event.scale, event);
    });
    multitouch_input.on('pinchmove', function(event) {
        var xy = get_viewport_coordinates_hammer(event);
        if(pinch_move) pinch_move(xy, event.scale, event);
    });
    multitouch_input.on('pinchend', function(event) {
        update_blocker -= 1;
        var xy = get_viewport_coordinates_hammer(event);
        if(pinch_end) pinch_end();
        pinch_move = null;
        pinch_end = null;
    });
})();

(function() {
    var multitouch_input = new Hammer(document.getElementById("viewport-control-area"), {});
    multitouch_input.get('pinch').set({ enable: true });

    function get_coordinates(event) {
        return new IV.Vector(event.center.x, event.center.y);
    }

    var pan_move = null;
    var pan_end = null;
    var pan_initial = function(pos) {
        var pos0 = pos;
        pan_move = function(pos2) {
            var ey = cubemap_renderer.view_up;
            var ex = cubemap_renderer.view_direction.cross(cubemap_renderer.view_up).normalize();
            var s = 0.005;
            var phi = Math.atan2(cubemap_renderer.view_direction.y, cubemap_renderer.view_direction.x);
            var theta = Math.atan2(cubemap_renderer.view_direction.z, new IV.Vector(cubemap_renderer.view_direction.x, cubemap_renderer.view_direction.y).length());
            phi += s * (pos2.x - pos0.x);
            theta += s * (pos2.y - pos0.y);
            theta = Math.min(Math.PI / 2 * 0.99, Math.max(-Math.PI / 2 * 0.99, theta));
            cubemap_renderer.view_direction = new IV.Vector3(Math.cos(phi) * Math.cos(theta), Math.sin(phi) * Math.cos(theta), Math.sin(theta));
            pos0 = pos2;
            render_webgl_view();
        };
        pan_end = function() {
            pan_move = null;
            pan_end = null;
            update_blocker -= 1;
        };
        update_blocker += 1;
    };

    var pinch_move = null;
    var pinch_end = null;
    var pinch_initial = function() {
        var angle0 = cubemap_renderer.view_angle;
        pinch_move = function(xy, scale) {
            cubemap_renderer.view_angle = angle0 / scale;
            if(cubemap_renderer.view_angle > Math.PI * 0.9) cubemap_renderer.view_angle = Math.PI * 0.9;
            render_webgl_view();
        };
        pinch_end = function() {
            pinch_move = null;
            pinch_end = null;
            update_blocker -= 1;
        };
        update_blocker += 1;
    };

    multitouch_input.on('panstart', function(event) {
        update_blocker += 1;
        var xy = get_coordinates(event);
        pan_initial(xy);
    });
    multitouch_input.on('panmove', function(event) {
        var xy = get_coordinates(event);
        if(pan_move) pan_move(xy);
    });
    multitouch_input.on('panend', function(event) {
        update_blocker -= 1;
        if(pan_end) pan_end();
        pan_move = null;
        pan_end = null;
    });
    multitouch_input.on('pinchstart', function(event) {
        update_blocker += 1;
        var xy = get_coordinates(event);
        pinch_initial(xy, event.scale);
    });
    multitouch_input.on('pinchmove', function(event) {
        var xy = get_coordinates(event);
        if(pinch_move) pinch_move(xy, event.scale);
    });
    multitouch_input.on('pinchend', function(event) {
        update_blocker -= 1;
        var xy = get_coordinates(event);
        if(pinch_end) pinch_end();
        pinch_move = null;
        pinch_end = null;
    });
})();

document.body.addEventListener('touchmove', function(event) {
    event.preventDefault();
}, false);

$('[data-switch="view-mode"]').each(function() {
    $(this).click(function() {
        cubemap_renderer.setMode($(this).attr("data-view-mode"));
        $('[data-switch="view-mode"]').removeClass("active");
        $(this).addClass("active");
        render_webgl_view();
    });
});
