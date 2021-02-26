const fs = require('fs');



class RegochSPA2 {

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





window.RegochSPA = RegochSPA2;
