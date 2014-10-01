// Connect to twisted server.

var webgl_view = document.getElementById("webgl-view");
var GL = webgl_view.getContext("webgl") || webgl_view.getContext("experimental-webgl");


var matrix_perspective = function (fovy, aspect, near, far) {
    var out = new Float32Array(16);
    var f = 1.0 / Math.tan(fovy / 2),
        nf = 1 / (near - far);
    out[0] = f / aspect;
    out[1] = 0;
    out[2] = 0;
    out[3] = 0;
    out[4] = 0;
    out[5] = f;
    out[6] = 0;
    out[7] = 0;
    out[8] = 0;
    out[9] = 0;
    out[10] = (far + near) * nf;
    out[11] = -1;
    out[12] = 0;
    out[13] = 0;
    out[14] = (2 * far * near) * nf;
    out[15] = 0;
    return out;
};

var matrix_lookAt = function (eye, center, up) {
    var out = new Float32Array(16);
    var GLMAT_EPSILON = 1e-6;
    var x0, x1, x2, y0, y1, y2, z0, z1, z2, len,
        eyex = eye[0],
        eyey = eye[1],
        eyez = eye[2],
        upx = up[0],
        upy = up[1],
        upz = up[2],
        centerx = center[0],
        centery = center[1],
        centerz = center[2];

    if (Math.abs(eyex - centerx) < GLMAT_EPSILON &&
        Math.abs(eyey - centery) < GLMAT_EPSILON &&
        Math.abs(eyez - centerz) < GLMAT_EPSILON) {
        return mat4.identity(out);
    }

    z0 = eyex - centerx;
    z1 = eyey - centery;
    z2 = eyez - centerz;

    len = 1 / Math.sqrt(z0 * z0 + z1 * z1 + z2 * z2);
    z0 *= len;
    z1 *= len;
    z2 *= len;

    x0 = upy * z2 - upz * z1;
    x1 = upz * z0 - upx * z2;
    x2 = upx * z1 - upy * z0;
    len = Math.sqrt(x0 * x0 + x1 * x1 + x2 * x2);
    if (!len) {
        x0 = 0;
        x1 = 0;
        x2 = 0;
    } else {
        len = 1 / len;
        x0 *= len;
        x1 *= len;
        x2 *= len;
    }

    y0 = z1 * x2 - z2 * x1;
    y1 = z2 * x0 - z0 * x2;
    y2 = z0 * x1 - z1 * x0;

    len = Math.sqrt(y0 * y0 + y1 * y1 + y2 * y2);
    if (!len) {
        y0 = 0;
        y1 = 0;
        y2 = 0;
    } else {
        len = 1 / len;
        y0 *= len;
        y1 *= len;
        y2 *= len;
    }

    out[0] = x0;
    out[1] = y0;
    out[2] = z0;
    out[3] = 0;
    out[4] = x1;
    out[5] = y1;
    out[6] = z1;
    out[7] = 0;
    out[8] = x2;
    out[9] = y2;
    out[10] = z2;
    out[11] = 0;
    out[12] = -(x0 * eyex + x1 * eyey + x2 * eyez);
    out[13] = -(y0 * eyex + y1 * eyey + y2 * eyez);
    out[14] = -(z0 * eyex + z1 * eyey + z2 * eyez);
    out[15] = 1;

    return out;
};

