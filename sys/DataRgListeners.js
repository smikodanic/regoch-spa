const navig = require('./lib/navig');
const debug = require('./debug');


/**
 * Parse HTML elements with the "data-rg-" attribute (event listeners)
 */
class DataRgListeners {

  constructor() {
    this.rgListeners = []; // listener collector [{attrName, elem, handler}] -- attribute name, element with the data-rg-... attribute and its corresponding handler
  }


  /**
   * Remove all listeners (click, input, ...) from the elements with the "data-rg-..." attribute
   */
  async rgKILL() {
    debug('rgKILL', '------- rgKILL -------', 'orange', '#FFD8B6');

    const promises = [];
    let i = 1;
    for (const rgListener of this.rgListeners) {
      rgListener.elem.removeEventListener(rgListener.eventName, rgListener.handler);
      debug('rgKILL', `${i}. killed:: ${rgListener.attrName} --- ${rgListener.eventName} --- ${rgListener.elem.innerHTML}`, 'orange');
      promises.push(Promise.resolve(true));
      i++;
    }

    await Promise.all(promises);
    this.rgListeners = [];
  }



  /**
   * data-rg-href
   * <a href="/product/12" data-rg-href>Product 12</a>
   * Href listeners and changing URLs (browser history states).
   * NOTICE: Click on data-rg-href element will destroy the controller.
   * @returns {void}
   */
  rgHref() {
    debug('rgHref', '--------- rgHref ------', 'orange', '#FFD8B6');
    const attrName = 'data-rg-href';
    const elems = document.querySelectorAll(`[${attrName}]`);
    if (!elems.length) { return; }

    for (const elem of elems) {

      const handler = async event => {
        event.preventDefault();

        // change browser's address bar and emit 'pushstate' event
        const href = elem.getAttribute('href').trim();
        const state = { href };
        const title = elem.getAttribute(attrName).trim();
        navig.goto(href, state, title);
      };

      elem.addEventListener('click', handler);
      this.rgListeners.push({attrName, elem, handler, eventName: 'click'});
      debug('rgHref', `pushed::  tag: ${elem.localName} | href="${elem.pathname}" | total: ${this.rgListeners.length}`, 'orange');

    }
  }



  /**
   * data-rg-click="<function>"
   * data-rg-click="myFunc()"
   * Listen for click and execute the function i.e. controller method.
   * @returns {void}
   */
  rgClick() {
    debug('rgClick', '--------- rgClick ------', 'orange', '#FFD8B6');
    const attrName = 'data-rg-click';
    const elems = document.querySelectorAll(`[${attrName}]`);
    if (!elems.length) { return; }

    for (const elem of elems) {
      const funcDef = elem.getAttribute(attrName).trim(); // string 'myFunc(x, y, ...restArgs)'
      const matched = funcDef.match(/^(.+)\((.*)\)$/);
      if (!matched) { console.error(`Error data-rg-click: "${funcDef}" has bad definition.`); continue; }

      const funcName = matched[1]; // function name: myFunc

      const handler = event => {
        event.preventDefault();
        try {
          const funcArgs = this._getFuncArgs(matched[2], elem, event);
          if (!this[funcName]) { throw new Error(`Method "${funcName}" is not defined in the "${this.constructor.name}" controller.`); }
          this[funcName](...funcArgs);
          debug('rgClick', `${funcName} | ${funcArgs}`, 'orange');
        } catch (err) {
          throw new Error(err.message);
        }
      };

      elem.addEventListener('click', handler);
      this.rgListeners.push({attrName, elem, handler, eventName: 'click'});
      debug('rgClick', `pushed::  tag: ${elem.localName} | data-rg-click="${funcName}" | total: ${this.rgListeners.length}`, 'orange');
    }

  }


  /**
   * data-rg-change="<function>"
   * data-rg-change="myFunc()"
   * Listen for change and execute the function i.e. controller method.
   * @returns {void}
   */
  rgChange() {
    debug('rgChange', '--------- rgChange ------', 'orange', '#FFD8B6');
    const attrName = 'data-rg-change';
    const elems = document.querySelectorAll(`[${attrName}]`);
    if (!elems.length) { return; }

    for (const elem of elems) {
      const funcDef = elem.getAttribute(attrName).trim(); // string 'myFunc(x, y, ...restArgs)'
      const matched = funcDef.match(/^(.+)\((.*)\)$/);
      if (!matched) { console.error(`Error data-rg-change: "${funcDef}" has bad definition.`); continue; }

      const funcName = matched[1]; // function name: myFunc

      const handler = event => {
        event.preventDefault();
        try {
          const funcArgs = this._getFuncArgs(matched[2], elem, event);
          if (!this[funcName]) { throw new Error(`Method "${funcName}" is not defined in the "${this.constructor.name}" controller.`); }
          this[funcName](...funcArgs);
          debug('rgChange', `controller method: "${funcName}" with args: "${funcArgs}"`, 'orange');
        } catch (err) {
          throw new Error(err.message);
        }
      };

      elem.addEventListener('change', handler);
      this.rgListeners.push({attrName, elem, handler, eventName: 'change'});
      debug('rgChange', `pushed::  tag: ${elem.localName} | data-rg-change="${funcName}" | total: ${this.rgListeners.length}`, 'orange');
    }

  }


