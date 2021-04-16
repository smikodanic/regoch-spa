const { Controller, syslib } = require('../../../../sys');


class Navig1Ctrl extends Controller {

  constructor(app) {
    super();
  }

  async prerender(trx) {
    console.log('Navig1 prerender::', trx);
    this.setTitle('Navig Test - Page 1');
    this.unloadCSS(['/assets/css/theme.css']);
    await this.loadView('#primary', 'playground/navig/primary1.html', 'inner');
  }


  async destroy(pevent) {
    console.log('Navig1 destroy::', pevent);
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


module.exports =  Navig1Ctrl;
