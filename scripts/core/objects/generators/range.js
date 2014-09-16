// iVisDesigner - scripts/core/objects/generators/range.js
// Author: Donghao Ren
//
// LICENSE
//
// Copyright (c) 2014, The Regents of the University of California
// All rights reserved.
//
// Redistribution and use in source and binary forms, with or without modification,
// are permitted provided that the following conditions are met:
//
// 1. Redistributions of source code must retain the above copyright notice, this
//    list of conditions and the following disclaimer.
//
// 2. Redistributions in binary form must reproduce the above copyright notice,
//    this list of conditions and the following disclaimer in the documentation
//    and/or other materials provided with the distribution.
//
// 3. Neither the name of the copyright holder nor the names of its contributors
//    may be used to endorse or promote products derived from this software without
//    specific prior written permission.
//
// THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
// ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
// WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED.
// IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT,
// INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING,
// BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
// DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
// LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE
// OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED
// OF THE POSSIBILITY OF SUCH DAMAGE.

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
