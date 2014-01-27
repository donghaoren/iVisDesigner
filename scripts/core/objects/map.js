(function() {

var GoogleMapStatic = function(lng, lat, zoom, size_x, size_y, maptype, scale) {
    this.center_lng = lng;
    this.center_lat = lat;
    this.zoom = zoom;
    this.size_x = size_x;
    this.size_y = size_y;
    this.scale = scale;
    this.maptype = maptype;
};
// Mercator Projection
var GoogleMapMercator = function(lng, lat) {
    var x = lng;
    var rlat = lat / 180.0 * Math.PI;
    var y = Math.log( (1 + Math.sin(rlat)) / (1 - Math.sin(rlat)) ) / 2;
    return new IV.Vector(x / 360.0, y / Math.PI / 2);
};
var GoogleMapMercatorInverse = function(x, y) {
    var tanh = function(x) {
        return (Math.exp(x) - Math.exp(-x)) / (Math.exp(x) + Math.exp(-x));
    };
    lng = x * 360.0;
    lat = 180 * Math.asin(tanh(2 * Math.PI * y)) / Math.PI;
    return [lng, lat];
};
GoogleMapStatic.prototype = {
    lngLatToPixel: function(lng, lat) {
        var world_width = 256 * (1 << this.zoom);
        var pt = GoogleMapMercator(lng, lat);
        var p0 = GoogleMapMercator(this.center_lng, this.center_lat);
        var sh = pt.sub(p0).scale(world_width);
        return sh.add(new IV.Vector(this.size_x / 2, this.size_y / 2));
    },
    lngLatToPixelCentered: function(lng, lat) {
        var world_width = 256 * (1 << this.zoom);
        var pt = GoogleMapMercator(lng, lat);
        var p0 = GoogleMapMercator(this.center_lng, this.center_lat);
        var sh = pt.sub(p0).scale(world_width);
        return sh;
    },
    pixelToLngLatCentered: function(x, y) {
        var world_width = 256 * (1 << this.zoom);
        var p0 = GoogleMapMercator(this.center_lng, this.center_lat);
        x /= world_width;
        y /= world_width;
        x += p0.x;
        y += p0.y;
        return GoogleMapMercatorInverse(x, y);
    },
    getURL: function() {
        var params = {
            center: this.center_lat + "," + this.center_lng,
            zoom: this.zoom,
            size: this.size_x + "x" + this.size_y,
            sensor: false,
            scale: this.scale,
            maptype: this.maptype,
            key: "AIzaSyBWFLxkr7mBCEpjyJotpP50n_ZOtcW-RTo",
            language: "en_US",
            visual_refresh: true
        };
        var baseurl = "https://maps.googleapis.com/maps/api/staticmap";
        var params_array = [];
        for(var key in params) {
            params_array.push(escape(key) + "=" + escape(params[key]));
        }
        return baseurl + "?" + params_array.join("&");
    }
};
// IV.vis.addObject(new Objects.GoogleMap("stations:lng", "stations:lat", new IV.Vector(0, 0), 116.37371, 39.86390, 10));
Objects.GoogleMap = IV.extend(Objects.Object, function(info) {
    Objects.Object.call(this);
    var $this = this;
    this.type = "GoogleMap";
    this.maptype = "roadmap";
    this.longitude = info.longitude;
    this.latitude = info.latitude;
    this.scale = info.scale;
    this.center_offset = info.center;
    this.path_longitude = info.path_longitude;
    this.path_latitude = info.path_latitude;
    this.reloadMap();
}, {
    $auto_properties: [ "path_longitude", "path_latitude", "center_offset" ],
    _set_longitude: function(val) { this.longitude = val; this.reloadMap(); },
    _get_longitude: function() { return this.longitude; },
    _set_latitude: function(val) { this.latitude = val; this.reloadMap(); },
    _get_latitude: function() { return this.latitude; },
    _set_scale: function(val) { this.scale = val; this.reloadMap(); },
    _get_scale: function() { return this.scale; },
    _set_maptype: function(val) { this.maptype = val; this.reloadMap(); },
    _get_maptype: function() { return this.maptype; },
    can: function(cap) {
        if(cap == "get-point") return true;
    },
    postDeserialize: function() {
        if(!this.maptype) this.maptype = "roadmap";
        this.reloadMap();
    },
    onAttach: function(vis) {
        this.vis = vis;
    },
    reloadMap: function() {
        var $this = this;
        this._map = new GoogleMapStatic(this.longitude, this.latitude, this.scale, 640, 640, this.maptype, 2);
        this._image = new Image();
        this._image.src = this._map.getURL();
        this.loaded = false;
        this._image.onload = function() {
            $this.loaded = true;
            if($this.vis) $this.vis.setNeedsRender();
        };
        if($this.vis) $this.vis.setNeedsRender();
    },
    render: function(g, data) {
        var $this = this;
        g.ivSave();
        g.translate(this.center_offset.x, this.center_offset.y);
        g.scale(1, -1);
        var show_rect = false;
        if(this.loaded) {
            g.drawImage(this._image, -this._map.size_x / 2, -this._map.size_y / 2, this._image.width / this._map.scale, this._image.height / this._map.scale);
        } else {
            g.font = "12px Arial";
            g.textAlign = "center";
            g.fillText("loading...", 0, 0);
            show_rect = true;
        }
        g.ivRestore();
        var off = this.center_offset;
        if(this._dragging_offset) {
            off = off.add(this._dragging_offset);
            show_rect = true;
        }
        if(show_rect) {
            var rect = new IV.Rectangle(off.x, off.y, this._map.size_x + 5, this._map.size_y + 5, 0);
            var c1 = rect.corner1();
            var c2 = rect.corner2();
            var c3 = rect.corner3();
            var c4 = rect.corner4();
            g.beginPath();
            g.strokeStyle = IV.colors.selection.toRGBA();
            g.lineWidth = 1.0 / g.ivGetTransform().det();
            g.moveTo(c1.x, c1.y);
            g.lineTo(c2.x, c2.y);
            g.lineTo(c3.x, c3.y);
            g.lineTo(c4.x, c4.y);
            g.closePath();
            g.stroke();
        }
    },
    get: function(context) {
        var lng = context.get(this.path_longitude).val();
        var lat = context.get(this.path_latitude).val();
        if(lng === null || lat === null) return null;
        var pt = this._map.lngLatToPixelCentered(lng, lat);
        if(this._dragging_offset) pt = pt.add(this._dragging_offset);
        return pt.add(this.center_offset);
    },
    renderSelected: function(g, data) {
        var rect = new IV.Rectangle(this.center_offset.x, this.center_offset.y, this._map.size_x + 5, this._map.size_y + 5, 0);
        var c1 = rect.corner1();
        var c2 = rect.corner2();
        var c3 = rect.corner3();
        var c4 = rect.corner4();
        g.beginPath();
        g.strokeStyle = IV.colors.selection.toRGBA();
        g.lineWidth = 1.0 / g.ivGetTransform().det();
        g.moveTo(c1.x, c1.y);
        g.lineTo(c2.x, c2.y);
        g.lineTo(c3.x, c3.y);
        g.lineTo(c4.x, c4.y);
        g.closePath();
        g.stroke();
    },
    select: function(pt, data, action) {
        var rect = new IV.Rectangle(this.center_offset.x, this.center_offset.y, this._map.size_x, this._map.size_y, 0);
        if(rect.inside(pt.x, pt.y)) {
            var rslt = { distance: 10 };
            if(action == "move") {
                var $this = this;
                rslt.original = $this.center_offset;
                rslt.onMove = function(p0, p1) {
                    $this.center_offset = rslt.original.sub(p0).add(p1);
                    return { trigger_render: "main" };
                };
            }
            if(action == "move-element") {
                var $this = this;
                var prev = [ $this.longitude, $this.latitude ];
                var original = $this.center_offset;
                rslt.onMove = function(p0, p1) {
                    $this.center_offset = original.sub(p0).add(p1);
                    $this._dragging_offset = p0.sub(p1);
                    $this._map.center_lng = prev[0];
                    $this._map.center_lat = prev[1];
                    var off_p0 = $this._map.pixelToLngLatCentered(original.x, original.y);
                    var off_p1 = $this._map.pixelToLngLatCentered(original.x - p0.x + p1.x, original.y - p0.y + p1.y);
                    $this.longitude = prev[0] - off_p1[0] + off_p0[0];
                    $this.latitude = prev[1] - off_p1[1] + off_p0[1];
                    $this._map.center_lng = $this.longitude;
                    $this._map.center_lat = $this.latitude;
                };
                rslt.onRelease = function(p0, p1) {
                    $this.center_offset = original;
                    delete $this._dragging_offset;
                    $this.reloadMap();
                };
            }
            return rslt;
        }
        return null;
    },
    getPropertyContext: function() {
        var $this = this;
        return Objects.Object.prototype.getPropertyContext.call(this).concat([
            make_prop_ctx($this, "path_longitude", "Longitude", "GoogleMap", "path"),
            make_prop_ctx($this, "path_latitude", "Latitude", "GoogleMap", "path"),
            make_prop_ctx(this, "scale", "Scale", "GoogleMap", "plain-number"),
            make_prop_ctx(this, "maptype", "MapType", "GoogleMap", "plain-string", ["terrain", "roadmap", "satellite", "hybrid"]),
            make_prop_ctx(this, "longitude", "Longitude", "GoogleMap", "plain-number"),
            make_prop_ctx(this, "latitude", "Latitude", "GoogleMap", "plain-number")
        ]);
    }
});
IV.serializer.registerObjectType("GoogleMap", Objects.GoogleMap);
})();
