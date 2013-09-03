// iVisDesigner
// Author: Donghao Ren, PKUVIS, Peking University, 2013.04
// See LICENSE.txt for copyright information.

// scripts/objects/shapes.js
// Define objects for various shapes.

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
GoogleMapStatic.prototype = {
    lngLatToPixel: function(lng, lat) {
        var world_width = 256 * (1 << this.zoom);
        var pt = GoogleMapMercator(lng, lat);
        var p0 = GoogleMapMercator(this.center_lng, this.center_lat);
        var sh = pt.sub(p0).scale(world_width);
        sh.y = -sh.y;
        return sh.add(new IV.Vector(this.size_x / 2, this.size_y / 2));
    },
    lngLatToPixelCentered: function(lng, lat) {
        var world_width = 256 * (1 << this.zoom);
        var pt = GoogleMapMercator(lng, lat);
        var p0 = GoogleMapMercator(this.center_lng, this.center_lat);
        var sh = pt.sub(p0).scale(world_width);
        sh.y = -sh.y;
        return sh;
    },
    getURL: function() {
        var params = {
            center: this.center_lat + "," + this.center_lng,
            zoom: this.zoom,
            size: this.size_x + "x" + this.size_y,
            sensor: false,
            scale: this.scale,
            maptype: this.maptype
        };
        var baseurl = "https://maps.googleapis.com/maps/api/staticmap";
        var params_array = [];
        for(var key in params) {
            params_array.push(escape(key) + "=" + escape(params[key]));
        }
        return baseurl + "?" + params_array.join("&");
    }
};
// IV.vis.addObject(new IV.objects.GoogleMap("stations:lng", "stations:lat", new IV.Vector(0, 0), 116.37371, 39.86390, 10));
var GoogleMap = IV.extend(IV.objects.Object, function(path_lng, path_lat, center_offset, lng, lat, zoom) {
    IV.objects.Object.call(this);
    var $this = this;
    this.type = "GoogleMap";
    this.map = new GoogleMapStatic(lng, lat, zoom, 640, 640, "street", 2);
    this.image = new Image();
    this.image.src = this.map.getURL();
    this.center_offset = center_offset;
    this.path_lng = path_lng;
    this.path_lat = path_lat;

    this.image.onload = function() {
        $this.loaded = true;
        $this.vis.raise("objects:update", $this);
    };
}, {
    can: function(cap) {
        if(cap == "get-point") return true;
    },
    render: function(g, data) {
        var $this = this;
        g.translate(this.center_offset.x - this.map.size_x / 2, this.center_offset.y - this.map.size_y / 2);
        if(this.loaded) {
            g.drawImage(this.image, 0, 0, this.image.width / this.map.scale, this.image.height / this.map.scale);
        } else {
            g.font = "12px Arial";
            g.fillText("loading...", this.map.size_x / 2, this.map.size_y / 2);
        }
    },
    get: function(context) {
        var lng = context.get(this.path_lng);
        var lat = context.get(this.path_lat);
        var pt = this.map.lngLatToPixelCentered(lng, lat);
        return pt.add(this.center_offset);
    },
    renderSelected: function(g, data) {
        var rect = new IV.Rectangle(this.center_offset.x, this.center_offset.y, this.map.size_x + 5, this.map.size_y + 5, 0);
        var c1 = rect.corner1();
        var c2 = rect.corner2();
        var c3 = rect.corner3();
        var c4 = rect.corner4();
        g.beginPath();
        g.strokeStyle = IV.colors.selection.toRGBA();
        g.lineWidth = 1.0; // TODO: get transform.
        g.moveTo(c1.x, c1.y);
        g.lineTo(c2.x, c2.y);
        g.lineTo(c3.x, c3.y);
        g.lineTo(c4.x, c4.y);
        g.closePath();
        g.stroke();
    },
    select: function(pt, data, action) {
        var rect = new IV.Rectangle(this.center_offset.x, this.center_offset.y, this.map.size_x, this.map.size_y, 0);
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
            return rslt;
        }
        return null;
    }
});

IV.objects.GoogleMap = GoogleMap;

})();
