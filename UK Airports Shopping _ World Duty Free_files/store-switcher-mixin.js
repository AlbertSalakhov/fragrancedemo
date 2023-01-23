define([
    'jquery',
    'Dufry_Entities/js/model/store-switcher',
    'Magento_Ui/js/modal/modal',
    'mage/validation',
    'mage/cookies'
], function ($, storeSwitcherModel) {
    return function (Component) {
        var onload = true;
        return Component.extend({
            
            /**
             * Setup select field options changes
             */
            setupFields: function () {
                let self = this;

                this.regionOptions(this.makeOptionsArray(this.config().locations, 'code', 'label'));

                this.selectedRegion.subscribe(function (data) {
                    if (typeof data === 'undefined')
                        data = 0;
                    if (data.length > 0) {

                        let array = [];

                        if (parseInt(self.config().dufry_data_config.region_visibility) === 2) {
                            _.each(self.config().locations, function (item) {
                                array = Object.assign(array, item.countries);
                            });
                        } else {
                            array = self.config().locations[data].countries;
                        }
                        self.countryOptions(self.makeOptionsArray(array, 'code', 'label'));
                    } else {
                        self.countryOptions(null);
                        self.selectedCountry('');
                    }

                    self.setupTerminalWarningDisplay();
                });

                this.selectedCountry.subscribe(function (data) {
                    if (typeof data === 'undefined')
                        data = 0;
                    if (data.length > 0) {
                        const countryLocations = self.getCountryLocations(self.config());
                        self.locationOptions(self.makeOptionsArray(countryLocations[self.selectedCountry()], 'code', 'name'));
                    } else {
                        self.locationOptions(null);
                        self.selectedLocation('');
                    }

                    self.setupTerminalWarningDisplay();
                });

                this.selectedLocation.subscribe(function (data) {
                    if (typeof data === 'undefined')
                        data = 0;
                    if (data.length > 0) {
                        const countryLocations = self.getCountryLocations(self.config());
                        let terminalsOptions = countryLocations[self.selectedCountry()];
                        if (terminalsOptions) {
                            terminalsOptions = terminalsOptions.filter(function (value) {
                                return value.code.trim() === data.trim();
                            });
                            if (terminalsOptions.length > 0) {
                                storeSwitcherModel.currentTerminals(terminalsOptions[0].terminals);
                                var terminalOpts = self.makeOptionsArray(terminalsOptions[0].terminals, 'id', 'name');
                                terminalOpts = terminalOpts.map(function (t, i) {
                                    t.disable = false;
                        
                                    var terminal = terminalsOptions[0].terminals.find(function(terminal){
                                        return terminal.id == t.value;
                                    });
                                    if ($("label[for='duty_paid_label_0']").hasClass('active') && terminal.type == 1)
                                        t.disable = true;
                                    
                                    if (onload && parseInt(self.config().dufry_data_config.duty_paid.simple.enabled) === 1 && parseInt($.cookie('simpleDutyPaid')) && terminal.type == 1) {
                                        t.disable = true;
                                    }
                                    
                                    return t;
                                });
                                onload = false; 
                                self.terminalOptions(terminalOpts);
                                
                                storeSwitcherModel.selectedLocation(terminalsOptions[0]);
                            }
                        } else {
                            self.terminalOptions(null);
                            self.selectedTerminal('');
                        }

                    } else {
                        self.terminalOptions(null);
                        self.selectedTerminal('');
                    }

                    self.setupTerminalWarningDisplay();
                });

                this.selectedTerminal.subscribe(function () {
                    self.setupTerminalWarningDisplay();
                });

                this.selectedDate.subscribe(function () {
                    self.setupTerminalWarningDisplay();
                });
            },

            /**
             * Change DF and DP Field once clicking on labels
             * @param dom
             * @param event
             */
            changeDfDp: function (dom, event) {
                let el = $(event.currentTarget);

                if (!el.is('.active')) {
                    var t = this.selectedLocation();
                    this.selectedLocation('');
                    this.selectedLocation(t);
                    el.parent().parent().find('label').removeClass('active');
                    el.parent().find('input').click();
                    el.addClass('active');
                }
            }
        });
    }
});
