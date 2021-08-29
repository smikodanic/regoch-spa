const { Controller, syslib } = require('../../../../sys');


class AutorenderCtrl extends Controller {

  constructor(app) {
    super();
    this.debugOpts = {
      rgClick: true
    };
  }

  async loader(trx) {
    this.setTitle('Autorender Test');
    this.unloadCSS(['/assets/css/theme.css']);
    await this.loadView('#primary', 'playground/autorender/primary.html', 'inner');
  }

  async init(trx) {
    this.clickVar = 'one';
    this.clickVars = [1, 2, 3, 4, 5];
  }



  clickAR() {
    console.log('clicked');
    this.clickVar = 'two';
    this.clickVars = [6, 7, 8];
  }


}


module.exports = AutorenderCtrl;
