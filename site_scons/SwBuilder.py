#!/usr/bin/python

# Static Website Builder
# A simple and lightweight static website building script based on SCons.
# Author: Donghao Ren
#
# Copyright (C) 2012 Donghao Ren
#
# This program is free software: you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.
#
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU General Public License for more details.
#
# You should have received a copy of the GNU General Public License
#  along with this program.  If not, see <http://www.gnu.org/licenses/>.

# Dependencies:
#  pystache
#  pytz
#  PIL
#  uglifyjs
#  cleancss
from SCons.Script import *

import re
import os
import hashlib
import subprocess
import json
import yaml
import pystache
import pytz
import copy

from hashlib import sha256
from hashlib import sha1
from datetime import datetime
from shutil import copyfile
import base64

# Minify JS and CSS or not.
option_minify = ARGUMENTS.get('minify', 'true')
option_striphtml = ARGUMENTS.get('striphtml', 'true')
option_display_timezone = "Asia/Shanghai"
option_time_format = "%b %d, %Y, %I:%M %p, %Z"
option_markdown = "multimarkdown"

# Current time.
build_time = pytz.timezone("UTC").localize(datetime.utcnow()).astimezone(pytz.timezone(option_display_timezone))

# Global Meta strings, can be used in files with syntax {{key}}
# Only 0-9a-zA-Z and -, _, . are allowed for key.
meta_strings = {
    'build_time'     : build_time.strftime(option_time_format),
    'build_time_iso' : build_time.isoformat()
}

# Global variables.
output_directory = "deploy"
temporary_directory = "temp"

this_directory_ = os.path.relpath(".", str(Dir("#")))
if this_directory_ != "." and this_directory_ != "":
    this_directory = this_directory_

if not os.path.exists(temporary_directory):
    os.makedirs(temporary_directory)

if not os.path.exists(output_directory):
    os.makedirs(output_directory)

# Delimiters
delim_L = "{{"
delim_R = "}}"

def Delimiter(L, R):
    global delim_L
    global delim_R
    global regex_partial, regex_include, regex_js, regex_css, regex_ref, regex_active, regex_meta
    global regex_base64
    global regex_mustache, regex_mustache_render, regex_mustache_render_first
    global regex_mustache_local
    global regex_mustache_render_yaml_include
    global regex_hash

    global regex_math

    global regex_yaml_info, regex_yaml_info_htcomment

    global regex_lessimport

    # Set
    delim_L = L
    delim_R = R

    reg_L = re.escape(delim_L)
    reg_R = re.escape(delim_R)

    htcomment_start = re.escape("<!--")
    htcomment_end = re.escape("-->")

    regex_partial = re.compile(reg_L + r' *partial: *([0-9a-zA-Z\-\_\.]+) *' + reg_R)
    regex_include = re.compile(reg_L + r' *include: *([0-9a-zA-Z\-\_\.\/]+) *' + reg_R)
    regex_base64 = re.compile(reg_L + r' *base64: *([0-9a-zA-Z\-\_\.\/]+) *' + reg_R)

    regex_js = re.compile(reg_L + r" *js: *([0-9a-zA-Z\-\_\.\,\/]+) *" + reg_R)
    regex_css = re.compile(reg_L + r" *css: *([0-9a-zA-Z\-\_\.\,\/]+) *" + reg_R)
    regex_ref = re.compile(reg_L + r" *ref: *([0-9a-zA-Z\-\_\.\,\/]+) *" + reg_R)
    regex_hash = re.compile(reg_L + r" *hash: *([0-9a-zA-Z\-\_\.\,\/]+) *" + reg_R)

    regex_active = re.compile(reg_L + r" *(active|current|active-this|current-this): *([0-9a-zA-Z\-\_\.\,\/]+) *" + reg_R)
    regex_meta = re.compile(reg_L + r" *([0-9a-zA-Z\_\-\.]+) *" + reg_R)

    regex_mustache = re.compile(htcomment_start + r"[\-]* *mustache +([0-9a-zA-Z\-\_\.]+) *\{ *"
                                + r"(.*?)"
                                + r" *\} *[\-]*" + htcomment_end, re.DOTALL)

    regex_mustache_render = re.compile(htcomment_start + r"[\-]* (?:mustache\-render|render) +([0-9a-zA-Z\-\_\.]+) *\{ *"
                                + r"(.*?)"
                                + r" *\} *[\-]*" + htcomment_end, re.DOTALL)

    regex_mustache_local = re.compile(htcomment_start + r"[\-]* *mustache\-local *\{ *"
                                + r"(.*?)"
                                + r" *\} *[\-]*" + htcomment_end, re.DOTALL)

    regex_mustache_render_first = re.compile(htcomment_start + r" *mustache\-render +([0-9a-zA-Z\-\_\.]+) *\{ *")
    regex_mustache_render_yaml_include = re.compile(reg_L + r" *yaml-include *: *([0-9a-zA-Z\ \_\-\.\=\,]+)" + reg_R)

    regex_yaml_info = re.compile(r"(\#\|\-{4}\-+)"
                               + r"(.*?)"
                               + r"\1", re.DOTALL)
    regex_yaml_info_htcomment = re.compile(r"(\<\!\-\-[\-]*\{)"
                               + r"(.*?)"
                               + r"\}\-\-[\-]*\>", re.DOTALL)

    regex_math = re.compile(htcomment_start + r" *(math|lmath|latex)\: *(.*?)" + htcomment_end, re.DOTALL)

    regex_lessimport = re.compile(r'\@import +\"([0-9a-zA-Z\.\-\_\/]+\.less)\"')

