const DataRg = require('./DataRg');
const viewsCompiled = require('../app/dist/views/compiled.json');
const HTTPClient = require('./lib/HTTPClient');
const debug = require('./debug');



class Page extends DataRg {

  constructor() {
    super();
    this.baseURIhost = `${window.location.protocol}//${window.location.host}`; // http://localhost:4400

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


  /************** INCLUDES ****************/
  /**
   * Include HTML components with the data-rg-inc attribute.
   * Process:
   * 1) Select all elements which has data-rg-inc but not data-rg-cin.
   * 2) Put data-rg-cin which marks that the data-rg-inc element has beed parsed.
   * 3) Load the content in the data-rg-inc element as inner, outer, sibling, append or prepend. Every loaded element will have data-rg-incgen attribute to mark elements generated with data-rg.inc.
   * 4) Add data-rg-cin attribute to the element with the data-rg-inc to mark that the content is loaded and prevent load in the next iteration.
   * ) Multiple iterations will haeppen when data-rg-inc elements are nested. In case of multiple iterations only in the first iteration will be deleted all data-rg-incgen elements to make reset.
   * Examples:
   * <header data-rg-inc="/html/header.html">---header---</header>
   * <header data-rg-inc="/html/header.html @@  @@ h2 > small">---header---</header>
   * <header data-rg-inc="/html/header.html @@ inner">---header---</header>
   * <header data-rg-inc="/html/header.html @@ prepend">---header---</header>
   * <header data-rg-inc="/html/header.html @@ append">---header---</header>
   * <header data-rg-inc="/html/header.html @@ outer @@ h2 > small">---header---</header>
   * <header data-rg-inc="/html/header.html @@ outer @@ b:nth-child(2)"></header>
   * @param {boolean} delIncgens - delete data-rg-incgen elements (only in the first iteration)
   * @returns {void}
   */
  async loadInc(delIncgens = true) {
    const elems = document.querySelectorAll('[data-rg-inc]:not([data-rg-cin])');
    debug('loadInc', '--------- loadInc ------', '#8B0892', '#EDA1F1');
    debug('loadInc', `elems found: ${elems.length}`, '#8B0892');
    if (!elems.length) { return; }

    // remove all data-rg-incgen elements (just first iteration)
    if (delIncgens) {
      const elems2 = document.querySelectorAll('[data-rg-incgen]');
      debug('loadInc', `data-rg-incgen elems deleted: ${elems2.length}`, '#8B0892');
      for (const elem2 of elems2) { elem2.remove(); }
    }

    for (const elem of elems) {
      // extract attribute data
      const attrValue = elem.getAttribute('data-rg-inc');
      const path_dest_cssSel = attrValue.replace(/\s+/g, '').replace(/^\//, '').split(this.separator); // remove empty spaces and leading /
      const viewPath = !!path_dest_cssSel && !!path_dest_cssSel.length ? 'inc/' + path_dest_cssSel[0] : '';
      const dest = !!path_dest_cssSel && path_dest_cssSel.length >= 2 ? path_dest_cssSel[1] : 'inner';
      const cssSel = !!path_dest_cssSel && path_dest_cssSel.length === 3 ? path_dest_cssSel[2] : '';
      if(debug().loadInc) { console.log('path_dest_cssSel:: ', viewPath, dest, cssSel); }
      if (!viewPath) { console.error('viewPath is not defined'); return; }

      // Get HTML content. First try from the compiled JSON and if it doesn't exist then request from the server.
      let nodes, str;
      if (!!viewsCompiled[viewPath]) { // HTML content from the compiled file /dist/views/compiled.json
        const cnt = this.fetchCompiledView(viewPath, cssSel);
        nodes = cnt.nodes;
        str = cnt.str;
        debug('loadInc', '--from compiled JSON', '#8B0892');
      } else { // HTML content by requesting the server
        const cnt = await this.fetchRemoteView(viewPath, cssSel);
        nodes = cnt.nodes;
        str = cnt.str;
        debug('loadInc', '--from server', '#8B0892');
      }

      if(debug().loadInc) {
        console.log('elem::', elem);
        console.log('str::', str, '\n\n');
      }


      // load content in the element
      if (dest === 'inner') {
        elem.innerHTML = str;

      } else if (dest === 'outer') {
        elem.outerHTML = str;

      } else if (dest === 'sibling') {
        const parent = elem.parentNode;
        const sibling = elem.nextSibling;
        for (const node of nodes) {
          if (!node) { return; }
          const nodeCloned = node.cloneNode(true); // clone the node because inserBefore will delete it
          if (nodeCloned.nodeType === 1) {
            nodeCloned.setAttribute('data-rg-incgen', ''); // add attribute data-rg-incgen to mark generated nodes
            if (!elem.hasAttribute('data-rg-cin')) { parent.insertBefore(nodeCloned, sibling); }
          }
        }

      } else if (dest === 'prepend') {
        const i = nodes.length;
        for (let i = nodes.length - 1; i >= 0; i--) {
          if (!!nodes.length && !nodes[i]) { return; }
          const nodeCloned = nodes[i].cloneNode(true);
          if (nodeCloned.nodeType === 1) {
            nodeCloned.setAttribute('data-rg-incgen', '');
            if (!elem.hasAttribute('data-rg-cin')) { elem.prepend(nodeCloned); }
          }
        }

      } else if (dest === 'append') {
        for (const node of nodes) {
          if (!node) { return; }
          const nodeCloned = node.cloneNode(true);
          if (nodeCloned.nodeType === 1) {
            nodeCloned.setAttribute('data-rg-incgen', '');
            if (!elem.hasAttribute('data-rg-cin')) { elem.append(nodeCloned); }
          }
        }

      }


      // set "data-rg-cin" attribute which marks that the content is included in the data-rg-inc element and parse process is finished
      elem.setAttribute('data-rg-cin', '');


      // continue with the next parse iteration (when data-rg-inc elements are nested)
      if (/data-rg-inc/.test(str)) { await this.loadInc(false); }

    }

  }


  /************** VIEWS ****************/
  /**
   * Parse elements with the data-rg-view attribute and load router views.
   * This method should be used in the controller.
   * When 'sibling', 'prepend' and 'append' is used comment and text nodes will not be injected (only HTML elements (nodeType === 1)).
   * Example: <main data-rg-view="#main"></main> and in the controller await this.loadView('#sibling', 'pages/home/sibling.html', 'sibling');
   * @param {string} viewName - view name, for example: '#home'
   * @param {string} viewPath - view file path (relative to /view/ directory): 'pages/home/main.html'
   * @param {string} dest - destination where to place the view: inner, outer, sibling, prepend, append
   * @param {string} cssSel - CSS selector to load part of the view file: 'div > p.bolded:nth-child(2)'
   * @returns {elem:Element, str:string, nodes:Node[]}
   */
  async loadView(viewName, viewPath, dest = 'inner', cssSel) {
    const attrSel = `[data-rg-view="${viewName}"]`;

    // get a HTML element with data-rg-view attribute
    const elem = document.querySelector(attrSel);
    debug('loadView', `--------- loadView ${attrSel} -- ${viewPath} ---------`, '#8B0892', '#EDA1F1');
    if(debug().loadView) { console.log('elem::', elem); }
    if (!elem) { throw new Error(`Element ${attrSel} not found.`); }
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


    // empty content from the element by removing the data-rg-viewgen elements
    this.emptyView(viewName, dest);


    // load content in the element
    if (dest === 'inner') {
      elem.innerHTML = str;

    } else if (dest === 'outer') {
      elem.outerHTML = str;

    } else if (dest === 'sibling') {
      const parent = elem.parentNode;
      const sibling = elem.nextSibling;
      for (const node of nodes) {
        const nodeCloned = node.cloneNode(true); // clone the node because insertBefore will delete it
        if (nodeCloned.nodeType === 1) {
          nodeCloned.setAttribute('data-rg-viewgen', viewName); // mark generated nodes
          parent.insertBefore(nodeCloned, sibling);
        }
      }

    } else if (dest === 'prepend') {
      const i = nodes.length;
      for (let i = nodes.length - 1; i >= 0; i--) {
        const nodeCloned = nodes[i].cloneNode(true);
        if (nodeCloned.nodeType === 1) {
          nodeCloned.setAttribute('data-rg-viewgen', viewName);
          elem.prepend(nodeCloned);
        }
      }

    } else if (dest === 'append') {
      for (const node of nodes) {
        const nodeCloned = node.cloneNode(true);
        if (nodeCloned.nodeType === 1) {
          nodeCloned.setAttribute('data-rg-viewgen', viewName);
          elem.append(nodeCloned);
        }
      }

    }

    return {elem, str, nodes};
  }



  /**
   * Load multiple views.
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
   * Empty a view.
   * @param {string} viewName - view name
   * @param {string} dest - destination where the view was placed: inner, outer, sibling, prepend, append
   * @returns {void}
   */
  emptyView(viewName, dest = 'inner') {
    const attrSel = `[data-rg-view="${viewName}"]`;
    const elem = document.querySelector(attrSel);
    debug('emptyView', `--------- emptyView ${attrSel} | ${dest} ---------`, '#8B0892', '#EDA1F1');
    if(debug().emptyView) { console.log('elem::', elem); }
    if (!elem) { return; }

    // empty the interpolated content
    if (dest === 'inner') {
      elem.innerHTML = '';
    } else if (dest === 'outer') {
      elem.outerHTML = '';
    } else if (dest === 'sibling') {
      for (const genElem of document.querySelectorAll(`[data-rg-viewgen="${viewName}"`)) { genElem.remove(); }
    } else if (dest === 'prepend') {
      for (const genElem of document.querySelectorAll(`[data-rg-viewgen="${viewName}"`)) { genElem.remove(); }
    } else if (dest === 'append') {
      for (const genElem of document.querySelectorAll(`[data-rg-viewgen="${viewName}"`)) { genElem.remove(); }
    }

  }




  /*************** HTML CONTENT FETCHERS *****************/
  /**
   * Fetch view from a compiled file (../app/dist/views/compiled.json).
   * @param {string} viewPath - view file path (relative to /view/ directory): 'pages/home/main.html'
   * @param {string} cssSel - CSS selector to load part of the view file: 'div > p.bolded:nth-child(2)'
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
      nodes = /\<title|\<meta|\<link\<base/.test(viewsCompiled[viewPath]) ? doc.head.childNodes : doc.body.childNodes;
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
   * @param {string} viewPath - view file path (relative to /view/ directory): 'pages/home/main.html'
   * @param {string} cssSel - CSS selector to load part of the view file: 'div > p.bolded:nth-child(2)'
   * @returns {object}
   */
  async fetchRemoteView(viewPath, cssSel) {
    const path = `/views/${viewPath}`; // /views/pages/home/main.html
    const url = new URL(path, this.baseURIhost).toString(); // resolve the URL
    const answer = await this.httpClient.askHTML(url, cssSel);
    const content = answer.res.content;
    if (answer.status !== 200 || !content) { throw new Error(`Status isn't 200 or content is empty for ${viewPath}`); }

    const nodes = answer.res.content.nodes; // Node[]
    const str = answer.res.content.str; // string

    return {nodes, str};
  }



  /************ JS LOADERS *********/
  /**
   * Create <script> tags and execute js scripts.
   * @param {string[]} urls - array of JS script URLs
   */
  lazyJS(urls) {
    for (const url of urls) {
      const script = document.createElement('script');
      script.type = 'text/javascript';
      script.src = url;
      script.defer = true;
      script.setAttribute('data-rg-lazy', '');
      document.body.appendChild(script);
    }
  }


  /**
   * Remove SCRIPT tags with the data-rg-lazy attribute.
   */
  unlazyJS() {
    const elems = document.querySelectorAll(`script[data-rg-lazy]`) || [];
    for (const elem of elems) {
      if (!!elem) { elem.remove(); }
    }
  }


  /**
   * Do not create <script> tags, just load js scripts.
   * This can work only for local files due to CORS.
   * @param {string[]} urls - array of JS script URLs
   */
  async loadJS(urls) {
    for (let url of urls) {
      // correct the URL
      url = url.trim();
      if (!/^http/.test(url)) {
        url = new URL(url, this.baseURIhost).toString(); // resolve the URL
      }

      const jsContents = [];
      const answer = await this.hc.askJS(url);
      jsContents.push(answer.res.content);
      for (const jsContent of jsContents) { eval(jsContent); }
    }
  }




  /************ CSS LOADERS *********/
  /**
   * Create <link rel="stylesheet"> tags and load CSS.
   * Usually use it in the prerender() controller hook.
   * @param {string[]} urls - array of CSS file URLs
   */
  loadCSS(urls) {
    for (const url of urls) {
      const linkCSS = document.createElement('link');
      linkCSS.setAttribute('rel', 'stylesheet');
      linkCSS.setAttribute('href', url);
      linkCSS.defer = true;
      document.head.appendChild(linkCSS);
    }
  }

  /**
   * Remove <link rel="stylesheet"> tags and unload CSS.
   * Usually use it in the prerender() controller hook.
   * @param {string[]} urls - array of CSS file URLs
   */
  unloadCSS(urls) {
    for (const url of urls) {
      const linkCSS = document.head.querySelector(`link[rel="stylesheet"][href="${url}"]`);
      if (!!linkCSS) { linkCSS.remove(); }
    }
  }

  /**
   * Append <style data-rg-ref="#reference"></style> tags in the <head>.
   * Usually use it in the prerender() controller hook.
   * @param {string} cssRules - CSS rules, for example: div {font-weight: bold; color:red;}
   * @param {string} ref - reference
   */
  addCSS(cssRules, ref) {
    const style = document.createElement('style');
    style.textContent = cssRules;
    style.setAttribute('type', 'text/css');
    style.setAttribute('data-rg-ref', ref);
    document.head.appendChild(style);
  }

  /**
   * Remove <style data-rg-ref="#reference"></style> tag.
   * Usually use it in the destroy() controller hook.
   * @param {string} ref - reference
   */
  delCSS(ref) {
    const style = document.createElement(`style[data-rg-ref="${ref}"]`);
    if (!!style) { style.remove(); }
  }




  /*************** PAGE HEAD *************/
  /**
   * Set the text in the <title> tag.
   * @param {string} title
   */
  setTitle(title) {
    document.title = title;
  }

  /**
   * Set the page description.
   * @param {string} desc
   */
  setDescription(desc) {
    const elem = document.head.querySelector('meta[name="description"]');
    if (!elem) { throw new Error('The meta[name="description"] tag is not placed in the HTML file.'); }
    elem.setAttribute('content', desc);
  }

  /**
   * Set the page keywords.
   * @param {string} kys - for example: 'regoch, app, database'
   */
  setKeywords(kys) {
    const elem = document.head.querySelector('meta[name="keywords"]');
    if (!elem) { throw new Error('The meta[name="keywords"] tag is not placed in the HTML file.'); }
    elem.setAttribute('content', kys);
  }


  /**
   * Set the document language.
   * @param {string} langCode - 'en' | 'hr' | 'de' | ...
   */
  setLang(langCode) {
    const elem = document.querySelector('html');
    elem.setAttribute('lang', langCode);
  }


  /**
   * Load the <head> tag content from the view file.
   * @param {string} viewPath - view file path (relative to /view/ directory): 'pages/home/head.html'
   * @param {string} dest - destination where to place the view: inner, prepend, append
   */
  async loadHead(viewPath, dest = 'inner') {
    // get the <head> HTML element
    const elem = document.querySelector('head');
    debug('loadHead', `--------- loadHead -- ${viewPath} ---------`, '#8B0892', '#EDA1F1');
    if(debug().loadView) { console.log('elem::', elem); }
    if (!elem) { throw new Error(`Element HEAD not found.`); }
    if (!viewPath){ throw new Error(`View path is not defined.`); }

    // Get HTML content. First try from the compiled JSON and if it doesn't exist then request from the server.
    let nodes, str;
    if (!!viewsCompiled[viewPath]) { // HTML content from the compiled file /dist/views/compiled.json
      const cnt = this.fetchCompiledView(viewPath);
      nodes = cnt.nodes;
      str = cnt.str;
      debug('loadHead', '--from compiled JSON', '#8B0892');
    } else { // HTML content by requesting the server
      const cnt = await this.fetchRemoteView(viewPath);
      nodes = cnt.nodes;
      str = cnt.str;
      debug('loadHead', '--from server', '#8B0892');
    }

    if(debug().loadHead) { console.log('nodes::', nodes); }
    if(debug().loadHead) { console.log('str::', str); }


    // remove previously generated elements, i.e. elements with the data-rg-headgen attribute
    for (const genElem of document.querySelectorAll(`[data-rg-headgen`)) { genElem.remove(); }


    // load content in the head
    if (dest === 'inner') {
      elem.innerHTML = str;

    } else if (dest === 'prepend') {
      const i = nodes.length;
      for (let i = nodes.length - 1; i >= 0; i--) {
        const nodeCloned = nodes[i].cloneNode(true);
        if (nodeCloned.nodeType === 1) {
          nodeCloned.setAttribute('data-rg-headgen', '');
          elem.prepend(nodeCloned);
        }
      }

    } else if (dest === 'append') {
      for (const node of nodes) {
        const nodeCloned = node.cloneNode(true);
        if (nodeCloned.nodeType === 1) {
          nodeCloned.setAttribute('data-rg-headgen', '');
          elem.append(nodeCloned);
        }
      }

    }

    return {elem, str, nodes};
  }




}




module.exports = Page;
