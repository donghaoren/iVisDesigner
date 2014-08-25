// iVisDesigner - File: scripts/client/utils.js
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

var generate_pagination = function(element, page_index, page_size, data, callback) {
    element.children().remove();
    var page_count = Math.ceil(data.count / page_size);
    if(data.count == 0 || page_count == 1) return;
    if(data.previous) {
        element.append(IV._E("span", "prev").text("«").click(function() {
            callback(page_index - 1);
        }));
    } else {
        element.append(IV._E("span", "prev disabled").text("«"));
    }

    for(var i = 1; i <= page_count; i++) {
        (function(i) {
            var s = IV._E("span", "number").text(i).click(function() {
                callback(i);
            });
            if(i == page_index) {
                s.addClass("active");
            }
            element.append(IV._E("span").text(" "));
            element.append(s);
        })(i);
    }
    element.append(IV._E("span").text(" "));
    if(data.next) {
        element.append(IV._E("span", "next").text("»").click(function() {
            callback(page_index + 1);
        }));
    } else {
        element.append(IV._E("span", "next disabled").text("»"));
    }
};
