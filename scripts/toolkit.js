// Main Javascript file for the toolkit.

$("span[data-toggle]").each(function() {
    var id = $(this).attr("data-toggle");
    $(id).get(0).__toggle_selector = $(this);
    if($(id).is(":visible")) {
        $(this).addClass("toggle-on");
    } else {
        $(this).removeClass("toggle-on");
    }
    $(this).click(function() {
        $(id).toggle();
        $(this).toggleClass("toggle-on");
    });
});

$("#panel-scheme").IVPanel({ right: 10, top: 40, width: 200, height: 400 });
$("#panel-tools").IVPanel({ left: 10, top: 40, width: 100, height: 400 });

$("#system-loading").remove();
