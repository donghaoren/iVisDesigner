// iVisDesigner - scripts/node/alloutil.js
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

    // Hall way.
    var hallway_bottom_angle = Math.atan(0.3, 5);
    var hallway_x = gap / 2, hallway_y = Math.cos(hallway_bottom_angle) * radius;
    var hallway_z = Math.sin(hallway_bottom_angle) * radius;
    var v0 = vertices.length;
    // Full cube.
    // [[ +1, +1, +1 ], [ +1, +1, -1], [ +1, +1, +1 ], [ +1, -1, +1], [ +1, +1, +1 ], [ -1, +1, +1],
    //  [ +1, -1, +1 ], [ +1, -1, -1], [ +1, +1, -1 ], [ +1, -1, -1], [ +1, -1, +1 ], [ -1, -1, +1],
    //  [ -1, -1, +1 ], [ -1, -1, -1], [ -1, +1, -1 ], [ -1, -1, -1], [ +1, -1, -1 ], [ -1, -1, -1],
    //  [ -1, +1, +1 ], [ -1, +1, -1], [ -1, +1, +1 ], [ -1, -1, +1], [ +1, +1, -1 ], [ -1, +1, -1]]
    [[ +1, +1, -1 ], [ +1, -1, -1],
     [ -1, +1, -1 ], [ -1, -1, -1],
     [ +1, -1, -1 ], [ -1, -1, -1],
     [ +1, +1, -1 ], [ -1, +1, -1]].forEach(function(v) {
        vertices.push([ v[0] * hallway_x, v[1] * hallway_y, v[2] * hallway_z ]);
    });
    var v1 = vertices.length;
    draw_actions.push([ GL.LINES, v0, v1 ]);


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

    var vertex_code = IV.multiline(function() {/*!
        attribute vec3 aVertexPosition;
        uniform mat4 uMVMatrix, uPMatrix;
        varying highp vec3 position;
        void main(void) {
            position = aVertexPosition;
            gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition, 1.0);
        }
    */});
    var fragment_code = IV.multiline(function() {/*!
        varying highp vec3 position;
        void main(void) {
            highp float opacity = 0.1 + exp(-position.z * position.z / 5.0) * 0.2;
            gl_FragColor = vec4(1, 1, 1, opacity);
        }
    */});

    this.shader = new ShaderProgram(vertex_code, fragment_code);
    this.puMVMatrix = GL.getUniformLocation(this.shader.program, "uMVMatrix");
    this.puPMatrix = GL.getUniformLocation(this.shader.program, "uPMatrix");
    this.paVertexPosition = GL.getAttribLocation(this.shader.program, "aVertexPosition");
    GL.enableVertexAttribArray(this.paVertexPosition);
};

AllosphereModel.prototype.render = function(info) {
    this.shader.begin();

    GL.bindBuffer(GL.ARRAY_BUFFER, this.buffer);
    GL.vertexAttribPointer(this.paVertexPosition, 3, GL.FLOAT, false, 0, 0);

    GL.uniformMatrix4fv(this.puPMatrix, false, info.projection);
    GL.uniformMatrix4fv(this.puMVMatrix, false, info.modelview);

    GL.lineWidth(2);

    this.draw_actions.forEach(function(action) {
        GL.drawArrays(action[0], action[1], action[2] - action[1]);
    });

    GL.lineWidth(1);

    this.shader.end();
};

