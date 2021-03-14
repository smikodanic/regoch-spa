const Controller = require('../../../sys').Controller;

class NotfoundCtrl extends Controller {

  init(trx) {
    console.error(`404 not found: ${trx.uri}`);
  }

}


module.exports = NotfoundCtrl;
