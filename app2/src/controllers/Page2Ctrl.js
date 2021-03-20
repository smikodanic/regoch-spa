const { Controller, Load } = require('../../../sys');


class Page2Ctrl extends Controller {
  constructor(app) {
    super();
    this.load = app.sys.load;
  }

  init(trx, dataRgs) {
    console.log('PAGE2 init', trx, dataRgs);
    $('title').text('PAGE 2');
  }

}




module.exports = Page2Ctrl;
