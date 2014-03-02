//. iVisDesigner - File: scripts/interface/modal.js
//. Copyright 2013-2014 Donghao Ren
//. Peking University, University of California, Santa Barbara
//. See LICENSE.md for more information.

IV.modals = { };

IV.modals.constructModal = function(info) {
    var ctx = { };
    ctx.item = $("<div />").addClass("panel full-title");
    ctx.item.append(
      $("<div />").addClass("content-wrapper").append($("<div />").html(info.html))
    ).append(
      $("<div />").addClass("title-wrapper").append(
        $("<div />").addClass("title").text(info.title)
      ).append(
        '<div class="buttons">' +
          '<div class="button-close" title="Close"><i class="xicon-cross"></i></div>' +
        '</div>'
      )
    );
    $("#modal-container").append(ctx.item).show();

    ctx.item.width(info.width ? info.width : 600);
    ctx.item.height(info.height ? info.height : 400);
    ctx.item.css("left", ($(window).width() - ctx.item.width()) / 2);
    ctx.item.css("top", ($(window).height() - ctx.item.height()) / 2 * 0.7);

    ctx.item.find("[data-for]").each(function() {
        ctx[$(this).attr("data-for")] = $(this);
    });

    ctx.item.find(".button-close").click(function() {
        ctx.close();
    });

    ctx.status_working = function() {
        ctx.status.text("...");
    };
    ctx.status_error = function(text) {
        ctx.status.text(text);
    };

    ctx.close = function() {
        $("#modal-container").hide();
        ctx.item.remove();
    };
    return ctx;
};
