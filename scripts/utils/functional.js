//. iVisDesigner - File: scripts/utils/functional.js
//. Copyright 2013-2014 Donghao Ren
//. Peking University, University of California, Santa Barbara
//. See LICENSE.md for more information.

// Timing functions.
//   waitUntil(condition, on_finished, interval, timeout)
//     wait until condition() == true, call on_finished(true/false).
//     interval and timeout in milliseconds, default interval = 100, timeout = inf.
//   tryRetry(f, on_finished, max_count)
//     try f(callback), if callback(null, result) is called, pass them to on_finished.
//     otherwise, retry f(callback), until success or max_count reached.
//     when failed, on_finished(last_error) is called.

NS.waitUntil = function(condition, on_finished, interval, timeout) {
    if(!timeout) timeout = 1e100;
    var time_started = new Date().getTime();
    var timer = setInterval(function() {
        if(condition()) {
            clearInterval(timer);
            if(on_finished) on_finished(true);
        }
        if(new Date().getTime() - time_started > timeout) {
            clearInterval(timer);
            if(on_finished) on_finished(false);
        }
    }, interval ? interval : 100);
};


NS.tryRetry = function(f, on_finished, max_count) {
    var tried = 0;
    var try_once = function() {
        f(function(error, result) {
            if(error) {
                tried++;
                if(tried == max_count) {
                    on_finished(error);
                } else {
                    try_once();
                }
            } else {
                on_finished(null, result);
            }
        });
    };
    try_once();
};
