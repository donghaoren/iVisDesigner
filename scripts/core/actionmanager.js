// iVisDesigner - scripts/core/actionmanager.js
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

var actions = { };

IV.actions = actions;

IV.ActionManager = function(root) {
    this.action_cache = [];
    this.action_log = [];
    this.undo_stack = [];
    IV.EventSource.call(this);
};

IV.implement(IV.EventSource, IV.ActionManager);

IV.ActionManager.prototype.perform = function(act) {
};

IV.ActionManager.prototype.add = function(act) {
    this.action_cache.push(act);
};

IV.ActionManager.prototype.commit = function() {
    if(this.action_cache.length == 0) return;
    this.raise("perform", this.action_cache);
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
    this.type = "action.SetProperty";
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
IV.serializer.registerObjectType("action.SetProperty", actions.SetProperty);

// set index val; splice index howmany vals; push val; pop
actions.SetArrayDirectly = IV.extend(Object, function(obj, field, action, p1, p2, p3) {
    this.type = "action.SetArrayDirectly";
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
IV.serializer.registerObjectType("action.SetArrayDirectly", actions.SetArrayDirectly);

actions.SetDirectly = IV.extend(Object, function(obj, field, val) {
    this.type = "action.SetDirectly";
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
IV.serializer.registerObjectType("action.SetDirectly", actions.SetDirectly);

actions.Add = IV.extend(Object, function(obj, f_add, f_remove, item) {
    this.type = "action.Add";
    this.obj = obj;
    this.function_add = f_add;
    this.function_remove = f_remove;
    this.item = item;
}, {
    perform: function() {
        this.obj[this.function_add](this.item);
    },
    rollback: function() {
        this.obj[this.function_remove](this.item);
    }
});
IV.serializer.registerObjectType("action.Add", actions.Add);

})();
