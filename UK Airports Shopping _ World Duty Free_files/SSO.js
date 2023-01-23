define([
    'uiComponent',
    'jquery',
    'Magento_Customer/js/customer-data',
    'Magento_Customer/js/model/customer',
    'mage/url'
], function(Component, $, customerData, customer, url) {

    return Component.extend({
        initialize: function(data) {
            this._super();
            if (this.data === undefined && data !== undefined) {
                this.setData(data);
            }
            this.isFixed = false;
            this.hovering = false;
            this.customer = customerData.get('customer');
            this.observe(['customer']);
            this.customer.subscribe(function(data) {
                let isLoggedIn = false;
                if (data.hasOwnProperty('id') && Boolean(data.id)) {
                    isLoggedIn = true;
                }
                customer.setIsLoggedIn(isLoggedIn);
            });
            this.isApp();
            this.applyBind(data);
            this._initEvents();
            this._createIframes();
            url.setBaseUrl(this.data.websiteDomain);
            var self = this;
            $(document).on("click", function(e) {
                if (self.isMobile()) {
                    if ($(e.target).is('.header-login__link,.header-login__container,.header-login__body,.header-login__red,.header-login__red-logo,.header-login__red-actions,.header-login__red-actions action,.header-login__red-text,.header-login__red-text p,.header-login__list,.header-login__item')) {
                        return false;
                    } else {
                        $('.header-login').removeClass('active');
                        $('.header-login__container').hide();
                    }
                }
            });
            $(document).on("open-sso", function(e, data) {
                let config = false;
                if(data.hasOwnProperty('type')){
                    config = data.type;
                }
                self._openModal(config);
            });
        },

        customerData: function(section) {
            return customerData.get(section)();
        },

        setData: function(data) {
            this.data = data;
        },

        getCustomer: function() {
            return this.customer();
        },

        isLoggedIn: function() {
            return (typeof this.getCustomer().id != 'undefined');
        },

        isMobile: function() {
            return window.outerWidth <= 1024;
        },

        show: function(ui, e) {
            if (!this.isFixed && !this.isMobile()) {
                this.hovering = true;
                $(e.currentTarget).parent().addClass('active');
            }
        },

        hide: function(ui, e) {
            if (!this.isFixed && !this.isMobile()) {
                this.hovering = false;
                $(e.currentTarget).parent().removeClass('active');
            }
        },

        toggle: function(ui, e) {
            this.isFixed = !this.isFixed;

            if (!this.hovering) {
                this.hovering = false;
                $(e.currentTarget).parent().toggleClass('active');
                if (this.isMobile()) {
                    if (!$(e.currentTarget).parent().hasClass('active')) {
                        if ($('.header-login__container').is(':visible')) {
                            $('.header-login__container').hide();
                        }
                    } else {
                        $('.header-login__container').show();
                    }
                }
            }
        },

        getUrl: function(path) {
            return url.build(path);
        },

        isApp: function() {
            if (window.localStorage.getItem('isapp')) {
                $('body').addClass('isapp');
                this.appLazyLoad();
            } else {
                let isApp = this.getParam('isApp') !== null;
                let isapp = this.getParam('isapp') !== null;
                if (isApp || isapp) {
                    window.localStorage.setItem('isapp', true);
                    $('body').addClass('isapp');
                    this.appLazyLoad();
                }
            }
        },

        appLazyLoad: function() {
            $('.page-wrapper').on('scroll', function() {
                window.lazyLoad()
            });

        },

        getParam: function(name) {
            let results = new RegExp('[\?&]' + name + '=([^&#]*)').exec(window.location.href);
            let results2 = new RegExp('[\?&]' + name + '([^&#]*)').exec(window.location.href);
            if (!results && results2) {
                results = results2;
            }

            if (results == null) {
                return null;
            } else {
                return results[1] || 0;
            }
        },
        applyBind: function(data) {
            var self = this;
            if (data.path == 'profile') {
                if ($('a.sso-profile').length !== 0) {
                    $('a.sso-profile').on('click', function() {
                        self._openModal('profile');
                    })
                }
            }
        },
        _initEvents: function() {
            let self = this;
            let element = this.element;

            if (!$('body').is('.sso-event-init')) {
                window.addEventListener("message", function receiveMessage(event) {
                    if (event.data.success) {
                        self.invalidateCustomerData();
                        if (event.data.canreload) {
                            location.reload();
                        }
                    } else {
                        if (typeof event.data.message == 'string') {
                            alert(event.data.message);
                        }
                    }
                }, false);

                window.sso = self;

                $('body').addClass('sso-event-init');
            }
        },
        _makeUrl: function(type) {

            let url = this.data['base_link'];

            if (type === 'profile') {
                url += 'profile';
            }

            if (this.data['is_auth']) {
                if (type !== 'logout') {
                    if (type === 'login') {
                        url += 'login';
                    } else {
                        url += 'register';
                    }
                } else if (type === 'logout') {
                    url = this.data['base_link'];
                    url += '/api/logout';
                    url += '?redirect_uri=' + this.data['websiteDomain'];
                    url += '&client_id=' + this.data.client;
                    return url;

                    this.invalidateCustomerData();
                }
            }

            url += '?response_type=code';
            url += '&redirect_uri=' + this.data['redirect'];
            url += '&client_id=' + this.data['client'];
            url += '&scope=openid+email';
            url += '&privacy_url=' + this.data['privacy'];
            return url;
        },

        invalidateCustomerData: function() {
            customerData.invalidate(['customer', 'redbydufry', 'cart', 'product_images']);
            customerData.reload(['customer', 'redbydufry', 'cart', 'product_images'], true);
        },

        _createIframes: function() {
            let isBodyClassCheckout = $("body").is(".checkout-index-index");
            let isBodyClassCart = $("body").is(".checkout-cart-index");
            let isBodyClassLogout = $("body").is(".customer-account-logoutsuccess");
            if (isBodyClassCheckout || isBodyClassCart || isBodyClassLogout) {
                if ($('#sso-silent').length > 0) {
                    return;
                }
                if (isBodyClassLogout) {
                    $('body').append('<iframe id="sso-silent" src="' + this._makeUrl('logout') + '" style="display:none !important;width:0;height:0;border:0;" frameborder="0"></iframe>');
                } else {
                    if (!customerData.get('customer').firstname) {
                        $('body').append('<iframe id="sso-silent" src="' + this._makeUrl('auth').replace('register', 'login').replace('/?login', '/login?login') + '" style="display:none !important;width:0;height:0;;border:0;" frameborder="0"></iframe>');
                    }
                }
            }
        },

        _openModal: function(type = false) {
            let url = this._makeUrl(type);
            let title = 'SSO';
            let w = (typeof this.data.width == 'undefined') ? 400 : this.data.width;
            let h = (typeof this.data.height == 'undefined') ? 600 : this.data.height;

            // Fixes dual-screen position                         Most browsers      Firefox
            let dualScreenLeft = window.screenLeft != undefined ? window.screenLeft : window.screenX;
            let dualScreenTop = window.screenTop != undefined ? window.screenTop : window.screenY;

            let width = window.innerWidth ? window.innerWidth : document.documentElement.clientWidth ? document.documentElement.clientWidth : screen.width;
            let height = window.innerHeight ? window.innerHeight : document.documentElement.clientHeight ? document.documentElement.clientHeight : screen.height;

            let left = ((width / 2) - (w / 2)) + dualScreenLeft;
            let top = ((height / 2) - (h / 2)) + dualScreenTop;

            this.window = window.open(url, title, 'scrollbars=yes, width=' + w + ', height=' + h + ', top=' + top + ', left=' + left);

            // Puts focus on the newWindow
            if (window.focus) {
                this.window.focus();
            }
        }

    });
});
