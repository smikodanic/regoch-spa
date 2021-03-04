class Page1Ctrl {

  init(trx) {
    console.log('Page1Ctrl initialised');
    $('title').text('PAGE 1');
    console.log(this);
  }

}


module.exports = Page1Ctrl;
