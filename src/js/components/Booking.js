/* eslint-disable no-unused-vars */
import {select, templates, settings, classNames} from '../settings.js';
import {utils} from '../utils.js';
import {AmountWidget} from './AmountWidget.js';
import {DatePicker} from './DatePicker.js';
import {HourPicker} from './HourPicker.js';


export class Booking{
  constructor(bookingElem){
    const thisBooking = this;

    thisBooking.initReservation();
    thisBooking.render(bookingElem);
    thisBooking.initWidges();
    thisBooking.getData();
    thisBooking.initAction();
  }

  initAction(){
    const thisBooking = this;
    thisBooking.dom.formSubmitButton.addEventListener('submit', function(event){
      event.preventDefault();

      if (!thisBooking.datePicker.dom.input.value) {
        return alert('Select reservation day');
      } else if (thisBooking.selectedTable.length == 0) {
        return alert('Choose a free table!');
      } else if (!thisBooking.dom.phone.value) {
        return alert('Enter Your phone number!');
      } else if (!thisBooking.dom.address.value) {
        return alert('Enter Your address!');
      }

      thisBooking.sendReservation();
      thisBooking.refreshTable();
      thisBooking.dom.form.reset();
    });
  }

  render(wrapper){
    const thisBooking = this;
    const generatedHTML = templates.bookingWidget();

    thisBooking.dom ={};
    thisBooking.dom.wrapper = wrapper;
    thisBooking.dom.wrapper.innerHTML = generatedHTML;
    thisBooking.dom.peopleAmount = thisBooking.dom.wrapper.querySelector(select.booking.peopleAmount);
    thisBooking.dom.hoursAmount = thisBooking.dom.wrapper.querySelector(select.booking.hoursAmount);
    thisBooking.dom.datePicker = thisBooking.dom.wrapper.querySelector(select.widgets.datePicker.wrapper);
    thisBooking.dom.hourPicker= thisBooking.dom.wrapper.querySelector(select.widgets.hourPicker.wrapper);
    thisBooking.dom.tables = thisBooking.dom.wrapper.querySelectorAll(select.booking.tables);
    thisBooking.dom.starters = thisBooking.dom.wrapper.querySelectorAll(select.booking.starters);
    thisBooking.dom.tablesSelected = thisBooking.dom.wrapper.querySelectorAll(select.booking.tablesSelected);
    thisBooking.dom.phone = thisBooking.dom.wrapper.querySelector(select.booking.phone);
    thisBooking.dom.address = thisBooking.dom.wrapper.querySelector(select.booking.address);
    thisBooking.dom.form = thisBooking.dom.wrapper.querySelector(select.booking.form);
    thisBooking.dom.formSubmitButton = thisBooking.dom.wrapper.querySelector(select.booking.formSubmit);
  }

  initWidges(){
    const thisBooking = this;
    thisBooking.peopleAmount = new AmountWidget(thisBooking.dom.peopleAmount);
    thisBooking.hoursAmount = new AmountWidget(thisBooking.dom.hoursAmount);
    thisBooking.datePicker = new DatePicker(thisBooking.dom.datePicker);
    thisBooking.hourPicker= new HourPicker(thisBooking.dom.hourPicker);
    thisBooking.dom.wrapper.addEventListener('updated',function(){
      thisBooking.updateDOM();
    });
    thisBooking.dom.hourPicker.addEventListener('updated', function() {
      thisBooking.refreshTable();
    });
    thisBooking.dom.datePicker.addEventListener('change', function() {
      thisBooking.refreshTable();
    });
  }

