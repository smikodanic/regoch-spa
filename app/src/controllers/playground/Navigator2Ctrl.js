const { Controller, syslib } = require('../../../../sys');


class Navigator2Ctrl extends Controller {

  constructor(app) {
    super();
    this.navigator1Ctrl = app.controllers['Navigator1Ctrl'];
    console.log(this.navigator1Ctrl);
  }

  async prerender(trx) {
    console.log('Navigator2 prerender::', trx);
    this.setTitle('Navigator Test - Page 2');
    this.unloadCSS(['/assets/css/theme.css']);
    await this.loadView('#primary', 'playground/navigator/primary2.html', 'inner');
  }


  async destroy(pevent) {
    console.log('Navigator2 destroy::', pevent);
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


module.exports =  Navigator2Ctrl;
