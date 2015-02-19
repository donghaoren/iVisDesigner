// iVisDesigner - scripts/client/nested.js
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

(function() { if(IV.getQuery("nested") != "true") return;
window.isNested = true;

window.addEventListener("message", function(event) {
    var message = JSON.parse(event.data);
    if(message.type == "dataset.set") {
        var schema = message.schema;
        var data = message.data;

        var ds = new IV.PlainDataset(data, schema);
        var vis = IV.editor.workspace;
        IV.loadVisualization();
        IV.data = new IV.DataObject(ds.obj, ds.schema);
        IV.editor.setData(IV.data);
        if(!vis) {
            IV.newVisualization();
        } else {
            IV.loadVisualization(vis);
        }
    }
    if(message.type == "visualization.set") {
        var vis = IV.serializer.deserialize(message.visualization);
        IV.loadVisualization(vis);
        IV.dataset_id = null;
        vis.clearSelection();
    }
    if(message.type == "visualization.get") {
        var serialized = IV.serializer.serialize(IV.editor.workspace);
        event.source.postMessage(JSON.stringify({
            type: "visualization.get:response",
            visualization: serialized
        }), event.origin);
    }
}, false);

})();
