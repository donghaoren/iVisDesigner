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

IV.CanvasManager = function(width, height) {
    this.width = width ? width : 600;
    this.height = height ? height : 400;
    this.ratio = IV.getOptimalRatio();
    this.canvas = { };
};

IV.CanvasManager.prototype.add = function(key, canvas) {
    this.canvas[key] = canvas;
};

IV.CanvasManager.prototype.get = function(key) {
    return this.canvas[key];
};

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
        var ctx = c.getContext("2d");
        ctx.setTransform(this.ratio, 0, 0, this.ratio, 0, 0);
    }
};


IV.Renderer = function() {
    this.data = null;
    this.vis = null;
    this.view = null;
    this.manager = null;
    this.center = new IV.Vector(0, 0);
    this.scale = 1;
    this.needs_render_front = false;
    var $this = this;

    IV.EventSource.call(this);

    this.bind("main", function(data, g) {
        if($this.vis) {
            $this.vis.render(data, g);
        }
    });
    this.bind("back", function(data, g) {
        if($this.vis) {
            $this.vis.renderGuide(data, g);
        }
    });
};

IV.implement(IV.EventSource, IV.Renderer);

IV.Renderer.prototype.setData = function(data) {
    this.data = data;
};

IV.Renderer.prototype.setVisualization = function(data) {
    this.vis = vis;
};

IV.Renderer.prototype.setView = function(center, scale) {
    this.center = center;
    this.scale = scale;
};

IV.Renderer.prototype.setCanvasManager = function(manager) {
    this.manager = manager;
};

IV.Renderer.prototype.trigger = function(items) {
    if(items === null || items === undefined) {
        items = [ "front", "back", "main", "overlay" ];
    }
    if(typeof(items) == "string") items = [ items ];

};
IV.Renderer.prototype._set_transform = function(ctx) {
    ctx.translate(this.center.x + this.manager.width / 2, this.center.y + this.manager.height / 2);
    ctx.scale(this.scale, this.scale);
};

IV.Renderer.prototype._perform_render = function(key) {
    var canvas = this.manager.get(key);
    var ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, this.view.width, this.view.height);
    ctx.save();
    this._set_transform(ctx);

    this.raise(key + ":before", this.data, ctx);
    this.raise(key, this.data, ctx);
    this.raise(key + ":after", this.data, ctx);

    ctx.restore();
};

IV.Renderer.prototype.render = function() {
    for(var key in this.needs_render) {
        if(!this.needs_render[key]) continue;
        this._perform_render(key);
        this.needs_render[key] = false;
    }
};
