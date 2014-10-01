// iVisDesigner - scripts/core/workspace.js
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

IV.Workspace = function() {
    this.type = "Workspace";
    this.uuid = IV.generateUUID();
    // All objects of the visualization, ordered in an array.
    this.canvases = [];
    this.objects = [];
    this.default_canvas = null;
    // Selected objects.
    IV.EventSource.call(this);
};

IV.serializer.registerObjectType("Workspace", IV.Workspace);
IV.implement(IV.EventSource, IV.Workspace);

// Serialization support.
IV.Workspace.prototype.serializeFields = function() {
    return [ "canvases", "objects", "uuid", "default_canvas" ];
};

IV.Workspace.prototype.postDeserialize = function() {
    IV.EventSource.call(this);
};

// Canvas management.
IV.Workspace.prototype.addCanvas = function(info) {
    /* info = {
     *    name: "Canvas Name"
     *    visualization: <IV.Visualization object>
     *    pose: { // for allosphere.
     *      center: <Vector3>
     *      normal: <Vector3>
     *      up: <Vector3>
     *      width: <Vector3>
     *    }
     * }
     */
     if(!info) info = { };
    if(!info.pose) {
        info.pose = {
            center: new IV.Vector3(1, 0, 0),
            normal: new IV.Vector3(-1, 0, 0),
            up: new IV.Vector3(0, 0, 1),
            width: 0.5
        };
    }
    if(!info.visualization) info.visualization = new IV.Visualization();
    if(!info.name) {
        var index = 1;
        var names = { };
        this.canvases.forEach(function(c) { names[c.name] = true; });
        while(names["Canvas" + index]) index += 1;
        info.name = "Canvas" + index;
    }
    this.canvases.push(info);
    if(this.default_canvas == null) this.default_canvas = info;
};

IV.Workspace.prototype.removeCanvas = function(info) {
    var index = this.canvases.indexOf(info);
    if(index >= 0) {
        this.canvases.splice(index, 1);
    }
};

IV.Workspace.prototype.validateAll = function(data) {
    this.canvases.forEach(function(canvas) {
        canvas.visualization.validate(data);
    });
    this.objects.forEach(function(canvas) {
        canvas.visualization.validate(data);
    });
};

var WorkspaceSync = function() {
    this.serializer = new IV.Serializer();
    this.workspace = null;
};

WorkspaceSync.prototype.processMessage = function(msg) {
    if(msg.type == "sync.startup") {
        this.serializer = new IV.Serializer();
        this.workspace = this.serializer.deserialize(msg.workspace);
        if(this.onUpdate) this.onUpdate();
    } else if(msg.type == "sync.perform") {
        var actions = this.serializer.deserialize(msg.actions);
        actions.actions.forEach(function(action) {
            if(action.perform) action.perform();
        });
        if(this.onUpdate) this.onUpdate();
    } else if(msg.type == "sync.rollback") {
    } else return;
    //console.log(msg);
};
