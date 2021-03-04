class NotfoundCtrl {

  init(trx) {
    console.error(`404 not found: ${trx.uri}`);
  }

}


module.exports = NotfoundCtrl;
