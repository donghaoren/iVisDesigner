// iVisDesigner - scripts/core/objects/3d/sphere3d.js
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

/*
IV.editor.workspace.objects.push(new IV.objects.Line3D({ path: new IV.Path("[cars]"), point1: new IV.objects.CanvasWrapper3D(IV.editor.workspace.canvases[0], IV.editor.workspace.canvases[0].visualization.objects[5]), point2: new IV.objects.CanvasWrapper3D(IV.editor.workspace.canvases[1], IV.editor.workspace.canvases[0].visualization.objects[0]) }));
*/

var sphereShader = null;
var sphereShader_Buffer = null;
var sphereShader_VertexArray = null;

var sphereShader_GeometryCode = IV.multiline(function() {/*@preserve
layout(points) in;
layout(triangle_strip, max_vertices = 50) out;
in vec4 colors[1];
in float radiuses[1];
in vec3 positions[1];

out vec4 color;
out float radius;
out vec3 center;
out vec3 p_prime;

void main() {
    color = colors[0];
    radius = radiuses[0];
    center = positions[0];

    int sides = 24;

    float d = length(center);
    if(d <= radius) return;

    float x = radius * radius / d;
    vec3 center_prime = center - center * (x / d);
    float radius_prime = sqrt(radius * radius - x * x);
    radius_prime /= cos(3.1415926535897932 / sides);
    radius_prime *= 1.01;
    vec3 up = vec3(0, 1, 1);
    vec3 ex = normalize(cross(center, up));
    vec3 ey = normalize(cross(ex, center));
    ex *= radius_prime;
    ey *= radius_prime;

    vec3 p0 = center_prime + ex;

    for(int i = 0; i <= sides; i++) {
        float t = float(i) / sides * 3.1415926535897932 * 2;
        vec3 p1 = center_prime + ex * cos(t) + ey * sin(t);

        p_prime = center_prime; gl_Position = omni_render(p_prime); EmitVertex();
        p_prime = p1; gl_Position = omni_render(p_prime); EmitVertex();
    }
    EndPrimitive();
}
*/console.log});

var sphereShader_VertexCode = IV.multiline(function() {/*@preserve
layout(location = 0) in vec4 xyz_radius;
layout(location = 1) in vec4 color;

out vec4 colors;
out float radiuses;
out vec3 positions;

void main() {
    colors = color;
    positions = omni_transform(xyz_radius.xyz);
    radiuses = xyz_radius.w;
}
*/console.log});

var sphereShader_FragmentCode = IV.multiline(function() {/*@preserve
uniform float specular_term;
uniform vec3 light_position = vec3(0, 0, 0);
uniform vec4 light_ambient = vec4(0.3, 0.3, 0.3, 1.0);
uniform vec4 light_diffuse = vec4(0.7, 0.7, 0.7, 1.0);
uniform vec4 light_specular = vec4(1.0, 1.0, 1.0, 1.0);

in vec4 color;
in float radius;
in vec3 center;
in vec3 p_prime;

layout(location = 0) out vec4 fragment_color;

void main() {
    float qa = dot(p_prime, p_prime);
    float qb = -2.0 * dot(p_prime, center);
    float qc = dot(center, center) - radius * radius;
    float qd = qb * qb - 4.0 * qa * qc;
    if(qd <= 0.0) discard;
    float t = (-qb - sqrt(qd)) / qa / 2.0;

    vec3 p = p_prime * t;

    vec3 N = normalize(p - center);
    vec3 L = normalize(omni_transform(light_position) - p);
    vec3 R = reflect(-L, N);

    vec4 colorMixed = color;
    vec4 final_color = colorMixed * light_ambient;

    float lambertTerm = max(dot(N, L), 0.0);
    final_color += light_diffuse * colorMixed * lambertTerm;
    vec3 E = normalize(-p);
    float spec = pow(max(dot(R, E), 0.0), specular_term);
    final_color += light_specular * spec;
    final_color.a = color.a;
    final_color.rgb *= final_color.a;
    fragment_color = final_color;

    vec3 pixel_position = omni_displace(p);
    pixel_position = pixel_position * (length(p) / length(pixel_position));
    vec4 clip_position = omni_project(pixel_position);
    gl_FragDepth = (clip_position.z / clip_position.w * 0.5 + 0.5);
}
*/console.log});

