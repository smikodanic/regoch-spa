const { Controller } = require('../../../.sys');


class NotfoundCtrl extends Controller {

  init(trx) {
    console.error(`404 not found: ${trx.uri}`);
  }

}


module.exports = NotfoundCtrl;
