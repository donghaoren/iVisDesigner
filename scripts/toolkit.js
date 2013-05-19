// iVisDesigner
// Author: Donghao Ren, PKUVIS, Peking University, 2013.04
// See LICENSE.txt for copyright information.

// scripts/toolkit.js
// The main javascript file for the toolkit.

// ------------------------------------------------------------------------
// Include Core
// ------------------------------------------------------------------------

{{include: core.js}}

// ------------------------------------------------------------------------
// Process Configuration
// ------------------------------------------------------------------------

IV.config = $.extend({
    key: "defualt"
}, IV_Config);

// ------------------------------------------------------------------------
// Canvas and Rendering
// ------------------------------------------------------------------------

IV.viewarea = {
    // The origin in screen coordinates.
    width: 0, height: 0,
    location: new IV.Vector(0.5, 0.5),
    // Scale factor.
    scale: 1,
    set: function(g) {
        var dev_ratio = window.devicePixelRatio || 1;
        var backing_ratio = g.webkitBackingStorePixelRatio ||
                                g.mozBackingStorePixelRatio ||
                                g.msBackingStorePixelRatio ||
                                g.oBackingStorePixelRatio ||
                                g.backingStorePixelRatio || 1;
        var ratio = dev_ratio / backing_ratio;
        g.scale(ratio, ratio);
        g.translate(this.location.x + this.width / 2, this.location.y + this.height / 2);
        g.scale(this.scale, this.scale);
    },
    transformRAWLocation: function(x, y) {
        var px = (x - this.location.x - this.width / 2) / this.scale;
        var py = (y - this.location.y - this.height / 2) / this.scale;
        return new IV.Vector(px, py);
    }
};

IV.canvas = {
    main: document.getElementById("canvas-main"),
    front: document.getElementById("canvas-front"),
    back: document.getElementById("canvas-back"),
    overlay: document.getElementById("canvas-overlay")
};

IV.needs_render = {
    main: false, front: false, back: false, overlay: false
};

IV.triggerRender = function(name) {
    if(!name) {
        for(var i in IV.needs_render) IV.needs_render[i] = true;
        return;
    }
    var map = {
        "tools": "front",
        "front": "front",
        "back": "back",
        "overlay": "overlay",
        "main": "main"
    };
    var names = name.split(",").map(function(x) { return map[x]; }).join(",").split(",");

    for(var i = 0; i < names.length; i++) {
        IV.needs_render[names[i]] = true;
    }
};

IV.render = function() {
    if(IV.needs_render.main) {
        IV.renderMain();
        IV.needs_render.main = false;
    }
    if(IV.needs_render.front) {
        IV.renderFront();
        IV.needs_render.front = false;
    }
    if(IV.needs_render.back) {
        IV.renderBack();
        IV.needs_render.back = false;
    }
    if(IV.needs_render.overlay) {
        IV.renderOverlay();
        IV.needs_render.overlay = false;
    }
};

// Render functions.
IV.renderMain = function() {
    var ctx = IV.canvas.main.getContext("2d");
    ctx.clearRect(0, 0, IV.canvas.main.width, IV.canvas.main.height);
    ctx.save();
    IV.viewarea.set(ctx);

    if(IV.vis) {
        IV.vis.render(ctx);
    }
    ctx.restore();
};

IV.renderFront = function() {
    var ctx = IV.canvas.front.getContext("2d");
    ctx.clearRect(0, 0, IV.canvas.front.width, IV.canvas.front.height);
    ctx.save();
    IV.viewarea.set(ctx);

    if(IV.current_tool && IV.current_tool.render) {
        IV.current_tool.render(ctx, IV.data);
    }
    ctx.restore();
};

IV.renderBack = function() {
    var ctx = IV.canvas.back.getContext("2d");
    ctx.clearRect(0, 0, IV.canvas.back.width, IV.canvas.back.height);
    ctx.save();
    IV.viewarea.set(ctx);

    if(IV.vis) {
        if(IV.get("visible-guide"))
            IV.vis.renderGuide(ctx);
    }

    ctx.restore();
};

IV.renderOverlay = function() {
    var ctx = IV.canvas.overlay.getContext("2d");
    ctx.clearRect(0, 0, IV.canvas.overlay.width, IV.canvas.overlay.height);
    ctx.save();
    IV.viewarea.set(ctx);

    IV.tools.renderOverlay(ctx);

    ctx.restore();
};

IV.timerTick = function() {
    if(IV.vis) {
        IV.vis.timerTick();
    }
};
setInterval(function() {
    IV.timerTick();
    IV.render();
}, 30);

