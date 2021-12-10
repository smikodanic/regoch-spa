const { Controller } = require('../../../../sys');


class View_LoadIncCtrl extends Controller {

  constructor(app) {
    super();
  }

  async loader() {
    this.setTitle('loadInc() Test');
    this.setDescription('Page Test description');
    this.setKeywords('regoch, playground, test, page');
    this.setLang('en');
    this.unloadCSS(['/assets/css/theme.css']);
    await this.loadView('#primary', 'playground/view-loadinc/primary.html', 'sibling'); // inner, outer, sibling, prepend, append
    await this.loadInc();
  }

  async rend() { }

}


module.exports = View_LoadIncCtrl;
