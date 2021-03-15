const eventEmitter = require('./eventEmitter');
const debug = require('./debug');



/**
 * Parse HTML elements with the "data-rg-" attribute
 */
class Parse {

  constructor() {
    this.dataRgs = []; // [{attrName, elem, handler}] -- attribute name, element with the data-rg-... attribute and its corresponding handler
    this.separator = '@@';
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
          this[funcName](...funcArgs);
        } catch (err) {
          throw new Error(`Method ${funcName} is not defined in the current controller. (ERR::${err.message})`);
        }
      };

      elem.addEventListener('click', handler);
      this.dataRgs.push({attrName, elem, handler});
      debug('rgClick', `pushed:: ${this.dataRgs.length} -- ${attrName} -- ${funcName}`, '#D27523');
    }

  }



  /**
   * data-rg-print="<controller_property> [@@ <act>]"
   * data-rg-print="company.name @@ inner"
   * Parse the "data-rg-print" attribute. Print the controller's property to view.
   * Examples:
   * data-rg-print="product" - product is the controller property
   * data-rg-print="product.name @@ outer"
   * data-rg-print="product.name @@ sibling"
   * @param {string} attrValProp - part of the attribute value which relates to the controller property,
   * for example product.name in the data-rg-print="product.name @@ inner". This speed up parsing because it's limited only to one element.
   * @returns {void}
   */
  rgPrint(attrValProp) {
    debug('rgPrint', '--------- rgPrint ------', 'navy', '#B6ECFF');

    // define attribute
    let attrDef;
    const attrName = 'data-rg-print';
    if (!attrValProp) {
      attrDef = attrName;
    } else {
      attrDef = `${attrName}^="${attrValProp}"`;
    }

    const elems = document.querySelectorAll(`[${attrDef}]`);
    debug('rgPrint', `found elements:: ${elems.length}`, 'navy');
    if (!elems.length) { return; }

    for (const elem of elems) {
      const attrVal = elem.getAttribute(attrName);
      const attrValSplited = attrVal.split(this.separator);

      const prop = attrValSplited[0].trim(); // controller property name
      const propSplitted = prop.split('.'); // company.name
      const prop1 = propSplitted[0]; // company
      let val = this[prop1] || ''; // controller property value
      let i = 0;
      for (const prop of propSplitted) {
        if (i !== 0 && !!val) { val = val[prop]; }
        i++;
      }

      debug('rgPrint', `${prop}:: ${val} , propSplitted:: ${propSplitted}`, 'navy');

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
        elem.prepend(val + ' ');
      } else if (act === 'append') {
        elem.append(' ' + val);
      } else {
        elem.innerHTML = val;
      }

    }
  }



  /**
   * data-rg-set="<controller_property> [@@ <view>]"
   * data-rg-set="company.name @@ print"
   * Parse the "data-rg-set" attribute. Sets the controller property.
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


}


module.exports = Parse;
