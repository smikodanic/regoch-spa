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
   * data-rg-for="<controllerProp>[:<limit>][:<skip>]"
   * Parse the "data-rg-for" attribute. Multiply element.
   * Examples:
   * data-rg-for="companies"
   * data-rg-for="company.employers"
   * @param {string} controllerProp - controller property name
   * @returns {void}
   */
  rgFor(controllerProp) {
    this._debug('rgFor', `--------- rgFor (start) -- renderDelay: ${this.renderDelay} ------`, 'navy', '#B6ECFF');

    const attrName = 'data-rg-for';
    let elems = document.querySelectorAll(`[${attrName}]`);
    if (!!controllerProp) { elems = document.querySelectorAll(`[${attrName}^="${controllerProp}"]`); }
    this._debug('rgFor', `found elements:: ${elems.length} | controllerProp:: ${controllerProp}`, 'navy');
    if(!elems.length) { return; }


    for (const elem of elems) {
      const attrVal = elem.getAttribute(attrName); // company.employers

      const propLimSkp = attrVal.trim(); // company.employers:limit:skip
      const propLimSkpSplited = propLimSkp.split(':');

      let limitName = propLimSkpSplited[1]; // limit variable name
      limitName = !!limitName ? limitName.trim() : '';
      const limit = +this[limitName] || 1000;

      let skipName = propLimSkpSplited[2]; // skip variable name
      skipName = !!skipName ? skipName.trim() : '';
      const skip = +this[skipName] || 0;

      let prop = propLimSkpSplited[0];
      prop = prop.trim();
      const val = this._getControllerValue(prop);
      if(this._debug().rgFor) { console.log('rgFor() -->', 'attrVal::', attrVal, ' | val::', val, ' limit::', limit, ' skip::', skip); }
      if (!val) { continue; }

      // generate new element and place it in the sibling position
      const newElem = this._generateNewElem(elem, attrName, attrVal);

      // multiply element by cloning and adding sibling elements
      const limit2 = skip + limit < val.length ? skip + limit : val.length;
      for (let i = skip; i < limit2; i++) {
        const j = limit2 - 1 - i + skip;
        elem.parentNode.insertBefore(newElem, elem.nextSibling);
        newElem.outerHTML = this._parse$i(j, newElem.outerHTML); // replace .$i or $i+1 , $i-1, $i^1, ...
      }

    }

    this._debug('rgFor', '--------- rgFor (end) ------', 'navy', '#B6ECFF');
  }



  /**
   * data-rg-repeat="controllerProp"
   * Parse the "data-rg-repeat" attribute. Repeat the element n times wher n is defined in the controller property.
   * It's same as rgFor() except the controller property is not array but number.
   * Examples:
   * data-rg-repeat="totalRows"
   * @param {string} controllerProp - controller property name
   * @returns {void}
   */
  rgRepeat(controllerProp) {
    this._debug('rgRepeat', `--------- rgRepeat (start) -- renderDelay: ${this.renderDelay} ------`, 'navy', '#B6ECFF');

    const attrName = 'data-rg-repeat';
    let elems = document.querySelectorAll(`[${attrName}]`);
    if (!!controllerProp) { elems = document.querySelectorAll(`[${attrName}^="${controllerProp}"]`); }
    this._debug('rgRepeat', `found elements:: ${elems.length} | controllerProp:: ${controllerProp}`, 'navy');
    if (!elems.length) { return; }


    for (const elem of elems) {
      const attrVal = elem.getAttribute(attrName);

      const prop = attrVal.trim();
      const val = +this._getControllerValue(prop);
      this._debug('rgRepeat', `Element will be repeated ${val} times.`, 'navy');

      // generate new element and place it in the sibling position
      const newElem = this._generateNewElem(elem, attrName, attrVal);

      // multiply element by cloning and adding sibling elements
      for (let i = 0; i < val; i++) {
        const j = val - 1 - i;
        elem.parentNode.insertBefore(newElem, elem.nextSibling);
        newElem.outerHTML = this._parse$i(j, newElem.outerHTML); // replace .$i or $i+1 , $i-1, $i^1, ...
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
   * @param {string} controllerProp - part of the attribute value which relates to the controller property,
   * for example product.name in the data-rg-print="product.name @@ inner". This speed up parsing because it's limited only to one element.
   * @returns {void}
   */
  rgPrint(controllerProp) {
    this._debug('rgPrint', `--------- rgPrint (start) -- renderDelay: ${this.renderDelay} ------`, 'navy', '#B6ECFF');

    const attrName = 'data-rg-print';
    let elems = document.querySelectorAll(`[${attrName}]`);
    if (!!controllerProp) { elems = document.querySelectorAll(`[${attrName}^="${controllerProp}"]`); }
    this._debug('rgPrint', `found elements:: ${elems.length} | controllerProp:: ${controllerProp}`, 'navy');
    if (!elems.length) { return; }


    for (const elem of elems) {
      const attrVal = elem.getAttribute(attrName);
      const attrValSplited = attrVal.split(this.separator);

      // get val and apply pipe to the val
      const propPipe = attrValSplited[0].trim(); // controller property name with pipe:  company.name | slice(0,21)
      const propPipeSplitted = propPipe.split('|');
      const prop = propPipeSplitted[0].trim();
      let val = this._getControllerValue(prop);

      let pipe_funcDef = propPipeSplitted[1];
      if (!!pipe_funcDef && !!val) {
        pipe_funcDef = pipe_funcDef.trim();
        const {funcName, funcArgs} = this._funcParse(pipe_funcDef);
        val = val[funcName](...funcArgs);
      }

      // correct val
      const toKeep = !!attrValSplited[2] ? attrValSplited[2].trim() === 'keep' : false; // to keep the innerHTML as value when val is undefined
      if (val === undefined) { val = toKeep ? elem.innerHTML : ''; } // the default value is defined in the HTML tag
      else if (typeof val === 'object') { val = JSON.stringify(val); }
      else if (typeof val === 'number') { val = +val; }
      else if (typeof val === 'string') { val = val; }
      else if (typeof val === 'boolean') { val = val.toString(); }
      else { val = val; }

      // define action
      let act = attrValSplited[1] || 'inner';
      act = act.trim();

      // generate new element and place it in the sibling position
      let newElem;
      if (act !== 'inner') { newElem = this._generateNewElem(elem, attrName, attrVal); }


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
      } else  {
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
   * @param {string} controllerProp - controller property name
   * @returns {void}
   */
  rgIf(controllerProp) {
    this._debug('rgIf', '--------- rgIf (start) ------', 'navy', '#B6ECFF');

    const attrName = 'data-rg-if';
    let elems = document.querySelectorAll(`[${attrName}]`);
    if (!!controllerProp) { elems = document.querySelectorAll(`[${attrName}^="${controllerProp}"]`); }
    this._debug('rgIf', `found elements:: ${elems.length} | controllerProp:: ${controllerProp}`, 'navy');
    if (!elems.length) { return; }

    for (const elem of elems) {
      const attrVal = elem.getAttribute(attrName).trim(); // ifAge
      if (!attrVal) { console.error(`Attribute "data-rg-if" has bad definition (data-rg-if="${attrVal}").`); continue; }

      const propComp = attrVal.trim(); // controller property with comparison function, for example: ifAge $eq(22)
      const propCompSplitted = propComp.split(/\s+/);

      const prop = propCompSplitted[0].trim(); // ifAge
      const val = this._getControllerValue(prop);

      const funcDef = propCompSplitted[1] ? propCompSplitted[1].trim() : false; // $eq(22)
      let tf = false;
      if (!!funcDef) {
        // parse data-rg-if with the comparison operators: $not(), $eq(22), $ne(22), ...
        const { funcName, funcArgs } = this._funcParse(funcDef);
        tf = this._calcComparison(val, funcName, funcArgs);
      } else {
        // parse data-rg-if without the comparison operators
        tf = val;
      }

      // hide/show elem
      if (tf) {
        const dataRgPrint_attrVal = elem.getAttribute('data-rg-print');
        if (!!dataRgPrint_attrVal && /outer|sibling|prepend|append|inset/) { elem.style.display = 'none'; } // element with data-rg-print should stay hidden because of _generateNewElem()
        else { elem.style.display = ''; }
      } else {
        elem.style.display = 'none';
      }

      this._debug('rgIf', `rgIF:: data-rg-if="${attrVal}" & val=${val} => tf: ${tf} -- elem-before: ${elem.outerHTML}`, 'navy');
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
   * @param {string} controllerProp - controller property name
   * @returns {void}
   */
  rgSwitch(controllerProp) {
    this._debug('rgSwitch', '--------- rgSwitch (start) ------', 'navy', '#B6ECFF');

    const attrName = 'data-rg-switch';
    let elems = document.querySelectorAll(`[${attrName}]`);
    if (!!controllerProp) { elems = document.querySelectorAll(`[${attrName}^="${controllerProp}"]`); }
    this._debug('rgSwitch', `found elements:: ${elems.length} | controllerProp:: ${controllerProp}`, 'navy');
    if (!elems.length) { return; }

    for (const elem of elems) {
      const attrVal = elem.getAttribute(attrName) || ''; // 'controllerProperty @@ multiple'
      const attrValSplited = attrVal.split(this.separator);

      const isMultiple = !!attrValSplited[1] ? attrValSplited[1].trim() === 'multiple' : false;

      const prop = attrValSplited[0].trim();
      const val = this._getControllerValue(prop);

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
   * data-rg-value="<controllerProperty>"
   * Parse the "data-rg-value" attribute. Sets the "value" attribute with the controller property value.
   * Examples:
   * data-rg-value="product"
   * data-rg-value="employee.name"
   * @param {string} controllerProp - the attribute value which relates to the controller property
   * @returns {void}
   */
  rgValue (controllerProp) {
    this._debug('rgValue', '--------- rgValue ------', 'navy', '#B6ECFF');

    const attrName = 'data-rg-value';
    let elems = document.querySelectorAll(`[${attrName}]`);
    if (!!controllerProp) { elems = document.querySelectorAll(`[${attrName}^="${controllerProp}"]`); }
    this._debug('rgValue', `found elements:: ${elems.length} | controllerProp:: ${controllerProp}`, 'navy');
    if (!elems.length) { return; }

    for (const elem of elems) {
      const attrVal = elem.getAttribute(attrName);
      if (!attrVal) { console.error(`Attribute "data-rg-value" has bad definition (data-rg-value="${attrVal}").`); continue; }

      const prop = attrVal.trim();
      const val = this._getControllerValue(prop);
      elem.setAttribute('value', val);
      this._debug('rgValue', `${prop}:: ${val}`, 'navy');
    }
  }



  /**
   * data-rg-class="<controllerProperty> [@@ add|replace]"
   * Parse the "data-rg-class" attribute. Set element class attribute.
   * Examples:
   * data-rg-class="myKlass" - add new classes to existing classes
   * data-rg-class="myKlass @@ add" - add new classes to existing classes
   * data-rg-class="myKlass @@ replace" - replace existing classes with new classes
   * @param {string} controllerProp - controller property which defines "class" attribute
   * @returns {void}
   */
  rgClass(controllerProp) {
    this._debug('rgClass', '--------- rgClass ------', 'navy', '#B6ECFF');

    const attrName = 'data-rg-class';
    let elems = document.querySelectorAll(`[${attrName}]`);
    if (!!controllerProp) { elems = document.querySelectorAll(`[${attrName}^="${controllerProp}"]`); }
    this._debug('rgClass', `found elements:: ${elems.length} | controllerProp:: ${controllerProp}`, 'navy');
    if (!elems.length) { return; }

    for (const elem of elems) {
      const attrVal = elem.getAttribute(attrName) || ''; // 'controllerProperty'
      const attrValSplited = attrVal.split(this.separator);

      const prop = attrValSplited[0].trim(); // controller property name company.name
      const valArr = this._getControllerValue(prop) || []; // ['my-bold', 'my-italic']
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
   * @param {string} controllerProp - controller property which defines "style" attribute
   * @returns {void}
   */
  rgStyle(controllerProp) {
    this._debug('rgStyle', '--------- rgStyle ------', 'navy', '#B6ECFF');

    const attrName = 'data-rg-style';
    let elems = document.querySelectorAll(`[${attrName}]`);
    if (!!controllerProp) { elems = document.querySelectorAll(`[${attrName}^="${controllerProp}"]`); }
    this._debug('rgStyle', `found elements:: ${elems.length} | controllerProp:: ${controllerProp}`, 'navy');
    if (!elems.length) { return; }

    for (const elem of elems) {
      const attrVal = elem.getAttribute(attrName) || ''; // 'controllerProperty'
      const attrValSplited = attrVal.split(this.separator);

      const prop = attrValSplited[0].trim();
      const valObj = this._getControllerValue(prop); // {fontSize: '21px', color: 'red'}

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
   * @returns {void}
   */
  rgSrc(controllerProp) {
    this._debug('rgSrc', '--------- rgSrc ------', 'navy', '#B6ECFF');

    const attrName = 'data-rg-src';
    let elems = document.querySelectorAll(`[${attrName}]`);
    if (!!controllerProp) { elems = document.querySelectorAll(`[${attrName}^="${controllerProp}"]`); }
    this._debug('rgSrc', `found elements:: ${elems.length} | controllerProp:: ${controllerProp}`, 'navy');
    if (!elems.length) { return; }

    for (const elem of elems) {
      const attrVal = elem.getAttribute(attrName) || '';
      const attrValSplited = attrVal.split(this.separator);

      const prop = attrValSplited[0].trim();
      const val = this._getControllerValue(prop);

      // when val is undefined load defaultSrc
      let defaultSrc = attrValSplited[1] || '';
      defaultSrc = defaultSrc.trim();

      const src = val || defaultSrc;
      elem.src = src;

      this._debug('rgSrc', `data-rg-src="${attrVal}" --prop:: "${prop}" --src:: "${src}"`, 'navy');
    }
  }



  /**
   * data-rg-elem="<rgelemsProp>"     --> rgelemsProp is the property of the this.rgelems, for example data-rg-elem="myElement" => this.rgelems.myElement
   * Parse the "data-rg-elem" attribute. Transfer the DOM element to the controller property "this.rgelems".
   * Examples:
   * data-rg-elem="paragraf" -> fetch it with this.rgelems['paragraf']
   * @returns {void}
   */
  rgElem() {
    this._debug('rgElem', '--------- rgElem ------', 'navy', '#B6ECFF');

    const attrName = 'data-rg-elem';
    const elems = document.querySelectorAll(`[${attrName}]`);
    this._debug('rgElem', `found elements:: ${elems.length}`, 'navy');
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
   * @returns {void}
   */
  rgEcho(text) {
    this._debug('rgEcho', '--------- rgEcho ------', 'navy', '#B6ECFF');

    const attrName = 'data-rg-echo';
    let elems = document.querySelectorAll(`[${attrName}]`);
    if (!!text) { elems = document.querySelectorAll(`[${attrName}^="${text}"]`); }
    this._debug('rgEcho', `found elements:: ${elems.length}`, 'navy');
    if (!elems.length) { return; }

    // associate values
    for (const elem of elems) {
      let txt = elem.getAttribute('data-rg-echo');
      this._debug('rgEcho', `rgEcho txt before: ${txt}`, 'navy', '#B6ECFF');

      // checks html tags
      if (/<[^>]*>/.test(txt)) { console.log(`%c rgEchoWarn:: The text shouldn't contain HTML tags.`, `color:Maroon; background:LightYellow`); }

      txt = this._parseInterpolated(txt); // parse {{ctrlProp}}
      this._debug('rgEcho', `rgEcho txt after: ${txt}\n`, 'navy', '#B6ECFF');

      elem.textContent = txt;
    }
  }



}


module.exports = DataRg;
