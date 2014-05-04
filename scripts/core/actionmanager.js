//. iVisDesigner - File: scripts/core/actionmanager.js
//. Copyright 2013-2014 Donghao Ren
//. Peking University, University of California, Santa Barbara
//. See LICENSE.md for more information.

(function() {

var actions = { };

IV.actions = actions;

IV.ActionManager = function(root) {
    this.action_cache = [];
    this.action_log = [];
    this.undo_stack = [];
};

IV.ActionManager.prototype.perform = function(act) {
};

IV.ActionManager.prototype.add = function(act) {
    this.action_cache.push(act);
};

IV.ActionManager.prototype.commit = function() {
    if(this.action_cache.length == 0) return;
    for(var i = 0; i < this.action_cache.length; i++) {
        if(this.action_cache[i].perform)
            this.action_cache[i].perform();
    }
    this.action_log.push(this.action_cache);
    this.action_cache = [];
    this.undo_stack = [];
};

IV.ActionManager.prototype.cancel = function() {
    this.action_cache = [];
};

IV.ActionManager.prototype.undo = function() {
    this.commit();
    var acts = this.action_log.pop();
    if(acts) {
        for(var i = acts.length - 1; i >= 0; i--) {
            if(acts[i].rollback)
                acts[i].rollback();
        }
        this.undo_stack.push(acts);
    }
};

IV.ActionManager.prototype.redo = function() {
    this.commit();
    if(this.undo_stack) {
        var acts = this.undo_stack.pop();
        if(acts) {
            for(var i = 0; i < acts.length; i++) {
                if(acts[i].perform)
                    acts[i].perform();
            }
        }
    }
};

// Action types:

actions.SetProperty = IV.extend(Object, function(p1, p2, p3) {
    this.type = "SetProperty";
    if(p3 === undefined) {
        this.obj = p1.owner;
        this.field = p1.property;
        this.val = p2;
    } else {
        this.obj = p1;
        this.field = p2;
        this.val = p3;
    }
}, {
    perform: function() {
        this.original = this.obj["_get_" + this.field]();
        this.obj["_set_" + this.field](this.val);
    },
    rollback: function() {
        this.obj["_set_" + this.field](this.original);
    }
});

// set index val; splice index howmany vals; push val; pop
actions.SetArrayDirectly = IV.extend(Object, function(obj, field, action, p1, p2, p3) {
    this.type = "SetArrayProperty";
    this.obj = obj;
    this.field = field;
    this.action = action;
    this.p1 = p1;
    this.p2 = p2;
    this.p3 = p3;
}, {
    perform: function() {
        var array = this.obj[this.field];
        if(this.action == "set") {
            this.original = array[this.p1];
            array[this.p1] = this.p2;
        }
        if(this.action == "splice") {
            this.original = Array.prototype.splice.apply(array, [this.p1, this.p2].concat(this.p3));
        }
        if(this.action == "push") {
            array.push(this.p1);
        }
        if(this.action == "pop") {
            this.original = array.pop();
        }
        IV.raiseObjectEvent(this.obj, "set:" + this.field, this.action);
    },
    rollback: function() {
        var array = this.obj[this.field];
        if(this.action == "set") {
            array[this.p1] = this.original;
        }
        if(this.action == "splice") {
            Array.prototype.splice.apply(array, [this.p1, this.p3.length].concat(this.original));
        }
        if(this.action == "push") {
            array.pop();
        }
        if(this.action == "pop") {
            array.push(this.original);
        }
        IV.raiseObjectEvent(this.obj, "set:" + this.field, this.action);
    }
});

actions.SetDirectly = IV.extend(Object, function(obj, field, val) {
    this.type = "SetDirectly";
    this.obj = obj;
    this.field = field;
    this.val = val;
}, {
    perform: function() {
        this.original = this.obj[this.field];
        this.obj[this.field] = this.val;
        IV.raiseObjectEvent(this.obj, "set:" + this.field, this.val);
    },
    rollback: function() {
        this.obj[this.field] = this.original;
        IV.raiseObjectEvent(this.obj, "set:" + this.field, this.original);
    }
});

})();
