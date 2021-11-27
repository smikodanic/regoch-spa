const DataRgListeners = require('./DataRgListeners');


/**
 * Parse HTML elements with the "data-rg-" attribute (non-listeners)
 */
class DataRg extends DataRgListeners {

  constructor() {
    super();
    this.separator = '@@';
    this.rgelems = {}; // set by rgElem()
  }


  /************** GENERATORS (create or remove HTML elements) *************/
  /**
   * data-rg-for="<controllerProperty> [@@<priority>]"
   * Parse the "data-rg-for" attribute. Multiply element by the controllerProperty array value.
   * Element with the higher priprity will be parsed before.
   * Examples:
   * data-rg-for="companies"
   * data-rg-for="company.employers"
   * data-rg-for="company.employers @@ 2" --> priority is 2
   * @param {string|RegExp} attrValQuery - controller property name, query for the attribute value
   * @returns {void}
   */
  rgFor(attrValQuery) {
    this._debug('rgFor', `--------- rgFor (start) ------`, 'navy', '#B6ECFF');

    const attrName = 'data-rg-for';
    this._removeParentElements(attrName, attrValQuery);
    let elems = this._listElements(attrName, attrValQuery);
    elems = this._sortElementsByPriority(elems, attrName); // sorted elements
    this._debug('rgFor', `found elements:: ${elems.length} | attrValQuery:: ${attrValQuery}`, 'navy');
    if (!elems.length) { return; }


    for (const elem of elems) {
      const attrVal = elem.getAttribute(attrName); // company.employers
      const attrValSplited = attrVal.split(this.separator);

      const priority = !!attrValSplited[1] ? attrValSplited[1].trim() : 0;

      const prop = attrValSplited[0].trim();
      const val = this._getControllerValue('$model.' + prop);

      // remove all gen elems
      this._genElem_remove(elem, attrName, attrVal);

      if (this._debug().rgFor) { console.log('rgFor -->', 'attrVal::', attrVal, ' | val::', val, ' priority::', priority); }
      if (!val || (!!val && !val.length)) { elem.style.display = 'none'; continue; }

      // generate new element and place it in the sibling position
      const newElem = this._genElem_create(elem, attrName, attrVal);

      // multiply new element by cloning and adding sibling elements
      const newElemsTotal = val.length;
      for (let i = 1; i <= newElemsTotal; i++) {
        const i2 = newElemsTotal - i; // when newElemsTotal=4 then i2 has 3,2,1,0
        elem.parentNode.insertBefore(newElem, elem.nextSibling);
        let outerHTML = this._numerize_$i(i2, newElem.outerHTML, priority); // replace $i, $i1, $i12 with the number
        outerHTML = this._numerize_this(outerHTML); // replace this.ctrlProp with the number
        outerHTML = this._evalMath(outerHTML); // calculte for example evalMath($i0 + 1)
        newElem.outerHTML = outerHTML;
        newElem.style.display = '';
      }

    }

    this._debug('rgFor', '--------- rgFor (end) ------', 'navy', '#B6ECFF');
  }



