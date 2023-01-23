/**
 * Copyright © Magento, Inc. All rights reserved.
 * See COPYING.txt for license details.
 */
/* jscs:disable */
/* eslint-disable */
define([
    'jquery',
    'mage/cookies'
], function ($) {
    'use strict';

    /**
     * @param {Object} config
     */
    return function (config) {
        var allowServices = false,
            allowedCookies,
            allowedWebsites,
            f,
            j,
            dl;

        if (config.isCookieRestrictionModeEnabled) {
            allowedCookies = $.mage.cookies.get(config.cookieName);

            if (allowedCookies !== null) {
                allowedWebsites = JSON.parse(allowedCookies);

                if (allowedWebsites[config.currentWebsite] === 1) {
                    allowServices = true;
                }
            }
        } else {
            allowServices = true;
        }

        if (allowServices) {
            window.dataLayer = [];

            (function (w, d, s, l, i) {

                if(typeof i == 'undefined') return;

                w[l] = w[l] || [];
                w[l].push({
                    'gtm.start': new Date().getTime(),
                    event: 'gtm.js'
                });
                f = d.getElementsByTagName(s)[0];
                j = d.createElement(s);
                dl = l != 'dataLayer' ? '&l=' + l : '';
                j.async = true;
                j.src = 'https://www.googletagmanager.com/gtm.js?id=' + i + dl;
                f.parentNode.insertBefore(j, f);
            })(window, document, 'script', 'dataLayer', config.gtmAccountId);

            window.dlCurrencyCode = config.storeCurrencyCode;

            if(typeof config.ordersData != 'undefined') {
                // Collect and send data about order and items
                if (config.ordersData.length > 0) {
                    $.each(config.ordersData, function (index, value) {
                        dataLayer.push(value);
                    });
                }
            }

            $(document).trigger('ga:inited');
        }
    }
});
