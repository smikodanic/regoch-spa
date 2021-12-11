/**
 * Auxilary controller methods.
 */
class Aux {

  /**
   * Get the controller property's value.
   * For example controller's property is this.company.name
   * @param {string} prop - controller property name, for example: company.name
   * @returns {any}
   */
  _getControllerValue(prop) {
    const reg = new RegExp(`\\(${this.$rg.varnameChars}\\)`);
    if (reg.test(prop)) { prop = this._solveControllerName(prop); } // solve round brackets

    const propSplitted = prop.split('.'); // ['company', 'name']
    const prop1 = propSplitted[0]; // company
    let val = this[prop1]; // controller property value
    propSplitted.forEach((prop, key) => {
      if (key !== 0 && !!val) { val = val[prop]; }
    });
    return val;
  }


  /**
   * Set the controller property's value.
   * For example controller's property is this.product.name
   * @param {string} prop - controller property name, for example: $model.product.name
   * @param {any} val - controller property value
   * @returns {void}
   */
  _setControllerValue(prop, val) {
    const propSplitted = prop.split('.'); // ['$model', 'product', 'name']
    let i = 1;
    let obj = this;
    for (const prop of propSplitted) {
      if (i !== propSplitted.length) { // not last property
        if (obj[prop] === undefined) { obj[prop] = {}; }
        obj = obj[prop];
      } else { // on last property associate the value
        obj[prop] = val;
      }
      i++;
    }
  }


  /**
   * Set the $model property's value. Up to 5 levels deep.
   * @param {string} prop - $model property name (path), for example: 'company.ceo.name' represents this.$model.company.ceo.name
   * @param {any} val - $model property value
   * @returns {void}
   */
  _setModelValue(prop, val) {
    const props = prop.split('.'); // ['company', 'cto',  'name']
    const modelName = props.shift(); // modelName:: 'company'  AND  props:: ['cto',  'name']

    if (props.length === 0) {
      this.$model[modelName] = val;

    } else if (props.length === 1) {
      const prop1 = props[0];
      const obj = this.$model[modelName] || {};
      obj[prop1] = val;
      this.$model[modelName] = obj;

    } else if (props.length === 2) {
      const prop1 = props[0];
      const prop2 = props[1];
      const obj = this.$model[modelName] || {};
      obj[prop1] = obj[prop1] || {};
      obj[prop1][prop2] = val;
      this.$model[modelName] = obj;

    } else if (props.length === 3) {
      const prop1 = props[0];
      const prop2 = props[1];
      const prop3 = props[2];
      const obj = this.$model[modelName] || {};
      obj[prop1] = obj[prop1] || {};
      obj[prop1][prop2] = obj[prop1][prop2] || {};
      obj[prop1][prop2][prop3] = val;
      this.$model[modelName] = obj;

    } else if (props.length === 4) {
      const prop1 = props[0];
      const prop2 = props[1];
      const prop3 = props[2];
      const prop4 = props[3];
      const obj = this.$model[modelName] || {};
      obj[prop1] = obj[prop1] || {};
      obj[prop1][prop2] = obj[prop1][prop2] || {};
      obj[prop1][prop2][prop3] = obj[prop1][prop2][prop3] || {};
      obj[prop1][prop2][prop3][prop4] = val;
      this.$model[modelName] = obj;

    } else if (props.length === 5) {
      const prop1 = props[0];
      const prop2 = props[1];
      const prop3 = props[2];
      const prop4 = props[3];
      const prop5 = props[4];
      const obj = this.$model[modelName] || {};
      obj[prop1] = obj[prop1] || {};
      obj[prop1][prop2] = obj[prop1][prop2] || {};
      obj[prop1][prop2][prop3] = obj[prop1][prop2][prop3] || {};
      obj[prop1][prop2][prop3][prop4] = obj[prop1][prop2][prop3][prop4] || {};
      obj[prop1][prop2][prop3][prop4][prop5] = val;
      this.$model[modelName] = obj;
    }

  }


  /**
   * Get the model value
   * @param {string} modelProp - model property path, for example 'car.year' is '$model.car.year'
   */
  _getModelValue(modelProp) {
    const prop = '$model.' + modelProp;
    const val = this._getControllerValue(prop);
    return val;
  }



