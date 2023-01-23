require(['jquery', 'popper.js', 'bootstrap4'], function($, Popper) {

    window.Popper = Popper; // re-attach to global scope

    var bootstrapButton = $.fn.button.noConflict(); // return $.fn.button to previously assigned value
    $.fn.bootstrapBtn = bootstrapButton;

    var bootstrapModal = $.fn.modal.noConflict(); // return $.fn.button to previously assigned value
    $.fn.bootstrapModal = bootstrapModal;
});