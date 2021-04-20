const Page = require('./Page');
const util = require('./lib/util');
const debug = require('./debug');


class Controller extends Page {

  constructor() {
    super();
    this._$scope = {};
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
    if (debug().renderDelay) { console.log('renderDelay::', this.renderDelay); }
    await util.sleep(this.renderDelay);
    await this.loadInc(true); // defined in Page.js
    await util.sleep(this.renderDelay);
    await this.parseNonListeners();
    this.parseListeners();
  }

  async parseNonListeners(controllerProp = '') {
    await this.rgFor(controllerProp);
    await this.rgRepeat();
    await this.rgIf(controllerProp);
    await this.rgSwitch(controllerProp);
    this.rgElem();
    this.rgPrint(controllerProp);
    this.rgClass(controllerProp);
    this.rgStyle(controllerProp);
    this.rgLazyjs();
    // this.rgInterpolate(controllerProp);
  }

  parseListeners(controllerProp) {
    this.rgHref();
    this.rgClick();
    this.rgKeyup();
    this.rgChange();
    this.rgEvt();
    this.rgSet(controllerProp);
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
   * * @param {Event} pevent - popstate or pushstate event which caused URL change
   * @returns {Promise<void>}
   */
  async destroy(pevent) {}




  /**
   * Set the controller's $scope property.
   * On every modification of the $scope property all the data-rg elements are rendered except data-rg-inc and data-rg-view
   */
  set $scope(val) {
    debug('scopeSet', '--------- scopeSet ------', 'green', '#D9FC9B');

    this._$scope = {...this._$scope, ...val}; // append the val to the $scope
    if (debug().scopeSet) { console.log('val::', val); }
    if (debug().scopeSet) { console.log('$scope::', this._$scope); }

    this.parseNonListeners('$scope').then(() => { this.parseListeners('$scope'); });
  }


  /**
   * Get the $scope value.
   * It can be called as this.$scope.myVar in the controller or as data-rg-print="$scope.myVar"
   */
  get $scope() {
    debug('scopeGet', '--------- scopeGet ------', 'green', '#D9FC9B');
    if (debug().scopeGet) { console.log('$scope::', this._$scope); }
    return this._$scope;
  }


}

module.exports = Controller;
