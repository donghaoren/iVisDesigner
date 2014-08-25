// iVisDesigner - File: scripts/editor/tools/line.js
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

Tools.Arc = {
    onActive: function() {
        var $this = this;
        $this.loc1 = null;
        $this.loc2 = null;
        var sA = Editor.status.start()
            .add("Arc: ")
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
                var arc = new IV.objects.Arc({
                    path: path,
                    point1: $this.loc1,
                    point2: $this.loc2,
                    radius: new IV.objects.Plain(0.75)
                });
                Editor.doAddObject(arc);
                $this.loc1 = null;
                $this.loc2 = null;
                sA = Editor.status.start()
                    .add("Arc: ")
                    .append("A: [please select]");
            }
        }, "tools:Arc");
    },
    onInactive: function() {
        Tools.endSelectLocation("tools:Arc");
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

Tools.Polyline = {
    onActive: function() {
        var $this = this;
        if($this.locs && $this.locs.length >= 2) {
            var path = Editor.get("selected-path");
            var line = new IV.objects.Polyline({
                path: path,
                points: $this.locs
            });
            Editor.doAddObject(line);
            $this.locs = [];
            sA = Editor.status.start()
                .add("Polyline: ")
                .append("1: [please select]");
        }
        $this.locs = [];
        var sA = Editor.status.start()
            .add("Polyline: ")
            .append("1: [please select]");

        Tools.beginSelectLocation(function(loc) {
            if(loc) {
                $this.locs.push(loc);
                sA.set($this.locs.length + ": " + loc.type);
                sA = Editor.status.append(($this.locs.length + 1) + ": [please select]");
            }
        }, "tools:Polyline");
    },
    onInactive: function() {
        Tools.endSelectLocation("tools:Polyline");
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
