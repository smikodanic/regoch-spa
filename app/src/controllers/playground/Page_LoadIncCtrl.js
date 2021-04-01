const { Controller } = require('../../../../sys');


class Page_LoadIncCtrl extends Controller {

  constructor(app) {
    super();
  }


  async prerender(trx) {
    this.setTitle('loadInc() Test');
    this.setDescription('Page Test description');
    this.setKeywords('regoch, playground, test, page');
    this.setLang('en');
    this.unloadCSS(['/assets/css/theme.css']);
    await this.loadView('#primary', 'playground/page-loadinc/primary.html', 'sibling'); // inner, outer, sibling, prepend, append
  }


}


module.exports =  Page_LoadIncCtrl;