var sphereShader_begin = function(g, specular) {
    if(!sphereShader) {
        sphereShader = compileShadersWithGeometry(GL,
            "#version 330\n" + g.omnistereo.getShaderCode() + "\n" + sphereShader_VertexCode,
            "#version 330\n" + g.omnistereo.getShaderCode() + "\n" + sphereShader_GeometryCode,
            "#version 330\n" + g.omnistereo.getShaderCode() + "\n" + sphereShader_FragmentCode
        );
        sphereShader_VertexArray = new GL.VertexArray();
        sphereShader_Buffer = new GL.Buffer();
        GL.bindVertexArray(sphereShader_VertexArray);
        GL.bindBuffer(GL.ARRAY_BUFFER, sphereShader_Buffer);
        GL.enableVertexAttribArray(0)
        GL.enableVertexAttribArray(1)
        GL.vertexAttribPointer(0, 4, GL.FLOAT, GL.FALSE, 32, 0)
        GL.vertexAttribPointer(1, 4, GL.FLOAT, GL.FALSE, 32, 16)
        GL.bindBuffer(GL.ARRAY_BUFFER, 0);
        GL.bindVertexArray(0);
    }
    GL.useProgram(sphereShader);
    g.omnistereo.setUniforms(sphereShader.id());
    GL.uniform1f(GL.getUniformLocation(sphereShader, "specular_term"), specular);
    GL.uniform3f(GL.getUniformLocation(sphereShader, "light_position"), g.environment.light_position.x, g.environment.light_position.y, g.environment.light_position.z);
    GL.uniform4f(GL.getUniformLocation(sphereShader, "light_ambient"), 0.3, 0.3, 0.3, 1.0);
    GL.uniform4f(GL.getUniformLocation(sphereShader, "light_diffuse"), 0.7, 0.7, 0.7, 1.0);
    GL.uniform4f(GL.getUniformLocation(sphereShader, "light_specular"), 1.0, 1.0, 1.0, 1.0);
};

var sphereShader_end = function(g) {
    GL.useProgram(0);
};

Objects.Sphere3D = IV.extend(Objects.Shape, function(info) {
    this.type = "Sphere3D";
    this.path = info.path;
    if(info.color)
        this.color = info.color;
    else
        this.color = null;
    if(info.filter)
        this.filter = info.filter;
    else
        this.filter = null;
    this.center = info.center;
    this.radius = info.radius;
    this.specular_term = 2;
}, {
    $auto_properties: [
        "path", "filter", "center", "radius", "color",
        "specular_term"
    ],
    fillDefault: function() {
    },
    postDeserialize: function() {
        this.fillDefault();
    },
    render3D: function(g, data) {
        var $this = this;
        if(g.order == "front") return;
        var spheredata = [];
        var vp = 0;
        // g.GL.blendFunc(g.GL.ONE, g.GL.ONE_MINUS_SRC_ALPHA);
        $this.path.enumerate(data, function(context) {
            if($this.filter && !$this.filter.get(context)) return;
            var center = $this.center.get(context);
            var radius = $this.radius.get(context);
            if(!center || radius === null) return;
            var color;
            if($this.color) color = $this.color.get(context);
            else color = new IV.Color(255, 255, 255, 1);
            spheredata[vp * 8 + 0] = center.y;
            spheredata[vp * 8 + 1] = center.z;
            spheredata[vp * 8 + 2] = center.x;
            spheredata[vp * 8 + 3] = radius;
            spheredata[vp * 8 + 4] = color.r / 255.0;
            spheredata[vp * 8 + 5] = color.g / 255.0;
            spheredata[vp * 8 + 6] = color.b / 255.0;
            spheredata[vp * 8 + 7] = color.a;
            vp += 1;
        });
        var buf = new Buffer(vp * 8 * 4);
        for(var i = 0; i < vp * 8; i++) {
            buf.writeFloatLE(spheredata[i], i * 4);
        }
        sphereShader_begin(g, this.specular_term);
        var err = GL.getError(); if(err) console.log("GL Error:1", err);
        GL.bindBuffer(GL.ARRAY_BUFFER, sphereShader_Buffer);
        GL.bufferData(GL.ARRAY_BUFFER, vp * 4 * 8, buf, GL.STATIC_DRAW);
        GL.bindBuffer(GL.ARRAY_BUFFER, 0);
        var err = GL.getError(); if(err) console.log("GL Error:2", err);
        GL.blendFunc(GL.ONE, GL.ONE_MINUS_SRC_ALPHA);
        GL.bindVertexArray(sphereShader_VertexArray);
        GL.drawArrays(GL.POINTS, 0, vp);
        GL.bindVertexArray(0);
        sphereShader_end(g);
        var err = GL.getError(); if(err) console.log("GL Error:", err);
    },
    getPropertyContext: function() {
        var $this = this;
        return Objects.Object.prototype.getPropertyContext.call(this).concat([
            make_prop_ctx($this, "path", "Selector", "Shape", "path"),
            make_prop_ctx($this, "filter", "Filter", "Shape", "filter"),
            make_prop_ctx($this, "color", "Color", "Sphere3D", "color"),
            make_prop_ctx($this, "center", "Center", "Sphere3D", "point"),
            make_prop_ctx($this, "radius", "Radius", "Sphere3D", "number"),
            make_prop_ctx($this, "specular_term", "Specular", "Sphere3D", "plain-number")
        ]);
    }
});

IV.serializer.registerObjectType("Sphere3D", Objects.Sphere3D);
