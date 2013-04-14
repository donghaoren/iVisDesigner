// iVisDesigner
// Author: Donghao Ren, PKUVIS, Peking University, 2013.04
// See LICENSE.txt for copyright information.

// menu.js
// The main menu scripts.

(function($) {

$(".menu > li").each(function() {
    var $this = $(this);
    var title = $this.children("span");
    var menu = $this.children("ul");
    var should_prevent = false;
    title.click(function(e) {
        menu.show();
        $this.addClass("active");
        should_prevent = $this;
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