def mustache_render(templ, obj):
    parsed = pystache.parse(ensure_unicode(templ, "utf-8"), delimiters = (u"[[", u"]]"))
    return pystache.render(parsed, obj)

# Ensure that the text read from a file is in unicode.
def ensure_unicode(text, encoding):
    try:
      return unicode(text, encoding)
    except TypeError:
      return text

Delimiter("{{", "}}")

# Resolve include files.
# soruce: scons file object.
def resolve_includes(source):
    global regex_include
    data = ensure_unicode(source.get_text_contents(), 'utf-8')
    sdir = os.path.dirname(str(source))
    data = regex_include.sub(lambda m: resolve_includes(File(os.path.join(sdir, m.group(1)))), data)
    def b64_encode_file(f):
        c = open(f, "r").read()
        return base64.b64encode(c)
    data = regex_base64.sub(lambda m: b64_encode_file(os.path.join(sdir, m.group(1))), data)
    return data

def include_build_function(target, source, env, minify = '', mustache = 0):
    data = ""
    for s in source:
        data += resolve_includes(s)

    for t in target:
        fn = str(t)
        if minify == 'js':
            # Here we use a file because weird behaviour while using pipes.
            # uglifyjs complain that it received an unexpected EOF from the input
            # stream, which seems truncated during.
            f_temp = open(fn + ".temp", "wb");
            f_temp.write(data.encode('utf-8'))
            f_temp.close()

            cmd = ["uglifyjs", "--comments", "-m", "-o", fn, fn + ".temp"]
            cmd = " ".join([ '"' + x.replace('"', '\\"') + '"' for x in cmd ])
            p = subprocess.Popen(cmd, shell = True)
            r = p.wait()

            os.unlink(fn + ".temp")
            if r != 0:
                return Exception("Failed to build %s" % fn)
        elif minify == 'css':
            f_temp = open(fn + ".temp", "wb");
            f_temp.write(data.encode('utf-8'))
            f_temp.close()

            cmd = ["cleancss", "-o", fn, fn + ".temp"]
            cmd = " ".join([ '"' + x.replace('"', '\\"') + '"' for x in cmd ])
            p = subprocess.Popen(cmd, shell = True)
            r = p.wait()

            os.unlink(fn + ".temp")
            if r != 0:
                return Exception("Failed to build %s" % fn)
        else:
            if mustache:
                mustache_templates = { };

                def yaml_include_f(m):
                    k = m.group(1).split(" ")
                    fn = k[0]
                    key = k[1]
                    obj = yaml.load(read_yaml_file(fn))
                    if len(k) == 3:
                        filter_def = k[2]
                        obj = filter(lambda o: list([ o[kv.split("=")[0]] == kv.split("=")[1] for kv in filter_def.split(",") ]).count(True) >= 1, obj)
                    dict = { };
                    dict[key] = obj
                    return yaml.dump(dict);

                data = regex_mustache_render_yaml_include.sub(lambda m: yaml_include_f(m), data)

                def mustache_renderf(m):
                    if m.group(1) in mustache_templates:
                        templ = mustache_templates[m.group(1)]
                    else:
                        templ = m.group(1).split(".")
                        mustache = read_mustache_file(templ[0])
                        def mustache_subf(m):
                            mustache_templates[templ[0] + "." + m.group(1)] = m.group(2)
                            return ""
                        regex_mustache.sub(lambda m: mustache_subf(m), mustache)
                        templ = mustache_templates[m.group(1)]
                    obj = yaml.load(m.group(2))
                    return mustache_render(templ, obj)
                data = regex_mustache_render.sub(lambda m: mustache_renderf(m), data);
            f = open(str(fn), 'w')
            f.write(data.encode('utf-8'))
            f.close()
    return None

def inc_build_function(target, source, env):
    return include_build_function(target, source, env)

