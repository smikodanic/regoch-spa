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
  async reset() {
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

  /**
   * Init the controller.
   * This is where initaial controller functions starting.
   */
  async init() {}

  /**
   * Load router views.
   */
  async load() {}


  /**
   * Parse elements with data-rg-... attribute.
   */
  async parse(Ctrl) {
    await this.rgInc(document);
    this.rgClick(Ctrl);
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
    this.debugger('\n--------- rgInc ------');
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
      if (!path) { return; }

      // get html file
      const url = new URL(path, this.baseURL).toString(); // resolve the URL
      const answer = await this.hc.askHTML(url, cssSel);
      if (!answer.res.content | answer.status !== 200) { return; }

      // convert answer's content from dom object to string
      const contentDOM = answer.res.content; // DocumentFragment|HTMLElement
      let contentStr = '';
      if (contentDOM.constructor.name === 'HTMLElement') {
        contentStr = contentDOM.outerHTML;
      } else if (contentDOM.constructor.name === 'DocumentFragment') {
        contentDOM.childNodes.forEach(node => {
          // https://developer.mozilla.org/en-US/docs/Web/API/Node/nodeType
          if (node.nodeType === 1) { contentStr += node.outerHTML; }
          else if (node.nodeType === 3){ contentStr += node.data; }
        });
      }
      this.debugger('contentStr::', contentStr, '\n\n');


      // load contentStr into the document
      const sel = `[${attrName}="${attrValue}"]`;
      const el = document.querySelector(sel);
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
   * @param {Object} Ctrl - controller class
   * @returns {void}
   */
  rgClick(Ctrl) {
    this.debugger('\n--------- rgClick ------');
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
          const ctrl = new Ctrl();
          ctrl[funcName](...funcParams);
        } catch (err) {
          throw new Error(`Method ${funcName} doesn't exist in the controller. (${err.message})`);
        }
      };

      elem.addEventListener('click', handler);
      window.dataRgs.push({attrName, elem, handler});
      this.debugger('pushed::', window.dataRgs.length, attrName, funcName);

    }

  }


  /**
   * Parse data-rg-href
   * @returns {void}
   */
  rgHref() {
    this.debugger('\n--------- rgHref ------');
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
      this.debugger('pushed::', window.dataRgs.length, attrName, elem.localName);

    }
  }



  async loadView(path, cssSel) {
    this.debugger('\n--------- loadView ------');
    const attrName = 'data-rg-view';
    const elem = document.querySelector(`[${attrName}]`);
    if (!elem) { return; }

    // extract attribute data
    const attrValue = elem.getAttribute(attrName);
    const act = !!attrValue ? attrValue.trim() : 'inner';
    path = '/views/' + path;
    this.debugger('path_act_cssSel:: ', path, act);
    if (!path) { return; }

    // get html file
    const url = new URL(path, this.baseURL).toString(); // resolve the URL
    const answer = await this.hc.askHTML(url, cssSel);
    if (!answer.res.content | answer.status !== 200) { return; }

    // convert answer's content from dom object to string
    const contentDOM = answer.res.content; // DocumentFragment|HTMLElement
    let contentStr = '';
    if (contentDOM.constructor.name === 'HTMLElement') {
      contentStr = contentDOM.outerHTML;
    } else if (contentDOM.constructor.name === 'DocumentFragment') {
      contentDOM.childNodes.forEach(node => {
        // https://developer.mozilla.org/en-US/docs/Web/API/Node/nodeType
        if (node.nodeType === 1) { contentStr += node.outerHTML; }
        else if (node.nodeType === 3){ contentStr += node.data; }
      });
    }
    this.debugger('contentStr::', contentStr, '\n\n');


    // load contentStr into the document
    const sel = `[${attrName}="${attrValue}"]`;
    const el = document.querySelector(sel);
    if (act === 'inner') {
      el.innerHTML = contentStr;
    } else if (act === 'prepend') {
      el.prepend(contentDOM);
    } else if (act === 'append') {
      el.append(contentDOM);
    } else {
      el.innerHTML = contentStr;
    }

  }



  /*********** MISC ************/
  /**
   * Debugger. Use it as this.debugger(var1, var2, var3)
   * @returns {void}
   */
  debugger(...textParts) {
    const text = textParts.join(' ');
    if (this.debug) { console.log(text); }
  }

  sleep(ms) {
    new Promise(resolve => setTimeout(resolve, 400));
  }



}

module.exports = Controller;
