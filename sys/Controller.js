const Model = require('./Model');
const util = require('./lib/util');


class Controller extends Model {

  constructor() {
    super();

    this.debugOpts = {
      // Controller.js
      render: false,
      visibleAll: false,
      scope: false,

      // Model.js
      modelFill: false,
      modelWatch: false,
      modelSet: false,
      modelReset: false,

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
   * Main router middleware.
   * @param {object} trx - regoch router transitional variable (defined in router.js -> _testRoutes())
   * @returns {Promise<void>}
   */
  async processing(trx) {
    if (this.renderDelay > 2000) { console.log(`%c Warn:: Seems "${this.renderDelay} ms" is too big for renderDelay parameter.`, `color:Maroon; background:LightYellow`); }

    // INIT HOOK
    if(!!this.init) { await this.init(trx); this._visibleAll(false); }

    // Page LOADERS
    await this.loadInc(true);
    await this.rgLazyjs(this.renderDelay);

    // PRERENDER HOOK
    if(!!this.prerender) { await this.prerender(trx); this._visibleAll(false); }

    // RENDER
    await this.render();

    // POSTRENDER HOOK
    if(!!this.postrender) { await this.postrender(trx); }

    this._visibleAll(true);

    // MODEL
    this.modelFill();
  }



  /**
   * Destroy the controller when the data-rg-href element is clicked (see parse.href()).
   * - remove all data-rg-... element lsiteners
   * * @param {Event} pevent - popstate or pushstate event which caused URL change
   * @returns {Promise<void>}
   */
  async destroy(pevent) {}



  /**
   * Render the view i.e. the data-rg- elements with the controllerProp.
   * For example: data-rg-print="first_name", where first_name is the controllerProp.
   * @param {string} controllerProp - controller property name. Limit the render process only to the elements with the data-rg-...="controllerProp ..."
   */
  async render(controllerProp) {
    this._debug('render', `--------- render (start) -- controllerProp: ${controllerProp} -- renderDelay: ${this.renderDelay} ------`, 'green', '#D9FC9B');

    await util.sleep(this.renderDelay);

    // DataRg - generators
    this.rgFor(controllerProp);
    this.rgRepeat(controllerProp);
    this.rgPrint(controllerProp);

    await util.sleep(this.renderDelay);

    // DataRg - non-generators
    this.rgIf(controllerProp);
    this.rgSwitch(controllerProp);
    this.rgValue(controllerProp);
    this.rgClass(controllerProp);
    this.rgStyle(controllerProp);
    this.rgSrc(controllerProp);
    this.rgEcho();
    this.rgElem();

    await util.sleep(this.renderDelay);

    // DataRgListeners
    await this.rgKILL(); // remove all listeners first
    this.rgHref();
    this.rgClick();
    this.rgKeyup();
    this.rgChange();
    this.rgEvt();
    this.rgSet();

    this._debug('render', `--------- render (end) ------`, 'green', '#D9FC9B');
  }




  /************ AUXILARY RENDER METHODS ************/
  /**
   * Reduce flickering by hiding data-rg- elements before render() and showing it again after render() process.
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



}

module.exports = Controller;
