const Page = require('./Page');
const util = require('./lib/util');


class Controller extends Page {

  constructor() {
    super();
    this._$scope = {};

    this.debugOpts = {
      // Controller.js
      renderHook: false,
      prerenderHook: false,
      visibleAll: false,
      rerender: false,
      scope: false,

      // Page.js
      loadInc: false,
      loadView: false,
      emptyView: false,
      loadHead: false,
      rgLazyjs: false,

      // DataRg.js
      rgFor: false,
      rgRepeat: false,
      rgIf: false,
      rgSwitch: false,
      rgElem: false,
      rgEcho: false,
      rgPrint: false,
      rgValue: false,
      rgInterpolate: false,
      rgClass: false,
      rgStyle: false,

      // DataRgListeners.js
      rgKILL: false,
      rgHref: false,
      rgClick: false,
      rgKeyup: false,
      rgChange: false,
      rgEvt: false,
      rgSet: false
    };
  }


  /************* CONTROLLER LIFECYCLE HOOKS ***********/
  /**
   * Init the controller i.e. set controller properties with the initial values.
   * @param {object} trx - regoch router transitional variable (defined in router.js -> _testRoutes())
   * @returns {Promise<void>}
   */
  async initHook(trx) {
    if (this.renderDelay > 2000) { console.log(`%c Warn:: Seems "${this.renderDelay} ms" is too big for renderDelay parameter.`, `color:Maroon; background:LightYellow`); }
    if(!!this.init) { await this.init(trx); }
  }


  /**
   * Load views, includes and lazy load the JS files.
   * @param {object} trx - regoch router transitional variable
   * @returns {Promise<void>}
   */
  async prerenderHook(trx) {
    this._debug('prerenderHook', `--------- prerenderHook (start) -- renderDelay: ${this.renderDelay} ------`, 'maroon', '#D9FC9B');
    if(!!this.prerender) { await this.prerender(trx); } // use this.loadView() here!

    await this.loadInc(true); // defined in Page.js
    this._visibleAll(false);

    await util.sleep(this.renderDelay);
    await this.rgLazyjs(this.renderDelay); // defined in the Page.js
    this._debug('prerenderHook', `--------- prerenderHook (end) ------`, 'maroon', '#D9FC9B');
  }


  /**
   * Render all HTML elements with data-rg-... attribute except the data-rg-view, data-rg-inc and data-rg-lazyjs.
   * @param {object} trx - regoch router transitional variable (defined in Router.js::testRoutes())
   * @returns {Promise<void>}
   */
  async renderHook(trx) {
    this._debug('renderHook', `--------- renderHook (start) -- renderDelay: ${this.renderDelay} ------`, 'maroon', '#D9FC9B');

    if(!!this.render) { await this.render(trx); }

    await util.sleep(this.renderDelay);
    await this._parseDataRg_generators();

    await util.sleep(this.renderDelay);
    await this._parseDataRg_nongenerators();

    this._visibleAll(true);

    await util.sleep(this.renderDelay);
    await this._parseDataRgListeners();

    this._debug('renderHook', `--------- renderHook (end) ------`, 'maroon', '#D9FC9B');
  }


  /**
   * Run after the renderHook i.e. when the view is completely rendered.
   * @param {object} trx - regoch router transitional variable (defined in Router.js::testRoutes())
   * @returns {Promise<void>}
   */
  async postrenderHook(trx) {
    if(!!this.postrender) { await this.postrender(trx); }
  }


  /**
   * Destroy the controller when the data-rg-href element is clicked (see parse.href()).
   * - remove all data-rg-... element lsiteners
   * * @param {Event} pevent - popstate or pushstate event which caused URL change
   * @returns {Promise<void>}
   */
  async destroyHook(pevent) {
    if(!!this.destroy) { await this.destroy(pevent); }
  }


  /**
   * Re-render the view i.e. the data-rg- elements with the controllerProp.
   * For example: data-rg-print="first_name", where first_name is the controllerProp.
   * @param {string} controllerProp - controller property name. Limit the render process only to the elements with the data-rg-...="controllerProp ..."
   */
  async rerender(controllerProp) {
    this._debug('rerender', `--------- rerender (start) -- controllerProp: ${controllerProp} -- renderDelay: ${this.renderDelay} ------`, 'green', '#D9FC9B');

    await this._parseDataRg_generators(controllerProp);

    await util.sleep(this.renderDelay);
    await this._parseDataRg_nongenerators(controllerProp);

    await util.sleep(this.renderDelay);
    await this._parseDataRgListeners(controllerProp);

    this._debug('rerender', `--------- rerender (end) ------`, 'green', '#D9FC9B');
  }




