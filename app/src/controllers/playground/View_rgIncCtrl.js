const { Controller } = require('../../../../sys');


class View_rgIncCtrl extends Controller {

  constructor(app) {
    super();
  }

  async loader() {
    this.setTitle('rgInc() Test');
    this.setDescription('Page Test description');
    this.setKeywords('regoch, playground, test, page');
    this.setLang('en');
    this.unloadCSS(['/assets/css/theme.css']);
    await this.loadView('#primary', 'playground/view-rginc/primary.html', 'sibling'); // inner, outer, sibling, prepend, append
  }

  async rend() { }

}


module.exports = View_rgIncCtrl;
