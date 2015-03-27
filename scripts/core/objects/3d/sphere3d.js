// iVisDesigner - scripts/core/objects/3d/line3d.js
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

var sphereShader_GeometryCode = IV.multiline(function() {/*@preserve
varying in vec4 colors[1];
varying in vec3 normals[1];
varying in float radiuses[1];

varying out vec4 color;
varying out float radius;
varying out vec3 center;
varying out vec3 p_prime;

vec3 iv_to_al_3(in vec3 v) {
    return vec3(v.y, v.z, v.x);
}

vec4 iv_to_al(in vec4 v) {
    return vec4(v.y, v.z, v.x, v.w);
}

void main() {
    color = colors[0];
    radius = radiuses[0];
    center = gl_PositionIn[0].xyz;

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

        p_prime = center_prime; gl_Position = omni_render(vec4(p_prime, 1.0)); EmitVertex();
        p_prime = p1; gl_Position = omni_render(vec4(p_prime, 1.0)); EmitVertex();
    }
    EndPrimitive();
}
*/console.log});

var sphereShader_VertexCode = IV.multiline(function() {/*@preserve
varying vec4 colors;
varying vec3 normals;
varying float radiuses;

vec4 iv_to_al(in vec4 v) {
    return vec4(v.y, v.z, v.x, v.w);
}

vec3 iv_to_al_3(in vec3 v) {
    return vec3(v.y, v.z, v.x);
}

void main() {
    colors = gl_Color;
    normals = gl_NormalMatrix * iv_to_al_3(gl_Normal);
    vec4 vertex = gl_ModelViewMatrix * iv_to_al(vec4(gl_Vertex.xyz, 1.0));
    radiuses = gl_Vertex.w;
    gl_Position = vertex;
}
*/console.log});

var sphereShader_FragmentCode = IV.multiline(function() {/*@preserve
uniform float specular_term;
varying vec4 color;
varying float radius;
varying vec3 center;
varying vec3 p_prime;

void main() {
    float qa = dot(p_prime, p_prime);
    float qb = -2.0 * dot(p_prime, center);
    float qc = dot(center, center) - radius * radius;
    float qd = qb * qb - 4.0 * qa * qc;
    if(qd <= 0.0) discard;
    float t = (-qb - sqrt(qd)) / qa / 2.0;

    vec3 p = p_prime * t;

    vec3 N = normalize(p - center);
    vec3 L = normalize((gl_ModelViewMatrix * (gl_LightSource[0].position.yzxw)).xyz - p);
    vec3 R = reflect(-L, N);

    vec4 colorMixed = color;
    vec4 final_color = colorMixed * (gl_LightSource[0].ambient);

    float lambertTerm = max(dot(N, L), 0.0);
    final_color += gl_LightSource[0].diffuse * colorMixed * lambertTerm;
    vec3 E = normalize(-p);
    float spec = pow(max(dot(R, E), 0.0), specular_term);
    final_color += gl_LightSource[0].specular * spec;
    final_color.a = color.a;
    final_color.rgb *= final_color.a;
    gl_FragColor = final_color;

    vec4 clip_position = omni_render(vec4(p, 1.0));
    vec3 pixel_position;
    pixel_position.xy = clip_position.xy;
    pixel_position.z = -clip_position.w;
    pixel_position = pixel_position * (length(p) / length(pixel_position));
    float z2 = (pixel_position.z * (omni_far + omni_near) + omni_far * omni_near * 2.0f) / (omni_near - omni_far);
    gl_FragDepth = (z2 / -pixel_position.z * 0.5 + 0.5);
}
*/console.log});

var sphereShader_begin = function(g, specular) {
    if(!sphereShader) sphereShader = g.allosphere.shaderCreateWithGeometry(
        sphereShader_VertexCode, sphereShader_FragmentCode,
        sphereShader_GeometryCode, GL.POINTS, GL.TRIANGLE_STRIP, 50
    );
    g.allosphere.shaderBegin(sphereShader);
    g.allosphere.shaderUniformf("specular_term", specular);
};

var sphereShader_end = function(g) {
    g.allosphere.shaderEnd(sphereShader);
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
        sphereShader_begin(g, this.specular_term);
        g.GL.blendFunc(g.GL.ONE, g.GL.ONE_MINUS_SRC_ALPHA);
        $this.path.enumerate(data, function(context) {
            if($this.filter && !$this.filter.get(context)) return;
            var center = $this.center.get(context);
            var radius = $this.radius.get(context);
            if(!center || radius === null) return;
            var color;
            if($this.color) color = $this.color.get(context);
            else color = new IV.Color(255, 255, 255, 1);
            g.GL.begin(g.GL.POINTS);
            g.GL.color4f(color.r / 255.0, color.g / 255.0, color.b / 255.0, color.a);
            g.GL.vertex4f(center.x, center.y, center.z, radius);
            g.GL.end();
        });
        lineShader_end(g);
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
