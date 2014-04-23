// Allosphere integration code.

if(IV.getQuery("allosphere") == "true") {

$("body").addClass("allosphere");
window.isAllosphere = true;

$(window).load(function() {
    IV.set("visible-guide", false);
    IV.set("visible-grid", false);
    IV.set("tools:current", "Move");
    window.hostCall('{"f":"load", "id": 1 }');
});

IV.allosphere = { };
IV.allosphere.F = { };

IV.allosphere.F['echo'] = function(params) {
    return { "content" : params.content };
};

IV.allosphere.F['initialize'] = function() {
};

IV.allosphere.F['load'] = function(params) {
    IV.loadVisualizationById(params.id);
};

window.hostCall = function(params) {
    params = JSON.parse(params);
    return JSON.stringify(IV.allosphere.F[params.f](params));
};

}
