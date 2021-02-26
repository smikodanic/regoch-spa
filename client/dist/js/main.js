(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
const fs = require('fs');



class RegochSPA {

  constructor() {
    console.log('tooo');
    this.inclusions();
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
   * Include HTML files
   */
  inclusions() {
    console.log('inclusions');
    // find data-regoch-include elements
    // $('[data-regoch-include]').each(index => {
    //   console.log('include file:', $(this).attr('data-regoch-include'));
    // });
    const elems = document.querySelectorAll('[data-regoch-include]');
    for (const elem of elems) {
      const htmlFileName = elem.getAttribute('data-regoch-include');
      $(`[data-regoch-include="${htmlFileName}"]`).load(htmlFileName);
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





window.RegochSPA = RegochSPA;

},{"fs":2}],2:[function(require,module,exports){

},{}]},{},[1]);

//# sourceMappingURL=main.js.map
