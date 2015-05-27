// iVisDesigner - scripts/node/allofwutils.js
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

function getShaderInfoLog(GL, shader) {
    var buffer = new Buffer(4);
    GL.getShaderiv(shader, GL.INFO_LOG_LENGTH, buffer);
    var length = buffer.readUInt32LE(0);
    if(length > 1) {
        var buf = new Buffer(length + 1);
        GL.getShaderInfoLog(shader, length, buffer, buf);
        return buf.toString("utf-8");
    } else {
        return null;
    }
}

function getProgramInfoLog(GL, program) {
    var buffer = new Buffer(4);
    GL.getProgramiv(program, GL.INFO_LOG_LENGTH, buffer);
    var length = buffer.readUInt32LE(0);
    if(length > 1) {
        var buf = new Buffer(length + 1);
        GL.getProgramInfoLog(program, length, buffer, buf);
        return buf.toString("utf-8");
    } else {
        return null;
    }
}

function compileShaders(GL, vertex_shader, fragment_shader) {
    var shader_v = GL.createShader(GL.VERTEX_SHADER);
    GL.shaderSource(shader_v, [vertex_shader]);
    var shader_f = GL.createShader(GL.FRAGMENT_SHADER);
    GL.shaderSource(shader_f, [fragment_shader]);
    var program = GL.createProgram();

    GL.compileShader(shader_v);
    var log = getShaderInfoLog(GL, shader_v);
    if(log) console.log(log);
    GL.compileShader(shader_f);
    var log = getShaderInfoLog(GL, shader_f);
    if(log) console.log(log);

    GL.attachShader(program, shader_v);
    GL.attachShader(program, shader_f);

    GL.linkProgram(program);
    var log = getProgramInfoLog(GL, program);
    if(log) console.log(log);

    return program;
}

function compileShadersWithGeometry(GL, vertex_shader, geometry_shader, fragment_shader) {
    var shader_v = GL.createShader(GL.VERTEX_SHADER);
    GL.shaderSource(shader_v, [vertex_shader]);
    var shader_g = GL.createShader(GL.GEOMETRY_SHADER);
    GL.shaderSource(shader_g, [geometry_shader]);
    var shader_f = GL.createShader(GL.FRAGMENT_SHADER);
    GL.shaderSource(shader_f, [fragment_shader]);
    var program = GL.createProgram();

    GL.compileShader(shader_v);
    var log = getShaderInfoLog(GL, shader_v);
    if(log) console.log(log);
    GL.compileShader(shader_g);
    var log = getShaderInfoLog(GL, shader_g);
    if(log) console.log(log);
    GL.compileShader(shader_f);
    var log = getShaderInfoLog(GL, shader_f);
    if(log) console.log(log);

    GL.attachShader(program, shader_v);
    GL.attachShader(program, shader_g);
    GL.attachShader(program, shader_f);

    GL.linkProgram(program);
    var log = getProgramInfoLog(GL, program);
    if(log) console.log(log);

    return program;
}
