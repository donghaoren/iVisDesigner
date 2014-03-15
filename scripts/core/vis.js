//. iVisDesigner - File: scripts/core/vis.js
//. Copyright 2013-2014 Donghao Ren
//. Peking University, University of California, Santa Barbara
//. See LICENSE.md for more information.

// The main class for a visualization design.
IV.Visualization = function() {
    this.uuid = IV.generateUUID();
    // All objects of the visualization, ordered in an array.
    this.objects = [];
    // Selected objects.
    this.selection = [];
    this._needs_render = true;
    this.type = "Visualization";
    this.artboard = new IV.Rectangle(-600, -400, 1200, 800);
    IV.EventSource.call(this);
};

IV.serializer.registerObjectType("Visualization", IV.Visualization);

IV.implement(IV.EventSource, IV.Visualization);

// Serialization support.
IV.Visualization.prototype.serializeFields = function() {
    return [ "objects", "artboard", "uuid" ];
};

IV.Visualization.prototype.postDeserialize = function() {
    // Deselect all objects.
    this.selection = [];
    this.objects.forEach(function(obj) {
        obj.selected = false;
    });
    if(!this.artboard) {
        // Assign default artboard if non-exist.
        this.artboard = new IV.Rectangle(-600, -400, 1200, 800);
    }
    IV.EventSource.call(this);
};

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

// Trigger rendering.
IV.Visualization.prototype.setNeedsRender = function() {
    this._needs_render = true;
};

IV.Visualization.prototype.triggerRenderer = function(renderer) {
    if(this._needs_render) {
        renderer.trigger();
        this._needs_render = false;
    }
};

// Validate generated values in response to data changes.
IV.Visualization.prototype.validate = function(data) {
    // Do a topology sort.
    var object_idmap = { }; // uuid => object
    this.objects.forEach(function(obj) { object_idmap[obj.uuid] = { o: obj, deps: new IV.ObjectSet(), done: false }; });
    this.objects.forEach(function(obj) {
        var deps = obj.getDependencies();
        object_idmap[obj.uuid].deps.unionWith(deps);
        for(var uuid in deps.set) {
            var info = object_idmap[uuid];
            if(info) {
                if(info.o._validated === false) {
                    obj._validated = false;
                }
            }
        }
    });
    var sorted = [];
    var append_obj = function(uuid) {
        var info = object_idmap[uuid];
        if(!info || info.done) return;
        for(var depid in info.deps.set) {
            append_obj(depid);
        }
        sorted.push(info.o);
        info.done = true;
    };
    this.objects.forEach(function(obj) {
        append_obj(obj.uuid);
    });
    // Finish topology sort, now validate in dependency order.

    sorted.forEach(function(obj) {
        if(obj.validate) obj.validate(data);
    });
};

// Render the visualization to graphics context.
IV.Visualization.prototype.render = function(data, g) {
    this.validate(data);
    // First we draw the objects.
    IV.forEachReversed(this.objects, function(obj) {
        // Save the graphics state before calling render().
        g.ivSave();
        // Try-catch block to prevent exceptions.
        try {
            obj.render(g, data);
        } catch(e) {
            console.trace(e.stack);
        }
        g.ivRestore();
    });
};

// Render selected objects.
IV.Visualization.prototype.renderSelection = function(data, g) {
    this.validate(data);
    // Then we draw the selections.
    IV.forEachReversed(this.selection, function(c) {
        g.ivSave();
        try {
            c.obj.renderSelected(g, data, c.context, c);
        } catch(e) {
            console.trace(e.stack);
        }
        g.ivRestore();
    });
};

// Render the visualization's guides to graphics context.
// Guides including the axis of the track object, the frame of the scatterplot, etc.
IV.Visualization.prototype.renderGuide = function(data, g) {
    this.validate(data);
    // Same way as render().
    IV.forEachReversed(this.objects, function(obj) {
        g.ivSave();
        try {
            obj.renderGuide(g, data);
        } catch(e) {
            console.trace(e.stack);
        }
        g.ivRestore();
    });
};

// Render guide for selected objects.
IV.Visualization.prototype.renderGuideSelected = function(data, g) {
    this.validate(data);
    IV.forEachReversed(this.selection, function(c) {
        var obj = c.obj;
        g.ivSave();
        try {
            obj.renderGuideSelected(g, data, c.context, c);
        } catch(e) {
            console.trace(e.stack);
        }
        g.ivRestore();
    });
};

// Select an object from the visualization, given the `location` and `action`.
IV.Visualization.prototype.selectObject = function(data, location, action) {
    this.validate(data);
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

// Lasso objects from the visualization, given the `polygon`
IV.Visualization.prototype.lassoObject = function(data, polygon, callback) {
    this.validate(data);
    var result = [];
    for(var i = 0; i < this.objects.length; i++) {
        var obj = this.objects[i];
        if(!obj.lasso) continue;
        obj.lasso(polygon, data, callback);
    }
    return result;
};

// Append a selection to the list of selected objects.
IV.Visualization.prototype.appendSelection = function(ctx) {
    this.selection.push(ctx);
    ctx.obj.selected = true;
    ctx.obj._selection_context = ctx;
    this.raise("selection");
};

// Clear selected objects.
IV.Visualization.prototype.clearSelection = function() {
    this.objects.forEach(function(obj) { obj.selected = false; });
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
