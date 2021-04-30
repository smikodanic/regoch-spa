const DataRgListeners = require('./DataRgListeners');
const debug = require('./debug');



/**
 * Parse HTML elements with the "data-rg-" attribute (non-listeners)
 */
class DataRg extends DataRgListeners {

  constructor() {
    super();
    this.separator = '@@';
    this.temp = {}; // controller temporary variable (exists untill controller exists)
    this.rgelems = {}; // set by rgElem()
  }


  /************** GENERATORS (generate or remove HTML elements) *************/

  /**
   * data-rg-for="<controllerProp>[:<limit>][:<skip>] [@@ outer|inner]"
   * Parse the "data-rg-for" attribute. Multiply element.
   * Examples:
   * data-rg-for="companies"
   * data-rg-for="company.employers"
   * @param {string} controllerProp - controller property name
   * @returns {Promise<void>}
   */
  async rgFor(controllerProp) {
    debug('rgFor', '--------- rgFor ------', 'navy', '#B6ECFF');

    const attrName = 'data-rg-for';
    let elems = document.querySelectorAll(`[${attrName}]`);
    if (!!controllerProp) {
      elems = document.querySelectorAll(`[${attrName}^="${controllerProp}"]`);
      if (elems.length > 1) { console.log(`%c rgForWarn:: There are ${elems.length} elements with the attribute ${attrName}^="${controllerProp}". Should be only one.`, `color:Maroon; background:LightYellow`); }
    }
    debug('rgFor', `found elements:: ${elems.length} | controllerProp:: ${controllerProp}`, 'navy');

    for (const elem of elems) {
      const attrVal = elem.getAttribute(attrName); // company.employers
      const attrValSplited = attrVal.split(this.separator);

      const propLimSkp = attrValSplited[0].trim(); // company.employers:limit:skip
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
      if(debug().rgFor) { console.log('rgFor() -->', 'attrVal::', attrVal, ' | val::', val, ' limit::', limit, ' skip::', skip); }
      if (!val) { continue; }

      const max = skip + limit < val.length ? skip + limit : val.length;

      this._setTemp(attrName, attrVal, elem.innerHTML); // set this.temp

      let act = attrValSplited[1] || 'outer'; // outer|inner
      act = act.trim();

      if (act === 'outer') { // multiply the outerHTML of the data-rg-for element
        // hide the original (reference) element
        elem.style.display = 'none';
        elem.innerHTML = '';

        // remove generated data-rg-for elements, i.e. elements with the data-rg-for-gen attribute
        const genElems = document.querySelectorAll(`[data-rg-for-gen="${attrVal}"]`);
        for (const genElem of genElems) { genElem.remove(); }

        // multiply element by cloning and adding sibling elements
        for (let i = skip; i < max; i++) {
          const j = max - 1 - i + skip;
          const newElem = elem.cloneNode();
          newElem.innerHTML = this._getTemp(attrName, attrVal);
          newElem.style.display = '';
          newElem.removeAttribute('data-rg-for');
          newElem.setAttribute('data-rg-for-gen', attrVal);
          elem.parentNode.insertBefore(newElem, elem.nextSibling);
          newElem.outerHTML = this._parse$i(j, newElem.outerHTML); // replace .$i or $i+1 , $i-1, $i^1, ...
        }

      } else if (act === 'inner') { // multiply the innerHTML of the data-rg-for element
        elem.innerHTML = '';
        for (let i = skip; i < max; i++) {
          elem.innerHTML += this._parse$i(i, this._getTemp(attrName, attrVal)); // replace .$i or $i+1 , $i-1, $i^1, ...;
        }

      }

    }
  }



