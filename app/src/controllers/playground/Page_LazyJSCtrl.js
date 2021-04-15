const { Controller } = require('../../../../sys');


class Page_LazyJSCtrl extends Controller {

  constructor(app) {
    super();
  }

  async prerender(trx) {
    this.setTitle('lazyJS() Test');
    this.unloadCSS(['/assets/css/theme.css']);
    await this.loadView('#primary', 'playground/page-lazyjs/primary.html');
  }

  async destroy() {
    this.unlazyAllJS();
  }


  popup() {
    window.swal({
      icon: 'success',
      text: 'Hello Regoč !',
    });
    $.notify('Hello Regoč');
  }

  lazyAll() {
    this.lazyJS([
      'https://cdnjs.cloudflare.com/ajax/libs/notify/0.4.2/notify.min.js',
      'https://cdnjs.cloudflare.com/ajax/libs/sweetalert/2.1.2/sweetalert.min.js'
    ]);
  }

  lazyTest() {
    this.lazyJS([
      '/assets/regoch/js/lazyTest.js'
    ]);
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


module.exports =  Page_LazyJSCtrl;
