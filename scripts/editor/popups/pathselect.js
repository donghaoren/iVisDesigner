// iVisDesigner - File: scripts/editor/popups/pathselect.js
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

IV.popups.PathSelect = function(fields, previous_path) {
    if(!fields) fields = IV.editor.schema.fields;
    if(!previous_path) previous_path = "";

    var data = IV.popups.create();
    data.addActions([ "cancel" ]);
    var p = data.selector;
    var content = p.children(".content");
    var c = $("<div />").addClass("data-schema");
    content.append(c);
    content.addClass("scrollview").ScrollView();

    function onSelectPath(path, ref) {
        if(data.onSelectPath) data.onSelectPath(path, ref);
        data.hide();
    };
    data.onCancel = function() {
        data.hide();
    };


    var info = {
        set_active: false,
        onSelectPath: function(path) {
            onSelectPath(path);
        }
    };
    if(previous_path == "") {
        var rootelem_span = $('<span class="key">ROOT</span>');
        var rootelem = $("<li/>").append(rootelem_span);
        rootelem_span.data().path = "";
        c.append($('<ul style="margin-bottom: 2px"></ul>').append(rootelem));
        rootelem_span.click(function(e) {
            info.onSelectPath("");
            e.stopPropagation();
        });
    }
    var elems = IV.editor.renderSchemaFields(info, fields, previous_path);
    c.append(elems);

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
