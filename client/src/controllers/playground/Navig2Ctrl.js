const { Controller, syslib } = require('../../../../sys');


class Navig2Ctrl extends Controller {

  constructor(app) {
    super();
  }

  async loader(trx) {
    console.log('Navig2 loader::', trx);
    this.setTitle('Navig Test - Page 2');
    this.unloadCSS(['/assets/css/theme.css']);
    await this.loadView('#primary', 'playground/navig/primary2.html', 'inner');
  }


  async destroy(pevent) {
    console.log('Navig2 destroy::', pevent);
  }


  runGOTO(url) {
    syslib.navig.goto(url);
  }

  runBACK() {
    syslib.navig.back();
  }

  runFORWARD() {
    syslib.navig.forward();
  }

  runRELOAD() {
    syslib.navig.reload();
  }



}


module.exports =  Navig2Ctrl;
