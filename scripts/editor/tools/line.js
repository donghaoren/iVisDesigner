(function() {

Tools.Line = {
    onActive: function() {
        var $this = this;
        $this.loc1 = null;
        $this.loc2 = null;
        var sA = Editor.status.start()
            .add("Line: ")
            .append("A: [please select]");

        Tools.beginSelectLocation(function(loc) {
            if(!$this.loc1) {
                $this.loc1 = loc;
                sA.set("A: " + loc.type);
                Editor.status.append("B: [please select]");
                return;
            } else {
                $this.loc2 = loc;
                var path = Editor.get("selected-path");
                var line = new IV.objects.Line({
                    path: path,
                    point1: $this.loc1,
                    point2: $this.loc2
                });
                Editor.doAddObject(line);
                $this.loc1 = null;
                $this.loc2 = null;
                sA = Editor.status.start()
                    .add("Line: ")
                    .append("A: [please select]");
            }
        }, "tools:Line");
    },
    onInactive: function() {
        Tools.endSelectLocation("tools:Line");
    }
};

Tools.Bar = {
    onActive: function() {
        var $this = this;
        $this.loc1 = null;
        $this.loc2 = null;
        var sA = Editor.status.start()
            .add("Bar: ")
            .append("A: [please select]");

        Tools.beginSelectLocation(function(loc) {
            if(!$this.loc1) {
                $this.loc1 = loc;
                sA.set("A: " + loc.type);
                Editor.status.append("B: [please select]");
                return;
            } else {
                $this.loc2 = loc;
                var path = Editor.get("selected-path");
                var line = new IV.objects.Bar({
                    path: path,
                    point1: $this.loc1,
                    point2: $this.loc2,
                    width: new IV.objects.Plain(1)
                });
                Editor.doAddObject(line);
                $this.loc1 = null;
                $this.loc2 = null;
                sA = Editor.status.start()
                    .add("Bar: ")
                    .append("A: [please select]");
            }
        }, "tools:Bar");
    },
    onInactive: function() {
        Tools.endSelectLocation("tools:Bar");
    }
};


Tools.LineThrough = {
    onActive: function() {
        var $this = this;
        sA = Editor.status.start()
                .add("LinkThrough: ")
                .append("Points: [please select]");
        Tools.beginSelectLocation(function(loc) {
            var path = Editor.get("selected-path");
            if(true) {
                var line = new IV.objects.LineThrough({
                    path: path,
                    points: loc
                });
                Editor.doAddObject(line);
            }
        }, "tools:LineThrough");
    },
    onInactive: function() {
        Tools.endSelectLocation("tools:LineThrough");
    }
};

})();
