const Aux = require('./Aux');
const navig = require('./lib/navig');
const eventEmitter = require('./lib/eventEmitter');


/**
 * Parse HTML elements with the "data-rg-" attribute (event listeners)
 */
class DataRgListeners extends Aux {

  constructor() {
    super();
    this.rgListeners = []; // collector of the data-rg- listeners  [{attrName, elem, handler, eventName}]
  }


  /**
   * Remove all listeners (click, input, keyup, ...) from the elements with the "data-rg-..." attribute
   * when controller is destroyed i.e. when URL is changed. See /sys/router.js
   * @returns {void}
   */
  async rgKILL(attrValQuery) {
    this._debug('rgKILL', `------- rgKILL (start) ctrl: ${this.constructor.name} | attrValQuery:: ${attrValQuery} -------`, 'orange', '#FFD8B6');

    const promises = [];
    let i = 1;
    for (const rgListener of this.rgListeners) {
      const attrName = rgListener.attrName;
      const elem = rgListener.elem;
      const handler = rgListener.handler;
      const eventName = rgListener.eventName;

      const attrVal = elem.getAttribute(attrName);

      let toRemove = false;
      if (!!attrValQuery && typeof attrValQuery === 'string') {
        const reg = new RegExp(`^${attrValQuery}`); // for example attrValQuery='company' affects element with the data-rg-set="company.name"
        toRemove = reg.test(attrVal);
      } else if (!!attrValQuery && attrValQuery instanceof RegExp) {
        const reg = attrValQuery; // for example attrValQuery=/company\.name/ affects element with the data-rg-set="company.name"
        toRemove = reg.test(attrVal);
      }

      if (toRemove) {
        elem.removeEventListener(eventName, handler); // remove listeners
        this.rgListeners.splice(i, 1); // remove from the array
        this._debug('rgKILL', `${i}. killed:: ${attrName}  | attrValQuery:: ${attrValQuery} | eventName: ${eventName} | elem.localName: ${elem.localName} | elem.innerHTML: ${elem.innerHTML}`, 'orange');
        promises.push(Promise.resolve(true));
      }

      i++;
    }

    await Promise.all(promises);
    this.rgListeners = [];
    this._debug('rgKILL', '------- rgKILL (end) -------', 'orange', '#FFD8B6');
  }



  /**
   * data-rg-href
   * <a href="/product/12" data-rg-href>Product 12</a>
   * <a href="/product/12" data-rg-href="/product/12">Product 12</a>
   * Href listeners and changing URLs (browser history states).
   * NOTICE: Click on data-rg-href element will destroy the controller i.e. rgKILL() will be invoked.
   * @param {string|RegExp} attrValQuery - query for the attribute value (in most cases it will be undefined)
   * @returns {void}
   */
  rgHref(attrValQuery) {
    this._debug('rgHref', '--------- rgHref ------', 'orange', '#FFD8B6');

    const attrName = 'data-rg-href';
    const elems = this._listElements(attrName, attrValQuery);
    this._debug('rgHref', `found elements:: ${elems.length} | attrValQuery:: ${attrValQuery}`, 'orange');
    if (!elems.length) { return; }

    for (const elem of elems) {

      const handler = async event => {
        event.preventDefault();

        // change browser's address bar (emit 'pushstate' event)
        const href = elem.getAttribute('href');
        const state = { href };
        const title = elem.getAttribute(attrName).trim();
        if (!!href) { navig.goto(href.trim(), state, title); }
        this._debug('rgHref', `Clicked data-rg-href element --> href: ${href}`, 'orangered');
      };

      elem.addEventListener('click', handler);
      this.rgListeners.push({ attrName, elem, handler, eventName: 'click' });
      this._debug('rgHref', `pushed::  tag: ${elem.localName} | href="${elem.pathname}" | total: ${this.rgListeners.length}`, 'orange');
    }
  }