  /**
   * data-rg-evt="eventName1 @@ <function1> [&& eventName2 @@ <function2>]"
   * Listen for event and execute the function i.e. controller method.
   * https://developer.mozilla.org/en-US/docs/Web/API/Element/mouseenter_event
   * Examples:
   * data-rg-evt="mouseenter @@ myFunc($element, $event, 25, 'some text')"  - $element and $event are the DOM objects related to the element
   * @returns {void}
   */
  rgEvt() {
    debug('rgEvt', '--------- rgEvt ------', 'orange', '#FFD8B6');
    const attrName = 'data-rg-evt';
    const elems = document.querySelectorAll(`[${attrName}]`);
    if (!elems.length) { return; }

    for (const elem of elems) {
      const attrVal = elem.getAttribute(attrName).trim(); // mouseenter @@ runEVT($element, $event, 'red') && mouseleave @@ runEVT($element, $event, 'green')
      const directives = attrVal.split('&&');

      for (const directive of directives) {
        const attrValSplited = directive.split(this.separator);
        if (!attrValSplited[0] || !attrValSplited[1]) { throw new Error(`Attribute "data-rg-evt" has bad definition (data-rg-evt="${attrVal}").`); }

        const eventName = attrValSplited[0].trim();
        const funcDef = attrValSplited[1].trim();

        const matched = funcDef.match(/^(.+)\((.*)\)$/);
        if (!matched) { console.error(`Error data-rg-evt: "${funcDef}" has bad definition.`); continue; }

        const funcName = matched[1]; // function name: myFunc

        const handler = event => {
          event.preventDefault();
          try {
            const funcArgs = this._getFuncArgs(matched[2], elem, event);
            if (!this[funcName]) { throw new Error(`Method "${funcName}" is not defined in the "${this.constructor.name}" controller.`); }
            this[funcName](...funcArgs);
            debug('rgEvt', `${funcName} | ${funcArgs}`, 'orange');
          } catch (err) {
            throw new Error(err.message);
          }
        };

        elem.addEventListener(eventName, handler);
        this.rgListeners.push({eventName, attrName, elem, handler, eventName});
        debug('rgEvt', `pushed::  tag: ${elem.localName} | data-rg-change="${funcName}" | event: ${eventName} | total: ${this.rgListeners.length}`, 'orange');
      }

    }

  }



  /**
   * data-rg-set="<controllerProperty> [@@ print]"
   * Parse the "data-rg-set" attribute. Sets the controller property in HTML form field like INPUT, SELECT, TEXTAREA, ....
   * Examples:
   * data-rg-set="product" - product is the controller property
   * data-rg-set="product.name"
   * data-rg-set="product.name @@ print" -> bind to view directly by calling print() method directly
   * @returns {void}
   */
  rgSet() {
    debug('rgSet', '--------- rgSet ------', 'orange', '#FFD8B6');
    const attrName = 'data-rg-set';
    const elems = document.querySelectorAll(`[${attrName}]`);
    if (!elems.length) { return; }

    for (const elem of elems) {
      const attrVal = elem.getAttribute(attrName);
      const attrValSplited = attrVal.split(this.separator);

      const bindTo = !!attrValSplited[1] ? attrValSplited[1].trim() : ''; // 'print'

      const prop = attrValSplited[0].trim(); // controller property name

      debug('rgSet', `initial value: ${elem.value}, bindTo: ${bindTo}`, 'orange');
      this._setControllerValue(prop, elem.value);
      if (bindTo === 'print') { this.rgPrint(prop); }

      const handler = event => {
        this._setControllerValue(prop, elem.value);
        if (bindTo === 'print') { this.rgPrint(prop); }
        debug('rgSet', `controller property:: ${prop} = ${elem.value}`, 'orange');
      };

      elem.addEventListener('input', handler);
      this.rgListeners.push({attrName, elem, handler, eventName: 'input'});
      debug('rgSet', `pushed::  <${elem.localName} ${attrName}="${attrVal}"> -- TOTAL listeners.length: ${this.rgListeners.length}`, 'orange');
    }

  }





  /********** PRIVATES ************/
  /**
   * Set the controller property's value.
   * For example controller's property is this.product.name
   * @param {string} prop - controller property name, for example: product.name
   * @returns {any}
   */
  _setControllerValue(prop, val) {
    const propSplitted = prop.split('.'); // ['product', 'name']
    let i = 1;
    let obj = this;
    for (const prop of propSplitted) {
      if (i !== propSplitted.length) { // not last property
        if (obj[prop] === undefined) { obj[prop] = {}; }
        obj = obj[prop];
      }
      else { // on last property associate the value
        obj[prop] = val;
      }
      i++;
    }
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




}


module.exports = DataRgListeners;

