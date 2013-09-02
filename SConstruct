#!/usr/bin/python

# iVisDesigner
# Author: Donghao Ren, PKUVIS, Peking University, 2013.04
# See LICENSE.txt for copyright information.

import SwBuilder.initialize
execfile(SwBuilder.initialize.execpath)

execfile("version.py")

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
    "libraries/chroma.js"
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

Binary("datasets/cardata.schema", "datasets/cardata.yaml");
Binary("datasets/cardata.data", "datasets/cardata.data.yaml");
Binary("datasets/temperature.schema", "datasets/temperature.yaml");
Binary("datasets/temperature.data", "datasets/temperature.data.yaml");
Binary("datasets/bjairdata.schema", "datasets/bjairdata.yaml");
Binary("datasets/bjairdata.data", "datasets/bjairdata.data.yaml");
Binary("datasets/graph.schema", "datasets/graph.yaml");
Binary("datasets/graph.data", "datasets/graph.data.yaml");

HTML("toolkit.html", "html/toolkit.html")
HTML("credits.html", "CREDITS.md")
HTML("license.html", "LICENSE.md")

WriteDeployList("deploy_list")