IV.generateObjectList = function() {
    var olist = $("#object-list");
    olist.children().remove();
    if(!IV.vis) return;
    IV.vis.objects.forEach(function(obj) {
        var elem = $("<div />").addClass("group item");
        var data = elem.data();
        data.obj = obj;
        elem.append($("<span >").addClass("name").text(obj.name));
        elem.append($("<span >").addClass("type").text(" " + obj.type));
        var buttons = $("<span >").addClass("buttons");
        elem.append(buttons);

        buttons.append($("<span >").append($('<i class="xicon-cross"></i>')).click(function(e) {
            IV.vis.removeObject(obj);
            IV.raise("vis:objects");
            IV.triggerRender();
            IV.render();
            e.stopPropagation();
        }));

        elem.click(function(e) {
            if(!e.shiftKey) IV.vis.clearSelection();
            IV.vis.appendSelection({ obj: obj });
            IV.raise("vis:objects:selection");
        });

        IV.trackMouseEvents(elem, {
            offsets: [],
            selected: null,
            down: function(e) {
                var $this = this;
                $this.offsets = [];
                $this.selected = null;
                olist.children(".item").each(function() {
                    $this.offsets.push({
                        sel: $(this),
                        dir: 0,
                        y: $(this).offset().top
                    });
                    $this.offsets.push({
                        sel: $(this),
                        dir: 1,
                        y: $(this).offset().top + $(this).height()
                    });
                });
            },
            move: function(e) {
                olist.children(".divider").remove();
                var n_item = null;
                var n_dist = 1e10;
                this.offsets.forEach(function(item) {
                    var d = Math.abs(item.y - e.pageY);
                    if(d < n_dist) {
                        n_item = item;
                        n_dist = d;
                    }
                });
                if(n_item.dir == 0) {
                    n_item.sel.before($('<div class="divider"></div>'));
                } else {
                    n_item.sel.after($('<div class="divider"></div>'));
                }
                if(n_item) this.selected = n_item;
            },
            up: function(e) {
                if(!this.selected) return;
                var idx = IV.vis.objects.indexOf(this.selected.sel.data().obj) + this.selected.dir;
                var idx_me = IV.vis.objects.indexOf(obj);
                if(idx >= 0 && idx_me >= 0) {
                    if(idx <= idx_me) {
                        for(var i = idx_me; i > idx; i--) {
                            IV.vis.objects[i] = IV.vis.objects[i - 1];
                        }
                        IV.vis.objects[idx] = obj;
                    } else {
                        for(var i = idx_me; i < idx - 1; i++) {
                            IV.vis.objects[i] = IV.vis.objects[i + 1];
                        }
                        IV.vis.objects[idx - 1] = obj;
                    }
                    IV.raise("vis:objects");
                    IV.triggerRender();
                    IV.render();
                }
            }
        });

        olist.append(elem);

        data.update = function() {
            if(obj.selected) {
                elem.addClass("selected");
            } else {
                elem.removeClass("selected");
            }
        };
        data.update();
    });
};
IV.on("vis:objects", function() {
    IV.generateObjectList();
});
IV.on("vis:objects:selection", function() {
    $("#object-list").children(".item").each(function() {
        $(this).data().update();
    });
});

IV.add("status", "string");
IV.listen("status", function(s) {
    $(".status-text").text(s);
});

// ------------------------------------------------------------------------
// Global Colors
// ------------------------------------------------------------------------
IV.colors = {
    selection: IV.parseColorHEX("1F77B4")
};

// ------------------------------------------------------------------------
// Global Events
// ------------------------------------------------------------------------
IV.addEvent("view-mousedown");
IV.addEvent("view-mousemove");
IV.addEvent("view-mouseup");

// Reset everything.
IV.addEvent("reset");

// Selected path
IV.add("selected-path", "string");
IV.add("selected-reference", "string");

IV.add("visible-guide", "bool", true);
IV.listen("visible-guide", function(val) {
    IV.triggerRender("back");
    IV.render();
});

IV.on("reset", function() {
    IV.vis = new IV.Visualization(IV.data);
    IV.selection = [];
});

