// iVisDesigner - scripts/client/ajax.js
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

var ajaxCall = function(url, method, params, callback) {
    if(!callback) callback = function(){};
    if(typeof(params) == "function") callback = params;
    $.ajax({
        url: IV_Config.api_base + url,
        data: params,
        dataType: "json",
        type: method,
        crossDomain: true,
        xhrFields: {
            withCredentials: true
        },
        timeout: 60000,
        beforeSend: function(xhr, settings) {
            xhr.setRequestHeader("X-CSRFToken", $.cookie("csrftoken"));
        }
    }).done(function(data) {
        if(!data) callback(false, null);
        if(data.detail)
            callback(data.detail, null);
        if(data.status && data.status != "success")
            callback(data.status, null);
        else
            callback(false, data);
    }).fail(function() {
        callback("E_CONNECTION");
    });
};

var errorString = function(err) {
    var err_codes = IV.strings("error_codes");
    if(err_codes[err]) return err_codes[err];
    return "Unknown error";
}


IV.server = {
    get: function(url, params, callback) { ajaxCall("api/" + url, "get", params, callback); },
    post: function(url, params, callback) { ajaxCall("api/" + url, "post", params, callback); },
    put: function(url, params, callback) { ajaxCall("api/" + url, "put", params, callback); },
    delete: function(url, params, callback) { ajaxCall("api/" + url, "delete", params, callback); },
    accounts: function(url, params, callback) { ajaxCall("accounts/" + url, "post", params, callback); },
    // twisted: function(action, params, callback) {
    //     params.action = action;
    //     params.sid = IV.server.twisted_sid;
    //     ajaxCall("twisted/", "post", { request: JSON.stringify(params) }, callback);
    // },
    websocket: function(f, params, callback) {

    },
    getDelegateURL: function(host, path, params) {
        if(!params) params = {};
        params = JSON.stringify(params);
        var url = IV_Config.api_base + "/delegate";
        var q = IV.buildQuery({
            "host": host,
            "path": path,
            "query": params,
            "data": params,
            "method": "get"
        });
        return url + "?" + q;
    }
};

IV.downloadFile = function(content, mime, filename, encoding) {
    if(!encoding) encoding = "string";
    var form =
    $('<form action="' + IV_Config.api_base + '/download" method="post" style="display:none" target="_blank">'
     +'<input type="text" name="filename" value="" />'
     +'<input type="text" name="encoding" value="" />'
     +'<input type="text" name="mimetype" value=""></input>'
     +'<textarea name="content"></textarea>'
     +'<input type="submit" value="submit" />'
    +'</form>');
    form.find('input[name="filename"]').val(filename);
    form.find('input[name="mimetype"]').val(mime);
    form.find('input[name="encoding"]').val(encoding);
    form.find('textarea[name="content"]').val(content);
    form.get(0).submit();
};

(function() {
    var url = IV_Config.api_base + "/ws/";
    if(url.substr(0, 4) == 'http') {
        url = IV_Config.api_base.replace(/^http/, "ws");
    } else {
        url = window.location.protocol.replace(/^http/, "ws") + "//" + window.location.host + IV_Config.api_base + "ws/";
    }
    if(IV_Config.url_websocket) url = IV_Config.url_websocket;
    var ws = new Wampy(url, { realm: "anonymous" });

    IV.server.wamp = ws;
})();
