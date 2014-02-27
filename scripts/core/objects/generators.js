IV.math = mathjs();

Objects.Expression = IV.extend(Objects.Object, function(info) {
    Objects.Object.call(this);
    this.type = "Expression";
    this.expression = info.expression;
    this.path = info.path;
    this.count = IV.isNull(info.count) ? info.count : 1;
}, {
    $auto_properties: [ "path" ],
    _set_expression: function(val) {
        this.expression = val;
        this._validated = false;
    },
    _get_expression: function() {
        return this.expression;
    },
    postDeserialize: function() {
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
    getAttachedSchemas: function() {
        return [
            {
                path: this.path,
                schema: {
                    type: "object",
                    fields: {
                        value: { type: "number" },
                        index: { type: "number" }
                    }
                }
            }
        ];
    },
    getPropertyContext: function(data) {
        var $this = this;
        return Objects.Object.prototype.getPropertyContext.call(this).concat([
            make_prop_ctx($this, "path", "Anchor", "Expression", "path"),
            make_prop_ctx($this, "expression", "Expression", "Expression", "plain-string")
        ]);
    },
    _compute: function(data) {
        var $this = this;
        $this.results = { };
        var index = 0;
        var compiled = compile_expression(this.expression, this.path);
        $this.path.enumerate(data, function(fctx) {
            index += 1;
            var id = data.getObjectID(fctx.val());
            try {
                $this.results[id] = {
                    value: compiled({ index: index }, fctx),
                    index: index
                };
            } catch(e) {
            }
        });
        data.setAttached($this.uuid, $this.results);
    },
    onDetach: function(vis) {
    },
});

IV.serializer.registerObjectType("Expression", Objects.Expression);

Objects.BrushingValue = IV.extend(Objects.Object, function(info) {
    Objects.Object.call(this);
    this.type = "BrushingValue";
    this.path = info.path;
    this.storage = { };
    this.value_type = "plain-number";
    this.value = 1;
    this.default_value = 0;
}, {
    $auto_properties: [ "path", "value", "default_value" ],
    postDeserialize: function() {
        this._validated = false;
    },
    _set_default_value: function(val) {
        this.default_value = val;
        for(var i in this.storage) {
            if(i != "uuid" && this.storage[i] !== undefined && !this.storage[i].brushed) {
                this.storage[i].value = this.default_value;
            }
        }
        this._validated = false;
        IV.raiseObjectEvent(this, "set:default_value", val);
    },
    _get_default_value: function() { return this.default_value; },
    _set_value_type: function(val) {
        this.value_type = val;
        if(this.value_type == "plain-number") {
            this._set_value(1);
            this._set_default_value(0);
        }
        if(this.value_type == "plain-color") {
            this._set_value(new IV.Color(255, 255, 255, 1));
            this._set_default_value(new IV.Color(0, 0, 0, 1));
        }
        IV.raiseObjectEvent(this, "set:value_type", val);
    },
    _get_value_type: function() { return this.value_type; },
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
    onAttach: function(vis) {
        this.vis = vis;
    },
    getAttachedSchemas: function() {
        return [
            {
                path: this.path,
                schema: {
                    type: "object",
                    fields: {
                        value: { "type": this.type }
                    }
                }
            }
        ];
    },
    getPropertyContext: function(data) {
        var $this = this;
        return Objects.Object.prototype.getPropertyContext.call(this).concat([
            make_prop_ctx($this, "path", "Anchor", "BrushingValue", "path"),
            make_prop_ctx($this, "value", "Value", "BrushingValue", $this.value_type),
            make_prop_ctx($this, "default_value", "Default", "BrushingValue", $this.value_type),
            make_prop_ctx($this, "value_type", "Type", "BrushingValue", "plain-string", [
                { name: "plain-number", display: "Number" }, { name: "plain-color", display: "Color" }
            ]),
            {
                name: "Reset",
                group: "BrushingValue",
                type: "button",
                get: function() { return "Reset"; },
                set: function(val) {
                    if(val == "Reset") {
                        $this.storage = { };
                        $this._validated = false;
                    }
                }
            }
        ]);
    },
    performBrushing: function(data, context) {
        var entity = context.getEntity(this.path);
        if(entity) {
            var id = data.getObjectID(entity.val());
            this.storage[id] = { value: this.value, brushed: true };
            this._validated = false;
        }
    },
    _compute: function(data) {
        var $this = this;
        $this.path.enumerate(data, function(fctx) {
            var id = data.getObjectID(fctx.val());
            if($this.storage[id] === undefined) {
                $this.storage[id] = { value: $this.default_value };
            }
        });
        data.setAttached($this.uuid, $this.storage);
    },
    onDetach: function(vis) {
    },
});

IV.serializer.registerObjectType("BrushingValue", Objects.BrushingValue);
