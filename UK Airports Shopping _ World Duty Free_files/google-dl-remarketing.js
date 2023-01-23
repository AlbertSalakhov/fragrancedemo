define([
    'Magento_Customer/js/customer-data'
], function (customerData) {
    return function (data) {
        window.dataLayer.push({
            'event': 'AllPages',
            'pageCategory': data.pageCategory, // Trazer a categoria do template de pagina (Checkout, Category, etc)
            'google_tag_params': {
                'ecomm_prodid': data.ecommProId, // ID do produto ou, array com id dos produtos no caso de paginas que mostram mais de um produto
                'ecomm_pagetype': data.ecommPageType, // Categoria do template, 'product', 'category','checkout' e 'purchase'
                'ecomm_totalvalue': data.ecommTotalValue // Valor do produto ou dos produtos nos casos de pagina de carrinho e finalizacao de pedido
            },
            'customer' : customerData.get('customer')()
        });
    }
});