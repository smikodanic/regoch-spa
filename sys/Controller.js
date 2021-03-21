const RGparse = require('./RGparse');


class Controller extends RGparse {

  constructor() {
    super();
  }


  /************* CONTROLLER LIFECYCLE HOOKS ***********/
  /**
   * Run before render of the HTML elements with data-rg-... attribute. (see Router.js)
   * @param {object} trx - regoch router transitional variable (defined in Router.js::testRoutes())
   * @returns {Promise<void>}
   */
  async prerender(trx) {}


  /**
   * Render the HTML elements with data-rg-... attribute. (see Router.js)
   * @param {object} trx - regoch router transitional variable (defined in Router.js::testRoutes())
   * @returns {Promise<void>}
   */
  async render(trx) {
    this.rgInc(document); // defined in View.js
    await new Promise(resolve => setTimeout(resolve, 400));

    this.parseListeners();
    this.parseNonListeners();
  }

  async parseListeners() {
    this.rgHref();
    this.rgClick();
    this.rgChange();
    this.rgEvt();
    this.rgSet();
  }

  async parseNonListeners() {
    this.rgPrint();
    this.rgClass();
    this.rgStyle();
    this.rgIf();
    this.rgSwitch();
    this.rgFor();
    this.rgRepeat();
    this.rgElem();
  }


  /**
   * Run after render of the HTML elements with data-rg-... attribute. (see Router.js)
   * @param {object} trx - regoch router transitional variable (defined in Router.js::testRoutes())
   * @returns {Promise<void>}
   */
  async postrender(trx) {}


  /**
   * Init the controller. This is where controller logic starts. (see Router.js)
   * @param {object} trx - regoch router transitional variable (defined in Router.js::testRoutes())
   * @returns {Promise<void>}
   */
  async init(trx) {}


  /**
   * Destroy the controller when the data-rg-href element is clicked (see parse.href()).
   * - remove all data-rg-... element lsiteners
   * * @param {HTMLElement} elem - element with data-rg-href which caused controller destruction
   * * @param {Event} event - event (usually click) which was applied on the elem and cause controller destruction
   * @returns {Promise<void>}
   */
  async destroy(elem, event) {}





  /********** MISC **********/
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


}

module.exports = Controller;
