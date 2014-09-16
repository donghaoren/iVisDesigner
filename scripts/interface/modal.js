// Copyright (c) 2014, The Regents of the University of California
// All rights reserved.
//
// Redistribution and use in source and binary forms, with or without modification,
// are permitted provided that the following conditions are met:
//
// 1. Redistributions of source code must retain the above copyright notice, this
//    list of conditions and the following disclaimer.
//
// 2. Redistributions in binary form must reproduce the above copyright notice,
//    this list of conditions and the following disclaimer in the documentation
//    and/or other materials provided with the distribution.
//
// 3. Neither the name of the copyright holder nor the names of its contributors
//    may be used to endorse or promote products derived from this software without
//    specific prior written permission.
//
// THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
// ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
// WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED.
// IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT,
// INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING,
// BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
// DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
// LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE
// OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED
// OF THE POSSIBILITY OF SUCH DAMAGE.

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
