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

var lineShader_GeometryCode = IV.multiline(function() {/*@preserve
varying in vec4 colors[2];
varying in vec3 normals[2];
varying out vec4 color;
varying out vec3 line_direction, light_direction, eye_vector;
varying float specular_boost;

uniform int line_type;
uniform float curveness;

vec3 iv_to_al_3(in vec3 v) {
    return vec3(v.y, v.z, v.x);
}

void bezierCurve(vec3 p1, vec3 p2, vec3 p3, vec3 p4) {
    int tick_count = 40;
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
        gl_Position = omni_render(vec4(p, 1.0f));
        light_direction = normalize(iv_to_al_3(gl_LightSource[0].position.xyz) - p);
        eye_vector = normalize(-p);
        specular_boost = max(max(0.0, 1.0 - 5.0 * t), max(0.0, 1.0 - 5.0 * (1.0 - t)));
        EmitVertex();
    }
    EndPrimitive();
}

void line(vec3 p1, vec3 p2) {
    int tick_count = 50;
    int i;
    line_direction = normalize(p2 - p1);
    for(i = 0; i <= tick_count; i++) {
        float t = float(i) / float(tick_count);
        vec3 p = p1 + (p2 - p1) * t;
        gl_Position = omni_render(vec4(p, 1.0f));
        light_direction = normalize(gl_LightSource[0].position.xyz - p);
        eye_vector = normalize(-p);
        specular_boost = max(max(0.0, 1.0 - 5.0 * t), max(0.0, 1.0 - 5.0 * (1.0 - t)));
        EmitVertex();
    }
    EndPrimitive();
}

void line2(vec3 p1, vec3 p2) {
    int tick_count = 10;
    int i;
    line_direction = normalize(p2 - p1);
    for(i = 0; i <= tick_count; i++) {
        float t = float(i) / float(tick_count);
        vec3 p = p1 + (p2 - p1) * t;
        gl_Position = omni_render(vec4(p, 1.0f));
        light_direction = normalize(gl_LightSource[0].position.xyz - p);
        eye_vector = normalize(-p);
        EmitVertex();
    }
    EndPrimitive();
}

void bezierCurve2(vec3 p1, vec3 p2, vec3 p3, vec3 p4) {
    line2(p1, p2);
    line2(p2, p3);
    line2(p3, p4);
}

void main() {
    color = colors[0];
    vec3 p1 = gl_PositionIn[0].xyz;
    vec3 p2 = gl_PositionIn[1].xyz;
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
varying vec4 colors;
varying vec3 normals;
varying vec3 light_directions, eye_vectors;

vec4 iv_to_al(in vec4 v) {
    return vec4(v.y, v.z, v.x, v.w);
}

vec3 iv_to_al_3(in vec3 v) {
    return vec3(v.y, v.z, v.x);
}

void main() {
    colors = gl_Color;
    normals = gl_NormalMatrix * iv_to_al_3(gl_Normal);
    vec4 vertex = gl_ModelViewMatrix * iv_to_al(gl_Vertex);
    gl_Position = vertex;
}
*/console.log});

var lineShader_FragmentCode = IV.multiline(function() {/*@preserve
uniform float specular_term;
varying vec4 color;
varying vec3 line_direction, light_direction, eye_vector;
varying float specular_boost;
void main() {
    vec4 colorMixed = color;
    vec4 final_color = colorMixed * (gl_LightSource[0].ambient);
    vec3 T = line_direction; // tangent direction.
    vec3 L = light_direction;
    vec3 LN = normalize(L - T * dot(L, T));
    float lambertTerm = max(dot(LN, L), 0.0);
    final_color += gl_LightSource[0].diffuse * colorMixed * lambertTerm;
    vec3 E = eye_vector;
    vec3 R = reflect(-L, LN);
    float spec = pow(max(dot(R, E), 0.0), specular_term) + specular_boost;
    final_color += gl_LightSource[0].specular * spec;
    gl_FragColor = final_color;
}
*/console.log});

var lineShader_begin = function(g, specular, line_type, curveness) {
    if(!lineShader) lineShader = g.allosphere.shaderCreateWithGeometry(
        lineShader_VertexCode, lineShader_FragmentCode,
        lineShader_GeometryCode, GL.LINES, GL.LINE_STRIP, 50
    );
    g.allosphere.shaderBegin(lineShader);
    g.allosphere.shaderUniformf("specular_term", specular);
    g.allosphere.shaderUniformi("line_type", line_type);
    g.allosphere.shaderUniformf("curveness", curveness);
};

var lineShader_end = function(g) {
    g.allosphere.shaderEnd(lineShader);
};

var drawLineStraight = function(g, p1, p2) {
    var tick_count = 10;
    var n = p1.sub(p2);
    g.GL.normal3f(n.x, n.y, n.z);
    for(var tick = 0; tick < tick_count; tick++) {
        var a = p1.interp(p2, tick / tick_count);
        var b = p1.interp(p2, (tick + 1) / tick_count);
        g.GL.vertex3f(a.x, a.y, a.z);
        g.GL.vertex3f(b.x, b.y, b.z);
    }
};

