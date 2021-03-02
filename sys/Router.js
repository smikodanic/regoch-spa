const RegochRouter = require('regoch-router');


class Router {

  constructor() {
    this.regochRouter = new RegochRouter({debug: false});
    this.trx = this.regochRouter.trx;
  }


  when(route, view, Ctrl) {
    // load view

    const ctrl = new Ctrl();
    this.regochRouter.def(route, );
  }



}


module.exports = Router;
