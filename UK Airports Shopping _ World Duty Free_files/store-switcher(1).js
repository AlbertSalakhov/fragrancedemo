/**
 * @api
 */
define([
    'ko'
], function (ko) {
    'use strict';

    return {
        valid: ko.observable(false),
        triggerOpenModal: ko.observable(false),
        selectedLocation: ko.observable(null),
        selectedLanguage: ko.observable(null),
        currentTerminals: ko.observable(null),
        product: {
            id: null,
            qty: 1
        },
        getDateDropdownOptions: function(config) {
            var displayInstore = config.dufry_data_config.datepicker_selection_dropdown_label_instore || '';
            var displayWarehouse = config.dufry_data_config.datepicker_selection_dropdown_label_warehouse || '';
            var longTermThreshold = false;
            try{
                let selectedLocation = this.selectedLocation();
                if(selectedLocation){
                    if(selectedLocation.hasOwnProperty('wh_threshold')){
                        longTermThreshold = selectedLocation.wh_threshold;
                    }
                }
                if(!longTermThreshold){
                    longTermThreshold = config.long_term_booking_threshold;
                }
            }catch(error){
                longTermThreshold = '0';
            }
            if (!longTermThreshold) {
                longTermThreshold = '0';
            }
            var maxBookingPeriod = config.maximum_booking_period;
            var minBookingPeriod = config.minimum_booking_period;
            var date;
            var todayDate = new Date();
            var result = [];
            todayDate.setHours(todayDate.getHours() + minBookingPeriod);
            for (var i=0; i<maxBookingPeriod; i++){
                var monthShortName = window._websiteInfo.advanced_configuration.month_names_short[todayDate.getMonth()].toUpperCase();
                var label = todayDate.getDate()+' '+monthShortName+' '+todayDate.getFullYear();
                if(i<longTermThreshold){
                    date = {'label': label+displayInstore, 'value':todayDate.getDate()+'/'+(todayDate.getMonth()+1)+'/'+todayDate.getFullYear()};
                }
                else{
                    date = {'label': label+displayWarehouse, 'value':todayDate.getDate()+'/'+(todayDate.getMonth()+1)+'/'+todayDate.getFullYear()};
                }
                result.push(date);
                todayDate.setDate(todayDate.getDate()+1);
            }
            return result;
        }
    };
});
