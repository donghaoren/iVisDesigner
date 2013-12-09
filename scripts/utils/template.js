NS.getTemplate = function(template_name) {
    var ht = $("#" + template_name + "-" + NS.currentLanguage).html();
    if(ht) return ht;
    //console.log("Warning: template '" + template_name + "-" + NS.currentLanguage + "' not found.");
    return $("#" + template_name).html();
};
NS.render = function(template_name, object) {
    var template = NS.getTemplate(template_name);
    if(template) {
        template = template.replace(/\{\> *([0-9a-zA-Z\-\_\.]+) *\<\}/g, function(g, a) {
            return '<span i18n="' + a + '">' + NS.str(a) + '</span>';
        });
        return Mustache.render(template, object);
    }
    return "";
};
