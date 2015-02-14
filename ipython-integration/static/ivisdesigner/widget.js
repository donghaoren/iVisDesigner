require(["widgets/js/widget"], function(WidgetManager){

    // Define the DatePickerView
    var ivView = IPython.DOMWidgetView.extend({
        render: function() {
            var self = this;
            // Create a label.
            this.$el.css("width", "100%");

            this.$iframe = $("<iframe />")
              .css({
                  "width": "100%",
                  "height": ($(window).height() - 200) + "px",
                  "resize": "both",
                  "border": "1px solid #AAA"
              })
              .attr("src", "https://donghaoren.org/ivisdesigner/toolkit.html?nested=true")
              .appendTo(this.$el);

            var self = this;

            this.$iframe.load(function() {
                self.sendDataset();
            });

            // this.$iframe.get(0).contentWindow = window.open("https://donghaoren.org/ivisdesigner/toolkit.html?nested=true");

            this.model.on('change:dataset', this.dataset_changed, this);
            this.model.on('change:visualization', this.visualization_changed, this);
            this.model.on('custom', this.custom, this);

            window.addEventListener("message", function(event) {
                if(event.source != self.$iframe.get(0).contentWindow) return;
                var message = JSON.parse(event.data);
                if(message.type == "visualization.get:response") {
                    self.model.set("visualization", JSON.stringify(message.visualization));
                    self.touch();
                }
            }, false);
        },
        on_msg: function(msg) {
            if(msg.type == "visualization.get") {
                this.$iframe.get(0).contentWindow.postMessage(JSON.stringify({
                    type: "visualization.get"
                }), "*");
            }
        },
        sendDataset: function() {
            var dataset = JSON.parse(this.model.get('dataset'));
            this.$iframe.get(0).contentWindow.postMessage(JSON.stringify({
                type: "dataset.set",
                data: dataset.data,
                schema: dataset.schema
            }), "*");
        },
        sendVisualization: function() {
            var visualization = JSON.parse(this.model.get('visualization'));
            if(visualization) {
                this.$iframe.get(0).contentWindow.postMessage(JSON.stringify({
                    type: "visualization.set",
                    visualization: visualization
                }), "*");
            } else {
                this.$iframe.get(0).contentWindow.postMessage(JSON.stringify({
                    type: "visualization.new"
                }), "*");
            }
        },
        dataset_changed: function() {
            this.sendDataset();
        },
        visualization_changed: function() {
            this.sendVisualization();
        }
    });
    // Register the ivView with the widget manager.
    WidgetManager.register_widget_view('ivView', ivView);
});
