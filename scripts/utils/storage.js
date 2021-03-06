// iVisDesigner - scripts/utils/storage.js
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

NS.localStoragePrefix = "ivisdesigner_";

NS.addEvent("storage");

NS.saveObject = function(key, object) {
    window.localStorage.setItem(this.localStoragePrefix + key, JSON.stringify(object));
};
NS.saveString = function(key, str) {
    window.localStorage.setItem(this.localStoragePrefix + key, str);
};

NS.removeObject = function(key) {
    window.localStorage.removeItem(this.localStoragePrefix + key);
};

NS.loadObject = function(key) {
    var item = window.localStorage.getItem(this.localStoragePrefix + key);
    if(item) return JSON.parse(item);
    return null;
};
NS.loadString = function(key) {
    var item = window.localStorage.getItem(this.localStoragePrefix + key);
    if(item) return item;
    return null;
};

NS.storageKeys = function() {
    var keys = [];
    for(var i in window.localStorage) {
        if(i.substr(0, NS.localStoragePrefix.length) == NS.localStoragePrefix) {
            var key = i.substr(NS.localStoragePrefix.length);
            keys.push(key)
        }
    }
    return keys;
};

if(typeof(window) != "undefined") {
    window.addEventListener("storage", function(e) {
        if(!e) e = window.event;
        if(e.key.substr(0, NS.localStoragePrefix.length) == NS.localStoragePrefix) {
            var key = e.key.substr(NS.localStoragePrefix.length);
            NS.raiseEvent("storage", {
                key: key,
                old_value: JSON.parse(e.oldValue),
                new_value: JSON.parse(e.newValue),
                url: e.url });
        }
    }, false);
}