  /**
   * data-rg-click="<controllerMethod>"
   * <button data-rg-click="myFunc()">CLICK ME</button>
   * Listen for click and execute the function i.e. controller method.
   * @param {string|RegExp} attrValQuery - query for the attribute value (controllerMethod)
   * @returns {void}
   */
  rgClick(attrValQuery) {
    this._debug('rgClick', '--------- rgClick ------', 'orange', '#FFD8B6');

    const attrName = 'data-rg-click';
    const elems = this._listElements(attrName, attrValQuery);
    this._debug('rgClick', `found elements:: ${elems.length} | attrValQuery:: ${attrValQuery}`, 'orange');
    if (!elems.length) { return; }

    for (const elem of elems) {
      const attrVal = elem.getAttribute(attrName); // string 'myFunc(x, y, ...restArgs)'
      if (!attrVal) { console.error(`Attribute "data-rg-click" has bad definition (data-rg-click="${attrVal}").`); continue; }
      const funcDef = attrVal.trim();

      const handler = async event => {
        event.preventDefault();
        const { funcName, funcArgs, funcArgsStr } = this._funcParse(funcDef, elem, event);
        await this._funcExe(funcName, funcArgs);
        this._debug('rgClick', `Executed rgClick listener --> ${funcName}(${funcArgsStr})`, 'orangered');
        eventEmitter.emit('autorender', { trigger: 'rgClick', funcName, funcArgs });
      };

      elem.addEventListener('click', handler);
      this.rgListeners.push({ attrName, elem, handler, eventName: 'click' });
      this._debug('rgClick', `pushed::  tag: ${elem.localName} | data-rg-click="${attrVal}" | total: ${this.rgListeners.length}`, 'orange');
    }
  }


  /**
   * data-rg-keayup="<controllerMethod> [@@ keyCode]"
   * <input type="text" data-rg-keyup="myFunc()"> - it will execute myFunc on every key
   * <input type="text" data-rg-keyup="myFunc() @@ enter"> - it will execute myFunc on Enter
   * Parse the "data-rg-keyup" attribute. Listen for the keyup event on certain element and execute the controller method.
   * @param {string|RegExp} attrValQuery - query for the attribute value (controllerMethod)
   * @returns {void}
   */
  rgKeyup(attrValQuery) {
    this._debug('rgKeyup', '--------- rgKeyup ------', 'orange', '#FFD8B6');

    const attrName = 'data-rg-keyup';
    const elems = this._listElements(attrName, attrValQuery);
    this._debug('rgKeyup', `found elements:: ${elems.length} | attrValQuery:: ${attrValQuery}`, 'orange');
    if (!elems.length) { return; }

    for (const elem of elems) {
      const attrVal = elem.getAttribute(attrName);
      const attrValSplited = attrVal.split(this.separator);

      if (!attrValSplited[0]) { console.error(`Attribute "data-rg-keyup" has bad definition (data-rg-keyup="${attrVal}").`); continue; }
      const funcDef = attrValSplited[0].trim();

      let keyCode = attrValSplited[1] || '';
      keyCode = keyCode.trim().toLowerCase();

      const handler = async event => {
        event.preventDefault();

        let eventCode;
        if (event.code) { eventCode = event.code.toLowerCase(); }
        if (!!keyCode && keyCode !== eventCode) { return; }

        const { funcName, funcArgs, funcArgsStr } = this._funcParse(funcDef, elem, event);
        await this._funcExe(funcName, funcArgs);

        this._debug('rgKeyup', `Executed rgKeyup listener --> ${funcName}(${funcArgsStr}) | eventCode: ${eventCode}`, 'orangered');
        eventEmitter.emit('autorender', { trigger: 'rgKeyup', funcName, funcArgs });
      };

      elem.addEventListener('keyup', handler);
      this.rgListeners.push({ attrName, elem, handler, eventName: 'keyup' });
      this._debug('rgKeyup', `pushed::  tag: ${elem.localName} | data-rg-keyup="${attrVal}" | ctrl="${this.constructor.name}" | total: ${this.rgListeners.length}`, 'orange');
    }
  }



