const Controller = require('../../../sys/Controller');

class Page1Ctrl extends Controller {

  async onRender(trx) {
    console.log('PAGE1 render', trx);
    $('title').text('PAGE 1');

    // views
    await this.load.view('header', 'inc/header.html', 'h2 > small', 'append');
    await this.load.view('footer', 'inc/footer3.html');
    await this.load.view('home1', 'page1.html', 'h1');
    await this.load.view('home2', '');
  }

  onInit(trx, dataRgs) {
    console.log('PAGE1 init', trx, dataRgs);
  }

  onDestroy(elem, event, dataRgs) {
    console.log('PAGE1 destroy', elem, event, dataRgs);
  }




}


module.exports = Page1Ctrl;