  /**
   * data-rg-repeat="controllerProperty"
   * Parse the "data-rg-repeat" attribute. Repeat the element n times wher n is defined in the controller property.
   * It's same as rgFor() except the controller property is not array but number.
   * Examples:
   * data-rg-repeat="totalRows"
   * @param {string|RegExp} attrValQuery - controller property name, query for the attribute value
   * @returns {void}
   */
  rgRepeat(attrValQuery) {
    this._debug('rgRepeat', `--------- rgRepeat (start) ------`, 'navy', '#B6ECFF');

    const attrName = 'data-rg-repeat';
    const elems = this._listElements(attrName, attrValQuery);
    this._debug('rgRepeat', `found elements:: ${elems.length} | attrValQuery:: ${attrValQuery}`, 'navy');
    if (!elems.length) { return; }


    for (const elem of elems) {
      const attrVal = elem.getAttribute(attrName);

      const prop = attrVal.trim();
      const val = +this._getControllerValue('$model.' + prop);
      this._debug('rgRepeat', `Element will be repeated ${val} times.`, 'navy');

      // remove all gen elems
      this._genElem_remove(elem, attrName, attrVal);

      // generate new element and place it in the sibling position
      const newElem = this._genElem_create(elem, attrName, attrVal);

      // multiply element by cloning and adding sibling elements
      const newElemsTotal = +val;
      for (let i = 1; i <= newElemsTotal; i++) {
        const i2 = newElemsTotal - i; // 3,2,1,0
        elem.parentNode.insertBefore(newElem, elem.nextSibling);
        let outerHTML = this._numerize_$i(i2, newElem.outerHTML, 0); // replace $i, $i1, $i12 with the number
        outerHTML = this._numerize_this(outerHTML); // replace this.ctrlProp with the number
        outerHTML = this._evalMath(outerHTML);
        newElem.outerHTML = outerHTML;
      }

    }

    this._debug('rgRepeat', '--------- rgRepeat (end) ------', 'navy', '#B6ECFF');
  }


  /**
   * data-rg-print="<controllerProperty> [@@ inner|outer|sibling|prepend|append]"
   * data-rg-print="company.name @@ inner"
   * data-rg-print="company.name @@ inner @@ keep"   - keep the innerHTML when value is undefined
   * Parse the "data-rg-print" attribute. Print the controller's property to view.
   * Examples:
   * data-rg-print="product" - product is the controller property
   * data-rg-print="product.name @@ outer"
   * data-rg-print="product.name @@ sibling"
   * @param {string|RegExp} attrValQuery - controller property name, query for the attribute value
   * for example product.name in the data-rg-print="product.name @@ inner". This speed up parsing because it's limited only to one element.
   * @returns {void}
   */
  rgPrint(attrValQuery) {
    this._debug('rgPrint', `--------- rgPrint (start) ------`, 'navy', '#B6ECFF');

    const attrName = 'data-rg-print';
    const elems = this._listElements(attrName, attrValQuery);
    this._debug('rgPrint', `found elements:: ${elems.length} | attrValQuery:: ${attrValQuery}`, 'navy');
    if (!elems.length) { return; }


    for (const elem of elems) {
      const attrVal = elem.getAttribute(attrName);
      const attrValSplited = attrVal.split(this.separator);

      // get val and apply pipe to the val
      const propPipe = attrValSplited[0].trim(); // controller property name with pipe:  company.name | slice(0,21)
      const propPipeSplitted = propPipe.split('|');
      const prop = propPipeSplitted[0].trim(); // company.name
      let val = this._getControllerValue('$model.' + prop);

      // correct val
      const toKeep = !!attrValSplited[2] ? attrValSplited[2].trim() === 'keep' : false; // to keep the innerHTML as value when val is undefined
      if (val === undefined) { val = toKeep ? elem.innerHTML : ''; } // the default value is defined in the HTML tag
      else if (typeof val === 'object') { val = JSON.stringify(val); }
      else if (typeof val === 'number') { val = +val; }
      else if (typeof val === 'string') { val = val; }
      else if (typeof val === 'boolean') { val = val.toString(); }
      else { val = val; }

      // apply pipe, for example: data-rg-print="val | slice(0,130)"
      let pipe_funcDef = propPipeSplitted[1]; // slice(0, 130)
      if (!!pipe_funcDef && !!val) {
        pipe_funcDef = pipe_funcDef.trim();
        const { funcName, funcArgs } = this._funcParse(pipe_funcDef, elem);
        if (typeof val[funcName] === 'function') { val = val[funcName](...funcArgs); }
      }

      // define action
      let act = attrValSplited[1] || 'inner';
      act = act.trim();

      // remove all gen elems
      this._genElem_remove(elem, attrName, attrVal);

      // generate new element and place it in the sibling position
      let newElem;
      if (act !== 'inner') { newElem = this._genElem_create(elem, attrName, attrVal); }


      // load content in the element
      if (act === 'inner') {
        elem.innerHTML = val;
      } else if (act === 'outer') {
        const id2 = newElem.getAttribute('data-rg-print-id');
        newElem.outerHTML = `<span data-rg-print-gen="${attrVal}" data-rg-print-id="${id2}">${val}</span>`;
      } else if (act === 'sibling') {
        elem.style.display = '';
        const id2 = newElem.getAttribute('data-rg-print-id');
        newElem.outerHTML = `<span data-rg-print-gen="${attrVal}" data-rg-print-id="${id2}">${val}</span>`;
      } else if (act === 'prepend') {
        newElem.innerHTML = val + ' ' + elem.innerHTML;
      } else if (act === 'append') {
        newElem.innerHTML = elem.innerHTML + ' ' + val;
      } else if (act === 'inset') {
        newElem.innerHTML = elem.innerHTML.replace('${}', val);
      } else {
        elem.innerHTML = val;
      }

      this._debug('rgPrint', `rgPrint:: ${propPipe} = ${val} -- act::"${act}" -- toKeep::${toKeep}`, 'navy');
    }

    this._debug('rgPrint', '--------- rgPrint (end) ------', 'navy', '#B6ECFF');
  }




