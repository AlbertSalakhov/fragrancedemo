define([
  'uiComponent',
  'Magento_Customer/js/customer-data',
  'jquery',
  'ko',
  'underscore',
  'sidebar',
  'mage/translate',
  'accordion'
], function (Component, customerData, $, ko, _) {
    //'use strict';
    return Component.extend({
        quota: {},
        initialize: function () {
            var quotaData;
            this._super();
            this.quotaData = customerData.get('quota');
            this.setAccordion();
        },
        getValidatedRules: function(){
          var vr_Objects, validated_rules, type;
          vr_Objects = this.quotaData().validated_rules;
          //type = typeof vr_Objects;

          if(vr_Objects != undefined){
            var validated_rules = ko.observableArray([
              Object.values(vr_Objects)
            ]);
          }else{
            var validated_rules = ko.observableArray([
            ]);
          }

          //type = typeof validated_rules;

          return validated_rules;
        },
        closeMinicart: function () {
            $('[data-block="minicart"]').find('[data-role="dropdownDialog"]').dropdownDialog('close');
        },
        getValidCart: function(){
          return  this.quotaData().is_valid_cart;
        },
        getQuotaValue: function(){
          return this.quotaData().quota_value;
        },
        setAccordion: function(){
          var list = jQuery("#dufry-quota-items");
          list.attr('data-mage-init','{"accordion":{"openedState": "active", "collapsible": true, "active": false, "multipleCollapsible": false}}');
          list.trigger('contentUpdated');
        }
    });
});
