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
   * Init the controller i.e. set controller properties with the initial values.(see Router.js)
   * @param {object} trx - regoch router transitional variable (defined in Router.js::testRoutes())
   * @returns {Promise<void>}
   */
  async init(trx) {}


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
    debug('render', `--------- render (start) -- renderDelay: ${this.renderDelay} ------`, 'maroon', '#D9FC9B');

    if (this.renderDelay > 2000) { console.log(`%c Warn:: Seems "${this.renderDelay} ms" is too big for renderDelay parameter.`, `color:Maroon; background:LightYellow`); }

    await util.sleep(this.renderDelay);
    await this.loadInc(true); // defined in Page.js

    await util.sleep(this.renderDelay);
    await this.rgLazyjs(this.renderDelay);

    await util.sleep(this.renderDelay);
    await this.parseNonListeners();

    await util.sleep(this.renderDelay);
    await this.parseListeners();

    debug('render', `--------- render (end) ------`, 'maroon', '#D9FC9B');
  }


  /**
   * Run after render of the HTML elements with data-rg-... attribute. (see Router.js)
   * @param {object} trx - regoch router transitional variable (defined in Router.js::testRoutes())
   * @returns {Promise<void>}
   */
  async postrender(trx) {}


  /**
   * Destroy the controller when the data-rg-href element is clicked (see parse.href()).
   * - remove all data-rg-... element lsiteners
   * * @param {Event} pevent - popstate or pushstate event which caused URL change
   * @returns {Promise<void>}
   */
  async destroy(pevent) {}




  /************ AUXILARY RENDER METHODS ************/
  /**
   * Parse data-rg- elements with no listeners. The methods from DataRg.
   * @param {string} controllerProp - controller property name. Limit the render process only to the elements with the data-rg-...="controllerProp ..."
   */
  async parseNonListeners(controllerProp = '') {
    // generators
    this.rgFor(controllerProp);
    this.rgRepeat();
    this.rgPrint(controllerProp);

    await util.sleep(this.renderDelay);

    // non-generators
    this.rgEcho();
    this.rgIf(controllerProp);
    this.rgSwitch(controllerProp);
    this.rgElem();
    this.rgValue(controllerProp);
    this.rgClass(controllerProp);
    this.rgStyle(controllerProp);
    this.rgSrc(controllerProp);
    // this.rgInterpolate(controllerProp);
  }

  /**
   * Parse data-rg- elements with the listeners. The methods from DataRgListeners.
   * @param {string} controllerProp - controller property name. Limit the render process only to the elements with the data-rg-...="controllerProp ..."
   */
  async parseListeners(controllerProp) {
    await this.rgKILL(); // remove all listeners first
    this.rgHref();
    this.rgClick();
    this.rgKeyup();
    this.rgChange();
    this.rgEvt();
    this.rgSet(controllerProp);
  }


  /**
   * Re-render the view i.e. the data-rg- elements with the controllerProp.
   * For example: data-rg-print="first_name", where first_name is the controllerProp.
   * @param {string} controllerProp - controller property name. Limit the render process only to the elements with the data-rg-...="controllerProp ..."
   */
  async rerender(controllerProp) {
    debug('rerender', `--------- rerender (start) -- controllerProp: ${controllerProp} -- renderDelay: ${this.renderDelay} ------`, 'green', '#D9FC9B');

    await util.sleep(this.renderDelay);
    await this.parseNonListeners(controllerProp);

    await util.sleep(this.renderDelay);
    await this.parseListeners(controllerProp);

    debug('rerender', `--------- rerender (end) ------`, 'green', '#D9FC9B');
  }





  /********* $scope  *********/

  /**
   * Set the controller's $scope object.
   * On every modification of the $scope property all the data-rg elements are rendered except data-rg-inc and data-rg-view
   * @param {any} val - the $scope value
   */
  set $scope(val) {
    debug('scope', '--------- scopeSetter ------', 'green', '#D9FC9B');
    this._$scope = val;
    if (debug().scopeSetter) { console.log('$scopeSetter::', this._$scope); }
    this.rerender('$scope');
  }


  /**
   * Get the $scope value.
   * It can be called as this.$scope.myVar in the controller or as data-rg-print="$scope.myVar"
   */
  get $scope() {
    debug('scope', '--------- scopeGettter ------', 'green', '#D9FC9B');
    if (debug().scopeGetter) { console.log('$scopeGetter::', this._$scope); }
    return this._$scope;
  }


  /**
   * Add/update the $scope proerty.
   * On every modification of the $scope property all the data-rg elements are rendered except data-rg-inc and data-rg-view
   * @param {string} name - the $scope property name
   * @param {any} val - the $scope value
   */
  async $scopeSet(name, val) {
    debug('scope', '--------- scopeSet ------', 'green', '#D9FC9B');
    this._$scope[name] = val;
    if (debug().scopeSet) { console.log('$scopeSet::', this._$scope); }
    await this.rerender(`$scope.${name}`);
  }


  /**
   * Set the $scope to empty object {}.
   * On every modification of the $scope property all the data-rg elements are rendered except data-rg-inc and data-rg-view
   */
  $scopeReset() {
    debug('scope', '--------- scopeReset ------', 'green', '#D9FC9B');
    this.$scope = {};
    if (debug().scopeReset) { console.log('$scopeReset::', this._$scope); }
  }



}

module.exports = Controller;
