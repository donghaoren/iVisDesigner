//. iVisDesigner - File: scripts/core/core.js
//. Copyright 2013-2014 Donghao Ren
//. Peking University, University of California, Santa Barbara
//. See LICENSE.md for more information.

{{include: serializer.js}}
{{include: actionmanager.js}}

{{include: path.js}}
{{include: data.js}}
{{include: vis.js}}

{{include: objects/objects.js}}

{{include: render.js}}

// ------------------------------------------------------------------------
// Global Colors
// ------------------------------------------------------------------------
IV.colors = {
    selection: IV.parseColorHEX("1754AD"),
    guide: new IV.Color(0, 0, 0, 0.03)
};
