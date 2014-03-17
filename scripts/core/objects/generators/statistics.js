//. iVisDesigner - File: scripts/core/objects/generators/statistics.js
//. Copyright 2013-2014 Donghao Ren
//. Peking University, University of California, Santa Barbara
//. See LICENSE.md for more information.

(function() {

Objects.Statistics = IV.extend(Objects.Object, function(info) {
    Objects.Object.call(this);
    this.path = info.path;
    this.path_data = info.path_data;
    this.results = null;
    this._validated = false;
    this.type = "Statistics";
}, {
    $auto_properties: [ "path", "path_data" ],
    onAttach: function(vis) {
        this.vis = vis;
    },
    validate: function(data) {
        if(data.revision !== this._revision) {
            this._validated = false;
        }
        if(!this._validated) {
            this._compute(data);
            this._revision = data.revision;
            this._validated = true;
        }
    },
    onDetach: function(vis) {
    },
    getAttachedSchemas: function() {
        return [
            {
                path: this.path,
                schema: {
                    type: "object",
                    fields: {
                        count: { type: "number" },
                        min: { type: "number" },
                        max: { type: "number" },
                        mean: { type: "number" }
                    }
                }
            }
        ];
    },
    getPropertyContext: function(data) {
        var $this = this;
        return Objects.Object.prototype.getPropertyContext.call(this).concat([
            make_prop_ctx($this, "path", "Anchor", "Statistics", "path"),
            make_prop_ctx($this, "path_data", "Data", "Statistics", "path")
        ]);
    },
    _compute: function(data) {
        var $this = this;
        $this.results = { };
        $this.path.enumerate(data, function(fctx) {
            var count = 0;
            var sum = 0;
            var min = null;
            var max = null;
            $this.path_data.enumerateAtContext(fctx, function(context) {
                var val = context.val();
                if(val !== null && !isNaN(val)) {
                    if(min === null || min > val) min = val;
                    if(max === null || max < val) max = val;
                    sum += val;
                    count += 1;
                }
            });
            var id = data.getObjectID(fctx.val());
            $this.results[id] = {
                count: count,
                min: min, max: max,
                sum: sum,
                mean: count > 0 ? sum / count : null
            };
        });
        data.setAttached($this.uuid, $this.results);
    }
});
IV.serializer.registerObjectType("Statistics", Objects.Statistics);

})();