var drawLineCircular = function(g, p1, p2) {
    var tick_count = 20;
    var up = p1.normal.cross(p2.normal).normalize();
    var ex = p1.normal.cross(up).normalize();
    var ey = up.cross(ex).normalize();
    var d = p1.distance(p2);
    var theta = Math.acos(p1.normal.normalize().dot(p2.normal.normalize()));
    var r = d / 2.0 / Math.sin((Math.PI - theta) / 2.0);
    var O = p1.sub(ex.scale(r));
    var r2 = p2.sub(O);
    var r2x = r2.dot(ex);
    var r2y = r2.dot(ey);
    var r2theta = Math.atan2(r2y, r2x);
    for(var i = 0; i < tick_count; i++) {
        var angle1 = r2theta * i / tick_count;
        var angle2 = r2theta * (i + 1) / tick_count;
        var m1 = O.add(ex.scale(r * Math.cos(angle1))).add(ey.scale(r * Math.sin(angle1)));
        var m2 = O.add(ex.scale(r * Math.cos(angle2))).add(ey.scale(r * Math.sin(angle2)));
        var n = m1.sub(m2);
        g.GL.normal3f(n.x, n.y, n.z);
        g.GL.vertex3f(m1.x, m1.y, m1.z);
        g.GL.vertex3f(m2.x, m2.y, m2.z);
    }
};

var drawBezierCurve = function(g, p1, p2, p3, p4) {
    var tick_count = 20;
    var prev = p1;
    for(var i = 1; i <= tick_count; i++) {
        var t = i / tick_count;
        var t2 = t * t;
        var t3 = t2 * t;
        var k1 = 1 - 3 * t + 3 * t2 - t3;
        var k2 = 3 * t - 6 * t2 + 3 * t3;
        var k3 = 3 * t2 - 3 * t3;
        var k4 = t3;
        var p = p1.scale(k1).add(p2.scale(k2)).add(p3.scale(k3)).add(p4.scale(k4));
        var n = p.sub(prev);
        g.GL.normal3f(n.x, n.y, n.z);
        g.GL.vertex3f(prev.x, prev.y, prev.z);
        g.GL.vertex3f(p.x, p.y, p.z);
        prev = p;
    }
};

var drawLineBezier = function(g, p1, p2) {
    var d = p1.distance(p2);
    drawBezierCurve(g, p1, p1.add(p1.normal.scale(d / 2)), p2.add(p2.normal.scale(d / 2)), p2);
};

var drawLineBezierBack = function(g, p1, p2) {
    var d = p1.distance(p2);
    drawBezierCurve(g, p1, p1.add(p1.normal.scale(-d / 2)), p2.add(p2.normal.scale(-d / 2)), p2);
};

var drawHermiteCurve = function(g, p1, p2, r1, r2) {
    var tick_count = 20;
    var prev = p1;
    for(var i = 1; i <= tick_count; i++) {
        var t = i / tick_count;
        var t2 = t * t;
        var t3 = t2 * t;
        var k1 = 2 * t3 - 3 * t2 + 1;
        var k2 = 3 * t2 - 2 * t3;
        var k3 = t3 - 2 * t2 + t;
        var k4 = t3 - t2;
        var p = p1.scale(k1).add(p2.scale(k2)).add(r1.scale(k3)).add(r2.scale(k4));
        var n = p.sub(prev);
        g.GL.normal3f(n.x, n.y, n.z);
        g.GL.vertex3f(prev.x, prev.y, prev.z);
        g.GL.vertex3f(p.x, p.y, p.z);
        prev = p;
    }
};

var drawLineHermite = function(g, p1, p2) {
    drawHermiteCurve(g, p1, p2, p1.normal.scale(2), p2.normal.scale(-2));
};

var drawLineHermiteBack = function(g, p1, p2) {
    drawHermiteCurve(g, p1, p2, p1.normal.scale(-2), p2.normal.scale(2));
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
        lineShader_begin(g, this.specular_term, line_type, $this.curveness);
        g.GL.enable(g.GL.LINE_SMOOTH);
        g.GL.hint(g.GL.LINE_SMOOTH_HINT, g.GL.NICEST);
        g.GL.blendFunc(g.GL.SRC_ALPHA, g.GL.ONE_MINUS_SRC_ALPHA);
        $this.path.enumerate(data, function(context) {
            if($this.filter && !$this.filter.get(context)) return;
            var p1 = $this.point1.get(context);
            var p2 = $this.point2.get(context);
            var width = $this.width.get(context);
            if(!p1 || !p2 || !width) return;
            if(g.chart_mode == "mono") {
                var p1n = p1.normal;
                var p2n = p2.normal;
                p1 = p1.scale(5 / p1.length());
                p2 = p2.scale(5 / p2.length());
                p1.normal = p1n;
                p2.normal = p2n;
            }
            var color;
            if($this.color) color = $this.color.get(context);
            else color = new IV.Color(255, 255, 255, 1);
            g.GL.lineWidth(width);
            g.GL.begin(g.GL.LINES);
            g.GL.color4f(color.r / 255.0, color.g / 255.0, color.b / 255.0, color.a);
            g.GL.normal3f(p1.normal.x, p1.normal.y, p1.normal.z);
            g.GL.vertex3f(p1.x, p1.y, p1.z);
            g.GL.normal3f(p2.normal.x, p2.normal.y, p2.normal.z);
            g.GL.vertex3f(p2.x, p2.y, p2.z);
            g.GL.end();
        });
        lineShader_end(g);
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
