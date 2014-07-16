//. iVisDesigner - File: scripts/core/objects/filters.js
//. Copyright 2013-2014 Donghao Ren
//. University of California, Santa Barbara, Peking University
//. See LICENSE.md for more information.

// Range filter.
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
