//. iVisDesigner - File: scripts/utils/uuid.js
//. Copyright 2013-2014 Donghao Ren
//. University of California, Santa Barbara, Peking University
//. See LICENSE.md for more information.

// ### Generate UUID

// UUID is used for object id.
var guid_chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890abcdefghijklmnopqrstuvwxyz";
NS.generateUUID = function(prefix) {
    // Current format is like `prefix-xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx`
    var r = 'xxxxxxxxxx'.replace(/x/g, function(c) {
        var r = Math.random() * guid_chars.length | 0;
        return guid_chars[r];
    });
    if(prefix) return prefix + r;
    return r;
};
