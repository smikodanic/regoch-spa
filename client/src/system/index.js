const fs = require('fs');



class System {

  constructor(app) {
    this.app = app;
  }


  run() {
    this.inclusions();
    this.clickListeners();
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
   * Include HTML components with the data-regoch-include attribute.
   */
  inclusions() {
    console.log('inclusions');
    const elems = document.querySelectorAll('[data-regoch-include]');
    for (const elem of elems) {
      const htmlFileName = elem.getAttribute('data-regoch-include');
      $(`[data-regoch-include="${htmlFileName}"]`).load(htmlFileName, () => {
        console.log( 'Load was performed.' );
      });
    }
  }


  /**
   * Click listener
   */
  clickListeners() {
    const elems = document.querySelectorAll('[data-regoch-click]');
    for (const elem of elems) {
      const funcDef = elem.getAttribute('data-regoch-click').trim(); // string 'fja(x, y, ...arr)'
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





module.exports = System;
