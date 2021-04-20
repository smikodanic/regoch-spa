const { Controller, syslib } = require('../../../../sys');


class ScopeCtrl extends Controller {

  constructor(app) {
    super();
  }

  async prerender(trx) {
    this.setTitle('$scope Test');
    this.unloadCSS(['/assets/css/theme.css']);
    await this.loadView('#primary', 'playground/scope/primary.html', 'inner');
  }


  async init () {
    const products = await this.getProducts();
    this.$scope = { products };
  }


  async getProducts() {
    await syslib.util.sleep(1300);
    return [
      {name: 'Ball', price: 88.55},
      {name: 'Toy', price: 92.77}
    ];
  }


  runCLICK($i) {
    console.log('Clicked product:', this.$scope.products[$i].name);
  }





}


module.exports =  ScopeCtrl;
