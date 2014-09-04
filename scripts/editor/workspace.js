(function() {

Editor.renderWorkspaceMenu = function() {
    var container = $("#workspace-container");
    container.children().remove();
    if(!Editor.workspace) return;
    var w = Editor.workspace;
    w.canvases.forEach(function(canvas) {
        var li = IV._E("li");
        var span = IV._E("span", "", canvas.name);
        span.append('<span class="toggle-indicator"><i class="xicon-mark"></i></span>');
        li.append(span);
        span.click(function() {
            Editor.workspaceSwitchCanvas(canvas);
        });
        if(w.default_canvas == canvas) {
            span.addClass("toggle-on");
        }
        container.append(li);
    });
    container.append(IV._E("li", "divider"));
    var li = IV._E("li");
    var span = IV._E("span", "", "New Canvas");
    span.click(function() {
        var info = {
            visualization: new IV.Visualization(),
        }
        Editor.workspace.addCanvas(info);
        Editor.workspaceSwitchCanvas(info);
        Editor.renderWorkspaceMenu();
    });
    li.append(span);
    container.append(li);
};

})();
