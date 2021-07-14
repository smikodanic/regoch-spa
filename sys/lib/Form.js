/**
 * HTML Form Library
 * According to W3C Standard https://html.spec.whatwg.org/multipage/forms.html
 */
class Form {

  constructor(formName) {
    this.formName = formName;
    this.debugOpts = {
      setControl: false,
      setControls: false,
      getControl: false,
      getControls: false,
      delControl: false,
      delControls: false
    };
  }


  /**
   * Set the form control value.
   * @param {string} key - the value of the "name" HTML attribute
   * @param {any|string[]} val - the value
   * @returns {void}
   */
  setControl(key, val) {
    this._debug('setControl', `--------- setControl("${key}", "${val}") ------`, 'green', '#A1F8DC');
    const elems = document.querySelectorAll(`[data-rg-form="${this.formName}"] [name="${key}"]`);
    if (!elems.length) { console.log(`%c FormWarn:: Form "${this.formName}" doesn't have control with name="${key}" attribute.`, `color:Maroon; background:LightYellow`); return; }

    for (const elem of elems) {
      if (elem.type === 'checkbox') { // CHECKBOX
        elem.checked = false;
        if (typeof val !== 'boolean' && val.indexOf(elem.value) !== -1) { elem.checked = true; } // val is array
        else if (typeof val === 'boolean') { elem.checked = val; }

      } else if (elem.type === 'radio') { // RADIO
        elem.checked = false;
        if (val === elem.value) { elem.checked = true; }

      } else if (elem.type === 'select-multiple') { // on SELECT with multiple, for example <select name="family" size="4" multiple>
        const options = elem; // all options
        for (const option of options) {
          option.selected = false;
          if (val.indexOf(option.value) !== -1) { option.selected = true; }  // val is array
        }

      } else { // INPUT, SELECT
        elem.value = val; // val is not array
      }
      this._debug('setControl', `${elem.type}[name="${key}"] got value="${val}"`, 'green');
    }

  }



  /**
   * Set the multiple form controls with one object.
   * @param {object} obj - the object which represent the object values, for example: {name:'John Doe', age:23, employed:true}
   * @returns {void}
   */
  setControls(obj) {
    this._debug('setControls', '--------- setControls ------', 'green', '#88DBC0');
    if (!obj) { return; }
    const keys = Object.keys(obj);
    for (const key of keys) {
      const elems = document.querySelectorAll(`[data-rg-form="${this.formName}"] [name^="${key}"]`);
      this._debug('setControls', `\nElems found: ${elems.length} in the form for name^="${key}".`, 'green');
      if (!elems.length) {
        this._debug('setControls', `FormWarn::setControls -> Form "${this.formName}" doesn't have control with name^="${key}" attribute.`, 'green');
        continue;
      }

      for (const elem of elems) {
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

        if(this._debug().setControls) { console.log(`setControls:: obj-key:: ${key} , attrVal:: ${attrVal} , elem::`, elem); }
      }

    }
  }



  /**
   * Get the form control value.
   * @param {string} key - the value of the "name" HTML attribute
   * @returns {string|number}
   */
  getControl(key) {
    this._debug('getControl', '--------- getControl ------', 'green', '#A1F8DC');
    const elems = document.querySelectorAll(`[data-rg-form="${this.formName}"] [name="${key}"]`);
    if (!elems.length) { console.error(`Form "${this.formName}" doesn't have name="${key}" control.`); }

    let val;
    const valArr = [];
    let i = 1;
    for (const elem of elems) {
      if (elem.type === 'checkbox') {
        if (elem.checked) { valArr.push(elem.value); val = valArr; }
        if (i === elems.length && !val) { val = []; }

      } else if (elem.type === 'radio') {
        if (elem.checked) { val = elem.value; }

      } else if (elem.type === 'select-multiple') {
        const opts = elem.selectedOptions; // selected options
        for (const opt of opts) {
          valArr.push(opt.value);
          val = valArr;
        }
        if (i === elems.length && !val) { val = []; }

      } else if (elem.type === 'number') {
        val = elem.valueAsNumber;

      } else {
        val = elem.value;
      }
      i++;
    }

    this._debug('getControl', `${val}`, 'green');
    return val;
  }


  /**
   * Get the form controll values and return corresponding object
   * @param {string[]} keys - the value of the "name" HTML attribute
   * @returns {object}
   */
  getControls(keys) {
    if (!keys) { console.error('getControlsErr: Argument "keys" is not defined. It should be an array.'); }
    this._debug('getControls', '--------- getControls ------', 'green', '#A1F8DC');
    this._debug('getControls', keys, 'green');
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
    this._debug('delControl', '--------- delControl ------', 'green', '#A1F8DC');
    this._debug('delControl', key, 'green');
    const elems = document.querySelectorAll(`[data-rg-form="${this.formName}"] [name^="${key}"]`);
    if (!elems.length) { console.error(`Form "${this.formName}" doesn't have name^="${key}" control.`); }

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
    if (!keys) { console.error('delControlsErr: Argument "keys" is not defined. It should be an array.'); }
    this._debug('delControls', '--------- delControls ------', 'green', '#A1F8DC');
    this._debug('delControls', keys, 'green');
    for (const key of keys) {
      this.delControl(key);
    }
  }


  _debug(tip, text, color, background) {
    if (this.debugOpts[tip]) { console.log(`%c ${text}`, `color: ${color}; background: ${background}`); }
    return this.debugOpts;
  }



}

module.exports = Form;