def inc_build_function_mustache(target, source, env):
    return include_build_function(target, source, env, mustache = 1)

def js_build_function(target, source, env):
    return include_build_function(target, source, env, minify = 'js')

def css_build_function(target, source, env):
    return include_build_function(target, source, env, minify = 'css')

# JS and CSS builder.
if option_minify == 'true':
    js_builder = Builder(action = js_build_function)
    css_builder = Builder(action = css_build_function)
else:
    js_builder = Builder(action = inc_build_function)
    css_builder = Builder(action = inc_build_function)

include_builder = Builder(action = inc_build_function_mustache)

# Markdown builder.
markdown_builder = Builder(action = 'cat $SOURCES | ' + option_markdown + ' > $TARGET')

# BibTex2JSON builder.
BibTex2YAML_builder = Builder(action = 'python bibtex2yaml.py $SOURCES > $TARGET')

lesscss_builder = Builder(action = 'lessc $SOURCES > $TARGET')

def lesscss_scanner(node, env, path, parents = []):
    global regex_lessimport
    files = [];
    text = ensure_unicode(node.get_text_contents(), 'utf-8')
    path = os.path.dirname(node.rstr())
    if path == "":
        path = "."
    result = regex_lessimport.findall(text)
    for inc in result:
        if inc in parents:
            raise Exception("Circular includes on '%s'." % str(node))
        files.append(path + "/" + inc)
    r = env.File(files);
    for inc in result:
        r += lesscss_scanner(File(path + "/" + inc), env, path, parents + [inc])
    return r

# Copy builder, just copy files.
copy_builder = Builder(action = 'cp $SOURCE $TARGET')

# Concat builder, concat source files to target files, a line-break is
# inserted between files.
def concat_build_function(target, source, env):
    data = "";
    for s in source:
        data += ensure_unicode(s.get_text_contents(), 'utf-8') + u"\n"

    for t in target:
        f = open(str(t), 'w')
        f.write(data.encode('utf-8'))
        f.close()
    return None

concat_builder = Builder(action = concat_build_function)

# YAML to JSON builder
def yaml2json_build_function(target, source, env):
    data = "";
    for s in source:
        data += ensure_unicode(s.get_text_contents(), 'utf-8') + u"\n"

    obj = yaml.load(data)

    data = json.dumps(obj)

    for t in target:
        f = open(str(t), 'w')
        f.write(data.encode('utf-8'))
        f.close()
    return None

yaml2json_builder = Builder(action = yaml2json_build_function)

# YAML to Data Javascript builder
def yaml2datajs_build_function(target, source, env):
    data = "";
    for s in source:
        data += ensure_unicode(s.get_text_contents(), 'utf-8') + u"\n"

    obj = yaml.load(data)

    data = env['variable'] + " = " + json.dumps(obj) + ";"

    for t in target:
        f = open(str(t), 'w')
        f.write(data.encode('utf-8'))
        f.close()
    return None

yaml2datajs_builder = Builder(action = yaml2datajs_build_function)

# Scan for partials, make them dependencies.
def partial_scanner(node, env, path):
    files = [];
    text = ensure_unicode(node.get_text_contents(), 'utf-8')
    result = regex_partial.findall(text)
    for partial in result:
        files.append(get_partial_path(partial))
    return env.File(files);

# Scan for mustaches, make them dependencies.
def mustache_scanner(node, env, path):
    files = [];
    text = ensure_unicode(node.get_text_contents(), 'utf-8')
    result = regex_mustache_render_first.findall(text)
    for mustache in result:
        files.append(get_mustache_path(mustache.split(".")[0]))
    result = regex_mustache_render_yaml_include.findall(text)
    for yaml in result:
        files.append(get_yaml_path(yaml.split(" ")[0]))
    return env.File(files);

# Include scanner, scan for included files.
def include_scanner(node, env, path, parents = []):
    files = [];
    text = ensure_unicode(node.get_text_contents(), 'utf-8')
    path = os.path.dirname(node.rstr())
    if path == "":
        path = "."
    result = regex_include.findall(text) + regex_base64.findall(text)
    for inc in result:
        if inc in parents:
            raise Exception("Circular includes on '%s'." % str(node))
        files.append(path + "/" + inc)
    r = env.File(files);
    for inc in result:
        if os.path.splitext(inc)[1].lower()[1:] in set([
            "html", "js", "css", "less", "md"
        ]): r += include_scanner(File(path + "/" + inc), env, path, parents + [inc])
    return r