  /**
   * data-rg-repeat="<num>"
   * Parse the "data-rg-repeat" attribute. Repeat the element n times.
   * Examples:
   * data-rg-repeat="10"
   * @param {number} num - number of the repeats
   * @param {string} id - element's id, for example <p id="myID" data-rg-repeat="5">
   * @returns {Promise<void>}
   */
  async rgRepeat(num, id) {
    debug('rgRepeat', '--------- rgRepeat ------', 'navy', '#B6ECFF');

    const attrName = 'data-rg-repeat';
    let elems = document.querySelectorAll(`[${attrName}]`);
    if (!!id) { elems = document.querySelectorAll(`#${id}[${attrName}]`); }
    debug('rgRepeat', `found elements:: ${elems.length}`, 'navy');
    if (!elems.length) { return; }

    for (const elem of elems) {
      const attrVal = elem.getAttribute(attrName); // '10 @@ #comp'
      const max = +num || +attrVal.trim();

      this._setTemp(attrName, attrVal, elem.innerHTML); // set this.temp

      // hide the original (reference) element
      elem.style.display = 'none';
      elem.innerHTML = '';

      // remove generated data-rg-repeat elements, i.e. elements with the data-rg-repeat-gen attribute
      const genElems = document.querySelectorAll(`[data-rg-repeat-gen="${attrVal}"]`);
      for (const genElem of genElems) { genElem.remove(); }

      // multiply element by cloning and adding sibling elements
      for (let i = 0; i < max; i++) {
        const j = max - 1 - i;
        const newElem = elem.cloneNode();
        newElem.innerHTML = this._getTemp(attrName, attrVal);
        newElem.style.display = '';
        newElem.removeAttribute('id');
        newElem.removeAttribute('data-rg-repeat');
        newElem.setAttribute('data-rg-repeat-gen', attrVal);
        elem.parentNode.insertBefore(newElem, elem.nextSibling);
        newElem.outerHTML = this._parse$i(j, newElem.outerHTML); // replace .$i or $i+1 , $i-1, $i^1, ...
      }

      debug('rgRepeat', `max:: ${max}, id: ${id}`, 'navy');
    }
  }



  /**
   * data-rg-if="<controllerProperty> [@@ hide|remove]"
   * Parse the "data-rg-if" attribute. Show or hide the HTML element.
   * When @@ hide option is used the style="visibility:hidden;" or style="visibility:visible;" is added to the data-rg-if element.
   * When @@ remove option is used the data-rg-if element is completely commented. For example: <!--<span data-rg-if="ifAge @@ remove">Lorem ipsum</span>-->
   * Examples:
   * data-rg-if="ifAge" - hide the element
   * data-rg-if="ifAge @@ hide" - hide the element
   * data-rg-if="ifAge @@ remove" - remove the element
   * @param {string} controllerProp - controller property name
   * @returns {void}
   */
  rgIf(controllerProp) {
    debug('rgIf', '--------- rgIf ------', 'navy', '#B6ECFF');

    const attrName = 'data-rg-if';
    let elems = document.querySelectorAll(`[${attrName}]`);
    if (!!controllerProp) { elems = document.querySelectorAll(`[${attrName}^="${controllerProp}"]`); }
    debug('rgIf', `found elements:: ${elems.length} | controllerProp:: ${controllerProp}`, 'navy');
    if (!elems.length) { return; }

    for (const elem of elems) {
      const attrVal = elem.getAttribute(attrName).trim(); // ifAge @@ remove
      const attrValSplited = attrVal.split(this.separator);

      const propComp = attrValSplited[0].trim(); // controller property with comparison function, for example: ifAge $eq(22)
      const propCompSplitted = propComp.split(/\s+/);

      const prop = propCompSplitted[0].trim(); // ifAge
      const val = this._getControllerValue(prop);

      const funcDef = propCompSplitted[1] ? propCompSplitted[1].trim() : false; // $eq(22)
      let tf = false;
      if (!!funcDef) {
        // parse data-rg-if with the comparison operators: $not(), $eq(22), $ne(22), ...
        const { funcName, funcArgs, funcArgsStr } = this._funcParse(funcDef);
        tf = this._calcComparison(val, funcName, funcArgs);
        debug('rgIf', `  comparison:: data-rg-if="${prop}=${val} ${funcName}(${funcArgsStr})"  => tf: ${tf}`, 'navy');
      } else {
        // parse data-rg-if without the comparison operators
        tf = val;
      }


      // remove or hide element, remove is default
      let act = attrValSplited[1] || 'remove'; // 'remove'|'hide'
      act = act.trim();

      // hide/show elem
      if (tf) { act === 'remove' ? elem.style.display = '' : elem.style.visibility = ''; }
      else { act === 'remove' ?  elem.style.display = 'none' : elem.style.visibility = 'hidden'; }

      debug('rgIf', `${prop} = ${val} | ${elem.outerHTML}`, 'navy');
    }
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
    debug('rgSwitch', '--------- rgSwitch ------', 'navy', '#B6ECFF');

    const attrName = 'data-rg-switch';
    let elems = document.querySelectorAll(`[${attrName}]`);
    if (!!controllerProp) { elems = document.querySelectorAll(`[${attrName}^="${controllerProp}"]`); }
    debug('rgSwitch', `found elements:: ${elems.length} | controllerProp:: ${controllerProp}`, 'navy');
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

        debug('rgSwitch', `data-rg-switch="${attrVal}" data-rg-switchcase="${switchcaseAttrVal}" --val:: "${val}" --isMatched: ${isMatched}`, 'navy');
      }

