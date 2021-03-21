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
    this.httpClient = new HTTPClient(opts);
  }


  /**
   * Load router views. View depends on routes.
   * @param {string} viewName - view name
   * @param {string} viewPath - view file path (relative to /view directory): '/some/file.html'
   * @param {string} dest - destination where to place the view: inner, outer, sibling, prepend, append
   * @param {string} cssSel - CSS selector to load part of the view file: 'div > p.bolded'
   * @returns {object}
   */
  async loadView(viewName, viewPath, dest, cssSel) {
    const attrSel = `[data-rg-view="${viewName}"]`;

    // get HTML element
    const elem = document.querySelector(attrSel);
    debug('loadView', `--------- loadView ${attrSel} -- ${viewPath} ---------`, '#8B0892', '#EDA1F1');
    if(debug().loadView) { console.log('elem::', elem); }
    if (!elem) { throw new Error(`Element ${attrSel} not found`); }
    if (!viewPath){ throw new Error(`View path is not defined.`); }



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
   * Empty view.
   * @param {string} viewName - view name
   * @param {string} dest - destination where is the view placed: inner, outer, sibling, prepend, append
   * @returns {void}
   */
  emptyView(viewName, dest) {
    const attrSel = `[data-rg-view="${viewName}"]`;
    const elem = document.querySelector(attrSel);
    debug('loadView', `--------- emptyView ${attrSel} | ${dest} ---------`, '#8B0892', '#EDA1F1');
    if(debug().loadView) { console.log('elem::', elem); }
    if (!elem) { throw new Error(`Element ${attrSel} not found`); }

    // empty the content
    if (dest === 'inner') {
      elem.innerHTML = '';
    } else if (dest === 'outer') {
      elem.outerHTML = '';
    } else if (dest === 'sibling') {
      const sibling = elem.nextSibling;
      sibling.remove();
    } else if (dest === 'prepend') {
      const firstChild = elem.firstChild;
      firstChild.remove();
    } else if (dest === 'append') {
      const lastChild = elem.lastChild;
      lastChild.remove();
    } else {
      elem.innerHTML = '';
    }
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
   * <header data-rg-inc="/html/header.html @@ outer @@ b:nth-child(2)"></header>
   * @param {Document|DocumentFragment|HTMLElement} domObj - the whole document or html string
   * @returns {void}
   */
  async rgInc(domObj) {
    const elems = domObj.querySelectorAll('[data-rg-inc]');
    if (!elems.length) { return; }
    debug('rgInc', '--------- rgInc ------', '#8B0892', '#EDA1F1');

    for (const elem of elems) {
      // extract attribute data
      const attrValue = elem.getAttribute('data-rg-inc');
      const path_act_cssSel = attrValue.replace(/\s+/g, '').replace(/^\//, '').split(this.separator); // remove empty spaces and leading /
      const viewPath = !!path_act_cssSel && !!path_act_cssSel.length ? 'inc/' + path_act_cssSel[0] : '';
      const act = !!path_act_cssSel && path_act_cssSel.length >= 2 ? path_act_cssSel[1] : 'inner';
      const cssSel = !!path_act_cssSel && path_act_cssSel.length === 3 ? path_act_cssSel[2] : '';
      if(debug().rgInc) { console.log('path_act_cssSel:: ', viewPath, act, cssSel); }
      if (!viewPath) { return; }

      // Get HTML content. First try from the compiled JSON and if it doesn't exist then request from the server.
      let contentStr = '', contentDOM;
      if (!!viewsCompiled[viewPath]) { // HTML content from the variable
        const cnt = this.fetchCompiledView(viewPath, cssSel);
        // contentStr = cnt.contentStr;
        contentDOM = cnt.contentDOM;
        debug('rgInc', '--from compiled JSON', '#8B0892');
      } else { // HTML content by requesting the server
        const cnt = await this.fetchRemoteView(viewPath, cssSel);
        // contentStr = cnt.contentStr;
        contentDOM = cnt.contentDOM;
        debug('rgInc', '--from server', '#8B0892');
      }


      // convert answer's content from dom object to string
      if (/HTMLDocument|DocumentFragment/.test(contentDOM.constructor.name)) {
        contentDOM.childNodes.forEach(node => {
          // https://developer.mozilla.org/en-US/docs/Web/API/Node/nodeType
          if (node.nodeType === 1) { contentStr += node.outerHTML; }
          else if (node.nodeType === 3){ contentStr += node.data; }
        });
      } else {
        contentStr = contentDOM.outerHTML;
      }


      if(debug().rgInc) {
        console.log('contentDOM.constructor.name', contentDOM.constructor.name);
        console.log('contentStr::', contentStr, '\n');
      }


      // load contentStr into the document
      const el = document.querySelector(`[data-rg-inc="${attrValue}"]`);
      if (act === 'inner') {
        el.innerHTML = contentStr;
      } else if (act === 'outer') {
        el.outerHTML = contentStr;
      } else if (act === 'sibling') {
        const div = document.createElement('div');
        div.innerHTML = contentStr;
        div.setAttribute('data-rg-incsibling', '');
        if (!!elem.nextSibling) { elem.nextSibling.remove(); }
        elem.parentNode.insertBefore(div, elem.nextSibling);
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
    const answer = await this.httpClient.askHTML(url, cssSel);
    const content = answer.res.content;
    if (answer.status !== 200 || !content) { throw new Error(`Status isn't 200 or content is empty for ${viewPath}`); }

    // convert answer's content from dom object to string
    const contentStr = answer.res.content.str; // string
    const contentDOM = answer.res.content.dom; // DocumentFragment | HTMLElement|HTMLButtonElement...

    return {contentStr, contentDOM};
  }




}




module.exports = View;
