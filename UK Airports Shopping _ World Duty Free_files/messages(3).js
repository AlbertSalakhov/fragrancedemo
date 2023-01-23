/**
 * Copyright © Magento, Inc. All rights reserved.
 * See COPYING.txt for license details.
 */

/**
 * @api
 */
define([
    'ko',
    'jquery',
    'Magento_Customer/js/customer-data',
    'underscore',
    'jquery/jquery-storageapi'
], function (ko, $, customerData, _) {
    'use strict';

    return {
        initialized: false,
        messages: ko.observableArray([]),
        cleanupInterval: null,

        /**
         *  Initialize the observables
         * @returns {exports}
         */
        initialize: function () {
            if (!this.initialized) {
                this.initObservable();
                this.initialized = true;
            }

            return this;
        },

        /**
         * removes set interval to hide old messages
         */
        removeCleanupInterval: function () {
            clearInterval(this.cleanupInterval);
            this.cleanupInterval = null;
        },

        /**
         * creates set interval to hide old messages
         */
        setupCleanupInterval: function () {
            //dont created if we already have one
            if (this.cleanupInterval !== null) return;

            let self = this;
            this.cleanupInterval = setInterval(function () {
                self.clearMessagesList();
            }, 1000);
        },

        /**
         *  Init all observables
         * @returns {exports}
         */
        initObservable: function () {
            let self = this;

            //startup interval loop to clean messages
            this.messages.subscribe(function (data) {
                if (data.length === 0) {
                    self.removeCleanupInterval();
                } else {
                    self.setupCleanupInterval();
                }
            });

            //get messages from cookies
            self.mergeMessages(_.unique($.cookieStorage.get('mage-messages'), 'text'));
            $.cookieStorage.set('mage-messages', '');

            //grab first session data
            this.mergeMessages(customerData.get('messages').messages);

            //listen to customer data messages
            customerData.get('messages').subscribe(function (data) {
                if (!_.isEmpty(data.messages)) {
                    self.mergeMessages(data.messages);
                    //Clear messages
                    self.clearMessageStorage();
                }
            });

            return this;
        },

        /**
         * Merge new messages data with the current available
         * @param data
         */
        mergeMessages: function (data) {
            data = this.hydrateData(data);
            //TODO: think about duplications and actual merges
            let self = this;
            _.each(data, function (message) {
                self.messages.push(message);
            });
        },

        /**
         * add Timestamp to every object into the array
         * @param {array} data
         * @returns {*}
         */
        hydrateData: function (data) {
            if (Array.isArray(data)) {
                let timeStamp = new Date().getTime();
                data.map(function (item) {
                    item.timestamp = timeStamp;
                });
            }

            return data;
        },

        /**
         * remove messages from screen based on time stamp
         */
        clearMessagesList: function () {
            let timestamp = new Date().getTime();

            this.messages.remove(function (message) {
                let diff = (timestamp - message.timestamp) / 1000;
                return (diff >= 10);
            });
        },

        /**
         * Clear messages from cookie and session storage
         */
        clearMessageStorage: function () {
            // Force to clean obsolete messages
            if (!_.isEmpty(this.messages().messages)) {
                customerData.set('messages', {});
            }

            if (!this.initialized) {
                this.initialized = true;
                //Forcefully erase messages
                $(window).on('beforeunload', function () {
                    $.cookieStorage.set('mage-messages', '');
                });
            }
        },

        /**
         * Add  message to list.
         * @param {Object} messageObj
         * @param {string} type
         * @returns {Boolean}
         */
        add: function (messageObj, type) {
            let expr = /([%])\w+/g,
                message = {type: type};


            //simple messages without parameters
            if (messageObj.hasOwnProperty('parameters')) {

                //replace the parameters on the string
                message.text = messageObj.message.replace(expr, function (varName) {
                    varName = varName.substr(1);

                    if (messageObj.parameters.hasOwnProperty(varName)) {
                        return messageObj.parameters[varName];
                    }

                    return messageObj.parameters.shift();
                });
            } else {
                message.text = messageObj.message;
            }

            this.mergeMessages([message]);

            return true;
        },

        /**
         * Add success message.
         *
         * @param {Object} message
         * @return {*|Boolean}
         */
        addSuccessMessage: function (message) {
            return this.add(message, 'success');
        },

        /**
         * Add error message.
         *
         * @param {Object} message
         * @return {*|Boolean}
         */
        addErrorMessage: function (message) {
            return this.add(message, 'error');
        },

        /**
         * Get error messages.
         *
         * @return {Array}
         */
        getErrorMessages: function () {
            return this.messages.filter(function (data, index) {
                if (data[index] === 'error') {
                    return true;
                }
            });
        },

        /**
         * Get success messages.
         *
         * @return {Array}
         */
        getSuccessMessages: function () {
            return this.messages.filter(function (data, index) {
                if (data[index] === 'success') {
                    return true;
                }
            });
        },

        /**
         * Checks if an instance has stored messages.
         *
         * @return {Boolean}
         */
        hasMessages: function () {
            return this.messages().length > 0;
        },

        /**
         * Removes stored messages.
         */
        clear: function () {
            this.messages.removeAll();
        }
    };
});