# Substitute builder, Template + Partials + HTML = Output Page.
def substitute_build_function(target, source, env):
    global regex_hash

    template = ensure_unicode(source[1].get_text_contents(), 'utf-8');
    content = ensure_unicode(source[0].get_text_contents(), 'utf-8');
    template = template.replace(delim_L + "content" + delim_R, content);

    def read_temp_hash_file(f):
        path = temporary_directory + "/" + f
        tf = open(path, 'r')
        data = tf.read().strip()
        tf.close()
        return data

    template = regex_hash.sub(lambda m: "{{hash: " + read_temp_hash_file(m.group(1)) + "}}", template)
    for t in target:
        f = open(str(t), 'w')
        f.write(template.encode('utf-8'))
        f.close()
    return None

substitute_builder = Builder(action = substitute_build_function)

def strip_html(path):
    if option_striphtml == 'true':
        if path.endswith(".html"):
            path = path[:-5]
        if path.endswith("index"):
            path = path[:-5]
        if path.endswith("/"):
            path = path[:-1]
        if path == "":
            path = "."
    return path

def active_page(this_page, target, str):
    pA = strip_html(this_page)
    pB = strip_html(target)
    if str.endswith("-this"):
        if pA == pB: return str[:-5]
        return ""
    else:
        if(pA.startswith(pB)): return str
        return ""

def meta_enrich(yaml_data, local_meta):
    obj = yaml.load(yaml_data)
    for key in obj:
        local_meta[key] = obj[key]
    return ""

# HTML builder function.
# Change {{js: js_files}}, {{css: css_files}} to compiled locations.
def html_build_function(target, source, env):
    global regex_js, regex_css, regex_ref, regex_meta, regex_partial
    global regex_yaml_info, regex_yaml_info_htcomment
    global regex_mustache_local
    global regex_math

    data = "";
    for s in source:
        data += ensure_unicode(s.get_text_contents(), 'utf-8')

    data = regex_partial.sub(lambda m: read_partial_file(m.group(1)), data)

    data = regex_meta.sub(lambda m: meta_substitute(m.group(1), m.group(0), meta_strings), data)

    def math_image_element(math, tag):
        if tag == "math": opt = ""
        if tag == "lmath": opt = "display"
        if tag == "latex": opt = "plain"
        rendered = LaTeXPNGDataURL(math, opt)
        dataurl, size = rendered
        return '<img class="math" src="%s" style="width:%dpx" />' % (dataurl, size[0] / 2.0)

    data = regex_math.sub(lambda m: math_image_element(m.group(2), m.group(1)), data)

    local_meta = {
        'title': env['SWB_title'],
        'pageurl': env['SWB_url'],
        'extra': env['SWB_extra']
    }

    data = regex_yaml_info.sub(lambda m: meta_enrich(m.group(2), local_meta), data)
    data = regex_yaml_info_htcomment.sub(lambda m: meta_enrich(m.group(2), local_meta), data)

    if 'blog' in local_meta:
        append_blog_info(local_meta['blog'])

    # Local mustache first.
    data = regex_mustache_local.sub(lambda m: mustache_render(m.group(1), local_meta), data)
    # Then simple ones.
    data = regex_meta.sub(lambda m: meta_substitute(m.group(1), m.group(0), local_meta), data)

    for t in target:
        fn = str(t);

        html = regex_js.sub(lambda m: make_relative_path(fn, m.group(1)), data)
        html = regex_css.sub(lambda m: make_relative_path(fn, m.group(1)), html)
        html = regex_ref.sub(lambda m: strip_html(make_relative_path(fn, m.group(1))), html)
        html = regex_active.sub(lambda m: active_page(env['SWB_url'], m.group(2), m.group(1)), html)

        html = html.replace(delim_L + "L" + delim_R, delim_L)
        html = html.replace(delim_L + "R" + delim_R, delim_R)
        html = html.replace(delim_L + "-" + delim_R, "-")

        html = regex_hash.sub("", html)

        f = open(fn, 'w')
        f.write(html.encode('utf-8'))
        f.close()
    return None

html_builder = Builder(action = html_build_function)

# ImageMagick builder.
def imagemagick_generator(source, target, env, for_signature):
    return 'convert "%s" %s "%s"' % (source[0], env['SWB_args'], target[0])

imagemagick_builder = Builder(generator = imagemagick_generator)

# The SCons environment.
env = Environment(
    BUILDERS = {
        'Javascript' : js_builder,
        'CSS' : css_builder,
        'Concat' : concat_builder,
        'Copy' : copy_builder,
        'Markdown' : markdown_builder,
        'Substitute' : substitute_builder,
        'HTML' : html_builder,
        'ImageMagick' : imagemagick_builder,
        'ResolveIncludes' : include_builder,
        'BibTex2YAML': BibTex2YAML_builder,
        'YAML2JSON' : yaml2json_builder,
        'YAML2DATAJS' : yaml2datajs_builder,
        'LessCSS' : lesscss_builder
    },
    ENV = {'PATH' : os.environ['PATH']}
);

