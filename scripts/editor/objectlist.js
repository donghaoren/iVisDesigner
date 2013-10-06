Editor.generateObjectList = function() {
    var olist = $("#object-list");
    olist.children().remove();
    var vis = Editor.vis;
    vis.objects.forEach(function(obj) {
        var elem = $("<div />").addClass("group item");
        var data = elem.data();
        data.obj = obj;
        elem.append($("<span >").addClass("name").text(obj.name));
        elem.append($("<span >").addClass("type").text(" " + obj.type));
        var buttons = $("<span >").addClass("buttons");
        elem.append(buttons);

        buttons.append($("<span >").append($('<i class="xicon-cross"></i>')).click(function(e) {
            vis.clearSelection();
            vis.removeObject(obj);
            e.stopPropagation();
        }));

        elem.click(function(e) {
            if(!e.shiftKey) vis.clearSelection();
            vis.appendSelection({ obj: obj });
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
                var idx = vis.objects.indexOf(this.selected.sel.data().obj) + this.selected.dir;
                var idx_me = vis.objects.indexOf(obj);
                if(idx >= 0 && idx_me >= 0) {
                    if(idx <= idx_me) {
                        for(var i = idx_me; i > idx; i--) {
                            vis.objects[i] = vis.objects[i - 1];
                        }
                        vis.objects[idx] = obj;
                    } else {
                        for(var i = idx_me; i < idx - 1; i++) {
                            vis.objects[i] = vis.objects[i + 1];
                        }
                        vis.objects[idx - 1] = obj;
                    }
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
