// iVisDesigner - File: scripts/editor/actionmanager.js
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

var Actions = new IV.ActionManager;
Editor.actions = Actions;

IV.on("command:editor.undo", function() {
    Actions.undo();
    Editor.renderer.trigger();
    Editor.renderer.render();
});

IV.on("command:editor.redo", function() {
    Actions.redo();
    Editor.renderer.trigger();
    Editor.renderer.render();
});

// (function() {

// var action_cache = [];
// var action_log = [];

// var undo_stack = [];

// var action_perform = function(act) {
//     if(act.perform) return act.perform();
// };

// var action_rollback = function(act) {
//     if(act.rollback) return act.rollback();
// };

// Actions.add = function(act) {
//     action_cache.push(act);
// };

// Actions.commit = function() {
//     if(action_cache.length == 0) return;
//     for(var i = 0; i < action_cache.length; i++) {
//         action_perform(action_cache[i]);
//     }
//     //console.log(action_cache);
//     action_log.push(action_cache);
//     action_cache = [];
//     undo_stack = [];
// };

// Actions.cancel = function() {
//     action_cache = [];
// };

// Actions.undo = function() {
//     Actions.commit();
//     var acts = action_log.pop();
//     if(acts) {
//         for(var i = acts.length - 1; i >= 0; i--) {
//             action_rollback(acts[i]);
//         }
//         undo_stack.push(acts);
//     }
// };

// Actions.redo = function() {
// };

// IV.on("command:editor.undo", function() {
//     Actions.undo();
//     Editor.renderer.trigger();
//     Editor.renderer.render();
// });

// // Action types:

// Actions.SetProperty = IV.extend(Object, function(p1, p2, p3) {
//     this.type = "SetProperty";
//     if(p3 === undefined) {
//         this.obj = p1.owner;
//         this.field = p1.property;
//         this.val = p2;
//     } else {
//         this.obj = p1;
//         this.field = p2;
//         this.val = p3;
//     }
// }, {
//     perform: function() {
//         this.original = this.obj["_get_" + this.field]();
//         this.obj["_set_" + this.field](this.val);
//     },
//     rollback: function() {
//         this.obj["_set_" + this.field](this.original);
//     }
// });

// // set index val; splice index howmany vals; push val; pop
// Actions.SetArrayDirectly = IV.extend(Object, function(obj, field, action, p1, p2, p3) {
//     this.type = "SetArrayProperty";
//     this.obj = obj;
//     this.field = field;
//     this.action = action;
//     this.p1 = p1;
//     this.p2 = p2;
//     this.p3 = p3;
// }, {
//     perform: function() {
//         var array = this.obj[this.field];
//         if(this.action == "set") {
//             this.original = array[this.p1];
//             array[this.p1] = this.p2;
//         }
//         if(this.action == "splice") {
//             this.original = Array.prototype.splice.apply(array, [this.p1, this.p2].concat(this.p3));
//         }
//         if(this.action == "push") {
//             array.push(this.p1);
//         }
//         if(this.action == "pop") {
//             this.original = array.pop();
//         }
//         IV.raiseObjectEvent(this.obj, "set:" + this.field, this.action);
//     },
//     rollback: function() {
//         var array = this.obj[this.field];
//         if(this.action == "set") {
//             array[this.p1] = this.original;
//         }
//         if(this.action == "splice") {
//             Array.prototype.splice.apply(array, [this.p1, this.p3.length].concat(this.original));
//         }
//         if(this.action == "push") {
//             array.pop();
//         }
//         if(this.action == "pop") {
//             array.push(this.original);
//         }
//         IV.raiseObjectEvent(this.obj, "set:" + this.field, this.action);
//     }
// });

// Actions.SetDirectly = IV.extend(Object, function(obj, field, val) {
//     this.type = "SetDirectly";
//     this.obj = obj;
//     this.field = field;
//     this.val = val;
// }, {
//     perform: function() {
//         this.original = this.obj[this.field];
//         this.obj[this.field] = this.val;
//         IV.raiseObjectEvent(this.obj, "set:" + this.field, this.val);
//     },
//     rollback: function() {
//         this.obj[this.field] = this.original;
//         IV.raiseObjectEvent(this.obj, "set:" + this.field, this.original);
//     }
// });

// })();
