const { Controller } = require('../../../../sys');


class DataRgCtrl extends Controller {

  constructor(app) {
    super();
    this.util = app.sys.util;
  }

  async prerender(trx) {
    this.setTitle('DataRg Test');
    this.loadCSS(['https://cdnjs.cloudflare.com/ajax/libs/prism/1.23.0/themes/prism-coy.min.css']);
    this.unloadCSS(['/assets/css/theme.css']);
    await this.loadView('#primary', 'playground/datarg/primary.html');
  }

  async postrender(trx) {
    this.lazyJS(['https://cdnjs.cloudflare.com/ajax/libs/prism/1.23.0/prism.min.js']);
  }

  async init(trx) {
    this.printModifTest();

  }

  destroy(elem, event) {
    this.unloadCSS(['https://cdnjs.cloudflare.com/ajax/libs/prism/1.23.0/themes/prism-coy.min.css']);
    this.unlazyJS();
  }




  // print initial value and after 1300ms the modified value
  async printModifTest() {
    this.product = {
      name: 'Toyota',
      address: {
        city: 'London'
      },
      colors: ['red', 'green']
    };
    this.rgPrint('product'); // affect data-rg-print with the product

    await this.util.sleep(1300);
    console.log('Product properties changed!');
    this.product.address.city = 'Zagreb';
    this.product.colors = ['blue', 'orange'];
    this.rgPrint('product.address.city');  // affect only data-rg-print with the product.address.city
  }





}


module.exports =  DataRgCtrl;
