// iVisDesigner - scripts/editor/popups/creategenerator.js
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

IV.popups.CreateLink3D = function() {
    // We put statistics and generators together.
    var data = IV.popups.create();
    data.addActions([ "ok", "cancel" ]);

    var p = data.selector;
    p.children(".content").html(IV.strings("popup_create_link3d"));

    p.default_width = 400;
    p.default_height = 130;
    var data = p.data();

    p.find(".input-numeric").each(function() {
        var t = $(this);
        var def = t.attr("data-default");
        if(def !== undefined) {
            t.IVInputNumeric(parseFloat(def));
        } else {
            t.IVInputNumeric();
        }
    });

    data.onOk = function() {
        var active_tab = p.find(".tab").data().current;
        if(active_tab == "line3d") {
            var tab = p.find('[data-tab="line3d"]');
            var path = tab.find('[data-field="path"]').data().get();
            var obj1 = tab.find('[data-field="anchor1"]').data().get();
            var obj2 = tab.find('[data-field="anchor2"]').data().get();
            var wrapper1 = new IV.objects.CanvasWrapper3D(obj1[0], obj1[1]);
            var wrapper2 = new IV.objects.CanvasWrapper3D(obj2[0], obj2[1]);
            var line = new IV.objects.Line3D({
                path: path,
                point1: wrapper1,
                point2: wrapper2
            });
            IV.editor.doAddWorkspaceObject(line);
        }
        data.hide();
    };
    data.onCancel = function() {
        data.hide();
    };
    return data;
};
