// iVisDesigner - scripts/utils/formatting.js
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

(function(){
    var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    var num_pad = function(s) {
        var j = s.toString();
        while(j.length < 2) j = '0' + j;
        return j;
    };
    // add th,nd,rd to small integers. example: 23 to 23rd.
    var addth = function(day) {
        if(day % 100 == 11 || day % 100 == 12 || day % 100 == 13) return day + "th";
        if(day % 10 == 1) return day + "st";
        if(day % 10 == 2) return day + "nd";
        if(day % 10 == 3) return day + "rd";
        return day + "th";

    };
    Date.prototype.getFullString = function() {
        return months[this.getMonth()] + " " +
               addth(this.getDate()) + ", " +
               this.getFullYear() + " " +
               num_pad(this.getHours()) + ":" +
               num_pad(this.getMinutes());
    };
    Date.prototype.getDayString = function() {
        return months[this.getMonth()] + " " + addth(this.getDate()) + ", " + this.getFullYear();
    };
    Date.prototype.getTimeString = function() {
        return num_pad(this.getHours()) + ":" + num_pad(this.getMinutes());
    };
    //Array.prototype.end = function() {
    //  if (this.length <= 0) return;
    //  return this[this.length-1];
    //}
})();

NS.parseCSV = function(string) {
    var lines = string.replace("\r", "").split("\n");
    var filtered_lines = [];
    for(var i = 0; i < lines.length; i++) {
        lines[i] = lines[i].trim();
        if(lines[i].length > 0) filtered_lines.push(lines[i]);
    }
    var parse_line = function(l) {
        var r = l.split(",").map(function(x) {
            return x.trim();
        });;
        return r;
    };
    var data = filtered_lines.slice(1).map(parse_line);
    var head = parse_line(filtered_lines[0]);
    return {
        data: data,
        head: head
    };
};
