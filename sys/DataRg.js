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
    this.rgelems = {};
  }


  /**
   * data-rg-print="<controllerProperty> [@@ inner|outer|sibling|prepend|append]"
   * data-rg-print="company.name @@ inner"
   * Parse the "data-rg-print" attribute. Print the controller's property to view.
   * Examples:
   * data-rg-print="product" - product is the controller property
   * data-rg-print="product.name @@ outer"
   * data-rg-print="product.name @@ sibling"
   * @param {string} attrvalueProp - part of the attribute value which relates to the controller property,
   * for example product.name in the data-rg-print="product.name @@ inner". This speed up parsing because it's limited only to one element.
   * @returns {void}
   */
  rgPrint(attrvalueProp) {
    debug('rgPrint', '--------- rgPrint ------', 'navy', '#B6ECFF');

    // define attribute
    let attrDef;
    const attrName = 'data-rg-print';
    if (!attrvalueProp) {
      attrDef = attrName;
    } else {
      attrDef = `${attrName}^="${attrvalueProp}"`;
    }

    const elems = document.querySelectorAll(`[${attrDef}]`);
    debug('rgPrint', `found elements:: ${elems.length}`, 'navy');
    if (!elems.length) { return; }

    for (const elem of elems) {
      const attrVal = elem.getAttribute(attrName);
      const attrValSplited = attrVal.split(this.separator);

      const prop = attrValSplited[0].trim(); // controller property name company.name
      let val = this._getControllerValue(prop);

      // correct val
      val = !!val ? val : '';
      if (typeof val === 'object') { val = JSON.stringify(val); }

      // save temporary initial innerHTML
      const tempVarName = `${attrName} ${attrVal}`.replace(/\s/g, '_');
      if (!this.temp[tempVarName]) { this.temp[tempVarName] = elem.innerHTML; }


      // load content in the element
      let act = attrValSplited[1] || 'inner';
      act = act.trim();
      if (act === 'inner') {
        elem.innerHTML = val;
      } else if (act === 'outer') {
        elem.outerHTML = val;
      } else if (act === 'sibling') {
        const textNode = document.createTextNode(val);
        elem.nextSibling.remove();
        elem.parentNode.insertBefore(textNode, elem.nextSibling);
      } else if (act === 'prepend') {
        elem.innerHTML = val + ' ' + this.temp[tempVarName];
      } else if (act === 'append') {
        elem.innerHTML = this.temp[tempVarName] + ' ' + val;
      } else if (act === 'inset') {
        elem.innerHTML = this.temp[tempVarName].replace('${}', val);
      } else {
        elem.innerHTML = val;
      }

      debug('rgPrint', `${prop}:: ${val} | act::"${act}"`, 'navy');
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
    debug('rgClass', `found elements:: ${elems.length}`, 'navy');
    if (!elems.length) { return; }

    for (const elem of elems) {
      const attrVal = elem.getAttribute(attrName) || ''; // 'controllerProperty'
      const attrValSplited = attrVal.split(this.separator);

      const ctrlProp = attrValSplited[0].trim();
      const valArr = this[ctrlProp] || []; // ['my-bold', 'my-italic']

      let act = attrValSplited[1] || '';
      act = act.trim() || 'add';

      if (act == 'replace') { elem.removeAttribute('class'); }
      for (const val of valArr) { elem.classList.add(val); }

      debug('rgClass', `data-rg-class="${attrVal}" --- ctrlProp:: ${ctrlProp} | ctrlVal:: ${valArr} | act:: ${act}`, 'navy');
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
    debug('rgStyle', `found elements:: ${elems.length}`, 'navy');
    if (!elems.length) { return; }

    for (const elem of elems) {
      const attrVal = elem.getAttribute(attrName) || ''; // 'controllerProperty'
      const attrValSplited = attrVal.split(this.separator);

      const ctrlProp = attrValSplited[0].trim();
      const valObj = this[ctrlProp] || {}; // {fontSize: '21px', color: 'red'}

      let act = attrValSplited[1] || '';
      act = act.trim() || 'add';

      if (act == 'replace') { elem.removeAttribute('style'); }

      const styleProps = Object.keys(valObj);
      for (const styleProp of styleProps) { elem.style[styleProp] = valObj[styleProp]; }

      debug('rgStyle', `data-rg-style="${attrVal}" --- ctrlProp:: "${ctrlProp}" | styleProps:: "${styleProps}" | act:: "${act}"`, 'navy');
    }

  }



  /**
   * data-rg-if="<controllerProperty> [@@ hide|remove]"
   * Parse the "data-rg-if" attribute. Show or hide the HTML element.
   * Examples:
   * data-rg-if="ifAge" - hide the element
   * data-rg-if="ifAge @@ hide" - hide the element
   * data-rg-if="ifAge @@ remove" - remove the element
   * @param {string} attrvalue - attribute value (limit parsing to only one HTML element)
   * @returns {void}
   */
  rgIf(attrvalue) {
    debug('rgIf', '--------- rgIf ------', 'navy', '#B6ECFF');

    // define attribute
    let attrDef;
    const attrName = 'data-rg-if';
    if (!attrvalue) {
      attrDef = attrName;
    } else {
      attrDef = `${attrName}^="${attrvalue}"`;
    }

    this._uncommentAll();


    const elems = document.querySelectorAll(`[${attrDef}]`);
    debug('rgIf', `found elements:: ${elems.length}`, 'navy');
    if (!elems.length) { return; }

    for (const elem of elems) {
      const attrVal = elem.getAttribute(attrName); // ifAge @@ remove
      const attrValSplited = attrVal.split(this.separator);

      const prop = attrValSplited[0].trim(); // controller property name company.name
      const propSplitted = prop.split('.'); // ['company', 'name']
      const prop1 = propSplitted[0]; // company
      let val = this[prop1]; // controller property value
      let i = 0;
      for (const prop of propSplitted) {
        if (i !== 0 && !!val) { val = val[prop]; }
        i++;
      }

      // show or hide element
      let act = attrValSplited[1] || 'hide'; // hide | remove
      act = act.trim();

      // set data-rg-ifparent
      const parent = elem.parentNode;
      if (act == 'remove') {
        parent.setAttribute('data-rg-ifparent', '');
      }


      if (act === 'hide') {
        !!val ? elem.style.visibility = 'visible' : elem.style.visibility = 'hidden'; // elem exists but not visible
      } else if (act === 'remove') {
        !!val ? '' : this._commentElement(elem);
      }

      debug('rgIf', `${prop} = ${val} | act::"${act}"`, 'navy');
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
    if (!!controllerProp) { elems = document.querySelectorAll(`[${attrName}="${controllerProp}"]`); }
    debug('rgSwitch', `found elements:: ${elems.length}`, 'navy');
    if (!elems.length) { return; }

    for (const elem of elems) {
      const attrVal = elem.getAttribute(attrName) || ''; // 'controllerProperty @@ multiple'
      const attrValSplited = attrVal.split(this.separator);

      const isMultiple = !!attrValSplited[1] ? attrValSplited[1].trim() === 'multiple' : false;

      const ctrlProp = attrValSplited[0].trim();
      const val = this[ctrlProp] || ''; // string, number, boolean

      // get data-rg-switchcase and data-rg-switchdefault attribute values
      let switchcaseElems = elem.querySelectorAll('[data-rg-switch] > [data-rg-switchcase]');
      let switchdefaultElem = elem.querySelector('[data-rg-switch] > [data-rg-switchdefault]');

      // temporary save
      const tempVarName = `${attrName} ${attrVal}`.replace(/\s/g, '_');
      if (!this.temp[tempVarName]) {
        this.temp[tempVarName] = {switchcaseElems, switchdefaultElem};
      } else {
        switchcaseElems = this.temp[tempVarName].switchcaseElems;
        switchdefaultElem = this.temp[tempVarName].switchdefaultElem;
      }

      // empty the element with data-rg-switch attribute
      elem.innerHTML = '';

      // set or delete data-rg-switchcase element
      let isMatched = false; // is data-rg-switchcase value matched
      for (const switchcaseElem of switchcaseElems) {
        let switchcaseAttrVal = switchcaseElem.getAttribute('data-rg-switchcase');
        switchcaseAttrVal = switchcaseAttrVal.trim();
        if (!isMultiple && switchcaseAttrVal === val) { elem.innerHTML = switchcaseElem.outerHTML; isMatched = true; }
        else if (isMultiple && val.indexOf(switchcaseAttrVal) !== -1) { elem.append(switchcaseElem); isMatched = true; }
        else { switchcaseElem.remove(); }
        debug('rgSwitch', `data-rg-switch="${attrVal}" data-rg-switchcase="${switchcaseAttrVal}" --- val:: "${val}"`, 'navy');
      }

      if (!isMatched && !!switchdefaultElem) { elem.innerHTML = switchdefaultElem.outerHTML; }

    }

  }



  /**
   * data-rg-for="<propArr>[:limit:skip] [@@ outer|inner]"
   * Parse the "data-rg-for" attribute. Multiply element.
   * Examples:
   * data-rg-for="companies"
   * data-rg-for="company.employers"
   * @param {string} attrvalue - attribute value (limit parsing to only one HTML element)
   * @returns {void}
   */
  rgFor(attrvalue) {
    debug('rgFor', '--------- rgFor ------', 'navy', '#B6ECFF');

    // define attribute
    let attrDef;
    const attrName = 'data-rg-for';
    if (!attrvalue) {
      attrDef = attrName;
    } else {
      attrDef = `${attrName}^="${attrvalue}"`;
    }

    const elems = document.querySelectorAll(`[${attrDef}]`);
    debug('rgFor', `found elements:: ${elems.length}`, 'navy');
    if (!elems.length) { return; }

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
      if(debug().rgFor) { console.log('val::', val, ' limit::', limit, ' skip::', skip); }
      if (!val) { return; }

      const max = skip + limit < val.length ? skip + limit : val.length;


      // save temporary initial innerHTML and outerHTML
      const tempVarName = `${attrName} ${attrVal}`.replace(/\s/g, '_');
      if (!this.temp[tempVarName]) {
        this.temp[tempVarName] = elem.innerHTML;
      }


      let act = attrValSplited[1] || 'outer'; // outer|inner
      act = act.trim();

      if (act === 'outer') {
        // hide the original (reference) element
        elem.style.visibility = 'hidden';
        elem.innerHTML = '';

        // remove generated data-rg-for elements, i.e. elements with the data-rg-for-gen attribute
        const genElems = document.querySelectorAll(`[data-rg-for-gen="${attrVal}"]`);
        for (const genElem of genElems) { genElem.remove(); }

        // multiply element by cloning and adding sibling elements
        for (let i = skip; i < max; i++) {
          const j = max - 1 - i + skip;
          const innerHTML = this._parse$i(j, this.temp[tempVarName]); // replace .$i or $i+1 , $i-1, $i^1, ...
          const newElem = elem.cloneNode();
          newElem.innerHTML = innerHTML;
          newElem.style.visibility = '';
          newElem.removeAttribute('data-rg-for');
          newElem.setAttribute('data-rg-for-gen', attrVal);
          elem.parentNode.insertBefore(newElem, elem.nextSibling);
        }

      } else if (act === 'inner') {

        // multiply the innerHTML in the data-rg-for-gen element
        elem.innerHTML = '';
        for (let i = skip; i < max; i++) {
          elem.innerHTML += this._parse$i(i, this.temp[tempVarName]); // replace .$i or $i+1 , $i-1, $i^1, ...;
        }

      }

      debug('rgFor', `act:: ${act}`, 'navy');

    }

  }



  /**
   * data-rg-repeat="<num>"
   * Parse the "data-rg-repeat" attribute. Repeat the element n times.
   * Examples:
   * data-rg-repeat="10"
   * @param {number} num - number of the repeats
   * @param {string} id - element's id, for example <p id="myID" data-rg-repeat="5">
   * @returns {void}
   */
  rgRepeat(num, id) {
    debug('rgRepeat', '--------- rgRepeat ------', 'navy', '#B6ECFF');

    const attrName = 'data-rg-repeat';
    let elems = document.querySelectorAll(`[${attrName}]`);
    if (!!id) { elems = document.querySelectorAll(`#${id}[${attrName}]`); }
    debug('rgRepeat', `found elements:: ${elems.length}`, 'navy');
    if (!elems.length) { return; }

    for (const elem of elems) {
      const attrVal = elem.getAttribute(attrName); // '10 @@ #comp'
      const max = +num || +attrVal.trim();

      // save temporary initial innerHTML and outerHTML
      const tempVarName = `${attrName} ${attrVal}`.replace(/\s/g, '_');
      if (!this.temp[tempVarName]) {
        this.temp[tempVarName] = elem.innerHTML;
      }

      // hide the original (reference) element
      elem.style.visibility = 'hidden';
      elem.innerHTML = '';

      // remove generated data-rg-for elements, i.e. elements with the data-rg-for-gen attribute
      const genElems = document.querySelectorAll(`[data-rg-repeat-gen="${attrVal}"]`);
      for (const genElem of genElems) { genElem.remove(); }

      // multiply element by cloning and adding sibling elements
      for (let i = 0; i < max; i++) {
        const j = max - 1 - i;
        const innerHTML = this._parse$i(j, this.temp[tempVarName]); // replace .$i or $i+1 , $i-1, $i^1, ...
        const newElem = elem.cloneNode();
        newElem.innerHTML = innerHTML;
        newElem.style.visibility = '';
        newElem.removeAttribute('id');
        newElem.removeAttribute('data-rg-repeat');
        newElem.setAttribute('data-rg-repeat-gen', attrVal);
        elem.parentNode.insertBefore(newElem, elem.nextSibling);
      }

      debug('rgRepeat', `max:: ${max}, id: ${id}`, 'navy');

    }
  }



  /**
   * data-rg-elem="<rgelemsProp>"
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
   * Create and clean function arguments
   * @param {string[]} args - array of function arguments: [x,y,...restArgs]
   * @param {HTMLElement} elem - HTML element on which is the event applied
   * @param {Event} event - applied event
   * @returns {string[]}
   */
  _getFuncArgs(args, elem, event) {
    const funcArgs = args
      .split(',')
      .map(arg => {
        arg = arg.trim().replace(/\'|\"/g, '');
        if (arg === '$element') { arg = elem; }
        if (arg === '$event') { arg = event; }
        return arg;
      });
    return funcArgs;
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
   * Remove the comment from the element.
   * @returns {void}
   */
  _uncommentAll() {
    const ifParentElems = document.querySelectorAll(`[data-rg-ifparent]`);
    const parser = new DOMParser();
    for (const ifParentElem of ifParentElems) {
      console.log('ifParentElem.childNodes::', ifParentElem.childNodes);
      for (const child of ifParentElem.childNodes) {
        const elemStr = child.nodeValue; // <p data-rg-if="ifX @@ remove">company name</p>
        if (child.nodeType === 8 && /data-rg-if/.test(elemStr)) { // 8 is comment https://developer.mozilla.org/en-US/docs/Web/API/Node/nodeType
          const doc = parser.parseFromString(elemStr, 'text/html');
          const elem = doc.querySelector('[data-rg-if');
          console.log(ifParentElem, child, elem);
          if (!!elem) {
            ifParentElem.insertBefore(elem, child);
            child.remove();
          }
        }
      }
    }
  }


}


module.exports = DataRg;
