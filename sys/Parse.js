const eventEmitter = require('./eventEmitter');
const debug = require('./debug');



/**
 * Parse HTML elements with the "data-rg-" attribute
 */
class Parse {

  constructor() {
    this.dataRgs = []; // [{attrName, elem, handler}] -- attribute name, element with the data-rg-... attribute and its corresponding handler
    this.separator = '@@';
    this.temp = {}; // controller temporary variable (exists untill controller exists)
  }



  /**
   * Remove all listeners (click, input, ...) from the elements with the "data-rg-..." attribute
   */
  async rgKILL() {
    debug('rgKILL', '------- rgKILL -------', 'navy', '#B6ECFF');

    const promises = [];
    let i = 1;
    for (const dataRg of this.dataRgs) {
      dataRg.elem.removeEventListener('click', dataRg.handler);
      dataRg.elem.removeEventListener('input', dataRg.handler);
      debug('rgKILL', `${i}. killed:: ${dataRg.attrName} --- ${dataRg.elem.innerHTML}`, 'navy');
      promises.push(Promise.resolve(true));
      i++;
    }

    await Promise.all(promises);
    this.dataRgs = [];
  }



  /**
   * data-rg-href
   * <a href="/product/12" data-rg-href>Product 12</a>
   * Href listeners and changing URLs (browser history states).
   * NOTICE: Click on data-rg-href element will destroy the controller.
   * @returns {void}
   */
  rgHref() {
    debug('rgHref', '--------- rgHref ------', 'navy', '#B6ECFF');
    const attrName = 'data-rg-href';
    const elems = document.querySelectorAll(`[${attrName}]`);
    if (!elems.length) { return; }

    for (const elem of elems) {

      const handler = async event => {
        event.preventDefault();

        // destroy the current controller and kill the event listeners
        await this.destroy(elem, event);
        this.rgKILL();

        // push state and change browser's address bar
        const href = elem.getAttribute('href').trim();
        const state = { href };
        const title = elem.getAttribute(attrName).trim();
        const url = href; // new URL in the browser's address bar
        window.history.pushState(state, title, url);

        // fire event and test routes
        eventEmitter.emit('pushstate', state);
      };

      elem.addEventListener('click', handler);
      this.dataRgs.push({attrName, elem, handler});
      debug('rgHref', `pushed:: ${this.dataRgs.length} -- ${attrName} -- ${elem.localName}`, 'navy');

    }
  }



  /**
   * data-rg-click="<function>"
   * data-rg-click="myFunc()"
   * Listen for click and execute the function i.e. controller method.
   * @returns {void}
   */
  rgClick() {
    debug('rgClick', '--------- rgClick ------', '#D27523', '#FFD8B6');
    const attrName = 'data-rg-click';
    const elems = document.querySelectorAll(`[${attrName}]`);
    if (!elems.length) { return; }

    for (const elem of elems) {
      const funcDef = elem.getAttribute(attrName).trim(); // string 'myFunc(x, y, ...restArgs)'
      const matched = funcDef.match(/^(.+)\((.*)\)$/);
      const funcName = matched[1]; // function name: myFunc
      const funcArgs = matched[2].split(',').map(p => p.trim()); // array of function arguments: [x,y,...restArgs]

      const handler = event => {
        event.preventDefault();
        try {
          if (!this[funcName]) { throw new Error(`Method "${funcName}" is not defined in the "${this.constructor.name}" controller.`); }
          this[funcName](...funcArgs);
        } catch (err) {
          throw new Error(err.message);
        }
      };

      elem.addEventListener('click', handler);
      this.dataRgs.push({attrName, elem, handler});
      debug('rgClick', `pushed:: ${this.dataRgs.length} -- ${attrName} -- ${funcName}`, '#D27523');
    }

  }



  /**
   * data-rg-print="<controller_property> [@@ inner|outer|sibling|prepend|append]"
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
   * data-rg-set="<controller_property> [@@ print]"
   * Parse the "data-rg-set" attribute. Sets the controller property in INPUT element.
   * Examples:
   * data-rg-set="product" - product is the controller property
   * data-rg-set="product.name"
   * data-rg-set="product.name @@ print" -> bind to view directly by calling print() method directly
   * @returns {void}
   */
  rgSet() {
    debug('rgSet', '--------- rgSet ------', 'navy', '#B6ECFF');
    const attrName = 'data-rg-set';
    const elems = document.querySelectorAll(`[${attrName}]`);
    if (!elems.length) { return; }

    for (const elem of elems) {
      const attrVal = elem.getAttribute(attrName);
      const attrValSplited = attrVal.split(this.separator);

      const bindTo = !!attrValSplited[1] ? attrValSplited[1].trim() : ''; // 'print'

      const prop = attrValSplited[0].trim(); // controller property name
      const propSplitted = prop.split('.'); // company.name

      const handler = event => {
        // console.log(event);
        let i = 1;
        let obj = this;
        for (const prop of propSplitted) {
          if (i !== propSplitted.length) { obj[prop] = {}; obj = obj[prop]; }
          else { obj[prop] = elem.value; }
          i++;
        }
        if (bindTo === 'print') { this.rgPrint(prop); }
      };

      elem.addEventListener('input', handler);
      this.dataRgs.push({attrName, elem, handler});
      debug('rgSet', `pushed::  ${attrName} -- ${elem.localName} --- dataRgs.length: ${this.dataRgs.length}`, 'navy');
    }

  }



  /**
   * data-rg-if="<controller_property> [@@ hide|remove|empty]"
   * Parse the "data-rg-if" attribute. Show or hide the HTML element.
   * Examples:
   * data-rg-if="ifAge" - hide the element
   * data-rg-if="ifAge @@ hide" - hide the element
   * data-rg-if="ifAge @@ remove" - remove the element
   * data-rg-if="ifAge @@ empty" - empty the element content
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
      let act = attrValSplited[1] || 'hide'; // hide | remove | empty
      act = act.trim();
      if (!!val) { elem.style.visibility = 'visible'; }
      else {
        if (act === 'hide') { elem.style.visibility = 'hidden'; } // elem exists but not visible
        else if (act === 'remove') { elem.remove();  } // elem removed from the DOM
        else if (act === 'empty') { elem.innerHTML = '';  } // elem exists but content is emptied
      }

      debug('rgIf', `${prop}:: ${val} | act::"${act}"`, 'navy');
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
   * data-rg-repeat="<number>"
   * Parse the "data-rg-repeat" attribute. Repeat the element n times.
   * Examples:
   * data-rg-repeat="10"
   * @param {number} num - number of iterations
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
   * data-rg-class="<controller_property> [@@ add|replace]"
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
      const valArr = this[ctrlProp] || []; // controller property value - array

      let act = attrValSplited[1] || '';
      act = act.trim() || 'add';

      if (act == 'replace') { elem.removeAttribute('class'); }
      for (const val of valArr) { elem.classList.add(val); }

      debug('rgClass', `data-rg-class="${attrVal}" --- ctrlProp:: ${ctrlProp} | ctrlVal:: ${valArr} | act:: ${act}`, 'navy');
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


}


module.exports = Parse;
