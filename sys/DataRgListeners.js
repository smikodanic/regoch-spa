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
  async rgKILL() {
    this._debug('rgKILL', `------- rgKILL (start) ctrl: ${this.constructor.name} -------`, 'orange', '#FFD8B6');

    const promises = [];
    let i = 1;
    for (const rgListener of this.rgListeners) {
      rgListener.elem.removeEventListener(rgListener.eventName, rgListener.handler);
      this._debug('rgKILL', `${i}. killed:: ${rgListener.attrName} --- ${rgListener.eventName} --- ${rgListener.elem.localName} -- ${rgListener.elem.innerHTML}`, 'orange');
      promises.push(Promise.resolve(true));
      i++;
    }

    await Promise.all(promises);
    this.rgListeners = [];
    this._debug('rgKILL', '------- rgKILL (end) -------', 'orange', '#FFD8B6');
  }



  /**
   * data-rg-href
   * <a href="/product/12" data-rg-href>Product 12</a>
   * <a href="" data-rg-href="/product/12">Product 12</a>
   * Href listeners and changing URLs (browser history states).
   * NOTICE: Click on data-rg-href element will destroy the controller i.e. rgKILL() will be invoked.
   * @returns {void}
   */
  rgHref() {
    this._debug('rgHref', '--------- rgHref ------', 'orange', '#F4EA9E');

    const attrName = 'data-rg-href';
    const elems = this._listElements(attrName, '');
    this._debug('rgHref', `found elements:: ${elems.length}`, 'orange');
    if (!elems.length) { return; }

    for (const elem of elems) {

      const handler = async event => {
        event.preventDefault();

        // change browser's address bar (emit 'pushstate' event)
        const href = elem.getAttribute('data-rg-href') || elem.getAttribute('href') || '';
        const state = { href };
        const title = elem.getAttribute(attrName).trim();
        if (!!href) { navig.goto(href.trim(), state, title); }
        this._debug('rgHref', `Executed rgHref listener -->  href: ${href}`, 'orangered');
      };

      elem.addEventListener('click', handler);
      this.rgListeners.push({ attrName, elem, handler, eventName: 'click-href' });
      this._debug('rgHref', `pushed::  tag: ${elem.localName} | href="${elem.pathname}" | rgListeners: ${this.rgListeners.length}`, 'orange');
    }
  }



  /**
   * data-rg-click="<controllerMethod> [@@ preventDefault]"
   * <button data-rg-click="myFunc()">CLICK ME</button>
   * Listen for click and execute the function i.e. controller method.
   * @returns {void}
   */
  rgClick() {
    this._debug('rgClick', '--------- rgClick ------', 'orange', '#F4EA9E');

    const attrName = 'data-rg-click';
    const elems = this._listElements(attrName, '');
    this._debug('rgClick', `found elements:: ${elems.length}`, 'orange');
    if (!elems.length) { return; }

    for (const elem of elems) {
      const attrVal = elem.getAttribute(attrName); // string 'myFunc(x, y, ...restArgs) @@ preventDefault'
      if (!attrVal) { console.error(`Attribute "data-rg-click" has bad definition (data-rg-click="${attrVal}").`); continue; }

      const attrValSplited = attrVal.split(this.separator);
      const funcDef = attrValSplited[0].trim();
      const tf = !!attrValSplited[1] && attrValSplited[1].trim() === 'preventDefault';

      const handler = async event => {
        if (tf) { event.preventDefault(); }
        const { funcName, funcArgs, funcArgsStr } = this._funcParse(funcDef, elem, event);
        await this._funcExe(funcName, funcArgs);
        this._debug('rgClick', `Executed rgClick listener --> ${funcName}(${funcArgsStr}) | preventDefault: ${tf}`, 'orangered');
      };

      elem.addEventListener('click', handler);
      this.rgListeners.push({ attrName, elem, handler, eventName: 'click' });
      this._debug('rgClick', `pushed::  tag: ${elem.localName} | data-rg-click="${attrVal}" | preventDefault: ${tf} | rgListeners: ${this.rgListeners.length}`, 'orange');
    }
  }


  /**
   * data-rg-keyup="<controllerMethod> [@@ keyCode]"
   * <input type="text" data-rg-keyup="myFunc()"> - it will execute myFunc on every key
   * <input type="text" data-rg-keyup="myFunc() @@ enter"> - it will execute myFunc on Enter
   * Parse the "data-rg-keyup" attribute. Listen for the keyup event on certain element and execute the controller method.
   * @returns {void}
   */
  rgKeyup() {
    this._debug('rgKeyup', '--------- rgKeyup ------', 'orange', '#F4EA9E');

    const attrName = 'data-rg-keyup';
    const elems = this._listElements(attrName, '');
    this._debug('rgKeyup', `found elements:: ${elems.length}`, 'orange');
    if (!elems.length) { return; }

    for (const elem of elems) {
      const attrVal = elem.getAttribute(attrName);
      const attrValSplited = attrVal.split(this.separator);

      if (!attrValSplited[0]) { console.error(`Attribute "data-rg-keyup" has bad definition (data-rg-keyup="${attrVal}").`); continue; }
      const funcDef = attrValSplited[0].trim();

      let keyCode = attrValSplited[1] || '';
      keyCode = keyCode.trim().toLowerCase();

      const handler = async event => {
        let eventCode;
        if (event.code) { eventCode = event.code.toLowerCase(); }
        if (!!keyCode && keyCode !== eventCode) { return; }

        const { funcName, funcArgs, funcArgsStr } = this._funcParse(funcDef, elem, event);
        await this._funcExe(funcName, funcArgs);

        this._debug('rgKeyup', `Executed rgKeyup listener --> ${funcName}(${funcArgsStr}) | eventCode: ${eventCode}`, 'orangered');
      };

      elem.addEventListener('keyup', handler);
      this.rgListeners.push({ attrName, elem, handler, eventName: 'keyup' });
      this._debug('rgKeyup', `pushed::  tag: ${elem.localName} | data-rg-keyup="${attrVal}" | ctrl="${this.constructor.name}" | rgListeners: ${this.rgListeners.length}`, 'orange');
    }
  }



  /**
   * data-rg-change="<controllerMethod>"
   * <select data-rg-change="myFunc()">
   * Listen for change and execute the function i.e. controller method.
   * @returns {void}
   */
  rgChange() {
    this._debug('rgChange', '--------- rgChange ------', 'orange', '#F4EA9E');

    const attrName = 'data-rg-change';
    const elems = this._listElements(attrName, '');
    this._debug('rgChange', `found elements:: ${elems.length}`, 'orange');
    if (!elems.length) { return; }

    for (const elem of elems) {
      const attrVal = elem.getAttribute(attrName); // string 'myFunc(x, y, ...restArgs)'
      if (!attrVal) { console.error(`Attribute "data-rg-change" has bad definition (data-rg-change="${attrVal}").`); continue; }
      const funcDef = attrVal.trim();

      const handler = async event => {
        const { funcName, funcArgs, funcArgsStr } = this._funcParse(funcDef, elem, event);
        await this._funcExe(funcName, funcArgs);
        this._debug('rgChange', `Executed rgChange listener --> ${funcName}(${funcArgsStr})`, 'orangered');
      };

      elem.addEventListener('change', handler);
      this.rgListeners.push({ attrName, elem, handler, eventName: 'change' });
      this._debug('rgChange', `pushed::  tag: ${elem.localName} | data-rg-change="${attrVal}" | rgListeners: ${this.rgListeners.length}`, 'orange');
    }
  }



  /**
   * data-rg-evt="eventName1 @@ <controllerMethod1> [&& eventName2 @@ <controllerMethod2>]"
   * Listen for event and execute the function i.e. controller method.
   * Example:
   * data-rg-evt="mouseenter @@ myFunc($element, $event, 25, 'some text')"  - $element and $event are the DOM objects of the data-rg-evt element
   * @returns {void}
   */
  rgEvt() {
    this._debug('rgEvt', '--------- rgEvt ------', 'orange', '#F4EA9E');
    const attrName = 'data-rg-evt';
    const elems = this._listElements(attrName, '');
    this._debug('rgEvt', `found elements:: ${elems.length}`, 'orange');
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
          const { funcName, funcArgs, funcArgsStr } = this._funcParse(funcDef, elem, event);
          await this._funcExe(funcName, funcArgs);
          this._debug('rgEvt', `Executed rgEvt listener --> ${funcName}(${funcArgsStr})`, 'orangered');
        };

        elem.addEventListener(eventName, handler);
        this.rgListeners.push({ eventName, attrName, elem, handler, eventName });
        this._debug('rgEvt', `pushed::  tag: ${elem.localName} | data-rg-evt | event: ${eventName} | rgListeners: ${this.rgListeners.length}`, 'orange');
      }
    }
  }



  /**
   * data-rg-set="<controllerProperty>"
   * Parse the "data-rg-set" attribute. Get the value from elements like INPUT, SELECT, TEXTAREA, .... and set the controller property i.e. $model.
   * Examples:
   * data-rg-set="product" - product is the controller property
   * data-rg-set="product.name"
   * data-rg-set="product.name @@ preventRender" -> render() will not be executed
   * @returns {void}
   */
  rgSet() {
    this._debug('rgSet', '--------- rgSet ------', 'orange', '#F4EA9E');

    const attrName = 'data-rg-set';
    const elems = this._listElements(attrName, '');
    this._debug('rgSet', `found elements:: ${elems.length}`, 'orange');
    if (!elems.length) { return; }

    for (const elem of elems) {
      const attrVal = elem.getAttribute(attrName);
      if (!attrVal) { console.error(`Attribute "data-rg-set" has bad definition (data-rg-set="${attrVal}").`); continue; }

      const handler = event => {
        const prop = attrVal.trim();
        const val = this._getElementValue(elem);
        this._setModelValue(prop, val);
        this._debug('rgSet', `Executed rgSet listener --> controller property:: ${prop} = ${val}`, 'orangered');
      };

      elem.addEventListener('input', handler);
      this.rgListeners.push({ attrName, elem, handler, eventName: 'input' });
      this._debug('rgSet', `pushed::  <${elem.localName} ${attrName}="${attrVal}"> | rgListeners rgListeners: ${this.rgListeners.length}`, 'orange');
    }
  }



  /**
   * data-rg-model="<controllerProp>"
   * Bind controller property and view INPUT, SELECT, TEXTAREA, ...etc in both directions.
   * When the view is updated the controller property will be updated and when controller property is updated the view will be updated.
   * This is a shortcut of rgSet and rgValue, for example <input type="text" data-rg-input="product" data-rg-set="product"> is <input type="text" data-rg-model="product">
   * Example:
   * data-rg-model="product.name"
   * @returns {void}
   */
  rgModel() {
    this._debug('rgModel', '--------- rgModel ------', 'orange', '#F4EA9E');

    const attrName = 'data-rg-model';
    const elems = this._listElements(attrName, '');
    this._debug('rgModel', `found elements:: ${elems.length}`, 'orange');
    if (!elems.length) { return; }

    for (const elem of elems) {
      const attrVal = elem.getAttribute(attrName);
      if (!attrVal) { console.error(`Attribute "data-rg-model" has bad definition (data-rg-model="${attrVal}").`); continue; }

      const prop = attrVal.trim();

      /** SETTER **/
      const val1 = this._getControllerValue('$model.' + prop);
      this._setElementValue(elem, val1);
      this._debug('rgModel', `rgModel set element value  --> controller property:: ${prop} = ${val1} | elem.type:: ${elem.type}`, 'orangered');

      /** LISTENER **/
      const handler = event => {
        const val2 = this._getElementValue(elem);
        this._setModelValue(prop, val2);
        this._debug('rgModel', `Executed rgModel listener --> controller property:: ${prop} = ${val2}`, 'orangered');
      };

      elem.addEventListener('input', handler);
      this.rgListeners.push({ attrName, elem, handler, eventName: 'input' });
      this._debug('rgModel', `rgModel listener -- pushed::  <${elem.localName} ${attrName}="${attrVal}"> -- TOTAL listeners.length: ${this.rgListeners.length}`, 'orange');
    }

  }



}


module.exports = DataRgListeners;