  /************ NON-GENERATORS (will not generate new HTML elements or remove existing - will not change the DOM structure) ***********/
  /**
   * data-rg-if="<controllerProperty>"
   * Parse the "data-rg-if" attribute. Show or hide the HTML element by setting display:none.
   * Examples:
   * data-rg-if="ifAge"
   * data-rg-if="ifAge $eq(22)"
   * @param {string|RegExp} attrValQuery - controller property name, query for the attribute value
   * @returns {void}
   */
  rgIf(attrValQuery) {
    this._debug('rgIf', '--------- rgIf (start) ------', 'navy', '#B6ECFF');

    const attrName = 'data-rg-if';
    const elems = this._listElements(attrName, attrValQuery);
    this._debug('rgIf', `found elements:: ${elems.length} | attrValQuery:: ${attrValQuery}`, 'navy');
    if (!elems.length) { return; }

    for (const elem of elems) {
      const attrVal = elem.getAttribute(attrName).trim(); // ifAge
      if (!attrVal) { console.error(`Attribute "data-rg-if" has bad definition (data-rg-if="${attrVal}").`); continue; }

      const propComp = attrVal.trim(); // controller property with comparison function, for example: ifAge $eq(22)
      const propCompSplitted = propComp.split(/\s+/);

      const prop = propCompSplitted[0].trim(); // ifAge
      const val = this._getControllerValue('$model.' + prop);

      const funcDef = propCompSplitted[1] ? propCompSplitted[1].trim() : false; // $eq(22)
      let tf = false;
      if (!!funcDef) {
        // parse data-rg-if with the comparison operators: $not(), $eq(22), $ne(22), ...
        const { funcName, funcArgs } = this._funcParse(funcDef, elem);
        tf = this._calcComparison(val, funcName, funcArgs);
      } else {
        // parse data-rg-if without the comparison operators
        tf = !!val;
      }

      // hide/show elem
      if (tf) {
        const dataRgPrint_attrVal = elem.getAttribute('data-rg-print');
        if (!!dataRgPrint_attrVal && /outer|sibling|prepend|append|inset/.test(dataRgPrint_attrVal)) { elem.style.display = 'none'; } // element with data-rg-print should stay hidden because of _genElem_create()
        else { elem.style.display = ''; }
      } else {
        elem.style.display = 'none';
      }

      this._debug('rgIf', `rgIF:: data-rg-if="${attrVal}" & val=(${typeof val}) ${val} => tf: ${tf} -- elem-before: ${elem.outerHTML}`, 'navy');
    }

    this._debug('rgIf', '--------- rgIf (end) ------', 'navy', '#B6ECFF');
  }