  /**
   * Solve round brackets in the controller property name, for example: trains.$i.($model.fields.$i2) --> trains.$i.name
   * @param {string} prop - controller property name, trains.$i.($model.fields.$i2)
   */
  _solveControllerName(prop) {
    const reg = new RegExp(`\\(${this.$rg.varnameChars}\\)`, 'g');
    const brackets = prop.match(reg);
    if (!brackets) { return prop; }

    for (const bracket of brackets) {
      const reg2 = new RegExp(`\\((${this.$rg.varnameChars})\\)`);
      const prop2 = bracket.match(reg2)[1];
      const val = this._getControllerValue(prop2);
      prop = prop.replace(reg2, val);
    }

    return prop;
  }



  /**
   * Replace iteration variable $i with the number.
   * @param {number} i - number to replace $i with
   * @param {string} txt - text which needs to be replaced, usually it contains HTML tags
   * @param {string} nameExtension - extension of the variable name. For example if nameExtension is 2p then the $i2p will be replaced.
   * @returns {string}
   */
  _numerize_$i(i, txt, nameExtension) {
    let reg;
    if (!nameExtension || nameExtension === '0') { reg = new RegExp(`\\$i0`, 'g'); }
    else { reg = new RegExp(`\\$i${nameExtension}`, 'g'); }
    txt = txt.replace(reg, i);
    return txt;
  }


  /**
   * Replace controller property this. with the number. Value of this.prop must be a number.
   * @param {string} txt - text which needs to be replaced, usually it contains HTML tags
   * @returns {string}
   */
  _numerize_this(txt) {
    const reg = new RegExp(`this\\.${this.$rg.varnameChars}`, 'g');
    const thises = txt.match(reg);
    if (!thises) { return txt; }

    for (const thise of thises) {
      const reg2 = new RegExp(`this\\.(${this.$rg.varnameChars})`);
      const prop = thise.match(reg2)[1];
      const val = this._getControllerValue(prop);
      if (typeof val === 'number') { txt = txt.replace(reg2, val); }
    }

    return txt;
  }


  /**
   * Replace eval(expression) in the txt (HTML code) with the evaluated value.
   * @param {string} txt  - text which needs to be replaced, usually it contains HTML tags
   */
  _evalMath(txt) {
    const reg = /evalMath\([\d\+\-\*\/\%\(\)\s]+\)/g;
    const evs = txt.match(reg); // ['eval(0 + 1)', 'eval(0 ^ 2)']
    if (!evs) { return txt; }

    for (const ev of evs) {
      const reg2 = /evalMath\(([\d\+\-\*\/\%\(\)\s]+)\)/;
      const expression = ev.match(reg2)[1];
      const result = eval(expression);
      txt = txt.replace(reg2, result);
    }

    return txt;
  }




  /**
   * Find {ctrlProp} occurrences in the txt and replace it with the controller property value.
   * @param {string} txt - text which needs to be replaced
   */
  _parseInterpolated(txt) {
    const openingChar = '{';
    const closingChar = '}';

    const reg = new RegExp(`${openingChar}\\s*[0-9a-zA-Z\$\_\.]+\\s*${closingChar}`, 'g');
    const interpolations = txt.match(reg); // ["age", "user.name"]

    if (!interpolations || !interpolations.length) { // if there's no interpolated controller properties in the text
      return txt;
    } else {
      for (const interpolation of interpolations) {
        const prop = interpolation.replace(openingChar, '').replace(closingChar, '').trim();
        if (/\$i/.test(prop)) { txt = ''; break; } // don't parse the text with $i0, $i1, ... for example: users.$i0.name

        let val = this._getControllerValue('$model.' + prop);
        if (val === undefined) {
          console.log(`%c _parseInterpolatedWarn:: Controller property ${prop} is undefined.`, `color:Maroon; background:LightYellow`);
          val = '';
        }
        txt = txt.replace(interpolation, val);

        // nested interpolation, for example: data-rg-echo="{docs.$i.{fields.$i}}"
        if (reg.test(txt)) {
          txt = this._parseInterpolated(txt);
        }
      }
    }

    return txt;
  }


