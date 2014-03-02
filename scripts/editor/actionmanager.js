//. iVisDesigner - File: scripts/editor/actionmanager.js
//. Copyright 2013-2014 Donghao Ren
//. Peking University, University of California, Santa Barbara
//. See LICENSE.md for more information.

var Actions = { };
Editor.actions = Actions;

(function() {

var action_cache = [];
var action_log = [];

var undo_stack = [];

var action_perform = function(act) {
    if(act.perform) return act.perform();
};

var action_rollback = function(act) {
    if(act.rollback) return act.rollback();
};

Actions.add = function(act) {
    action_cache.push(act);
};

Actions.commit = function() {
    if(action_cache.length == 0) return;
    for(var i = 0; i < action_cache.length; i++) {
        action_perform(action_cache[i]);
    }
    console.log(action_cache);
    action_log.push(action_cache);
    action_cache = [];
    undo_stack = [];
};

Actions.cancel = function() {
    action_cache = [];
};

Actions.undo = function() {
    Actions.commit();
    var acts = action_log.pop();
    if(acts) {
        for(var i = acts.length - 1; i >= 0; i--) {
            action_rollback(acts[i]);
        }
        undo_stack.push(acts);
    }
};

Actions.redo = function() {
};

IV.on("command:editor.undo", function() {
    Actions.undo();
    Editor.renderer.trigger();
    Editor.renderer.render();
});

// Action types:

Actions.SetProperty = IV.extend(Object, function(p1, p2, p3) {
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
Actions.SetArrayDirectly = IV.extend(Object, function(obj, field, action, p1, p2, p3) {
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

Actions.SetDirectly = IV.extend(Object, function(obj, field, val) {
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
