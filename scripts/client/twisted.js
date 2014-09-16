// iVisDesigner - scripts/client/twisted.js
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

(function() {

IV.server.SyncedObject = IV.extend(Object, function(name) {
    var $this = this;
    this.name = name;
    this.reload_data();
    IV.server.wamp.subscribe("doc." + name + ".news", function(message) {
        if($this.rev === undefined) {
            $this.reload_data();
        } else {
            message = JSON.parse(message[0]);
            if(message[0] == $this.rev + 1) {
                $this.ops.push(message);
                $this.perform_ops();
                $this.call_callback();
            } else {
                IV.server.wamp.call("document.diff", { name: $this.name, revision: $this.rev }, {
                    onSuccess: function(result) {
                        result = result[0];
                        var oplog = result.reverse();
                        oplog.forEach(function(ops) {
                            $this.ops.push(ops);
                            $this.perform_ops();
                            $this.call_callback();
                        });
                    },
                    onError: function (err) {
                        console.log(err);
                        //$this.reload_data();
                    }
                });
            }
        }
    });
}, {
    call_callback: function() {
        if(this.onUpdate) this.onUpdate(this.data);
    },
    reload_data: function() {
        var $this = this;
        $this.ops = [];
        $this.index = {};
        $this.data = null;
        IV.server.wamp.call('document.get', $this.name, {
            onSuccess: function (result) {
                result = result[0];
                $this.data = result.data;
                $this.rev = result.revision;
                $this.build_index();
                $this.perform_ops();
                $this.call_callback();
            },
            onError: function (err) {
                console.log(err);
                //$this.reload_data();
            }
        });
        // IV.server.wamp.call("document.get", $this.name, function(data) {
        //     if(err) return;
        //     $this.data = data.data;
        //     $this.rev = data.rev;
        //     $this.build_index();
        //     $this.perform_ops();
        //     $this.call_callback();
        // });
    },
    index_object: function(obj) {
        if(!obj) return obj;
        if(obj.constructor == Object) {
            this.index[obj._id] = obj;
            for(var k in obj) {
                this.index_object(obj[k]);
            }
        }
        if(obj.constructor == Array) {
            for(var k = 0; k < obj.length; k++) {
                this.index_object(obj[k]);
            }
        }
        return obj;
    },
    build_index: function() {
        var data = this.data;
        var index = this.index;
        this.index_object(data);
    },
    perform_ops: function() {
        var $this = this;
        if(!this.data) return;
        //console.log("Current revision:", this.rev);
        var ops_container = this.ops;
        this.ops = [];
        for(var kk = 0; kk < ops_container.length; kk++) {
            var ops = ops_container[kk];
            var r = ops[0];
            if(r <= $this.rev) {
                continue;
            } else if(r > $this.rev + 1) {
                $this.rev = undefined;
                console.log("lost track, reload data.");
                $this.reload_data();
                return;
            }
            $this.rev = r;
            for(var i = 1; i < ops.length;) {
                var cmd = ops[i];
                var n = 1;
                if(cmd == "INITIALIZE") {
                    $this.index = {};
                    $this.data = ops[i + 1];
                    $this.build_index();
                    n = 2;
                }
                if(cmd == "S") { // S(set), _id, key, value
                    n = 4;
                    $this.index[ops[i + 1]][ops[i + 2]] = $this.index_object(ops[i + 3]);
                }
                if(cmd == "U") { // U(unset), _id, key
                    n = 3;
                    delete $this.index[ops[i + 1]][ops[i + 2]];
                }
                if(cmd == "A") { // A(append), _id, key, value
                    n = 4;
                    $this.index[ops[i + 1]][ops[i + 2]].push($this.index_object(ops[i + 3]));
                }
                if(cmd == "I") { // I(insert), _id, key, index, value
                    n = 5;
                    $this.index[ops[i + 1]][ops[i + 2]].splice(ops[i + 3], 0, $this.index_object(ops[i + 4]));
                }
                if(cmd == "P") { // P(pop), _id, key, index
                    n = 4;
                    var c = $this.index[ops[i + 1]][ops[i + 2]];
                    var index = ops[i + 3];
                    if(index === null) index = c.length - 1;
                    c.splice(index, 1);
                }
                i += n;
            }
        }
    }
});

})();
