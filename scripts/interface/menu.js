// scripts/menu.js
// The main menu scripts.

(function($) {

$(".menu > li").each(function() {
    var $this = $(this);
    var title = $this.children("span");
    var menu = $this.children("ul");
    var should_prevent = false;
    title.click(function(e) {
        if(menu.is(":visible")) {
            menu.hide();
            $this.removeClass("active");
        } else {
            menu.show();
            $this.addClass("active");
            should_prevent = $this;
        }
    });
    title.mouseenter(function(e) {
        if($(".menu > li").is(".active")) {
            $(".menu > li > ul").hide();
            $(".menu > li").removeClass("active");
            menu.show();
            $this.addClass("active");
        }
    });
    $(window).click(function() {
        if(should_prevent != $this) {
            menu.hide();
            $this.removeClass("active");
        }
        should_prevent = false;
    });
});

})(jQuery);
