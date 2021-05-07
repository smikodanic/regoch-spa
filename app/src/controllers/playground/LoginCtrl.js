const { Controller, syslib } = require('../../../../sys');


class LoginCtrl extends Controller {

  constructor(app) {
    super();
    this.formLogin = new syslib.Form('loginForm');
  }

  async init(trx) {
    this.setTitle('Auth Login Test');
    this.unloadCSS(['/assets/css/theme.css']);
    await this.loadView('#primary', 'playground/login/primary.html', 'inner');
  }

  async tryLogin() {
    const username = this.formLogin.getControl('username');
    const password = this.formLogin.getControl('password');
    try {
      const creds = {username, password};
      const jsonContent = await this.auth.login(creds);
      console.log('tryLogin::', username, password, jsonContent);
    } catch (err) {
      console.error(err);
    }
  }



}


module.exports =  LoginCtrl;
