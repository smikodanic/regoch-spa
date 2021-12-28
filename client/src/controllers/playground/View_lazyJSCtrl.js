const { Controller } = require('../../../../sys');


class View_lazyJSCtrl extends Controller {

  constructor(app) {
    super();
  }

  async loader(trx) {
    this.setTitle('lazyJS() Test');
    this.unloadCSS(['/assets/css/theme.css']);
    await this.loadView('#primary', 'playground/view-lazyjs/primary.html');
  }

  async destroy() {
    this.unlazyAllJS();
    this.emptyView('#primary');
  }


  popup() {
    window.swal({
      icon: 'success',
      text: 'Hello Regoč !',
    });
    $.notify('Hello Regoč');
  }

  // button function
  async lazyAll() {
    await this.lazyJS([
      'https://cdnjs.cloudflare.com/ajax/libs/notify/0.4.2/notify.min.js',
      'https://cdnjs.cloudflare.com/ajax/libs/sweetalert/2.1.2/sweetalert.min.js'
    ], 1300); // wait 1.3 seconds before the lazy load start
  }

  lazyTest() {
    this.lazyJS([
      '/assets/regoch/js/lazyTest2.js'
    ], 1000);
  }

  unlazyAll() {
    this.unlazyAllJS();
  }

  unlazySweetalert() {
    this.unlazyJS([
      'https://cdnjs.cloudflare.com/ajax/libs/sweetalert/2.1.2/sweetalert.min.js'
    ]);
  }


}


module.exports = View_lazyJSCtrl;
