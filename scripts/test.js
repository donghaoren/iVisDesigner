//. iVisDesigner - File: scripts/test.js
//. Copyright 2013-2014 Donghao Ren
//. Peking University, University of California, Santa Barbara
//. See LICENSE.md for more information.

RENDER_TIME = function() {
    var t0 = new Date().getTime();
    for(var i = 0; i < 100; i++) {
        IV.editor.renderer.trigger("main");
        IV.editor.renderer.render();
    }
    console.log("Render time: ", (new Date().getTime() - t0) / 100);
};

PERFORMANCE_TEST = function() {
    var track1 = new IV.objects.Track({
        path: new IV.Path("[cars]:mpg"),
        anchor1: new IV.objects.Plain(new IV.Vector(0, 0)),
        anchor2: new IV.objects.Plain(new IV.Vector(0, 200)),
        min: new IV.objects.Plain(8),
        max: new IV.objects.Plain(50)
    });
    track1.tick_style.show_ticks = false;
    IV.editor.doAddObject(track1);
    var track2 = new IV.objects.Track({
        path: new IV.Path("[cars]:displacement"),
        anchor1: new IV.objects.Plain(new IV.Vector(0, 0)),
        anchor2: new IV.objects.Plain(new IV.Vector(200, 0)),
        min: new IV.objects.Plain(60),
        max: new IV.objects.Plain(460)
    });
    track2.tick_style.show_ticks = false;
    IV.editor.doAddObject(track2);
    var scatter = new IV.objects.Scatter({
        track1: track1,
        track2: track2
    });
    IV.editor.doAddObject(scatter);
    var circle = new IV.objects.Circle({
        path: new IV.Path("[cars]"),
        center: scatter,
        radius: new IV.objects.Plain(5)
    });
    IV.editor.doAddObject(circle);
    IV.editor.vis.clearSelection();
    IV.editor.renderer.render();
    var t0 = new Date().getTime();
    for(var i = 0; i < 100; i++) {
        IV.editor.renderer.trigger("main");
        IV.editor.renderer.render();
    }
    console.log("Render time: ", (new Date().getTime() - t0) / 100);

    var ratio = IV.getOptimalRatio();
    var canvas = document.createElement("canvas");
    var w = $(window).width();
    var h = $(window).height();
    canvas.width = w * ratio;
    canvas.height = h * ratio;
    console.log(canvas.width, canvas.height);
    var t0 = new Date().getTime();
    for(var trail = 0; trail < 100; trail++) {
        var ctx = canvas.getContext("2d");
        ctx.save();
        ctx.clearRect(0, 0, w, h);
        ctx.scale(ratio, ratio);
        ctx.translate(10, 10);
        ctx.strokeStyle = "gray";
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(0, 200);
        ctx.stroke();
        ctx.moveTo(0, 0);
        ctx.lineTo(200, 0);
        ctx.stroke();
        IV.editor.data.root.cars.forEach(function(car) {
            ctx.beginPath();
            var x = (car.mpg - 8) / (50 - 8) * 200;
            var y = (car.displacement - 60) / (460 - 60) * 200;
            ctx.arc(x, y, 5, 0, Math.PI * 2);
            ctx.fillStyle = "gray";
            ctx.fill();
            ctx.strokeStyle = "black";
            ctx.stroke();
        });
        ctx.restore();
    }
    console.log("Simple time: ", (new Date().getTime() - t0) / 100);

    for(var trail = 0; trail < 100; trail++) {
        //Create SVG element
        var svg = d3.select("body")
            .append("svg")
            .attr("width", w)
            .attr("height", h);
        svg.selectAll("circle")
           .data(IV.editor.data.root.cars)
           .enter()
           .append("circle")
           .attr("cx", function(car) {
                return (car.mpg - 8) / (50 - 8) * 200;
           })
           .attr("cy", function(car) {
                return (car.displacement - 60) / (460 - 60) * 200;
           })
           .attr("r", 5);
        svg.remove();
    }
    console.log("D3 time: ", (new Date().getTime() - t0) / 100);
};

