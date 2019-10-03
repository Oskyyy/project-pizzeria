/* eslint-disable no-unused-vars ,no-undef */
import { BaseWidget } from './BaseWidget.js';
import { utils } from '../utils.js';
import { select, settings } from '../settings.js';

export class HourPicker extends BaseWidget {
  constructor(wrapper) {
    super(wrapper, settings.hours.open);
    const thisWidget = this;

    thisWidget.dom.input = thisWidget.dom.wrapper.querySelector(select.widgets.hourPicker.input);
    thisWidget.dom.output = thisWidget.dom.wrapper.querySelector(select.widgets.hourPicker.output);
    thisWidget.value = settings.hours.open;

    thisWidget.initPlugin();
  }

  initPlugin() {
    const thisWidget = this;

    rangeSlider.create(thisWidget.dom.input, {
      onSlide: function (value) {
        thisWidget.value = value;
      },
    });
  }

  parseValue(value) {
    return utils.numberToHour(value);
  }

  isValid(newValue) {
    return true;
  }

  renderValue() {
    const thisWidget = this;
    thisWidget.dom.output.innerHTML = thisWidget.value;
  }
}
