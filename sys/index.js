const fs = require('fs');



class Sys {

  constructor(app) {
    this.app = app;
  }


  run() {
    this.rgInc();
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
  rgInc() {
    console.log('inclusions');
    const elems = document.querySelectorAll('[data-rgInc]');
    for (const elem of elems) {
      const htmlFileName = elem.getAttribute('data-rgInc');
      $(`[data-rgInc="${htmlFileName}"]`).load(htmlFileName, (responseText, textStatus,  jqXHR) => {
        console.log( 'Load was performed.' );
        console.log(textStatus, responseText);
      });
    }
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