  /**
   * data-rg-switch="<controllerProperty> [@@ multiple]"
   * Parse the "data-rg-switch" attribute. Show or hide elements depending if "data-rg-switchcase" value matches controller property.
   * Examples:
   * data-rg-switch="ctrlprop" - ctrlprop is string, number or boolean
   * data-rg-switch="ctrlprop @@ multiple" - ctrlprop is array of string, number or boolean
   * Notice @@ multiple can select multiple switchcases.
   * @param {string|RegExp} attrValQuery - controller property name, query for the attribute value
   * @returns {void}
   */
  rgSwitch(attrValQuery) {
    this._debug('rgSwitch', '--------- rgSwitch (start) ------', 'navy', '#B6ECFF');

    const attrName = 'data-rg-switch';
    const elems = this._listElements(attrName, attrValQuery);
    this._debug('rgSwitch', `found elements:: ${elems.length} | attrValQuery:: ${attrValQuery}`, 'navy');
    if (!elems.length) { return; }

    for (const elem of elems) {
      const attrVal = elem.getAttribute(attrName) || ''; // 'controllerProperty @@ multiple'
      const attrValSplited = attrVal.split(this.separator);

      const isMultiple = !!attrValSplited[1] ? attrValSplited[1].trim() === 'multiple' : false;

      const prop = attrValSplited[0].trim();
      const val = this._getControllerValue('$model.' + prop);

      // get data-rg-switchcase and data-rg-switchdefault attribute values
      const switchcaseElems = elem.querySelectorAll('[data-rg-switch] > [data-rg-switchcase]');
      const switchdefaultElem = elem.querySelector('[data-rg-switch] > [data-rg-switchdefault]');

      // set data-rg-switchcase
      let isMatched = false; // is data-rg-switchcase value matched
      for (const switchcaseElem of switchcaseElems) {
        let switchcaseAttrVal = switchcaseElem.getAttribute('data-rg-switchcase');
        switchcaseAttrVal = switchcaseAttrVal.trim();

        if (!isMultiple && switchcaseAttrVal === val) { switchcaseElem.style.display = ''; isMatched = true; }
        else if (isMultiple && val && val.indexOf(switchcaseAttrVal) !== -1) { switchcaseElem.style.display = ''; isMatched = true; }
        else { switchcaseElem.style.display = 'none'; }

        this._debug('rgSwitch', `data-rg-switch="${attrVal}" data-rg-switchcase="${switchcaseAttrVal}" --val:: "${val}" --isMatched: ${isMatched}`, 'navy');
      }

      // set data-rg-switchdefault
      if (!!switchdefaultElem) { !isMatched ? switchdefaultElem.style.display = '' : switchdefaultElem.style.display = 'none'; }

      this._debug('rgSwitch', `data-rg-switch="${attrVal}" data-rg-switchdefault --isMatched: ${isMatched}`, 'navy');
    }

    this._debug('rgSwitch', '--------- rgSwitch (end) ------', 'navy', '#B6ECFF');
  }