  /**
   * Caclulate comparison operators.
   * @param {any} val - the controller property value
   * @param {string} funcName - the function name: $not, $eq, ...
   * @param {any[]} funcArgs - function arguments (see _funcParse())
   * @returns {boolean}
   */
  _calcComparison(val, funcName, funcArgs) {
    if (!val) { return false; }

    let tf = false;
    const arg = !!funcArgs.length ? this._typeConvertor(funcArgs[0]) : '';

    if (funcName === '$not') { tf = !val; }
    else if (funcName === '$eq') { tf = val === arg; }
    else if (funcName === '$ne') { tf = val !== arg; }
    else if (funcName === '$gt') { tf = val > arg; }
    else if (funcName === '$gte') { tf = val >= arg; }
    else if (funcName === '$lt') { tf = val < arg; }
    else if (funcName === '$lte') { tf = val <= arg; }
    else if (funcName === '$in' && !!arg) { tf = arg.indexOf(val) !== -1; } // arg must be array
    else if (funcName === '$nin' && !!arg) { tf = arg.indexOf(val) === -1; } // arg must be array
    else if (funcName === '$reg' && !!arg) { tf = arg.test(val); } // arg must be RegExp, val must contain regexp to be true
    else if (funcName === '$nreg' && !!arg) { tf = !arg.test(val); } // arg must be RegExp, val shouldn't contain regexp to be true

    // console.log(`funcName:: ${funcName} -- val::${typeof val} ${val} vs. arg::${typeof arg} ${arg} => tf::${tf} --`);
    return tf;
  }


  /**
   * Convert string into integer, float or boolean.
   * @param {string} value
   * @returns {string | number | boolean | object}
   */
  _typeConvertor(value) {
    function isJSON(value) {
      try { JSON.parse(value); }
      catch (err) { return false; }
      return true;
    }

    if (!!value && !isNaN(value) && !/\./.test(value)) { // convert string into integer (12)
      value = parseInt(value, 10);
    } else if (!!value && !isNaN(value) && /\./.test(value)) { // convert string into float (12.35)
      value = parseFloat(value);
    } else if (value === 'true' || value === 'false') { // convert string into boolean (true)
      value = JSON.parse(value);
    } else if (isJSON(value)) {
      value = JSON.parse(value);
    }

    return value;
  }


