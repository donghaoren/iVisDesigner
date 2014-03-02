//. iVisDesigner - File: scripts/utils/formatting.js
//. Copyright 2013-2014 Donghao Ren
//. Peking University, University of California, Santa Barbara
//. See LICENSE.md for more information.

// Date.getString:
//   Date.getFullString()   Jan 17th, 2012 21:34
//   Date.getDayString()    Jan 17th, 2012
//   Date.getTimeString()   21:34

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
