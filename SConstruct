#!/usr/bin/python

# iVisDesigner
# Author: Donghao Ren
#   PKUVIS, Peking University, 2013.04-2013.09
#   FourEyes Lab, UC Santa Barbara, 2013.09-present
# See LICENSE.txt for copyright information.

from SwBuilder import *
import sys

sys.dont_write_bytecode = True

from version import IV_version, IV_rev

Meta("version", IV_version)
Meta("revision", IV_rev.upper())

CSS("toolkit.css", [
    "styles/toolkit.less",
    "styles/fontello.css",
    "images/iconfont/ivfont.css"
])

CSS("toolkit-black.css", [
    "styles/toolkit-black.less",
    "styles/fontello.css",
    "images/iconfont/ivfont.css"
])

env.IconFont("images/iconfont/ivfont.css",
             FindFiles("tools_*.svg", "images/iconfont"),
             name = "iVisDesignerIcons")


Javascript("libraries.js", [
    "libraries/jquery-2.0.3.js",
    "libraries/jquery-cookie.js",
    "libraries/jquery.mousewheel.js",
    "libraries/jquery.event.destroyed.js",
    "libraries/d3.v3.js",
    "libraries/js-yaml.js",
    "libraries/chroma.js",
    "libraries/numeric-1.2.6.js",
    "libraries/canvas2svg.js",
    "libraries/wampy-all.min.js"
])

YAML2DataJavascript("strings.js", [
    "scripts/strings/strings.yaml",
    "scripts/strings/templates.yaml"
], variable = "DATA_Strings")

env.Append(BUILDERS = { "PEGJS": Builder(action = "pegjs -e $export $SOURCES $TARGET") })

env.PEGJS("scripts/utils/parser.js.gen", "scripts/utils/parser.pegjs", export = "NS.expression.parser")

Javascript("toolkit.js", [
    "scripts/utils/utils.js",
    "scripts/core/core.js",
    "scripts/interface/interface.js",
    "scripts/editor/editor.js",
    "scripts/toolkit.js",
    "scripts/allosphere/allosphere.js",
    "scripts/test.js"
])

Javascript("embed.js", [
    "scripts/utils/utils.js",
    "scripts/core/core.js",
    "scripts/embed/embed.js"
])

Javascript("renderslave.js", [
    "scripts/node/wrappers.js",
    "scripts/utils/utils.js",
    "scripts/core/core.js",
    "scripts/node/renderslave.js"
])

Image("favicon-64.png", "images/favicon-64.png")
Image("favicon-512.png", "images/favicon-512.png")

# All-in-one test data.
Binary("datasets/test.schema", "datasets/test.yaml");
Binary("datasets/test.data", "datasets/test.data.yaml");

HTML("toolkit.html", "html/toolkit.html")
HTML("allosphere-slave.html", "html/allosphere-slave.html")
HTML("embed_test.html", "html/embed_test.html")
env.Markdown(".swtemp.deploy/credits.html", "CREDITS.md")
env.Markdown(".swtemp.deploy/license.html", "LICENSE.md")

WriteDeployList("deploy_list")