# Include scanner, scan for included files.
def blog_template_scanner(node, env, path, parents = []):
    files = ["%s/blog.hash" % temporary_directory];
    r = env.File(files);
    return r

def union_scanner(scanners):
    def rf(node, env, path):
        files = []
        for scanner in scanners:
            files = files + scanner(node, env, path)
        return files
    return rf

# Add our template scanner.
env.Append(SCANNERS = Scanner(function = blog_template_scanner, skeys = ['.blog_template']))
env.Append(SCANNERS = Scanner(function = partial_scanner, skeys = ['.compiled']))
env.Append(SCANNERS = Scanner(function = include_scanner, skeys = ['.js', '.css']))
env.Append(SCANNERS = Scanner(function = union_scanner([mustache_scanner, include_scanner, partial_scanner]),
                              skeys = ['.html', '.md']))
env.Append(SCANNERS = Scanner(function = lesscss_scanner, skeys = ['.less']))

# Utility functions.
def get_file_extension(filename):
    return os.path.splitext(filename)[1][1:].strip().lower();

def get_partial_path(name):
    return "%s/%s.partial" % (temporary_directory, name)

def get_mustache_path(name):
    return "%s/%s.mustache" % (temporary_directory, name)

def get_yaml_path(name):
    return "%s/%s.yaml" % (temporary_directory, name)

def read_file(name):
    f = open(name, 'r')
    content = f.read()
    f.close()
    return content

def read_partial_file(name):
    temp = get_partial_path(name)
    f = open(temp, 'r')
    content = f.read()
    f.close()
    return content.decode("utf-8")

def read_mustache_file(name):
    temp = get_mustache_path(name)
    f = open(temp, 'r')
    content = f.read()
    f.close()
    return content.decode("utf-8")

def read_yaml_file(name):
    temp = get_yaml_path(name)
    f = open(temp, 'r')
    content = f.read()
    f.close()
    return content.decode("utf-8")

def get_temp_path(url):
    return "%s/%s.content" % (temporary_directory, url)

def content_html(target, source):
    extension = get_file_extension(source)
    if extension == "html":
        temp = "%s/%s.resolved" % (temporary_directory, source)
        env.ResolveIncludes(temp, source)
        env.Copy(target, temp)
    elif extension == "md":
        temp = "%s/%s.resolved" % (temporary_directory, source)
        env.ResolveIncludes(temp, source)
        env.Markdown(target, temp)

def make_relative_path(html_path, file_path):
    prefix = output_directory + "/"
    if 'this_directory' in globals():
        prefix = this_directory + "/" + prefix
    html_path = html_path.replace(prefix, "")
    return os.path.relpath(file_path, os.path.dirname(html_path))

def meta_substitute(meta_name, original, metadict):
    split = meta_name.split(".", 1)
    if split[0] in metadict:
        if len(split) == 1:
            return metadict[split[0]]
        else:
            return meta_substitute(split[1], original, metadict[split[0]])
    return original

# Set output directory.
def OutputDirectory(dir):
    global output_directory
    output_directory = dir

# Set temporary directory.
def TemporaryDirectory(dir):
    global temporary_directory
    temporary_directory = dir

global_target_list = []

def append_target(target):
    global global_target_list
    t = os.path.relpath(target, output_directory)
    global_target_list.append(t)

def GetTargetList():
    return global_target_list

def WriteDeployList(file):
    deploy_list = "\n".join(GetTargetList())
    open(file, "w").write(deploy_list.encode("utf-8"))

# Add mustache.

def Mustache(name, source):
    target_name = get_mustache_path(name)
    env.Copy(target_name, source)

# Add partial.
def Partial(name, source):
    target_name = get_partial_path(name)
    content_html(target_name, source)

# Add page.
def Page(url, source, template, title = '', extra = {}):
    temp_name = get_temp_path(url)
    content_html(temp_name, source)
    temp = "%s/%s.compiled" % (temporary_directory, url)
    output = "%s/%s" % (output_directory, url)
    env.Substitute(temp, [ temp_name, template ])
    env.HTML(output, temp, SWB_title = title, SWB_url = url, SWB_extra = extra)
    append_target(output)

# Add pure HTML file, just expand metadata.
def HTML(url, source, title = '', extra = {}):
    output = "%s/%s" % (output_directory, url)
    extension = get_file_extension(source)
    if extension == 'html':
        temp = "%s/%s.resolved" % (temporary_directory, url)
        env.ResolveIncludes(temp, source)
        env.HTML(output, temp, SWB_title = title, SWB_url = url, SWB_extra = extra)
    else:
        temp_r = "%s/%s.resolved" % (temporary_directory, url)
        temp_c = "%s/%s.compiled" % (temporary_directory, url)
        env.ResolveIncludes(temp_r, source)
        env.Markdown(temp_c, temp_r)
        env.HTML(output, temp_c, SWB_title = title, SWB_url = url, SWB_extra = extra)
    append_target(output)

