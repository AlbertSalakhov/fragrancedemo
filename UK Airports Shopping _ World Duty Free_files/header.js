define([
    "jquery",
    "jquery/ui"
], function ($) {
    "use strict";
    $.widget('header.js', {
        _create: function () {

            var options = this.options;
            this.header = this.element;

            this._qtyMinusPlus();
            this._scrollEvents();

            if ($('.videoblock-wrapper').length > 0) {
                this._addClassIfScrollIsNotOnTop();
            }
        },
        _isMobile: function () {
            return jQuery(document).width() < 768;
        },

        _addClassIfScrollIsNotOnTop: function () {
            var headerHeight = $('.header.content.columns').outerHeight();

            if($(window).scrollTop() > headerHeight) {
                $('body').addClass('-scrolled');
            } else {
                $('body').removeClass('-scrolled');
            }
        },

        _qtyMinusPlus: function () {
            if (this._isMobile()) {

                jQuery(document).on('click', '.cart-btn-minus', function () {
                    var parentElement = $(this).parent();
                    var qtyInput = parentElement.find('input');

                    if (!parentElement.hasClass('disabled')) {
                        qtyInput.val((qtyInput.val() - 1));
                        qtyInput.trigger('change');
                        qtyInput.trigger('blur');

                        if ($('.checkout-cart-index').is('*')) {
                            $('.control.qty').each(function () {
                                $(this).addClass('disabled');
                            })
                        }
                    }
                });

                jQuery(document).on('click', '.cart-btn-plus', function () {
                    var parentElement = $(this).parent();
                    var qtyInput = parentElement.find('input');

                    if (!parentElement.hasClass('disabled')) {
                        qtyInput.val(parseInt(qtyInput.val()) + 1);
                        qtyInput.trigger('change');
                        qtyInput.trigger('blur');
                    }
                });
            } else {
                $(document).on('click', '.cart-btn-plus', function () {
                    var parentElement = $(this).parent();
                    var qtyInput = parentElement.find('input');

                    if (!parentElement.hasClass('disabled')) {
                        qtyInput.val(parseInt(qtyInput.val()) + 1);
                        qtyInput.trigger('change');
                        qtyInput.trigger('blur');

                    }
                });

                $(document).on('click', '.cart-btn-minus', function () {
                    var parentElement = $(this).parent();
                    var qtyInput = parentElement.find('input');
                    if (!parentElement.hasClass('disabled')) {
                        qtyInput.val((qtyInput.val() - 1));
                        qtyInput.trigger('change');
                        qtyInput.trigger('blur');

                        if ($('.checkout-cart-index').is('*')) {
                            $('.control.qty').each(function () {
                                $(this).addClass('disabled');
                            })
                        }
                    }
                });
            }
        },
        _scrollEvents: function () {
            var lastScroll = $(this).scrollTop();
            var self = this;

            $(window).on('scroll', function (obj) {
                var actualScroll = $(window).scrollTop();

                if (actualScroll > lastScroll) {
                    $('body').addClass('scroll-down');
                } else {
                    $('body').removeClass('scroll-down');
                }

                if(actualScroll == 0){
                    $('body').removeClass('scroll-down');
                }

                lastScroll = $(window).scrollTop();

                if ($('.product-brand-top').is('*') || $('.landing-header').is('*')) {
                    if (windowSize > 767) {
                        if ($('body').hasClass('scroll-down') && actualScroll >= 135) {
                            $('body').addClass('brands-fixed');
                        } else if (!$('body').hasClass('scroll-down') && actualScroll <= 40) {
                            $('body').removeClass('brands-fixed');
                        }
                    } else {
                        if ($('body').hasClass('scroll-down') && actualScroll >= 113) {
                            $('body').addClass('brands-fixed');
                        } else if (!$('body').hasClass('scroll-down') && actualScroll <= 40) {
                            $('body').removeClass('brands-fixed');
                        }
                    }
                }

                if ($('.videoblock-wrapper').length > 0) {
                    self._addClassIfScrollIsNotOnTop();
                }

                if($('.page-with-filter').length > 0 && $('.toolbar.toolbar-products:not(.-header)').length > 0 && $('.toolbar-header-wrapper').length > 0){
                    var filtersOffsetTop = $('.toolbar.toolbar-products:not(.-header)').eq(0).offset().top;
                    var headerHeight = $('.header.content.columns').outerHeight();
                    var stickyFiltersHeight = $('.toolbar-header-wrapper.-visible').outerHeight();

                    //due to fixed header we need to add height of headercontent + stickyFilters (in header) as it is positioned and does not give additional height to header
                    var neededWindowHeight = actualScroll + headerHeight + stickyFiltersHeight;

                    if (neededWindowHeight >= filtersOffsetTop) {
                        $('.toolbar-header-wrapper').addClass('-visible');
                    } else if (neededWindowHeight < filtersOffsetTop) {
                        $('.toolbar-header-wrapper').removeClass('-visible');
                    }
                }
            });
        }
    });

    var windowSize = $(window).outerWidth();

    $(window).on('resize', function () {
        windowSize = $(window).outerWidth();
    });

    $( document ).ready(function() {
        if ($('.brandboutique').length > 0) {
            var windowSize = jQuery(document).width();
            console.log( "window Size "+ windowSize);
            if (windowSize <= 1047) {
                var mobileBannerImage = $('.pagebuilder-slide-wrapper').attr("data-background-image-mobile");
                console.log(mobileBannerImage);
                if (mobileBannerImage !== undefined)
                    $('.pagebuilder-slide-wrapper').css("background-image",`url(${mobileBannerImage})`);
            }
        }

        var $secondaryLogoWrapper = $('.page-header .js-secondary-logo-wrapper');

        if($('body').hasClass('-has-video') && $secondaryLogoWrapper.length>0){
            $secondaryLogoWrapper.replaceWith($secondaryLogoWrapper.html());
        }
    });

    $(document).on('click', '.header.links > li.clickOpen', function (e) {
        if (windowSize < 1024) {
            var thisLi = $(this);

            if (thisLi.hasClass('active')) {
                thisLi.removeClass('active');
            } else {
                $('.header.links li.active').removeClass('active');
                thisLi.addClass('active');
            }
        }
    });
    $(document).on('mouseenter mouseleave', '.header.links > li.clickOpen', function (e) {
        if (windowSize >= 1024) {
            var thisLi = $(this);

            if (e.type === 'mouseenter') {
                thisLi.addClass('active');
            } else {
                thisLi.removeClass('active');
            }
        }
    });

    return $.header.js;
});
