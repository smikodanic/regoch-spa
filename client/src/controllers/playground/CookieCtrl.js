const { Controller, syslib } = require('../../../../sys');


class CookieCtrl extends Controller {

  constructor(app) {
    super();
    this.input1;
    this.input2;
    this.cookieForm = new syslib.Form('cookieF');

    const cookieOpts = {
      domain: 'localhost',
      path: '/',
      expires: 5, // number of days or exact date
      secure: false,
      httpOnly: false,
      sameSite: 'strict' // 'strict' for GET and POST, 'lax' only for POST
    };
    this.cookie = new syslib.Cookie(cookieOpts, true);
  }



  async loader(trx) {
    this.setTitle('DataRg Test');
    this.unloadCSS(['/assets/css/theme.css']);
    await this.loadView('#primary', 'playground/cookie/primary.html', 'inner');
  }

  async postrend(trx) {
    this.showFields();
  }


  runCOOKIE() {
    const cookieName = this.cookieForm.getControl('cookieName');
    const cookieValue = this.cookieForm.getControl('cookieValue');
    const cookieMethod = this.cookieForm.getControl('cookieMethod');
    console.log('\n', cookieMethod, ':', cookieName, cookieValue);

    switch (cookieMethod) {
      case 'put': { this.cookie.put(cookieName, cookieValue); break; }
      case 'putObject': { this.cookie.putObject('someObj', { x: 22, y: 'str' }); break; }
      case 'getAll': { console.log(this.cookie.getAll()); break; }
      case 'get': { console.log(this.cookie.get(cookieName)); break; }
      case 'getObject': { console.log(this.cookie.getObject('someObj')); break; }
      case 'remove': { this.cookie.remove(cookieName); break; }
      case 'removeAll': { this.cookie.removeAll(); break; }
      case 'exists': { console.log(this.cookie.exists(cookieName)); break; }
    }

  }


  showFields() {
    const cookieMethod = this.cookieForm.getControl('cookieMethod');
    switch (cookieMethod) {
      case 'put': { this.$model.input1 = true; this.$model.input2 = true; break; }
      case 'putObject': { this.$model.input1 = false; this.$model.input2 = false; break; }
      case 'getAll': { this.$model.input1 = false; this.$model.input2 = false; break; }
      case 'get': { this.$model.input1 = true; this.$model.input2 = false; break; }
      case 'getObject': { this.$model.input1 = false; this.$model.input2 = false; break; }
      case 'remove': { this.$model.input1 = true; this.$model.input2 = false; break; }
      case 'removeAll': { this.$model.input1 = false; this.$model.input2 = false; break; }
      case 'empty': { this.$model.input1 = true; this.$model.input2 = false; break; }
      case 'exists': { this.$model.input1 = true; this.$model.input2 = false; break; }
    }
    this.rgIf();
  }



}


module.exports = CookieCtrl;
