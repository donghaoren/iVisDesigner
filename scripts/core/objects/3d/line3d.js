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

Objects.PointFromData3D = IV.extend(Objects.Object, function(path) {
    this.path = path;
    this.type = "PointFromData3D";
}, {
    get: function(context) {
        var data = context.get(this.path).val();
        if(!data) return null;
        var pt = new IV.Vector3(data.x, data.y, data.z);
        pt.normal = new IV.Vector3(data.nx, data.ny, data.nz).normalize();
        return pt;
    },
    getPath: function() {
        return this.path;
    },
    clone: function() {
        return new Objects.PointFromData3D(this.path);
    }
});

Objects.CanvasWrapper3D = IV.extend(Objects.Object, function(canvas, point) {
    this.type = "CanvasWrapper3D";
    this.canvas = canvas;
    this.point = point;
}, {
    get: function(context) {
        var pt = this.point.get(context);
        if(!pt) return null;
        var pose = this.canvas.pose;
        // Compute the position of `pt` in 3D space.
        var ab = this.canvas.visualization.artboard;
        var w = 2000, h = 2000;
        var scale = Math.min(
            (w - 10) / ab.width,
            (h - 10) / ab.height
        );
        var center = new IV.Vector(-(ab.x0 + ab.width / 2) * scale,
                                   -(ab.y0 + ab.height / 2) * scale);
        pt = pt.scale(scale).add(center);
        var ex = pose.up.cross(pose.normal).normalize();
        var ey = pose.normal.cross(ex).normalize();
        ex = ex.scale(pose.width / 2000);
        ey = ey.scale(pose.width / 2000);
        var p = pose.center.add(ex.scale(pt.x - 0.5)).add(ey.scale(pt.y - 0.5));
        if(G_render_config.chart_mode == "mono") {
            p = p.scale(G_render_config.radius / p.length());
        }
        p.normal = pose.normal.normalize();
        return p;
    },
    getPath: function() {
        return this.point.getPath();
    },
    clone: function() {
        return new Objects.CanvasWrapper3D(this.canvas, this.point);
    }
});

var lineShader = null;
var lineShader_VertexArray = null;
var lineShader_Buffer = null;

var lineShader_GeometryCode = IV.multiline(function() {/*@preserve
layout(lines) in;
layout(triangle_strip, max_vertices = 56) out;
in float thicknesses[2];
in vec3 positions[2];
in vec4 colors[2];
in vec3 normals[2];
out vec4 color;
out vec3 line_direction, light_direction, eye_vector;
out float specular_boost;

uniform int line_type = 0;
uniform float curveness = 0;
uniform vec3 light_position = vec3(0, 0, 0);

void bezierCurve(vec3 p1, vec3 p2, vec3 p3, vec3 p4) {
    int tick_count = 27;
    int i;
    for(i = 0; i <= tick_count; i++) {
        float t = float(i) / float(tick_count);
        float t2 = t * t;
        float t3 = t2 * t;
        float k1 = 1 - 3 * t + 3 * t2 - t3;
        float dk1 = -3 + 6 * t - 3 * t2;
        float k2 = 3 * t - 6 * t2 + 3 * t3;
        float dk2 = 3 - 12 * t + 9 * t2;
        float k3 = 3 * t2 - 3 * t3;
        float dk3 = 6 * t - 9 * t2;
        float k4 = t3;
        float dk4 = 3 * t2;
        vec3 p = p1 * k1 + p2 * k2 + p3 * k3 + p4 * k4;
        line_direction = normalize(p1 * dk1 + p2 * dk2 + p3 * dk3 + p4 * dk4);
        light_direction = normalize(omni_transform(light_position) - p);
        eye_vector = normalize(-p);
        specular_boost = max(max(0.0, 1.0 - 5.0 * t), max(0.0, 1.0 - 5.0 * (1.0 - t)));
        vec3 vn = normalize(cross(line_direction, p)) * thicknesses[0];
        gl_Position = omni_render(p + vn);
        EmitVertex();
        gl_Position = omni_render(p - vn);
        EmitVertex();
    }
    EndPrimitive();
}

void line(vec3 p1, vec3 p2) {
    int tick_count = 31;
    int i;
    line_direction = normalize(p2 - p1);
    for(i = 0; i <= tick_count; i++) {
        float t = float(i) / float(tick_count);
        vec3 p = p1 + (p2 - p1) * t;
        gl_Position = omni_render(p);
        light_direction = normalize(omni_transform(light_position) - p);
        eye_vector = normalize(-p);
        specular_boost = max(max(0.0, 1.0 - 5.0 * t), max(0.0, 1.0 - 5.0 * (1.0 - t)));
        vec3 vn = normalize(cross(line_direction, p)) * thicknesses[0];
        gl_Position = omni_render(p + vn);
        EmitVertex();
        gl_Position = omni_render(p - vn);
        EmitVertex();
    }
    EndPrimitive();
}

void main() {
    color = colors[0];
    vec3 p1 = positions[0].xyz;
    vec3 p2 = positions[1].xyz;
    vec3 n1 = normalize(normals[0]);
    vec3 n2 = normalize(normals[1]);
    if(line_type == 0) {
        line(p1, p2);
    } else {
        float scale = curveness / 6.0f;
        float s = length(p2 - p1) * scale;
        vec3 d = p2 - p1;
        d = vec3(0, 0, 0);
        bezierCurve(p1, p1 + n1 * s + d * abs(scale), p2 + n2 * s - d * abs(scale), p2);
    }
}
*/console.log});

