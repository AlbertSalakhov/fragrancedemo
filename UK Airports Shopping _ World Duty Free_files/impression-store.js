define([
    'jquery',
    'Magento_GoogleTagManager/js/google-tag-manager'
], function($){
    'use strict';
    function notify(data) {
        var dlImpressions = {
            'event': 'storeInfo',
            'ecommerce': data
        };

        window.dataLayer.push(dlImpressions);
    }
    return function(data) {
        window.dataLayer ?
            notify(data) :
            $(document).on('ga:inited', notify.bind(this));
    }
});