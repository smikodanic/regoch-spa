const HTTPClient = require('./HTTPClient');
const EventEmitter = require('./EventEmitter');


class Controller {

  constructor() {
    this.baseURL = 'http://localhost:4400';
    this.separator = '@@';
    this.debug = true;

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


  /**
   * Reset the controller:
   * - remove all data-rg-... element lsiteners
   */
  async reset(trx) {
    if (this.debug) {
      console.log('%c ------- reset -------', 'color:Green');
      console.log('window.dataRgs.length::', window.dataRgs.length);
      window.dataRgs.forEach(dataRg => console.log('resetted::', dataRg.attrName, dataRg.elem.innerHTML));
    }
    for (const dataRg of window.dataRgs) {
      await dataRg.elem.removeEventListener('click', dataRg.handler);
    }
    await this.sleep(400);
    window.dataRgs = [];
  }


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



  /**
   * Init the controller.
   * This is where initaial controller functions starting.
   */
  async init() {}


  /**
   * Parse elements with data-rg-... attribute.
   * @param {Object} ctrl - current controller's instance
   */
  async parse(ctrl) {
    await this.sleep(1300);
    this.rgClick(ctrl);
    this.rgHref();
  }




  /**
   * Include HTML components with the data-rg-inc attribute.
   * examples:
   * <header data-rg-inc="/html/header.html">---header---</header>
   * <header data-rg-inc="/html/header.html @@  @@ h2 > small">---header---</header>
   * <header data-rg-inc="/html/header.html @@ inner">---header---</header>
   * <header data-rg-inc="/html/header.html @@ prepend">---header---</header>
   * <header data-rg-inc="/html/header.html @@ append">---header---</header>
   * <header data-rg-inc="/html/header.html @@ outer @@ h2 > small">---header---</header>
   * @param {Document|DocumentFragment|HTMLElement} domObj - the whole document or html string
   * @returns {void}
   */
  async rgInc(domObj) {
    this.debugger('\n--------- rgInc ------\n', domObj);
    const attrName = 'data-rg-inc';
    const elems = domObj.querySelectorAll(`[${attrName}]`);
    if (!elems.length) { return; }

    for (const elem of elems) {
      // extract attribute data
      const attrValue = elem.getAttribute(attrName);
      const path_act_cssSel = attrValue.replace(/\s+/g, '').replace(/^\//, '').split(this.separator);
      const path = !!path_act_cssSel && !!path_act_cssSel.length ? '/views/inc/' + path_act_cssSel[0] : '';
      const act = !!path_act_cssSel && path_act_cssSel.length >= 2 ? path_act_cssSel[1] : 'inner';
      const cssSel = !!path_act_cssSel && path_act_cssSel.length === 3 ? path_act_cssSel[2] : '';
      this.debugger('path_act_cssSel:: ', path, act, cssSel);
      if (!path) { break; }

      // get html file
      const url = new URL(path, this.baseURL).toString(); // resolve the URL
      const answer = await this.hc.askHTML(url, cssSel);
      if (!answer.res.content | answer.status !== 200) { break; }

      // convert answer's content from dom object to string
      const contentDOM = answer.res.content; // DocumentFragment|HTMLElement
      const contentStr = this.dom2string(contentDOM);

      // load contentStr in the element
      const el = document.querySelector(`[${attrName}="${attrValue}"]`);
      this.debugger('contentStr-act-el::', contentStr, act, el, '\n\n');
      if (act === 'inner') {
        el.innerHTML = contentStr;
      } else if (act === 'outer') {
        el.outerHTML = contentStr;
      } else if (act === 'prepend') {
        el.prepend(contentDOM);
      } else if (act === 'append') {
        el.append(contentDOM);
      } else {
        el.innerHTML = contentStr;
      }

      // continue to parse
      if (/data-rg-inc/.test(contentStr)) {
        this.rgInc(contentDOM);
      }

    }
  }


  /**
   * Click listener
   * @param {Object} ctrl - current controller's instance
   * @returns {void}
   */
  rgClick(ctrl) {
    // this.debugger('\n--------- rgClick ------');
    const attrName = 'data-rg-click';
    const elems = document.querySelectorAll(`[${attrName}]`);
    if (!elems.length) { return; }

    for (const elem of elems) {
      const funcDef = elem.getAttribute(attrName).trim(); // string 'fja(x, y, ...arr)'
      const matched = funcDef.match(/^(.+)\((.*)\)$/);
      const funcName = matched[1];
      const funcParams = matched[2].split(',').map(p => p.trim());

      const handler = event => {
        event.preventDefault();
        try {
          ctrl[funcName](...funcParams);
        } catch (err) {
          throw new Error(`Method ${funcName} doesn't exist in the controller. (${err.message})`);
        }
      };

      elem.addEventListener('click', handler);
      window.dataRgs.push({attrName, elem, handler});
      // this.debugger('pushed::', window.dataRgs.length, attrName, funcName);

    }

  }


  /**
   * Parse data-rg-href
   * @returns {void}
   */
  rgHref() {
    // this.debugger('\n--------- rgHref ------');
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
      // this.debugger('pushed::', window.dataRgs.length, attrName, elem.localName);

    }
  }




  /*********** MISC ************/
  /**
   * Debugger. Use it as this.debugger(var1, var2, var3)
   * @returns {void}
   */
  debugger(...textParts) {
    if (this.debug) { console.log(...textParts); }
  }


  /**
   * Delay
   * @param {number} ms - miliseconds
   */
  sleep(ms) {
    new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   *
   * @param {Convert DOM Object to String} dom - HTML dom object
   */
  dom2string(dom) {
    let str = '';
    if (dom.constructor.name === 'HTMLElement') {
      str = dom.outerHTML;
    } else if (dom.constructor.name === 'DocumentFragment') {
      dom.childNodes.forEach(node => {
        // https://developer.mozilla.org/en-US/docs/Web/API/Node/nodeType
        if (node.nodeType === 1) { str += node.outerHTML; }
        else if (node.nodeType === 3){ str += node.data; }
      });
    }
    return str;
  }



}

module.exports = Controller;