  /**
   * data-rg-change="<controllerMethod>"
   * <select data-rg-change="myFunc()">
   * Listen for change and execute the function i.e. controller method.
   * @param {string|RegExp} attrValQuery - query for the attribute value (controllerMethod)
   * @returns {void}
   */
  rgChange(attrValQuery) {
    this._debug('rgChange', '--------- rgChange ------', 'orange', '#FFD8B6');

    const attrName = 'data-rg-change';
    const elems = this._listElements(attrName, attrValQuery);
    this._debug('rgChange', `found elements:: ${elems.length} | attrValQuery:: ${attrValQuery}`, 'orange');
    if (!elems.length) { return; }

    for (const elem of elems) {
      const attrVal = elem.getAttribute(attrName); // string 'myFunc(x, y, ...restArgs)'
      if (!attrVal) { console.error(`Attribute "data-rg-change" has bad definition (data-rg-change="${attrVal}").`); continue; }
      const funcDef = attrVal.trim();

      const handler = async event => {
        event.preventDefault();
        const { funcName, funcArgs, funcArgsStr } = this._funcParse(funcDef, elem, event);
        await this._funcExe(funcName, funcArgs);
        this._debug('rgChange', `Executed rgChange listener --> ${funcName}(${funcArgsStr})`, 'orangered');
        eventEmitter.emit('autorender', { trigger: 'rgChange', funcName, funcArgs });
      };

      elem.addEventListener('change', handler);
      this.rgListeners.push({ attrName, elem, handler, eventName: 'change' });
      this._debug('rgChange', `pushed::  tag: ${elem.localName} | data-rg-change="${attrVal}" | total: ${this.rgListeners.length}`, 'orange');
    }
  }



  /**
   * data-rg-evt="eventName1 @@ <controllerMethod1> [&& eventName2 @@ <controllerMethod2>]"
   * Listen for event and execute the function i.e. controller method.
   * Example:
   * data-rg-evt="mouseenter @@ myFunc($element, $event, 25, 'some text')"  - $element and $event are the DOM objects of the data-rg-evt element
   * @param {string|RegExp} attrValQuery - query for the attribute value (eventName)
   * @returns {void}
   */
  rgEvt(attrValQuery) {
    this._debug('rgEvt', '--------- rgEvt ------', 'orange', '#FFD8B6');
    const attrName = 'data-rg-evt';
    const elems = this._listElements(attrName, attrValQuery);
    this._debug('rgEvt', `found elements:: ${elems.length} | attrValQuery:: ${attrValQuery}`, 'orange');
    if (!elems.length) { return; }

    for (const elem of elems) {
      const attrVal = elem.getAttribute(attrName).trim(); // mouseenter @@ runEVT($element, $event, 'red') && mouseleave @@ runEVT($element, $event, 'green')
      const directives = attrVal.split('&&');

      for (const directive of directives) {
        const attrValSplited = directive.split(this.separator);
        if (!attrValSplited[0] || !attrValSplited[1]) { console.error(`Attribute "data-rg-evt" has bad definition (data-rg-evt="${attrVal}").`); continue; }

        const eventName = attrValSplited[0].trim();
        const funcDef = attrValSplited[1].trim();

        const handler = async event => {
          event.preventDefault();
          const { funcName, funcArgs, funcArgsStr } = this._funcParse(funcDef, elem, event);
          await this._funcExe(funcName, funcArgs);
          this._debug('rgEvt', `Executed rgEvt listener --> ${funcName}(${funcArgsStr})`, 'orangered');
          eventEmitter.emit('autorender', { trigger: 'rgEvt', funcName, funcArgs });
        };

        elem.addEventListener(eventName, handler);
        this.rgListeners.push({ eventName, attrName, elem, handler, eventName });
        this._debug('rgEvt', `pushed::  tag: ${elem.localName} | data-rg-evt | event: ${eventName} | total: ${this.rgListeners.length}`, 'orange');
      }
    }
  }



