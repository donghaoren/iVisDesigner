// ### Visualization Object

IV.Visualization = function() {
    // All objects of the visualization, ordered in an array.
    this.objects = [];
    // Selected objects.
    this.selection = [];
    IV.EventSource.call(this);
};

IV.implement(IV.EventSource, IV.Visualization);

// Add an object to the visualization.
IV.Visualization.prototype.addObject = function(obj) {
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
    this.raise("objects");
};
// Remove an object from the visualization.
IV.Visualization.prototype.removeObject = function(obj) {
    // Find it and earse from the array.
    var idx = this.objects.indexOf(obj);
    if(idx >= 0 && idx < this.objects.length) {
        this.objects.splice(idx, 1);
        // Detach this object.
        if(obj.onDetach) {
            obj.onDetach(this);
        }
    }
    // Remove object event.
    this.raise("objects");
};
// Render the visualization to graphics context.
IV.Visualization.prototype.render = function(data, g) {
    // First we draw the objects.
    this.objects.forEachReversed(function(obj) {
        // Save the graphics state before calling render().
        g.ivSave();
        // Try-catch block to prevent exceptions.
        try {
            obj.render(g, data);
        } catch(e) {
            console.log("Render", obj, e.stack);
        }
        g.ivRestore();
    });
    // Then we draw the selections.
    this.selection.forEachReversed(function(c) {
        g.ivSave();
        try {
            c.obj.renderSelected(g, data);
        } catch(e) {
            console.log("Render Selected", c, e);
        }
        g.ivRestore();
    });
};
// Render the visualization's guides to graphics context.
// Guides including the axis of the track object, the frame of the scatterplot, etc.
IV.Visualization.prototype.renderGuide = function(data, g) {
    // Same way as render().
    this.objects.forEachReversed(function(obj) {
        g.ivSave();
        try {
            obj.renderGuide(g, data);
        } catch(e) {
            console.log("RenderG", obj, e);
        }
        g.ivRestore();
    });
    this.selection.forEachReversed(function(c) {
        var obj = c.obj;
        g.ivSave();
        try {
            obj.renderGuideSelected(g, data);
        } catch(e) {
            console.log("RenderG Selected", c, e);
        }
        g.ivRestore();
    });
};
// Select an object from the visualization, given the `location` and `action`.
IV.Visualization.prototype.selectObject = function(data, location, action) {
    // We find the most close match by iterate over all objects.
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
};
// Append a selection to the list of selected objects.
IV.Visualization.prototype.appendSelection = function(ctx) {
    this.selection.push(ctx);
    ctx.obj.selected = true;
    this.raise("selection");
};
// Clear selected objects.
IV.Visualization.prototype.clearSelection = function() {
    this.selection.forEach(function(c) { c.obj.selected = false; });
    this.selection = [];
    this.raise("selection");
};
// Handle tick event, pass them to the objects.
IV.Visualization.prototype.timerTick = function(data) {
    this.objects.forEach(function(obj) {
        if(obj.timerTick) obj.timerTick(data);
    });
};
