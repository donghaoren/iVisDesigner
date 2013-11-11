IV.server.twisted_listeners = { };

IV.server.twisted_start = function(callback) {
    IV.server.twisted_sid = "1";
    IV.server.twisted("register", { }, callback);
    var listen = function() {
        IV.server.twisted("messages.get", { }, function(err, data) {
            if(err) {
                setTimeout(listen, 1000);
            } else {
                listen();
                data.messages.forEach(function(m) {
                    if(IV.server.twisted_listeners[m.channel]) {
                        IV.server.twisted_listeners[m.channel](m);
                    }
                });
            }
        });
    };
    listen();
};

IV.server.SyncedObject = IV.extend(Object, function(name) {
    var $this = this;
    this.name = name;
    this.reload_data();
    IV.server.twisted_listeners["doc." + name] = function(m) {
        var oplog = m.oplog.reverse();
        oplog.forEach(function(ops) {
            $this.ops.push(ops);
            $this.perform_ops();
            $this.call_callback();
        });
    };
}, {
    call_callback: function() {
        if(this.onUpdate) this.onUpdate(this.data);
    },
    reload_data: function() {
        var $this = this;
        $this.ops = [];
        $this.index = {};
        $this.data = null;
        IV.server.twisted("document.listen", { name: $this.name }, function(err, data) {
            $this.data = data.data;
            $this.rev = data.rev;
            $this.build_index();
            $this.perform_ops();
            $this.call_callback();
        });
    },
    index_object: function(obj) {
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

IV.server.twisted_start(function(err) {
});

