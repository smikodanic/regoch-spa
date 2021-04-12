const { Controller } = require('../../../../sys');


class LoginokCtrl extends Controller {

  constructor(app) {
    super();

  }

  async prerender(trx) {
    console.log('prerender LOGINOK');

    this.setTitle('Auth Login OK');
    this.unloadCSS(['/assets/css/theme.css']);
    await this.loadView('#primary', 'playground/loginok/primary.html', 'inner');
  }

  async tryLogout() {
    try {
      await this.auth.logout(400);
    } catch (err) {
      console.error(err);
    }
  }



}


module.exports =  LoginokCtrl;
