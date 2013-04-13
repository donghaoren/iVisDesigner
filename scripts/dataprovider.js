// iVisDesigner
// Author: Donghao Ren, 2013.04
// See LICENSE.txt for license information.

// dataprovider.js
// Load data schema and data contents.

IV.dataprovider = { };

function make_async(obj, done, fail) {
    if(!obj) obj = { };
    if(done) obj.ondone = done;
    else obj.ondone = function() {};
    if(fail) obj.onfail = fail;
    else obj.onfail = function() {};
    obj.done = function(f) {
        obj.ondone = f;
        return obj;
    };
    obj.fail = function(f) {
        obj.onfail = f;
        return obj;
    };
    return obj;
};

IV.dataprovider.listDatasets = function(done, fail) {
    var r = make_async(done, fail);
    setTimeout(function() {
        r.ondone([ "cardata" ]);
    }, 1);
    return r;
};

IV.dataprovider.loadSchema = function(name, done, fail) {
    var r = make_async(done, fail);
    $.get("datasets/cardata.schema", function(data) {
        jsyaml.loadAll(data, function(doc) {
            r.ondone(doc);
        });
    });
    return r;
};

IV.dataprovider.loadData = function(name, done, fail) {
    var r = make_async(done, fail);
    $.get("datasets/cardata.data", function(data) {
        jsyaml.loadAll(data, function(doc) {
            r.ondone(doc);
        });
    });
    return r;
};
