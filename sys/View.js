const viewsCompiled = require('../app/dist/views/compiled.json');
const HTTPClient = require('./HTTPClient');
const debug = require('./debug');



class View {

  constructor() {
    const loc = window.location;
    this.baseURIhost = `${loc.protocol}//${loc.host}`;

    const opts = {
      encodeURI: true,
      timeout: 21000,
      retry: 0,
      retryDelay: 1300,
      maxRedirects: 0,
      headers: {
        'authorization': '',
        'accept': '*/*', // 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9'
        'content-type': 'text/html; charset=UTF-8'
      }
    };
    this.hc = new HTTPClient(opts);
  }


  /**
   * Load router views. View depends on routes.
   * @param {string} viewName - view name
   * @param {string} viewPath - view file path (relative to /view directory): '/some/file.html'
   * @param {string} cssSel - CSS selector to load part of the view file: 'div > p.bolded'
   * @param {string} dest - destination where to place the view: inner, outer, sibling, prepend, append
   * @returns {object}
   */
  async loadView(viewName, viewPath, cssSel, dest) {
    const attrSel = `[data-rg-view="${viewName}"]`;

    // get HTML element
    const elem = document.querySelector(attrSel);
    debug('loadView', `--------- loadView ${attrSel} -- ${viewPath} ---------`, '#8B0892', '#EDA1F1');
    if(debug().loadView) { console.log('elem::', elem); }
    if (!elem || !viewPath) { return; }



    // Get HTML content. First try from the compiled JSON and if it doesn't exist then request from the server.
    let contentStr, contentDOM;
    if (!!viewsCompiled[viewPath]) { // HTML content from the variable
      const cnt = this.fetchCompiledView(viewPath, cssSel);
      contentStr = cnt.contentStr;
      contentDOM = cnt.contentDOM;
      debug('loadView', '--from compiled JSON', '#8B0892');
    } else { // HTML content by requesting the server
      const cnt = await this.fetchRemoteView(viewPath, cssSel);
      contentStr = cnt.contentStr;
      contentDOM = cnt.contentDOM;
      debug('loadView', '--from server', '#8B0892');
    }


    if(debug().loadView) { console.log('contentStr::', contentStr); }
    if(debug().loadView) { console.log('contentDOM::', contentDOM); }


    // load content in the element
    if (dest === 'inner') {
      elem.innerHTML = contentStr;
    } else if (dest === 'outer') {
      elem.outerHTML = contentStr;
    } else if (dest === 'sibling') {
      const parent = elem.parentNode;
      const sibling = elem.nextSibling;
      if (sibling.isEqualNode(contentDOM)) { sibling.replaceWith(contentDOM); }
      else { parent.insertBefore(contentDOM, sibling); }
    } else if (dest === 'prepend') {
      const firstChild = elem.firstChild;
      const emptyNode = document.createTextNode('');
      if (firstChild.isEqualNode(contentDOM)) { firstChild.replaceWith(emptyNode); }
      elem.prepend(contentDOM);
    } else if (dest === 'append') {
      const lastChild = elem.lastChild;
      const emptyNode = document.createTextNode('');
      if (lastChild.isEqualNode(contentDOM)) { lastChild.replaceWith(emptyNode); }
      elem.append(contentDOM);
    } else {
      elem.innerHTML = contentStr;
    }

    return {elem, contentStr, contentDOM, document};
  }




  /**
   * Load includes i.e. from /views/inc/ directory
   */
  async loadViewinc() {
    const attrName = 'data-rg-viewinc';

    // get HTML elements
    const elems = document.querySelectorAll(`[${attrName}]`);
    debug('loadViewinc', `--------- loadViewinc ---------`, '#8B0892', '#EDA1F1');
    if(debug().loadViewinc) { console.log('elems::', elems); }
    if (!!elems && !elems.length) { return; }

    /////// 1.st level
    for (const elem of elems) {
      const attrVal = elem.getAttribute(attrName);
      const viewPath = `inc/${attrVal}`;

      const cnt = this.fetchCompiledView(viewPath);
      let contentStr = cnt.contentStr; // String
      const contentDOM = cnt.contentDOM; // Document

      /////// 2.nd level
      if (/data-rg-viewinc/.test(contentStr)) {
        const elems2 = contentDOM.querySelectorAll(`[${attrName}]`);
        if(debug().loadViewinc) { console.log('elems2::', elems2); }
        for (const elem2 of elems2) {
          const attrVal2 = elem2.getAttribute(attrName);
          const viewPath2 = `inc/${attrVal2}`;
          const cnt2 = this.fetchCompiledView(viewPath2);
          const contentStr2 = cnt2.contentStr;
          elem2.innerHTML = contentStr2;
        }
        contentStr = contentDOM.querySelector('body').innerHTML;
      }

      elem.innerHTML = contentStr;
    }

  }



  /**
   * Fetch view from a compiled file (../app/dist/views/compiled.json).
   * @param {string} viewPath - view file path (relative to /view directory): '/some/file.html'
   * @param {string} cssSel - CSS selector to load part of the view file: 'div > p.bolded'
   * @returns {object}
   */
  fetchCompiledView(viewPath, cssSel) {
    const contentStr = viewsCompiled[viewPath];

    // convert HTML string to document-fragment object
    const parser = new DOMParser();
    const doc = parser.parseFromString(contentStr, 'text/html');
    let contentDOM;
    if (!cssSel) {
      contentDOM = doc; // Document
    } else {
      contentDOM = doc.querySelector(cssSel); // HTMLElement
    }

    return {contentStr, contentDOM};
  }


  /**
   * Fetch view by sending a HTTP request to the server.
   * @param {string} viewPath - view file path (relative to /view directory): '/some/file.html'
   * @param {string} cssSel - CSS selector to load part of the view file: 'div > p.bolded'
   * @returns {object}
   */
  async fetchRemoteView(viewPath, cssSel) {
    const path = `/views/${viewPath}`;
    const url = new URL(path, this.baseURIhost).toString(); // resolve the URL
    const answer = await this.hc.askHTML(url, cssSel);
    const content = answer.res.content;
    if (answer.status !== 200 || !content) { return; }

    // convert answer's content from dom object to string
    const contentStr = answer.res.content.str; // string
    const contentDOM = answer.res.content.dom; // DocumentFragment | HTMLElement|HTMLButtonElement...

    return {contentStr, contentDOM};
  }




}




module.exports = View;
