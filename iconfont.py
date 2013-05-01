import fontforge
import os
import base64

def CreateIconFont(name, files, target):
    font = fontforge.font()

    font.fontname = name
    font.fullname = name
    font.familyname = name

    char = 0xF001

    mapping = { }

    for svg in files:
        if os.path.splitext(svg)[1] == ".svg":
            key = os.path.splitext(os.path.basename(svg))[0].replace("_", "-")
            mapping[key] = char
            print "%04x - %s" % (char, key)
            glyph = font.createChar(char)
            glyph.importOutlines(svg)
            # Rest on the baseline.
            bbox = glyph.boundingBox()
            glyph.transform([1, 0, 0, 1, 0, 200])
            # Set side bearings.
            glyph.left_side_bearing = bbox[0]
            glyph.right_side_bearing = 1000 - bbox[2]
            char += 1

    font.generate(target + ".temp.ttf")

    face = """
    @font-face {
      font-family: '%s';
      src: url('data:application/ttf;base64,%s') format('truetype');
      font-weight: normal;
      font-style: normal;
    }
    """ % (name, base64.b64encode(open(target + ".temp.ttf").read()))

    os.unlink(target + ".temp.ttf")

    css = face + "\n".join([
     """
     .xicon-%s:before {
        font-family: "%s";
        content: "\\%4x";
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
