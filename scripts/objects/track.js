// iVisDesigner
// Author: Donghao Ren, PKUVIS, Peking University, 2013.04
// See LICENSE.txt for copyright information.

(function() {

var Track = function(path, anchor1, anchor2) {
    this.type = "guide";
    this.anchor1 = anchor1;
    this.anchor2 = anchor2;
    this.path = path;
};

Track.prototype = {
    getPoint: function(context) {
        var p1 = this.anchor1.getPoint(context);
        var p2 = this.anchor2.getPoint(context);
        var value = context[this.path];
        return p1.interp(p2, value);
    },

    /*
    renderGuide: function(g, context) {
        var p1 = this.anchor1.getPoint(context);
        var p2 = this.anchor2.getPoint(context);
    }
    */
    renderGlobalGuide: function(g) {
        var p1 = this.anchor1.getPoint(context);
        var p2 = this.anchor2.getPoint(context);
        if(p1 && p2) {
            g.beginPath();
            g.moveTo(p1.x, p1.y);
            g.lineTo(p2.x, p2.y);
            g.strokeStyle = "gray";
            g.stroke();
        }
    }
};

IV.objects.track = Track;

})();
