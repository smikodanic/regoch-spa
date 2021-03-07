const HTTPClient = require('./HTTPClient');
const EventEmitter = require('./EventEmitter');


class Controller {

  constructor() {
    this.baseURL = 'http://localhost:4400';
    this.separator = '@@';
    this.debug = {
      destroy: true,
      rgClick: false,
      rgHref: false,
      viewLoader: false,
    };

    const opts = {
      encodeURI: true,
      timeout: 10000,
      retry: 5,
      retryDelay: 1300,
      maxRedirects: 0,
      headers: {
        'authorization': '',
        'accept': '*/*', // 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9'
        'content-type': 'text/html; charset=UTF-8'
      }
    };
    this.hc = new HTTPClient(opts); // hc means http client
    this.eventEmitter = new EventEmitter();

    this.dataRgs = []; // {elem, handler} elements with data-rg-... attribute and its corresponding handlers
  }


  /************* CONTROLLER LIFECYCLE HOOKS ***********/

  /**
   * Render the HTML elements with data-rg-... attribute.
   * @param {object} trx - regoch router transitional variable (defined in Router.js::testRoutes())
   * @returns {Promise<void>}
   */
  async render(trx) {
    if (!!this.onRender) { this.onRender(trx); }
    this.rgClick();
    this.rgHref();
  }


  /**
   * Init the controller. This is where controller logic starts.
   * @param {object} trx - regoch router transitional variable (defined in Router.js::testRoutes())
   * @returns {Promise<void>}
   */
  async init(trx) {
    if (!!this.onInit) { this.onInit(trx, this.dataRgs); }
  }


  /**
   * Destroy the controller:
   * - remove all data-rg-... element lsiteners
   * * @param {HTMLElement} elem - element with data-rg-href which caused controller destruction
   * * @param {Event} event - event (usually click) which was applied on the elem and cause controller destruction
   * @returns {Promise<void>}
   */
  async destroy(elem, event) {
    if (!!this.onDestroy) { this.onDestroy(elem, event, this.dataRgs); }
    this.debugger('destroy', '------- destroy -------', 'green', '#90E4EB');

    const promises = [];
    for (const dataRg of this.dataRgs) {
      dataRg.elem.removeEventListener('click', dataRg.handler);
      this.debugger('destroy', `destroyed:: ${dataRg.attrName} --- ${dataRg.elem.innerHTML}`, 'green');
      promises.push(Promise.resolve(true));
    }

    await Promise.all(promises);
    this.dataRgs = [];

  }




  /*********** LISTENERS for ELEMENTS with the data-rg-... ATTRIBUTES  ***********/
  /**
   * Click listener.
   * @returns {void}
   */
  rgClick() {
    this.debugger('rgClick', '--------- rgClick ------', '#D27523', '#FFD8B6');
    const attrName = 'data-rg-click';
    const elems = document.querySelectorAll(`[${attrName}]`);
    if (!elems.length) { return; }

    for (const elem of elems) {
      const funcDef = elem.getAttribute(attrName).trim(); // string 'fja(x, y, ...arr)'
      const matched = funcDef.match(/^(.+)\((.*)\)$/);
      const funcName = matched[1]; // a methoc defined in the current controller
      const funcParams = matched[2].split(',').map(p => p.trim());

      const handler = event => {
        event.preventDefault();
        try {
          this[funcName](...funcParams);
        } catch (err) {
          throw new Error(`Method ${funcName} is not defined in the current controller. (ERR::${err.message})`);
        }
      };

      elem.addEventListener('click', handler);
      this.dataRgs.push({attrName, elem, handler});
      this.debugger('rgClick', `pushed:: ${this.dataRgs.length} -- ${attrName} -- ${funcName}`, '#D27523');

    }

  }


  /**
   * Href listeners and changing URLs (browser history states).
   * NOTICE: Click on data-rg-href element will destroy the controller.
   * @returns {void}
   */
  rgHref() {
    this.debugger('rgHref', '--------- rgHref ------', 'navy', '#B6ECFF');
    const attrName = 'data-rg-href';
    const elems = document.querySelectorAll(`[${attrName}]`);
    if (!elems.length) { return; }

    for (const elem of elems) {

      const handler = event => {
        event.preventDefault();

        // destroy the current controller
        this.destroy(elem, event);

        // push state and change browser's address bar
        const href = elem.getAttribute('href').trim();
        const state = { href };
        const title = elem.getAttribute(attrName).trim();
        const url = href; // new URL in the browser's address bar
        window.history.pushState(state, title, url);

        // fire event
        this.eventEmitter.emit('pushstate', state);
      };

      elem.addEventListener('click', handler);
      this.dataRgs.push({attrName, elem, handler});
      this.debugger('rgClick', `pushed:: ${this.dataRgs.length} -- ${attrName} -- ${elem.localName}`, 'navy');

    }
  }




  /********** LOADERS ***********/
  /******************************/
  /**
   * Load router views. View depends on routes.
   */
  async loadView(viewName, viewPath, cssSel, act) {
    const attrSel = `[data-rg-view="${viewName}"]`;

    // get HTML element
    const elem = document.querySelector(attrSel);
    this.debugger('viewLoader', `--------- viewLoader ${attrSel} ---------`, '#8B0892', '#EDA1F1');
    if(this.debug.viewLoader) { console.log('elem::', elem); }
    if (!elem || !viewPath) { return; }

    // get html content from the file
    const path = `/views/${viewPath}`;
    const url = new URL(path, this.baseURL).toString(); // resolve the URL
    const answer = await this.hc.askHTML(url, cssSel);
    const content = answer.res.content;
    if(this.debug.viewLoader) { console.log('content::', content, '\n\n'); }
    if (answer.status !== 200 || !content) { return; }

    // convert answer's content from dom object to string
    const contentDOM = answer.res.content.dom; // DocumentFragment | HTMLElement|HTMLButtonElement...
    const contentStr = answer.res.content.str; // string

    // load content in the element
    if (act === 'inner') {
      elem.innerHTML = contentStr;
    } else if (act === 'outer') {
      elem.outerHTML = contentStr;
    } else if (act === 'prepend') {
      elem.prepend(contentDOM);
    } else if (act === 'append') {
      elem.append(contentDOM);
    } else {
      elem.innerHTML = contentStr;
    }

    return {elem, contentDOM, contentStr, document};
  }




  /*********** MISC ************/
  /**
   * Debugger. Use it as this.debugger(var1, var2, var3)
   * @returns {void}
   */
  debugger(tip, text, color, background) {
    if (this.debug[tip]) { console.log(`%c ${text}`, `color: ${color}; background: ${background}`); }
  }


  /**
   * Delay
   * @param {number} ms - miliseconds
   */
  sleep(ms) {
    new Promise(resolve => setTimeout(resolve, ms));
  }



}

module.exports = Controller;