  /**
   * data-rg-disabled="<controllerProperty>"
   * Parse the "data-rg-disabled" attribute. set the element to disabled state.
   * Examples:
   * data-rg-disabled="ifAge"
   * data-rg-disabled="ifAge $eq(22)"
   * @param {string|RegExp} attrValQuery - controller property name, query for the attribute value
   * @returns {void}
   */
  rgDisabled(attrValQuery) {
    this._debug('rgDisabled', '--------- rgDisabled (start) ------', 'navy', '#B6ECFF');

    const attrName = 'data-rg-disabled';
    const elems = this._listElements(attrName, attrValQuery);
    this._debug('rgDisabled', `found elements:: ${elems.length} | attrValQuery:: ${attrValQuery}`, 'navy');
    if (!elems.length) { return; }

    for (const elem of elems) {
      const attrVal = elem.getAttribute(attrName).trim(); // ifAge
      if (!attrVal) { console.error(`rgDisabled Error:: Attribute has bad definition (data-rg-disabled="${attrVal}").`); continue; }

      const propComp = attrVal.trim(); // controller property with comparison function, for example: ifAge $eq(22)
      const propCompSplitted = propComp.split(/\s+/);

      const prop = propCompSplitted[0].trim(); // ifAge
      const val = this._getControllerValue('$model.' + prop);

      const funcDef = propCompSplitted[1] ? propCompSplitted[1].trim() : false; // $eq(22)
      let tf = false;
      if (!!funcDef) {
        // parse data-rg-disabled with the comparison operators: $not(), $eq(22), $ne(22), ...
        const { funcName, funcArgs } = this._funcParse(funcDef, elem);
        tf = this._calcComparison(val, funcName, funcArgs);
      } else {
        // parse data-rg-disabled without the comparison operators
        tf = !!val;
      }

      // disable/enable the element
      if (tf) { elem.disabled = true; }
      else { elem.disabled = false; }

      this._debug('rgDisabled', `rgDisabled:: data-rg-disabled="${attrVal}" & val=${val} => tf: ${tf} -- elem-before: ${elem.outerHTML}`, 'navy');
    }

    this._debug('rgDisabled', '--------- rgDisabled (end) ------', 'navy', '#B6ECFF');
  }



  /**
   * data-rg-value="<controllerProperty>"
   * Parse the "data-rg-value" attribute. Sets the "value" attribute with the controller property value.
   * Examples:
   * data-rg-value="product"
   * data-rg-value="employee.name"
   * @param {string|RegExp} attrValQuery - controller property name, query for the attribute value
   * @returns {void}
   */
  rgValue(attrValQuery) {
    this._debug('rgValue', '--------- rgValue ------', 'navy', '#B6ECFF');

    const attrName = 'data-rg-value';
    const elems = this._listElements(attrName, attrValQuery);
    this._debug('rgValue', `found elements:: ${elems.length} | attrValQuery:: ${attrValQuery}`, 'navy');
    if (!elems.length) { return; }

    for (const elem of elems) {
      const attrVal = elem.getAttribute(attrName);
      if (!attrVal) { console.error(`rgValue Error:: Attribute has bad definition (data-rg-value="${attrVal}").`); continue; }

      const prop = attrVal.trim();
      const val = this._getControllerValue('$model.' + prop);

      this._setElementValue(elem, val);

      this._debug('rgValue', `elem.type:: ${elem.type} -- ${prop}:: ${val}`, 'navy');
    }
  }


  /**
   * data-rg-setinitial="<controllerProperty>"
   * Parse the "data-rg-setinitial" attribute. Get the element value and set the controller property value..
   * Examples:
   * data-rg-setinitial="product"
   * data-rg-setinitial="employee.name"
   * @param {string|RegExp} attrValQuery - controller property name, query for the attribute value
   * @returns {void}
   */
  rgSetinitial(attrValQuery) {
    this._debug('rgSetinitial', '--------- rgSetinitial ------', 'navy', '#B6ECFF');

    const attrName = 'data-rg-setinitial';
    const elems = this._listElements(attrName, attrValQuery);
    this._debug('rgSetinitial', `found elements:: ${elems.length} | attrValQuery:: ${attrValQuery}`, 'navy');
    if (!elems.length) { return; }

    for (const elem of elems) {
      const attrVal = elem.getAttribute(attrName);
      if (!attrVal) { console.error(`rgSetinitial Error:: Attribute has bad definition (data-rg-setinitial="${attrVal}").`); continue; }

      const val = this._getElementValue(elem);
      const prop = attrVal.trim();
      this._setControllerValue('$model.' + prop, val);

      this._debug('rgSetinitial', `elem.type:: ${elem.type} -- set initial --> ${prop}:: ${val}`, 'navy');
    }
  }



