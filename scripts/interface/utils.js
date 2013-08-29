// ### Register Object Type
// Simple mechanism to dynamically call initialization functions for new elements.
(function() {
    var object_types = { };

    IV.registerObjectType = function(c, func) {
        object_types[c] = func;
        $(c).each(function() { func.call($(this)); });
    }

    document.body.addEventListener("DOMNodeInserted", function(event) {
        var $new_element = $(event.target);
        for(var c in object_types) {
            $new_element.find(c).each(function() {
                object_types[c].call($(this));
            });
        }
    }, false);
})();

// data-apply-children
IV.registerObjectType("[data-apply-children]", function() {
    var attr = $(this).attr("data-apply-children");
    var kvs = attr.split(";").map(function(x) {
        var k = x.split("=");
        return { key: k[0], value: k[1] };
    });
    $(this).children().each(function() {
        var $this = $(this);
        kvs.forEach(function(t) {
            $this.attr(t.key, t.value);
        });
    });
});
// data-remove-text-nodes
IV.registerObjectType("[data-remove-text-nodes]", function() {
    $(this).contents().filter(function() { return this.nodeType === 3; }).remove();
});
// data-switch
IV.registerObjectType("span[data-switch]", function() {
    var key = $(this).attr("data-switch");
    var value = $(this).attr("data-value");
    var $this = $(this);
    if(!IV.exists(key)) IV.add(key, "string");
    IV.listen(key, function(v) {
        if(v == value) {
            $this.addClass("active");
        } else {
            $this.removeClass("active");
        }
    });
    $(this).click(function() {
        IV.set(key, value);
    });
});
// data-toggle
IV.registerObjectType("span[data-toggle]", function() {
    var id = $(this).attr("data-toggle");
    if(id[0] == "#") {
        $(id).data().toggle_selector = $(this);
        if($(id).is(":visible")) {
            $(this).addClass("toggle-on");
        } else {
            $(this).removeClass("toggle-on");
        }
        $(this).click(function() {
            $(id).toggle();
            $(this).toggleClass("toggle-on");
        });
    } else {
        if(!IV.exists(id)) IV.add(id, "bool");
        if(IV.get(id)) {
            $(this).addClass("toggle-on");
        } else {
            $(this).removeClass("toggle-on");
        }
        $(this).click(function() {
            IV.set(id, !IV.get(id));
            $(this).toggleClass("toggle-on");
        });
    }
});
// data-popup
IV.registerObjectType("span[data-popup]", function() {
    var key = $(this).attr("data-popup");
    $(this).click(function() {
        var data = IV.popups[key]();
        data.show($(this));
    });
});
// data-href
IV.registerObjectType("span[data-open-page]", function() {
    var href = $(this).attr("data-open-page");
    var title = $(this).attr("data-open-page-title");
    $(this).click(function() {
        $("#panel-page").IVPanel("show");
        $("#panel-page").IVPanel("front");
        if(title) {
            $("#panel-page").IVPanel({ title: title });
        }
        if(href[0] == "#") {
            $("#panel-page-container").html($(href).html());
        } else {
            if(href.substr(0, 7) == "base64:") {
                var ht = atob(href.substr(7));
                $("#panel-page-container").html(ht);
            } else {
                $("#panel-page-container").load(href);
            }
        }
    });
});
// data-command
IV.registerObjectType("span[data-command]", function() {
    var command = $(this).attr("data-command");
    $(this).click(function() {
        IV.raiseEvent("command:" + command);
    });
});
