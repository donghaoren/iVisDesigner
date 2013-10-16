// Function: IV.getOptimalRatio()
// Get optimal resoultion ratio for canvas rendering.

IV.getOptimalRatio = function() {
    var canvas = document.createElement("canvas");
    var g = canvas.getContext("2d");
    var dev_ratio = window.devicePixelRatio || 1;
    var backing_ratio = g.webkitBackingStorePixelRatio ||
                        g.mozBackingStorePixelRatio ||
                        g.msBackingStorePixelRatio ||
                        g.oBackingStorePixelRatio ||
                        g.backingStorePixelRatio || 1;
    return dev_ratio / backing_ratio;
};

// Class: IV.CanvasManager
// Class to manage canvases.
// Helps adding canvas, and maintain heights.

IV.CanvasManager = function(width, height) {
    this.width = width ? width : 600;
    this.height = height ? height : 400;
    this.ratio = IV.getOptimalRatio();
    this.canvas = { };
};

IV.CanvasManager.prototype.getResolutionRatio = function() {
    return this.ratio;
};

IV.CanvasManager.prototype.setResolutionRatio = function(ratio) {
    this.ratio = ratio;
    this.resize(this.width, this.height, false);
};

// Add a canvas.
IV.CanvasManager.prototype.add = function(key, canvas, set_css) {
    this.canvas[key] = canvas;
};

// Get a canvas by name.
IV.CanvasManager.prototype.get = function(key) {
    return this.canvas[key];
};

// Resize the canvases.
IV.CanvasManager.prototype.resize = function(width, height, set_css) {
    this.width = width;
    this.height = height;
    for(var key in this.canvas) {
        var c = this.canvas[key];
        c.width = this.ratio * this.width;
        c.height = this.ratio * this.height;
        if(set_css) {
            $(c).css("width", this.width + "px");
            $(c).css("height", this.height + "px");
        }
    }
};

// Class: IV.Renderer
// Visualization renderer.

IV.Renderer = function() {
    this.data = null;
    this.vis = null;
    this.view = null;
    this.manager = null;
    this.center = new IV.Vector(0, 0);
    this.scale = 1;
    this.needs_render = { };
    var $this = this;

    IV.EventSource.call(this);

    this.bind("main", function(data, g) {
        if($this.vis) {
            $this.vis.render(data, g);
        }
    });
    this.bind("overlay", function(data, g) {
        if($this.vis) {
            $this.vis.renderSelection(data, g);
        }
    });
    this.bind("back", function(data, g) {
        if($this.vis) {
            $this.vis.renderGuide(data, g);
        }
    });
};

IV.implement(IV.EventSource, IV.Renderer);

// Set dataset.
// Note that the schema is only needed for editing, not rendering.
IV.Renderer.prototype.setData = function(data) {
    this.data = data;
};

// Set visualzation to render, attach event handlers.
IV.Renderer.prototype.setVisualization = function(vis) {
    this.vis = vis;
};

// Set view transform, given center and scale.
IV.Renderer.prototype.setView = function(center, scale) {
    this.center = center;
    this.scale = scale;
};

IV.Renderer.prototype.getView = function(center, scale) {
    return {
        center: this.center,
        scale: this.scale
    };
};

IV.Renderer.prototype.getOffsetFromScreen = function(pt) {
    var x = (pt.x - this.manager.width / 2 - this.center.x) / this.scale;
    var y = -(pt.y - this.manager.height / 2 + this.center.y) / this.scale;
    var r = new IV.Vector(x, y);
    r.view_det = [ this.scale, 0, 0, this.scale ];
    r.view_scale = this.scale;
    return r;
};

// Set the CanvasManager.
IV.Renderer.prototype.setCanvasManager = function(manager) {
    this.manager = manager;
};

// Trigger render for layers.
IV.Renderer.prototype.trigger = function(items) {
    if(items === null || items === undefined) {
        items = [ "front", "back", "main", "overlay" ];
    }
    if(typeof(items) == "string") items = items.split(",");
    for(var i = 0; i < items.length; i++)
        this.needs_render[items[i]] = true;
};

// Extend canvas render context.

CanvasRenderingContext2D.prototype.ivSave = function() {
    this.save();
    if(!this.iv_transform_stack) this.iv_transform_stack = [];
    this.iv_transform_stack.push(this.iv_transform);
};

CanvasRenderingContext2D.prototype.ivRestore = function() {
    this.restore();
    if(!this.iv_transform_stack) this.iv_transform_stack = [];
    this.ivSetTransform(this.iv_transform_stack.pop());

};

CanvasRenderingContext2D.prototype.ivSetTransform = function(tr) {
    if(!tr) tr = new IV.affineTransform();
    var r = this.iv_pre_ratio;
    this.setTransform(r * tr.m[0], r * tr.m[1], r * tr.m[3], r * tr.m[4], r * tr.m[2], r * tr.m[5]);
    this.iv_transform = tr;
};

CanvasRenderingContext2D.prototype.ivAppendTransform = function(tr) {
    if(this.iv_transform)
        tr = this.iv_transform.concat(tr);
    this.ivSetTransform(tr);
};

CanvasRenderingContext2D.prototype.ivGetTransform = function(tr) {
    if(this.iv_transform)
        return this.iv_transform;
    return new IV.affineTransform();
};

CanvasRenderingContext2D.prototype.ivGetGuideWidth = function() {
    return 1.0 / Math.sqrt(Math.abs(this.ivGetTransform().det()));
};

CanvasRenderingContext2D.prototype.ivGuideLineWidth = function() {
    return this.lineWidth = this.ivGetGuideWidth();
};

IV.Renderer.prototype._set_transform = function(ctx) {
    ctx.iv_pre_ratio = this.manager.ratio;
    ctx.ivAppendTransform(new IV.affineTransform([
        this.scale, 0, this.center.x + this.manager.width / 2,
        0, -this.scale, -this.center.y + this.manager.height / 2,
        0, 0, 1
    ]));
};

IV.Renderer.prototype._perform_render = function(key) {
    var canvas = this.manager.get(key);
    var ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, this.manager.width, this.manager.height);

    ctx.ivSave();
    this._set_transform(ctx);

    this.raise(key + ":before", this.data, ctx);
    this.raise(key, this.data, ctx);
    this.raise(key + ":after", this.data, ctx);

    ctx.ivRestore();
};

// Render the visualizaion.
IV.Renderer.prototype.render = function() {
    for(var key in this.needs_render) {
        if(!this.needs_render[key]) continue;
        this._perform_render(key);
        this.needs_render[key] = false;
    }
};
