#!/usr/bin/python

# iVisDesigner
# Author: Donghao Ren, PKUVIS, Peking University, 2013.04
# See LICENSE.txt for copyright information.

from SwBuilder import *

import commands

IV_version = "0.10alpha"
IV_rev = commands.getoutput("git rev-parse --short HEAD")

Meta("version", IV_version)
Meta("revision", IV_rev.upper())

CSS("toolkit.css", ["styles/toolkit.less",
                    "styles/font-awesome.css",
                    "images/iconfont/ivfont.css"])

env.IconFont("images/iconfont/ivfont.css",
             FindFiles("*.svg", "images/iconfont"),
             name = "iVisDesignerIcons")


Javascript("libraries.js", [
    "libraries/jquery-2.0.3.js",
    "libraries/jquery.mousewheel.js",
    "libraries/js-yaml.js",
    "libraries/chroma.js",
    "libraries/numeric-1.2.6.js"
])

Javascript("toolkit.js", [
    "scripts/utils.js",
    "scripts/core/core.js",
    "scripts/interface/interface.js",
    "scripts/editor/editor.js",
    "scripts/toolkit.js"
])

Image("imgs/panel.png", "images/panel.png")
Image("imgs/corner.svg", "images/corner.svg")
Image("imgs/logo.svg", "images/logo.svg")

# All-in-one test data.
Binary("datasets/test.schema", "datasets/test.yaml");
Binary("datasets/test.data", "datasets/test.data.yaml");

HTML("toolkit.html", "html/toolkit.html")
HTML("credits.html", "CREDITS.md")
HTML("license.html", "LICENSE.md")

WriteDeployList("deploy_list")
