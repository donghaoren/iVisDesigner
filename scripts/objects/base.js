(function() {

var Plain = function(obj) {
    this.obj = obj;
};
var plain_get = function() { return this.obj; };
Plain.prototype = new IV.objects.BaseObject({
    getPoint:  plain_get,
    getNumber: plain_get,
    getStyle:  plain_get
});

IV.objects.Number = Plain;
IV.objects.Style = Plain;
IV.objects.Point = Plain;

})();
