const { Controller } = require('../../../../sys');


class Controller_hooksCtrl extends Controller {

  constructor(app) {
    console.log('This is playground test. Example: Controller Lifecycle Hooks. Controller_hooksCtrl::constructor(app)  --> param app:', app);
    super();
    this.debugOpts = {
      render: true
    };
  }


  async init(trx) {
    console.log('Controller_hooks init::', trx);
  }


  async prerender(trx) {
    console.log('Controller_hooks prerender::', trx);
    this.setTitle('Controller Hooks Test');
    this.loadCSS(['https://cdnjs.cloudflare.com/ajax/libs/prism/1.23.0/themes/prism-coy.min.css']);
    this.unloadCSS(['/assets/css/theme.css']);

    await this.loadView('#primary', 'playground/controller-hooks/primary.html', 'sibling');
  }


  async postrender(trx) {
    console.log('Controller_hooks postrender::', trx);
    this.lazyJS([
      'https://cdnjs.cloudflare.com/ajax/libs/prism/1.23.0/prism.min.js'
    ]);
  }


  async destroy(elem, event) {
    console.log('Controller_hooks destroy::', elem, event);
    this.unloadCSS(['https://cdnjs.cloudflare.com/ajax/libs/prism/1.23.0/themes/prism-coy.min.css']);
    this.unlazyJS();
  }

}


module.exports =  Controller_hooksCtrl;
