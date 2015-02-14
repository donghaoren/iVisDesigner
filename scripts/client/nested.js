(function() { if(IV.getQuery("nested") != "true") return;
window.isNested = true;

window.addEventListener("message", function(event) {
    var message = JSON.parse(event.data);
    if(message.type == "dataset.set") {
        var schema = message.schema;
        var data = message.data;

        var ds = new IV.PlainDataset(data, schema);
        var vis = IV.editor.workspace;
        IV.loadVisualization();
        IV.data = new IV.DataObject(ds.obj, ds.schema);
        IV.editor.setData(IV.data);
        if(!vis) {
            IV.newVisualization();
        } else {
            IV.loadVisualization(vis);
        }
    }
    if(message.type == "visualization.set") {
        var vis = IV.serializer.deserialize(message.visualization);
        IV.loadVisualization(vis);
        IV.dataset_id = null;
        vis.clearSelection();
    }
    if(message.type == "visualization.get") {
        var serialized = IV.serializer.serialize(IV.editor.workspace);
        event.source.postMessage(JSON.stringify({
            type: "visualization.get:response",
            visualization: serialized
        }), event.origin);
    }
}, false);

})();
