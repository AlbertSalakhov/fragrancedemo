define([
    'uiComponent',
    'jquery',
    'mage/url',
    'ko',
    'Dufry_Entities/js/datepickers',
    'Dufry_Entities/js/model/store-switcher',
    'Magento_Ui/js/modal/modal',
    'mage/validation',
    'mage/cookies'
], function (Component, $, url, ko, datepickers, storeSwitcherModel, modal) {
    window.entityDatepick = datepickers;
    return Component.extend({
        /**
         * Model Object
         */
        modal: null,

        datePickerComponent : datepickers,

        /**
         * Flag to enable show terminal warning
         */
        canShowTerminalWarning: ko.observable(false),
        isTerminalWarningVisible: ko.observable(false),

        /**
         * Datepicker object
         */
        datePicker: null,
        /**
         * The modal form
         */
        form: null,

        /**
         * Widget configuration
         */
        config: ko.observable(null),

        /**
         * selected options
         */
        selectedRegion: ko.observable(null),
        selectedCountry: ko.observable(null),
        selectedLocation: ko.observable(null),
        selectedTerminal: ko.observable(null),
        selectedDate: ko.observable(null),

        /**
         * Select options
         */
        regionOptions: ko.observable(null),
        countryOptions: ko.observable(null),
        locationOptions: ko.observable(null),
        terminalOptions: ko.observable(null),
        dateDropdownOptions: ko.observable(null),

        /**
         * UI Option States
         */
        regionSelectVisible: ko.observable(false),
        regionLineVisible: ko.observable(false),

        /**
         * Object initialization
         * @param data
         */
        initialize: function (data) {
            this._super();

            let self = this;

            this.config(data.configurations);

            this.setupFields();
            this.setupInitialData();
            this.setupTerminalWarning();

            storeSwitcherModel.triggerOpenModal.subscribe(function(data) {
               if(data === true) {
                   self.openModal(true);
               }
            });

            storeSwitcherModel.selectedLanguage.subscribe((data) => {
                if (data) {
                    this.submitForm(true);
                }
            })

            this.setupRegionVisibility();
            this.getDateDropdownOptions();
            $('.action.tocart').attr('disabled', false);
            $('.action.quick-reserve').attr('disabled', false);
        },

        /**
         * Setup form objects
         * @param dom
         * @param obj
         */
        setupInitialForm: function (dom, obj) {
            this.setupValidationForm();
            this.setupDatepicker(dom, obj);
        },

        /**
         *  Setup the first visibility of the region
         */
        setupRegionVisibility: function() {
            if(parseInt(this.config().dufry_data_config.region_visibility) === 0) {
                this.showRegionDropdown();
            } else if(parseInt(this.config().dufry_data_config.region_visibility) === 1) {
                this.showRegionLine();
            }
        },

        /**
         * Show regions as dropdown and hide as line
         */
        showRegionDropdown: function () {
            this.regionSelectVisible(true);
            this.regionLineVisible(false);
        },

        /**
         * Show regions as line and hide as dropdown
         */
        showRegionLine: function () {
            this.regionSelectVisible(false);
            this.regionLineVisible(true);
        },

        /**
         * Setup datepicker for departure date
         * @param dom
         * @param obj
         */
        setupDatepicker : function(dom, obj){
            try{
                //CHECK if we need the datepicker an initialize it
                if(this.showDatePicker()) {
                    this.createDateField($(dom).find('.datepickers'));
                }
            }catch(error){
                console.error('Failed to setup Datepicker!');
            }
        },

        /**
         * Hide the terminal warning
         */
        hideTerminalWarning: function() {
            this.canShowTerminalWarning(false);
        },

        /**
         * show the terminal warning
         */
        showTerminalWarning: function(){
            this.canShowTerminalWarning(false);
        },

        /**
         * Setup time out to show terminal warning
         */
        setupTerminalWarning: function() {
            if(this.showTerminal()) {
                let self = this;

                setTimeout(function() {
                    if(self.canShowTerminalWarning()) {
                        self.isTerminalWarningVisible(true);
                    }
                }, 5000);
            }
        },

        /**
         * Setup Datepicker field
         * @param el
         */
        createDateField: function (el) {
            if (!this.datePicker) {
                let config = {
                    configuration: this.config()
                };

                let datePickerComponent = this.datePickerComponent ? this.datePickerComponent : window.entityDatepick;
                this.datePicker = datePickerComponent(config, el);
            }
        },

        /**
         * Get list of countries and terminals
         * @param config
         * @returns {[]}
         */
        getCountryLocations: function (config) {
            let countryLocations = [];
            for (let elem in config.locations) {
                if(config.locations.hasOwnProperty(elem)) {
                    Object.values(config.locations[elem]['countries'])
                        .map(country => {countryLocations[country['code']] = country['locations']});
                }
            }

            return countryLocations;
        },

        /**
         * Setup select field options changes
         */
        setupFields: function () {
            let self = this;

            this.regionOptions(this.makeOptionsArray(this.config().locations, 'code', 'label'));

            this.selectedRegion.subscribe(function (data) {
                if(typeof data === 'undefined') data = 0;
                if (data.length > 0) {

                    let array = [];

                    if(parseInt(self.config().dufry_data_config.region_visibility) === 2) {
                        _.each(self.config().locations, function (item){
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
                if(typeof data === 'undefined') data = 0;
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
                if(typeof data === 'undefined') data = 0;
                if (data.length > 0) {
                    const countryLocations = self.getCountryLocations(self.config());
                    let terminalsOptions = countryLocations[self.selectedCountry()];
                    if (terminalsOptions) {
                        terminalsOptions = terminalsOptions.filter(function (value) {
                            return value.code.trim() === data.trim();
                        });
                        if(terminalsOptions.length > 0) {
                            var terminalOpts = self.makeOptionsArray(terminalsOptions[0].terminals, 'id', 'name');
                            for (let t in terminalOpts) {
                                if (terminalOpts.hasOwnProperty(t)) {
                                    terminalOpts[t].disable = false;
                                }
                            }
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
         * Setup initial data from store configuration and cookies
         */
        setupInitialData: function () {
            this.selectedRegion(this.config().airport.region);
            this.selectedCountry(this.config().airport.country);
            this.selectedLocation(this.config().airport.code);
            this.selectedTerminal($.cookie('terminal_id'));
            this.selectedDate($.cookie('last_selected_date'));
            this.setupTerminalWarningDisplay();
            //TODO: case if we are in LHR and want to go to MEL, it does not have to show or hide it properly ?

            storeSwitcherModel.valid(this.validateCurrentData());
        },

        /**
         * Validates current selected data
         * @returns {boolean}
         */
        validateCurrentData: function() {
            let success = true;
            var found = false;
            var locations = this.locationOptions();
            var self = this;
            _.each(locations, function (i) {
                if (i.value == self.selectedLocation())
                    found = true;
            })
            if (found == false) {
                success = false;
            }
            if(this.showTerminal(true)) {
                if(this.selectedTerminal() === null) {
                    success = false;
                }
            }

            if(this.showDatePicker()) {
                if(this.selectedDate() === null) {
                    success = false;
                }
            }

            return success;
        },

        /**
         * Setup initial warning
         */
        setupTerminalWarningDisplay: function() {
            let valid = false;


            if(this.selectedRegion() === null) {
                valid = true;
            }
            if(this.selectedCountry() === null) {
                valid = true;
            }
            if(this.selectedLocation() === null) {
                valid = true;
            }

            if(this.showTerminal(true)) {
                if(this.selectedTerminal() === null) {
                    valid = true;
                }
            }

            if(this.showDatePicker()) {
                if(this.selectedDate() === null) {
                    valid = true;
                }
            }

            if(valid) {
                this.showTerminalWarning();
            } else {
                this.hideTerminalWarning();
            }

        },

        /**
         * Transform array into standard array for select options
         * @param data
         * @param value
         * @param label
         * @returns {[]}
         */
        makeOptionsArray: function (data, value, label) {
            let returnData = [];

            for (let i in data) {
                if(data.hasOwnProperty(i)) {
                    if (data[i].hasOwnProperty(label) && data[i].hasOwnProperty(value)) {
                        returnData.push({"label": data[i][label], "value": data[i][value]})
                    }
                }
            }

            returnData = returnData.sort(function(a, b) {
                let sorting = [a.label, b.label];
                sorting = sorting.sort()

                if(sorting[0] === a.label) {
                    return -1;
                }

                return 1
            });

            return returnData;
        },

        /**
         * Get selected region option label
         * @returns string
         */
        getSelectedRegionLabel: function() {
            return this.config().locations[this.selectedRegion()].label;
        },

        /**
         * Set Region
         * @param dom
         * @param event
         */
        setGeoRegion: function (dom, event) {
            this.selectedRegion($(event.currentTarget).val());

            if(parseInt(this.config().dufry_data_config.region_visibility) === 1) {
                this.showRegionLine();
            }
        },

        /**
         * Set country
         * @param dom
         * @param event
         */
        setCountry: function (dom, event) {
            this.selectedCountry($(event.currentTarget).val());
        },

        /**
         * Set location
         * @param dom
         * @param event
         */
        setDufryLocation: function (dom, event) {
            this.selectedLocation($(event.currentTarget).val());
            this.getDateDropdownOptions();
        },

        /**
         * Set Terminal
         * @param dom
         * @param event
         */
        setTerminal: function (dom, event) {
            this.selectedTerminal($(event.currentTarget).val());
        },

        /**
         * Set CollectionDate
         * @param dom
         * @param event
         */
         setCollectionDate: function (dom, event) {
            this.selectedDate($(event.currentTarget).val());
        },

        /**
         * Generates and open the modal
         */
         openModal: function (force = false) {
            if (!this.modal) {
                let type = this.isMobile() ? 'slide' : 'popup';
                let el = $('#full-store-switcher-form');
                let modalOptions = {
                    'type': type,
                    'title': null,
                    'trigger': '#full-store-switcher-button .switchers-wrapper',
                    'responsive': true,
                    'modalClass': 'full-store-switcher',
                    'closed': function () {
                        storeSwitcherModel.triggerOpenModal(false);
                    },
                    'buttons': []
                }
                this.modal = modal(modalOptions, el)

                //Init form validation
                this.setupValidationForm();

            }
            if (force == true) {
                this.modal.openModal();
            }
        },

        /**
         * check if is mobile version
         * @returns {boolean}
         */
        isMobile: function () {
            return window.outerWidth < 768;
        },

        /**
         * Change DF and DP Field once clicking on labels
         * @param dom
         * @param event
         */
        changeDfDp: function (dom, event) {
            let el = $(event.currentTarget);

            if (!el.is('.active')) {
                el.parent().parent().find('label').removeClass('active');
                el.parent().find('input').click();
                el.addClass('active');
            }
        },

        /**
         * Do we need to show data pickers?
         * @returns {boolean}
         */
        showDatePicker: function () {
            return parseInt(this.config().dufry_data_config.enable_flight_date) === 1 && !this.showDatePickerDropdown();
        },

        showDatePickerDropdown: function () {
            return parseInt(this.config().dufry_data_config.datepicker_selection_dropdown) === 1;
        },
        showFlightDateDescription: function () {
            return this.config().flight_date_description;
        },
        isEnabledFlightDescription: function () {
            return this.config().enabled_flight_date_description;
        },
        getDateDropdownOptions: function () {
            var result = storeSwitcherModel.getDateDropdownOptions(this.config());
            this.dateDropdownOptions(result);
        },

        /**
         * Do we need to show terminals?
         * @returns {boolean}
         */
        showTerminal: function (nonSet) {
            let result;

            if(this.terminalOptions() === null) {
                result = false;
            } else {
                result = this.terminalOptions().length > 1;
            }

            if(!nonSet && !result) {
                //update terminal warning
                this.canShowTerminalWarning(result);
            }

            return result;
        },

        /**
         * Do we need to show DP & DF selectors?
         * @returns {boolean}
         */
        showDpDF: function () {
            return parseInt(this.config().dufry_data_config.duty_paid.simple.enabled) === 1
                || parseInt(this.config().dufry_data_config.duty_paid.dutypaid_config.enabled_dutypaid_rule) === 1;
        },

        /**
         * Are we on DP session currently ?
         * @returns {number}
         */
        getIsDP: function () {
            if (parseInt(this.config().dufry_data_config.duty_paid.simple.enabled) === 1) {
                return parseInt($.cookie('simpleDutyPaid'));
            } else if (parseInt(this.config().dufry_data_config.duty_paid.dutypaid_config.enabled_dutypaid_rule) === 1) {
                return parseInt(this.config().dufry_data_config.duty_paid.dutypaid_config.store_view_is_dutypaid);
            }

            return 0;
        },

        /**
         * Give a option value and the value to compare to tell if this options is selected
         * NOTE: it does not treat observables send raw value
         * @param optionValue
         * @param baseValue
         * @returns {boolean}
         */
        checkIfIsSelectedOption: function(optionValue, baseValue) {
            return optionValue === baseValue
        },

        /**
         * If there is only one terminal leave it selected
         */
        selectDefaultTerminal: function () {
            //only select if there is only one terminal available
            if (this.terminalOptions().length === 1) {
                this.selectedTerminal(this.terminalOptions()[0].value);
            }
        },

        /**
         * Setup Validation rules for the form
         */
        setupValidationForm: function() {
            let form = this.getForm();
            let ignore = null;

            form.mage('validation', {
                ignore: ignore ? ':hidden:not(' + ignore + ')' : ':hidden'
            }).find('input:text').attr('autocomplete', 'off');
        },

        /**
         * retrieve form dom
         * @returns {null}
         */
        getForm : function() {
            if(!this.form){
                this.form = $('#full-store-switcher-form');
            }
            return this.form;
        },

        /**
         * Check if form is validated
         * @returns boolean
         */
        validateForm: function() {
            return this.form.validation('isValid');
        },

        /**
         * Submits the form
         * @param dom
         * @param event
         */
        submitForm: function (onlyLanguageSwitch = false) {
            //TODO: with add to cart
            try {
                this.selectDefaultTerminal();
                if(this.validateForm()){
                    const form = this.getForm();
                    let data = form.serialize();

                    if(storeSwitcherModel.hasOwnProperty('product')) {
                        data += '&'+Object.keys(storeSwitcherModel.product).map(key => key + '=' + storeSwitcherModel.product[key]).join('&');
                    }

                    if (storeSwitcherModel.selectedLanguage()) {
                        const language = storeSwitcherModel.selectedLanguage();
                        data += `&language=${language}`;
                    }

                    document.location = this.decorateUrl(url.build('dufryentities/stores/switcher')+'?'+data);
                } else {
                    throw "Invalid form";
                }
            } catch (e) {
                if (onlyLanguageSwitch && storeSwitcherModel.selectedLanguage()) {
                    document.location = this.decorateUrl(url.build('')+'?___store='+storeSwitcherModel.selectedLanguage());
                } else {
                    storeSwitcherModel.selectedLanguage(null);
                    this.openModal();
                }
            }
        },
        /**
         * decorates the url with _ga parameter for Cross domain tracking
         * @param destinationUrl
         * @returns string
         */
        decorateUrl: function(destinationUrl) {
            if (ga !== undefined && typeof ga.getAll === 'function') {
                const trackers = ga.getAll();
                if (trackers.length > 0) {
					// Uses the first tracker created on the page
					destinationUrl = (new window.gaplugins.Linker(trackers[0])).decorate(destinationUrl);
                }
            }
            return destinationUrl;
        }
    });
});
