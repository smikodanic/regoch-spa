const HTTPClient = require('../../../sys/HTTPClient');
const Controller = require('../../../sys/Controller');


class IndexCtrl extends Controller {

  async onRender(trx) {
    console.log('HOME render', trx);
    await this.loadView('header', 'inc/header.html', 'h2 > small', 'append');
    await this.loadView('footer', 'inc/footer.html');
    await this.loadView('footer2', 'inc/footer2.html', '', 'outer');
    await this.loadView('footer3', 'inc/footer3.html', '', 'outer');
    await this.loadView('home1', 'home1.html');
    await this.loadView('home2', 'home2.html');
  }

  onInit(trx, dataRgs) {
    console.log('HOME init', trx, dataRgs);
  }

  onDestroy(elem, event, dataRgs) {
    console.log('HOME destroy', elem, event, dataRgs);
  }



  test() {
    console.log('This is my test.');
  }



  clickFja(n, str, ...rest) {
    console.log('This is a click. Params::', n, str, rest);
    this.callAPI();
    alert('OKK');
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
    const hc = new HTTPClient(opts); // hc means http client
    const answer = await hc.askOnce('api.dex8.com');

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
