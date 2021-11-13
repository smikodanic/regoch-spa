const Model = require('./Model');
const eventEmitter = require('./lib/eventEmitter');


class Controller extends Model {

  constructor() {
    super();

    this.debugOpts = {
      // Controller.js
      render: false,
      autorender: false,
      model: false,

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
      rgPrintMustache: false,


      rgIf: false,
      rgSwitch: false,
      rgDisabled: false,
      rgValue: false,
      rgChecked: false,
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
  async loader(trx) { }

  /**
   * Init the controller properties (set initial values).
   * @param {object} trx - regoch router transitional variable
   * @returns {Promise<void>}
   */
  async init(trx) { }

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
  async postrend(trx) { }

  /**
   * Destroy the controller when the data-rg-href element is clicked (see parse.href()).
   * - removes all data-rg-... element lsiteners
   * @param {Event} pevent - popstate or pushstate event which caused URL change
   * @returns {Promise<void>}
   */
  async destroy(pevent) { }


  /**
   * Main router middleware.
   * @param {object} trx - regoch router transitional variable (defined in router.js -> _testRoutes())
   * @returns {Promise<void>}
   */
  async processing(trx) {
    await this.loader(trx);
    // await this.renderLsns();
    this.rgFlicker(false);
    await this.init(trx);
    await this.rend(trx);
    await this.postrend(trx);
    this.rgFlicker(true);
  }




  /************ RENDER METHODS ***********/

  /**
   * Render DataRg generators.
   * @param {string|RegExp} attrValQuery - query for the attribute value
   */
  renderGens(attrValQuery) {
    this.rgFor(attrValQuery);
    this.rgRepeat(attrValQuery);
    this.rgPrintMustache();
    this.rgPrint(attrValQuery);
  }


  /**
   * Render DataRg non-generators.
   * @param {string|RegExp} attrValQuery - query for the attribute value
   */
  renderNonGens(attrValQuery) {
    this.rgIf(attrValQuery);
    this.rgSwitch(attrValQuery);
    this.rgDisabled(attrValQuery);
    this.rgValue(attrValQuery);
    this.rgChecked(attrValQuery);
    this.rgClass(attrValQuery);
    this.rgStyle(attrValQuery);
    this.rgSrc(attrValQuery);
    this.rgElem(attrValQuery);
    this.rgEcho(attrValQuery);
  }


  /**
   * Render DataRgListeners.
   * @param {string|RegExp} attrValQuery - query for the attribute value
   */
  async renderLsns(attrValQuery) {
    await this.rgKILL(attrValQuery); // remove all listeners first
    this.rgHref(attrValQuery);
    this.rgClick(attrValQuery);
    this.rgKeyup(attrValQuery);
    this.rgChange(attrValQuery);
    this.rgEvt(attrValQuery);
    this.rgSet(attrValQuery);
    this.rgBind(attrValQuery);
  }


  /**
   * Render the view i.e. the data-rg- elements with the attrValQuery.
   * For example: data-rg-print="first_name", where first_name is the controllerProp.
   * @param {string|RegExp} attrValQuery - query for the attribute value
   * @param {number} renderDelay - delay in miliseconds
   */
  async render(attrValQuery, renderDelay = 10) {
    this._debug('render', `--------- render (start) -- attrValQuery: ${attrValQuery} -- renderDelay: ${renderDelay} -- ctrl: ${this.constructor.name} ------`, 'green', '#D9FC9B');
    await new Promise(r => setTimeout(r, renderDelay));
    this.renderGens(attrValQuery);
    await new Promise(r => setTimeout(r, renderDelay));
    this.renderNonGens(attrValQuery);
    await new Promise(r => setTimeout(r, renderDelay));
    await this.renderLsns(attrValQuery);
    await new Promise(r => setTimeout(r, renderDelay));
    eventEmitter.on('autorender', this.autorenderListener.bind(this));
    this._debug('render', `--------- render (end) -- attrValQuery: ${attrValQuery} ------`, 'green', '#D9FC9B');
  }


  /**
   * Use render() method multiple times.
   * @param {string[]|RegExp[]} attrValQuerys - array of the controller property names: ['company.name', /^company\.year/]
   * @param {number} renderDelay - delay in miliseconds
   */
  async renders(attrValQuerys = [], renderDelay) {
    for (const attrValQuery of attrValQuerys) { await this.render(attrValQuery, renderDelay); }
  }



  /**
   * Listener for the autorender event. Autorender will automatically update the controller property in the view.
   * Autorender can be enabled globally with app.autorender(true) or separatelly for every route with route option { autorender: true }
   */
  async autorenderListener(event) {
    const trigger = event.detail.trigger;
    const funcName = event.detail.funcName;
    const funcArgs = event.detail.funcArgs;
    if (this.autorender) {
      this._debug('autorender', `--------- autorender START -- trigger: ${trigger} -- ctrl: ${this.constructor.name} -- ctrl method: ${funcName}(${funcArgs})  ------`, 'olive', '#D9FC9B');
      await this.rend();
      await this.postrend();
      this._debug('autorender', `--------- autorender STOP -- trigger: ${trigger} -- ctrl: ${this.constructor.name} -- ctrl method: ${funcName}(${funcArgs})  ------`, 'olive', '#D9FC9B');
    }
  }



}

module.exports = Controller;
