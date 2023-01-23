define([
    'jquery',
    "jquery/ui",
    "js/moment.min",
    'Dufry_Entities/js/model/store-switcher',
    'mage/cookies'
], function ($, ui, moment, storeSwitcherModel) {
    return function (datepicker) {
        $.widget(
            'datepickers.js',              //named widget we're redefining            

            //jQuery.mage.dropdownDialog
            $['datepickers']['js'],   //widget definition to use as
                                                //a "parent" definition -- in 
                                                //this case the original widget
                                                //definition, accessed using 
                                                //bracket syntax instead of 
                                                //dot syntax        

            {                                   //the new methods
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
                todayHighlight: true,
                onSelect: function (d) {
                    $.cookie('last_selected_date', d, {
                        path: '/',
                        domain: self._getDomainName()
                    });
                    $(this).trigger('change');
                },
                beforeShow: function (e, ui) {
                    self.offsetHeight = e.offsetHeight;
                    console.log("dsfsdfsd");
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

                    var terminals = storeSwitcherModel.currentTerminals();

                    var selectedTerminal = $('select[name="terminal"]').find(":selected").val();
                    var terminal = null;
                    if (terminals != null) {
                         terminal = terminals.find(function (t) {
                            return t.id == selectedTerminal;
                        });
                    }
                    if (terminal && terminal.type == 1 && $("label[for='duty_paid_label_0']").hasClass('active')) {
                        if (cssClass == '')
                            return [false, cssClass];
                        else
                            return [true, cssClass];
                    } else
                        return [true, cssClass];
                }
            });


        },
            });                                

        //return the redefined widget for `data-mage-init`
        //jQuery.mage.dropdownDialog
        return $['datepickers']['js'];
    };       
});
