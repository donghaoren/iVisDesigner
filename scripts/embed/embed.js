//. iVisDesigner - File: scripts/embed/embed.js
//. Copyright 2013-2014 Donghao Ren
//. Peking University, University of California, Santa Barbara
//. See LICENSE.md for more information.

IV.EmbeddedCanvas = IV.extend(Object, function(div, options) {
    this.div = div;

    IV.fillDefault(options, {
        width: 900, height: 600,
        center: new IV.Vector(0, 0),
        scale: 1
    });
    this.width = options.width; this.height = options.height;
    div.css({
        position: "relative",
        display: "inline-block"
    });

    this.manager = new IV.CanvasManager(this.width, this.height);
    this.renderer = new IV.Renderer();

    this.renderer.frame_grid = false;
    this.renderer.show_guide = false;

    this.renderer.setCanvasManager(this.manager);
    this.renderer.setView(options.center, options.scale);

    if(options.data) {
        this.renderer.setData(options.data);
        this.data = options.data;
    }

    if(options.visualization) {
        this.renderer.setVisualization(options.visualization);
        this.vis = options.visualization;
    }


    var add_canvas = function() {
        var c = document.createElement("canvas");
        div.append($(c).css({
            position: "absolute",
            left: "0", right: "0"
        }));
        return c;
    };

    this.manager.add("main", add_canvas());
    this.manager.add("front", add_canvas());
    this.manager.add("back", add_canvas());
    this.manager.add("overlay", add_canvas());

    this.resize(this.width, this.height);

    if(options.visualization)
        this.renderer.autoView(options.visualization);
    this.redraw();

    var $this = this;
    setInterval(function() {
        $this.vis.timerTick($this.data);
        $this.vis.triggerRenderer($this.renderer);
        $this.renderer.render();
    }, 30);
}, {
    redraw: function() {
        this.renderer.trigger();
        this.renderer.render();
    },
    resize: function(width, height) {
        this.manager.resize(width, height, true);
        this.div.css({
            width: width + "px",
            height: height + "px"
        });
    }
});

// Usage:
// $("<div>").ivVisualization({
//     width:
//     height:
//     center: new IV.Vector(x, y)
//     scale:
//     data:
//     visualization:
// });

$.fn.ivVisualization = function(options) {
    $(this).data().c = new IV.EmbeddedCanvas($(this), options);
    return $(this);
};