  /**
   * Parse function definition and return function name and arguments.
   * For example: products.list(25, 'str', $event, $element) -> {funcName: 'products.list', funcArgs: [55, elem]}
   * @param {string} funcDef - function definition in the data-rg- attribute
   * @param {HTMLElement} elem - data-rg- HTML element on which is the event applied
   * @param {Event} event - event (click, keyup, ...) applied on the data-rg- element (used only in the DataRgListeners)
   * @returns {{funcName:string, funcArgs:any[], funcArgsStr:string}
   */
  _funcParse(funcDef, elem, event) {
    const matched = funcDef.match(/^(.+)\((.*)\)$/);
    if (!matched) { console.error(`_funcParseErr: Function "${funcDef}" has bad definition.`); return {}; }
    const funcName = matched[1] || ''; // function name: products.list

    const funcArgsStr = matched[2] || ''; // function arguments: 25, 'str', $event, $element, this.products
    const funcArgs = funcArgsStr
      .split(',')
      .map(arg => {
        arg = arg.trim().replace(/\'|\"/g, '');
        if (arg === '$element') { arg = elem; }
        else if (arg === '$value') { arg = this._getElementValue(elem); }
        else if (arg === '$event') { arg = event; }
        else if (arg === 'true' || arg === 'false') { arg = JSON.parse(arg); } // boolean
        else if (/^-?\d+\.?\d*$/.test(arg)) { arg = +arg; } // number
        else if (/^\/.+\/i?g?$/.test(arg)) { // if regular expression, for example in replace(/Some/i, 'some')
          const mat = arg.match(/^\/(.+)\/(i?g?)$/);
          arg = new RegExp(mat[1], mat[2]);
        }
        else if (/^this\./.test(arg)) { // if contain this. i.e. controller property
          const prop = arg.replace(/^this\./, ''); // remove this.
          const val = this._getControllerValue(prop);
          arg = val;
        }
        return arg;
      });

    return { funcName, funcArgs, funcArgsStr };
  }


  /**
   * Execute the function. It can be the controller method or the function defined in the controller proerty.
   * @param {string} funcName - function name, for example: runKEYUP or products.list
   * @param {any[]} funcArgs - function argumants
   * @return {void}
   */
  async _funcExe(funcName, funcArgs) {
    try {

      if (/\./.test(funcName)) {
        // execute the function in the controller property, for example: this.print.inConsole = () => {...}
        const propSplitted = funcName.split('.'); // ['print', 'inConsole']
        let obj = this;
        for (const prop of propSplitted) { obj = obj[prop]; }
        await obj(...funcArgs);
      } else {
        // execute the controller method
        if (!this[funcName]) { throw new Error(`Method "${funcName}" is not defined in the "${this.constructor.name}" controller.`); }
        await this[funcName](...funcArgs);
      }

    } catch (err) {
      console.error(err);
    }
  }


  /**
   * Clone the original element and place new element in the element sibling position.
   * The original element gets data-rg-xyz-id , unique ID to distinguish the element from other data-rg-xyz elements on the page.
   * The cloned element gets data-rg-xyz-gen and data-rg-xyz-id attributes.
   * @param {Element} elem - original element
   * @param {string} attrName - attribute name: data-rg-for, data-rg-repeat, data-rg-print
   * @param {string} attrVal - attribute value: 'continent @@ append'
   * @returns
   */
  _genElem_create(elem, attrName, attrVal) {
    // hide the original data-rg-xyz (reference) element
    elem.style.display = 'none';

    let uid = this._uid();

    const dataRgId = elem.getAttribute(`${attrName}-id`);
    if (!dataRgId) {
      elem.setAttribute(`${attrName}-id`, uid); // add data-rg-xyz-id , unique ID (because the page can have multiple elements with [data-rg-xyz-gen="${attrVal}"] and we need to distinguish them)
    } else {
      uid = dataRgId; // if the uid is already assigned
    }


    // clone the data-rg-xyz element
    const newElem = elem.cloneNode(true);
    newElem.removeAttribute(attrName);
    newElem.setAttribute(`${attrName}-gen`, attrVal);
    newElem.setAttribute(`${attrName}-id`, uid);
    newElem.style.display = '';

    // place newElem as sibling of the elem
    elem.parentNode.insertBefore(newElem, elem.nextSibling);

    return newElem;
  }



  /**
   * Remove element with the specific data-rg-xyz-gen and data-rg-xyz-id attributes.
   * @param {Element} elem - original element
   * @param {string} attrName - attribute name: data-rg-for, data-rg-repeat, data-rg-print
   * @param {string} attrVal - attribute value: 'continent @@ append'
   * @returns
   */
  _genElem_remove(elem, attrName, attrVal) {
    const uid = elem.getAttribute(`${attrName}-id`);
    const genAttr_sel = `[${attrName}-gen="${attrVal}"][${attrName}-id="${uid}"]`;
    const genElems = document.querySelectorAll(genAttr_sel);
    for (const genElem of genElems) { genElem.remove(); }
  }





  /**
   * Set the HTML form element value. Make correction according to the element & value type.
   * @param {HTMLElement} elem - HTML form element
   * @param {any} val - value to populate HTML form element (if val is undefined then it's empty string)
   */
  _setElementValue(elem, val = '') {
    if (typeof val === 'object') {
      if (elem.type === 'textarea') { val = JSON.stringify(val, null, 2); }
      else { val = JSON.stringify(val); }
    }
    elem.value = val;
    elem.setAttribute('value', val);
  }


  /**
   * Get the HTML form element value. Make correction according to the element type & value type.
   * Element types: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input
   * @param {HTMLElement} elem - HTML form element
   * @returns {any} val - single value or array for checkbox and select-multiple
   */
  _getElementValue(elem) {
    // pickup all elements with same name="something", for example checkboxes
    let val;

    if (elem.type === 'checkbox') {
      const elems = document.querySelectorAll(`[name="${elem.name}"]`);
      const valArr = [];
      let i = 1;
      for (const elem of elems) {
        const v = this._typeConvertor(elem.value);
        if (elem.checked) { valArr.push(v); val = valArr; }
        if (i === elems.length && !val) { val = []; }
        i++;
      }

    } else if (elem.type === 'select-multiple') {
      const opts = elem.selectedOptions; // selected options
      const valArr = [];
      let i = 1;
      for (const opt of opts) {
        const v = this._typeConvertor(opt.value);
        valArr.push(v);
        val = valArr;
        if (i === opts.length && !val) { val = []; }
        i++;
      }

    } else if (elem.type === 'radio') {
      const v = this._typeConvertor(elem.value);
      if (elem.checked) { val = v; }

    } else if (elem.type === 'number') {
      const v = elem.valueAsNumber;
      val = v;

    } else if (elem.type === 'password') {
      val = elem.value;

    } else {
      const v = this._typeConvertor(elem.value);
      val = v;
    }

    return val;
  }


  /**
 * Remove elements which has generated element as parent i.e. if the parent has data-rg-xyz-gen attribute then delete that parent.
 * @param {string} attrName - attribute name - 'data-rg-for'
 * @param {string|RegExp} attrValQuery - query the attribute value, for example: 'companies' , or /companies\.\$/i
 * @returns {void}
 */
  _removeParentElements(attrName, attrValQuery) {
    let elems = document.querySelectorAll(`[${attrName}]`);

    if (!!attrValQuery && typeof attrValQuery === 'string') {
      elems = document.querySelectorAll(`[${attrName}^="${attrValQuery}"]`);

    } else if (!!attrValQuery && attrValQuery instanceof RegExp) {
      const elems2 = [];
      for (const elem of elems) {
        const attrVal = elem.getAttribute(attrName);
        const tf = attrValQuery.test(attrVal);
        if (tf) { elems2.push(elem); }
      }
      elems = elems2;
    }

    // removals
    for (const elem of elems) {
      const parentElem = elem.parentNode;
      if (parentElem.hasAttribute(`${attrName}-gen`)) { parentElem.remove(); }
    }
  }


  /**
   * Get the DOM elements by the query.
   * For example in data-rg-for="companies.$i{fields.$i}" --> attrName will be 'data-rg-for' and attrQuery will be /^companies\.\$\{fields/
   * @param {string} attrName - attribute name - 'data-rg-for'
   * @param {string|RegExp} attrValQuery - query the attribute value, for example: 'companies' , or /companies\.\$/i
   * @returns {HTMLElement[]}
   */
  _listElements(attrName, attrValQuery) {
    let elems = document.querySelectorAll(`[${attrName}]`);

    if (!!attrValQuery && typeof attrValQuery === 'string') {
      elems = document.querySelectorAll(`[${attrName}^="${attrValQuery}"]`);

    } else if (!!attrValQuery && attrValQuery instanceof RegExp) {
      const elems2 = [];
      for (const elem of elems) {
        const attrVal = elem.getAttribute(attrName);
        const tf = attrValQuery.test(attrVal);
        if (tf) { elems2.push(elem); }
      }
      elems = elems2;
    }

    // remove elems with .$i in its data-rg- attribute
    const elems_filtered = [];
    for (const elem of elems) {
      const attrVal = elem.getAttribute(attrName);
      if (!/\.\$i/.test(attrVal)) { elems_filtered.push(elem); }
    }

    return elems_filtered;
  }


  /**
   * Sort elements from higher to lower priority -> 3,2,1,0 . Priority is defined in the attribute value, data-rg-for="companies @@ <priority>"
   * @param {HTMLElement[]} elems - array of the elements with specific attribute name
   * @param {string} attrName - attribute name, for example data-rg-for
   */
  _sortElementsByPriority(elems, attrName) {
    // get priority number from data-rg-for="companies @@ 2"
    const getPriority = elem => {
      const attrVal = elem.getAttribute(attrName);
      const attrValSplited = attrVal.split(this.$rg.separator);
      const priority = !!attrValSplited[1] ? attrValSplited[1].trim() : 0;
      return +priority;
    };

    // convert elems to JS Array --> [{elem, priority}]  because elems doesn't have sort()
    let elems_arr = [];
    for (const elem of elems) {
      const priority = getPriority(elem);
      elems_arr.push({ elem, priority });
    }

    // sort elements descending
    elems_arr = elems_arr.sort((elem1, elem2) => {
      const prior1 = elem1.priority;
      const prior2 = elem2.priority;
      return prior2 - prior1;
    });
    // console.log('elems_arr::', elems_arr);

    // convert JS Array to HTML Elements array
    elems = elems_arr.map(elem_arr => elem_arr.elem);

    return elems;
  }


  /**
   * Create unique id.
   */
  _uid() {
    const date = Date.now() / 1000;
    const ms = (date + '').split('.')[1];
    const rnd = Math.round(Math.random() * 1000);
    const uid = ms + '-' + rnd;
    return uid;
  }


  /**
   * Debug the controller methods.
   * @param {string} tip - debug type: rgprint, render, ...
   * @param {string} text - the printed text
   * @param {string} color - text color
   * @param {string} background - background color
   * @returns {object}
   */
  _debug(tip, text, color, background) {
    if (this.debugOpts[tip]) { console.log(`%c ${text}`, `color: ${color}; background: ${background}`); }
    return this.debugOpts;
  }


  _printError(err) {
    const errMsg = err.message;
    const errStack = err.stack.replace(/\n/g, '<br>');
    document.body.innerHTML = `
      <div style="margin:0px 13px;">
        <h5 style="color:Gray">Page Error</h5>
        <b style="color:Red;font:14px Verdana;">${errMsg}</b>
        <br><span style="color:Gray;font:12px Verdana;">${errStack}</span>
      </div>
    `;
  }



}


module.exports = Aux;
