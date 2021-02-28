const fs = require('fs');
const HTTPClient = require('./HTTPClient');



class Sys {

  constructor(app) {
    this.app = app;
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
   * Include HTML components with the data-rgInc attribute.
   */
  rgInc_bak() {

    const f = $(document).find('[data-rgInc]');

    $('[data-rgInc]').each((ind, elem) => {

      const htmlFileName = $(elem).attr('data-rgInc');
      $(`[data-rgInc="${htmlFileName}"]`).load(htmlFileName, (responseText, textStatus,  jqXHR) => {
        console.log( 'After load parser...' );
        // console.log(textStatus, responseText, jqXHR);
        const parsed = $.parseHTML(responseText);
        const found = $(parsed).find('[data-rgInc]');
        const htmlFileName2 = $(found).attr('data-rgInc');
        if (!!htmlFileName2) { $(`[data-rgInc="${htmlFileName2}"]`).load(htmlFileName2, function () {

        }); }
      });

    });
  }


  /**
   * Include HTML components with the data-rgInc attribute.
   * @param {Document|string} htm - the whole document or html string
   */
  rgInc(htm) {
    let found;
    if (htm instanceof Document) {
      found = $(document).find('[data-rgInc]');
    } else {
      const parsed = $.parseHTML(htm);
      found = $(parsed).find('[data-rgInc]');
    }
    if (!found.length) { return; }

    $(found).each((ind, elem) => {
      const htmlFileName = $(elem).attr('data-rgInc');
      $(`[data-rgInc="${htmlFileName}"]`).load(htmlFileName, (responseText, textStatus,  jqXHR) => {
        // console.log('responseText::', responseText);
        // const parsed2 = $.parseHTML(responseText);
        // console.log('parsed2::', parsed2);
        // const found2 = $(parsed2).find('[data-rgInc]');

        const domparser = new DOMParser();
        const doc = domparser.parseFromString(responseText, 'text/html');
        const found2 = doc.querySelector('[data-rginc]');
        if (!!found2) { this.rgInc(responseText); }
      });
    });

  }


  /**
   * Click listener
   */
  rgClick() {
    const elems = document.querySelectorAll('[data-rgClick]');
    for (const elem of elems) {
      const funcDef = elem.getAttribute('data-rgClick').trim(); // string 'fja(x, y, ...arr)'
      const matched = funcDef.match(/^(.+)\((.*)\)$/);
      const funcName = matched[1];
      const funcParams = matched[2].split(',').map(p => p.trim());
      elem.addEventListener('click', event => {
        console.log('clicked ', event.target.localName);
        this.app[funcName](...funcParams);
      });
    }
  }




  readModuleFile(path) {
    try {
      // const filename = require.resolve(path);
      return fs.readFileSync(path, 'utf8');
    } catch (e) {
      console.error(e);
    }
  }




}





module.exports = Sys;
