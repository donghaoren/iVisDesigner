(function() {

IV.tools.Line = {
    onActive: function() {
        var $this = this;
        $this.loc1 = null;
        $this.loc2 = null;
        IV.set("status", "Line: Select point A.");
        IV.tools.beginSelectLocation(function(loc) {
            if(!$this.loc1) {
                $this.loc1 = loc;
                IV.set("status", "Line: Select point B.");
                return;
            } else {
                $this.loc2 = loc;
                var path = IV.get("selected-path");
                var line = new IV.objects.Line(path, {
                    point1: $this.loc1,
                    point2: $this.loc2,
                    style: IV.panels.style.createStyle()
                });
                IV.vis.addObject(line);
                $this.loc1 = null;
                $this.loc2 = null;
                IV.set("status", "Line: Select point A.");
            }
        }, "tools:Line");
    },
    onInactive: function() {
        IV.tools.endSelectLocation("tools:Line");
    }
};

IV.tools.LineThrough = {
    onActive: function() {
        var $this = this;
        IV.set("status", "LineThrough: Select location of anchors.");
        IV.tools.beginSelectLocation(function(loc) {
            var path = IV.get("selected-path");
            if(IV.data.getSchema(path)) {
                var line = new IV.objects.LineThrough(path, {
                    points: loc,
                    style: IV.panels.style.createStyle()
                });
                IV.vis.addObject(line);
                IV.raise("vis:objects");
                IV.triggerRender("main");
            }
        }, "tools:LineThrough");
    },
    onInactive: function() {
        IV.tools.endSelectLocation("tools:LineThrough");
    }
};

})();
