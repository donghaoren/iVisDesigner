// ## Core Classes and Functions.

// - scripts/core.js
// - Author: Donghao Ren, PKUVIS, Peking University, 2013.04
// - See LICENSE.txt for copyright information.

// ### Functions for paths.

IV.path = { };

// prefix = commonPrefix([ path1, path2, ... ])
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

// deepest-path = deepest([ path1, path2, ... ])
IV.path.deepest = function(paths) {
    return IV.longestString(paths);
};

IV.path.isDescendant = function(path_parent, path_child) {
};

// ### Visualization Object

IV.Visualization = function(dataset) {
    // All objects of the visualization, ordered in an array.
    this.objects = [];
    // Selected objects.
    this.selection = [];
    // Dataset for this visualization.
    this.data = dataset;
};

IV.Visualization.prototype = {
    // Add an object to the visualization.
    addObject: function(obj) {
        // Assign object name if not defined.
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
        // Added this object to the front.
        this.objects.unshift(obj);
        // Call onAttach().
        if(obj.onAttach) {
            obj.onAttach(this);
        }
        // Add object event.
        IV.raise("vis:objects");
    },
    // Remove an object from the visualization.
    removeObject: function(obj) {
        // Find it and earse from the array.
        var idx = this.objects.indexOf(obj);
        if(idx >= 0 && idx < this.objects.length) {
            this.objects = this.objects.slice(0, idx).concat(this.objects.slice(idx + 1));
            // Detach this object.
            if(obj.onDetach) {
                obj.onDetach(this);
            }
        }
    },
    // Render the visualization to graphics context.
    render: function(g) {
        var data = this.data;
        // First we draw the objects.
        this.objects.forEachReversed(function(obj) {
            // Save the graphics state before calling render().
            g.save();
            // Try-catch block to prevent exceptions.
            try {
                obj.render(g, data);
            } catch(e) {
                console.log("Render", obj, e);
            }
            g.restore();
        });
        // Then we draw the selections.
        this.selection.forEachReversed(function(c) {
            g.save();
            try {
                c.obj.renderSelected(g, data);
            } catch(e) {
                console.log("Render Selected", c, e);
            }
            g.restore();
        });
    },
    // Render the visualization's guides to graphics context.
    // Guides including the axis of the track object, the frame of the scatterplot, etc.
    renderGuide: function(g) {
        var data = this.data;
        // Same way as render().
        this.objects.forEachReversed(function(obj) {
            g.save();
            try {
                obj.renderGuide(g, data);
            } catch(e) {
                console.log("RenderG", obj, e);
            }
            g.restore();
        });
        this.selection.forEachReversed(function(c) {
            var obj = c.obj;
            g.save();
            try {
                obj.renderGuideSelected(g, data);
            } catch(e) {
                console.log("RenderG Selected", c, e);
            }
            g.restore();
        });
    },
    // Select an object from the visualization, given the `location` and `action`.
    selectObject: function(location, action) {
        // We find the most close match by iterate over all objects.
        var data = this.data;
        var best_context = null;
        var mind = 1e10;
        for(var i = 0; i < this.objects.length; i++) {
            var obj = this.objects[i];
            // Call obj.select().
            var context = obj.select(location, data, action);
            if(context) {
                // Distance returned by obj.select().
                var d = context.distance ? context.distance : 1e10;
                context.obj = obj;
                // Update the best match.
                if(!best_context || d < mind) {
                    mind = d;
                    best_context = context;
                }
            }
        }
        return best_context;
    },
    // Append a selection to the list of selected objects.
    appendSelection: function(ctx) {
        this.selection.push(ctx);
        ctx.obj.selected = true;
    },
    // Clear selected objects.
    clearSelection: function() {
        this.selection.forEach(function(c) { c.obj.selected = false; });
        this.selection = [];
    },
    // Handle tick event, pass them to the objects.
    timerTick: function() {
        var data = this.data;
        this.objects.forEach(function(obj) {
            if(obj.timerTick) obj.timerTick(data);
        });
    }
};
