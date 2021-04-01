const { Controller } = require('../../../../sys');


class DataRgListenersCtrl extends Controller {

  constructor(app) {
    super();
  }

  async prerender(trx) {
    this.setTitle('DataRg Test');
    this.loadCSS(['https://cdnjs.cloudflare.com/ajax/libs/prism/1.23.0/themes/prism-coy.min.css']);
    this.unloadCSS(['/assets/css/theme.css']);
    await this.loadView('#primary', 'playground/datarglisteners/primary.html', 'inner');
  }

  async postrender(trx) {
    this.lazyJS(['https://cdnjs.cloudflare.com/ajax/libs/prism/1.23.0/prism.min.js']);
  }

  async init(trx) {
  }

  destroy(elem, event) {
    this.unloadCSS(['https://cdnjs.cloudflare.com/ajax/libs/prism/1.23.0/themes/prism-coy.min.css']);
    this.unlazyJS();
  }



  // A) fetch the API response and show it in the data-rg-print element   B) change the clicked button color
  async runCLICK(n, str, ...rest) {
    console.log('This is a click. Params::', n, str, rest);
    this.answer = await this.callAPI();
    this.rgPrint('answer');
    console.log(this.answer);

    // make the clicked button green
    if(rest[2]) {
      const elem = rest[2];
      elem.style.color = 'red';
      elem.style.backgroundColor = 'lightgreen';
    }
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
    const answer = await this.httpClient.askJSON('api.dex8.com');
    // const answer = await hc.askJSON('https://jsonplaceholder.typicode.com/todos/1', 'GET');
    // const answer = await hc.askJSON('https://jsonplaceholder.typicode.com/posts?userId=1', 'GET');
    // const answer = await hc.askJSON('https://jsonplaceholder.typicode.com/posts', 'POST', {title: 'foo', body: 'bar', userId: 1});
    // const answer = await hc.askJSON('https://jsonplaceholder.typicode.com/posts/1', 'PUT', {id: 1, title: 'foogoo', body: 'barboo', userId: 3});
    // const answer = await hc.askJSON('https://jsonplaceholder.typicode.com/posts/1', 'DELETE');
    // const answer = await hc.askJSON('https://api.dex8.com?q=my str'); // test encodeURI
    // const answer = await hc.ask('api.dex8.com'); // to test 408 timeout set opts:: timeout:10,retry:5,retryDelay:1300

    return answer;
  }



  // update data-rg-switch and data-rg-if every time the SELECT is changed
  async runCHANGE() {
    console.log('mySelect::', this.mySelect);
    await this.rgSwitch('mySelect');

    if (this.mySelect === 'three') { this.ifThree = true; }
    await this.rgIf('ifThree');
    this.rgPrint('mySelect');
  }



}


module.exports =  DataRgListenersCtrl;