  /************ AUXILARY RENDER METHODS ************/
  /**
   * Parse data-rg- elements with no listeners. The methods from DataRg.
   * @param {string} controllerProp - controller property name. Limit the render process only to the elements with the data-rg-...^="controllerProp ..."
   */
  async _parseDataRg_generators(controllerProp = '') {
    this.rgFor(controllerProp);
    this.rgRepeat(controllerProp);
    this.rgPrint(controllerProp);
  }

  /**
   * Parse data-rg- elements with no listeners. The methods from DataRg.
   * @param {string} controllerProp - controller property name
   */
  async _parseDataRg_nongenerators(controllerProp = '') {
    this.rgIf(controllerProp);
    this.rgSwitch(controllerProp);
    this.rgElem();
    this.rgValue(controllerProp);
    this.rgClass(controllerProp);
    this.rgStyle(controllerProp);
    this.rgSrc(controllerProp);
    this.rgEcho();
  }

  /**
   * Parse data-rg- elements with the listeners. The methods from DataRgListeners.
   * @param {string} controllerProp - controller property name
   */
  async _parseDataRgListeners(controllerProp) {
    await this.rgKILL(); // remove all listeners first
    this.rgHref();
    this.rgClick();
    this.rgKeyup();
    this.rgChange();
    this.rgEvt();
    this.rgSet(controllerProp);
  }

  /**
   * Reduce flickering by hiding data-rg- elements and showing it again after render/rerender process.
   * @param {boolean} tf
   */
  _visibleAll(tf) {
    if (!tf) {
      const cssSel = `
        [data-rg-for], [data-rg-for-gen],
        [data-rg-repeat], [data-rg-repeat-gen],
        [data-rg-print], [data-rg-print-gen],
        [data-rg-echo], [data-rg-if], [data-rg-switch], [data-rg-elem], [data-rg-value], [data-rg-class], [data-rg-style], [data-rg-css]
      `;
      const elems = document.querySelectorAll(cssSel);
      this._debug('visibleAll', `--------- visibleAll -- hidden elems: ${elems.length} ------`, '#B73FDC', '#D9FC9B');
      for (const elem of elems) {
        elem.style.visibility = 'hidden';
        elem.setAttribute('data-rg-prehide', '');
      }
    } else {
      const cssSel = '[data-rg-prehide]';
      const elems = document.querySelectorAll(cssSel);
      this._debug('visibleAll', `--------- visibleAll -- shown elems: ${elems.length} ------`, '#B73FDC', '#D9FC9B');
      for (const elem of elems) {
        elem.style.visibility = '';
        elem.removeAttribute('data-rg-prehide');
      }
    }
  }



  /********* $scope  *********/

  /**
   * Set the controller's $scope object.
   * On every modification of the $scope property all the data-rg elements are rendered except data-rg-inc and data-rg-view
   * @param {any} val - the $scope value
   */
  set $scope(val) {
    this._debug('scope', '--------- scopeSetter ------', 'green', '#D9FC9B');
    this._$scope = val;
    if (this._debug().scopeSetter) { console.log('$scopeSetter::', this._$scope); }
    this.rerender('$scope');
  }


  /**
   * Get the $scope value.
   * It can be called as this.$scope.myVar in the controller or as data-rg-print="$scope.myVar"
   */
  get $scope() {
    this._debug('scope', '--------- scopeGettter ------', 'green', '#D9FC9B');
    if (this._debug().scopeGetter) { console.log('$scopeGetter::', this._$scope); }
    return this._$scope;
  }


  /**
   * Add/update the $scope proerty.
   * On every modification of the $scope property all the data-rg elements are rendered except data-rg-inc and data-rg-view
   * @param {string} name - the $scope property name
   * @param {any} val - the $scope value
   */
  async $scopeSet(name, val) {
    this._debug('scope', '--------- scopeSet ------', 'green', '#D9FC9B');
    this._$scope[name] = val;
    if (this._debug().scopeSet) { console.log('$scopeSet::', this._$scope); }
    await this.rerender(`$scope.${name}`);
  }


  /**
   * Set the $scope to empty object {}.
   * On every modification of the $scope property all the data-rg elements are rendered except data-rg-inc and data-rg-view
   */
  $scopeReset() {
    this._debug('scope', '--------- scopeReset ------', 'green', '#D9FC9B');
    this.$scope = {};
    if (this._debug().scopeReset) { console.log('$scopeReset::', this._$scope); }
  }




  /******** DEBUG *******/
  _debug(tip, text, color, background) {
    if (this.debugOpts[tip]) { console.log(`%c ${text}`, `color: ${color}; background: ${background}`); }
    return this.debugOpts;
  }



}

module.exports = Controller;
