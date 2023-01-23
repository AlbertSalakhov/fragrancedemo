define([
    "jquery",
    "jquery/ui",
    "js/moment.min",
    'Dufry_Entities/js/model/store-switcher',
    'mage/cookies',
    'mage/url'
], function ($, ui, moment, storeSwitcherModel, cookies, url) {
    "use strict";
    let serverMomentDate;
    $.widget('datepickers.js', {
        _container: null,
        offsetHeight : 0,
        /**
         * Start widget
         * @private
         */
        _create: async function () {
            this.serverMomentDate = await this._getServerDate();
            this._element = this.element;
            this._hourElement = $('[name=retrieval_time]');
            let app = this;
            this._getDatesDisabled();
            window.date_object = this;
            setTimeout(function () {
                app._initCalendar();
            });

        },
        /**
         * init calendar plugin
         * @private
         */
        _initCalendar: function () {
            let self = this;

            //Grab initial dates
            let minimum_date = this._getMinimumDate();
            let maximum_date = this._getMaximumDate();
            this.element.data('min', minimum_date);
            this.element.data('max', maximum_date);

            //Init calendar widget
            this._element.datepicker({
                dateFormat: 'dd/mm/yy',
                startDate: self._getDaysFromNow(minimum_date),
                minDate: self._getDaysFromNow(minimum_date),
                maxDate: self._getDaysFromNow(maximum_date),
                datesDisabled: self._getDatesDisabled(),
                autoclose: true,
                // defaultDate: minimum_date,
                //disableTouchKeyboard: true,
                todayHighlight: true,
                //language: 'pt-BR'
                onSelect: function (d) {
                    $.cookie('last_selected_date', d, {
                        path: '/',
                        domain: self._getDomainName()
                    });
                    $(this).trigger('change');
                },
                beforeShow: function (e, ui) {
                    //position it before field (top)
                    self.offsetHeight = e.offsetHeight;

                    //Show the mesage inside the calendar
                    if (self.options.configuration.enabled_flight_date_description) {
                        //Timeout here so the div is created first
                        setTimeout(function () {
                            let uiDiv = $('#ui-datepicker-div');
                            let maxWidth = uiDiv.width();
                            let legend = "<div id='ui-datepicker-legend' style='max-width: " + maxWidth + "px'>";
                            legend += self.options.configuration.flight_date_description;
                            legend += "</div>"
                            uiDiv.append(legend);
                            uiDiv.css({marginTop: -(self.offsetHeight) + 'px'});
                            if(uiDiv.position().top < self.offsetHeight){
                                uiDiv.css({top : self.offsetHeight});
                            }
                        });
                    }
                },
                beforeShowDay: function (date) {

                    /**
                     * TODO Validate rule
                     */
                    //disable dates
                    // let restrictedDates = self._getDatesDisabled();
                    //Start check for longg term order days
                    let lttw = false;
                    try{
                        let selectedLocation = storeSwitcherModel.selectedLocation();
                        if(selectedLocation){
                            if(selectedLocation.hasOwnProperty('wh_threshold')){
                                lttw = selectedLocation.wh_threshold;
                            }
                        }
                        if(!lttw){
                            lttw = self.options.configuration.booking.long_term_threshold_warehouse;
                        }
                    }catch(error){
                        lttw = '0';
                    }
                    if (!lttw) {
                        lttw = '0';
                    }
                    let longTermDays = parseInt(lttw.trim());
                    let cssClass = '';
                    if (longTermDays > 0) {
                        cssClass = (moment(date) >= moment(this.serverMomentDate).hours(0).minutes(0).seconds(0).add(longTermDays, 'days')) ? "long-term" : "";
                    }

                    // for (let i in restrictedDates) {
                    //     if(restrictedDates.hasOwnProperty(i)) {
                    //         if(restrictedDates[i].hasOwnProperty('from') && restrictedDates[i].hasOwnProperty('to')) {
                    //             if (restrictedDates[i].from <= moment(date) && moment(date) <= restrictedDates[i].to) {
                                    return [true, cssClass];
                                // }
                            // }
                        // }
                    // }

                    //END check for long term order days

                    // return [true];
                }
            });


        },
        /**
         * Return the date server
         * @returns {Promise<null>}
         * @private
         */
        _getServerDate: async function () {
            let serverMomentDate = null;
            let urlServerdate = url.build(window.BASE_URL + 'core/serverdate');
            await $.get(urlServerdate, function(data) {
                serverMomentDate = moment(data.dateserver.date);
            });
            return serverMomentDate;
        },
        /**
         * Return the date today from dateserver
         * @param momentDate
         * @returns {Date}
         * @private
         */
        _getToday: function (momentDate) {
            return new Date(momentDate.year(), momentDate.month(), momentDate.date(), momentDate.hour(), momentDate.minute());
        },
        /**
         * Get minimum date period available in days
         * @returns {*}
         * @private
         */
        _getMinimumDate: function () {
            let today = moment(this.serverMomentDate);
            let minimum_period = this.options.configuration.booking.minimum_period;

            if (typeof minimum_period !== 'undefined' && !isNaN(minimum_period)) {
                today.add(parseInt(minimum_period), 'h');
            }
            
            return today;

        },
        /**
         * Get maximum date period aavailable in days
         * @returns {*}
         * @private
         */
        _getMaximumDate: function () {
            let today = moment(this.serverMomentDate);
            let maximum_period = this.options.configuration.booking.maximum_period;

            if (typeof maximum_period !== 'undefined' && !isNaN(maximum_period)) {
                today.add(parseInt(maximum_period), 'd');
            }

            return today;

        },
        /**
         * Get diff in days from date
         * @param date
         * @returns {string}
         * @private
         */
        _getDaysFromNow: function (date) {
            if (!date) {
                return '+0d';
            } else {
                let diffHour = parseInt(date.diff(moment(), 'h'));
                let diff = parseInt(date.diff(moment(this.serverMomentDate).format('LL'), 'd'));  
                
                if (diffHour > 24 && diff === 1) {
                    diff = 2;
                }
                return '+' + diff + 'd';
            }

        },
        /**
         * Get wich dates are disabled
         * @returns {[]}
         * @private
         */
        _getDatesDisabled: function () {
            let returnDates = [];

            if (this.options.configuration.booking.limit_range) {
                for (let i in this.options.configuration.booking.months_limit_range) {
                    let startDate;
                    if(this.options.configuration.booking.months_limit_range.hasOwnProperty(i)) {
                        startDate = moment().month(this.options.configuration.booking.months_limit_range[i]).startOf('month');
                    }

                    returnDates.push({
                        from: startDate,
                        to: moment(startDate).add(35, "days")
                    });
                }
            } else {
                for (let i = 0; i < 12; i++) {
                    let startDate = moment().month(i).startOf('month');

                    returnDates.push({
                        from: startDate,
                        to: moment(startDate).add(35, "days")
                    });
                }
            }
            return returnDates;

        },

        _getDomainName: function() {
            var host = window.location.host;
            var mainDomain = host.substr(host.indexOf('.') + 1);
            var domainStr = "."+mainDomain;
            return domainStr;
        }

    });

    return $.datepickers.js;
});
