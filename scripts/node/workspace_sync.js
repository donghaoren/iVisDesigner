var WorkspaceSync = function() {
    this.serializer = new IV.Serializer();
    this.workspace = null;
};

WorkspaceSync.prototype.processMessage = function(msg) {
    if(msg.type == "sync.startup") {
        this.serializer = new IV.Serializer();
        this.workspace = this.serializer.deserialize(msg.workspace);
        if(this.onUpdate) this.onUpdate();
    } else if(msg.type == "sync.perform") {
        var actions = this.serializer.deserialize(msg.actions);
        actions.actions.forEach(function(action) {
            if(action.perform) action.perform();
        });
        if(this.onUpdate) this.onUpdate();
    } else if(msg.type == "sync.rollback") {
    } else return;
    //console.log(msg);
};
