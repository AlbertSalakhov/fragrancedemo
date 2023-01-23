/**
 * Copyright © Magento, Inc. All rights reserved.
 * See COPYING.txt for license details.
 */

/**
 * @api
 */
define([
    'jquery',
    'underscore',
    'ko',
    'Magento_Customer/js/customer-data',
    'jquery/jquery-storageapi'
], function ($, _, ko, customerData) {
    'use strict';

    var options = {
            cacheTtl: 0,
            sectionLoadUrl: ''
        },
        storage = $.initNamespaceStorage('mage-banners-cache-storage').localStorage,
        
        /**
         * Cache invalidation
         */
        invalidateCacheBySessionTimeOut = function () {
            var customerDataVersion = customerData.get('customer')()['data_id'],
                cacheEol = new Date($.localStorage.get('mage-banners-cache-timeout')),
                dateTo = new Date(Date.now() + options.cacheTtl);

            if (cacheEol < new Date() ||
                !customerDataVersion ||
                cacheEol - new Date(customerDataVersion * 1000 < options.cacheTtl)
            ) {
                storage.removeAll();
                $.localStorage.set('mage-banners-cache-timeout', dateTo);
            }
        },
        dataProvider = {

            /**
             * Request data from storage
             *
             * @param {Array} sectionNames
             * @returns {Object}
             */
            getFromStorage: function (sectionNames) {
                var result = {};

                _.each(sectionNames, function (sectionName) {
                    result[sectionName] = storage.get(sectionName);
                });

                return result;
            },

            /**
             * Request data from server
             *
             * @param {Array} sectionNames
             * @returns {Object}
             */
            getFromServer: function (sectionNames) {
                var parameters = _.isArray(sectionNames) ? {
                    sections: sectionNames.join(',')
                } : [];

                return $.getJSON(options.sectionLoadUrl, parameters).fail(function (jqXHR) {
                    throw new Error(jqXHR);
                });
            }
        },
        buffer = {
            data: {},

            /**
             * Binding parameter
             *
             * @param {String} sectionName
             */
            bind: function (sectionName) {
                this.data[sectionName] = ko.observable({});
            },

            /**
             *
             * @param {String} sectionName
             * @returns {Object}
             */
            get: function (sectionName) {
                if (!this.data[sectionName]) {
                    this.bind(sectionName);
                }

                return this.data[sectionName];
            },

            /**
             * Get keys
             *
             * @returns {Array}
             */
            keys: function () {
                return _.keys(this.data);
            },

            /**
             * Notify storage
             *
             * @param {String} sectionName
             * @param {Object} sectionData
             */
            notify: function (sectionName, sectionData) {
                if (!this.data[sectionName]) {
                    this.bind(sectionName);
                }
                this.data[sectionName](sectionData);
            },

            /**
             * Update sections
             *
             * @param {{data: *}} sections
             */
            update: function (sections) {
                _.each(sections, function (sectionData, sectionName) {
                    storage.set(sectionName, sectionData);
                    buffer.notify(sectionName, sectionData);
                });
            }
        },
        banner = {

            /**
             * Initialization
             */
            init: function () {
                let self = this, sectionData, bannerData = customerData.get('banner-data');
                if(!_.isEmpty(bannerData())){
                    sectionData = bannerData();
                    let sections = { data : sectionData };
                    buffer.update(sections);
                }else{
                    let currentSectionsLoading = customerData.getCurrentSectionsLoading();
                    switch (currentSectionsLoading) {
                        case '*':
                        case _.isArray(currentSectionsLoading) && _.contains(currentSectionsLoading, 'banner-data'):
                            this.bindBannerData(bannerData);
                            break;
                        default:
                            if (_.isEmpty(storage.keys())) {
                                this.reload([]);
                            } else {
                                _.each(dataProvider.getFromStorage(storage.keys()), function (sectionData, sectionName) {
                                    buffer.notify(sectionName, sectionData);
                                });
                            }
                            break;
                    }
                }
            },
            bindBannerData : function(bannerData){
                let self = this;
                this.bannerListener = bannerData.subscribe(function(data){
                    if(!_.isEmpty(data)){
                        let sections = { data : data };
                        buffer.update(sections);
                        self.bannerListener.dispose();
                    }
                });
            },

            /**
             * Get data
             *
             * @param {String} sectionName
             * @returns {*|Object}
             */
            get: function (sectionName) {
                return buffer.get(sectionName);
            },

            /**
             * Set data
             *
             * @param {String} sectionName
             * @param {Object} sectionData
             */
            set: function (sectionName, sectionData) {
                var data = {};

                data[sectionName] = sectionData;
                buffer.update(data);
            },

            /**
             * Reloading from storage or server
             *
             * @param {Array} sectionNames
             * @returns {Object}
             */
            reload: function (sectionNames) {
                return dataProvider.getFromServer(sectionNames).done(function (sections) {
                    buffer.update(sections);
                });
            },

            /**
             * Init helper
             *
             * @param {Array} settings
             */
            'Magento_Banner/js/model/banner': function (settings) {
                options = _.extend(options, settings);
                invalidateCacheBySessionTimeOut(settings);
                banner.init();
            }
        };

    return banner;
});