var lineShader_VertexCode = IV.multiline(function() {/*@preserve
layout(location = 0) in vec4 vertex_position_thickness;
layout(location = 1) in vec3 vertex_normal;
layout(location = 2) in vec4 vertex_color;

out float thicknesses;
out vec3 positions;
out vec4 colors;
out vec3 normals;

void main() {
    colors = vertex_color;
    normals = omni_transform_normal(vertex_normal);
    positions = omni_transform(vertex_position_thickness.xyz);
    thicknesses = vertex_position_thickness.w;
}
*/console.log});

var lineShader_FragmentCode = IV.multiline(function() {/*@preserve
uniform float specular_term = 20;
uniform vec4 light_ambient = vec4(0.3, 0.3, 0.3, 1.0);
uniform vec4 light_diffuse = vec4(0.7, 0.7, 0.7, 1.0);
uniform vec4 light_specular = vec4(1.0, 1.0, 1.0, 1.0);
in vec4 color;
in vec3 line_direction, light_direction, eye_vector;
in float specular_boost;
layout(location = 0) out vec4 fragment_color;
void main() {
    vec4 colorMixed = color;
    vec4 final_color = colorMixed * (light_ambient);
    vec3 T = normalize(line_direction); // tangent direction.
    vec3 L = normalize(light_direction);
    vec3 LN = normalize(L - T * dot(L, T));
    float lambertTerm = max(dot(LN, L), 0.0);
    final_color += light_diffuse * colorMixed * lambertTerm;
    vec3 E = eye_vector;
    vec3 R = reflect(-L, LN);
    float spec = pow(max(dot(R, E), 0.0), specular_term) + specular_boost;
    final_color += light_specular * spec;
    final_color.a = color.a;
    final_color.rgb *= final_color.a;
    fragment_color = final_color;
    // fragment_color = vec4(1, 1, 1, 1);
}
*/console.log});

var lineShader_begin = function(g, specular, line_type, curveness) {
    if(!lineShader) {
        lineShader = compileShadersWithGeometry(GL,
            "#version 330\n" + g.omnistereo.getShaderCode() + "\n" + lineShader_VertexCode,
            "#version 330\n" + g.omnistereo.getShaderCode() + "\n" + lineShader_GeometryCode,
            "#version 330\n" + g.omnistereo.getShaderCode() + "\n" + lineShader_FragmentCode
        );
        lineShader_VertexArray = new GL.VertexArray();
        lineShader_Buffer = new GL.Buffer();
        GL.bindVertexArray(lineShader_VertexArray);
        GL.bindBuffer(GL.ARRAY_BUFFER, lineShader_Buffer);
        GL.enableVertexAttribArray(0)
        GL.enableVertexAttribArray(1)
        GL.enableVertexAttribArray(2)
        GL.vertexAttribPointer(0, 4, GL.FLOAT, GL.FALSE, 44, 0)
        GL.vertexAttribPointer(1, 3, GL.FLOAT, GL.FALSE, 44, 16)
        GL.vertexAttribPointer(2, 4, GL.FLOAT, GL.FALSE, 44, 28)
        GL.bindBuffer(GL.ARRAY_BUFFER, 0);
        GL.bindVertexArray(0);
    }
    GL.useProgram(lineShader);
    g.omnistereo.setUniforms(lineShader.id());
    GL.uniform1f(GL.getUniformLocation(lineShader, "specular_term"), specular);
    GL.uniform1i(GL.getUniformLocation(lineShader, "line_type"), line_type);
    GL.uniform1f(GL.getUniformLocation(lineShader, "curveness"), curveness);
    GL.uniform3f(GL.getUniformLocation(lineShader, "light_position"), g.environment.light_position.x, g.environment.light_position.y, g.environment.light_position.z);
    GL.uniform4f(GL.getUniformLocation(lineShader, "light_ambient"), 0.3, 0.3, 0.3, 1.0);
    GL.uniform4f(GL.getUniformLocation(lineShader, "light_diffuse"), 0.7, 0.7, 0.7, 1.0);
    GL.uniform4f(GL.getUniformLocation(lineShader, "light_specular"), 1.0, 1.0, 1.0, 1.0);
};

var lineShader_end = function(g) {
    GL.useProgram(0);
};

