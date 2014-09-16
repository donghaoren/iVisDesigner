// iVisDesigner - scripts/editor/popups/createmap.js
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

IV.popups.CreateMap = function() {
    var data = IV.popups.create();
    data.addActions([ "ok", "cancel" ]);

    var p = data.selector;
    p.children(".content").html(IV.strings("popup_create_map"));

    p.default_width = 300;
    p.default_height = 130;
    var data = p.data();

    var input_longitude = p.find(".input-longitude");
    var input_latitude = p.find(".input-latitude");
    var input_scale = p.find(".input-scale");

    input_longitude.IVInputNumeric(104.1);
    input_latitude.IVInputNumeric(35.6);
    input_scale.IVInputNumeric(6);

    data.onOk = function() {
        var info = {
            longitude: input_longitude.data().get(),
            latitude: input_latitude.data().get(),
            path_longitude: p.find('[data-field="path-longitude"]').data().get(),
            path_latitude: p.find('[data-field="path-latitude"]').data().get(),
            scale: input_scale.data().get()
        };
        Editor.tools.beginSelectLocation(function(loc) {
            if(loc && loc.type == "Plain") {
                info.center = loc.obj;
                var map = new IV.objects.GoogleMap(info);
                Editor.doAddObject(map);
            }
            Editor.tools.endSelectLocation("tools:GoogleMap");
            data.hide();
        }, "tools:GoogleMap");
        /*
        var vertex_path = p.find('[data-field="vertex-path"]').data().get();
        var edgeA = p.find('[data-field="edge-a"]').data().get();
        var edgeB = p.find('[data-field="edge-b"]').data().get();
        var algo = p.find('[data-field="algorithm"]').data().get();
        var obj = new IV.objects.ForceLayout({
            path_nodes: vertex_path,
            path_edgeA: edgeA,
            path_edgeB: edgeB
        });
        Editor.doAddObject(obj);
        data.hide();
        */
    };
    data.onCancel = function() {
        data.hide();
    };
    return data;
};
