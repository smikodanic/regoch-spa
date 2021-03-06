const HTTPClient = require('./HTTPClient');
const EventEmitter = require('./EventEmitter');


class Controller {

  constructor() {
    this.baseURL = 'http://localhost:4400';
    this.separator = '@@';
    this.debug = {
      reset: true,
      rgClick: false,
      rgHref: true,
      viewLoader: false
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

    window.dataRgs = []; // {elem, handler} elements with data-rg-... attribute and its corresponding handlers
  }


  /************* CONTROLLER STAGES ***********/

  /**
   * Reset the controller:
   * - remove all data-rg-... element lsiteners
   * @param {object} trx - regoch router transitional variable (defined in Router.js::testRoutes())
   * @returns {Promise<void>}
   */
  async reset(trx) {
    this.debugger('reset', '------- reset -------', 'green', '#90E4EB');

    const promises = [];
    for (const dataRg of window.dataRgs) {
      dataRg.elem.removeEventListener('click', dataRg.handler);
      this.debugger('reset', `resetted:: ${dataRg.attrName} --- ${dataRg.elem.innerHTML}`, 'green');
      promises.push(Promise.resolve(true));
    }

    await Promise.all(promises);
    window.dataRgs = [];
    return true;
  }


  /**
   * Init the controller. This is where initaial controller functions starting.
   * @param {object} trx - regoch router transitional variable (defined in Router.js::testRoutes())
   * @returns {Promise<void>}
   */
  async init(trx) {}


  /**
   * Parse elements with data-rg-... attribute.
   * @param {object} trx - regoch router transitional variable (defined in Router.js::testRoutes())
   * @returns {Promise<void>}
   */
  async parse(trx) {
    this.rgClick();
    this.rgHref();
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
      window.dataRgs.push({attrName, elem, handler});
      this.debugger('rgClick', `pushed:: ${window.dataRgs.length} -- ${attrName} -- ${funcName}`, '#D27523');

    }

  }


  /**
   * Href listeners and changing URLs (browser history states).
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
      window.dataRgs.push({attrName, elem, handler});
      this.debugger('rgClick', `pushed:: ${window.dataRgs.length} -- ${attrName} -- ${elem.localName}`, 'navy');

    }
  }




  /********** VIEW LOADS ***********/
  /*********************************/
  loadIncView(attrValue, viewPath, cssSel, act) {
    return this.viewLoader('data-rg-incview', attrValue, viewPath, cssSel, act);
  }

  loadRouteView(attrValue, viewPath) {
    return this.viewLoader('data-rg-routeview', attrValue, viewPath, '', 'inner');
  }


  /**
   * Load router views. View depends on routes.
   */
  async viewLoader(attrName, attrValue, viewPath, cssSel, act) {
    const attrSel = `[${attrName}="${attrValue}"]`;

    // get HTML element
    const elem = document.querySelector(attrSel);
    this.debugger(`\n--------- viewLoader ${attrSel} ---------\n`);
    this.debugger('elem::', elem);
    if (!elem) { return; }

    // get html content from the file
    const path = `/views/${viewPath}`;
    const url = new URL(path, this.baseURL).toString(); // resolve the URL
    const answer = await this.hc.askHTML(url, cssSel);
    const content = answer.res.content;
    this.debugger('content::', content, '\n\n');
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