Objects.Line3D = IV.extend(Objects.Shape, function(info) {
    this.type = "Line3D";
    this.path = info.path;
    if(info.color)
        this.color = info.color;
    else
        this.color = null;
    if(info.filter)
        this.filter = info.filter;
    else
        this.filter = null;
    this.point1 = info.point1;
    this.point2 = info.point2;
    this.width = new Objects.Plain(1);
    this.line_type = "line";
    this.specular_term = 2;
    this.curveness = 1;
}, {
    $auto_properties: [
        "path", "filter", "point1", "point2", "color", "width",
        "line_type",
        "curveness",
        "specular_term"
    ],
    fillDefault: function() {
        if(this.line_type === undefined) this.tick_style = "line";
        if(this.specular_term === undefined) this.specular_term = 2;
        if(this.curveness === undefined) this.curveness = 1;
        if(this.width === undefined) this.width = new Objects.Plain(1);
        //if(this.additional_paths === undefined) this.additional_paths = [];
    },
    postDeserialize: function() {
        this.fillDefault();
    },
    render3D: function(g, data) {
        var $this = this;
        if(g.order == "front") return;
        // if($this.line_type == "curve") {
        //     if(g.order == "back" && $this.curveness >= 0) return;
        //     if(g.order == "front" && $this.curveness < 0) return;
        // } else {
        //     if(g.order == "back") return;
        // }
        line_type = 0;
        if($this.line_type == "curve") line_type = 1;
        var linedata = [];
        var vp = 0;
        $this.path.enumerate(data, function(context) {
            if($this.filter && !$this.filter.get(context)) return;
            var p1 = $this.point1.get(context);
            var p2 = $this.point2.get(context);
            var width = $this.width.get(context);
            if(!p1 || !p2 || !width) return;
            var color;
            if($this.color) color = $this.color.get(context);
            else color = new IV.Color(255, 255, 255, 1);
            linedata[vp * 11 + 0] = p1.y;
            linedata[vp * 11 + 1] = p1.z;
            linedata[vp * 11 + 2] = p1.x;
            linedata[vp * 11 + 3] = width / 500;
            linedata[vp * 11 + 4] = p1.normal.y;
            linedata[vp * 11 + 5] = p1.normal.z;
            linedata[vp * 11 + 6] = p1.normal.x;
            linedata[vp * 11 + 7] = color.r / 255.0;
            linedata[vp * 11 + 8] = color.g / 255.0;
            linedata[vp * 11 + 9] = color.b / 255.0;
            linedata[vp * 11 + 10] = color.a;
            vp += 1;
            linedata[vp * 11 + 0] = p2.y;
            linedata[vp * 11 + 1] = p2.z;
            linedata[vp * 11 + 2] = p2.x;
            linedata[vp * 11 + 3] = width / 500;
            linedata[vp * 11 + 4] = p2.normal.y;
            linedata[vp * 11 + 5] = p2.normal.z;
            linedata[vp * 11 + 6] = p2.normal.x;
            linedata[vp * 11 + 7] = color.r / 255.0;
            linedata[vp * 11 + 8] = color.g / 255.0;
            linedata[vp * 11 + 9] = color.b / 255.0;
            linedata[vp * 11 + 10] = color.a;
            vp += 1;
        });
        var buf = new Buffer(vp * 11 * 4);
        for(var i = 0; i < vp * 11; i++) {
            buf.writeFloatLE(linedata[i], i * 4);
        }
        lineShader_begin(g, this.specular_term, line_type, $this.curveness);
        GL.bindBuffer(GL.ARRAY_BUFFER, lineShader_Buffer);
        GL.bufferData(GL.ARRAY_BUFFER, vp * 4 * 11, buf, GL.STATIC_DRAW);
        GL.bindBuffer(GL.ARRAY_BUFFER, 0);
        GL.blendFunc(GL.ONE, GL.ONE_MINUS_SRC_ALPHA);
        GL.bindVertexArray(lineShader_VertexArray);
        GL.drawArrays(GL.LINES, 0, vp);
        GL.bindVertexArray(0);
        lineShader_end(g);
        var error = GL.getError();
        if(error) console.log("GL Error:", error);
    },
    getPropertyContext: function() {
        var $this = this;
        return Objects.Object.prototype.getPropertyContext.call(this).concat([
            make_prop_ctx($this, "path", "Selector", "Shape", "path"),
            make_prop_ctx($this, "filter", "Filter", "Shape", "filter"),
            make_prop_ctx($this, "color", "Color", "Line3D", "color"),
            make_prop_ctx($this, "point1", "Point1", "Line3D", "point"),
            make_prop_ctx($this, "point2", "Point2", "Line3D", "point"),
            make_prop_ctx($this, "width", "Width", "Line3D", "number"),
            make_prop_ctx($this, "specular_term", "Specular", "Line3D", "plain-number"),
            make_prop_ctx(this, "line_type", "LineType", "Line3D", "plain-string", ["line", "curve"]),
            make_prop_ctx($this, "curveness", "Curveness", "Line3D", "plain-number")
        ]);
    }
});

IV.serializer.registerObjectType("Line3D", Objects.Line3D);
IV.serializer.registerObjectType("CanvasWrapper3D", Objects.CanvasWrapper3D);
IV.serializer.registerObjectType("PointFromData3D", Objects.PointFromData3D);
