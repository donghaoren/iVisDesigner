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

IV.popups.CreateStatistics = function() {
    // We put statistics and generators together.
    var data = IV.popups.create();
    data.addActions([ "ok", "cancel" ]);

    var p = data.selector;
    p.children(".content").html(IV.strings("popup_create_statistics"));

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
        if(active_tab == "statistics") {
            var tab = p.find('[data-tab="statistics"]');
            var path = tab.find('[data-field="path"]').data().get();
            var path_data = tab.find('[data-field="path-data"]').data().get();
            var obj = new IV.objects.Statistics({
                path: path,
                path_data: path_data
            });
            Editor.doAddObject(obj);
        }
        if(active_tab == "aggregator") {
            var tab = p.find('[data-tab="aggregator"]');
            var path = tab.find('[data-field="path"]').data().get();
            var path_data = tab.find('[data-field="path-data"]').data().get();
            var obj = new IV.objects.Aggregator({
                path: path,
                path_data: path_data
            });
            Editor.doAddObject(obj);
        }
        if(active_tab == "expression") {
            var tab = p.find('[data-tab="expression"]');
            var path = tab.find('[data-field="path"]').data().get();
            var expression = tab.find('[data-field="expression"]').data().get();
            var obj = new IV.objects.Expression({
                path: path,
                expression: expression
            });
            Editor.doAddObject(obj);
        }
        if(active_tab == "brushing") {
            var tab = p.find('[data-tab="brushing"]');
            var path = tab.find('[data-field="path"]').data().get();
            var obj = new IV.objects.BrushingValue({
                path: path
            });
            Editor.doAddObject(obj);
        }
        if(active_tab == "range") {
            var tab = p.find('[data-tab="range"]');
            var path = tab.find('[data-field="path"]').data().get();
            var min = tab.find('[data-field="min"]').data().get();
            var max = tab.find('[data-field="max"]').data().get();
            var step = tab.find('[data-field="step"]').data().get();
            var obj = new IV.objects.GenerateRange({
                path: path, min: min, max: max, step: step
            });
            Editor.doAddObject(obj);
        }
        data.hide();
    };
    data.onCancel = function() {
        data.hide();
    };
    return data;
};
