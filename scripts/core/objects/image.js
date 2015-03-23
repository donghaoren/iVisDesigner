(function() {

var ImageCache = function() {
    this.entries = { };
    this.loading = { };
};

ImageCache.prototype.loadImage = function(src, onload) {
    var self = this;
    if(this.entries[src]) {
        onload(this.entries[src]);
    } else if(this.loading[src]) {
        this.loading[src].handlers.push(onload);
    } else {
        var img = new Image();
        img.onload = function() {
            self.entries[src] = img;
            delete self.loading[src];
            img.handlers.forEach(function(f) { f(img); });
        };
        img.src = src;
        img.handlers = [ onload ];
        this.loading[src] = img;
    }
};

var cache = new ImageCache();

Objects.Image = IV.extend(Objects.Object, function(info) {
    this.type = "Image";
    Objects.Object.call(this);
    this.path = info.path;
    this.source = info.source;
    this.scale = info.scale ? info.scale : new Objects.Plain(1.0);
    this.position = info.position ? info.position : new Objects.Plain(new IV.Vector(0, 0));
    this._images = { };
}, {
    $auto_properties: [ "path", "source", "scale", "position" ],
    $auto_properties_after: function() {
    },
    can: function(cap) {
        if(cap == "get-point") return true;
    },
    postDeserialize: function() {
        this._reload();
    },
    onAttach: function(vis) {
        this.vis = vis;
    },
    _reload: function() {
        this._images = { };
    },
    render: function(g, data) {
        var $this = this;
        this.path.enumerate(data, function(context) {
            var src = $this.source.get(context);
            var position = $this.position.get(context);
            var scale = $this.scale.get(context);
            if(!src || !position || !scale) return;
            if($this._images[src]) {
                var w = $this._images[src].width;
                var h = $this._images[src].height;
                g.ivSave();
                g.translate(position.x, position.y);
                g.scale(scale, -scale);
                g.drawImage($this._images[src], 0, 0, w, h, -w / 2, -h / 2, w, h);
                g.ivRestore();
            } else {
                cache.loadImage(src, function(img) {
                    $this._images[src] = img;
                    if($this.vis) $this.vis.setNeedsRender();
                });
            }
        });
    },
    get: function(context) {
        return this.position.get(context);
    },
    // renderSelected: function(g, data) {
    //     // var rect = new IV.Rectangle(this.center_offset.x, this.center_offset.y, this._map.size_x + 5, this._map.size_y + 5, 0);
    //     // var c1 = rect.corner1();
    //     // var c2 = rect.corner2();
    //     // var c3 = rect.corner3();
    //     // var c4 = rect.corner4();
    //     // g.beginPath();
    //     // g.strokeStyle = IV.colors.selection.toRGBA();
    //     // g.lineWidth = 1.0 / g.ivGetTransform().det();
    //     // g.moveTo(c1.x, c1.y);
    //     // g.lineTo(c2.x, c2.y);
    //     // g.lineTo(c3.x, c3.y);
    //     // g.lineTo(c4.x, c4.y);
    //     // g.closePath();
    //     // g.stroke();
    // },
    // select: function(pt, data, action) {
    //     return null;
    //     // var rect = new IV.Rectangle(this.center_offset.x, this.center_offset.y, this._map.size_x, this._map.size_y, 0);
    //     // var rslt = null;
    //     // if((!action || action == "move") && rect.distance(pt) < 4.0 / pt.view_scale) {
    //     //     rslt = { distance: rect.distance(pt) };
    //     //     var $this = this;
    //     //     rslt.original = $this.center_offset;
    //     //     rslt.onMove = function(p0, p1) {
    //     //         $this.center_offset = rslt.original.sub(p0).add(p1);
    //     //         return { trigger_render: "main,front,back" };
    //     //     };
    //     // }
    //     // return rslt;
    // },
    getPropertyContext: function() {
        var $this = this;
        return Objects.Object.prototype.getPropertyContext.call(this).concat([
            make_prop_ctx(this, "source", "Source", "Image", "string"),
            make_prop_ctx(this, "scale", "Scale", "Image", "number"),
            make_prop_ctx(this, "position", "Position", "Image", "point")
        ]);
    }
});
IV.serializer.registerObjectType("Image", Objects.Image);
})();
