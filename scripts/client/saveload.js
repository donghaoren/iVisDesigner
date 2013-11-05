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
                                page_size: page_size
                            }, function(err, data) {
                                if(err) return;
                                ul.children().remove();
                                ul.append(IV._E("li", "group").append(
                                    IV._E("div", "actions").append(
                                        IV._E("span", "btn btn-s").text("+ New").click(function() {
                                            IV.server.get("datasets/" + dataset.id + "/", function(err, data) {
                                                data.data = jsyaml.load(data.data);
                                                data.schema = jsyaml.load(data.schema);
                                                var ds = new IV.PlainDataset(data.data, data.schema);
                                                IV.loadVisualization();
                                                IV.loadData(ds.obj, ds.schema);
                                                IV.newVisualization();
                                                IV.dataset_id = data.id;
                                                ctx.close();
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
                                            IV._E("span", "btn btn-s").append(IV._E("i", "icon-folder-open")).click(function() {
                                                IV.server.get("visualizations/" + vis.id + "/", function(err, data) {
                                                    var yaml_data = jsyaml.load(data.dataset_info.data);
                                                    var yaml_schema = jsyaml.load(data.dataset_info.schema);
                                                    var vis_data = JSON.parse(data.content);
                                                    var ds = new IV.PlainDataset(yaml_data, yaml_schema);
                                                    IV.loadData(ds.obj, ds.schema);
                                                    IV.loadVisualization(IV.serializer.deserialize(vis_data));
                                                    IV.dataset_id = data.dataset_info.id;
                                                    ctx.close();
                                                });
                                            })
                                        ).append(IV._E("span").text(" ")).append(
                                            IV._E("span", "btn btn-s").append(IV._E("i", "icon-trash")).click(function() {
                                                if($(this).is(".btn-confirm")) {
                                                    IV.server.delete("visualizations/" + vis.id + "/", function(err, data) {
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
                                            "by " + vis.user_info.username + ", " +
                                            new Date(vis.created_at).getFullString()
                                        )
                                    );
                                    ul.append(li_vis);
                                });
                            });
                        };
                        load_visualizations(1);
                    } else {
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

    ctx.submit.click(function() {
        var description = ctx.description.val();
        ctx.status_working();
        IV.server.post("visualizations/", {
            user: IV.get("user").id,
            created_at: new Date().toISOString(),
            dataset: IV.dataset_id,
            content: JSON.stringify(IV.serializer.serialize(IV.editor.vis)),
            description: description
        }, function(err, data) {
            if(err) ctx.status_error(err);
            else ctx.close();
        });
    });
});
