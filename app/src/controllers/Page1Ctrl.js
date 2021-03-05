const Controller = require('../../../sys/Controller');

class Page1Ctrl extends Controller {

  async init(trx) {
    console.log('\n+++ Page1Ctrl initialised');
    $('title').text('PAGE 1');
    await this.loadView('home1', 'page1.html', 'h1');
  }

}


module.exports = Page1Ctrl;
