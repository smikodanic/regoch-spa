const HTTPClient = require('./HTTPClient');



class Sys {

  constructor(app) {
    this.app = app;
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
    this.hc = new HTTPClient(opts); // hc means dex8 http client
  }



  run() {
    this.rgInc(document);
    this.rgClick();
  }



  isHtmlLoaded() {
    document.addEventListener('DOMContentLoaded', () => {
      console.log('HTML document is loaded.');
      console.log(document.readyState); // loading, interactive, complete
    });
  }

  isLoaded() {
    window.onload = () => {
      console.log('HTML document and CSS, JS, images and other resources are loaded.');
      console.log(document.readyState);
    };
  }

  isUnloaded() {

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
    this.debugger('\n---------------');
    const elems = domObj.querySelectorAll('[data-rg-inc]');

    for (const elem of elems) {
      // extract attribute data
      const attrValue = elem.getAttribute('data-rg-inc');
      const path_act_cssSel = attrValue.replace(/\s+/g, '').split(this.separator);
      const path = !!path_act_cssSel && !!path_act_cssSel.length ? path_act_cssSel[0] : '';
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
      const sel = `[data-rg-inc="${attrValue}"]`;
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
   * @returns {void}
   */
  rgClick() {
    const elems = document.querySelectorAll('[data-rg-click]');
    for (const elem of elems) {
      const funcDef = elem.getAttribute('data-rg-click').trim(); // string 'fja(x, y, ...arr)'
      const matched = funcDef.match(/^(.+)\((.*)\)$/);
      const funcName = matched[1];
      const funcParams = matched[2].split(',').map(p => p.trim());
      elem.addEventListener('click', event => {
        console.log('clicked ', event.target.localName);
        this.app[funcName](...funcParams);
      });
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





}





module.exports = Sys;
