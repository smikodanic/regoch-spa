class System {

  constructor() {
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



}





module.exports = System;
