const Controller = require('../../../sys/Controller');

class Page2Ctrl extends Controller {

  onInit(trx, dataRgs) {
    console.log('PAGE2 init', trx, dataRgs);
    $('title').text('PAGE 2');
  }

}




module.exports = Page2Ctrl;