  /**
   * data-rg-checked="<controllerProperty>"
   * Sets the "checked" attribute with the controller property value.
   * The controller property is an array. If the checkbox value is in that array then the checkbox is checked.
   * Use it for checkboxes only.
   * Examples:
   * data-rg-checked="selectedProducts"
   * @param {string|RegExp} attrValQuery - controller property name, query for the attribute value
   * @returns {void}
   */
  rgChecked(attrValQuery) {
    this._debug('rgChecked', '--------- rgChecked ------', 'navy', '#B6ECFF');

    const attrName = 'data-rg-checked';
    const elems = this._listElements(attrName, attrValQuery);
    this._debug('rgChecked', `found elements:: ${elems.length} | attrValQuery:: ${attrValQuery}`, 'navy');
    if (!elems.length) { return; }

    for (const elem of elems) {
      const attrVal = elem.getAttribute(attrName);
      if (!attrVal) { console.error(`rgChecked Error:: Attribute has bad definition (data-rg-checked="${attrVal}").`); continue; }

      const prop = attrVal.trim();
      const val = this._getControllerValue('$model.' + prop); // val must be array
      if (!Array.isArray(val)) { console.error(`rgChecked Error:: The controller property ${prop} is not array.`); continue; }

      if (val.indexOf(elem.value) !== -1) { elem.checked = true; }
      else { elem.checked = false; }

      this._debug('rgChecked', `elem.type:: ${elem.type} -- ${prop}:: ${val}`, 'navy');
    }
  }



  /**
   * data-rg-class="<controllerProperty> [@@ add|replace]"
   * Parse the "data-rg-class" attribute. Set element class attribute.
   * Examples:
   * data-rg-class="myKlass" - add new classes to existing classes
   * data-rg-class="myKlass @@ add" - add new classes to existing classes
   * data-rg-class="myKlass @@ replace" - replace existing classes with new classes
   * @param {string|RegExp} attrValQuery - controller property name, query for the attribute value
   * @returns {void}
   */
  rgClass(attrValQuery) {
    this._debug('rgClass', '--------- rgClass ------', 'navy', '#B6ECFF');

    const attrName = 'data-rg-class';
    const elems = this._listElements(attrName, attrValQuery);
    this._debug('rgClass', `found elements:: ${elems.length} | attrValQuery:: ${attrValQuery}`, 'navy');
    if (!elems.length) { return; }

    for (const elem of elems) {
      const attrVal = elem.getAttribute(attrName) || ''; // 'controllerProperty'
      const attrValSplited = attrVal.split(this.separator);

      const prop = attrValSplited[0].trim(); // controller property name company.name
      const valArr = this._getControllerValue('$model.' + prop) || []; // ['my-bold', 'my-italic']
      if (!Array.isArray(valArr)) { console.log(`%c rgClassWarn:: The controller property "${prop}" is not an array.`, `color:Maroon; background:LightYellow`); continue; }

      let act = attrValSplited[1] || '';
      act = act.trim() || 'add';

      if (act == 'replace' && !!valArr.length) { elem.removeAttribute('class'); }
      for (const val of valArr) { elem.classList.add(val); }

      this._debug('rgClass', `data-rg-class="${attrVal}" --- ctrlProp:: ${prop} | ctrlVal:: ${valArr} | act:: ${act}`, 'navy');
    }
  }



