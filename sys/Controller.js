const Page = require('./Page');
const util = require('./lib/util');


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


  /************* CONTROLLER LIFECYCLE HOOKS ***********/
  /**
   * Main router middleware.
   * @param {object} trx - regoch router transitional variable (defined in router.js -> _testRoutes())
   * @returns {Promise<void>}
   */
  async processing(trx) {
    if (this.renderDelay > 2000) { console.log(`%c Warn:: Seems "${this.renderDelay} ms" is too big for renderDelay parameter.`, `color:Maroon; background:LightYellow`); }

    // INIT HOOK
    if(!!this.init) { await this.init(trx); this.rgFlicker(false); }

    // Page LOADERS
    await this.loadInc(true);
    await this.rgLazyjs(this.renderDelay);

    // PRERENDER HOOK
    if(!!this.prerender) { await this.prerender(trx); this.rgFlicker(false); }

    // RENDER
    await this.render();

    // POSTRENDER HOOK
    if(!!this.postrender) { await this.postrender(trx); }

    this.rgFlicker(true);
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
    this._debug('render', `--------- render (start) -- controllerProp: ${controllerProp} -- renderDelay: ${this.renderDelay} -- ctrl: ${this.constructor.name} ------`, 'green', '#D9FC9B');

    await util.sleep(this.renderDelay);

    // DataRg - generators
    this.rgFor(controllerProp);
    this.rgRepeat(controllerProp);
    this.rgPrint(controllerProp);

    await util.sleep(this.renderDelay);

    // DataRg - non-generators
    this.rgIf(controllerProp);
    this.rgSwitch(controllerProp);
    this.rgDisabled(controllerProp);
    this.rgValue(controllerProp);
    this.rgClass(controllerProp);
    this.rgStyle(controllerProp);
    this.rgSrc(controllerProp);
    this.rgElem();
    this.rgEcho();

    await util.sleep(this.renderDelay);

    // DataRgListeners
    await this.rgKILL(); // remove all listeners first
    this.rgHref();
    this.rgClick();
    this.rgKeyup();
    this.rgChange();
    this.rgEvt();
    this.rgSet();
    this.rgBind();

    this._debug('render', `--------- render (end) ------`, 'green', '#D9FC9B');
  }



  /**
   * Use multiple render() method in one method.
   * @param {string[]} controllerProps - array of the controller property names: ['company.name', 'company.year']
   */
  async renders(controllerProps = []) {
    for (const controllerProp of controllerProps) { await this.render(controllerProp); }
  }



}

module.exports = Controller;
