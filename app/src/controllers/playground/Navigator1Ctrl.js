const { Controller, syslib } = require('../../../../sys');


class Navigator1Ctrl extends Controller {

  constructor(app) {
    super();
  }

  async prerender(trx) {
    console.log('Navigator1 prerender::', trx);
    this.setTitle('Navigator Test - Page 1');
    this.unloadCSS(['/assets/css/theme.css']);
    await this.loadView('#primary', 'playground/navigator/primary1.html', 'inner');
  }


  async destroy(pevent) {
    console.log('Navigator1 destroy::', pevent);
  }


  runGOTO(url) {
    syslib.navigator.goto(url);
  }

  runBACK() {
    syslib.navigator.back();
  }

  runFORWARD() {
    syslib.navigator.forward();
  }

  runRELOAD() {
    syslib.navigator.reload();
  }



}


module.exports =  Navigator1Ctrl;
