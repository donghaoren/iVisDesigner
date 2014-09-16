// iVisDesigner - scripts/utils/i18n.js
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

var langs = { };

NS.language = function(name) {
    if(langs[name] == undefined) {
        langs[name] = {
            // key: string
            add: function(data) {
                for(var key in data) {
                    this[key] = data[key];
                    if(!langs._[key]) {
                        langs._[key] = data[key];
                    }
                }
                return this;
            },
            set: function() {
                NS.switchLanguage(name);
                return this;
            }
        };
    }
    return langs[name];
};

NS.str = function(key) {
    var k = langs[NS.currentLanguage][key];
    if(!k) {
        if(langs["_"][key]) return langs["_"][key];
        return "@.@";
    }
    else return k;
};

NS.switchLanguage = function(name) {
    NS.currentLanguage = name;
    $("*[i18n]").each(function() {
        var key = $(this).attr("i18n");
        $(this).html(NS.str(key));
    });
};

NS.language("_");
NS.language("en");
NS.language("zh");
NS.currentLanguage = "en";
