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
        if(!this.path) return null;
        var value = context.get(this.path).val();
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
        if(!this.path)
            return null;
        var value = context.get(this.path).val();
        if(this.is_black_list) return
        return this.keys.find(value) != 0 ^ this.is_black_list;
    },
    clone: function() {
        return new CategoricalFilter(this.path, this.keys.slice(), this.is_black_list);
    }
});
Objects.CategoricalFilter = CategoricalFilter;
IV.serializer.registerObjectType("CategoricalFilter", CategoricalFilter);
