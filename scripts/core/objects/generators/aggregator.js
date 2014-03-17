//. iVisDesigner - File: scripts/core/objects/generators/aggregator.js
//. Copyright 2013-2014 Donghao Ren
//. Peking University, University of California, Santa Barbara
//. See LICENSE.md for more information.

(function() {

Objects.Aggregator = IV.extend(Objects.Object, function(info) {
    Objects.Object.call(this);
    this.path = info.path;
    this.path_data = info.path_data;
    this.bin_count = info.bin_count ? info.bin_count : 10;
    this.bin_min = info.bin_min ? info.bin_min : null;
    this.bin_max = info.bin_max ? info.bin_max : null;
    this.filter_value = null;
    this.filter_min = null;
    this.filter_max = null;
    this.results = null;
    this._validated = false;
    this.type = "Aggregator";
}, {
    $auto_properties: [ "path", "path_data", "bin_count", "bin_min", "bin_max", "filter_min", "filter_max", "filter_value" ],
    $auto_properties_after: function() {
        this._validated = false;
    },
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
                        mean: { type: "number" },
                        bins: {
                            type: "collection",
                            fields: {
                                index: { type: "number" },
                                min: { type: "number" },
                                max: { type: "number" },
                                count: { type: "number" },
                                percentage: { type: "number" }
                            }
                        }
                    }
                }
            }
        ];
    },
    getPropertyContext: function(data) {
        var $this = this;
        return Objects.Object.prototype.getPropertyContext.call(this).concat([
            make_prop_ctx($this, "path", "Anchor", "Aggregator", "path"),
            make_prop_ctx($this, "path_data", "Data", "Aggregator", "path"),
            make_prop_ctx($this, "filter_value", "Filter Value", "Aggregator", "number"),
            make_prop_ctx($this, "filter_min", "Filter Min", "Aggregator", "number"),
            make_prop_ctx($this, "filter_max", "Filter Max", "Aggregator", "number"),
            make_prop_ctx($this, "bin_count", "Bins", "Aggregator", "plain-number"),
            make_prop_ctx($this, "bin_min", "Min", "Aggregator", "plain-number"),
            make_prop_ctx($this, "bin_max", "Max", "Aggregator", "plain-number")
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
            var bins = [ ];
            var bin_min = $this.bin_min === null ? min : $this.bin_min;
            var bin_max = $this.bin_max === null ? max : $this.bin_max;
            var bin_count = Math.round($this.bin_count);
            for(var i = 0; i < bin_count; i++) {
                var bmin = bin_min + (bin_max - bin_min) / bin_count * i;
                var bmax = bin_min + (bin_max - bin_min) / bin_count * (i + 1);
                var bcount = 0;
                $this.path_data.enumerateAtContext(fctx, function(context) {
                    var val = context.val();
                    if(val !== null && !isNaN(val)) {
                        if($this.filter_value && $this.filter_min && $this.filter_max) {
                            var fval = $this.filter_value.get(context);
                            var vmin = $this.filter_min.get(fctx);
                            var vmax = $this.filter_max.get(fctx);
                            if(fval !== null && vmin !== null && vmax !== null && (fval < vmin || fval > vmax)) return;
                        }
                        if(val >= bmin && val < bmax) bcount++;
                    }
                });
                bins.push({
                    min: bmin,
                    max: bmax,
                    index: i,
                    count: bcount,
                    percentage: count > 0 ? bcount / count : 0
                });
            }
            var id = data.getObjectID(fctx.val());
            $this.results[id] = {
                count: count,
                min: min, max: max,
                sum: sum,
                mean: count > 0 ? sum / count : null,
                bins: bins
            };
        });
        data.setAttached($this.uuid, $this.results);
    }
});
IV.serializer.registerObjectType("Aggregator", Objects.Aggregator);

})();