var AllosphereModel = function() {
    var slices = 30;
    var stacks = 30;
    var size = 5;
    var radius = size;
    var gap = radius * 7 / 16.0;
    var vertices = [];
    var draw_actions = [];
    // left
    for(var i = 0; i <= slices; i++) {
        var v0 = vertices.length;
        for(var j = 0; j <= stacks; j++) {
            var phi = (i / slices - 0.5) * Math.PI;
            var theta = (j / stacks - 0.5) * Math.PI;
            var x = radius * Math.cos(phi) * Math.cos(theta) + gap / 2;
            var y = radius * Math.sin(phi) * Math.cos(theta);
            var z = radius * Math.sin(theta);
            vertices.push([ x, y, z ]);
        }
        var v1 = vertices.length;
        draw_actions.push([ GL.LINE_STRIP, v0, v1 ]);
    }
    for(var j = 0; j <= stacks; j++) {
        var v0 = vertices.length;
        for(var i = 0; i <= slices; i++) {
            var phi = (i / slices - 0.5) * Math.PI;
            var theta = (j / stacks - 0.5) * Math.PI;
            var x = radius * Math.cos(phi) * Math.cos(theta) + gap / 2;
            var y = radius * Math.sin(phi) * Math.cos(theta);
            var z = radius * Math.sin(theta);
            vertices.push([ x, y, z ]);
        }
        var v1 = vertices.length;
        draw_actions.push([ GL.LINE_STRIP, v0, v1 ]);
    }

    for(var i = 0; i <= slices; i++) {
        var v0 = vertices.length;
        for(var j = 0; j <= stacks; j++) {
            var phi = (i / slices - 0.5) * Math.PI;
            var theta = (j / stacks - 0.5) * Math.PI;
            var x = -radius * Math.cos(phi) * Math.cos(theta) - gap / 2;
            var y = radius * Math.sin(phi) * Math.cos(theta);
            var z = radius * Math.sin(theta);
            vertices.push([ x, y, z ]);
        }
        var v1 = vertices.length;
        draw_actions.push([ GL.LINE_STRIP, v0, v1 ]);
    }
    for(var j = 0; j <= stacks; j++) {
        var v0 = vertices.length;
        for(var i = 0; i <= slices; i++) {
            var phi = (i / slices - 0.5) * Math.PI;
            var theta = (j / stacks - 0.5) * Math.PI;
            var x = -radius * Math.cos(phi) * Math.cos(theta) - gap / 2;
            var y = radius * Math.sin(phi) * Math.cos(theta);
            var z = radius * Math.sin(theta);
            vertices.push([ x, y, z ]);
        }
        var v1 = vertices.length;
        draw_actions.push([ GL.LINE_STRIP, v0, v1 ]);
    }

    var upload_vertices = new Float32Array(3 * vertices.length);
    for(var i = 0; i < vertices.length; i++) {
        upload_vertices[i * 3 + 0] = vertices[i][0];
        upload_vertices[i * 3 + 1] = vertices[i][1];
        upload_vertices[i * 3 + 2] = vertices[i][2];
    }

    this.draw_actions = draw_actions;

    this.buffer = GL.createBuffer();
    GL.bindBuffer(GL.ARRAY_BUFFER, this.buffer);
    GL.bufferData(GL.ARRAY_BUFFER, upload_vertices, GL.STATIC_DRAW);
    GL.bindBuffer(GL.ARRAY_BUFFER, null);

    this.shader = new ShaderProgram($("#shader-wireframe-vertex").html(), $("#shader-wireframe-fragment").html());
    this.puMVMatrix = GL.getUniformLocation(this.shader.program, "uMVMatrix");
    this.puPMatrix = GL.getUniformLocation(this.shader.program, "uPMatrix");
    this.paVertexPosition = GL.getAttribLocation(this.shader.program, "aVertexPosition");
    GL.enableVertexAttribArray(this.paVertexPosition);
    this.stacks = stacks;
    this.slices = slices;
};

AllosphereModel.prototype.render = function(info) {
    this.shader.begin();
    GL.bindBuffer(GL.ARRAY_BUFFER, this.buffer);
    GL.vertexAttribPointer(this.paVertexPosition, 3, GL.FLOAT, false, 0, 0);

    GL.uniformMatrix4fv(this.puPMatrix, false, info.projection);
    GL.uniformMatrix4fv(this.puMVMatrix, false, info.modelview);

    var stacks = this.stacks;
    var slices = this.slices;

    this.draw_actions.forEach(function(action) {
        GL.drawArrays(action[0], action[1], action[2] - action[1]);
    });
    this.shader.end();
};

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
    }
    return r;
};
CanvasRenderer.prototype.bind = function(index) {
    if(index === undefined) index = 0;
    GL.activeTexture(GL.TEXTURE0 + index);
    GL.bindTexture(GL.TEXTURE_2D, this.texture);
    GL.activeTexture(GL.TEXTURE0);
};

var renders = [];
function getRenderer(index) {
    if(!renders[index]) renders[index] = new CanvasRenderer();
    return renders[index];
}

