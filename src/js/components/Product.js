import {select, classNames, templates} from '..settings';
import {utils} from '../utils.js';
import {AmountWidget} from './AmountWidget.js';

class Product{
  constructor(id, data){
    const thisProduct = this;

    thisProduct.id = id;
    thisProduct.data = data;
    thisProduct.renderInMenu();
    thisProduct.initAccordion();
    thisProduct.initAccordion();
    thisProduct.initOrderForm();
    thisProduct.initamountWidget();
    thisProduct.processOrder();

  }

  renderInMenu(){
    const thisProduct = this;
    const generateHTML = templates.menuProduct(thisProduct.data);
    thisProduct.element = utils.createDOMFromHTML(generateHTML);
    const menuContainer = document.querySelector(select.containerOf.menu);
    menuContainer.appendChild(thisProduct.element);
    //const totalPrice = document.querySelector(select.menuProduct.priceElem);
  }

  getElements(){
    const thisProduct = this;

    thisProduct.amountWidgetElem = thisProduct.element.querySelector(select.menuProduct.amountWidget);
    thisProduct.accordionTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);
    thisProduct.form = thisProduct.element.querySelector(select.menuProduct.form);
    thisProduct.formInputs = thisProduct.form.querySelectorAll(select.all.formInputs);
    thisProduct.cartButton = thisProduct.element.querySelector(select.menuProduct.cartButton);
    thisProduct.priceElem = thisProduct.element.querySelector(select.menuProduct.priceElem);
    thisProduct.imageWrapper = thisProduct.element.querySelector(select.menuProduct.imageWrapper);
  }

  initAccordion(){
    const thisProduct = this;
    thisProduct.accordionTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);
    thisProduct.accordionTrigger.addEventListener('click', function(event){
      event.preventDefault();
      thisProduct.element.classList.add(classNames.menuProduct.wrapperActive);
      const activeProducts = document.querySelectorAll('.product.active');
      for (let activeProduct of activeProducts){
        if (activeProduct != thisProduct.element){
          activeProduct.classList.remove('active');
        }
      }
    });
  }

  initOrderForm(){
    const thisProduct = this;
    thisProduct.cartButton = thisProduct.element.querySelector(select.menuProduct.cartButton);
    thisProduct.cartButton.addEventListener('click', function(event){
      event.preventDefault();
      thisProduct.processOrder();
      thisProduct.addToCart();
    });
    thisProduct.form = thisProduct.element.querySelector(select.menuProduct.form);
    thisProduct.form.addEventListener('submit', function(event){
      event.preventDefault();
      thisProduct.processOrder();
    });
    thisProduct.formInputs = thisProduct.form.querySelectorAll(select.all.formInputs);
    for(let input of thisProduct.formInputs){
      input.addEventListener('change', function(event){
        event.preventDefault();
        thisProduct.processOrder();
      });
    }
  }

  processOrder(){
    const thisProduct = this;
    const formData = utils.serializeFormToObject(thisProduct.form);
    thisProduct.imageWrapper = thisProduct.element.querySelector(select.menuProduct.imageWrapper);
    thisProduct.params = {};
    let price = thisProduct.data.price;
    for ( let paramId in thisProduct.data.params){
      const param = thisProduct.data.params[paramId];
      for (let optionId in param.options){
        const option = param.options[optionId];
        const Images = thisProduct.imageWrapper.querySelectorAll('.'+paramId+'-'+optionId);
        const optionSelected = formData.hasOwnProperty(paramId) && formData[paramId].indexOf(optionId) > -1;
        if(optionSelected && !option.default){
          price += param.options[optionId].price;
        }
        else if (!optionSelected && option.default){
          price -= param.options[optionId].price;
          console.log('new lower price:',price);
        }
        if (( optionSelected && option.default) || ( optionSelected && !option.default)){
          if(!thisProduct.params[paramId]){
            thisProduct.params[paramId] = {
              label: param.label,
              options:{},
            };
          }
          thisProduct.params[paramId].options[optionId]= option.label;

          for (let Image of Images ){
            Image.classList.add('active');
          }
        }
        else {
          for (let Image of Images){
            Image.classList.remove('active');
          }
        }
      }
    }
    thisProduct.priceSingle = price;
    thisProduct.price = thisProduct.priceSingle * thisProduct.amountWidget.value;
    thisProduct.element.querySelector(select.menuProduct.priceElem).innerHTML = thisProduct.price;
  }
  initamountWidget(){
    const thisProduct = this;
    thisProduct.amountWidgetElem = thisProduct.element.querySelector(select.menuProduct.amountWidget);
    thisProduct.amountWidget = new AmountWidget(thisProduct.amountWidgetElem);
    thisProduct.amountWidgetElem.addEventListener('updated', function(){
      thisProduct.processOrder();
    });
  }
  addToCart(){
    const thisProduct = this;
    thisProduct.name = thisProduct.data.name  ;
    thisProduct.amount = thisProduct.amountWidget.value ;
    //app.cart.add(thisProduct);

    const event = new CustomEvent('add-to-cart', {
      bubbles: true,
      detail: {
        product: thisProduct,
      },
    });

    thisProduct.element.dispatchEvent(event);
  }
}

export default Product;
