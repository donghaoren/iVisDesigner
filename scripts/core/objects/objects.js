(function() {

var Objects = { };

IV.objects = Objects;

// The base class for objects.
Objects.Object = function() {
    this.uuid = IV.generateUUID();
};
Objects.Object.prototype = {
    _get_name: function() { return this.name; },
    _set_name: function(val) { return this.name = val; },
    setName: function(name) {
        if(this.name != name) {
            this.name = name;
            IV.raiseObjectEvent(this, "p:name", name);
        }
    },
    can: function(cap) { return false; },
    get: function(context) { return null; },
    getStyle: function(context) { return this.get(context); },
    getPoint: function(context) { return this.get(context); },
    getNumber: function(context) { return this.get(context); },
    getPath: function() { return this.path; },
    getGuidePath: function() { return new IV.Path(""); },
    render: function() { },
    propertyUpdate: function() { },
    renderSelected: function() { },
    renderGuide: function() { },
    renderGuideSelected: function() { },
    setDirty: function() { },
    select: function() { return null; },
    clone: function() {
        throw new Error("Clone not implemented: " + this.type);
    },
    getPropertyContext: function() {
        var $this = this;
        return [
            make_prop_ctx(this, "name", "Name", "Common", "plain-string")
        ];
    }
};

{{include: utils.js}}
{{include: base.js}}
{{include: style.js}}
{{include: track.js}}
{{include: shapes.js}}
{{include: text.js}}
{{include: layout.js}}
{{include: map.js}}
{{include: statistics.js}}
{{include: component.js}}

})();
