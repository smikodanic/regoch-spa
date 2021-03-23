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
   * Notice: When 'sibling', 'prepend' and 'append' is used comment and text nodes will not be injected (only HTML elements).
   * @param {string} viewName - view name
   * @param {string} viewPath - view file path (relative to /view/ directory): '/some/file.html' is '/view/some/file.html'
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
    let nodes, str;
    if (!!viewsCompiled[viewPath]) { // HTML content from the compiled file /dist/views/compiled.json
      const cnt = this.fetchCompiledView(viewPath, cssSel);
      nodes = cnt.nodes;
      str = cnt.str;
      debug('loadView', '--from compiled JSON', '#8B0892');
    } else { // HTML content by requesting the server
      const cnt = await this.fetchRemoteView(viewPath, cssSel);
      nodes = cnt.nodes;
      str = cnt.str;
      debug('loadView', '--from server', '#8B0892');
    }


    if(debug().loadView) { console.log('nodes::', nodes); }
    if(debug().loadView) { console.log('str::', str); }


    // load content in the element
    if (dest === 'inner') {
      elem.innerHTML = str;
    } else if (dest === 'outer') {
      elem.outerHTML = str;
    } else if (dest === 'sibling') {
      // remove all previous data-rg-viewgen elements
      this.emptyView(viewName, dest);

      // add new elements as siblings to the data-rg-view elem
      const parent = elem.parentNode;
      const sibling = elem.nextSibling;
      for (const node of nodes) {
        const nodeCloned = node.cloneNode(true); // clone the node because inserBefore will delete it
        if (nodeCloned.nodeType === 1) {
          nodeCloned.setAttribute('data-rg-viewgen', viewName); // add attribute data-rg-viewgen to mark generated nodes
          parent.insertBefore(nodeCloned, sibling);
        }
      }

    } else if (dest === 'prepend') {
      // remove all previous data-rg-viewgen elements
      this.emptyView(viewName, dest);

      // prepend new elements to the data-rg-view elem
      const i = nodes.length;
      for (let i = nodes.length - 1; i >= 0; i--) {
        const nodeCloned = nodes[i].cloneNode(true);
        if (nodeCloned.nodeType === 1) {
          nodeCloned.setAttribute('data-rg-viewgen', viewName); // add attribute data-rg-viewgen to mark generated nodes
          elem.prepend(nodeCloned);
        }
      }

    } else if (dest === 'append') {
      // remove all previous data-rg-viewgen elements
      this.emptyView(viewName, dest);

      // append new elements to the data-rg-view elem
      for (const node of nodes) {
        const nodeCloned = node.cloneNode(true);
        if (nodeCloned.nodeType === 1) {
          nodeCloned.setAttribute('data-rg-viewgen', viewName); // add attribute data-rg-viewgen to mark generated nodes
          elem.append(nodeCloned);
        }
      }
    } else {
      elem.innerHTML = str;
    }

    return {elem, str, nodes, document};
  }



  /**
   * Define multiple views.
   * TIP: When using isAsync=false compile views in the regoch.json.
   * @param {any[][]} viewDefs - array of arrays: [[viewName, viewPath, dest, cssSel]]
   * @param {boolean} isAsync - to load asynchronously one by one
   * @returns {void}
   */
  async loadViews(viewDefs, isAsync) {
    for(const viewDef of viewDefs) {
      const viewName = viewDef[0];
      const viewPath = viewDef[1];
      const dest = viewDef[2];
      const cssSel = viewDef[3];
      !!isAsync ? await this.loadView(viewName, viewPath, dest, cssSel) : this.loadView(viewName, viewPath, dest, cssSel);
    }
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
      for (const genElem of document.querySelectorAll(`[data-rg-viewgen="${viewName}"`)) {
        genElem.remove();
      }
    } else if (dest === 'prepend') {
      for (const genElem of document.querySelectorAll(`[data-rg-viewgen="${viewName}"`)) {
        genElem.remove();
      }
    } else if (dest === 'append') {
      for (const genElem of document.querySelectorAll(`[data-rg-viewgen="${viewName}"`)) {
        genElem.remove();
      }
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
   * @returns {void}
   */
  async rgInc() {
    const elems = document.querySelectorAll('[data-rg-inc]');
    if (!elems.length) { return; }
    debug('rgInc', '--------- rgInc ------', '#8B0892', '#EDA1F1');

    for (const elem of elems) {
      // extract attribute data
      const attrValue = elem.getAttribute('data-rg-inc');
      const path_dest_cssSel = attrValue.replace(/\s+/g, '').replace(/^\//, '').split(this.separator); // remove empty spaces and leading /
      const viewPath = !!path_dest_cssSel && !!path_dest_cssSel.length ? 'inc/' + path_dest_cssSel[0] : '';
      const dest = !!path_dest_cssSel && path_dest_cssSel.length >= 2 ? path_dest_cssSel[1] : 'inner';
      const cssSel = !!path_dest_cssSel && path_dest_cssSel.length === 3 ? path_dest_cssSel[2] : '';
      if(debug().rgInc) { console.log('path_dest_cssSel:: ', viewPath, dest, cssSel); }
      if (!viewPath) { return; }

      // Get HTML content. First try from the compiled JSON and if it doesn't exist then request from the server.
      let nodes, str;
      if (!!viewsCompiled[viewPath]) { // HTML content from the compiled file /dist/views/compiled.json
        const cnt = this.fetchCompiledView(viewPath, cssSel);
        nodes = cnt.nodes;
        str = cnt.str;
        debug('rgInc', '--from compiled JSON', '#8B0892');
      } else { // HTML content by requesting the server
        const cnt = await this.fetchRemoteView(viewPath, cssSel);
        nodes = cnt.nodes;
        str = cnt.str;
        debug('rgInc', '--from server', '#8B0892');
      }


      if(debug().rgInc) { console.log('str::', str, '\n'); }


      // load content in the element
      if (dest === 'inner') {
        elem.innerHTML = str;
      } else if (dest === 'outer') {
        elem.outerHTML = str;
      } else if (dest === 'sibling') {
      // remove all previous data-rg-viewgen elements
        // this.emptyView(viewName, dest);

        // add new elements as siblings to the data-rg-view elem
        const parent = elem.parentNode;
        const sibling = elem.nextSibling;
        for (const node of nodes) {
          const nodeCloned = node.cloneNode(true); // clone the node because inserBefore will delete it
          if (nodeCloned.nodeType === 1) {
            // nodeCloned.setAttribute('data-rg-viewgen', viewName); // add attribute data-rg-viewgen to mark generated nodes
            parent.insertBefore(nodeCloned, sibling);
          }
        }

      } else if (dest === 'prepend') {
      // remove all previous data-rg-viewgen elements
        // this.emptyView(viewName, dest);

        // prepend new elements to the data-rg-view elem
        const i = nodes.length;
        for (let i = nodes.length - 1; i >= 0; i--) {
          const nodeCloned = nodes[i].cloneNode(true);
          if (nodeCloned.nodeType === 1) {
            // nodeCloned.setAttribute('data-rg-viewgen', viewName); // add attribute data-rg-viewgen to mark generated nodes
            elem.prepend(nodeCloned);
          }
        }

      } else if (dest === 'append') {
      // remove all previous data-rg-viewgen elements
        // this.emptyView(viewName, dest);

        // append new elements to the data-rg-view elem
        for (const node of nodes) {
          const nodeCloned = node.cloneNode(true);
          if (nodeCloned.nodeType === 1) {
            // nodeCloned.setAttribute('data-rg-viewgen', viewName); // add attribute data-rg-viewgen to mark generated nodes
            elem.append(nodeCloned);
          }
        }
      } else {
        elem.innerHTML = str;
      }


      // continue to parse
      // if (/data-rg-inc/.test(contentStr)) {
      //   this.rgInc(contentDOM);
      // }

    }

  }



  /**
   * Fetch view from a compiled file (../app/dist/views/compiled.json).
   * @param {string} viewPath - view file path (relative to /view directory): '/some/file.html'
   * @param {string} cssSel - CSS selector to load part of the view file: 'div > p.bolded'
   * @returns {object}
   */
  fetchCompiledView(viewPath, cssSel) {
    // convert HTML string to Document
    const parser = new DOMParser();
    const doc = parser.parseFromString(viewsCompiled[viewPath], 'text/html');

    // define nodes and string
    let nodes; // array of DOM nodes (Node[])
    let str; // HTML content as string (string)
    if (!cssSel) {
      nodes = doc.body.childNodes;
      str = viewsCompiled[viewPath];
    } else {
      const elem = doc.querySelector(cssSel);
      nodes = [elem];
      str = !!elem ? elem.outerHTML : '';
    }

    return {nodes, str};
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

    const nodes = answer.res.content.nodes; // Node[]
    const str = answer.res.content.str; // string

    return {nodes, str};
  }




}




module.exports = View;
