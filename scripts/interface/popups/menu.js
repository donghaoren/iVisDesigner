// iVisDesigner - File: scripts/interface/popups/menu.js
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

IV.popups.beginContextMenu = function(anchor, list, callback) {
    var data = IV.popups.create();
    var ul = $("<ul />").addClass("context-menu");
    var max_width = 50;
    list.forEach(function(text) {
        var disp = text;
        var name = text;
        if(typeof(text) == "object") {
            disp = text.display;
            name = text.name;
        }
        ul.append($("<li />").text(disp).click(function() {
            data.hide();
            callback(name);
        }));
        // TODO: Font hardcoded.
        var m = IV.measureText(disp, "12px 'Lucida Sans Unicode', 'Lucida Grande', sans-serif");
        if(m.width > max_width) max_width = m.width;
    });
    data.selector.children(".content").append(ul);
    // TODO: Auto compute metrics.
    data.show(anchor, max_width + 14, 18 * list.length - 2);
};
