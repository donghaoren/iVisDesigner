//. iVisDesigner - File: scripts/editor/property/utils.js
//. Copyright 2013-2014 Donghao Ren
//. University of California, Santa Barbara, Peking University
//. See LICENSE.md for more information.

var make_table = function() {
    var tr = IV._E("tr");
    for(var i = 0; i < arguments.length; i++) {
        var arg = arguments[i];
        if(typeof(arg) == "string") {
            if(arg == "|") {
                tr.append(IV._E("td").append(IV._E("span", "sep", " ")))
            } else {
                tr.append(IV._E("td").append(IV._E("span", "", arg)))
            }
        } else {
            tr.append(IV._E("td").append(arg));
        }
    }
    return IV._E("table", "linear-even").append(tr);
}
