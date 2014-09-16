// iVisDesigner - scripts/embed/embed.js
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
            left: "0", top: "0"
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
        if(!$this.vis) return;
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
