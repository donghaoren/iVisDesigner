// iVisDesigner - File: scripts/core/objects/generators/brushingvalue.js
// Copyright (c) 2013-2014, Donghao Ren
// University of California Santa Barbara, Peking University
// Advised by Prof. Tobias Hollerer and previously by Prof. Xiaoru Yuan.
//
// All rights reserved.
//
// Redistribution and use in source and binary forms, with or without
// modification, are permitted provided that the following conditions are met:
//
// 1. Redistributions of source code must retain the above copyright notice,
//    this list of conditions and the following disclaimer.
//
// 2. Redistributions in binary form must reproduce the above copyright
//    notice, this list of conditions and the following disclaimer in the
//    documentation and/or other materials provided with the distribution.
//
// THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS
// IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO,
// THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR
// PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR
// CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
// EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,
// PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS;
// OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY,
// WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR
// OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF
// ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

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
            this.storage[id] = { value: this.value, brushed: true, _variable: true };
            this._validated = false;
        }
    },
    _compute: function(data) {
        var $this = this;
        $this.path.enumerate(data, function(fctx) {
            var id = data.getObjectID(fctx.val());
            if($this.storage[id] === undefined) {
                $this.storage[id] = { value: $this.default_value, _variable: true };
            }
        });
        data.setAttached($this.uuid, $this.storage);
    },
    onDetach: function(vis) {
    },
});

IV.serializer.registerObjectType("BrushingValue", Objects.BrushingValue);
