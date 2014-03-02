//. iVisDesigner - File: scripts/client/utils.js
//. Copyright 2013-2014 Donghao Ren
//. Peking University, University of California, Santa Barbara
//. See LICENSE.md for more information.

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
