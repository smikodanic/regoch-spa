const navig = require('./lib/navig');


/**
 * Parse HTML elements with the "data-rg-" attribute (event listeners)
 */
class DataRgListeners {

  constructor() {
    // collector of the data-rg- listeners  [{attrName, elem, handler, eventName}]
    this.rgListeners = [];
  }


  /**
   * Remove all listeners (click, input, keyup, ...) from the elements with the "data-rg-..." attribute
   * when controller is destroyed i.e. when URL is changed. See /sys/router.js
   * @returns {void}
   */
  async rgKILL() {
    this._debug('rgKILL', '------- rgKILL (start) -------', 'orange', '#FFD8B6');

    const promises = [];
    let i = 1;
    for (const rgListener of this.rgListeners) {
      rgListener.elem.removeEventListener(rgListener.eventName, rgListener.handler);
      this._debug('rgKILL', `${i}. killed:: ${rgListener.attrName} --- ${rgListener.eventName} --- ${rgListener.elem.innerHTML}`, 'orange');
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
   * Href listeners and changing URLs (browser history states).
   * NOTICE: Click on data-rg-href element will destroy the controller i.e. rgKILL() will be invoked.
   * @returns {void}
   */
  rgHref() {
    this._debug('rgHref', '--------- rgHref ------', 'orange', '#FFD8B6');
    const attrName = 'data-rg-href';
    const elems = document.querySelectorAll(`[${attrName}]`);
    if (!elems.length) { return; }

    for (const elem of elems) {

      const handler = async event => {
        event.preventDefault();

        // change browser's address bar (emit 'pushstate' event)
        const href = elem.getAttribute('href');
        const state = { href };
        const title = elem.getAttribute(attrName).trim();
        if (!!href) { navig.goto(href.trim(), state, title); }
        this._debug('rgHref', `Clicked data-rg-href element. href: ${href}`, 'orange');
      };

      elem.addEventListener('click', handler);
      this.rgListeners.push({attrName, elem, handler, eventName: 'click'});
      this._debug('rgHref', `pushed::  tag: ${elem.localName} | href="${elem.pathname}" | total: ${this.rgListeners.length}`, 'orange');
    }
  }



  /**
   * data-rg-click="<controllerMethod>"
   * <button data-rg-click="myFunc()">CLICK ME</button>
   * Listen for click and execute the function i.e. controller method.
   * @param {string} controllerMeth - controller method name
   * @returns {void}
   */
  rgClick(controllerMeth) {
    this._debug('rgClick', '--------- rgClick ------', 'orange', '#FFD8B6');

    const attrName = 'data-rg-click';
    let elems = document.querySelectorAll(`[${attrName}]`);
    if (!!controllerMeth) { elems = document.querySelectorAll(`[${attrName}^="${controllerMeth}"]`); }
    this._debug('rgClick', `found elements:: ${elems.length}`, 'orange');
    if (!elems.length) { return; }

    for (const elem of elems) {
      const attrVal = elem.getAttribute(attrName); // string 'myFunc(x, y, ...restArgs)'
      if (!attrVal) { console.error(`Attribute "data-rg-click" has bad definition (data-rg-click="${attrVal}").`); continue; }
      const funcDef = attrVal.trim();

      const handler = event => {
        event.preventDefault();
        const {funcName, funcArgs, funcArgsStr} = this._funcParse(funcDef, elem, event);
        this._funcExe(funcName, funcArgs);
        this._debug('rgClick', `Executed ${funcName}(${funcArgsStr}) controller method (data-rg-click).`, 'orange');
      };

      elem.addEventListener('click', handler);
      this.rgListeners.push({attrName, elem, handler, eventName: 'click'});
      this._debug('rgClick', `pushed::  tag: ${elem.localName} | data-rg-click="${attrVal}" | total: ${this.rgListeners.length}`, 'orange');
    }
  }


  /**
   * data-rg-keayup="<controllerMethod> [@@ keyCode]"
   * <input type="text" data-rg-keyup="myFunc()"> - it will execute myFunc on every key
   * <input type="text" data-rg-keyup="myFunc() @@ enter"> - it will execute myFunc on Enter
   * Parse the "data-rg-keyup" attribute. Listen for the keyup event on certain element and execute the controller method.
   * @param {string} controllerMeth - controller method name
   * @returns {void}
   */
  rgKeyup(controllerMeth) {
    this._debug('rgKeyup', '--------- rgKeyup ------', 'orange', '#FFD8B6');

    const attrName = 'data-rg-keyup';
    let elems = document.querySelectorAll(`[${attrName}]`);
    if (!!controllerMeth) { elems = document.querySelectorAll(`[${attrName}^="${controllerMeth}"]`); }
    this._debug('rgKeyup', `found elements:: ${elems.length}`, 'orange');
    if (!elems.length) { return; }

    for (const elem of elems) {
      const attrVal = elem.getAttribute(attrName);
      const attrValSplited = attrVal.split(this.separator);

      if (!attrValSplited[0]) { console.error(`Attribute "data-rg-keyup" has bad definition (data-rg-keyup="${attrVal}").`); continue; }
      const funcDef = attrValSplited[0].trim();

      let keyCode = attrValSplited[1] || '';
      keyCode = keyCode.trim().toLowerCase();

      const handler = event => {
        event.preventDefault();

        const eventCode = event.code.toLowerCase();
        if (!!keyCode && keyCode !== eventCode) { return; }

        const {funcName, funcArgs, funcArgsStr} = this._funcParse(funcDef, elem, event);
        this._funcExe(funcName, funcArgs);
        this._debug('rgKeyup', `Executed ${funcName}(${funcArgsStr}) controller method (data-rg-keyup). | eventCode: ${eventCode}`, 'orange');
      };

      elem.addEventListener('keyup', handler);
      this.rgListeners.push({attrName, elem, handler, eventName: 'keyup'});
      this._debug('rgKeyup', `pushed::  tag: ${elem.localName} | data-rg-keyup="${attrVal}" | total: ${this.rgListeners.length}`, 'orange');
    }
  }


  /**
   * data-rg-change="<controllerMethod>"
   * <select data-rg-change="myFunc()">
   * Listen for change and execute the function i.e. controller method.
   * @param {string} controllerMeth - controller method name
   * @returns {void}
   */
  rgChange(controllerMeth) {
    this._debug('rgChange', '--------- rgChange ------', 'orange', '#FFD8B6');

    const attrName = 'data-rg-change';
    let elems = document.querySelectorAll(`[${attrName}]`);
    if (!!controllerMeth) { elems = document.querySelectorAll(`[${attrName}^="${controllerMeth}"]`); }
    this._debug('rgChange', `found elements:: ${elems.length}`, 'orange');
    if (!elems.length) { return; }

    for (const elem of elems) {
      const attrVal = elem.getAttribute(attrName); // string 'myFunc(x, y, ...restArgs)'
      if (!attrVal) { console.error(`Attribute "data-rg-change" has bad definition (data-rg-change="${attrVal}").`); continue; }
      const funcDef = attrVal.trim();

      const handler = event => {
        event.preventDefault();
        const {funcName, funcArgs, funcArgsStr} = this._funcParse(funcDef, elem, event);
        this._funcExe(funcName, funcArgs);
        this._debug('rgChange', `Executed ${funcName}(${funcArgsStr}) controller method (data-rg-change).`, 'orange');
      };

      elem.addEventListener('change', handler);
      this.rgListeners.push({attrName, elem, handler, eventName: 'change'});
      this._debug('rgChange', `pushed::  tag: ${elem.localName} | data-rg-change="${attrVal}" | total: ${this.rgListeners.length}`, 'orange');
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
    this._debug('rgEvt', '--------- rgEvt ------', 'orange', '#FFD8B6');
    const attrName = 'data-rg-evt';
    const elems = document.querySelectorAll(`[${attrName}]`);
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

        const handler = event => {
          event.preventDefault();
          const {funcName, funcArgs, funcArgsStr} = this._funcParse(funcDef, elem, event);
          this._funcExe(funcName, funcArgs);
          this._debug('rgEvt', `Executed ${funcName}(${funcArgsStr}) controller method (data-rg-evt).`, 'orange');
        };

        elem.addEventListener(eventName, handler);
        this.rgListeners.push({eventName, attrName, elem, handler, eventName});
        this._debug('rgEvt', `pushed::  tag: ${elem.localName} | data-rg-evt | event: ${eventName} | total: ${this.rgListeners.length}`, 'orange');
      }
    }
  }



  /**
   * data-rg-set="<controllerProp> [@@ <doAfter>]"
   * Parse the "data-rg-set" attribute. Sets the controller property in HTML form field like INPUT, SELECT, TEXTAREA, ....
   * Examples:
   * data-rg-set="product" - product is the controller property
   * data-rg-set="product.name"
   * data-rg-set="product.name @@ rgPrint" -> after set do rgPrint() which will update the view as the user type
   * data-rg-set="product.name @@ rgSwich" -> after set do rgSwitch() which will render data-rg-switch elements
   * @param {string} controllerProp - controller property name
   * @returns {void}
   */
  rgSet(controllerProp) {
    this._debug('rgSet', '--------- rgSet ------', 'orange', '#FFD8B6');

    const attrName = 'data-rg-set';
    let elems = document.querySelectorAll(`[${attrName}]`);
    if (!!controllerProp) { elems = document.querySelectorAll(`[${attrName}^="${controllerProp}"]`); }
    this._debug('rgSet', `found elements:: ${elems.length} , controllerProp:: ${controllerProp}`, 'orange');
    if (!elems.length) { return; }

    for (const elem of elems) {
      const attrVal = elem.getAttribute(attrName);
      const attrValSplited = attrVal.split(this.separator);
      if (!attrValSplited[0]) { console.error(`Attribute "data-rg-set" has bad definition (data-rg-set="${attrVal}").`); continue; }

      const prop = attrValSplited[0].trim(); // controller property name
      const doAfter_str = !!attrValSplited[1] ? attrValSplited[1].trim() : ''; // what to do after the controller property is set: 'rgPrint', 'rgSwitch'
      const doAfter_arr = !!doAfter_str ? doAfter_str.split(',') : [];

      const handler = event => {
        this._setControllerValue(prop, elem.value);

        for (const doAfter of doAfter_arr) {
          const doAfter2 = doAfter.trim();
          this[doAfter2](prop);
        }
        this._debug('rgSet', `controller property:: ${prop} = ${elem.value}`, 'orange');
      };

      handler(); // Execute the handler when controller is executed. This will set controller property defined in constructor() in the view.

      elem.addEventListener('input', handler);
      this.rgListeners.push({attrName, elem, handler, eventName: 'input'});
      this._debug('rgSet', `pushed::  <${elem.localName} ${attrName}="${attrVal}"> -- TOTAL listeners.length: ${this.rgListeners.length}`, 'orange');
    }
  }





  /********** PRIVATES ************/
  /**
   * Set the controller property's value.
   * For example controller's property is this.product.name
   * @param {string} prop - controller property name, for example: product.name
   * @param {any} val - controller property value
   * @returns {void}
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
   * Parse function definition and return function name and arguments.
   * For example: products.list(25, 'str', $event, $element) -> {funcName: 'products.list', funcArgs: [55, elem]}
   * @param {string} funcDef - function definition in the data-rg- attribute
   * @param {HTMLElement} elem - data-rg- HTML element on which is the event applied
   * @param {Event} event - event (click, keyup, ...) applied on the data-rg- element
   * @returns {{funcName:string, funcArgs:any[], funcArgsStr:string}
   */
  _funcParse(funcDef, elem, event) {
    const matched = funcDef.match(/^(.+)\((.*)\)$/);
    if (!matched) { console.error(`_funcParseErr: Function "${funcDef}" has bad definition.`); return; }
    const funcName = matched[1] || ''; // function name: products.list

    const funcArgsStr = matched[2] || ''; // function arguments: 25, 'str', $event, $element, this.products
    const funcArgs = funcArgsStr
      .split(',')
      .map(arg => {
        arg = arg.trim().replace(/\'|\"/g, '');
        if (arg === '$element') { arg = elem; }
        if (arg === '$event') { arg = event; }
        if (/^\/.+\/i?g?$/.test(arg)) { // if regular expression, for example in replace(/Some/i, 'some')
          const mat = arg.match(/^\/(.+)\/(i?g?)$/);
          arg = new RegExp(mat[1], mat[2]);
        }
        if (/^this\./.test(arg)) { // if contain this. i.e. controller property
          const prop = arg.replace(/^this\./, ''); // remove this.
          const val = this._getControllerValue(prop);
          arg = val;
        }
        if (/^\$scope\./.test(arg)) { // if contain $scope. i.e. $scope property
          const val = this._getControllerValue(arg);
          arg = val;
        }
        return arg;
      });

    return {funcName, funcArgs, funcArgsStr};
  }


  /**
   * Execute the function. It can be the controller method or the function defined in the controller proerty.
   * @param {string} funcName - function name, for example: runKEYUP or products.list
   * @param {any[]} funcArgs - function argumants
   * @return {void}
   */
  _funcExe(funcName, funcArgs) {
    try {

      if (/\./.test(funcName)) {
        // execute the function in the controller property, for example: this.print.inConsole = () => {...}
        const propSplitted = funcName.split('.'); // ['print', 'inConsole']
        let obj = this;
        for (const prop of propSplitted) { obj = obj[prop]; }
        obj(...funcArgs);
      } else {
        // execute the controller method
        if (!this[funcName]) { throw new Error(`Method "${funcName}" is not defined in the "${this.constructor.name}" controller.`); }
        this[funcName](...funcArgs);
      }

    } catch (err) {
      console.error(err);
    }
  }




}


module.exports = DataRgListeners;

