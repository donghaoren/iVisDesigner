import fontforge
import os
import base64
import json

def CreateIconFont(name, files, target):
    font = fontforge.font()

    font.fontname = name
    font.fullname = name
    font.familyname = name

    char = 0xE000

    mapping = { }

    for svg in files:
        if os.path.splitext(svg)[1] == ".svg":
            key = os.path.splitext(os.path.basename(svg))[0].replace("_", "-")
            mapping[key] = char
            #print "%04x - %s" % (char, key)
            glyph = font.createChar(char)
            glyph.importOutlines(svg)
            # Rest on the baseline.
            s = 1.4
            bbox = glyph.boundingBox()

            lb = glyph.left_side_bearing
            rb = glyph.right_side_bearing

            glyph.transform([s, 0, 0, s, 0, -100])
            # Set side bearings.
            #print glyph.left_side_bearing, glyph.right_side_bearing
            glyph.right_side_bearing = (1000 + rb) * s
            glyph.left_side_bearing = lb * s
            #glyph.right_side_bearing *= s
            #glyph.left_side_bearing *= s
            #print glyph.left_side_bearing, glyph.right_side_bearing
            char += 1

    font.generate(target + ".temp.ttf")

    face = """
    @font-face {
      font-family: '%s';
      src: url('data:application/octet-stream;base64,%s') format('truetype');
      font-weight: normal;
      font-style: normal;
    }
    """ % (name, base64.b64encode(open(target + ".temp.ttf").read()))

    os.unlink(target + ".temp.ttf")

    css = face + "\n".join([
     """
     .xicon-%s:before {
        font-family: "%s";
        content: "\\%04x";
        font-style: normal;
        font-weight: normal;
        text-decoration: inherit;
        -webkit-font-smoothing: antialiased;

        /* sprites.less reset */
        display: inline;
        width: auto;
        height: auto;
        line-height: normal;
        vertical-align: baseline;
        margin-top: 0;
     }
     """ % (
        key, name, mapping[key]
     )
     for key in mapping
    ]) + "\n"

    open(target, "w").write(css.encode("utf-8"))
    for key in mapping:
        mapping[key] = unichr(mapping[key])
    open(target + ".js", "w").write(("FONT_" + name + " = " + json.dumps(mapping) + ";").encode("utf-8"))
