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

IV.on("command:toolkit.start", function() {
    var ctx = IV.modals.constructModal({
        html: IV.strings("modal_load_dataset"),
        title: "New / Open Visualization",
        width: $(window).width() * 0.6,
        height: $(window).height() * 0.8
    });
    var page_size = 30;
    var load_page = function(page_index) {
        IV.server.get("datasets/", { page: page_index, page_size: page_size }, function(err, data) {
            ctx.datasets.children().remove();
            ctx.item.find(".pagination").each(function() {
                var c = $(this);
                generate_pagination(c, page_index, page_size, data, load_page);
            });
            data.results.forEach(function(dataset) {
                var li = IV._E("li");
                var dataset_info = IV._E("div").addClass("dataset-info");
                dataset_info.append(IV._E("span", "name").text(dataset.name));
                dataset_info.append(IV._E("span", "description").text(dataset.description));
                li.append(dataset_info);
                dataset_info.click(function() {
                    var ul = li.children("ul");
                    if(ul.length == 0) {
                        ul = IV._E("ul", "visualizations");
                        li.append(ul);
                        var load_visualizations = function(page_index) {
                            IV.server.get("visualizations/", {
                                dataset: dataset.id,
                                page: page_index,
                                page_size: page_size
                            }, function(err, data) {
                                if(err) return;
                                ul.children().remove();
                                ul.append(IV._E("li", "group").append(
                                    IV._E("div", "actions").append(
                                        IV._E("span", "btn btn-s").text("+ New")
                                    ).append(
                                        IV._E("span").text(" ")
                                    ).append(
                                        IV._E("span", "pagination")
                                    )
                                ));
                                ul.find(".pagination").each(function() {
                                    generate_pagination($(this), page_index, page_size, data, load_visualizations);
                                });
                                data.results.forEach(function(vis) {
                                    ul.append(IV._E("li", "group").append(
                                        IV._E("span", "actions pull-right").append(
                                            IV._E("span", "btn btn-s").text("Load")
                                        )
                                    ).append(
                                        IV._E("span", "description").text(vis.description)
                                    ).append(
                                        IV._E("span", "user").text(
                                            "by " + vis.user_info.username + ", " +
                                            new Date(vis.created_at).getFullString()
                                        )
                                    ));
                                });
                            });
                        };
                        load_visualizations(1);
                    } else {
                        ul.toggle();
                    }
                });
                ctx.datasets.append(li);
            });
        });
    };
    load_page(1);
});

})();
