// iVisDesigner - scripts/node/transport.js
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

var MessageTransportTCP = function(config, is_renderer) {
    var self = this;
    var zmq = require("zmq");
    var sub = zmq.socket("sub");
    sub.connect(config.broadcast[require("os").hostname()]);
    sub.subscribe("");
    sub.on("message", function(message) {
        if(self.onMessage) {
            try {
                var str = message.toString("utf8");
                self.onMessage(JSON.parse(str));
            } catch(e) {
                console.trace(e);
            }
        }
    });
    this.close = function() {
        sub.close();
    };
};

// var MessageTransportTCP = function(host, port) {
//     var self = this;
//     var net = require("net");
//     var client;
//     var do_connect = function() {
//         temporary = new Buffer(0);
//         client = net.connect(port, host);
//         console.log("Connecting to:", host, port);
//         client.on("data", function(data) {
//             // var t0 = new Date().getTime();
//             temporary = Buffer.concat([temporary, data]);
//             while(temporary.length >= 4) {
//                 var length = temporary.readUInt32LE(0);
//                 if(temporary.length >= 4 + length) {
//                     var message = temporary.slice(4, 4 + length);
//                     if(self.onMessage) {
//                         try {
//                             self.onMessage(JSON.parse(message.toString("utf8")));
//                         } catch(e) { console.trace(e); }
//                     }
//                     temporary = temporary.slice(4 + length);
//                 } else {
//                     break;
//                 }
//             }
//             // var t1 = new Date().getTime();
//             // console.log("on_data:", t1 - t0);
//         });
//         client.on("end", function() {
//             do_connect();
//         });
//     };
//     this.close = function() {
//         if(client) {
//             client.unref();
//             client = null;
//         }
//     };
//     do_connect();
// };
