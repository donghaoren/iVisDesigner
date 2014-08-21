//. iVisDesigner - File: scripts/utils/storage.js
//. Copyright 2013-2014 Donghao Ren
//. University of California, Santa Barbara, Peking University
//. See LICENSE.md for more information.


// ======== Local Storage ========

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
