// ### Generate UUID

// UUID is used for object id.
var guid_chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890abcdefghijklmnopqrstuvwxyz~!@#$%^&*()_+=-{}][:;?><,./|";
NS.generateUUID = function(prefix) {
    // Current format is like `prefix-xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx`
    var r = 'xxxxxxxxxx'.replace(/x/g, function(c) {
        var r = Math.random() * guid_chars.length | 0;
        return guid_chars[r];
    });
    if(prefix) return prefix + r;
    return r;
};
