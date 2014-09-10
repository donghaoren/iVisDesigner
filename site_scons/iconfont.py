# Static Website Builder
# A simple and lightweight static website building script based on SCons.
# Author: Donghao Ren
#
# Copyright (C) 2012-2014, Donghao Ren
# All rights reserved.
#
# Redistribution and use in source and binary forms, with or without
# modification, are permitted provided that the following conditions are met:
#
#     * Redistributions of source code must retain the above copyright
#       notice, this list of conditions and the following disclaimer.
#
#     * Redistributions in binary form must reproduce the above copyright
#       notice, this list of conditions and the following disclaimer in the
#       documentation and/or other materials provided with the distribution.
#
#     * The name of Donghao Ren may not be used to endorse or promote products
#       derived from this software without specific prior written permission.
#
# THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
# ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
# WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
# DISCLAIMED. IN NO EVENT SHALL DONGHAO REN BE LIABLE FOR ANY
# DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
# (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
# LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
# ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
# (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
# SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

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

    f_css = open(target, "w")
    f_css.write(css.encode("utf-8"))
    f_css.close()
    for key in mapping:
        mapping[key] = unichr(mapping[key])
    f_js = open(target + ".js", "w")
    f_js.write(("FONT_" + name + " = " + json.dumps(mapping) + ";").encode("utf-8"))
    f_js.close()
