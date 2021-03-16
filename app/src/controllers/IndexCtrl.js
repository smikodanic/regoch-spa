const { Controller } = require('../../../sys');


class IndexCtrl extends Controller {

  constructor(app) {
    super();
    console.log('HOME constructor');
    this.load = app.sys.load;
    this.util = app.sys.util;
    this.httpClient = app.sys.httpClient; // or new app.sys.HTTPClient()
    this.controllers = app.controllers;

    this.ifX = false;
  }



  async onRender(trx) {
    console.log('HOME render', trx);
    // console.log(this.controllers.FormCtrl); // access the specific controller in the controller
    await this.load.view('header', 'inc/header.html', 'h2 > small', 'sibling');
    await this.load.view('footer', 'inc/footer.html');
    await this.load.view('footer2', 'inc/footer2.html', '', 'outer');
    await this.load.view('footer3', 'inc/footer3.html', '', 'outer');
    await this.load.view('home1', 'home1.html');
    await this.load.view('home2', 'home2.html');
  }



  async onInit(trx, dataRgs) {
    console.log('HOME init', trx, dataRgs);
    this.product = {
      name: {
        x: 'Initial val'
      },
      colors: ['red', 'green']
    };
    this.rgPrint('product.name.x');

    await this.util.sleep(1300);
    this.product.name.x = 'Modified val';

    this.companies = [
      {name: 'Cloud Ltd', size: 3},
      {name: 'Roto Ltd', size: 5},
      {name: 'Zen Ltd', size: 8}
    ];
  }


  onDestroy(elem, event, dataRgs) {
    console.log('HOME destroy', elem, event, dataRgs);
  }



  toggleIF() {
    this.ifX = !this.ifX;
    this.rgIf('ifX');
  }


  runFOR() {
    this.companies = [
      {name: 'Cloud2 Ltd', size: 3},
      {name: 'Roto2 Ltd', size: 5},
      {name: 'Zen2 Ltd', size: 8}
    ];
    this.rgFor('companies');
    this.rgPrint('companies');
  }



  clickFja(n, str, ...rest) {
    console.log('This is a click. Params::', n, str, rest);
    this.callAPI();
    alert('OK clickFja');
  }

  async callAPI() {
    const opts = {
      encodeURI: true,
      timeout: 10000,
      retry: 5,
      retryDelay: 1300,
      maxRedirects: 0,
      headers: {
        'authorization': '',
        'accept': '*/*', // 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9'
        'content-type': 'text/html; charset=UTF-8'
      }
    };
    const answer = await this.httpClient.askOnce('api.dex8.com');

    // const answer = await hc.askJSON('https://jsonplaceholder.typicode.com/todos/1', 'GET');
    // const answer = await hc.askJSON('https://jsonplaceholder.typicode.com/posts?userId=1', 'GET');
    // const answer = await hc.askJSON('https://jsonplaceholder.typicode.com/posts', 'POST', {title: 'foo', body: 'bar', userId: 1});
    // const answer = await hc.askJSON('https://jsonplaceholder.typicode.com/posts/1', 'PUT', {id: 1, title: 'foogoo', body: 'barboo', userId: 3});
    // const answer = await hc.askJSON('https://jsonplaceholder.typicode.com/posts/1', 'DELETE');

    // const answer = await hc.askJSON('https://api.dex8.com?q=my str'); // test encodeURI

    // const answer = await hc.ask('api.dex8.com'); // to test 408 timeout set opts:: timeout:10,retry:5,retryDelay:1300


    console.log(answer);
  }



  historyData() {
    console.log('window.history::', window.history);
  }
}


module.exports = IndexCtrl;