var CubemapRenderTarget = function() {
    this.resolution = 1024;
    this.texture = GL.createTexture();
    GL.bindTexture(GL.TEXTURE_CUBE_MAP, this.texture);
    GL.texParameteri(GL.TEXTURE_CUBE_MAP, GL.TEXTURE_WRAP_S, GL.CLAMP_TO_EDGE);
    GL.texParameteri(GL.TEXTURE_CUBE_MAP, GL.TEXTURE_WRAP_T, GL.CLAMP_TO_EDGE);
    GL.texParameteri(GL.TEXTURE_CUBE_MAP, GL.TEXTURE_MIN_FILTER, GL.LINEAR);
    GL.texParameteri(GL.TEXTURE_CUBE_MAP, GL.TEXTURE_MAG_FILTER, GL.LINEAR);
    for(var face = 0; face < 6; face++) {
        GL.texImage2D(GL.TEXTURE_CUBE_MAP_POSITIVE_X + face, 0, GL.RGBA, this.resolution, this.resolution, 0, GL.RGBA, GL.UNSIGNED_BYTE, null);
    }
    GL.bindTexture(GL.TEXTURE_CUBE_MAP, null);

    this.framebuffer = GL.createFramebuffer();
    GL.bindFramebuffer(GL.FRAMEBUFFER, this.framebuffer);
    GL.framebufferTexture2D(GL.FRAMEBUFFER, GL.COLOR_ATTACHMENT0, GL.TEXTURE_CUBE_MAP_POSITIVE_X, this.texture, 0);
    this.renderbuffer = GL.createRenderbuffer();
    GL.bindRenderbuffer(GL.RENDERBUFFER, this.renderbuffer);
    GL.renderbufferStorage(GL.RENDERBUFFER, GL.DEPTH_COMPONENT16, this.resolution, this.resolution);
    GL.framebufferRenderbuffer(GL.FRAMEBUFFER, GL.DEPTH_ATTACHMENT, GL.RENDERBUFFER, this.renderbuffer);
    GL.bindRenderbuffer(GL.RENDERBUFFER, null);
};
CubemapRenderTarget.prototype.bind = function(index) {
    if(index === undefined) index = 0;
    GL.activeTexture(GL.TEXTURE0 + index);
    GL.bindTexture(GL.TEXTURE_CUBE_MAP, this.texture);
    GL.activeTexture(GL.TEXTURE0);
};
CubemapRenderTarget.prototype.unbind = function(index) {
    if(index === undefined) index = 0;
    GL.activeTexture(GL.TEXTURE0 + index);
    GL.bindTexture(GL.TEXTURE_CUBE_MAP, null);
    GL.activeTexture(GL.TEXTURE0);
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
    var vertex_code = IV.multiline(function() {/*!
        attribute vec3 aVertexPosition;
        varying highp vec2 texCoord;

        void main(void) {
            texCoord = aVertexPosition.xy;
            gl_Position = vec4(aVertexPosition, 1.0);
        }
    */});
    var fragment_code = IV.multiline(function() {/*!
        varying highp vec2 texCoord;
        uniform samplerCube uSampler;
        uniform int uMode;
        uniform highp vec3 uPerspectiveDirection, uPerspectiveUp;
        uniform highp float uPerspectiveAspect, uPerspectiveViewAngle;


        const highp float PI = 3.141592653589793238462643383;

        void main(void) {
            if(uMode == 0) { // circular
                highp float l = length(texCoord);
                if(l < 1.0) {
                    highp float phi = atan(texCoord.y, texCoord.x);
                    highp float theta = (l - 0.5) * 2.0;
                    highp vec3 pos;
                    pos.x = cos(phi) * cos(theta);
                    pos.y = sin(phi) * cos(theta);
                    pos.z = sin(theta);
                    gl_FragColor = textureCube(uSampler, pos);
                } else {
                    gl_FragColor = vec4(0.0, 0.0, 0.0, 0.0);
                }
            } else if(uMode == 1) { // circular-inverse
                highp float l = length(texCoord);
                if(l < 1.0) {
                    highp float phi = atan(texCoord.y, texCoord.x);
                    highp float theta = -(l - 0.5) * 2.0;
                    highp vec3 pos;
                    pos.x = cos(phi) * cos(theta);
                    pos.y = sin(phi) * cos(theta);
                    pos.z = sin(theta);
                    gl_FragColor = textureCube(uSampler, pos);
                } else {
                    gl_FragColor = vec4(0.0, 0.0, 0.0, 0.0);
                }
            } else if(uMode == 2) { // fisheye-top
                highp float l = length(texCoord);
                if(l < 1.0) {
                    highp float phi = atan(texCoord.y, texCoord.x);
                    highp float theta = PI / 2.0 - l * (150.0 / 180.0 * PI);
                    highp vec3 pos;
                    pos.x = cos(phi) * cos(theta);
                    pos.y = sin(phi) * cos(theta);
                    pos.z = sin(theta);
                    gl_FragColor = textureCube(uSampler, pos);
                } else {
                    gl_FragColor = vec4(0.0, 0.0, 0.0, 0.0);
                }
            } else if(uMode == 3) { // fisheye-bottom
                highp float l = length(texCoord);
                if(l < 1.0) {
                    highp float phi = atan(texCoord.y, texCoord.x);
                    highp float theta = -PI / 2.0 + l * (150.0 / 180.0 * PI);
                    highp vec3 pos;
                    pos.x = cos(phi) * cos(theta);
                    pos.y = sin(phi) * cos(theta);
                    pos.z = sin(theta);
                    gl_FragColor = textureCube(uSampler, pos);
                } else {
                    gl_FragColor = vec4(0.0, 0.0, 0.0, 0.0);
                }
            } else if(uMode == 4) { // mercator
                highp float theta = -texCoord.x * uPerspectiveViewAngle / 2.0;
                theta += atan(uPerspectiveDirection.y, uPerspectiveDirection.x);
                highp vec3 pos;
                pos.x = cos(theta);
                pos.y = sin(theta);
                pos.z = texCoord.y * uPerspectiveViewAngle / 2.0;
                gl_FragColor = textureCube(uSampler, normalize(pos));
            } else if(uMode == 5) { // perspective
                highp vec3 ex = normalize(cross(uPerspectiveDirection, uPerspectiveUp));
                highp vec3 ey = normalize(cross(ex, uPerspectiveDirection));
                highp vec3 point = normalize(uPerspectiveDirection) + (ex * texCoord.x + ey * texCoord.y) * tan(uPerspectiveViewAngle / 2.0);
                gl_FragColor = textureCube(uSampler, normalize(point));
            }
        }
    */});
    this.shader = new ShaderProgram(vertex_code, fragment_code);
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
    this.puMode = GL.getUniformLocation(this.shader.program, "uMode");
    this.puPerspectiveDirection = GL.getUniformLocation(this.shader.program, "uPerspectiveDirection");
    this.puPerspectiveUp = GL.getUniformLocation(this.shader.program, "uPerspectiveUp");
    this.puPerspectiveViewAngle = GL.getUniformLocation(this.shader.program, "uPerspectiveViewAngle");
    this.puPerspectiveAspect = GL.getUniformLocation(this.shader.program, "uPerspectiveAspect");
    this.mode = "circular";
    this.mode_viewports = { };
    this.view_direction = new IV.Vector3(1, 0, 0);
    this.view_up = new IV.Vector3(0, 0, 1);
    this.view_angle = 90.0 * Math.PI / 180.0;
    this.view_aspect = 1.0;
}
CubemapRenderer.prototype.setMode = function(mode) {
    // Keep track of view information.
    this.mode_viewports[this.mode] = {
        direction: this.view_direction,
        angle: this.view_angle,
        up: this.view_up,
        aspect: this.view_aspect
    };
    this.mode = mode;
    if(this.mode_viewports[this.mode]) {
        var k = this.mode_viewports[this.mode];
        this.view_direction = k.direction;
        this.view_angle = k.angle;
        this.view_up = k.up;
        this.view_aspect = k.aspect;
    }
};
CubemapRenderer.prototype.render = function(cubemap) {
    cubemap.bind(0);
    this.shader.begin();
    GL.uniform1i(this.puSampler, 0);
    if(this.mode == "circular") {
        GL.uniform1i(this.puMode, 0);
    } else if(this.mode == "circular-inverse") {
        GL.uniform1i(this.puMode, 1);
    } else if(this.mode == "fisheye-top") {
        GL.uniform1i(this.puMode, 2);
    } else if(this.mode == "fisheye-bottom") {
        GL.uniform1i(this.puMode, 3);
    } else if(this.mode == "mercator") {
        GL.uniform1i(this.puMode, 4);
        GL.uniform1f(this.puPerspectiveViewAngle, this.view_angle);
        GL.uniform3f(this.puPerspectiveDirection, this.view_direction.x, this.view_direction.y, this.view_direction.z);
    } else if(this.mode == "perspective") {
        GL.uniform1i(this.puMode, 5);
        GL.uniform3f(this.puPerspectiveDirection, this.view_direction.x, this.view_direction.y, this.view_direction.z);
        GL.uniform3f(this.puPerspectiveUp, this.view_up.x, this.view_up.y, this.view_up.z);
        GL.uniform1f(this.puPerspectiveViewAngle, this.view_angle);
        GL.uniform1f(this.puPerspectiveAspect, this.view_aspect);
    }
    GL.bindBuffer(GL.ARRAY_BUFFER, this.buffer);
    GL.vertexAttribPointer(this.paVertexPosition, 3, GL.FLOAT, false, 0, 0);
    GL.drawArrays(GL.TRIANGLE_STRIP, 0, 4);
    this.shader.end();
};
// x, y: OpenGL view coordinates. return [x, y, z].
CubemapRenderer.prototype.inverse = function(x, y) {
    if(this.mode == "circular") {
        var phi = Math.atan2(y, x);
        var theta = (Math.sqrt(x * x + y * y) - 0.5) * 2.0;
        var pos = [
            Math.cos(phi) * Math.cos(theta),
            Math.sin(phi) * Math.cos(theta),
            Math.sin(theta)
        ];
        return pos;
    } else if(this.mode == "circular-inverse") {
        var phi = Math.atan2(y, x);
        var theta = -(Math.sqrt(x * x + y * y) - 0.5) * 2.0;
        var pos = [
            Math.cos(phi) * Math.cos(theta),
            Math.sin(phi) * Math.cos(theta),
            Math.sin(theta)
        ];
        return pos;
    } else if(this.mode == "fisheye-top") {
        var phi = Math.atan2(y, x);
        var theta = Math.PI / 2.0 - Math.sqrt(x * x + y * y) * (150.0 / 180.0 * Math.PI);
        var pos = [
            Math.cos(phi) * Math.cos(theta),
            Math.sin(phi) * Math.cos(theta),
            Math.sin(theta)
        ];
        return pos;
    } else if(this.mode == "fisheye-bottom") {
        var phi = Math.atan2(y, x);
        var theta = -Math.PI / 2.0 + Math.sqrt(x * x + y * y) * (150.0 / 180.0 * Math.PI);
        var pos = [
            Math.cos(phi) * Math.cos(theta),
            Math.sin(phi) * Math.cos(theta),
            Math.sin(theta)
        ];
        return pos;
    } else if(this.mode == "mercator") {
        var theta = -x * this.view_angle / 2.0;
        theta += Math.atan2(this.view_direction.y, this.view_direction.x);
        var pos = [ Math.cos(theta), Math.sin(theta), y * this.view_angle / 2.0 ];
        return pos;
    } else if(this.mode == "perspective") {
        var ex = this.view_direction.cross(this.view_up).normalize();
        var ey = ex.cross(this.view_direction).normalize();
        var point = this.view_direction.add(ex.scale(x).add(ey.scale(y)).scale(Math.tan(this.view_angle / 2.0))).normalize();
        return [ point.x, point.y, point.z ];
    }
};

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

