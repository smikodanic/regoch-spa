const HTTPClient = require('./HTTPClient');
const Util = require('./Util');
const viewsCompiled = require('../app/dist/views/compiled.json');



class Load {

  constructor(baseURL, HTTPClientOpts) {
    this.baseURL = baseURL;
    this.hc = new HTTPClient(HTTPClientOpts); // hc means http client
    this.debug = {
      loadView: true
    };
    this.util = new Util('@@', this.debug);
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
    this.util.debugger('loadView', `--------- loadView ${attrSel} -- ${viewPath} ---------`, '#8B0892', '#EDA1F1');
    if(this.util.loadView) { console.log('elem::', elem); }
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

      this.util.debugger('loadView', '--from compiled JSON', '#8B0892');

    } else { // HTML content by requesting the server
      const path = `/views/${viewPath}`;
      const url = new URL(path, this.baseURL).toString(); // resolve the URL
      const answer = await this.hc.askHTML(url, cssSel);
      const content = answer.res.content;
      if (answer.status !== 200 || !content) { return; }

      // convert answer's content from dom object to string
      contentStr = answer.res.content.str; // string
      contentDOM = answer.res.content.dom; // DocumentFragment | HTMLElement|HTMLButtonElement...

      this.util.debugger('loadView', '--from server', '#8B0892');
    }


    if(this.util.loadView) { console.log('contentStr::', contentStr); }
    if(this.util.loadView) { console.log('contentDOM::', contentDOM); }


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
