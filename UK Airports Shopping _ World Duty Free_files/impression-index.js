define([
    'jquery',
    'Magento_Customer/js/customer-data',
    'Dufry_GoogleTagManager/js/google-dl-remarketing',
    'Magento_GoogleTagManager/js/google-tag-manager'
], function($, customerData, remarketing){
    'use strict';
    var bindSubscribe = false;

    function notify(user) {
        bindSubscribe = customerData.get('customer').subscribe(function(customer){
            if(!_.isEmpty(customer.id)){
                generateImpressions(_.extend(user, customer));
                bindSubscribe.dispose();
            }
        });
    }

    function generateImpressions(user)
    {
        var productsArray = document.querySelectorAll('[data-product]');
        if(productsArray.length > 0){
            var dlImpressions = {
                'event': 'productImpression',
                'ecommerce': {
                    'impressions': []
                }
            };

            var dataRemarketing = {
                ecommProId: [],
                ecommPageType: 'home',
                ecommTotalValue: [],
                pageCategory: ""
            };
            dataRemarketing.userId = user.customer_red_id;

            for (var i = 0; i < productsArray.length; i++) {
                if(_.isEmpty(productsArray[i].dataset.product) || !_.isObject(productsArray[i].dataset.product)){
                    continue;
                }
                var product = JSON.parse(productsArray[i].dataset.product);
                product.position = i + 1;
                product.list = 'Home Page';
                dlImpressions.ecommerce.impressions.push(product);
                impressionClick(product.id, product.name, product.category, product.list, product.position, product.brand, product.price);
            }

            window.dataLayer.push(dlImpressions);
        }
        var dataRemarketing = {

        };

        remarketing(dataRemarketing);
    }
    function impressionClick(id, name, category, list, position, brand, price) {
        $('#sku-' + id + ' a').click(function(){
            window.dataLayer.push({
                'event': 'productClick',
                'ecommerce': {
                    'click': {
                        'actionField': {
                            'list': list
                        },
                        'products': [{
                            'id': id,
                            'name': name,
                            'list': list,
                            'position': position,
                            'category': category,
                            'brand': brand,
                            'price': price
                        }]
                    }
                }
            });
        }).bind(this);
    }

    return function(user) {
        window.dataLayer ?
            notify(user) :
            $(document).on('ga:inited', notify.bind(this));
    }
});
