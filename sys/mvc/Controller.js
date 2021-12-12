const Model = require('./Model');
const navig = require('../lib/navig');


class Controller extends Model {

  constructor() {
    super();

    /*** all controller variables ***/
    this.debugOpts = {
      // Controller.js
      render: false,
      navig: false,

      // View.js
      rgInc: false,
      loadView: false,
      emptyView: false,
      loadHead: false,
      rgLazyjs: false,

      // DataRg.js
      rgFor: false,
      rgRepeat: false,
      rgPrint: false,

      rgIf: false,
      rgSpinner: false,
      rgSwitch: false,
      rgDisabled: false,
      rgValue: false,
      rgChecked: false,
      rgClass: false,
      rgStyle: false,
      rgSrc: false,
      rgAttr: false,
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
      rgModel: false
    };

    this.$fridge = {}; // fridged properties will not be deleted during controller processing i.e. in the navig.resetPreviousController()
    // this.$model;
    // this.$view;
  }


  /************* LIFECYCLE HOOK METHODS ***********/
  /**
   * Load the page views, includes, lazy loads, etc... Use "View" methods here.
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
  async destroy(trx) { }





  /**
   * Main router middleware.
   * 1) destroy() - execute the destroy() of the previous controller
   * 3) rgKILL() - kill the previous controller event listeners
   * 2)  $model = {} - reset the pevious and current $model
   * @param {object} navig - navigation stages {uri:string, ctrl:Controller}
   * @param {object} trx - regoch router transitional variable (defined in router.js -> _exe())
   * @returns {Promise<void>}
   */
  async processing(trx) {
    // prechecks
    // if (!this.isModelEmpty()) {
    //   this._printError(new Error(`ControllerWarn(${this.constructor.name}):: The $model is set before the loader() method so it runs render() before loader(). The preflight functions and the controller constructor should not contain $model.`));
    //   return;
    // }

    // model processes
    this.emptyModel(); // set $model to empty object
    this.proxifyModel(); // set $model as proxy object

    // navig processes
    navig.setPrevious(); // set previous uri and ctrl
    navig.resetPreviousController(trx); // reset previous controller and execute destroy()
    navig.setCurrent(this); // set the current uri and ctrl
    if (this._debug().navig) { console.log('navig::', navig); }

    // controller processes
    await this.loader(trx);
    await this.rgInc(true);
    this.rgFlicker(false);
    this.rgSetinitial(); // parse data-rg-setinitial
    await this.init(trx);
    await this.rend(trx);
    await this.postrend(trx);
    this.rgFlicker(true);
  }




  /************ RENDER METHODS ***********/
  /**
   * Render the view i.e. the data-rg- elements with the attrValQuery.
   * For example: data-rg-print="first_name", where first_name is the controllerProp.
   * @param {string|RegExp} attrValQuery - query for the attribute value
   * @param {number} renderDelay - delay in miliseconds
   */
  async render(attrValQuery, renderDelay = 5) {
    this._debug('render', `--------- render (start) -- attrValQuery: ${attrValQuery} -- renderDelay: ${renderDelay} -- ctrl: ${this.constructor.name} ------`, 'green', '#D9FC9B');

    // Render DataRg generators.
    this.rgFor(attrValQuery);
    this.rgRepeat(attrValQuery);
    this.rgPrint(attrValQuery);

    await new Promise(r => setTimeout(r, renderDelay));

    // Render DataRg non-generators.
    this.rgIf(attrValQuery);
    this.rgSpinner(attrValQuery);
    this.rgSwitch(attrValQuery);
    this.rgDisabled(attrValQuery);
    this.rgValue(attrValQuery);
    this.rgChecked(attrValQuery);
    this.rgClass(attrValQuery);
    this.rgStyle(attrValQuery);
    this.rgSrc(attrValQuery);
    this.rgAttr(attrValQuery);
    this.rgElem(attrValQuery);
    this.rgEcho();

    await new Promise(r => setTimeout(r, renderDelay));

    // Render DataRgListeners. First remove all listeners with the rgKILL() and after that associate listeners to data - rg - elements.
    await this.rgKILL();
    this.rgHref();
    this.rgClick();
    this.rgKeyup();
    this.rgChange();
    this.rgEvt();
    this.rgSet();
    this.rgModel();

    // Render View
    await this.rgLazyjs();

    this._debug('render', `--------- render (end) -- attrValQuery: ${attrValQuery} ------`, 'green', '#D9FC9B');
  }



  /**
   * Use render() method multiple times.
   * @param {string[]|RegExp[]} attrValQuerys - array of the controller property names: ['company.name', /^company\.year/]
   * @param {number} renderDelay - delay in miliseconds
   */
  async renders(attrValQuerys = [], renderDelay = 5) {
    for (const attrValQuery of attrValQuerys) { await this.render(attrValQuery, renderDelay); }
  }



}

module.exports = Controller;