var ShaderProgram = function(vertex_source, fragment_source) {
    var program = GL.createProgram();
    var vertex_shader = GL.createShader(GL.VERTEX_SHADER);
    var fragment_shader = GL.createShader(GL.FRAGMENT_SHADER);
    GL.shaderSource(vertex_shader, vertex_source);
    GL.shaderSource(fragment_shader, fragment_source);
    GL.compileShader(vertex_shader);
    GL.compileShader(fragment_shader);
    if(!GL.getShaderParameter(vertex_shader, GL.COMPILE_STATUS)) {
        throw GL.getShaderInfoLog(vertex_shader);
    }
    if(!GL.getShaderParameter(fragment_shader, GL.COMPILE_STATUS)) {
        throw GL.getShaderInfoLog(fragment_shader);
    }
    GL.attachShader(program, vertex_shader);
    GL.attachShader(program, fragment_shader);
    GL.linkProgram(program);
    this.program = program;
};
ShaderProgram.prototype.begin = function() {
    GL.useProgram(this.program);
};
ShaderProgram.prototype.end = function() {
    GL.useProgram(null);
};

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
    this.shader = new ShaderProgram($("#shader-quad-vertex").html(), $("#shader-quad-fragment").html());

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
    var axis = d0.normalize().cross(d1.normalize());
    var q = IV.Quaternion.rotation(axis, angle);
    return {
        center: q.rotate(pose0.center),
        normal: q.rotate(pose0.normal),
        up: pose0.up,
        width: pose0.width
    };
};

var CubemapRenderTarget = function() {
    this.resolution = 512;
    this.texture = GL.createTexture();
    GL.bindTexture(GL.TEXTURE_CUBE_MAP, this.texture);
    GL.texParameteri(GL.TEXTURE_CUBE_MAP, GL.TEXTURE_WRAP_S, GL.CLAMP_TO_EDGE);
    GL.texParameteri(GL.TEXTURE_CUBE_MAP, GL.TEXTURE_WRAP_T, GL.CLAMP_TO_EDGE);
    GL.texParameteri(GL.TEXTURE_CUBE_MAP, GL.TEXTURE_MIN_FILTER, GL.LINEAR);
    GL.texParameteri(GL.TEXTURE_CUBE_MAP, GL.TEXTURE_MAG_FILTER, GL.LINEAR);
    for(var face = 0; face < 6; face++) {
        GL.texImage2D(GL.TEXTURE_CUBE_MAP_POSITIVE_X + face, 0, GL.RGBA, this.resolution, this.resolution, 0, GL.RGBA, GL.UNSIGNED_BYTE, null);
    }
    this.framebuffer = GL.createFramebuffer();
    GL.bindFramebuffer(GL.FRAMEBUFFER, this.framebuffer);
    GL.framebufferTexture2D(GL.FRAMEBUFFER, GL.COLOR_ATTACHMENT0, GL.TEXTURE_CUBE_MAP_POSITIVE_X, this.texture, 0);
    this.renderbuffer = GL.createRenderbuffer();
    GL.bindRenderbuffer(GL.RENDERBUFFER, this.renderbuffer);
    GL.renderbufferStorage(GL.RENDERBUFFER, GL.DEPTH_COMPONENT16, this.resolution, this.resolution);
    GL.framebufferRenderbuffer(GL.FRAMEBUFFER, GL.DEPTH_ATTACHMENT, GL.RENDERBUFFER, this.renderbuffer);
    GL.bindRenderbuffer(GL.RENDERBUFFER, null);
};
CubemapRenderTarget.prototype.bind = function() {
    GL.bindTexture(GL.TEXTURE_CUBE_MAP, this.texture);
};
CubemapRenderTarget.prototype.capture = function(render) {
    GL.bindFramebuffer(GL.FRAMEBUFFER, this.framebuffer);
    GL.viewport(0, 0, this.resolution, this.resolution);
    for(var face = 0; face < 6; face++) {
        var info = { face: GL.TEXTURE_CUBE_MAP_POSITIVE_X + face };
        var perspective = matrix_perspective(Math.PI / 2, 1, 0.001, 100);
        var lookat;
        if(info.face == GL.TEXTURE_CUBE_MAP_POSITIVE_X) {
            lookat = matrix_lookAt([0, 0, 0], [1, 0, 0], [0, -1, 0]);
        } else if(info.face == GL.TEXTURE_CUBE_MAP_POSITIVE_Y) {
            lookat = matrix_lookAt([0, 0, 0], [0, 1, 0], [0, 0, 1]);
        } else if(info.face == GL.TEXTURE_CUBE_MAP_POSITIVE_Z) {
            lookat = matrix_lookAt([0, 0, 0], [0, 0, 1], [0, -1, 0]);
        } else if(info.face == GL.TEXTURE_CUBE_MAP_NEGATIVE_X) {
            lookat = matrix_lookAt([0, 0, 0], [-1, 0, 0], [0, -1, 0]);
        } else if(info.face == GL.TEXTURE_CUBE_MAP_NEGATIVE_Y) {
            lookat = matrix_lookAt([0, 0, 0], [0, -1, 0], [0, 0, -1]);
        } else if(info.face == GL.TEXTURE_CUBE_MAP_NEGATIVE_Z) {
            lookat = matrix_lookAt([0, 0, 0], [0, 0, -1], [0, -1, 0]);
        }
        GL.framebufferTexture2D(GL.FRAMEBUFFER, GL.COLOR_ATTACHMENT0,
            GL.TEXTURE_CUBE_MAP_POSITIVE_X + face, this.texture, 0);
        render({ modelview: lookat, projection: perspective });
    }
    GL.bindFramebuffer(GL.FRAMEBUFFER, null);
};

