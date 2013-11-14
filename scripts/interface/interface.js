// scripts/interface.js:
// Initialize and manage the interface of iVisDesigner, dispatch events.
// Including:
//   panels, menus, window resize, mouse events, keyboard events, etc.

{{include: utils.js}}
{{include: controls.js}}
{{include: menu.js}}
{{include: panel.js}}
{{include: popup.js}}
{{include: modal.js}}

$(window).resize(function(){
    IV.raise("window:resize");
});
