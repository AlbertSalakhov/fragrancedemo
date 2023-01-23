/**
 * Copyright © Magento, Inc. All rights reserved.
 * See COPYING.txt for license details.
 */

/**
 * @api
 */
define([
    'jquery',
    'jquery-ui-modules/widget',
    'mage/cookies'
], function ($) {
    'use strict';

    $.widget('mage.cookieNotices', {
        /** @inheritdoc */
        _create: function () {
            if (this._isAccepted()) {
                this.element.hide();
            } else {
                this.element.show();
            }
            
            $(this.options.cookieAllowButtonSelector).on('click', $.proxy(function () {
                var cookieExpires = new Date(new Date().getTime() + this.options.cookieLifetime * 1000);

                $.mage.cookies.set(this.options.cookieName, JSON.stringify(this.options.cookieValue), {
                    expires: cookieExpires
                });
                
                this._setAccepeted();

                if ($.mage.cookies.get(this.options.cookieName)) {
                    this.element.hide();
                    $(document).trigger('user:allowed:save:cookie');
                } else {
                    window.location.href = this.options.noCookiesUrl;
                }
            }, this));
        },

        _setAccepeted: function() {
            let cookieTime = new Date().getTime() + this.options.cookieLifetime * 1000;
            let cookieExpires = new Date(cookieTime);

            $.mage.cookies.set(this.options.cookieName, JSON.stringify(this.options.cookieValue), {
                expires: cookieExpires
            });

            window.localStorage.setItem(this.options.cookieName, cookieTime);
        },

        _clearAccepeted: function() {
            window.localStorage.clear(this.options.cookieName);
        },

        _isAccepted: function(){
            if ($.mage.cookies.get(this.options.cookieName)) {
                return true;
            }

            let acceptedStorage = window.localStorage.getItem(this.options.cookieName);
            if(acceptedStorage){
                if(acceptedStorage > new Date().getTime()) {
                    this._setAccepeted();
                    return true;
                } else {
                    this._clearAccepeted();

                }
            }
            return false;
        }
    });

    return $.mage.cookieNotices;
});