# Add Javascript, source can be multiple files.
def Javascript(url, source):
    mins = [];
    output = "%s/%s" % (output_directory, url)
    for s in source:
        min = "%s/%s.min" % (temporary_directory, s)
        env.Javascript(min, s)
        mins.append(min)
    env.Concat(output, mins)
    append_target(output)

# Add CSS, source can be multiple files.
def CSS(url, source):
    mins = [];
    output = "%s/%s" % (output_directory, url)
    for s in source:
        min = "%s/%s.min" % (temporary_directory, s)
        if get_file_extension(s) == "less":
            env.LessCSS(min, s)
        else:
            env.CSS(min, s)
        mins.append(min)
    env.Concat(output, mins)
    append_target(output)

def Binary(url, source):
    output = "%s/%s" % (output_directory, url)
    env.Copy(output, source)
    append_target(output)

def Binaries(url_path, list):
    for file in list:
        Binary(url_path + file, file)

def Image(url, source):
    Binary(url, source)

def ImageMagick(url, source, args = ""):
    output = "%s/%s" % (output_directory, url)
    env.ImageMagick(output, source, SWB_args = args)
    append_target(output)

def YAML2JSON(url, source):
    output = "%s/%s" % (output_directory, url)
    env.YAML2JSON(output, source)
    append_target(output)

def YAML2DataJavascript(url, source, variable = "DATA"):
    output = "%s/%s" % (output_directory, url)
    env.YAML2DATAJS(output, source, variable = variable)
    append_target(output)

def Images(url_path, list):
    Binaries(url_path, list)

def Find(pattern, directory = "."):
    dir = Dir(directory)
    r = dir.glob(pattern, strings=True)
    return map(lambda x: (x, directory + "/" + x), r)

def FindFiles(pattern, directory = "."):
    dir = Dir(directory)
    r = dir.glob(pattern, strings=True)
    return map(lambda x: directory + "/" + x, r)


def TargetList(f, url_path, list):
    for filename, path in list:
        f(url_path + "/" + filename, path)

def SourceList(f, list):
    for path in list:
        f(path)

# Meta strings.
def Meta(key, value):
    global meta_strings;
    meta_strings[key] = value

def BibTex(name, source):
    temp = "%s/%s.yaml" % (temporary_directory, name)
    env.BibTex2YAML(temp, source)

# Blog functionalities.
blog_articles = []
blog_tags = {}
blog_path = "blog"

blogdb = {}
blogdb_articles = []
blogdb_tags = []
blogdb_tags_map = { }
blogdb_tags_defined = []

blogdb_articles_list = {}
blogdb_tags_list = {}

def append_blog_info(meta):
    if 'permlink' in meta:
        permlink = meta['permlink']
        if not permlink in blogdb: return
        article = blogdb[permlink]
        for key in ['date_display', 'update_display', 'prev', 'next']:
            if key in article:
                meta[key] = article[key]
        if 'tags' in meta:
            meta['tags_comma'] = ", ".join(map(lambda m: blogdb_tags_map[m]['name'], meta['tags']))
            meta['tags'] = map(lambda m: { 'name': blogdb_tags_map[m]['name'], 'tag': m, 'path': blogdb_tags_map[m]['path'] }, meta['tags'])

    meta['blogdb_tags'] = blogdb_tags
    meta['blogdb_recent'] = map(lambda m: blogdb[m], blogdb_articles[0:10])

def blog_date_parse(s):
    date = datetime.strptime(" ".join(s.split(" ")[0:2]), "%Y-%m-%d %H:%M:%S")
    tz = pytz.timezone(s.split(" ")[2])
    return tz.localize(date)

# Add a post to the blog index, internal use only, don't call it outside.
def BlogPost(file):
    global blog_articles, blog_tags

    data = read_file(file)
    local_meta = {}
    global regex_yaml_info, regex_yaml_info_htcomment
    data = regex_yaml_info.sub(lambda m: meta_enrich(m.group(2), local_meta), data)
    data = regex_yaml_info_htcomment.sub(lambda m: meta_enrich(m.group(2), local_meta), data)

    # Make categories.
    blog = local_meta['blog']

    if 'status' in blog and blog['status'] == 'private':
        return

    blog['src'] = file
    blog['title'] = local_meta['title']
    if 'tags' in blog:
        for tag in blog['tags']:
            if not tag in blog_tags:
                blog_tags[tag] = { 'articles': [], 'name': tag }
            blog_tags[tag]['articles'].append(blog['permlink'])
    blog_articles.append(blog)
    return blog

