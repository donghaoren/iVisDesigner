//. iVisDesigner - File: scripts/node/renderslave.js
//. Copyright 2013-2014 Donghao Ren
//. University of California, Santa Barbara, Peking University
//. See LICENSE.md for more information.

IV.getOptimalRatio = function() { return 1; };

var prefix = "/Users/donghao/Documents/Projects/iVisDesignerNative/test/data";

var data = require(prefix + '/graph.json');
var schema = require(prefix + '/graph.schema.json');
var vis_data = require(prefix + '/graph.vis.json');

var ds = new IV.PlainDataset(data, schema);
var dataset = new IV.DataObject(ds.obj, ds.schema);

var vis = IV.serializer.deserialize(vis_data);

var manager = new IV.CanvasManager(1600, 1600);
var renderer = new IV.Renderer();

var add_canvas = function() {
    return IVWrappers.CreateCanvas();
};

manager.add("main", main = add_canvas());
manager.add("front", add_canvas());
manager.add("back", add_canvas());
manager.add("overlay", add_canvas());

renderer.setCanvasManager(manager);

renderer.setData(dataset);
renderer.setVisualization(vis);

renderer.autoView(vis);

var t0 = new Date().getTime();
var trails = 1;
for(var i = 0; i < trails; i++) {
    renderer.trigger();
    renderer.render();
}
var t1 = new Date().getTime();
console.log((t1 - t0) / trails);

main.__surface.uploadTexture();


var GL = allosphere.OpenGL;

// This is called before each frame.
allosphere.onFrame(function() {
});

// Draw your stuff with OpenGL.
allosphere.onDraw(function() {
    main.__surface.bindTexture(2);

    allosphere.shaderUniformf("texture", 1.0);
    allosphere.shaderUniformi("texture0", 2);
    allosphere.shaderUniformf("lighting", 0.1);



    GL.begin(GL.QUADS);
    GL.texCoord2f(0, 0); GL.normal3f(0, 0, 1); GL.vertex3f(-1,  1, -1);
    GL.texCoord2f(0, 1); GL.normal3f(0, 0, 1); GL.vertex3f(-1, -1, -1);
    GL.texCoord2f(1, 1); GL.normal3f(0, 0, 1); GL.vertex3f( 1, -1, -1);
    GL.texCoord2f(1, 0); GL.normal3f(0, 0, 1); GL.vertex3f( 1,  1, -1);
    GL.end();

    main.__surface.unbindTexture(2);
});



// Main event loop.
setInterval(function() {
    allosphere.tick();
}, 10);
