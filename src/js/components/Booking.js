/* eslint-disable no-unused-vars */
import {select,templates} from '../settings.js';
import {utils} from '../utils.js';
import { AmountWidget } from '../AmountWidget.js';


export class Booking{
  constructor(widgetContener){
    const thisBooking = this;

    thisBooking.render(widgetContener);
    thisBooking.initWidges();

  }
  render(){
    const thisBooking = this;
    const generatedHTML = templates.bookingWidget();

    thisBooking.dom ={};
    thisBooking.dom.wrapper = utils.createDOMFromHTML(generatedHTML);
    console.log('wrapper',thisBooking.dom.wrapper);
    thisBooking.dom.peopleAmount = thisBooking.dom.wrapper.querySelector(select.booking.peopleAmount);
    thisBooking.dom.hoursAmount = thisBooking.dom.wrapper.querySelector(select.booking.hoursAmount);
    thisBooking.hoursAmount = thisBooking.dom.hoursAmount.innerHTML;
    thisBooking.peopleAmount = thisBooking.dom.peopleAmount.innerHTML;
  }

  initWidges(){
    const thisBooking = this;
    thisBooking.peopleAmount = new AmountWidget(thisBooking.dom.peopleAmount);
    thisBooking.hoursAmount = new AmountWidget(thisBooking.dom.hoursAmount);
  }
}
