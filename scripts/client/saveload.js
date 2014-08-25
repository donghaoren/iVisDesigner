// iVisDesigner - File: scripts/client/saveload.js
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

var double_async_jsonp = function(url, params, callback) {
    callback_name = "IVJSONP_" + new Date().getTime();
    var script = document.createElement("script");
    var kvs = ['callback=' + callback_name];
    for(var k in params) {
        kvs.push(k + "=" + encodeURIComponent(params[k]));
    }
    script.src = url + "?" + kvs.join("&");
    window[callback_name] = function(data) {
        callback(data);
    };
    document.body.appendChild(script);
};

var load_dataset_from_server = function(info, callback) {
    if(!callback) callback = function(){};
    var schema = jsyaml.load(info.schema);
    var data = null;
    if(schema.source) {
        if(schema.source.name) {
            var name = schema.source.name;
            var obj = new IV.server.SyncedObject(name);
            var data_obj = null;
            obj.onUpdate = function(data) {
                var ds = new IV.PlainDataset(data, schema);
                if(!data_obj) {
                    data_obj = new IV.DataObject(ds.obj, ds.schema);
                    IV.data = data_obj;
                    IV.editor.setData(IV.data);
                    callback();
                } else {
                    data_obj.updateRoot(ds.obj);
                    data_obj.raise("update");
                }
            };
        } else if(schema.source.url) {
            var url = schema.source.url;
            if(schema.source.type == "jsonp") {
                var is_first_time = true;
                double_async_jsonp(url, { }, function(data) {
                    if(is_first_time) {
                        var ds = new IV.PlainDataset(data, schema);
                        IV.loadVisualization();
                        IV.data = new IV.DataObject(ds.obj, ds.schema);
                        IV.editor.setData(IV.data);
                        callback();
                    } else {
                        var ds = new IV.PlainDataset(data, schema);
                        IV.data = new IV.DataObject(ds.obj, ds.schema);
                        IV.editor.setData(IV.data);
                        IV.data.raise("update");
                    }
                    is_first_time = false;
                });
            } else {
                $.ajax({
                    url: url,
                    dataType: "json",
                    type: "get",
                    crossDomain: true,
                    timeout: 60000
                }).done(function(data) {
                    var ds = new IV.PlainDataset(data, schema);
                    IV.loadVisualization();
                    IV.data = new IV.DataObject(ds.obj, ds.schema);
                    IV.editor.setData(IV.data);
                    callback();
                }).fail(function() {
                });
            }
        }
    } else {
        data = jsyaml.load(info.data);
        var ds = new IV.PlainDataset(data, schema);
        IV.loadVisualization();
        IV.data = new IV.DataObject(ds.obj, ds.schema);
        IV.editor.setData(IV.data);
        IV.raise("dataset:set", { data: jsyaml.load(info.data), schema: schema }); // TODO: restructure this code.
        callback();
    }
}

IV.loadVisualizationById = function(id, callback) {
    IV.server.get("visualizations/" + id + "/", function(err, data) {
        load_dataset_from_server(data.dataset_info, function() {
            var vis_data = JSON.parse(data.content);
            IV.visualization_info = data;
            var vis = IV.serializer.deserialize(vis_data);
            IV.loadVisualization(vis);
            IV.dataset_id = data.dataset_info.id;
            vis.clearSelection();
            if(callback) callback(vis);
        });
    });
};

