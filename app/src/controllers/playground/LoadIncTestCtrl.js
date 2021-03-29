const { Controller } = require('../../../../sys');


class LoadIncTestCtrl extends Controller {

  constructor(app) {
    super();
  }


  async prerender(trx) {
    this.setTitle('Page Test');
    this.setDescription('Page Test description');
    this.setKeywords('regoch, playground, test, page');
    this.setLang('en');

    await this.loadView('#primary', 'playground/loadIncTest/primary.html', 'sibling'); // inner, outer, sibling, prepend, append
  }


  async postrender(trx) {

  }


  destroy(elem, event) {

  }


}


module.exports =  LoadIncTestCtrl;
