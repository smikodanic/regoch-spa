const sys = require('../../../sys');
const Controller = sys.Controller;
const Load = sys.Load;
const appconf = require('../config/appconf');

class Page2Ctrl extends Controller {
  constructor() {
    super();
    this.load = new Load(appconf.baseURL, appconf.HTTPCLient);
  }

  onInit(trx, dataRgs) {
    console.log('PAGE2 init', trx, dataRgs);
    $('title').text('PAGE 2');
  }

}




module.exports = Page2Ctrl;
