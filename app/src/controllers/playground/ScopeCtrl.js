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

  async postrender(trx) {
    const products = await this.getProducts();
    await this.$scopeSet('products', products);
  }


  // get the products - simulate HTTP request
  async getProducts() {
    await syslib.util.sleep(1300);
    return [
      {name: 'Cement', price: 88.55},
      {name: 'Brick', price: 92.77}
    ];
  }

  showProduct($i) {
    console.log('Clicked product:', this.$scope.products[$i].name);
  }


  // set the $scope object
  runSETTER () {
    this.$scope = {
      products: [
        {name: 'Car', price: 11.11}
      ]
    };
  }

  // set the $scope property
  async runSET () {
    const products = [
      {name: 'Orange', price: 22.11},
      {name: 'Apple', price: 22.12},
    ];
    await this.$scopeSet('products', products);
  }


  // get the $scope object
  runGETTER () {
    console.log('$scope.products is:', this.$scope.products);
  }


  // get the $scope object
  runRESET () {
    this.$scopeReset();
  }



}


module.exports =  ScopeCtrl;
