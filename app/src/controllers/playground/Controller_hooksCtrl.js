const { Controller, syslib } = require('../../../../sys');


class Controller_hooksCtrl extends Controller {

  constructor(app) {
    // console.log('This is playground test. Example: Controller Lifecycle Hooks. Controller_hooksCtrl::constructor(app)  --> param app:', app);
    super();
  }

  async loader(trx) {
    console.log('loader() -- trx::', trx);
    this.setTitle('Controller Hooks Test');
    this.loadCSS(['https://cdnjs.cloudflare.com/ajax/libs/prism/1.23.0/themes/prism-coy.min.css']);
    this.unloadCSS(['/assets/css/theme.css']);

    await this.loadView('#primary', 'playground/controller-hooks/primary.html', 'sibling');
    this.lazyJS([
      'https://cdnjs.cloudflare.com/ajax/libs/prism/1.23.0/prism.min.js'
    ]);
  }

  async init(trx) {
    console.log('init() -- trx::', trx);
    console.log('init() -- navig::', syslib.navig);
    console.log('init() -- ctrl::', this);
    this.something = 'smthng';
  }

  // if rend() is not defined then this.render() is used
  async rend(trx) {
    console.log('rend() -- trx::', trx);
    await this.rgKILL();
    this.rgHref();
  }

  async postrend(trx) {
    console.log('postrend() -- trx::', trx);
  }

  async destroy(trx) {
    console.log('destroy() -- trx::', trx);
    console.log('destroy() -- ctrl::', this);
    this.unloadCSS(['https://cdnjs.cloudflare.com/ajax/libs/prism/1.23.0/themes/prism-coy.min.css']);
    this.unlazyJS();
  }

}


module.exports = Controller_hooksCtrl;
