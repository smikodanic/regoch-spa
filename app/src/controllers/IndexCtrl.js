const { Controller } = require('../../../sys');


class IndexCtrl extends Controller {

  constructor(app) {
    super();
    console.log('HOME constructor');
    this.load = app.sys.load;
    this.util = app.sys.util;
    this.httpClient = app.sys.httpClient; // or new app.sys.HTTPClient()
    this.controllers = app.controllers;

    const cookieOpts = {
      domain: 'localhost',
      path: '/',
      expires: 5, // number of days or exact date
      secure: false,
      httpOnly: false,
      sameSite: 'strict' // 'strict' for GET and POST, 'lax' only for POST
    };
    this.cookie = new app.sys.Cookie(cookieOpts, true);

    this.ifX = false;

    this.cookieForm = new app.sys.Form('cookieF');
  }


  async prerender(trx) {
    console.log('HOME prerender', trx);
    // console.log(this.controllers.FormCtrl); // access the specific controller in the controller
    await this.load.view('header', 'inc/header.html', 'h2 > small', 'sibling');
    await this.load.view('footer', 'inc/footer.html');
    await this.load.view('footer2', 'inc/footer2.html', '', 'outer');
    await this.load.view('footer3', 'inc/footer3.html', '', 'outer');
    await this.load.view('home1', 'home1.html');
    await this.load.view('home2', 'home2.html');
  }


  async postrender(trx) {
    console.log('HOME postrender', trx, this.dataRgs);
  }


  async init(trx) {
    console.log('HOME init', trx, this.dataRgs);
    this.product = {
      name: {
        x: 'Initial val'
      },
      colors: ['red', 'green']
    };
    this.rgPrint('product.name.x');

    await this.util.sleep(1300);
    this.product.name.x = 'Modified val';

    this.limit = 3;
    this.skip = 2;
    this.companies = [
      {name: 'Cloud Ltd', size: 3},
      {name: 'Roto Ltd', size: 5},
      {name: 'Zen Ltd', size: 8},
      {name: 'Den Ltd', size: 9},
      {name: 'Len Ltd', size: 10},
      {name: 'Pen Ltd', size: 81},
      {name: 'Gen Ltd', size: 82},
      {name: 'Ren Ltd', size: 83}
    ];
  }

  destroy(elem, event, dataRgs) {
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
      {name: 'Zen2 Ltd', size: 8},
      {name: 'Den2 Ltd', size: 81},
      {name: 'Len2 Ltd', size: 82},
      {name: 'Pen2 Ltd', size: 83},
      {name: 'Gen2 Ltd', size: 84},
      {name: 'Ren2 Ltd', size: 855}
    ];
    this.rgFor('companies');
    this.rgPrint('companies');
  }

  runREPEAT(num) {
    this.colors = ['red', 'green', 'blue', 'navy', 'cyan'];
    this.rgRepeat(num, 'colorID');
    this.rgSet('colors');
    this.rgPrint('colors');
  }

  runCLASS() {
    this.myKlases = ['my-bold', 'my-italic'];
    this.rgClass('myKlases');
  }

  runSTYLE(fontSize, color) {
    this.myStajl = {fontSize, color};
    this.rgStyle('myStajl');
  }

  runSWITCH() {
    this.myColorArr = ['green2', 'blue2'];
    this.rgSwitch('myColor'); // this.myColor
    this.rgSwitch('myColorArr @@ multiple'); // this.myColorArr
  }

  runELEM() {
    this.toggle = !this.toggle;
    if (this.toggle) {
      this.rgelems.myElem.style.color = 'blue';
    } else {
      this.rgelems.myElem.style.color = 'silver';
    }
  }


  runEVT(elem, evt, boja) {
    // console.log(elem);
    // console.log(evt);
    elem.style.color = boja;
  }


  runCOOKIE() {
    const cookieVal1 = this.cookieForm.getControl('cookieVal1');
    const cookieVal2 = this.cookieForm.getControl('cookieVal2');
    const cookieMethod = this.cookieForm.getControl('cookieMethod');
    console.log(cookieMethod, ':', cookieVal1, cookieVal2);

    switch(cookieMethod) {
    case 'put': { this.cookie.put(cookieVal1, cookieVal2); break; }
    case 'putObject': { this.cookie.putObject('someObj', {x:22,y:'str'}); break; }
    case 'getAll': { console.log(this.cookie.getAll()); break; }
    case 'get': { console.log(this.cookie.get(cookieVal1)); break; }
    case 'getObject': { console.log(this.cookie.getObject('someObj')); break; }
    case 'remove': { this.cookie.remove(cookieVal1); break; }
    case 'removeAll': { this.cookie.removeAll(); break; }
    case 'empty': { this.cookie.empty(cookieVal1); break; }
    case 'exists': { console.log(this.cookie.exists(cookieVal1)); break; }
    }

  }



  clickFja(n, str, ...rest) {
    console.log('This is a click. Params::', n, str, rest);
    this.callAPI();
    if(rest[2]) {
      const elem = rest[2];
      elem.style.color = 'red';
      elem.style.backgroundColor = '#71F5D0';
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
