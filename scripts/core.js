// iVisDesigner
// Author: Donghao Ren, PKUVIS, Peking University, 2013.04
// See LICENSE.txt for copyright information.

// core.js
// iVisDesigner Core Classes and Functions.

{{include: objects/objects.js}}

IV.Visualization = function() {
    this.objects = [];
};

IV.Visualization.prototype = {
    addObject: function(component) {
        this.objects.push(component);
    },
    render: function(g, data) {
        this.objects.forEach(function(obj) {
            var path = obj.path;
            if(!path) return;
            data.enumeratePath(path, function(context) {
                g.save();
                try { obj.render(g, context); }
                catch(e) { console.log(e); }
                g.restore();
            });
        });
    },
    renderGuide: function(g, data) {
        this.objects.forEach(function(obj) {
            g.save();
            try { obj.renderGuide(g, data); }
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
    }
};
