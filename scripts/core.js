// iVisDesigner
// Author: Donghao Ren, PKUVIS, Peking University, 2013.04
// See LICENSE.txt for copyright information.

// scripts/core.js
// iVisDesigner Core Classes and Functions.

{{include: objects/objects.js}}

IV.Visualization = function() {
    this.objects = [];
    this.selection = [];
};

IV.path = { };

IV.path.commonPrefix = function(paths) {
    if(!paths || paths.length == 0) return null;
    var prefix = paths[0];
    for(var i = 1; i < paths.length; i++) {
        var p = paths[i];
        if(!p) continue;
        var len = 0;
        for(; len < p.length; len++)
            if(p[len] != prefix[len]) break;
        prefix = prefix.substr(0, len);
    }
    return prefix;
};

IV.path.deepest = function(paths) {
    return IV.longestString(paths);
};

IV.path.isDescendant = function(path_parent, path_child) {
};

IV.generateUUID = function(prefix) {
    var r = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
    if(prefix) return prefix + r;
    return r;
};

IV.Visualization.prototype = {
    addObject: function(obj) {
        if(!obj.name) {
            var names = { };
            this.objects.forEach(function(o) { names[o.name] = true; });
            for(var i = 1;; i++) {
                var name = obj.type + i;
                if(names[name]) continue;
                obj.name = name;
                break;
            }
        }
        this.objects.push(obj);
        IV.raise("vis:objects");
    },
    removeObject: function(obj) {
        var idx = this.objects.indexOf(obj);
        if(idx >= 0 && idx < this.objects.length) {
            this.objects = this.objects.slice(0, idx).concat(this.objects.slice(idx + 1));
        }
    },
    render: function(g, data) {
        this.objects.forEach(function(obj) {
            g.save();
            try {
                obj.render(g, data);
            } catch(e) {
                console.log(e);
            }
            g.restore();
        });
        this.selection.forEach(function(c) {
            g.save();
            try {
                c.obj.renderSelected(g, data);
            } catch(e) {
                console.log(e);
            }
            g.restore();
        });
    },
    renderGuide: function(g, data) {
        this.objects.forEach(function(obj) {
            g.save();
            try {
                obj.renderGuide(g, data);
            } catch(e) {
                console.log(e);
            }
            g.restore();
        });
        this.selection.forEach(function(c) {
            var obj = c.obj;
            g.save();
            try {
                obj.renderGuideSelected(g, data);
            } catch(e) {
                console.log(e);
            }
            g.restore();
        });
    },
    selectObject: function(pt, data, action) {
        var best_context = null;
        var mind = 1e10;
        for(var i in this.objects) {
            var obj = this.objects[i];
            var context = obj.select(pt, data, action);
            if(context) {
                var d = context.distance ? context.distance : 1e10;
                context.obj = obj;
                if(!best_context || d < mind) {
                    mind = d;
                    best_context = context;
                }
            }
        }
        return best_context;
    },
    appendSelection: function(ctx) {
        this.selection.push(ctx);
        ctx.obj.selected = true;
    },
    clearSelection: function() {
        this.selection.forEach(function(c) { c.obj.selected = false; });
        this.selection = [];
    },
    timerTick: function(data) {
        this.objects.forEach(function(obj) {
            if(obj.timerTick) obj.timerTick(data);
        });
    }
};
