(function() {

Tools.Brushing = {
    onActive: function() {
        this.lasso = [];
        var $this = this;
        if(Editor.vis) Editor.vis.clearSelection();

        Tools.beginTrackMouse(function(e) {
            $this.lasso.push(e.offset);

            e.move(function(e_move) {
                $this.lasso.push(e_move.offset);
                Tools.triggerRender("overlay");
            });
            e.release(function(e_release) {
                var lasso = $this.lasso;
                $this.lasso = [];
                Tools.triggerRender("overlay");
            });
        }, "tools:Brushing");
    },
    renderOverlay: function(g) {
        if(this.lasso.length >= 3) {
            g.ivGuideLineWidth(2);
            g.beginPath();
            for(var i = 0; i < this.lasso.length; i++) {
                if(i == 0) g.moveTo(this.lasso[i].x, this.lasso[i].y);
                else g.lineTo(this.lasso[i].x, this.lasso[i].y);
            }
            g.closePath();
            g.strokeStyle = IV.colors.selection.toRGBA();
            g.fillStyle = IV.colors.selection.toRGBA(0.1);
            g.lineJoin = "round";
            g.fill();
            g.stroke();
        }
    },
    onInactive: function() {
        Tools.endTrackMouse("tools:Brushing");
    }
};

})();