PERFORMANCE_TEST2 = function() {
    var track1 = new IV.objects.Track({
        path: new IV.Path("[cars]:mpg"),
        anchor1: new IV.objects.Plain(new IV.Vector(0, 0)),
        anchor2: new IV.objects.Plain(new IV.Vector(0, 200)),
        min: new IV.objects.Plain(8),
        max: new IV.objects.Plain(50)
    });
    track1.tick_style.show_ticks = false;
    IV.editor.doAddObject(track1);
    var track2 = new IV.objects.Track({
        path: new IV.Path("[cars]:displacement"),
        anchor1: new IV.objects.Plain(new IV.Vector(0, 0)),
        anchor2: new IV.objects.Plain(new IV.Vector(200, 0)),
        min: new IV.objects.Plain(60),
        max: new IV.objects.Plain(460)
    });
    track2.tick_style.show_ticks = false;
    IV.editor.doAddObject(track2);
    var scatter = new IV.objects.Scatter({
        track1: track1,
        track2: track2
    });
    IV.editor.doAddObject(scatter);
    var circle = new IV.objects.Circle({
        path: new IV.Path("[cars]"),
        center: scatter,
        radius: new IV.objects.NumberLinear(new IV.Path("[cars]:cylinders"), 1, 5, 0, 8)
    });
    IV.editor.doAddObject(circle);
    IV.editor.vis.clearSelection();
    IV.editor.renderer.render();
    var t0 = new Date().getTime();
    for(var i = 0; i < 100; i++) {
        IV.editor.renderer.trigger("main");
        IV.editor.renderer.render();
    }
    console.log("Render time: ", (new Date().getTime() - t0) / 100);

    var ratio = IV.getOptimalRatio();
    var canvas = document.createElement("canvas");
    var w = $(window).width();
    var h = $(window).height();
    canvas.width = w * ratio;
    canvas.height = h * ratio;
    console.log(canvas.width, canvas.height);
    var t0 = new Date().getTime();
    for(var trail = 0; trail < 100; trail++) {
        var ctx = canvas.getContext("2d");
        ctx.save();
        ctx.clearRect(0, 0, w, h);
        ctx.scale(ratio, ratio);
        ctx.translate(10, 10);
        ctx.strokeStyle = "gray";
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(0, 200);
        ctx.stroke();
        ctx.moveTo(0, 0);
        ctx.lineTo(200, 0);
        ctx.stroke();
        IV.editor.data.root.cars.forEach(function(car) {
            ctx.beginPath();
            var x = (car.mpg - 8) / (50 - 8) * 200;
            var y = (car.displacement - 60) / (460 - 60) * 200;
            ctx.arc(x, y, car.cylinders / 8 * 4 + 1, 0, Math.PI * 2);
            ctx.fillStyle = "gray";
            ctx.fill();
            ctx.strokeStyle = "black";
            ctx.stroke();
        });
        ctx.restore();
    }
    console.log("Simple time: ", (new Date().getTime() - t0) / 100);

    for(var trail = 0; trail < 100; trail++) {
        //Create SVG element
        var svg = d3.select("body")
            .append("svg")
            .attr("width", w)
            .attr("height", h);
        svg.selectAll("circle")
           .data(IV.editor.data.root.cars)
           .enter()
           .append("circle")
           .attr("cx", function(car) {
                return (car.mpg - 8) / (50 - 8) * 200;
           })
           .attr("cy", function(car) {
                return (car.displacement - 60) / (460 - 60) * 200;
           })
           .attr("r", function(car) {
                return (car.cylinders) / 8 * 4 + 1;
           });
        svg.remove();
    }
    console.log("D3 time: ", (new Date().getTime() - t0) / 100);
};

PERFORMANCE_TEST3 = function() {
    var track1 = new IV.objects.Track({
        path: new IV.Path("[days]:day"),
        anchor1: new IV.objects.Plain(new IV.Vector(0, 0)),
        anchor2: new IV.objects.Plain(new IV.Vector(0, 200)),
        min: new IV.objects.Plain(0),
        max: new IV.objects.Plain(114)
    });
    track1.tick_style.show_ticks = false;
    IV.editor.doAddObject(track1);
    var track2 = new IV.objects.Track({
        path: new IV.Path("[days]:min"),
        anchor1: new IV.objects.Plain(new IV.Vector(0, 0)),
        anchor2: new IV.objects.Plain(new IV.Vector(200, 0)),
        min: new IV.objects.Plain(40),
        max: new IV.objects.Plain(90)
    });
    track2.tick_style.show_ticks = false;
    IV.editor.doAddObject(track2);
    var scatter = new IV.objects.Scatter({
        track1: track1,
        track2: track2
    });
    IV.editor.doAddObject(scatter);
    var line = new IV.objects.LineThrough({
        path: new IV.Path(""),
        points: scatter,
    });
    IV.editor.doAddObject(line);
    IV.editor.vis.clearSelection();
    IV.editor.renderer.render();
    var t0 = new Date().getTime();
    for(var i = 0; i < 1000; i++) {
        IV.editor.renderer.trigger("main");
        IV.editor.renderer.render();
    }
    console.log("Render time: ", (new Date().getTime() - t0) / 1000);

    var ratio = IV.getOptimalRatio();
    var canvas = document.createElement("canvas");
    var w = $(window).width();
    var h = $(window).height();
    canvas.width = w * ratio;
    canvas.height = h * ratio;
    console.log(canvas.width, canvas.height);
    var t0 = new Date().getTime();
    for(var trail = 0; trail < 1000; trail++) {
        var ctx = canvas.getContext("2d");
        ctx.save();
        ctx.clearRect(0, 0, w, h);
        ctx.scale(ratio, ratio);
        ctx.translate(10, 10);
        ctx.strokeStyle = "gray";
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(0, 200);
        ctx.stroke();
        ctx.moveTo(0, 0);
        ctx.lineTo(200, 0);
        ctx.stroke();
        var first = true;
        ctx.beginPath();
        IV.editor.data.root.days.forEach(function(day) {

            var x = (day.day - 0) / (114 - 0) * 200;
            var y = (day.min - 40) / (90 - 40) * 200;
            if(first) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
            first = false;
        });
        ctx.fill();
        ctx.stroke();
        ctx.restore();
    }
    console.log("Simple time: ", (new Date().getTime() - t0) / 1000);
    window.open(canvas.toDataURL());

    for(var trail = 0; trail < 100; trail++) {
        //Create SVG element
        var svg = d3.select("body")
            .append("svg")
            .attr("width", w)
            .attr("height", h);
        var line = d3.svg.line()
            .x(function(day) { return (day.day - 0) / (114 - 0) * 200; })
            .y(function(day) { return (day.min - 40) / (90 - 40) * 200; });
        svg.append("path")
          .datum(IV.editor.data.root.days)
          .attr("class", "line")
          .attr("d", line);
        svg.remove();
    }
    console.log("D3 time: ", (new Date().getTime() - t0) / 100);

};


