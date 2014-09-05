var MessageTransportTCP = function(config, is_renderer) {
    var self = this;
    var bcast = require("node_boardcaster");
    var hostname = require("os").hostname();
    if(is_renderer) hostname = "renderer";
    bcast.start(hostname, "boardcaster.conf");
    bcast.onMessage(function(message) {
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
        bcast.stop();
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
