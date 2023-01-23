/*!
 * dufryApp v2.0
 */
window['dufryApp'] = null;
require([
    'jquery',
    'popper.js',
    'Magento_Ui/js/modal/modal',
    'bootstrap4',
    'jquery-maskedinput',
    'text!templates/modal/modal-popup.html',
    'selectpciker',
    'mage/cookies'
], function ($, Popper, modal, Bootstrap, maskedinput, popupTpl) {
    var dufryApp = { // attach to global scope
        init: function () {
            var app = this;

            if (jQuery('body').is('.checkout-cart-index') || jQuery('body').is('.checkout-index-index')) {
                jQuery('.modal-dialog.airport, .airport-modal-trigger').remove();
            }

            this._maskedInputs();
            this.are_cookies_enabled();
            this.uxReviews();
            this.bindGTMEvents();
            this.openCotaModalEvent();
            this.scrollEvents();
            this.clickRedCustomer();
            this.readBrandBoutiqueSliders();

            var attrAirportObserver = setInterval(function () {
                //if ( typeof window.localStorage != 'undefined' ) {
                var airportID_localStorage = app.getCookie("airport");
                var old_airportID_localStorage = document.getElementsByTagName("body")[0].getAttribute("data-airport-id");
                if (airportID_localStorage.length && airportID_localStorage != old_airportID_localStorage) {
                    document.getElementsByTagName("body")[0].setAttribute("data-airport-id", airportID_localStorage);
                    clearInterval(attrAirportObserver);
                } else if (airportID_localStorage.length && airportID_localStorage == old_airportID_localStorage) {
                    clearInterval(attrAirportObserver);
                } else if (!airportID_localStorage.length) {
                    document.getElementsByTagName("body")[0].setAttribute("data-airport-id", "");
                    clearInterval(attrAirportObserver);
                }
                //}
            }, 500);
            jQuery("#search").prop('autofocus');
        },

        clickRedCustomer: function(){
        },

        scrollEvents: function () {
            jQuery('body').on('click', '.back-top, .scroll-to', function (e) {
                e.preventDefault();
                var top = 0;
                var target = jQuery(jQuery(this).attr('data-target'));
                if (target.length > 0) {
                    top = jQuery(target[0]).offset().top;
                }

                jQuery('html, body').animate({
                    scrollTop: top
                }, 2000);
            });
        },

        _vai_viajar: function () {
            var app = this;

            jQuery('#form-vai-viajar').on('submit', function (e) {
                e.preventDefault();
                var drinks = jQuery("#bebidas").prop("checked") ? true : false;
                var travel_articles = jQuery("#artigos_viagem").prop("checked") ? true : false;
                var make_up_cosmetics = jQuery("#make_up_cosmetics").prop("checked") ? true : false;
                var toys_hobbies = jQuery("#toys_hobbies").prop("checked") ? true : false;
                var cosmetics = jQuery("#cosmetics").prop("checked") ? true : false;
                var fashion_accessories = jQuery("#fashion_accessories").prop("checked") ? true : false;
                var electronics = jQuery("#electronics").prop("checked") ? true : false;
                var perfumes = jQuery("#perfumes").prop("checked") ? true : false;
                var sou_viajante = jQuery("#viajante").prop("checked") ? true : false;
                var base_url = (window.BASE_URL == undefined) ? '' : window.BASE_URL;

                jQuery.ajax({
                    url: base_url + '/dufryentities/email/reports',
                    type: "POST",
                    dataType: "json",
                    data: JSON.stringify({
                        name: jQuery('input[name=nome]').val(),
                        email: jQuery('input[name=email]').val(),
                        boarding: jQuery('input[name=embarque]').val(),
                        landing: jQuery('input[name=desembarque]').val(),
                        sou_viajante: sou_viajante,
                        drinks: drinks,
                        travel_articles: travel_articles,
                        make_up_cosmetics: make_up_cosmetics,
                        toys_hobbies: toys_hobbies,
                        cosmetics: cosmetics,
                        fashion_accessories: fashion_accessories,
                        electronics: electronics,
                        perfumes: perfumes,
                    }),
                    success: function (data) {


                        if (data.success == "false") {
                            alert('Houve um erro tente novamente e verifique seus dados!');
                        } else {
                            alert('Cadastro Feito Com Sucesso!');
                            document.location.reload();
                        }
                    }
                });

            });
        },

        isMobile: function () {
            return jQuery(window).width() < 768;
        },

        _maskedInputs: function () {
            jQuery('[masked-input]').each(function () {
                jQuery(this).mask(jQuery(this).attr('masked-input'));
                jQuery(this).remove('masked-input');
            });
        },
        _formsRequiredBullets: function () {
            jQuery('[data-validate]').each(function () {
                if (jQuery(this).attr('data-validate').indexOf('required:true') > -1) {
                    var label = jQuery(this).closest('.form-group, .radio, .checkbox').find('label');

                    label.each(function () {
                        var currentLabel = jQuery(this);
                        if (currentLabel.text().indexOf('*') == -1) currentLabel.html(currentLabel.html().trim() + '<i>*</i>');
                    });

                }
            });
        },
        customSerachForm: function () {
            return this.customSearchForm();
        },
        customSearchForm: function () {
            jQuery('.custom-search-from').each(function () {
                var form = jQuery(this);
                form.on('keydown', 'input.search', function (e) {
                    if (e.which == 13) submit();
                });
                form.on('click', '.btn-transparent', function (e) {
                    submit();
                });

                function submit() {
                    jQuery('#search').val(form.find('input.search').val());
                    jQuery('#search_mini_form').submit();
                }
            });
        },
        uxReviews: function () {
            var self = this;

            if (jQuery('body').is('.catalogsearch-result-index') || jQuery('body').is('.page-with-filter') || jQuery('body').is('.catalog-category-view')) {
                jQuery(window).on('resize', function () {
                    if (self.isMobile()) {
                        jQuery('#layered-filter-block').find('.active[data-role="collapsible"] [data-role="title"]').trigger('click');
                    } else {
                        jQuery('#layered-filter-block').find('[data-role="collapsible"]:not(.active) [data-role="title"]').trigger('click');
                    }
                }).trigger('resize');
            }


            if (jQuery('.sidebar.sidebar-main').size() > 0 || jQuery('.sidebar.sidebar-additional').size() > 0) {
                if (jQuery('.sidebar.sidebar-main').size() && jQuery('.sidebar.sidebar-main').html().trim().length < 5) {
                    jQuery('.sidebar.sidebar-main').remove();
                }
                if (jQuery('.sidebar.sidebar-additional').size() && jQuery('.sidebar.sidebar-additional').html().trim().length < 5) {
                    jQuery('.sidebar.sidebar-additional').remove();
                }

                setTimeout(function () {
                    if (jQuery('.sidebar.sidebar-main').size() < 1 && jQuery('.sidebar.sidebar-main').size() < 1) {
                        jQuery('.column.main').css('width', '100%');
                    }
                }, 500);
            }

            /*
                  if(!this.isMobile()){
                      jQuery('.footer.social').height(jQuery('.footer.links').height());
                  }
                  */

        },
        clearAirportData: function () {
            if (jQuery('body').is('.checkout-index-index')) return;
            this._deleteCookie('airport');
            this._deleteCookie('airline');
            this._deleteCookie('terminal_type');
            this._deleteCookie('retrieval_date');
            this._deleteCookie('airport-modal-data');
        },

        selectpickers: function () {
            jQuery('.selectpicker, .selectpickers, .select-picker, .selectpicker select, .select-picker select').selectpicker();
        },

        openCotaModalEvent: function () {
            var app = this;

            var options = {
                type: 'popup',
                popupTpl: popupTpl,
                trigger: '[data-trigger=modalQuota]',
                responsive: false,
                modalClass: 'dufry-quota-modal',
                title: $.mage.__('Understand your quota'),
                opened: function () {

                    $('#cotaModal').trigger('contentUpdated');
                    var list = jQuery("#dufry-quota-items");
                    list.attr('data-mage-init', '{"accordion":{"openedState": "active", "collapsible": true, "active": false, "multipleCollapsible": false}}');
                    list.trigger('contentUpdated');

                },
                buttons: [{
                    text: 'Fechar',
                    class: 'action primary',
                    click: function () {
                        this.closeModal();
                    }
                }]
            };

            modal(options, $('#cotaModal'));

            $(document).on('click', '[data-trigger=cotaModal]', function () {
                $('#cotaModal').modal('openModal');
            });
        },

        triggerModals: function () {

            jQuery('.modal-trigger').each(function () {
                jQuery(this).on('click', function () {
                    var trigger = jQuery(this);
                    var target = jQuery(trigger.attr('data-target'));

                    if (target.size() == 0) return false;

                    target.toggleClass('active');
                    target.slideToggle();
                });
            });
            jQuery('[data-toggle="popover"]').popover({
                trigger: 'click hover'
            });
            jQuery('[data-toggle="tooltip"]').tooltip({
                container: 'body'
            });

            jQuery(document).ajaxComplete(function () {
                jQuery('[data-toggle="tooltip"]').filter(':not("[data-original-title]")').tooltip({
                    container: 'body'
                });
            });

        },

        are_cookies_enabled: function () {
            var app = this;
            if (app.isMobile()) {
                try {
                    // try to use localStorage
                    localStorage.test = 2;
                    // return true;
                } catch (e) {
                    // there was an error so...
                    $(".alert").show();
                    //alert('You are in Privacy Mode\nPlease deactivate Privacy Mode and then reload the page.');
                    // return false;
                }
            } else {

                try {
                    // try to use localStorage
                    localStorage.test = 2;
                    // return true;
                } catch (e) {
                    // there was an error so...
                    $(".alert").show();
                    //alert('You are in Privacy Mode\nPlease deactivate Privacy Mode and then reload the page.');
                    // return false;
                }
            }

        },


        openModal: function () {
            jQuery('.cota-modal-mini-trigger').trigger('click');
        },

        saveJSONLocalStorage: function (key, value) {
            window.localStorage.setItem(key, JSON.stringify(value));
        },
        getJSONLocalStorage: function (key) {
            return JSON.parse(window.localStorage.getItem(key));
        },

        adjustSwiperItemClass: function (i) {
            /*if(typeof i == 'undefined') i = (jQuery(window).width()<=375)?0:5;

            var continuity = i-2;

            jQuery('.swiper-wrapper').each(function(){
                var swiper = jQuery(this);
                swiper.find('.swiper-slide.lastItem').removeClass('lastItem');
                if(i == 0 || i == 1){
                    swiper.find('.swiper-slide-active').addClass('lastItem');
                }else{
                    swiper.find('.swiper-slide-next').each(function() {
                        var item = jQuery(this);
                        for (var i = 0; i < continuity; i++) {
                            item = item.next();
                        }
                        item.addClass('lastItem');
                    });
                    swiper.find('.swiper-button-next, .swiper-button-prev').click(function() { app.adjustSwiperItemClass(); });
                }

            });*/
        },
        //Composite
        productsPageReviewsUX: function () {
            jQuery('.default-block').each(function () {
                if (jQuery(this).html().trim().length == 0) jQuery(this).remove();
            });
            if (!jQuery('.review-form').size() > 0) return false;
            this.initReviewFormStars();

            jQuery('.product.media').height(jQuery('.product-info-main').outerHeight() - 30);
            if (jQuery('.default-block').size() > 0) {
                jQuery('.default-block').each(function () {
                    if (jQuery(this).html().trim().length == 0) jQuery(this).remove();
                });

            }
        },
        initReviewFormStars: function () {
            jQuery('.review-form .review-control-vote').each(function () {
                var wrapper = jQuery(this);
                var stars = wrapper.children('label');
                stars.on('click', function () {
                    var clicked = jQuery(this);

                    var index = parseInt(clicked.attr('class').replace('rating-', ''));

                    jQuery('#' + clicked.attr('for')).trigger('click');
                    jQuery('#' + clicked.attr('for')).attr('checked', 'checked');

                    for (var i = 1; i <= index; i++) {
                        wrapper.find('.rating-' + i + ' .fa-star-o').hide();
                        wrapper.find('.rating-' + i + ' .fa-star').show();
                    }

                    if (index == 5) return false;

                    for (var i = 5; i > index; i--) {
                        wrapper.find('.rating-' + i + ' .fa-star').hide();
                        wrapper.find('.rating-' + i + ' .fa-star-o').show();
                    }
                });
            });
        },
        //Template Called
        increaseQty: function (selector, qty) {
            if (typeof selector == 'undefined') return false;
            if (typeof qty !== 'number') qty = 1;

            var value = parseInt(jQuery(selector).val());

            jQuery(selector).val(value + 1);
        },
        decreaseQty: function (selector, qty) {
            if (typeof selector == 'undefined') return false;
            if (typeof qty !== 'number') qty = 1;

            var value = parseInt(jQuery(selector).val());
            if (value > 1) {
                jQuery(selector).val(value - 1);
            }
        },
        hasObserver: false,
        checkoutButtonTrigger: function () {

            if (!this.validateCheckoutPassword() || !jQuery('#airport form').valid()) return false;

            jQuery('#checkout-step-shipping_method .action.continue').trigger('click');

            if (this.hasObserver) return;
            this.hasObserver = true;
            jQuery(document).ajaxComplete(function (event, xhr, settings) {
                if ((settings.url.indexOf('rest/default/V1/guest-carts/') > -1 && settings.url.indexOf('/shipping-information') > -1) || settings.url.indexOf('rest/default/V1/carts/mine/shipping-information') > -1) {
                    var interval = setInterval(function () {
                        if (jQuery('._active .action.primary.checkout').is(':disabled')) {
                            clearInterval(interval);
                            return false;
                        }
                        jQuery('._active .action.primary.checkout').trigger('click').attr('disabled', 'disabled');
                    }, 500);
                }
            });
        },
        validateCheckoutPassword: function () {
            if (!jQuery('#shipping #customer-new-password').is(':visible')) return true;
            var newPass = jQuery('#shipping #customer-new-password');
            var newPassConfirm = jQuery('#shipping #customer-new-password-confirmation');


            if (newPass.val().length < 6) {
                newPass.parent().find('.mage-error').remove();
                newPass.parent().append('<div generated="true" class="mage-error">A senha é obrigatória e recisa ter ao menos 6 caracteres</div>');
                return false;
            }

            if (newPass.val() !== newPassConfirm.val()) {
                newPass.parent().find('.mage-error').remove();
                newPass.parent().append('<div generated="true" class="mage-error">As senhas precisam ser iguais</div>');
                return false;
            }

            newPass.parent().find('.mage-error').remove();

            return true;
        },
        shareThisOnFacebook: function () {
            var uri = window.location.href;
            this.openPopup('https://www.facebook.com/sharer/sharer.php?u=' + uri, 'Share on Facebook', 555, 355);
        },
        shareThisOnTwitter: function () {
            var uri = window.location.href;
            this.openPopup('http://twitter.com/share?url=' + uri, 'Tweet this', 555, 355);
        },
        shareThisOnGoogle: function () {
            var uri = window.location.href;
            this.openPopup('https://plus.google.com/share?url=' + uri, 'Tweet this', 555, 355);
        },
        shareThisOnPintrest: function () {
            var uri = window.location.href;
            this.openPopup('http://pinterest.com/pin/create/link/?url=' + encodeURIComponent(uri), 'PinIt', 555, 355);
        },
        openPopup: function (url, title, w, h) {
            // Fixes dual-screen position                         Most browsers      Firefox
            var dualScreenLeft = window.screenLeft != undefined ? window.screenLeft : screen.left;
            var dualScreenTop = window.screenTop != undefined ? window.screenTop : screen.top;

            var width = window.innerWidth ? window.innerWidth : document.documentElement.clientWidth ? document.documentElement.clientWidth : screen.width;
            var height = window.innerHeight ? window.innerHeight : document.documentElement.clientHeight ? document.documentElement.clientHeight : screen.height;

            var left = ((width / 2) - (w / 2)) + dualScreenLeft;
            var top = ((height / 2) - (h / 2)) + dualScreenTop;
            var newWindow = window.open(url, title, 'scrollbars=yes, width=' + w + ', height=' + h + ', top=' + top + ', left=' + left);

            // Puts focus on the newWindow
            if (window.focus) {
                newWindow.focus();
            }
        },
        loadAirportData: function () {
            var airport = window.dufryApp.getCookie('airport');
            var airline = window.dufryApp.getCookie('airline');
            var terminal = window.dufryApp.getCookie('terminal_type');
            if (typeof airport !== 'undefined') {
                jQuery('[data-id="airport"]').each(function () {
                    jQuery(this).find('option[value="' + airport + '"]').prop('selected', 'selected').trigger('change');
                });
            }
            if (typeof airline !== 'undefined') {
                jQuery('[data-id="airline"]').each(function () {
                    jQuery(this).find('option[value="' + airline + '"]').prop('selected', 'selected').trigger('change');
                    //jQuery(this).selectpicker('refresh');
                });
            }
            if (typeof terminal !== 'undefined') {
                jQuery('[name="terminal_type"]').each(function () {
                    if (jQuery(this).val() == terminal) jQuery(this).attr('checked', 'checked');
                });
            }
            
        },
        setCookie: function (cname, cvalue, exdays) {
            if (typeof exdays == 'undefined') exdays = 30;
            var d = new Date();
            d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
            $.mage.cookies.set(cname, cvalue, {path: '/', expires: d});
        },
        getCookie: function (cname) {
            return $.mage.cookies.get(cname) || "";
        },
        verifyIfAirportSelected: function () {
            var airport = dufryApp.getCookie('airport');
            return (airport != null && airport != 'null' && airport != '');
        },
        customGTMEvent: function (evento, attrs) {
            if (typeof window.dataLayer == 'undefined') {
                console.log('dataLayer undefined');
                return false;
            }

            var eventVars = {},
                attrName;

            eventVars['event'] = evento;
            for (attrName in attrs) {
                eventVars[attrName] = attrs[attrName];
            }

            window.dataLayer.push(eventVars);
        },
        bindGTMEvents: function () {
            var app = this;
            jQuery('body').on('click', '#blueLabFloatingRobot, a[data-click=trackDuda]', function () {
                app.customGTMEvent('evento', {
                    'categoria': 'duda',
                    'acao': 'acionar-chat'
                });
            });

            jQuery('body.cms-fale-conosco').on('click', 'a.btn_conversar, a[data-click=trackDuda]', function () {
                app.customGTMEvent('evento', {
                    'categoria': 'duda',
                    'acao': 'conversar-chat'
                });
            });

            return true;
        },

        readBrandBoutiqueSliders: function (){
            var totalRowSliders = jQuery('#brand-content .swiper-container .swiper-wrapper');
            if(totalRowSliders.length > 0){
                jQuery.each(totalRowSliders, function(index, val) {

                    var prevArrowDisabled = jQuery(this).siblings('.swiper-button-prev').hasClass('swiper-button-disabled');
                    var nextArrowDisabled = jQuery(this).siblings('.swiper-button-next').hasClass('swiper-button-disabled');

                    if(prevArrowDisabled && nextArrowDisabled){
                        jQuery(this).siblings('.swiper-button-prev').css('display','none');
                        jQuery(this).siblings('.swiper-button-next').css('display','none');
                    }
                });
            } 
        }
        
    };

    window['dufryApp'] = dufryApp;

    window['dufryApp'].init();

});