// ------------------------------------------------------------------------
// Loading data schema and contents
// ------------------------------------------------------------------------
IV.renderSchema = function(schema, prev_path) {
    var elem = $("<ul></ul>");
    for(var key in schema) {
        var this_path = prev_path + ":" + key;
        if(prev_path == "") this_path = key;
        // Ignore all keys starting with _
        if(key[0] == '_') continue;
        // The child element.
        var child = schema[key];
        // Fix abbreviations.
        if(typeof(child) == "string") child = { "type": child };
        // The text for key.
        var span = $("<span></span>").text(key).addClass("key");
        // Types.
        if(child.type == "number")
            span.append($("<span />").addClass("type").text("num"));
        if(child.type == "collection")
            span.append($("<span />").addClass("type").text("set"));
        if(child.type == "object")
            span.append($("<span />").addClass("type").text("obj"));
        if(child.type == "sequence")
            span.append($("<span />").addClass("type").text("seq"));
        if(child.type == "reference")
            span.append($("<span />").addClass("type ref").text("ref"));
        span.data().schema = schema;
        span.data().key = key;
        span.data().path = this_path;
        if(this_path == IV.get("selected-path")) span.addClass("active");
        if(this_path == IV.get("selected-reference")) span.children(".ref").addClass("active");
        var li = $("<li></li>")
            .append(span);
        if(child.type == "collection" || child.type == "object" || child.type == "sequence")
            li.append(IV.renderSchema(child.fields, this_path));
        elem.append(li);
    }
    return elem;
};

IV.renderDataSchema = function(schema) {
    $("#data-schema").children().remove();
    var rootelem_span = $('<span class="key">ROOT</span>');
    var rootelem = $("<li/>").append(rootelem_span);
    rootelem_span.data().path = "";
    $("#data-schema").append($('<ul style="margin-bottom: 2px"></ul>').append(rootelem));
    $("#data-schema").append(IV.renderSchema(schema.fields, ""));
    $("#data-schema span.key").each(function() {
        var $this = $(this);
        $this.click(function() {
            $("#data-schema span.key").removeClass("active");
            $this.addClass("active");
            var data = $this.data();
            IV.set("selected-path", data.path);
        });
    });
    $("#data-schema span.ref").each(function() {
        var $this = $(this);
        var p = $this.parent();
        $this.click(function(e) {
            if($this.is(".active")) {
                $("#data-schema span.ref").removeClass("active");
                IV.set("selected-reference", null);
            } else {
                $("#data-schema span.ref").removeClass("active");
                $this.addClass("active");
                var data = p.data();
                IV.set("selected-reference", data.path);
            }
            e.stopPropagation();
        });
    });
};

IV.loadData = function(data) {
    IV.data = data;
    IV.raiseEvent("reset");
};

IV.updateData = function() {
};

IV.loadDataset = function(name, callback) {
    IV.raiseEvent("reset");
    // Load data content.
    IV.dataprovider.loadData(name)
    .done(function(data) {
        // We assume that the data follows the schema correctly.
        // Need some code to verify the above statement.
        IV.renderDataSchema(data.schema);
        IV.loadData(data);
        data.onContentUpdate = function() {
            IV.triggerRender("main,front,back");
        };
        data.onSchemaUpdate = function() {
            IV.renderDataSchema(data.schema);
        };
        if(callback) callback();
    })
    .fail(function() {
        IV.log("Failed to load data content.");
    });
};

// ------------------------------------------------------------------------
// Include Other Files
// ------------------------------------------------------------------------

{{include: interface.js}}
{{include: dataprovider.js}}
{{include: tools/tools.js}}

// ------------------------------------------------------------------------
// System Initialization
// ------------------------------------------------------------------------
function browserTest() {
    if(!document.createElement("canvas").getContext) return false;
    return true;
}

IV.test = function() {
    var L = new IV.objects.ForceLayout("vertices", "pt", "edges:A", "edges:B");
    L._runStep(IV.data);
    var track1 = new IV.objects.Track("vertices:pt:x",
        new IV.objects.Point(new IV.Vector(-100,-100)),
        new IV.objects.Point(new IV.Vector(-100,100)));
    var track2 = new IV.objects.Track("vertices:pt:y",
        new IV.objects.Point(new IV.Vector(-100,-100)),
        new IV.objects.Point(new IV.Vector(100,-100)));
    var scatter = new IV.objects.Scatter(track1, track2);
    var circle = new IV.objects.Circle("vertices", {
        center: scatter,
        style: new IV.objects.Style({
            fill_style: new IV.Color(0, 0, 0, 0.2),
            radius: 5
        })
    });
    IV.vis.addObject(track1);
    IV.vis.addObject(track2);
    IV.vis.addObject(scatter);
    IV.vis.addObject(circle);
    IV.vis.addObject(L);
    IV.triggerRender("main,back");
    IV.render();
    IV.generateObjectList();
};


$(function() {
    if(!browserTest()) return;
    // Remove the loading indicator.
    $("#system-loading").remove();
    // Default dataset: cardata.
    IV.loadDataset("cardata", function() {
        //IV.test();
        //IV.vis.addObject(new IV.objects.GoogleMap("stations:lng", "stations:lat", new IV.Vector(0, 0), 116.37371, 39.86390, 9));
        //IV.triggerRender();
        //IV.render();
        //IV.generateObjectList();
    });
});

