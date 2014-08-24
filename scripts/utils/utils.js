//. iVisDesigner - File: scripts/utils/utils.js
//. Copyright 2013-2014 Donghao Ren
//. University of California, Santa Barbara, Peking University
//. See LICENSE.md for more information.

// scripts/utils.js
// A framework for our application.

var IV = (function() {
// The namespace to output.
var NS = { };

// Are we running in a browser?
NS.isBrowser = (typeof(document) != "undefined");
NS.isNodejs = !NS.isBrowser;

// ======== Utility Functions ========

{{include: uuid.js}}

{{include: formatting.js}}
{{include: sha1.js}}

{{include: functional.js}}

{{include: packing.js}}

{{include: events.js}}
{{include: binds.js}}

{{include: template.js}}
{{include: i18n.js}}

{{include: colors.js}}
{{include: math.js}}

{{include: expression.js}}

{{include: misc.js}}

{{include: autoalign.js}}

{{include: storage.js}}
{{include: oop.js}}

return NS;

})(); // main nested function.
