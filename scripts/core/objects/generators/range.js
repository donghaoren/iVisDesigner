//. iVisDesigner - File: scripts/core/objects/generators/range.js
//. Copyright 2013-2014 Donghao Ren
//. Peking University, University of California, Santa Barbara
//. See LICENSE.md for more information.

Objects.GenerateRange = IV.extend(Objects.Object, function(info) {
    Objects.Object.call(this);
    this.type = "GenerateRange";
    this.path = info.path;
    this.min = info.min;
    this.max = info.max;
    this.step = info.step;
    this.storage = { };
}, {
    $auto_properties: [ "path", "min", "max", "step" ],
    $auto_properties_after: function() {
        this._validated = false;
    },
    postDeserialize: function() {
        this._validated = false;
    },
    getAttachedSchemas: function() {
        return [
            {
                path: this.path,
                schema: {
                    type: "object",
                    fields: {
                        items: {
                            type: "collection",
                            fields: {
                                value: { type: "number" }
                            }
                        }
                    }
                }
            }
        ];
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
    _compute: function(data) {
        var $this = this;
        $this.path.enumerate(data, function(fctx) {
            var id = data.getObjectID(fctx.val());
            var collection = [];
            if($this.step != 0 && $this.step * ($this.max - $this.min) >= 0) {
                for(var i = $this.min; i <= $this.max; i += $this.step) {
                    collection.push({
                        value: i,
                        _variable: true
                    });
                }
            }
            $this.storage[id] = { "items": collection };
        });
        data.setAttached($this.uuid, $this.storage);
    },
    getPropertyContext: function(data) {
        var $this = this;
        return Objects.Object.prototype.getPropertyContext.call(this).concat([
            make_prop_ctx($this, "path", "Anchor", "GenerateRange", "path"),
            make_prop_ctx($this, "min", "Min", "GenerateRange", "plain-number"),
            make_prop_ctx($this, "max", "Max", "GenerateRange", "plain-number"),
            make_prop_ctx($this, "step", "Step", "GenerateRange", "plain-number")
        ]);
    }
});

IV.serializer.registerObjectType("GenerateRange", Objects.GenerateRange);
