/**
 * Copyright © Magento, Inc. All rights reserved.
 * See COPYING.txt for license details.
 */

define([
    'uiComponent',
    'Magento_Customer/js/customer-data',
    'jquery',
    'ko',
    'underscore',
    'loader',
    'sidebar',
    'mage/translate',
    'mage/dropdown'
], function (Component, customerData, $, ko, _) {
    'use strict';

    let sidebarInitialized = false,
        addToCartCalls = 0,
        miniCart,
        minicartWrapper;

    miniCart = $('[data-block=\'minicart\']');
    minicartWrapper  = miniCart.find('#minicart-content-wrapper');
    minicartWrapper.loader();
  
    /**
     * @return {Boolean}
     */
    function initSidebar() {
        if (miniCart.data('mageSidebar')) {
            miniCart.sidebar('update');
        }


        if (!$('[data-role=product-item]').length) {
            return false;
        }

        miniCart.trigger('contentUpdated');

        if (sidebarInitialized) {
            return false;
        }
        sidebarInitialized = true;
        miniCart.sidebar({
            'targetElement': 'div.block.block-minicart',
            'url': {
                'checkout': window.checkout.checkoutUrl,
                'update': window.checkout.updateItemQtyUrl,
                'remove': window.checkout.removeItemUrl,
                'loginUrl': window.checkout.customerLoginUrl,
                'isRedirectRequired': window.checkout.isRedirectRequired
            },
            'button': {
                'checkout': '#top-cart-btn-checkout',
                'remove': '#mini-cart a.action.delete',
                'close': '#btn-minicart-close'
            },
            'showcart': {
                'parent': 'span.counter',
                'qty': 'span.counter-number',
                'label': 'span.counter-label'
            },
            'minicart': {
                'list': '#mini-cart',
                'content': '#minicart-content-wrapper',
                'qty': 'div.items-total',
                'subtotal': 'div.subtotal span.price',
                'maxItemsVisible': window.checkout.minicartMaxItemsVisible
            },
            'item': {
                'qty': ':input.cart-item-qty',
                'button': ':button.update-cart-item'
            },
            'confirmMessage': $.mage.__('Are you sure you would like to remove this item from the shopping cart?')
        });
    }

    miniCart.on('dropdowndialogopen', function () {
        initSidebar();
    });

    return Component.extend({
        shoppingCartUrl: window.checkout.shoppingCartUrl,
        maxItemsToDisplay: window.checkout.maxItemsToDisplay,
        cart: {},

        // jscs:disable requireCamelCaseOrUpperCaseIdentifiers
        /**
         * @override
         */
        initialize: function () {
            let self = this,
                cartData = customerData.get('cart');
            window.customerData = customerData;
            this.update(cartData());
            cartData.subscribe(function (updatedCart) {
                addToCartCalls--;
                this.isLoading(addToCartCalls > 0);
                sidebarInitialized = false;
                this.update(updatedCart);
                initSidebar();
            }, this);

            miniCart.on('contentLoading', function () {
            /** Show minicart when user adding multiple Quantity of product and also for first time*/
              cartData = customerData.get('cart');
              cartData.subscribe(function (cartCount) {
                  if(cartCount.summary_count > 0){
                      if($(window).width() < 767){
                          $('.mage-dropdown-dialog').css('display','');
                          $('html').addClass('hideScroll');
                      }
                  }
              });
            addToCartCalls++;
            self.isLoading(true);
            });

            if (cartData().website_id !== window.checkout.websiteId &&
                cartData().website_id !== undefined
            ) {
                customerData.reload(['cart'], false);
            }

          this.isLoading.subscribe(function(data){
            if(data) {
              minicartWrapper.trigger('processStart')
            } else {
              minicartWrapper.trigger('processStop')
            }
          });

            return this._super();
        },
        //jscs:enable requireCamelCaseOrUpperCaseIdentifiers

        isLoading: ko.observable(false),
        initSidebar: initSidebar,

        /**
         * Close mini shopping cart.
         */
        closeMinicart: function () {
            $('[data-block="minicart"]').find('[data-role="dropdownDialog"]').dropdownDialog('close');
        },

        /**
         * @return {Boolean}
         */
        closeSidebar: function () {
            let minicart = $('[data-block="minicart"]');

            minicart.on('click', '[data-action="close"]', function (event) {
                event.stopPropagation();
                minicart.find('[data-role="dropdownDialog"]').dropdownDialog('close');
            });

            return true;
        },

        /**
         * @param {String} productType
         * @return {*|String}
         */
        getItemRenderer: function (productType) {
            return this.itemRenderer[productType] || 'defaultRenderer';
        },

        /**
         * Update mini shopping cart content.
         *
         * @param {Object} updatedCart
         * @returns void
         */
        update: function (updatedCart) {
            _.each(updatedCart, function (value, key) {
                if (!this.cart.hasOwnProperty(key)) {
                    this.cart[key] = ko.observable();
                }
                this.cart[key](value);
            }, this);
        },

        /**
         * Get cart param by name.
         * @param {String} name
         * @returns {*}
         */
        getCartParam: function (name) {
            if (!_.isUndefined(name)) {
                if (!this.cart.hasOwnProperty(name)) {
                    this.cart[name] = ko.observable();
                }
            }
            return this.cart[name]();
        },

        /**
         * Returns array of cart items, limited by 'maxItemsToDisplay' setting
         * @returns []
         */
        getCartItems: function () {
            let items = this.getCartParam('items') || [];

            items = items.slice(parseInt(-this.maxItemsToDisplay, 10));

            return items;
        },

        /**
         * Returns count of cart line items
         * @returns {Number}
         */
        getCartLineItemsCount: function () {
            let items = this.getCartParam('items') || [];

            return parseInt(items.length, 10);
        },

        /**
         * Return if quota module is active
         * @return {Boolen}
         */
        isQuotaActive: function () {
            let is_active = false,
                quotaData = customerData.get('quota');
            if (typeof quotaData().is_active == 'undefined') {
                is_active = false;
            } else if (quotaData().is_active == 0) {
                is_active = false
            } else if (quotaData().validated_rules == 'undefined'){
                is_active = false
            } else if (quotaData().validated_rules == false){
                is_active = false
            } else if (quotaData().is_active == 1) {
                is_active = true
            }
            return is_active;
        },

        /**
         * Return if quota is valid for current cart
         * @return {Boolen}
         */
        isQuotaValid: function () {
            return customerData.get('quota')().is_valid_cart;
        },

        isEmporiumActive: function () {
            return customerData.get('emporium_customer')().is_active;
        },

        isEmporiumCartValid: function () {
            if (!this.isEmporiumActive()) {
                return true;
            }

            return customerData.get('emporium_customer')().estimate_new_balance >= 0;
        },

        /**
         * Returns customer data get object
         * @param  {String} key Key to find into customer data
         * @return {Object}     customerData
         */
        getCustomerData: function (key) {
            return customerData.get(key);
        }

    });
});