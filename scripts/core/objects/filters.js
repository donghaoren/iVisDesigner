// iVisDesigner - scripts/core/objects/filters.js
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

var RangeFilter = IV.extend(Objects.Object, function(path, min, max) {
    Objects.Object.call(this);
    this.path = path;
    this.min = min;
    this.max = max;
    this.type = "RangeFilter";
}, {
    $auto_properties: [ "path", "min", "max" ],
    get: function(context) {
        if(!this.path) return true;
        var value = context.get(this.path).val();
        if(value === null) return null;
        if(this.min <= this.max)
            return value >= this.min && value <= this.max;
        return value >= this.min || value <= this.max;
    },
    clone: function() {
        return new RangeFilter(this.path, this.min, this.max);
    }
});
Objects.RangeFilter = RangeFilter;
IV.serializer.registerObjectType("RangeFilter", RangeFilter);

// Categorical filter.
var CategoricalFilter = IV.extend(Objects.Object, function(path, keys, is_black_list) {
    this.type = "CategoricalFilter";
    this.path = path;
    this.keys = keys;
    this.is_black_list = is_black_list ? true : false;
}, {
    $auto_properties: [ "path", "$array:keys", "is_black_list" ],
    get: function(context) {
        if(!this.path) return true;
        var value = context.get(this.path).val();
        var found = this.keys.indexOf(value.toString()) >= 0;
        return found ? !this.is_black_list : this.is_black_list;
    },
    clone: function() {
        return new CategoricalFilter(this.path, this.keys.slice(), this.is_black_list);
    }
});
Objects.CategoricalFilter = CategoricalFilter;
IV.serializer.registerObjectType("CategoricalFilter", CategoricalFilter);

var CombinedFilter = IV.extend(Objects.Object, function(path, filters, is_conjunctive) {
    this.type = "CombinedFilter";
    this.filters = filters ? filters : [];
    this.is_conjunctive = is_conjunctive ? true : false;
}, {
    $auto_properties: [ "$array:filters", "is_conjunctive" ],
    get: function(context) {
        if(this.is_conjunctive) {
            for(var i = 0; i < this.filters.length; i++) {
                if(!this.filters[i].get(context)) return false;
            }
            return true;
        } else {
            for(var i = 0; i < this.filters.length; i++) {
                if(this.filters[i].get(context)) return true;
            }
            return false;
        }
    },
});
Objects.CombinedFilter = CombinedFilter;
IV.serializer.registerObjectType("CombinedFilter", CombinedFilter);
