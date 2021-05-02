/**
 * HTML Form Library
 * According to W3C Standard https://html.spec.whatwg.org/multipage/forms.html
 */
const debug = require('../debug');



class Form {

  constructor(formName) {
    this.formName = formName;
  }


  /**
   * Set the form control value.
   * @param {string} key - the value of the "name" HTML attribute
   * @param {any|string[]} val - the value
   * @returns {void}
   */
  setControl(key, val) {
    debug('setControl', `--------- setControl("${key}", "${val}") ------`, 'green', '#A1F8DC');
    const elems = document.querySelectorAll(`[data-rg-form="${this.formName}"] [name="${key}"]`);
    if (!elems.length) { console.log(`%c FormWarn:: Form "${this.formName}" doesn't have control with name="${key}" attribute.`, `color:Maroon; background:LightYellow`); return; }

    for (const elem of elems) {
      if (elem.type === 'checkbox') { // CHECKBOX
        elem.checked = false;
        if (val.indexOf(elem.value) !== -1) { elem.checked = true; } // val is array
      } else if (elem.type === 'select-multiple') { // on SELECT with multiple, for example <select name="family" size="4" multiple>
        const options = elem; // all options
        for (const option of options) {
          option.selected = false;
          if (val.indexOf(option.value) !== -1) { option.selected = true; }  // val is array
        }
      } else if (elem.type === 'radio') { // RADIO
        elem.checked = false;
        if (val === elem.value) { elem.checked = true; }
      } else { // INPUT, SELECT
        elem.value = val; // val is not array
      }
      debug('setControl', `${elem.type}[name="${key}"] got value="${val}"`, 'green');
    }

  }



  /**
   * Set the multiple form controls with one object.
   * @param {object} obj - the object which represent the object values, for example: {name:'John Doe', age:23, employed:true}
   * @returns {void}
   */
  setControls(obj) {
    debug('setControls', '--------- setControls ------', 'green', '#88DBC0');
    if (!obj) { return; }
    const keys = Object.keys(obj);
    for (const key of keys) {
      const elem = document.querySelector(`[data-rg-form="${this.formName}"] [name^="${key}"]`);
      if (!elem) {
        debug('setControls', `FormWarn::setControls -> Form "${this.formName}" doesn't have control with name^="${key}" attribute.`, 'green');
        continue;
      }

      let val, attrVal;
      if (!!elem) {
        attrVal = elem.getAttribute('name'); // seller.name
        const keys = attrVal.split('.'); // ['seller', 'name']
        const key1 = keys[0]; // seller
        const key2 = keys[1]; // name
        if (key1 && !key2) { val = obj[key1]; }
        else if (key1 && key2) { val = obj[key1][key2]; }
      }

      if (!!attrVal) { this.setControl(attrVal, val); }

      if(debug().setControl) { console.log(`setControls:: obj-key:: ${key} , attrVal:: ${attrVal} , elem::`, elem); }
    }
  }



  /**
   * Get the form control value.
   * @param {string} key - the value of the "name" HTML attribute
   * @returns {string|number}
   */
  getControl(key) {
    debug('getControl', '--------- getControl ------', 'green', '#A1F8DC');
    const elems = document.querySelectorAll(`[data-rg-form="${this.formName}"] [name="${key}"]`);
    if (!elems.length) { throw new Error(`Form "${this.formName}" doesn't have "${key}" control.`); }

    let val;
    const valArr = [];
    let i = 1;
    for (const elem of elems) {
      if (elem.type === 'checkbox') {
        if (elem.checked) { valArr.push(elem.value); val = valArr; }
        if (i === elems.length && !val) { val = []; }
      } else if (elem.type === 'select-multiple') {
        const opts = elem.selectedOptions; // selected options
        for (const opt of opts) {
          valArr.push(opt.value);
          val = valArr;
        }
        if (i === elems.length && !val) { val = []; }
      } else if (elem.type === 'radio') {
        if (elem.checked) { val = elem.value; }
      } else if (elem.type === 'number') {
        val = elem.valueAsNumber;
      } else {
        val = elem.value;
      }
      i++;
    }

    debug('getControl', `${val}`, 'green');
    return val;
  }


  /**
   * Get the form controll values and return corresponding object
   * @param {string[]} keys - the value of the "name" HTML attribute
   * @returns {object}
   */
  getControls(keys) {
    debug('getControls', '--------- getControls ------', 'green', '#A1F8DC');
    debug('getControls', keys, 'green');
    const obj = {};
    for (const key of keys) {
      obj[key] = this.getControl(key);
    }
    return obj;
  }


  /**
   * Empty the form control value.
   * @param {string} key - the value of the "name" HTML attribute
   * @returns {void}
   */
  delControl(key) {
    debug('delControl', '--------- delControl ------', 'green', '#A1F8DC');
    debug('delControl', key, 'green');
    const elems = document.querySelectorAll(`[data-rg-form="${this.formName}"] [name="${key}"]`);
    if (!elems.length) { throw new Error(`Form "${this.formName}" doesn't have "${key}" control.`); }

    for (const elem of elems) {
      if (elem.type === 'checkbox') {
        elem.checked = false;
      } else if (elem.type === 'select-multiple') {
        const options = elem; // all options
        for (const option of options) {
          option.selected = false;
        }
      } else if (elem.type === 'radio') {
        elem.checked = false;
      } else {
        elem.value = '';
      }
    }

  }


  /**
   * Empty the form control values.
   * @param {string[]} keys - the value of the "name" HTML attribute
   * @returns {void}
   */
  delControls(keys) {
    debug('delControls', '--------- delControls ------', 'green', '#A1F8DC');
    debug('delControls', keys, 'green');
    for (const key of keys) {
      this.delControl(key);
    }
  }



}

module.exports = Form;
