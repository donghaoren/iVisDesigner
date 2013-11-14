// scripts/panels/style.js
// Implements the style panel.

(function() {
    var $panel = $("#panel-style-container");

    var handlers = [];

    // Bindings for the controls.
    $panel.find("[data-bind]").each(function() {
        $this = $(this);
        var data = $this.data();
        var bind = $this.attr("data-bind");
        handlers.push(function(style) {
            if(data.set) data.set(style.fields[bind]);
        });
        data.changed = function(value) {
            IV.panels.style._set(bind, value);
        };
    });

    var currentStyle = { };

    IV.panels.style = {
        listener: function() { },
        loadStyle: function(style) {
            if(style.type == "Plain") {
                currentStyle = new IV.objects.Composite(style.obj, true);
            } else {
                currentStyle = style.clone();
            }
            handlers.forEach(function(f) {
                f(currentStyle);
            });
        },
        getStyle: function() {
            return currentStyle.clone();
        },
        createStyle: function() {
            return this.getStyle();
        },
        // This is to be called by the controls.
        _set: function(key, value) {
            currentStyle.fields[key] = value;
            this.listener(currentStyle);
        },
        setListener: function(f) {
            this.listener = f;
        }
    };

    IV.panels.style.loadStyle(new IV.objects.Plain({
        fill_style: new IV.Color(0, 0, 0, 1),
        stroke_style: new IV.Color(0, 0, 0, 1),
        width: 1,
        radius: 1,
        line_cap: "round",
        line_cap: "round"
    }));
})();
