define([
    'ko',
], function (ko) {
    'use strict';

    return {
        promotions: ko.observable(null),
        productUtils: ko.observable(null),
        isPromotionInitialized: ko.observable(false),
        
        setDefaultValues: function() {
            if (this.isPromotionInitialized()) {
                document.querySelector('.packs').classList.remove('special-price-pack');
                this.setFirstPack();
                this.addClassPromotion();
            }
        },

        setFirstPack: function() {
            var element = document.querySelectorAll('.pack-promotion')[0];
            
            if (element !== undefined) {
                element.click();
            }
        },

        addClassPromotion: function() {
            var element = document.querySelector('.promotion-container');

            if (this.promotions().length) {
                element.classList.add("has-promotion") 
            } else { 
                element.classList.remove("has-promotion");
                this.setQtyToDefault();
            }
        },

        setQtyToDefault: function() {
            var element = document.getElementById("qty");
            element.value = 1;
        }
    };
});