def BlogTags(file):
    data = read_file(file)
    tags = yaml.load(data)
    for obj in tags:
        name = obj['name']
        tag = obj['key']
        blogdb_tags_defined.append(tag)
        if tag in blog_tags:
            blog_tags[tag]['name'] = name
        else:
            blog_tags[tag] = { 'name': name, 'articles': [] }

def blog_sort_articles(articles):
    global blogdb
    return sorted(articles, key = lambda m: blogdb[m]['date'], reverse = True)

def blog_build_list(articles):
    page_articles = 10
    neighbor_pages = 5
    N = len(articles)
    list = {
        'count': N,
        'pages': [],
        'articles': articles
    }
    N_pages, reminder = divmod(N, page_articles)
    if reminder > 0: N_pages += 1
    for pageindex in range(N_pages):
        page = {
            'articles': articles[pageindex * page_articles:pageindex * page_articles + page_articles],
            'next': pageindex + 1 if pageindex < N_pages - 1 else None,
            'prev': pageindex - 1 if pageindex > 0 else None,
            'index': pageindex
        }
        if N_pages <= neighbor_pages: page['neighbors'] = range(N_pages)
        else:
            if pageindex < neighbor_pages // 2:
                page['neighbors'] = range(neighbor_pages)
            elif N_pages - pageindex <= neighbor_pages // 2:
                page['neighbors'] = range(N_pages - neighbor_pages, N_pages)
            else:
                page['neighbors'] = range(pageindex - neighbor_pages // 2, pageindex + neighbor_pages // 2 + 1)
        list['pages'].append(page)
    return list

def BlogInit(path):
    blog_path = path

def blog_article_path(article):
    return "%s/%d/%s.html" % (blog_path, article['date'].year, article['permlink'])

def blog_tag_path(tag):
    return "%s/%s.html" % (blog_path, tag)
def blog_tag_path_pager(tag, index):
    if index == 0:
        return "%s/%s.html" % (blog_path, tag)
    else:
        return "%s/%s-%s.html" % (blog_path, tag, index)

def BlogFinalize():
    global blog_articles, blog_tags
    global blogdb
    global blogdb_articles
    global blogdb_tags

    global blogdb_articles_list
    global blogdb_tags_list

    blog_index = {
        'articles': blog_articles,
        'tags': blog_tags
    }

    db_hash = sha256(json.dumps(blog_index)).hexdigest();
    f = open("%s/blog.hash" % temporary_directory, "w")
    f.write(db_hash)
    f.close()

    for article in blog_articles:
        blogdb[article['permlink']] = article
        article['date'] = blog_date_parse(article['date'])
        if 'update' in article:
            article['update'] = blog_date_parse(article['update'])
        else:
            article['update'] = article['date']
        article['date_display'] = article['date'].astimezone(pytz.timezone(option_display_timezone)).strftime(option_time_format)
        article['update_display'] = article['update'].astimezone(pytz.timezone(option_display_timezone)).strftime(option_time_format)
        article['path'] = blog_article_path(article)

    blogdb_articles = map(lambda article: article['permlink'], blog_index['articles'])

    blogdb_articles = blog_sort_articles(blogdb_articles)
    blogdb_articles_list = blog_build_list(blogdb_articles)

    # Build chain.
    for i in range(len(blogdb_articles)):
        article = blogdb[blogdb_articles[i]]
        if i > 0:
            article['next'] = copy.deepcopy(blogdb[blogdb_articles[i - 1]])
        if i < len(blogdb_articles) - 1:
            article['prev'] = copy.deepcopy(blogdb[blogdb_articles[i + 1]])

    for tag in blogdb_tags_defined:
        blog_tags[tag]['articles'] = blog_sort_articles(blog_tags[tag]['articles'])
        blog_tags[tag]['path'] = blog_tag_path(tag)
        blog_tags[tag]['tag'] = tag
        blogdb_tags.append(blog_tags[tag])
        blogdb_tags_map[tag] = blog_tags[tag]
        blogdb_tags_list[tag] = blog_build_list(blog_tags[tag]['articles'])

# Generate articles.
def BlogGenerateArticles(template):
    for permlink in blogdb_articles:
        article = blogdb[permlink]
        opt = article['path']
        Page(opt, article['src'], template)

def blog_generate_list(src, template, list, get_pageurl, extra_prepare = None):
    for page in list['pages']:
        extra = { 'is_list': True, 'list': map(lambda m: blogdb[m], page['articles']) }
        if extra_prepare != None: extra_prepare(extra)
        if 'prev' in page and page['prev'] != None:
            extra['prev'] = get_pageurl(page['prev'])
        if 'next' in page and page['next'] != None:
            extra['next'] = get_pageurl(page['next'])
        if 'neighbors' in page:
            extra['neighbors'] = map(lambda idx: { 'href': get_pageurl(idx), 'index': idx + 1 }, page['neighbors'] )
        url = get_pageurl(page['index'])
        Page(url, src, template, extra = extra)

def BlogGenerateList(src, template):
    def get_pageurl(index):
        if index == 0:
            return blog_path + "/index.html"
        else:
            return "%s/page-%s.html" % (blog_path, index)
    list = blogdb_articles_list
    blog_generate_list(src, template, list, get_pageurl)

def BlogGenerateTags(src, template):
    for tag in blogdb_tags:
        def get_pageurl(index):
            return blog_tag_path_pager(tag['tag'], index)
        def extra_prepare(extra):
            extra['is_tag'] = True
            extra['tag_name'] = tag['name']
        list = blogdb_tags_list[tag['tag']]
        blog_generate_list(src, template, list, get_pageurl, extra_prepare)

# LaTeX Math Formulas support.
if not os.path.exists(temporary_directory + "/math"):
    os.makedirs(temporary_directory + "/math")
if not os.path.exists(temporary_directory + "/math/tmp"):
    os.makedirs(temporary_directory + "/math/tmp")

def LaTeXPNGDataURL(latex_input, env):
    if env == "":
        latex = "\n".join([
          r"\nonstopmode",
          r"\documentclass{article}",
          r"\usepackage{cancel}",
          r"\usepackage{amsmath,amsthm}",
          r"\pagestyle{empty}",
          r"\begin{document}",
          "$",
          latex_input,
          "$",
          "\end{document}"])
    elif env == "display":
        latex = "\n".join([
          r"\nonstopmode",
          r"\documentclass{article}",
          r"\usepackage{cancel}",
          r"\usepackage{amsmath,amsthm}",
          r"\pagestyle{empty}",
          r"\begin{document}",
          r"\begin{displaymath}",
          latex_input,
          r"\end{displaymath}",
          r"\end{document}"])
    elif env == "plain":
        latex = "\n".join([
          r"\nonstopmode",
          r"\documentclass{article}",
          r"\usepackage{cancel}",
          r"\usepackage{amsmath,amsthm}",
          r"\pagestyle{empty}",
          r"\begin{document}",
          latex_input,
          r"\end{document}"])
    params = env
    code = sha1(latex + "-" + params).hexdigest()
    tex_file = "%s/math/tmp/%s.tex" % (temporary_directory, code)
    png_file = "%s/math/tmp/%s.png" % (temporary_directory, code)
    png_output = "%s/math/%s.png" % (temporary_directory, code)

    def get_png_dataurl(path):
        from PIL import Image as PILImage
        im = PILImage.open(path)
        size = im.size
        f = open(path, "r")
        data = f.read()
        data = "data:image/png;base64," + base64.b64encode(data)
        return (data, size)

    if os.path.exists(png_output):
        return get_png_dataurl(png_output)

    f = open(tex_file, "w")
    f.write(latex)
    f.close()

    print "latex %s" % tex_file

    def run_and_wait(args):
        proc = subprocess.Popen(args,
                              cwd = temporary_directory + "/math/tmp",
                              stdin = open("/dev/null", "r"),
                              stdout = open("/dev/null", "w"),
                              stderr = open("/dev/null", "w"))
        proc.wait()

    # latex $1.tex
    # dvips -q -R -E $1.dvi
    # convert -quality 100 -density 120 $1.ps $1.png

    run_and_wait(["/usr/texbin/latex", code + ".tex"])
    run_and_wait(["/usr/texbin/dvips", "-q", "-R", "-E", code + ".dvi"])
    # Mac OS: ps2pdf + sips
    #run_and_wait(["/usr/local/bin/ps2pdf", "-r72", "-dEPSCrop", code + ".ps"])
    #run_and_wait(["/usr/bin/sips", "-s", "format", "png", code + ".pdf", "--out", code + ".png"])
    # Other:
    run_and_wait(["/usr/local/bin/convert", "-density", "240", code + ".ps", code + ".png"])

    if os.path.exists(png_file):
        copyfile(png_file, png_output)
        return get_png_dataurl(png_output)
    else:
        raise Exception("LaTeX Failed!")

from iconfont import CreateIconFont

def iconfont_build_function(target, source, env):
    t = str(target[0])
    s = [ str(x) for x in source ]
    CreateIconFont(env["name"], s, t)
env.Append(BUILDERS = { "IconFont": Builder(action = iconfont_build_function) })
