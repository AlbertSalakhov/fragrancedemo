define([
    'ko',
], function (ko) {
    'use strict';


    return {
        threshold: ko.observable(1),
        productAvailable: ko.observable(true),
        inStock: function() {
            return (this.qty() > 0 && this.productAvailable()) ;
        },
        lowStock: function(){
            return (this.threshold() > 0 && this.threshold() > this.qty());
        },
        qty: ko.observable(null)
    };
});
