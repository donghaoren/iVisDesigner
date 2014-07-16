//. iVisDesigner - File: scripts/editor/popups/pathselect.js
//. Copyright 2013-2014 Donghao Ren
//. University of California, Santa Barbara, Peking University
//. See LICENSE.md for more information.

IV.popups.PathSelect = function(fields, previous_path) {
    if(!fields) fields = IV.editor.schema.fields;
    if(!previous_path) previous_path = "";

    var data = IV.popups.create();
    data.addActions([ "cancel" ]);
    var p = data.selector;
    var content = p.children(".content");
    var c = $("<div />").addClass("data-schema");
    content.append(c);
    content.addClass("scrollview").ScrollView();

    function onSelectPath(path, ref) {
        if(data.onSelectPath) data.onSelectPath(path, ref);
        data.hide();
    };
    data.onCancel = function() {
        data.hide();
    };


    var info = {
        set_active: false,
        onSelectPath: function(path) {
            onSelectPath(path);
        }
    };
    if(previous_path == "") {
        var rootelem_span = $('<span class="key">ROOT</span>');
        var rootelem = $("<li/>").append(rootelem_span);
        rootelem_span.data().path = "";
        c.append($('<ul style="margin-bottom: 2px"></ul>').append(rootelem));
        rootelem_span.click(function(e) {
            info.onSelectPath("");
            e.stopPropagation();
        });
    }
    var elems = IV.editor.renderSchemaFields(info, fields, previous_path);
    c.append(elems);

    return data;
/*
    var selected_ref = null;


    c.find("span.key").each(function() {
        var $this = $(this);
        $this.click(function() {
            c.find("span.key").removeClass("active");
            $this.addClass("active");
            var data = $this.data();
            onSelectPath(data.path, selected_ref);
        });
    });
    c.find("span.ref").each(function() {
        var $this = $(this);
        var p = $this.parent();
        $this.click(function(e) {
            if($this.is(".active")) {
                c.find("span.ref").removeClass("active");
                selected_ref = null;
            } else {
                c.find("span.ref").removeClass("active");
                $this.addClass("active");
                var data = p.data();
                selected_ref = data.path;
            }
            e.stopPropagation();
        });
    });
    return data;
*/
};
