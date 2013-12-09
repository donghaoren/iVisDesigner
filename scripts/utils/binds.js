// ======== Bindings ========

// Bind HTML elements to values or events.
//   bindButton(selection, event_key)
//   bindToggle(selection, key)
//   bindOption(selection, key)
//   bindText(selection, key, connector)
//   bindSlider(selection, key, connector)
//     element_state = connector.in(value);
//     value = connector.out(element_state);
//   bindElement(selection, key, transformer), HTML = transformer(value);

NS.bindButton = function(selection, event) {
    selection.click(function() {
        NS.raiseEvent(event);
    });
    return NS;
};

NS.bindToggle = function(selection, key) {
    var state = NS.getValue(key);
    if(state) selection.addClass("active");
    else selection.removeClass("active");
    selection.click(function() {
        state = !state;
        NS.setValue(key, state, true);
    });
    NS.addValueListener(key, function(new_state) {
        state = new_state;
        if(state) selection.addClass("active");
        else selection.removeClass("active");
    });
    return NS;
};

NS.bindOption = function(selection, key, cls) {
    if(!cls) cls = "active";
    selection.removeClass(cls);
    selection.filter(".option-" + NS.getValue(key)).addClass(cls);
    selection.click(function() {
        var cls = $(this).attr("class");
        if(!cls) return;
        var option = cls.match(/option-([0-9a-zA-Z\_\-\.]+)/)[1];
        NS.setValue(key, option, true);
    });
    NS.addValueListener(key, function(state) {
        selection.removeClass(cls);
        selection.filter(".option-" + state).addClass(cls);
    });
    return NS;
};

NS.makeOption = function(selection, value, cls) {
    if(!cls) cls = "active";
    selection.removeClass(cls);
    selection.filter(".option-" + value).addClass(cls);
    var rr = {
        value: value,
        setValue: function(state) {
            selection.removeClass(cls);
            selection.filter(".option-" + state).addClass(cls);
            this.value = state;
        }
    };
    selection.click(function() {
        var option = $(this).attr("class").match(/option-([0-9a-zA-Z\_\-\.]+)/)[1];
        rr.setValue(option);
    });
    return rr;
};

NS.bindText = function(selection, key, connector) {
    if(!connector) connector = { };
    var fin = connector.filter_in ? connector.filter_in : function(x) { return x; };
    var fout = connector.filter_out ? connector.filter_out : function(x) { return x; };
    selection.val(NS.getValue(key));
    var forbid_this = false;
    selection.change(function() {
        forbid_this = true;
        NS.setValue(key, fout($(selection).val()), true);
        forbid_this = false;
    });
    NS.addValueListener(key, function(value) {
        if(forbid_this) return;
        selection.val(fin(value));
    });
    return NS;
};

NS.bindSlider = function(selection, key, continuous, connector) {
    if(!connector) connector = { };
    var fin = connector.filter_in ? connector.filter_in : function(x) { return x; };
    var fout = connector.filter_out ? connector.filter_out : function(x) { return x; };
    selection.each(function() {
        var slider = this;
        slider.sliderEvent = function(val, is_up) {
            if(continuous || is_up) {
                // changed.
                NS.setValue(key, fout(slider.sliderValue));
            }
        };
    });
    var update = function(value) {
        selection.each(function() {
            this.sliderSet(fin(value));
        });
    };
    update(NS.getValue(key));
    NS.addValueListener(key, update);
};

NS.bindElement = function(selection, key, transformer) {
    var rep = transformer ? transformer(NS.getValue(key)) : NS.getValue(key);
    selection.html(rep);
    NS.addValueListener(key, function(value) {
        var rep = transformer ? transformer(value) : value;
        selection.html(rep);
    });
    return NS;
};