      // set data-rg-switchdefault
      if (!!switchdefaultElem) { !isMatched ? switchdefaultElem.style.display = '' : switchdefaultElem.style.display = 'none'; }

      debug('rgSwitch', `data-rg-switch="${attrVal}" data-rg-switchdefault --isMatched: ${isMatched}`, 'navy');
    }
  }




  /************ NON-GENERATORS (affect to one element, will not generate new HTML elements) ***********/

  /**
   * data-rg-elem="<rgelemsProp>"     --> rgelemsProp is the property of the this.rgelems, for example data-rg-elem="myElement" => this.rgelems.myElement
   * Parse the "data-rg-elem" attribute. Transfer the DOM element to the controller property "this.rgelems".
   * Examples:
   * data-rg-elem="paragraf" -> fetch it with this.rgelems['paragraf']
   * @returns {void}
   */
  rgElem() {
    debug('rgElem', '--------- rgElem ------', 'navy', '#B6ECFF');

    const attrName = 'data-rg-elem';
    const elems = document.querySelectorAll(`[${attrName}]`);
    debug('rgElem', `found elements:: ${elems.length}`, 'navy');
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
    debug('rgEcho', '--------- rgEcho ------', 'navy', '#B6ECFF');

    const attrName = 'data-rg-echo';
    let elems = document.querySelectorAll(`[${attrName}]`);
    if (!!text) { elems = document.querySelectorAll(`[${attrName}^="${text}"]`); }
    debug('rgEcho', `found elements:: ${elems.length}`, 'navy');
    if (!elems.length) { return; }

    // associate values
    for (const elem of elems) {
      const txt = elem.getAttribute('data-rg-echo');
      if (!/\$i/.test(txt)) { elem.textContent = txt; } // if doesn't contain $i iteration variable
    }

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
    debug('rgPrint', '--------- rgPrint ------', 'navy', '#B6ECFF');

    const attrName = 'data-rg-print';
    let elems = document.querySelectorAll(`[${attrName}]`);
    if (!!controllerProp) { elems = document.querySelectorAll(`[${attrName}^="${controllerProp}"]`); }
    debug('rgPrint', `found elements:: ${elems.length} | controllerProp:: ${controllerProp}`, 'navy');
    if (!elems.length) { return; }

    for (const elem of elems) {
      const attrVal = elem.getAttribute(attrName);
      const attrValSplited = attrVal.split(this.separator);
      if (!attrValSplited.length) { console.error(`Attribute "data-rg-print" has bad definition (data-rg-print="${attrVal}").`); continue; }


      this._setTemp(attrName, attrVal, elem.innerHTML); // set this.temp

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
      else if (typeof val === 'string') { val = val || ''; }
      else if (typeof val === 'boolean') { val = val.toString(); }
      else { val = val; }

      // define action
      let act = attrValSplited[1] || 'inner';
      act = act.trim();

      // load content in the element
      if (act === 'inner') {
        elem.innerHTML = val;
      } else if (act === 'outer') {
        elem.outerHTML = val;
      } else if (act === 'sibling') {
        const textNode = document.createTextNode(val);
        elem.nextSibling.remove();
        elem.parentNode.insertBefore(textNode, elem.nextSibling);
      } else if (act === 'prepend') {
        elem.innerHTML = val + ' ' + this._getTemp(attrName, attrVal);
      } else if (act === 'append') {
        elem.innerHTML = this._getTemp(attrName, attrVal) + ' ' + val;
      } else {
        elem.innerHTML = val;
      }

      debug('rgPrint', `${propPipe}:: ${val} | act::"${act}" | toKeep::"${toKeep}`, 'navy');
    }
  }


  /**
   * data-rg-value="<controllerProperty>"
   * Parse the "data-rg-value" attribute. Sets the "value" attribute with the controller property value.
   * Examples:
   * data-rg-value="product"
   * data-rg-value="$scope.employee.name"
   * @param {string} controllerProp - the attribute value which relates to the controller property
   * @returns {void}
   */
  rgValue (controllerProp) {
    debug('rgValue', '--------- rgValue ------', 'navy', '#B6ECFF');

    const attrName = 'data-rg-value';
    let elems = document.querySelectorAll(`[${attrName}]`);
    if (!!controllerProp) { elems = document.querySelectorAll(`[${attrName}^="${controllerProp}"]`); }
    debug('rgValue', `found elements:: ${elems.length} | controllerProp:: ${controllerProp}`, 'navy');
    if (!elems.length) { return; }

    for (const elem of elems) {
      const attrVal = elem.getAttribute(attrName);
      if (!attrVal) { console.error(`Attribute "data-rg-value" has bad definition (data-rg-value="${attrVal}").`); continue; }

      const prop = attrVal.trim();
      const val = this._getControllerValue(prop);
      elem.setAttribute('value', val);
      debug('rgValue', `${prop}:: ${val}`, 'navy');
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
    debug('rgClass', '--------- rgClass ------', 'navy', '#B6ECFF');

    const attrName = 'data-rg-class';
    let elems = document.querySelectorAll(`[${attrName}]`);
    if (!!controllerProp) { elems = document.querySelectorAll(`[${attrName}^="${controllerProp}"]`); }
    debug('rgClass', `found elements:: ${elems.length} | controllerProp:: ${controllerProp}`, 'navy');
    if (!elems.length) { return; }

    for (const elem of elems) {
      const attrVal = elem.getAttribute(attrName) || ''; // 'controllerProperty'
      const attrValSplited = attrVal.split(this.separator);

      const prop = attrValSplited[0].trim(); // controller property name company.name
      const valArr = this._getControllerValue(prop) || []; // ['my-bold', 'my-italic']

      let act = attrValSplited[1] || '';
      act = act.trim() || 'add';

      if (act == 'replace' && !!valArr.length) { elem.removeAttribute('class'); }
      for (const val of valArr) { elem.classList.add(val); }

      debug('rgClass', `data-rg-class="${attrVal}" --- ctrlProp:: ${prop} | ctrlVal:: ${valArr} | act:: ${act}`, 'navy');
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
    debug('rgStyle', '--------- rgStyle ------', 'navy', '#B6ECFF');

    const attrName = 'data-rg-style';
    let elems = document.querySelectorAll(`[${attrName}]`);
    if (!!controllerProp) { elems = document.querySelectorAll(`[${attrName}^="${controllerProp}"]`); }
    debug('rgStyle', `found elements:: ${elems.length} | controllerProp:: ${controllerProp}`, 'navy');
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

      debug('rgStyle', `data-rg-style="${attrVal}" --- prop:: "${prop}" | styleProps:: "${styleProps}" | act:: "${act}"`, 'navy');
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
    debug('rgSrc', '--------- rgSrc ------', 'navy', '#B6ECFF');

    const attrName = 'data-rg-src';
    let elems = document.querySelectorAll(`[${attrName}]`);
    if (!!controllerProp) { elems = document.querySelectorAll(`[${attrName}^="${controllerProp}"]`); }
    debug('rgSrc', `found elements:: ${elems.length} | controllerProp:: ${controllerProp}`, 'navy');
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

      debug('rgSrc', `data-rg-src="${attrVal}" --prop:: "${prop}" --src:: "${src}"`, 'navy');
    }

  }



  /**
   * <script src="..." data-rg-lazyjs>
   * Parse the "data-rg-lazyjs" attribute. Reload all SCRIPT elements with data-rg-lazyjs attribute.
   * Remove all SCRIPT tags with the data-rg-lazyjs attributes and immediatelly after reload them.
   * @param {number} waitMS - wait for miliseconds before loading process
   * @returns {Promise<void>}
   */
  async rgLazyjs(waitMS = 0) {
    debug('rgLazyjs', '--------- rgLazyjs ------', 'navy', '#B6ECFF');

    const attrName = 'data-rg-lazyjs';
    const elems = document.querySelectorAll(`[${attrName}]`);
    debug('rgLazyjs', `found elements:: ${elems.length}`, 'navy');
    if (!elems.length) { return; }

    const urls = []; // url in the src attribute
    for (const elem of elems) {
      const url = elem.getAttribute('src');
      debug('rgLazyjs', `  src="${url}"`, 'navy');
      urls.push(url);
    }

    this.unlazyAllJS();
    await this.lazyJS(urls, waitMS);
  }





  /************ EXPERIMENTAL **********/
  /**
   * ${controllerProp}
   * Parse and interpolate the ${controllerProperty} in the HTML text.
   * Example: <p data-rg-if="tf">The selected value is <b>${company.name}</b>.</p>
   * ISSUE: When applied breaks dataRgListeners because document.body.innerHTML is modified.
   * @param {string} controllerProp - controller property which will be interpolated
   * @returns {void}
   */
  rgInterpolate(controllerProp) {
    debug('rgInterpolate', '--------- rgInterpolate ------', 'navy', '#B6ECFF');

    // put the whole body in the temp var
    if (!this.temp.body) { this.temp.body = document.body.innerHTML; }

    // find insets i.e. ${ctrlProp} string
    let reg = new RegExp('\\$\\{\\s*[a-zA-Z0-9_\.]+\\s*\\}', 'g');
    if (controllerProp) { reg = new RegExp(`\\$\\{\\s*${controllerProp}\\s*\\}`, 'g'); } // reduce the number of inset elements and speed up the interpoaltion
    const insets = this.temp.body.match(reg); // ['${bankOwner}, '${   bank.employess.1.name }']
    if (!insets) { return; }

    // replace ${ctrProp} with the value
    document.body.innerHTML = this.temp.body;
    for (const inset of insets) {
      const prop = inset.replace('${', '').replace('}', '').trim();
      let val = this._getControllerValue(prop);
      if (!val) { val = ''; console.log(`%c  DatRgWarn:: rgInterpolate: Controller property ${inset} is undefined.`, `color:Maroon; background:LightYellow`); }
      document.body.innerHTML = document.body.innerHTML.replace(inset, val);

      debug('rgInterpolate', `${inset} -> ${val}`, 'navy');
    }

  }






  /************ PRIVATES **********/
  /**
   * Get the controller property's value.
   * For example controller's property is this.company.name
   * @param {string} prop - controller property name, for example: company.name
   * @returns {any}
   */
  _getControllerValue(prop) {
    const propSplitted = prop.split('.'); // ['company', 'name']
    const prop1 = propSplitted[0]; // company
    let val = this[prop1]; // controller property value
    let i = 0;
    for (const prop of propSplitted) {
      if (i !== 0 && !!val) { val = val[prop]; }
      i++;
    }
    return val;
  }


  /**
   * Parse iteration variable $i in the text.
   * - replace .$i with the number i
   * - replace $i, $i+1 , $i-1, $i^1, ...
   * @param {number} i - number to replace $i with
   * @param {string} txt - text which needs to be replaced
   * @returns {string}
   */
  _parse$i(i, txt) {
    const txt2 = txt.replace(/\.\$i/g, `.${i}`)
      .replace(/\$i\s*(\+|\-|\*|\/|\%|\^)?\s*(\d+)?/g, (match, $1, $2) => {
        let result = i;
        const n = parseInt($2, 10);
        if ($1 === '+') { result = i + n; }
        else if ($1 === '-') { result = i - n; }
        else if ($1 === '*') { result = i * n; }
        else if ($1 === '/') { result = i / n; }
        else if ($1 === '%') { result = i % n; }
        else if ($1 === '^') { result = Math.pow(i, n); }
        return result;
      });
    return txt2;
  }


  /**
   * Wrap element in the comment.
   * @param {Element} elem - HTML element DOM object
   * @returns {void}
   */
  _commentElement(elem) {
    const comment = document.createComment(elem.outerHTML); // define comment
    elem.parentNode.insertBefore(comment, elem); // insert comment above elem
    elem.remove();
  }


  /**
   * Show data-rg-if elements by removing comment around data-rg-if elements. For example: <!--<span data-rg-if="ifX @@ remove">company name 1</span>-->
   * When @@ remove option is used the data-rg-if element is commented to remove it from the HTML page.
   * @param {string} parentCSSsel - CSS selector of the parent data-rg-if element
   * @returns {void}
   */
  _rgIf_uncommentAll(parentCSSsel) {
    const ifParentElems = document.querySelectorAll(parentCSSsel);
    const parser = new DOMParser();
    for (const ifParentElem of ifParentElems) {
      // console.log('ifParentElem.childNodes::', ifParentElem.childNodes);
      for (const child of ifParentElem.childNodes) {
        const elemStr = child.nodeValue; // <p data-rg-if="ifX @@ remove">company name</p>
        if (child.nodeType === 8 && /data-rg-if/.test(elemStr)) { // 8 is comment https://developer.mozilla.org/en-US/docs/Web/API/Node/nodeType
          const doc = parser.parseFromString(elemStr, 'text/html');
          const elem = doc.querySelector('[data-rg-if');
          // console.log(ifParentElem, child, elem);
          if (!!elem) {
            ifParentElem.insertBefore(elem, child);
            child.remove();
          }
        }
      }
    }
  }


  /**
   * Caclulate comparison operators.
   * @param {any} val - the controller property value
   * @param {string} funcName - the function name: $not, $eq, ...
   * @param {any[]} funcArgs - function arguments (see _funcParse())
   * @returns {boolean}
   */
  _calcComparison(val, funcName, funcArgs) {
    let tf = false;
    const arg = funcArgs[0] ? this._typeConvertor(funcArgs[0]) : '';

    if (funcName === '$not') { tf = !val; }
    else if (funcName === '$eq' && arg) { tf = val === arg; }
    else if (funcName === '$gt' && arg) { tf = val > arg; }
    else if (funcName === '$gte' && arg) { tf = val >= arg; }
    else if (funcName === '$lt' && arg) { tf = val < arg; }
    else if (funcName === '$lte' && arg) { tf = val <= arg; }
    else if (funcName === '$ne' && arg) { tf = val !== arg; }
    else if (funcName === '$in' && arg) { tf = arg.indexOf(val) !== -1; } // arg must be array
    else if (funcName === '$nin' && arg) { tf = arg.indexOf(val) === -1; } // arg must be array

    // console.log(`funcName:: ${funcName} -- val:.${val} -- arg:.${arg} -- tf:.${tf} --`);

    return tf;
  }


  /**
   * Convert string into integer, float or boolean.
   * @param {string} value
   * @returns {string | number | boolean | object}
   */
  _typeConvertor(value) {
    function isJSON(str) {
      try { JSON.parse(str); }
      catch(err) { return false; }
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
   * Set the temporary variable this.tmp.
   * @param {string} attrName - attribute name, for example: 'data-rg-for'
   * @param {string} attrVal - attribute value, for example: 'myFunc()'
   * @param {any} tempVal - value set in the temporary variable
   */
  _setTemp(attrName, attrVal, tempVal) {
    const tempVarName = `${attrName} ${attrVal}`.replace(/\s/g, '_');
    if (!this.temp[tempVarName]) {
      this.temp[tempVarName] = tempVal;
    }
  }

  /**
   * Set the temporary variable this.tmp.
   * @param {string} attrName - attribute name, for example: 'data-rg-for'
   * @param {string} attrVal - attribute value, for example: 'myFunc()'
   */
  _getTemp(attrName, attrVal) {
    const tempVarName = `${attrName} ${attrVal}`.replace(/\s/g, '_');
    return this.temp[tempVarName];
  }


}


module.exports = DataRg;
