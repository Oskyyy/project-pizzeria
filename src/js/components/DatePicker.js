/* eslint-disable no-unused-vars,no-undef */
import {BaseWidget} from './BaseWidget.js';
import {utils} from '../utils.js';
import {select,settings} from '../settings.js';

export class DatePicker extends BaseWidget{
  constructor(wrapper){
    super (wrapper, utils.dateToStr(new Date()));
    const thisWidget = this;

    thisWidget.dom.input= thisWidget.dom.wrapper.querySelector(select.widgets.datePicker.input);
    thisWidget.initPlugin();

  }
  initPlugin(){
    const thisWidget = this;
    thisWidget.minDate = new Date(thisWidget.value);

    thisWidget.maxDate = utils.addDays(thisWidget.minDate, settings.datePicker.maxDaysInFuture);

    flatpickr(thisWidget.dom.input, {
      dateFormat: 'd-m-Y',
      defaultDate:thisWidget.minDate,
      minDate: thisWidget.minDate,
      maxDate: thisWidget.maxDate,
      firstDayOfWeek: 1,
      'disable': [
        function(date) {

          return (date.getDay() === 1 );

        }
      ],
      onChange: function(selectedDates, dateStr, instance) {
        thisWidget.value= dateStr;
      },
    });
  }

  parseValue(newValue){
    return newValue;
  }

  isValid(newValue){
    return true;
  }

  renderValue(){
    const thisWidget= this;
  }
}
