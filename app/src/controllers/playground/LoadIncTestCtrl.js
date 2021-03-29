const { Controller } = require('../../../../sys');


class LoadIncTestCtrl extends Controller {

  constructor(app) {
    super();
  }


  async prerender(trx) {
    this.setTitle('loadInc() Test');
    this.setDescription('Page Test description');
    this.setKeywords('regoch, playground, test, page');
    this.setLang('en');

    this.loadCSS(['https://cdnjs.cloudflare.com/ajax/libs/prism/1.23.0/themes/prism-coy.min.css']);

    await this.loadView('#primary', 'playground/loadIncTest/primary.html', 'sibling'); // inner, outer, sibling, prepend, append
  }


  async postrender(trx) {
    this.lazyJS([
      'https://cdnjs.cloudflare.com/ajax/libs/prism/1.23.0/prism.min.js'
    ]);

  }


  destroy(elem, event) {
    this.unlazyJS();
    this.unloadCSS(['https://cdnjs.cloudflare.com/ajax/libs/prism/1.23.0/themes/prism-coy.min.css']);
  }


}


module.exports =  LoadIncTestCtrl;
