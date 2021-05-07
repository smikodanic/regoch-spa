const { Controller } = require('../../../../sys');


class LoginokCtrl extends Controller {

  constructor(app) {
    super();
  }

  async init(trx) {
    this.setTitle('Auth Login OK');
    this.unloadCSS(['/assets/css/theme.css']);
    await this.loadView('#primary', 'playground/loginok/primary.html', 'inner');
  }

  async tryLogout() {
    try {
      await this.auth.logout(100);
    } catch (err) {
      console.error(err);
    }
  }




}


module.exports =  LoginokCtrl;
