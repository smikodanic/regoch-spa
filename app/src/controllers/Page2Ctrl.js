const Controller = require('../../../sys/Controller');

class Page2Ctrl extends Controller {

  init(trx) {
    console.log('\n+++ Page2Ctrl initialised');
    $('title').text('PAGE 2');
  }

}




module.exports = Page2Ctrl;
