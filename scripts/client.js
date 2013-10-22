(function() {
var ajaxCall = function(url, method, params, callback) {
    if(typeof(params) == "function") callback = params;
    $.ajax({
        url: IV_Config.api_base + url,
        data: params,
        dataType: "json",
        type: method,
        crossDomain: true,
        xhrFields: {
            withCredentials: true
        }
    }).done(function(data) {
        if(data.detail)
            callback(data.detail, null);
        if(data.status && data.status != "success")
            callback(data.status, null);
        else
            callback(false, data);
    }).fail(function() {
        callback("E_UNKNOWN");
    });
};


IV.server = {
    get: function(url, params, callback) { ajaxCall("api/" + url, "get", params, callback); },
    post: function(url, params, callback) { ajaxCall("api/" + url, "post", params, callback); },
    put: function(url, params, callback) { ajaxCall("api/" + url, "put", params, callback); },
    delete: function(url, params, callback) { ajaxCall("api/" + url, "delete", params, callback); },
    accounts: function(url, params, callback) { ajaxCall("accounts/" + url, "post", params, callback); },
};

IV.add("user");
IV.listen("user", function(data) {
    if(data) {
        $(".user-name").text(data.username);
    } else {
        $(".user-name").text("anonymous");
    }
});
IV.set("user", null);
var reload_account = function(callback) {
    IV.server.get("account", function(err, data) {
        if(!err) {
            IV.set("user", data);
            if(callback) callback(true);
        } else {
            if(callback) callback(false);
        }
    });
};

IV.on("command:account.login", function() {
    var ctx = IV.modals.constructModal({
        html: IV.strings("modal_login"),
        title: "Login",
        width: 400,
        height: 300
    });
    ctx.submit.click(function() {
        var username = ctx.username.val();
        var password = ctx.password.val();
        ctx.status_working();
        IV.server.accounts("login", {
            username: username,
            password: password
        }, function(err, data) {
            if(!err) {
                reload_account(function(success) {
                    ctx.close();
                });
            } else {
                ctx.status_error("Login failed: " + err);
            }
        });
    });
});

IV.on("command:account.logout", function() {
    IV.set("user", null);
    IV.server.accounts("logout");
});

IV.on("command:account.register", function() {
    var ctx = IV.modals.constructModal({
        html: IV.strings("modal_register"),
        title: "Register",
        width: 400,
        height: 300
    });
    ctx.submit.click(function() {
        var username = ctx.username.val();
        var email = ctx.email.val();
        var password1 = ctx.password1.val();
        var password2 = ctx.password2.val();
        IV.server.accounts("register", {
            username: username,
            email: email,
            password1: password1,
            password2: password2
        }, function(err, data) {
            reload_account();
        });
    });
});

})();
