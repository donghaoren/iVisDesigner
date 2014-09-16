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

Objects.Component = IV.extend(Objects.Object, function(info) {
    Objects.Object.call(this, info);
    this.type = "Component";
    // Center.
    this.path = info.path;
    this.center = info.center ? info.center : new Objects.Plain(new IV.Vector(0, 0));
    this.scale = info.scale ? info.scale : new Objects.Plain(1);
    this.objects = info.objects ? info.objects : [];
}, {
    $auto_properties: [ "path", "center", "scale" ],
    postDeserialize: function() {
        var $this = this;
        this.objects.forEach(function(obj) {
            obj.selected = false;
            if(!obj.name) {
                var names = { };
                $this.objects.forEach(function(o) { names[o.name] = true; });
                for(var i = 1;; i++) {
                    var name = obj.type + i;
                    if(names[name]) continue;
                    obj.name = name;
                    break;
                }
            }
        });
    },
    addObject: function(obj) {
        var $this = this;
        if(!obj.name) {
            var names = { };
            $this.objects.forEach(function(o) { names[o.name] = true; });
            for(var i = 1;; i++) {
                var name = obj.type + i;
                if(names[name]) continue;
                obj.name = name;
                break;
            }
        }
        this.objects.push(obj);
    },
    can: function(cap) {

    },
    getPropertyContext: function() {
        var $this = this;
        return Objects.Object.prototype.getPropertyContext.call(this).concat([
            make_prop_ctx($this, "center", "Center", "Component", "point"),
            make_prop_ctx($this, "scale", "Scale", "Component", "number")
        ]);
    },
    toLocalCoordinate: function(pt, context) {
        var p = this.center.getPoint(context);
        var scale = this.scale.getPoint(context);
        return pt.sub(p).scale(1.0 / scale);
    },
    fromLocalCoordinate: function(pt, context) {
        var p = this.center.getPoint(context);
        var scale = this.scale.getPoint(context);
        return pt.scale(scale).add(p);
    },
    render: function(g, data) {
        var $this = this;
        this.path.enumerate(data, function(context) {
            var p = $this.center.getPoint(context);
            var scale = $this.scale.getPoint(context);
            if(p === null || scale === null) return;
            g.ivSave();
            g.ivAppendTransform(
                        IV.makeTransform.translate(p.x, p.y)
                .concat(IV.makeTransform.scale(scale, scale))
            );
            IV.forEachReversed($this.objects, function(obj) {
                g.ivSave();
                try {
                    obj.render(g, context);
                } catch(e) {
                    console.trace(e.stack);
                }
                g.ivRestore();
            });
            g.ivRestore();
        });
    },
    renderSelected: function(g, data, context, selection_context) {
        var $this = this;
        var render_for_context = function(context) {
            var p = $this.center.getPoint(context);
            var scale = $this.scale.getPoint(context);
            g.ivSave();
            g.ivAppendTransform(
                        IV.makeTransform.translate(p.x, p.y)
                .concat(IV.makeTransform.scale(scale, scale))
            );
            if(selection_context.selected_object) {
                if(selection_context.selected_object.renderSelected)
                    selection_context.selected_object.renderSelected(g, context, selection_context.inner.context, selection_context.inner);
            } else {
                IV.forEachReversed($this.objects, function(obj) {
                    g.ivSave();
                    try {
                        obj.renderSelected(g, context);
                    } catch(e) {
                        console.trace(e.stack);
                    }
                    g.ivRestore();
                });
            }
            g.ivRestore();
        };
        if(context) {
            render_for_context(context);
        } else {
            $this.path.enumerate(data, render_for_context);
        }
    },
    renderGuideSelected: function(g, data, context, selection_context) {
        var $this = this;
        var render_for_context = function(context) {
            var p = $this.center.getPoint(context);
            var scale = $this.scale.getPoint(context);
            g.ivSave();
            g.ivAppendTransform(
                        IV.makeTransform.translate(p.x, p.y)
                .concat(IV.makeTransform.scale(scale, scale))
            );
            if(selection_context.selected_object) {
                if(selection_context.selected_object.renderGuideSelected)
                    selection_context.selected_object.renderGuideSelected(g, context, selection_context.inner.context, selection_context.inner);
            } else {
                IV.forEachReversed($this.objects, function(obj) {
                    g.ivSave();
                    try {
                        obj.renderGuideSelected(g, context);
                    } catch(e) {
                        console.trace(e.stack);
                    }
                    g.ivRestore();
                });
            }
            g.ivRestore();
        };
        if(context) {
            render_for_context(context);
        } else {
            $this.path.enumerate(data, render_for_context);
        }
    },
    select: function(pt, data, action) {
        var $this = this;
        var rslt = null;
        this.path.enumerate(data, function(context) {
            var p = $this.center.getPoint(context);
            var scale = $this.scale.getPoint(context);
            var pt2 = pt.sub(p).scale(1.0 / scale);
            pt2.view_det = pt.view_det.slice();
            pt2.view_det[0] *= scale;
            pt2.view_det[1] *= scale;
            pt2.view_det[2] *= scale;
            pt2.view_det[3] *= scale;
            pt2.view_scale = pt.view_scale * scale;
            if(p === null) return;
            IV.forEachReversed($this.objects, function(obj) {
                var r = obj.select(pt2, context, action);
                if(r && (!rslt || rslt.distance > r.distance)) {
                    r.obj = obj;
                    rslt = {
                        distance: r.distance,
                        selected_object: obj,
                        inner: r,
                        context: context.clone()
                    };
                    if(r.onMove) {
                        rslt.onMove = function(p0, p1, magnetics) {
                            var rp0 = p0.sub(p).scale(1.0 / scale);
                            var rp1 = p1.sub(p).scale(1.0 / scale);
                            magnetics_delegate = {
                                modify: function(x, y) {
                                },
                                accept: function(c, x, y) {
                                }
                            };
                            return r.onMove(rp0, rp1, magnetics_delegate);
                        };
                    }
                }
            });
        });
        return rslt;
    },
    selectObject: function(data, obj, r) {
        return {
            inner: r,
            selected_object: obj,
            context: null
        };
    }
});
IV.serializer.registerObjectType("Component", Objects.Component);

