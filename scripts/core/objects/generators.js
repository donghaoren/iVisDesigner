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
        var compiled = IV.math.compile(this.expression);
        // TODO: security issue here!!! need to compile the user expression by hand.
        $this.path.enumerate(data, function(fctx) {
            index += 1;
            var id = data.getObjectID(fctx.val());
            $this.results[id] = {
                value: compiled.eval({ _: function(fs) {
                    fs = fs.split(".");
                    var obj = fctx.val();
                    for(var i = 0; i < fs.length; i++) obj = obj[fs[i]];
                    return obj;
                }, index: index }),
                index: index
            };
        });
        data.setAttached($this.uuid, $this.results);
    },
    onDetach: function(vis) {
    },
});

IV.serializer.registerObjectType("Expression", Objects.Expression);
