//. iVisDesigner - File: scripts/node/renderslave.js
//. Copyright 2013-2014 Donghao Ren
//. University of California, Santa Barbara, Peking University
//. See LICENSE.md for more information.

var allosphere = require("node_allosphere");
allosphere.initialize();

// Setup canvas and renderer.
var manager = new IV.CanvasManager(1600, 1600);
var renderer = new IV.Renderer();

renderer.setCanvasManager(manager);

var add_canvas = function() {
    return IVWrappers.CreateCanvas();
};

manager.add("main", main = add_canvas());
manager.add("front", add_canvas());
manager.add("back", add_canvas());
manager.add("overlay", add_canvas());


var MessageTransportTCP = function(host, port) {
    var self = this;
    var net = require("net");
    var client;
    var do_connect = function() {
        temporary = new Buffer(0);
        client = net.connect(port, host);
        console.log("Connecting to:", host, port);
        client.on("data", function(data) {
            temporary = Buffer.concat([temporary, data]);
            while(temporary.length >= 4) {
                var length = temporary.readUInt32LE(0);
                if(temporary.length >= 4 + length) {
                    var message = temporary.slice(4, 4 + length);
                    if(self.onMessage) {
                        try {
                            self.onMessage(JSON.parse(message.toString("utf8")));
                        } catch(e) { console.trace(e); }
                    }
                    temporary = temporary.slice(4 + length);
                } else {
                    break;
                }
            }
        });
        client.on("end", function() {
            do_connect();
        });
    };
    do_connect();
};

var dataset, vis;

var prefix = "/Users/donghao/Documents/Projects/iVisDesignerNative/test/data";
var data = require(prefix + '/graph.json');
var schema = require(prefix + '/graph.schema.json');
var vis_data = require(prefix + '/graph.vis.inverted.json');
var ds = new IV.PlainDataset(data, schema);
dataset = new IV.DataObject(ds.obj, ds.schema);
vis = IV.serializer.deserialize(vis_data);

renderer.setData(dataset);
renderer.setVisualization(vis);
renderer.autoView(vis);
renderer.trigger();
renderer.render();
main.uploadTexture();

var connection = new MessageTransportTCP("ilab-115.cs.ucsb.edu", 60100);
var index = 0;
connection.onMessage = function(object) {
    console.log(index++, object.type);
    if(object.type == "visualization.set") {
        vis = IV.serializer.deserialize(object.visualization);
        renderer.setVisualization(vis);
        renderer.autoView(vis);
        renderer.trigger("main");
        main.uploadTexture();
    }
    if(object.type == "data.set") {
        var ds = new IV.PlainDataset(object.data, object.schema);
        dataset = new IV.DataObject(ds.obj, ds.schema);
        renderer.setData(dataset);
        renderer.setVisualization(vis);
        renderer.trigger("main");
        main.uploadTexture();
    }
};

var GL = allosphere.OpenGL;

// This is called before each frame.
allosphere.onFrame(function() {
});

// Draw your stuff with OpenGL.
allosphere.onDraw(function() {
    if(renderer.render()) {
        main.uploadTexture();
    }

    GL.enable(GL.BLEND);
    GL.blendFunc(GL.SRC_ALPHA, GL.ONE_MINUS_SRC_ALPHA);

    main.__surface.bindTexture(2);

    allosphere.shaderUniformf("texture", 1.0);
    allosphere.shaderUniformi("texture0", 2);
    allosphere.shaderUniformf("lighting", 0);

    GL.begin(GL.QUADS);
    GL.texCoord2f(0, 0); GL.normal3f(0, 0, 1); GL.vertex3f(-1,  1, 1);
    GL.texCoord2f(0, 1); GL.normal3f(0, 0, 1); GL.vertex3f(-1, -1, 1);
    GL.texCoord2f(1, 1); GL.normal3f(0, 0, 1); GL.vertex3f( 1, -1, 1);
    GL.texCoord2f(1, 0); GL.normal3f(0, 0, 1); GL.vertex3f( 1,  1, 1);
    GL.end();


    GL.begin(GL.QUADS);
    GL.texCoord2f(0, 0); GL.normal3f(0, 0, 1); GL.vertex3f(-1,  1, -1);
    GL.texCoord2f(0, 1); GL.normal3f(0, 0, 1); GL.vertex3f(-1, -1, -1);
    GL.texCoord2f(1, 1); GL.normal3f(0, 0, 1); GL.vertex3f( 1, -1, -1);
    GL.texCoord2f(1, 0); GL.normal3f(0, 0, 1); GL.vertex3f( 1,  1, -1);
    GL.end();

    main.__surface.unbindTexture(2);

    GL.flush();
});



// Main event loop.
setInterval(function() {
    allosphere.tick();
}, 10);
