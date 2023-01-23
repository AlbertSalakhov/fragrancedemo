define([
    'jquery',
    'underscore',
    'mage/template',
    'text!ui/template/modal/modal-popup.html',
    'text!ui/template/modal/modal-slide.html',
    'text!ui/template/modal/modal-custom.html',
    'Magento_Ui/js/lib/key-codes',
    'jquery/ui',
    'mage/translate'
], function ($, _, template, popupTpl, slideTpl, customTpl, keyCodes) {

    return function (widget) {
        $.widget('mage.modal', widget, {
            /**
             * Creates wrapper to hold all modals.
             * This Overwrite vendor code.
             */
            _createWrapper: function () {
                var newAppend = jQuery('.page-wrapper');
                this.modalWrapper = newAppend.find('.' + this.options.wrapperClass); 

                if (!this.modalWrapper.length) {
                    this.modalWrapper = $('<div></div>')
                        .addClass(this.options.wrapperClass)
                        .appendTo(newAppend);
                }
            }
        });
        return $.mage.modal;
    };
});