  /**
   * data-rg-style="<controllerProperty> [@@ add|replace]"
   * Parse the "data-rg-style" attribute. Set element style attribute.
   * Examples:
   * data-rg-style="myStyl" - add new styles to existing sytles
   * data-rg-style="myStyl @@ add" - add new styles to existing sytles
   * data-rg-style="myStyl @@ replace" - replace existing styles with new styles
   * @param {string|RegExp} attrValQuery - controller property name, query for the attribute value
   * @returns {void}
   */
  rgStyle(attrValQuery) {
    this._debug('rgStyle', '--------- rgStyle ------', 'navy', '#B6ECFF');

    const attrName = 'data-rg-style';
    const elems = this._listElements(attrName, attrValQuery);
    this._debug('rgStyle', `found elements:: ${elems.length} | attrValQuery:: ${attrValQuery}`, 'navy');
    if (!elems.length) { return; }

    for (const elem of elems) {
      const attrVal = elem.getAttribute(attrName) || ''; // 'controllerProperty'
      const attrValSplited = attrVal.split(this.separator);

      const prop = attrValSplited[0].trim();
      const valObj = this._getControllerValue('$model.' + prop); // {fontSize: '21px', color: 'red'}

      let act = attrValSplited[1] || '';
      act = act.trim() || 'add';

      if (act == 'replace') { elem.removeAttribute('style'); }

      let styleProps = [];
      if (!!valObj) {
        styleProps = Object.keys(valObj);
        for (const styleProp of styleProps) { elem.style[styleProp] = valObj[styleProp]; }
      }

      this._debug('rgStyle', `data-rg-style="${attrVal}" --- prop:: "${prop}" | styleProps:: "${styleProps}" | act:: "${act}"`, 'navy');
    }
  }



  /**
   * data-rg-src"<controllerProperty> [@@<defaultSrc>]"
   * Parse the "data-rg-src" attribute. Set element src attribute.
   * Examples:
   * data-rg-src="imageURL" - define <img src="">
   * @param {string|RegExp} attrValQuery - controller property name, query for the attribute value
   * @returns {void}
   */
  rgSrc(attrValQuery) {
    this._debug('rgSrc', '--------- rgSrc ------', 'navy', '#B6ECFF');

    const attrName = 'data-rg-src';
    const elems = this._listElements(attrName, attrValQuery);
    this._debug('rgSrc', `found elements:: ${elems.length} | attrValQuery:: ${attrValQuery}`, 'navy');
    if (!elems.length) { return; }

    for (const elem of elems) {
      const attrVal = elem.getAttribute(attrName) || '';
      const attrValSplited = attrVal.split(this.separator);

      const prop = attrValSplited[0].trim();
      const val = this._getControllerValue('$model.' + prop);

      // when val is undefined load defaultSrc
      let defaultSrc = attrValSplited[1] || '';
      defaultSrc = defaultSrc.trim();

      const src = val || defaultSrc;
      elem.src = src;

      this._debug('rgSrc', `data-rg-src="${attrVal}" --prop:: "${prop}" --src:: "${src}"`, 'navy');
    }
  }



  /**
  * data-rg-attr"<controllerProperty> [@@<attributeName>]"
  * Parse the "data-rg-attr" attribute. Set element's attribute value.
  * Examples:
  * data-rg-attr="pageURL @@ href" - define <a href="">
  * @param {string|RegExp} attrValQuery - controller property name, query for the attribute value
  * @returns {void}
  */
  rgAttr(attrValQuery) {
    this._debug('rgAttr', '--------- rgAttr ------', 'navy', '#B6ECFF');

    const attrName = 'data-rg-attr';
    const elems = this._listElements(attrName, attrValQuery);
    this._debug('rgAttr', `found elements:: ${elems.length} | attrValQuery:: ${attrValQuery}`, 'navy');
    if (!elems.length) { return; }

    for (const elem of elems) {
      const attrVal = elem.getAttribute(attrName) || ''; // pageURL @@ href
      const attrValSplited = attrVal.split(this.separator);

      const prop = attrValSplited[0].trim();
      const val = this._getControllerValue('$model.' + prop);

      if (!attrValSplited[1]) { console.error(`Attribute name is not defined in the ${attrName}="${attrVal}".`); continue; }
      const attribute_name = attrValSplited[1].trim(); // href

      elem.setAttribute(attribute_name, val);

      this._debug('rgAttr', `data-rg-attr="${attrVal}" --prop:: "${prop}" --val:: "${val}" --> added ${attribute_name}="${val}"`, 'navy');
    }
  }



