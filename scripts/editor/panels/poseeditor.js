// iVisDesigner - File: scripts/editor/panels/poseeditor.js
// Copyright (c) 2013-2014, Donghao Ren
// University of California Santa Barbara, Peking University
// Advised by Prof. Tobias Hollerer and previously by Prof. Xiaoru Yuan.
//
// All rights reserved.
//
// Redistribution and use in source and binary forms, with or without
// modification, are permitted provided that the following conditions are met:
//
// 1. Redistributions of source code must retain the above copyright notice,
//    this list of conditions and the following disclaimer.
//
// 2. Redistributions in binary form must reproduce the above copyright
//    notice, this list of conditions and the following disclaimer in the
//    documentation and/or other materials provided with the distribution.
//
// THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS
// IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO,
// THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR
// PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR
// CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
// EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,
// PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS;
// OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY,
// WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR
// OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF
// ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

(function() {
    // Pose editor for Allosphere.
    // We assume normal = - ||center||, and up = 0, 0, 1
    var PoseEditor = function() {
        var self = this;

        this.canvas = document.createElement("canvas");

        var track_context = null;
        this._handlers = { };
        IV.trackMouseEvents($(this.canvas), {
            down: function(e) {
                var p = self.fromEventCoordinates(e);
                for(var i in self._handlers) {
                    if(self._handlers[i]) {
                        track_context = self._handlers[i](p);
                        if(track_context) return;
                    }
                }
            },
            move: function(e) {
                var p = self.fromEventCoordinates(e);
                if(track_context) {
                    track_context.move(p);
                }
            },
            up: function() { track_context = null; }
        });

        this.resize(100, 100);

        this.setPose({
            center: new IV.Vector3(1, 0, 0),
            normal: new IV.Vector3(-1, 0, 0),
            up: new IV.Vector3(0, 0, 1),
            width: 0.5
        });
    };

    IV.PoseEditor = PoseEditor;

    var sphere_center = { x: 60, y: 60 };
    var sphere_spacing = 5;
    var sphere_radius = 40;
    var handle_size = 10;
    var altitude_center = { x: 130, y: 60 };
    var distance_slider_y = 130
    var distance_slider_begin = 10;
    var distance_slider_end = 190;
    var distance_slider_size = 6;
    var distance_max = 2;

    var width_slider_y = 160
    var width_slider_begin = 10;
    var width_slider_end = 190;
    var width_slider_size = 6;
    var width_max = 2;

    PoseEditor.prototype.fromEventCoordinates = function(e) {
        var x = e.pageX - $(this.canvas).offset().left;
        var y = e.pageY - $(this.canvas).offset().top;
        var w = this.width;
        var h = this.height;
        var r = { x: x / w * 200, y : y / w * 200 };
        return r;
    };

    PoseEditor.prototype.resize = function(w, h) {
        this.ratio = IV.getOptimalRatio();
        this.width = w;
        this.height = h;
        this.canvas.width = w * this.ratio;
        this.canvas.height = h * this.ratio;
        $(this.canvas).css("width", w + "px");
        $(this.canvas).css("height", h + "px");

        this.render();
    };

    PoseEditor.prototype.render = function() {
        var self = this;
        var ctx = this.canvas.getContext("2d");
        var w = this.width;
        var h = this.height;
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        ctx.save();

        ctx.scale(this.ratio, this.ratio);
        ctx.scale(w / 200, h / 200);

        ctx.save();

        ctx.strokeStyle = "white";

        // Draw allosphere.
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(sphere_center.x + sphere_spacing, sphere_center.y, sphere_radius, -0.5 * Math.PI, 0.5 * Math.PI);
        ctx.closePath();
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(sphere_center.x - sphere_spacing, sphere_center.y, sphere_radius, 0.5 * Math.PI, 1.5 * Math.PI);
        ctx.closePath();
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(altitude_center.x, altitude_center.y, sphere_radius, -0.5 * Math.PI, 0.5 * Math.PI);
        ctx.closePath();
        ctx.stroke();

        (function() {
            var radius = sphere_radius + handle_size * 1.2;
            var pos_x = sphere_center.x + radius * Math.cos(-self.phi);
            var pos_y = sphere_center.y + radius * Math.sin(-self.phi);
            ctx.save();
            ctx.translate(pos_x, pos_y);
            ctx.rotate(-self.phi);
            ctx.beginPath();
            ctx.moveTo(0, +handle_size);
            ctx.lineTo(0, -handle_size);
            ctx.lineWidth = 2;
            ctx.stroke();
            ctx.restore();
            self._handlers.phi = function(p) {
                if((p.x - pos_x) * (p.x - pos_x) + (p.y - pos_y) * (p.y - pos_y) < handle_size * handle_size) {
                    return {
                        move: function(p2) {
                            self.phi = -Math.atan2(p2.y - sphere_center.y, p2.x - sphere_center.x);
                            self.render();
                            self._raise();
                        }
                    };
                }
                return null;
            };
        })();

        (function() {
            var radius = sphere_radius + handle_size;
            var pos_x = altitude_center.x + radius * Math.cos(-self.theta);
            var pos_y = altitude_center.y + radius * Math.sin(-self.theta);
            ctx.save();
            ctx.translate(pos_x, pos_y);
            ctx.rotate(-self.theta);
            ctx.beginPath();
            ctx.moveTo(0, +handle_size);
            ctx.lineTo(0, -handle_size);
            ctx.lineWidth = 2;
            ctx.stroke();
            ctx.restore();
            self._handlers.theta = function(p) {
                if((p.x - pos_x) * (p.x - pos_x) + (p.y - pos_y) * (p.y - pos_y) < handle_size * handle_size) {
                    return {
                        move: function(p2) {
                            self.theta = -Math.atan2(p2.y - altitude_center.y, p2.x - altitude_center.x);
                            var max_allowed = Math.PI / 2 * 0.9;
                            if(self.theta < -max_allowed) self.theta = -max_allowed;
                            if(self.theta > max_allowed) self.theta = max_allowed;
                            self.render();
                            self._raise();
                        }
                    };
                }
                return null;
            };
        })();

        (function() {
            ctx.beginPath();
            ctx.moveTo(distance_slider_begin, distance_slider_y);
            ctx.lineTo(distance_slider_end, distance_slider_y);
            ctx.lineWidth = 1;
            ctx.strokeStyle = "white";
            ctx.stroke();
            var pos_x = self.distance / distance_max * (distance_slider_end - distance_slider_begin) + distance_slider_begin;
            ctx.beginPath();
            ctx.arc(pos_x, distance_slider_y, distance_slider_size, 0, Math.PI * 2);
            ctx.fillStyle = "white";
            ctx.fill();

            self._handlers.distance = function(p) {
                if((p.x - pos_x) * (p.x - pos_x) + (p.y - distance_slider_y) * (p.y - distance_slider_y) < distance_slider_size * distance_slider_size) {
                    return {
                        move: function(p2) {
                            self.distance = (p2.x - distance_slider_begin) / (distance_slider_end - distance_slider_begin) * distance_max;
                            if(self.distance > distance_max) self.distance = distance;
                            if(self.distance < 1e-2) self.distance = 1e-2;
                            self.render();
                            self._raise();
                        }
                    };
                }
            }
        })();

        (function() {
            ctx.beginPath();
            ctx.moveTo(width_slider_begin, width_slider_y);
            ctx.lineTo(width_slider_end, width_slider_y);
            ctx.lineWidth = 1;
            ctx.strokeStyle = "white";
            ctx.stroke();
            var pos_x = self.texture_width / width_max * (width_slider_end - width_slider_begin) + width_slider_begin;
            ctx.beginPath();
            ctx.arc(pos_x, width_slider_y, width_slider_size, 0, Math.PI * 2);
            ctx.fillStyle = "white";
            ctx.fill();

            self._handlers.width = function(p) {
                if((p.x - pos_x) * (p.x - pos_x) + (p.y - width_slider_y) * (p.y - width_slider_y) < width_slider_size * width_slider_size) {
                    return {
                        move: function(p2) {
                            self.texture_width = (p2.x - width_slider_begin) / (width_slider_end - width_slider_begin) * width_max;
                            if(self.texture_width > width_max) self.texture_width = width_max;
                            if(self.texture_width < 1e-2) self.texture_width = 1e-2;
                            self.render();
                            self._raise();
                        }
                    };
                }
            }
        })();

        ctx.restore();

        ctx.restore();
    };

    PoseEditor.prototype.setPose = function(pose) {
        this.pose = pose;
        this._updateAngles();
        this.render();
    };

    PoseEditor.prototype._raise = function() {
        this.pose.center = new IV.Vector3(
            this.distance * Math.cos(this.phi) * Math.cos(this.theta),
            this.distance * Math.sin(this.phi) * Math.cos(this.theta),
            this.distance * Math.sin(this.theta)
        );
        this.pose.normal = this.pose.center.normalize().scale(-1);
        this.pose.width = this.texture_width;
        if(this.onPoseChanged) {
            this.onPoseChanged({
                center: this.pose.center,
                normal: this.pose.normal,
                up: this.pose.up,
                width: this.pose.width
            });
        }
    };

    PoseEditor.prototype._updateAngles = function() {
        var pose = this.pose;
        pose.normal = pose.center.normalize().scale(-1);
        this.phi = Math.atan2(pose.center.y, pose.center.x);
        this.theta = Math.atan2(pose.center.z, Math.sqrt(pose.center.x * pose.center.x + pose.center.y * pose.center.y));
        this.distance = pose.center.length();
        this.texture_width = pose.width;
    };


    Editor.pose_editor = new IV.PoseEditor();
    $("#pose-view").append($(Editor.pose_editor.canvas));
    Editor.pose_editor.resize(198, 198);

})();
