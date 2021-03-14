const HTTPClient = require('./HTTPClient');
const util = require('./util');
const viewsCompiled = require('../app/dist/views/compiled.json');



class Load {

  constructor() {
    this.baseURL = 'http://localhost:4400';

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
  }


  /**
   * Load router views. View depends on routes.
   * @param {string} viewName - view name
   * @param {string} viewPath - view file path (relative to /view directory)
   * @param {string} cssSel - CSS selector to load part of the view file
   * @param {string} dest - destination where to place the view: inner, outer, sibling, prepend, append
   * @returns
   */
  async view(viewName, viewPath, cssSel, dest) {
    const attrSel = `[data-rg-view="${viewName}"]`;

    // get HTML element
    const elem = document.querySelector(attrSel);
    util.debugger('loadView', `--------- loadView ${attrSel} -- ${viewPath} ---------`, '#8B0892', '#EDA1F1');
    if(util.debug.loadView) { console.log('elem::', elem); }
    if (!elem || !viewPath) { return; }



    // Get HTML content. First try from the compiled JSON and if it doesn't exist then request from the server.
    let contentStr, contentDOM;
    if (!!viewsCompiled[viewPath]) { // HTML content from the variable
      contentStr = viewsCompiled[viewPath];

      // convert HTML string to document-fragment object
      const parser = new DOMParser();
      const doc = parser.parseFromString(contentStr, 'text/html');
      if (!cssSel) {
        contentDOM = doc; // Document
      } else {
        contentDOM = doc.querySelector(cssSel); // HTMLElement
      }

      util.debugger('loadView', '--from compiled JSON', '#8B0892');

    } else { // HTML content by requesting the server
      const path = `/views/${viewPath}`;
      const url = new URL(path, this.baseURL).toString(); // resolve the URL
      const answer = await this.hc.askHTML(url, cssSel);
      const content = answer.res.content;
      if (answer.status !== 200 || !content) { return; }

      // convert answer's content from dom object to string
      contentStr = answer.res.content.str; // string
      contentDOM = answer.res.content.dom; // DocumentFragment | HTMLElement|HTMLButtonElement...

      util.debugger('loadView', '--from server', '#8B0892');
    }


    if(util.debug.loadView) { console.log('contentStr::', contentStr); }
    if(util.debug.loadView) { console.log('contentDOM::', contentDOM); }


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







}




module.exports = Load;
