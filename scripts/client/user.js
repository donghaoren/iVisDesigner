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
    IV.server.accounts("get", function(err, data) {
        if(!err) {
            IV.set("user", data);
            if(callback) callback(true);
        } else {
            if(callback) callback(false);
        }
    });
};
IV.server.reload_account = reload_account;

IV.on("command:account.login", function() {
    var ctx = IV.modals.constructModal({
        html: IV.strings("modal_login"),
        title: "Login",
        width: 400,
        height: 300
    });
    ctx.register.click(function() {
        ctx.close();
        IV.raise("command:account.register");
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