  /**
   * data-rg-set="<controllerProperty> [@@ <doAfter>]"
   * Parse the "data-rg-set" attribute. Get the value from elements like INPUT, SELECT, TEXTAREA, .... and set the controller property.
   * Examples:
   * data-rg-set="product" - product is the controller property
   * data-rg-set="product.name"
   * data-rg-set="product.name @@ rgPrint" -> after set do rgPrint() which will update the view as the user type
   * data-rg-set="product.name @@ rgSwich" -> after set do rgSwitch() which will render data-rg-switch elements
   * @param {string|RegExp} attrValQuery - query for the attribute value (controllerProperty)
   * @returns {void}
   */
  rgSet(attrValQuery) {
    this._debug('rgSet', '--------- rgSet ------', 'orange', '#FFD8B6');

    const attrName = 'data-rg-set';
    const elems = this._listElements(attrName, attrValQuery);
    this._debug('rgSet', `found elements:: ${elems.length} | attrValQuery:: ${attrValQuery}`, 'orange');
    if (!elems.length) { return; }

    for (const elem of elems) {
      const attrVal = elem.getAttribute(attrName);
      const attrValSplited = attrVal.split(this.separator);
      if (!attrValSplited[0]) { console.error(`Attribute "data-rg-set" has bad definition (data-rg-set="${attrVal}").`); continue; }

      const prop = attrValSplited[0].trim(); // controller property name
      const doAfter_str = !!attrValSplited[1] ? attrValSplited[1].trim() : ''; // what to do after the controller property is set: 'rgPrint', 'rgSwitch'
      const doAfter_arr = !!doAfter_str ? doAfter_str.split(',') : [];

      const handler = event => {
        const val = this._getElementValue(elem);
        this._setControllerValue(prop, val);

        for (const doAfter of doAfter_arr) {
          const doAfter2 = doAfter.trim();
          this[doAfter2](prop);
        }
        this._debug('rgSet', `Executed rgSet listener --> controller property:: ${prop} = ${val}`, 'orangered');
      };

      elem.addEventListener('input', handler);
      this.rgListeners.push({ attrName, elem, handler, eventName: 'input' });
      this._debug('rgSet', `pushed::  <${elem.localName} ${attrName}="${attrVal}"> | rgListeners total: ${this.rgListeners.length}`, 'orange');
    }
  }



  /**
   * data-rg-bind="<controllerProp> [@@ <doAfter>]"
   * Bind controller property and view INPUT, SELECT, TEXTAREA, ...etc in both directions.
   * When the view is updated the controller property will be updated and when controller property is updated the view will be updated.
   * This is a shortcut of rgSet and rgValue.
   * Example:
   * data-rg-bind="product.name"
   * @param {string|RegExp} attrValQuery - query for the attribute value (controllerProperty)
   * @returns {void}
   */
  rgBind(attrValQuery) {
    this._debug('rgBind', '--------- rgBind ------', 'orange', '#FFD8B6');

    const attrName = 'data-rg-bind';
    const elems = this._listElements(attrName, attrValQuery);
    this._debug('rgBind', `found elements:: ${elems.length} | attrValQuery:: ${attrValQuery}`, 'orange');
    if (!elems.length) { return; }

    for (const elem of elems) {
      const attrVal = elem.getAttribute(attrName);
      const attrValSplited = attrVal.split(this.separator);
      if (!attrValSplited[0]) { console.error(`Attribute "data-rg-bind" has bad definition (data-rg-bind="${attrVal}").`); continue; }

      const prop = attrValSplited[0].trim(); // controller property name
      const doAfter_str = !!attrValSplited[1] ? attrValSplited[1].trim() : ''; // what to do after the controller property is set: 'rgPrint', 'rgSwitch'
      const doAfter_arr = !!doAfter_str ? doAfter_str.split(',') : [];

      /** SETTER **/
      const val1 = this._getControllerValue(prop);
      this._setElementValue(elem, val1);
      this._debug('rgBind', `rgBind set element value  --> controller property:: ${prop} = ${val1} | elem.type:: ${elem.type}`, 'orangered');

      /** LISTENER **/
      const handler = event => {
        const val2 = this._getElementValue(elem);
        this._setControllerValue(prop, val2);

        for (const doAfter of doAfter_arr) {
          const doAfter2 = doAfter.trim();
          this[doAfter2](prop);
        }
        this._debug('rgBind', `Executed rgBind listener --> controller property:: ${prop} = ${val2}`, 'orangered');
      };

      elem.addEventListener('input', handler);
      this.rgListeners.push({ attrName, elem, handler, eventName: 'input' });
      this._debug('rgBind', `rgBind listener -- pushed::  <${elem.localName} ${attrName}="${attrVal}"> -- TOTAL listeners.length: ${this.rgListeners.length}`, 'orange');
    }

  }



}


module.exports = DataRgListeners;

