//. iVisDesigner - File: scripts/interface/panels/property.js
//. Copyright 2013-2014 Donghao Ren
//. Peking University, University of California, Santa Barbara
//. See LICENSE.md for more information.

// The property panel.
(function() {

    var container = $("#panel-property-container");

    IV.panels.property = {
        loadContext: function(ctx) {
            container.children().remove();
            var pc = $("<p />");
            container.append(pc);
            ctx.items.forEach(function(item) {
                var group = $("<span />").addClass("property-item");
                pc.append(group);
                if(item.type == "string") {
                    var name = $("<span />").addClass("text").text(item.name + ": ");
                    var elem = $("<span />").addClass("input-string");
                    group.append(name);
                    group.append(elem);
                    elem.IVInputString(item.value);
                    elem.IVInputString(function(val) {
                        item.set(val);
                    });
                }
                if(item.type == "bool") {
                    var btn = $("<span />").addClass("btn").text(item.name)
                        .prepend('<i class="icon-check-empty disp-inactive"> ')
                        .prepend('<i class="icon-check disp-active"> ');
                    var val = item.value;
                    if(val) {
                        btn.addClass("active");
                    }
                    group.append(btn);
                    btn.click(function() {
                        val = !val;
                        if(val) {
                            btn.addClass("active");
                        } else {
                            btn.removeClass("active");
                        }
                        item.set(val);
                    });
                }
                if(item.type == "button") {
                    var btn = $("<span />").addClass("btn").text(item.name);
                    group.append(btn);
                    btn.click(function() {
                        item.set();
                    });
                }
            });
        }
    };
})();
