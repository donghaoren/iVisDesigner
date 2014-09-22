// iVisDesigner - scripts/core/core.js
// Author: Donghao Ren
//
// LICENSE
//
// Copyright (c) 2014, The Regents of the University of California
// All rights reserved.
//
// Redistribution and use in source and binary forms, with or without modification,
// are permitted provided that the following conditions are met:
//
// 1. Redistributions of source code must retain the above copyright notice, this
//    list of conditions and the following disclaimer.
//
// 2. Redistributions in binary form must reproduce the above copyright notice,
//    this list of conditions and the following disclaimer in the documentation
//    and/or other materials provided with the distribution.
//
// 3. Neither the name of the copyright holder nor the names of its contributors
//    may be used to endorse or promote products derived from this software without
//    specific prior written permission.
//
// THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
// ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
// WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED.
// IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT,
// INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING,
// BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
// DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
// LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE
// OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED
// OF THE POSSIBILITY OF SUCH DAMAGE.

{{include: serializer.js}}
{{include: actionmanager.js}}

{{include: path.js}}
{{include: data.js}}
{{include: vis.js}}

{{include: workspace.js}}

{{include: objects/objects.js}}

{{include: render.js}}

// ------------------------------------------------------------------------
// Global Colors
// ------------------------------------------------------------------------
IV.colors_white = {
    selection: IV.parseColorHEX("1754AD"),
    guide: new IV.Color(0, 0, 0, 0.03),
    foreground: new IV.Color(0, 0, 0, 1),
    background: new IV.Color(255, 255, 255, 1),
    default_fill: new IV.Color(0, 0, 0, 1),
    default_halffill: new IV.Color(128, 128, 128, 1),
    default_stroke: new IV.Color(0, 0, 0, 1),
    default_guide: new IV.Color(0, 0, 0, 1)
};

IV.colors_black = {
    selection: IV.parseColorHEX("1754AD"),
    guide: new IV.Color(255, 255, 255, 0.3),
    foreground: new IV.Color(255, 255, 255, 1),
    background: new IV.Color(0, 0, 0, 1),
    default_fill: new IV.Color(255, 255, 255, 1),
    default_halffill: new IV.Color(128, 128, 128, 1),
    default_stroke: new IV.Color(255, 255, 255, 1),
    default_guide: new IV.Color(255, 255, 255, 1)
};

IV.colors = IV.colors_white;
