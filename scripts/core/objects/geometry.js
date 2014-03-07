(function() {

// Line Intersection
var LineIntersection = IV.extend(Objects.Object, function(line1, line2) {
    Objects.Object.call(this);
    this.line1 = line1;
    this.line2 = line2;
    this.type = "LineIntersection";
}, {
    get: function(context) {
        var l1 = this.line1.getLine(context);
        var l2 = this.line2.getLine(context);
        if(l1 === null || l2 === null) return null;
        var intersection = IV.geometry.lineIntersection(l1[0], l1[1], l2[0], l2[1]);
        return intersection;
    },
    getPath: function() {
        return this.line1.getPath();
    },
    can: function(cap) {
        if(cap == "get-point") return true;
        return false;
    },
    clone: function() {
        return new LineIntersection(this.line1, this.line2);
    }
});
Objects.LineIntersection = LineIntersection;
IV.serializer.registerObjectType("LineIntersection", LineIntersection);

})();
