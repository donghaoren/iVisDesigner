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

IV.Visualization.prototype = {
    addObject: function(component) {
        this.objects.push(component);
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
            try { obj.renderGuide(g, data); }
            catch(e) { console.log(e); }
            g.restore();
        });
        this.selection.forEach(function(c) {
            var obj = c.obj;
            g.save();
            try { obj.renderGuideSelected(g, data); }
            catch(e) { console.log(e); }
            g.restore();
        });
    },
    selectObject: function(pt, data, action) {
        for(var i in this.objects) {
            var obj = this.objects[i];
            var context = obj.select(pt, data, action);
            if(context) {
                context.obj = obj;
                return context;
            }
        }
        return null;
    },
    appendSelection: function(ctx) {
        this.selection.push(ctx);
        ctx.obj.selected = true;
    },
    clearSelection: function() {
        this.selection.forEach(function(c) { c.obj.selected = false; });
        this.selection = [];
    }
};
