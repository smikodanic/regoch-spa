const { Controller, syslib } = require('../../../../sys');


class AutorenderCtrl extends Controller {

  constructor(app) {
    super();
    this.debugOpts = {
      rgClick: false,
      rgKeyup: false,
      render: false,
      autorender: true
    };
  }

  async loader(trx) {
    this.setTitle('Autorender Test');
    this.unloadCSS(['/assets/css/theme.css']);
    await this.loadView('#primary', 'playground/autorender/primary.html', 'inner');
  }

  async init(trx) {
    this.clickVar = 'one';
    this.clickVars = [1, 2, 3, 4, 5];

    this.firstName = 'no name';
    this.car = 'no car';
    this.color = 'default color';
  }



  async clickAR() {
    await new Promise(r => setTimeout(r, 1300));
    this.clickVar = 'two';
    this.clickVars = [6, 7, 8];
  }

  keyupAR(elem, evt) {
    // console.log('runKEYUP $element::', elem);
    // console.log('runKEYUP $event::', evt);
    this.firstName = elem.value;
  }

  changeAR(elem, evt) {
    // console.log('runKEYUP $element::', elem);
    // console.log('runKEYUP $event::', evt);
    this.car = elem.value;
  }

  evtAR(elem, evt, color) {
    // console.log('runKEYUP $element::', elem);
    // console.log('runKEYUP $event::', evt);
    elem.style.color = color;
    elem.style.cursor = 'pointer';
    this.color = color;
  }


  async callAPI() {
    this.answer = { res: { content: 'Please wait ...' } };
    await new Promise(r => setTimeout(r, 2100));
    this.answer = await this.httpClient.askJSON('api.dex8.com');
    // this.answer = await this.httpClient.askJSON('https://jsonplaceholder.typicode.com/todos/1', 'GET');
    // this.answer = await this.httpClient.askJSON('https://jsonplaceholder.typicode.com/posts?userId=1', 'GET');
    // this.answer = await this.httpClient.askJSON('https://jsonplaceholder.typicode.com/posts', 'POST', {title: 'foo', body: 'bar', userId: 1});
    // this.answer = await this.httpClient.askJSON('https://jsonplaceholder.typicode.com/posts/1', 'PUT', {id: 1, title: 'foogoo', body: 'barboo', userId: 3});
    // this.answer = await this.httpClient.askJSON('https://jsonplaceholder.typicode.com/posts/1', 'DELETE');
    // this.answer = await this.httpClient.askJSON('https://api.dex8.com?q=my str'); // test encodeURI
    // this.answer = await this.httpClient.ask('api.dex8.com'); // to test 408 timeout set opts:: timeout:10,retry:5,retryDelay:1300
  }


}


module.exports = AutorenderCtrl;
