define([
    "jquery",
    'uiRegistry',
    "domReady!",
    "jquery/ui",
], function ($, registry) {
    "use strict";
    $.widget('invitationPromoBox.js', {
        _create: function () {
            var self = this;

            var ssoComponentInstance = false;

            $('body').on('click', '.js-collapse-invitation', function () {
                $('.js-invitation-promotionbox').addClass('-collapsed');
            });

            $('body').on('click', '.js-expand-invitation', function () {
                $('.js-invitation-promotionbox').removeClass('-collapsed');
            });

            $('body').on('click', '.js-close-invitation', function () {
                $('.js-invitation-promotionbox').addClass('-closed');

                //remove it completely from DOM once animation has ended
                setTimeout(function () {
                    $('.js-invitation-promotionbox').remove();
                }, 1000);
            });

            //get knockout component instance
            registry.async('headerlogin')(function (SSOcomponent) {
                ssoComponentInstance = SSOcomponent;
            });

            $('body').on('click', '.js-invitation-sso-register', function () {
                if(ssoComponentInstance) {
                    ssoComponentInstance._openModal('register');
                } else {
                    window.location = window.BASE_URL + 'customer/account';
                }
            });

            self.toggleVisibilityOfInvitationPopup()

            $(window).on('resize scroll', self.toggleVisibilityOfInvitationPopup.bind(self));
        },

        isInViewport: function (elem) {
            var elementTop = $(elem).offset().top;
            var elementBottom = elementTop + $(elem).outerHeight();

            var viewportTop = $(window).scrollTop();
            var viewportBottom = viewportTop + $(window).height();

            var headerHeight = $('.header.content.columns').outerHeight();

            return elementBottom > (viewportTop + headerHeight) && elementTop < viewportBottom;
        },

        toggleVisibilityOfInvitationPopup: function () {
            var self = this;

            var invitationPromoBox = $('.js-invitation-promotionbox:not(.-closed)');

            if (invitationPromoBox.length > 0) {
                var isScrollVisible = $(document).height() > $(window).height() + $('.page-footer').outerHeight();

                if (self.isInViewport($('.page-footer')) && isScrollVisible) {
                    invitationPromoBox.addClass('-invisible');
                } else {
                    invitationPromoBox.removeClass('-invisible');
                }
            }
        }
    });

    return $.invitationPromoBox.js;
});
