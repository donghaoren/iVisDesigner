{{include: serializer.js}}

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
