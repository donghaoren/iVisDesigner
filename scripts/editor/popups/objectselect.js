// iVisDesigner - scripts/editor/popups/objectselect.js
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

IV.popups.ObjectSelect = function() {
    var data = IV.popups.create();
    data.addActions([ "cancel" ]);
    var p = data.selector;
    var content = p.children(".content");
    var c = $("<div />").addClass("object-list");
    content.append(c);
    content.addClass("scrollview").ScrollView();

    function onSelectObject(canvas, obj) {
        if(data.onSelectObject) data.onSelectObject(canvas, obj);
        data.hide();
    };
    data.onCancel = function() {
        data.hide();
    };

    var ws = IV.editor.workspace;
    ws.canvases.forEach(function(canvas) {
        c.append(IV._E("div", "selector", canvas.name));
        var ul = IV._E("ul", "objects");
        c.append(ul);
        canvas.visualization.objects.forEach(function(obj) {
            var li = IV._E("li", "object", " " + obj.name);
            li.prepend(IV._E("i", "icon " + IV.editor.object_icons[obj.type]));
            ul.append(li);
            li.click(function() {
                onSelectObject(canvas, obj);
            });
        });
    });

    return data;
/*
    var selected_ref = null;


    c.find("span.key").each(function() {
        var $this = $(this);
        $this.click(function() {
            c.find("span.key").removeClass("active");
            $this.addClass("active");
            var data = $this.data();
            onSelectPath(data.path, selected_ref);
        });
    });
    c.find("span.ref").each(function() {
        var $this = $(this);
        var p = $this.parent();
        $this.click(function(e) {
            if($this.is(".active")) {
                c.find("span.ref").removeClass("active");
                selected_ref = null;
            } else {
                c.find("span.ref").removeClass("active");
                $this.addClass("active");
                var data = p.data();
                selected_ref = data.path;
            }
            e.stopPropagation();
        });
    });
    return data;
*/
};
