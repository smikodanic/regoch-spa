/**
 * HTML Form Library
 * According to W3C Standard https://html.spec.whatwg.org/multipage/forms.html
 */


class Form {

  /**
   * @param {string} formName - name of the form (data-rg-form value)
   */
  constructor(formName) {
    this.formName = formName;
    this.debug = {
      setControl: true,
      getControl: true,
      delControl: true
    };
  }


  /**
   * Set the form control value.
   * @param {string} key - the value of the "name" HTML attribute
   * @param {any|string[]} val - the value
   */
  setControl(key, val) {
    this.debugger('setControl', '--------- setControl ------', 'green', '#A1F8DC');
    this.debugger('setControl', `${key} = ${val}`, 'green');
    const elems = document.querySelectorAll(`form[data-rg-form="${this.formName}"] [name="${key}"]`);
    if (!elems.length) { throw new Error(`Form "${this.formName}" doesn't have "${key}" control.`); }

    for (const elem of elems) {
      if (elem.type === 'checkbox') {
        elem.checked = false;
        if (val.indexOf(elem.value) !== -1) { elem.checked = true; } // val is array
      } else if (elem.type === 'select-multiple') {
        const options = elem; // all options
        for (const option of options) {
          option.selected = false;
          if (val.indexOf(option.value) !== -1) { option.selected = true; }  // val is array
        }
      } else if (elem.type === 'radio') {
        elem.checked = false;
        if (val === elem.value) { elem.checked = true; }
      } else {
        elem.value = val; // val is not array
      }
    }

  }


  /**
   * Get the form control value.
   * @param {string} key - the value of the "name" HTML attribute
   */
  getControl(key) {
    this.debugger('getControl', '--------- getControl ------', 'green', '#A1F8DC');
    const elems = document.querySelectorAll(`form[data-rg-form="${this.formName}"] [name="${key}"]`);
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

    this.debugger('getControl', `${val}`, 'green');
    return val;
  }


  /**
   * Get the form control value.
   * @param {string} key - the value of the "name" HTML attribute
   */
  delControl(key) {
    this.debugger('delControl', '--------- delControl ------', 'green', '#A1F8DC');
    this.debugger('delControl', key, 'green');
    const elems = document.querySelectorAll(`form[data-rg-form="${this.formName}"] [name="${key}"]`);
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



  /********** MISC *********/
  /**
   * Debugger. Use it as this.debugger(var1, var2, var3)
   * @returns {void}
   */
  debugger(tip, text, color, background) {
    if (this.debug[tip]) { console.log(`%c ${text}`, `color: ${color}; background: ${background}`); }
  }





}

module.exports = Form;
