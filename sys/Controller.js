const Parse = require('./Parse');


class Controller extends Parse {

  constructor() {
    super();
  }


  /************* CONTROLLER LIFECYCLE HOOKS ***********/
  /**
   * Render the HTML elements with data-rg-... attribute. (see Router.js)
   * @param {object} trx - regoch router transitional variable (defined in Router.js::testRoutes())
   * @returns {Promise<void>}
   */
  async render(trx) {
    if (!!this.onRender) { await this.onRender(trx); }
    this.rgClick();
    this.rgHref();
    this.rgClass();
    this.rgStyle();
  }


  /**
   * Init the controller. This is where controller logic starts. (see Router.js)
   * @param {object} trx - regoch router transitional variable (defined in Router.js::testRoutes())
   * @returns {Promise<void>}
   */
  async init(trx) {
    if (!!this.onInit) { await this.onInit(trx, this.dataRgs); }
    this.rgFor();
    this.rgRepeat();
    this.rgSet();
    this.rgIf();
    this.rgPrint();
    this.rgSwitch();
  }


  /**
   * Destroy the controller when the data-rg-href element is clicked (see parse.href()).
   * - remove all data-rg-... element lsiteners
   * * @param {HTMLElement} elem - element with data-rg-href which caused controller destruction
   * * @param {Event} event - event (usually click) which was applied on the elem and cause controller destruction
   * @returns {Promise<void>}
   */
  async destroy(elem, event) {
    if (!!this.onDestroy) { this.onDestroy(elem, event, this.dataRgs); }
  }


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
