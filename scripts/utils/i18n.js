//. iVisDesigner - File: scripts/utils/i18n.js
//. Copyright 2013-2014 Donghao Ren
//. University of California, Santa Barbara, Peking University
//. See LICENSE.md for more information.

// ======== i18n Support ========

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
