// iVisDesigner - scripts/node/allobackground.js
// Author: Donghao Ren
//
// LICENSE
//
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

$(".anchor-file").each(function() {
    $(this).click(function() {
        $("#input-path").val($(this).attr("data-path"));
        $("#input-stereo-mode").val($(this).attr("data-stereo-mode"));
        return false;
    });
});

(function() {
    var url = IV_Config.api_base + "/ws/";
    if(url.substr(0, 4) == 'http') {
        url = IV_Config.api_base.replace(/^http/, "ws");
    } else {
        url = window.location.protocol.replace(/^http/, "ws") + "//" + window.location.host + IV_Config.api_base + "ws/";
    }
    if(IV_Config.url_websocket) url = IV_Config.url_websocket;
    var ws = new Wampy(url, { realm: "anonymous" });

    ws.subscribe("iv.allosphere.message", function(message) {
        var content = JSON.parse(message);
        onMessage(content);
    });

    if(!IV.allosphere) IV.allosphere = { };

    IV.allosphere.postMessage = function(data) {
        ws.publish("iv.allosphere.message", JSON.stringify(data));
    };
})();


$("#btn-show-image").click(function() {
    IV.allosphere.postMessage({
        type: "panorama.load",
        filename: $("#input-path").val(),
        stereo_mode: $("#input-stereo-mode").val()
    });
});

$("#btn-load-video").click(function() {
    if(video_timer) {
        clearInterval(video_timer);
        video_timer = null;
    }
    IV.allosphere.postMessage({
        type: "panorama.video.load",
        filename: $("#input-path").val(),
        stereo_mode: $("#input-stereo-mode").val()
    });
    IV.allosphere.postMessage({
        type: "panorama.video.next",
        filename: $("#input-path").val(),
        stereo_mode: $("#input-stereo-mode").val()
    });
});

$("#btn-next-frame").click(function() {
    IV.allosphere.postMessage({
        type: "panorama.video.next"
    });
});

var video_timer = null;

$("#btn-play-video").click(function() {
    if(video_timer) {
        clearInterval(video_timer);
        video_timer = null;
    }
    video_timer = setInterval(function() {
        IV.allosphere.postMessage({
            type: "panorama.video.next"
        });
    }, 1000.0 / parseFloat($("#input-framerate").val()));
});

$("#btn-stop-video").click(function() {
    if(video_timer) {
        clearInterval(video_timer);
        video_timer = null;
    }
});

$("#btn-seek-video").click(function() {
    if(video_timer) {
        clearInterval(video_timer);
        video_timer = null;
    }
    IV.allosphere.postMessage({
        type: "panorama.video.seek",
        timestamp: parseFloat($("#input-timestamp").val())
    });
    IV.allosphere.postMessage({
        type: "panorama.video.next",
        filename: $("#input-path").val(),
        stereo_mode: $("#input-stereo-mode").val()
    });
});

var rotation_timer = null;
var rotation_angle = 0;
function do_rotation(speed) {
    // Rotation with Z.
    if(rotation_timer) clearInterval(rotation_timer);
    var angle0 = rotation_angle;
    var t0 = new Date().getTime();
    rotation_timer = setInterval(function() {
        var t = new Date().getTime() - t0;
        t /= 1000;
        rotation_angle = angle0 + t * speed;
        IV.allosphere.postMessage({
            type: "pose.set_rotation_z",
            angle: rotation_angle
        });
    }, 30);
}

function stop_rotation(speed) {
    if(rotation_timer) clearInterval(rotation_timer);
}

document.body.addEventListener('touchmove', function(event) {
    event.preventDefault();
}, false);
