/**
 * Copyright © Magento, Inc. All rights reserved.
 * See COPYING.txt for license details.
 */

/**
 * @api
 */
define([
    'jquery',
    'uiComponent',
    '../model/messages',
    'ko'
], function ($, Component, messagesModel, ko) {
    'use strict';

    return Component.extend({
        messagesList: ko.observable([]),

        /**
         * Extends Component object by storage observable messages.
         */
        initialize: function () {
            this._super();
            let self = this;

            messagesModel.initialize();

            self.messagesList({messages: messagesModel.messages()});

            messagesModel.messages.subscribe(function(messages){
                self.messagesList({messages: messages});
            });


        },

        /**
         * Hide message
         * @param a
         * @param b
         */
        hideMessage(a, b) {
            $(b.currentTarget).parent().fadeOut();
        },
    });
});
