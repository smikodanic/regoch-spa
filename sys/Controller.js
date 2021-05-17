const Page = require('./Page');


class Controller extends Page {

  constructor() {
    super();

    this.debugOpts = {
      // Controller.js
      render: false,

      // Page.js
      loadInc: false,
      loadView: false,
      emptyView: false,
      loadHead: false,
      rgLazyjs: false,

      // DataRg.js
      rgFor: false,
      rgRepeat: false,
      rgPrint: false,

      rgIf: false,
      rgSwitch: false,
      rgDisabled: false,
      rgValue: false,
      rgClass: false,
      rgStyle: false,
      rgSrc: false,
      rgElem: false,
      rgEcho: false,
      rgFlicker: false,

      // DataRgListeners.js
      rgKILL: false,
      rgHref: false,
      rgClick: false,
      rgKeyup: false,
      rgChange: false,
      rgEvt: false,
      rgSet: false,
      rgBind: false
    };
  }


  /************* LIFECYCLE HOOK METHODS ***********/
  /**
   * Load the page views, includes, lazy loads, etc... Use "Page" methods here.
   * @param {object} trx - regoch router transitional variable
   * @returns {Promise<void>}
   */
  async loader(trx) {}

  /**
   * Init the controller properties (set initial values).
   * @param {object} trx - regoch router transitional variable
   * @returns {Promise<void>}
   */
  async init(trx) {}

  /**
   * Render data-rg- elements.
   * @param {object} trx - regoch router transitional variable
   * @returns {Promise<void>}
   */
  async rend(trx) { await this.render(); }

  /**
   * Execute after rend.
   * @param {object} trx - regoch router transitional variable
   * @returns {Promise<void>}
   */
  async postrend(trx) {}

  /**
   * Destroy the controller when the data-rg-href element is clicked (see parse.href()).
   * - removes all data-rg-... element lsiteners
   * @param {Event} pevent - popstate or pushstate event which caused URL change
   * @returns {Promise<void>}
   */
  async destroy(pevent) {}


  /**
   * Main router middleware.
   * @param {object} trx - regoch router transitional variable (defined in router.js -> _testRoutes())
   * @returns {Promise<void>}
   */
  async processing(trx) {
    await this.loader(trx);
    this.rgFlicker(false);
    await this.init(trx);
    await this.rend(trx);
    await this.postrend(trx);
    this.rgFlicker(true);
  }




  /************ RENDER METHODS ***********/

  /**
   * Render DataRg generators.
   * @param {string} controllerProp - controller property name
   */
  renderGens(controllerProp) {
    this.rgFor(controllerProp);
    this.rgRepeat(controllerProp);
    this.rgPrint(controllerProp);
  }


  /**
   * Render DataRg non-generators.
   * @param {string} controllerProp - controller property name
   */
  renderNonGens(controllerProp) {
    this.rgIf(controllerProp);
    this.rgSwitch(controllerProp);
    this.rgDisabled(controllerProp);
    this.rgValue(controllerProp);
    this.rgClass(controllerProp);
    this.rgStyle(controllerProp);
    this.rgSrc(controllerProp);
    this.rgElem();
    this.rgEcho();
  }


  /**
   * Render DataRgListeners.
   */
  async renderLsns() {
    await this.rgKILL(); // remove all listeners first
    this.rgHref();
    this.rgClick();
    this.rgKeyup();
    this.rgChange();
    this.rgEvt();
    this.rgSet();
    this.rgBind();
  }


  /**
   * Render the view i.e. the data-rg- elements with the controllerProp.
   * For example: data-rg-print="first_name", where first_name is the controllerProp.
   * @param {string} controllerProp - controller property name. Limit the render process only to the elements with the data-rg-...="controllerProp ..."
   * @param {number} renderDelay - delay in miliseconds
   */
  async render(controllerProp, renderDelay = 0) {
    this._debug('render', `--------- render (start) -- controllerProp: ${controllerProp} -- renderDelay: ${renderDelay} -- ctrl: ${this.constructor.name} ------`, 'green', '#D9FC9B');
    await new Promise(r => setTimeout(r, renderDelay));
    this.renderGens(controllerProp);
    await new Promise(r => setTimeout(r, renderDelay));
    this.renderNonGens(controllerProp);
    await new Promise(r => setTimeout(r, renderDelay));
    await this.renderLsns();
    this._debug('render', `--------- render (end) ------`, 'green', '#D9FC9B');
  }


  /**
   * Use render() method multiple times.
   * @param {string[]} controllerProps - array of the controller property names: ['company.name', 'company.year']
   * @param {number} renderDelay - delay in miliseconds
   */
  async renders(controllerProps = [], renderDelay) {
    for (const controllerProp of controllerProps) { await this.render(controllerProp, renderDelay); }
  }



}

module.exports = Controller;