G_CREATE_TEST_COMPONENT = function() {
    var scatter = new Objects.Scatter({
        track1: new Objects.Track({
            path: new IV.Path("[stations]:lng"),
            min: new Objects.Plain(115.972),
            max: new Objects.Plain(117.12),
            anchor1: new Objects.Plain(new IV.Vector(-310, -300)),
            anchor2: new Objects.Plain(new IV.Vector(-310, 300))
        }),
        track2: new Objects.Track({
            path: new IV.Path("[stations]:lat"),
            min: new Objects.Plain(39.52),
            max: new Objects.Plain(40.499),
            anchor1: new Objects.Plain(new IV.Vector(-300, -310)),
            anchor2: new Objects.Plain(new IV.Vector(300, -310))
        })
    });
    var scatterk = new Objects.Scatter({
        track1: new Objects.Track({
            path: new IV.Path("[stations]:[measurements]:PM2_5"),
            min: new Objects.Plain(0),
            max: new Objects.Plain(100),
            anchor1: new Objects.Plain(new IV.Vector(0, 0)),
            anchor2: new Objects.Plain(new IV.Vector(0, 30))
        }),
        track2: new Objects.Track({
            path: new IV.Path("[stations]:[measurements]:time"),
            min: new Objects.Plain(1367337600),
            max: new Objects.Plain(1367474400),
            anchor1: new Objects.Plain(new IV.Vector(0, 0)),
            anchor2: new Objects.Plain(new IV.Vector(30, 0))
        })
    });
    var component = new Objects.Component({
        path: new IV.Path("[stations]"),
        center: scatter,
        objects: [
            scatterk,
            scatterk.track1,
            scatterk.track2,
            new Objects.Line({
                path: new IV.Path("[stations]:[measurements]"),
                point1: scatterk,
                point2: scatterk.track2
            })
        ]
    });
    IV.editor.vis.addObject(scatter);
    IV.editor.vis.addObject(scatter.track1);
    IV.editor.vis.addObject(scatter.track2);
    IV.editor.vis.addObject(component);
};