function CubemapRenderer() {
    this.shader = new ShaderProgram($("#shader-cubemap-vertex").html(), $("#shader-cubemap-fragment").html());
    this.buffer = GL.createBuffer();
    GL.bindBuffer(GL.ARRAY_BUFFER, this.buffer);
    var vertices = [
        +1.0, +1.0, 0.0,
        -1.0, +1.0, 0.0,
        +1.0, -1.0, 0.0,
        -1.0, -1.0, 0.0
    ];
    GL.bufferData(GL.ARRAY_BUFFER, new Float32Array(vertices), GL.STATIC_DRAW);
    this.paVertexPosition = GL.getAttribLocation(this.shader.program, "aVertexPosition");
    GL.enableVertexAttribArray(this.paVertexPosition);
    this.puSampler = GL.getUniformLocation(this.shader.program, "uSampler");
}
CubemapRenderer.prototype.setMode = function(mode) {
    this.mode = "circular";
};
CubemapRenderer.prototype.render = function(cubemap) {
    cubemap.bind();
    this.shader.begin();
    GL.uniform1i(this.puSampler, 0);
    GL.vertexAttribPointer(this.paVertexPosition, 3, GL.FLOAT, false, 0, 0);
    GL.drawArrays(GL.TRIANGLE_STRIP, 0, 4);
    this.shader.end();
};
// x, y: OpenGL view coordinates. return [x, y, z].
CubemapRenderer.prototype.inverse = function(x, y) {
    var phi = Math.atan2(y, x);
    var theta = (Math.sqrt(x * x + y * y) - 0.5) * 2.0;
    var pos = [
        Math.cos(phi) * Math.cos(theta),
        Math.sin(phi) * Math.cos(theta),
        Math.sin(theta)
    ];
    return pos;
};

var quad_renderer = new QuadRenderer();
var cubemap = new CubemapRenderTarget();
var cubemap_renderer = new CubemapRenderer();
var allosphere_model = new AllosphereModel();

function render_scene(info) {
    GL.clearColor(0, 0, 0, 1);
    GL.enable(GL.DEPTH_TEST);
    GL.clear(GL.COLOR_BUFFER_BIT | GL.DEPTH_BUFFER_BIT);
    GL.enable(GL.BLEND);
    GL.blendFunc(GL.SRC_ALPHA, GL.ONE_MINUS_SRC_ALPHA);
    allosphere_model.render(info);
    if(workspace) {
        for(var c in workspace.canvases) {
            var canvas = workspace.canvases[c];
            getRenderer(c).bind(2);
            quad_renderer.render(info, canvas.pose);
        }
    }
}

