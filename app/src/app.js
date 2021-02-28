const { Sys, HTTPClient } = require('../../sys');


class App {

  constructor() {

  }

  clickFja(n, str, ...rest) {
    console.log('This is a click. Params::', n, str, rest);
    this.callAPI();
  }

  async callAPI() {
    const opts = {
      encodeURI: false,
      timeout: 3000,
      retry: 1,
      retryDelay: 1300,
      maxRedirects: 0,
      headers: {
        'authorization': '',
        'accept': '*/*', // 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9'
        'content-type': 'text/html; charset=UTF-8'
      }
    };
    const hc = new HTTPClient(opts); // dhc means dex8 http client
    // const answer = await hc.askOnce('api.dex8.com');
    // const answer = await hc.askJSON('https://jsonplaceholder.typicode.com/todos/1');

    const answer = await hc.askJSON('https://jsonplaceholder.typicode.com/posts', 'POST', {title: 'foo', body: 'bar', userId: 1});



    console.log(answer);
  }










}




window.app = new App();
const system = new Sys(window.app);
system.run();
