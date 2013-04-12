(function($) {
  $.fn.IVPanel = function(params) {

    var container = $(
        '<div class="title-wrapper">' +
            '<span class="title">' + this.attr("data-title") + '</span>' +
            '<span class="buttons">' +
                '<span class="button-close"><img src="imgs/cross.svg" ondragstart="return false;" /></span>' +
            '</span>' +
        '</div>' +
        '<div class="content-wrapper"></div>' +
        '<div class="resize"></div>'
    );
    $(container[1]).append(this.children());
    this.append(container);

    var $this = this;

    if(params.width) {
        $(this).css("width", params.width + "px");
    }
    if(params.height) {
        $(this).css("height", params.height + "px");
    }
    if(params.top) {
        $(this).css("top", params.top + "px");
    }
    if(params.left) {
        $(this).css("left", params.left + "px");
    }
    if(params.right) {
        $(this).css("left", $(window).width() - params.right - $this.width() + "px");
    }
    if(params.bottom) {
        $(this).css("top", $(window).height() - params.bottom - $this.height() + "px");
    }

    var title_wrapper = this.children(".title-wrapper");
    var resize_button = this.children(".resize");

    title_wrapper.children(".buttons").children(".button-close").click(function() {
        $this.hide();
        if($this.get(0).__toggle_selector)
            $this.get(0).__toggle_selector.removeClass("toggle-on");
    });

    var mouse_state = null;

    title_wrapper.mousedown(function(e) {
        mouse_state = [
            "move",
            e.pageX, e.pageY,
            parseFloat($this.css("left").replace("px", "")),
            parseFloat($this.css("top").replace("px", ""))
        ];
    });
    resize_button.mousedown(function(e) {
        mouse_state = [
            "resize",
            e.pageX, e.pageY,
            $this.width(),
            $this.height()
        ];
    });
    $(window).mousemove(function(e) {
        if(mouse_state && mouse_state[0] == "move") {
            var nx = e.pageX - mouse_state[1] + mouse_state[3];
            var ny = e.pageY - mouse_state[2] + mouse_state[4];
            if(ny < 30) ny = 30;
            $this.css("left", nx + "px");
            $this.css("top", ny + "px");
        }
        if(mouse_state && mouse_state[0] == "resize") {
            var nx = e.pageX - mouse_state[1] + mouse_state[3];
            var ny = e.pageY - mouse_state[2] + mouse_state[4];
            if(nx < 50) nx = 50;
            if(ny < 100) ny = 100;
            $this.css("width", nx + "px");
            $this.css("height", ny + "px");
        }
    });
    $(window).mouseup(function(e) {
        mouse_state = null;
    });
  };
})(jQuery);