function render_webgl_view() {
    cubemap.capture(render_scene);
    GL.viewport(0, 0, webgl_view.width, webgl_view.height);
    GL.clear(GL.COLOR_BUFFER_BIT | GL.DEPTH_BUFFER_BIT);
    GL.enable(GL.BLEND);
    GL.blendFunc(GL.SRC_ALPHA, GL.ONE_MINUS_SRC_ALPHA);
    cubemap_renderer.render(cubemap);
}

$(window).resize(function() {
    webgl_view.width = $(window).width();
    webgl_view.height = $(window).height();
    $(webgl_view).width($(window).width());
    $(webgl_view).height($(window).height());
    render_webgl_view();
}).resize();

var synced_object, dataset, workspace;

var scene_updated = false;
var updateHandler = function() {
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
    setTimeout(updateHandler, 200);
};

setTimeout(updateHandler, 200);

var workspace_sync = new WorkspaceSync();
workspace_sync.onUpdate = function() {
    workspace = workspace_sync.workspace;
    if(workspace) {
        scene_updated = true;
        render_webgl_view();
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

var postActions = function(actions) {
    var actions_send = workspace_sync.serializer.serialize({ "actions": actions });
    postMessage({
        type: "sync.perform",
        actions: actions_send
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

var multitouch_input = new Hammer(document.getElementById("webgl-view"), {});
multitouch_input.get('pinch').set({ enable: true });

(function() {
    var find_canvas = function(center, direction) {
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
                    pose_new = quad_renderer.movePose(center, direction, direction_new, pose0);
                    center_new = pose_new.center;
                    pose_new.center = pose_new.center.scale(0.9);
                    var actions = [new IV.actions.SetDirectly(canvas, "pose", pose_new)];
                    postActions(actions);
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
                    var actions = [new IV.actions.SetDirectly(canvas, "pose", pose_new)];
                    postActions(actions);
                    render_webgl_view();
                };
            }
        }
    };
    multitouch_input.on('panstart', function(event) {
        var xy = get_viewport_coordinates_hammer(event);
        pan_initial(xy);
    });
    multitouch_input.on('panmove', function(event) {
        var xy = get_viewport_coordinates_hammer(event);
        if(pan_move) pan_move(xy);
    });
    multitouch_input.on('panend', function(event) {
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
            pinch_move = function(xy, scale) {
                var actions = [new IV.actions.SetDirectly(canvas.pose, "width", width0 * scale)];
                postActions(actions);
                render_webgl_view();
            };
        }
    };

    multitouch_input.on('pinchstart', function(event) {
        var xy = get_viewport_coordinates_hammer(event);
        pinch_initial(xy, event.scale);
    });
    multitouch_input.on('pinchmove', function(event) {
        var xy = get_viewport_coordinates_hammer(event);
        if(pinch_move) pinch_move(xy, event.scale);
    });
    multitouch_input.on('pinchend', function(event) {
        var xy = get_viewport_coordinates_hammer(event);
        if(pinch_end) pinch_end();
        pinch_move = null;
        pinch_end = null;
    });
})();

// beginTrackMouse(function(e) {
//     var xy = get_viewport_coordinates(e);
//     var ray = cubemap_renderer.inverse(xy[0], xy[1]);
//     var center = new IV.Vector3(0, 0, 0);
//     var direction = new IV.Vector3(ray[0], ray[1], ray[2]);
//     if(workspace) {
//         for(var c in workspace.canvases) {
//             var canvas = workspace.canvases[c];
//             if(quad_renderer.select(center, direction, canvas.pose)) {
//                 var pose0 = canvas.pose;
//                 return {
//                     move: function(e) {
//                         var xy_new = get_viewport_coordinates(e);
//                         var ray_new = cubemap_renderer.inverse(xy_new[0], xy_new[1]);
//                         var direction_new = new IV.Vector3(ray_new[0], ray_new[1], ray_new[2]);
//                         var pose_new = quad_renderer.movePose(center, direction, direction_new, pose0);
//                         var actions = [new IV.actions.SetDirectly(canvas, "pose", pose_new)];
//                         postActions(actions);
//                         render_webgl_view();
//                     }
//                 };
//             }
//         }
//     }
// });

document.body.addEventListener('touchmove', function(event) {
    event.preventDefault();
}, false);