  /**
   * data-rg-elem="<rgelemsProp>"     --> rgelemsProp is the property of the this.rgelems, for example data-rg-elem="myElement" => this.rgelems.myElement
   * Parse the "data-rg-elem" attribute. Transfer the DOM element to the controller property "this.rgelems".
   * Examples:
   * data-rg-elem="paragraf" -> fetch it with this.rgelems['paragraf']
   * @param {string|RegExp} attrValQuery - query for the attribute value
   * @returns {void}
   */
  rgElem(attrValQuery) {
    this._debug('rgElem', '--------- rgElem ------', 'navy', '#B6ECFF');

    const attrName = 'data-rg-elem';
    const elems = this._listElements(attrName, attrValQuery);
    this._debug('rgElem', `found elements:: ${elems.length} | attrValQuery:: ${attrValQuery}`, 'navy');
    if (!elems.length) { return; }

    // associate values
    for (const elem of elems) {
      const attrVal = elem.getAttribute(attrName) || ''; // 'paragraf'
      this.rgelems[attrVal] = elem;
    }
  }



  /**
   * data-rg-echo="<text>"
   * Parse the "data-rg-echo" attribute. Prints the "text" in the HTML element as innerHTML.
   * Examples:
   * data-rg-echo="$i+1"  --> prints the iteration number
   * @param {string|RegExp} attrValQuery - the text which will be echoed in the element as textContent
   * @returns {void}
   */
  rgEcho(attrValQuery) {
    this._debug('rgEcho', '--------- rgEcho (start) ------', 'navy', '#B6ECFF');

    const attrName = 'data-rg-echo';
    const elems = this._listElements(attrName, attrValQuery);
    this._debug('rgEcho', `found elements:: ${elems.length} | attrValQuery:: ${attrValQuery}`, 'navy');
    if (!elems.length) { return; }

    // associate values
    for (const elem of elems) {
      let txt = elem.getAttribute('data-rg-echo');
      this._debug('rgEcho', `rgEcho txt before: ${txt}`, 'navy', '#B6ECFF');

      // checks html tags
      if (/<[^>]*>/.test(txt)) { console.log(`%c rgEchoWarn:: The text shouldn't contain HTML tags.`, `color:Maroon; background:LightYellow`); }

      txt = this._parseInterpolated(txt); // parse {ctrlProp}
      this._debug('rgEcho', `rgEcho txt after: ${txt}\n`, 'navy', '#B6ECFF');

      elem.textContent = txt;
    }

    this._debug('rgEcho', '--------- rgEcho (end) ------', 'navy', '#B6ECFF');
  }



  /**
   * data-rg-flicker="<boolean>"
   * Parse the "data-rg-flicker" attribute. Initially when controller start hide elements with data-rg-flicker and show it when render is finished.
   * It will prevent element flickering during render process.
   * @param {string} bool - to show or hide the element
   * @returns {void}
   */
  rgFlicker(bool) {
    this._debug('rgFlicker', '--------- rgFlicker ------', 'navy', '#B6ECFF');

    const attrName = 'data-rg-flicker';
    const elems = this._listElements(attrName, '');
    this._debug('rgFlicker', `found elements:: ${elems.length}`, 'navy');
    if (!elems.length) { return; }

    for (const elem of elems) {
      if (bool) { elem.style.visibility = ''; }
      else { elem.style.visibility = 'hidden'; }
      this._debug('rgFlicker', `  ${bool} --> elem:: ${elem.localName}.${elem.className}`, 'navy');
    }

  }



}


module.exports = DataRg;