  getData(){
    const thisBooking = this;
    thisBooking.starters=[];
    for(let starter of thisBooking.dom.starters){
      starter.addEventListener('change', function(event){
        event.preventDefault();
        thisBooking.starters.push(starter.outerText);
      });
    }

    thisBooking.phone = document.querySelectorAll('[name="phone"]')[1];
    thisBooking.address =  document.querySelectorAll('[name="address"]')[1];

    for (let table of thisBooking.dom.tables){
      table.addEventListener('click', function(){
        table.classList.toggle(classNames.booking.tableBooked);
        thisBooking.nrTable = table.getAttribute(settings.booking.tableIdAttribute);
      });
    }

    const startEndDates = {};
    startEndDates[settings.db.dateStartParamKey] = utils.dateToStr(thisBooking.datePicker.minDate);
    startEndDates[settings.db.dateEndParamKey] = utils.dateToStr(thisBooking.datePicker.maxDate);

    const endDate = {};
    endDate[settings.db.dateEndParamKey] = startEndDates[settings.db.dateEndParamKey];

    const params = {
      booking: utils.queryParams(startEndDates),
      eventsCurrent: settings.db.notRepeatParam + '&' + utils.queryParams(startEndDates),
      eventsRepeat: settings.db.repeatParam + '&' + utils.queryParams(endDate),
    };

    const urls = {
      booking:       settings.db.url + '/' + settings.db.booking + '?' + params.booking,
      eventsCurrent: settings.db.url + '/' + settings.db.event   + '?' + params.eventsCurrent,
      eventsRepeat:   settings.db.url + '/' + settings.db.event   + '?' + params.eventRepeat,
    };

    Promise.all([
      fetch(urls.booking),
      fetch(urls.eventsCurrent),
      fetch(urls.eventsRepeat),
    ])
      .then(function([bookingsResponse, eventsCurrentResponse, eventsRepeatResponse]){
        return Promise.all([
          bookingsResponse.json(),
          eventsCurrentResponse.json(),
          eventsRepeatResponse.json(),
        ]);
      })
      .then(function([bookings, eventsCurrent, eventsRepeat]){
        thisBooking.parseData(bookings, eventsCurrent, eventsRepeat);
      });
  }

  parseData(bookings=[],eventsCurrent=[],eventsRepeat=[]){
    const thisBooking=this;
    thisBooking.booked ={};
    for (let element  of eventsCurrent){
      thisBooking.makeBooked(element.date, element.hour,element.duration,element.table);
    }
    for (let element of bookings){
      thisBooking.makeBooked(element.date, element.hour,element.duration,element.table);
    }
    for (let element of eventsRepeat){
      thisBooking.makeBooked(element.date, element.hour,element.duration,element.table);
    }
    thisBooking.updateDOM();
  }
  makeBooked(date, hour, duration, table){
    const thisBooking=this;

    if(!thisBooking.booked[date]){
      thisBooking.booked[date] = {};
    }
    let time = hour.split(':');
    if(time[1] === '30') hour = `${time[0]}.5`;
    else hour = time[0];

    if(!thisBooking.booked[date][hour]){
      thisBooking.booked[date][hour] = [];
    }
    thisBooking.booked[date][hour].push(table);
    hour = hour - (-duration);

    if(!thisBooking.booked[date][hour]){
      thisBooking.booked[date][hour] = [];
    }
    thisBooking.booked[date][hour].push(table);
  }

  updateDOM(){
    const thisBooking=this;
    thisBooking.address =  document.querySelectorAll('[name="address"]')[1];

    for (let table of thisBooking.dom.tables){
      table.addEventListener('click',function(){
        table.classList.toggle(classNames.booking.tableBooked);
        thisBooking.nrTable = table.getAttribute(settings.booking.tableIdAttribute);
      });
    }

    thisBooking.date = thisBooking.datePicker.value;
    thisBooking.hour = utils.hourToNumber(thisBooking.hourPicker.value);

    for (let table of thisBooking.dom.tables){
      let nrTable = table.getAttribute(settings.booking.tableIdAttribute);

      if (thisBooking.booked[thisBooking.date] && thisBooking.booked[thisBooking.date][thisBooking.hour]){
        if(thisBooking.booked[thisBooking.date][thisBooking.hour].includes(parseInt(nrTable))) table.classList.add(classNames.booking.tableBooked);
        else table.classList.remove(classNames.booking.tableBooked);
      }
      else {
        table.classList.remove(classNames.booking.tableBooked);
      }
    }
  }

  sendBooking(){
    const thisBooking = this;
    const url = settings.db.url + '/' + settings.db.booking;
    const payload = {
      date: thisBooking.datePicker.value,
      hour: thisBooking.hour,
      table: thisBooking.nrTable,
      repeat: false,
      duration: thisBooking.hoursAmount.value ,
      ppl: thisBooking.peopleAmount.value,
      address: thisBooking.address.value,
      phone: thisBooking.phone.value,
      starters: thisBooking.starters,
    };

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    };

    fetch(url,options)
      .then(function(response){
        return response.json();
      }).then(function(parsedResponse){
        console.log('parsedResponse', parsedResponse);
      });
  }
}