IV.on("command:toolkit.start", function() {
    var ctx = IV.modals.constructModal({
        html: IV.strings("modal_load_dataset"),
        title: "New / Open Visualization",
        width: $(window).width() * 0.6,
        height: $(window).height() * 0.8
    });
    var page_size = 30;
    var load_page = function(page_index) {
        IV.server.get("datasets/", { page: page_index, page_size: page_size }, function(err, data) {
            ctx.datasets.children().remove();
            if(err) {
                ctx.datasets.append($("<p />").text("Error: " + errorString(err)));
                return;
            }
            ctx.item.find(".pagination").each(function() {
                var c = $(this);
                generate_pagination(c, page_index, page_size, data, load_page);
            });
            data.results.forEach(function(dataset) {
                var li = IV._E("li");
                var dataset_info = IV._E("div").addClass("dataset-info");
                dataset_info.append(IV._E("span", "name").text(dataset.name));
                dataset_info.append(IV._E("span", "description").text(dataset.description));
                li.append(dataset_info);
                dataset_info.click(function() {
                    var ul = li.children("ul");
                    if(ul.length == 0) {
                        ul = IV._E("ul", "visualizations");
                        li.append(ul);
                        var load_visualizations = function(page_index) {
                            IV.server.get("visualizations/", {
                                dataset: dataset.id,
                                page: page_index,
                                page_size: page_size,
                                is_autosave: IV.getQuery("autosave") ? null : "False"
                            }, function(err, data) {
                                ul.children().remove();
                                if(err) {
                                    ul.append(IV._E("li").text("Error: " + errorString(err)));
                                    return;
                                }
                                ul.append(IV._E("li", "group").append(
                                    IV._E("div", "actions").append(
                                        IV._E("span", "btn").text("+ New").click(function() {
                                            IV.server.get("datasets/" + dataset.id + "/", function(err, data) {
                                                load_dataset_from_server(data, function() {
                                                    IV.newVisualization();
                                                    IV.dataset_id = data.id;
                                                    ctx.close();
                                                });
                                            });
                                        })
                                    ).append(
                                        IV._E("span").text(" ")
                                    ).append(
                                        IV._E("span", "pagination")
                                    )
                                ));
                                ul.find(".pagination").each(function() {
                                    generate_pagination($(this), page_index, page_size, data, load_visualizations);
                                });
                                data.results.forEach(function(vis) {
                                    var li_vis = IV._E("li", "group").append(
                                        IV._E("span", "actions pull-right").append(
                                            IV._E("span", "btn").append(IV._E("i", "icon-folder")).click(function() {
                                                IV.server.get("visualizations/" + vis.id + "/", function(err, data) {
                                                    load_dataset_from_server(data.dataset_info, function() {
                                                        var vis_data = JSON.parse(data.content);
                                                        IV.visualization_info = data;
                                                        var vis = IV.serializer.deserialize(vis_data);
                                                        IV.loadVisualization(vis);
                                                        IV.dataset_id = data.dataset_info.id;
                                                        vis.clearSelection();
                                                        ctx.close();
                                                    });
                                                });
                                            })
                                        ).append(IV._E("span").text(" ")).append(
                                            IV._E("span", "btn").append(IV._E("i", "icon-trash")).click(function() {
                                                if($(this).is(".btn-confirm")) {
                                                    IV.server['delete']("visualizations/" + vis.id + "/", function(err, data) {
                                                        if(!err) li_vis.remove();
                                                    });
                                                } else {
                                                    $(this).text("DELETE").addClass("btn-confirm");
                                                }
                                            })
                                        )
                                    ).append(
                                        IV._E("span", "description").text(vis.description)
                                    ).append(
                                        IV._E("span", "user").text(
                                            "by " + (IV.getQuery("hideusername") ? "anonymous" : vis.user_info.username) + ", " +
                                            new Date(vis.created_at).getFullString()
                                        )
                                    );
                                    ul.append(li_vis);
                                });
                            });
                        };
                        load_visualizations(1);
                        ul.data().load_visualizations = load_visualizations;
                    } else {
                        ul.data().load_visualizations(1);
                        ul.toggle();
                    }
                });
                ctx.datasets.append(li);
            });
        });
    };
    load_page(1);
});

IV.on("command:toolkit.save", function() {
    var ctx = IV.modals.constructModal({
        html: IV.strings("modal_save_visualization"),
        title: "Save Visualization",
        width: $(window).width() * 0.5,
        height: $(window).height() * 0.5
    });

    ctx.saveas.click(function() {
        var description = ctx.description.val();
        ctx.status_working();
        IV.server.post("visualizations/", {
            user: IV.get("user").id,
            created_at: new Date().toISOString(),
            dataset: IV.dataset_id,
            content: JSON.stringify(IV.serializer.serialize(IV.editor.vis)),
            description: description,
            uuid: IV.editor.vis.uuid
        }, function(err, data) {
            if(err) ctx.status_error(errorString(err));
            else ctx.close();
        });
    });
    if(IV.visualization_info) {
        ctx.description.val(IV.visualization_info.description);
        ctx.save.click(function() {
            var description = ctx.description.val();
            ctx.status_working();
            IV.server.put("visualizations/" + IV.visualization_info.id + "/", {
                user: IV.get("user").id,
                created_at: new Date().toISOString(),
                dataset: IV.dataset_id,
                content: JSON.stringify(IV.serializer.serialize(IV.editor.vis)),
                description: description,
                uuid: IV.editor.vis.uuid
            }, function(err, data) {
                if(err) ctx.status_error(errorString(err));
                else ctx.close();
            });
        });
    } else ctx.save.remove();
});

(function() {
    var previous_content = null;
    var running_request = false;
    setInterval(function() {
        if(!IV.editor.data || !IV.editor.vis) return;
        content = JSON.stringify(IV.serializer.serialize(IV.editor.vis));
        if(content == previous_content || running_request) return;
        running_request = true;
        IV.server.post("visualizations/", {
            user: IV.get("user").id,
            dataset: IV.dataset_id,
            content: content,
            description: "Autosaved Visualization",
            uuid: IV.editor.vis.uuid,
            is_autosave: true
        }, function(err, data) {
            running_request = false;
            if(err) {
                console.log("Autosave Failure");
            } else {
                console.log("Autosave Successfully");
                previous_content = content;
            }
        });
    }, 5000);
})();
