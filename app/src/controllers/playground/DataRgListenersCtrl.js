const { Controller } = require('../../../../sys');


class DataRgListenersCtrl extends Controller {

  constructor(app) {
    super();
    this.debugOpts = {
      rgKill: false,
      rgHref: false,
      rgClick: false,
      rgKeyup: false,
      rgChange: false,
      rgEvt: false,
      rgSet: false,
      rgChange: false
    };
  }

  async loader(trx) {
    this.setTitle('DataRgListeners Test');
    this.unloadCSS(['/assets/css/theme.css']);
    await this.loadView('#primary', 'playground/datarglisteners/primary.html', 'inner');
  }


  async init(trx) {
    // test <button data-rg-click="print.inConsole.makeRed($element)">CLICK</button>
    this.print = {
      inConsole: {
        makeRed: (elem) => {
          console.log(elem);
          elem.style.color = 'orangered';
        }
      }
    };

    // test CLICK2
    this.products = [
      { name: 'Toy', price: 22.34 },
      { name: 'Flower', price: 88.56 },
    ];
  }




  // this is needed so that LINK2 work correctly
  async destroy() {
    this.loadCSS(['/assets/css/theme.css']);
    this.emptyView('#primary');
  }




  // show the history
  historyData() {
    console.log('window.history::', window.history);
  }


  async callAPI() {
    const answer = await this.httpClient.askJSON('api.dex8.com');
    // const answer = await this.httpClient.askJSON('https://jsonplaceholder.typicode.com/todos/1', 'GET');
    // const answer = await this.httpClient.askJSON('https://jsonplaceholder.typicode.com/posts?userId=1', 'GET');
    // const answer = await this.httpClient.askJSON('https://jsonplaceholder.typicode.com/posts', 'POST', {title: 'foo', body: 'bar', userId: 1});
    // const answer = await this.httpClient.askJSON('https://jsonplaceholder.typicode.com/posts/1', 'PUT', {id: 1, title: 'foogoo', body: 'barboo', userId: 3});
    // const answer = await this.httpClient.askJSON('https://jsonplaceholder.typicode.com/posts/1', 'DELETE');
    // const answer = await this.httpClient.askJSON('https://api.dex8.com?q=my str'); // test encodeURI
    // const answer = await this.httpClient.ask('api.dex8.com'); // to test 408 timeout set opts:: timeout:10,retry:5,retryDelay:1300
    return answer;
  }


  // A) fetch the API response and show it in the data-rg-print element   B) change the clicked button color
  async runCLICK(n, str, ...rest) {
    console.log('This is a click. Params::', n, str, rest);
    this.$model.answer = await this.callAPI();
    console.log('answer::', this.$model.answer);

    // make the clicked button green
    if (rest[2]) {
      const elem = rest[2];
      elem.style.color = 'red';
      elem.style.backgroundColor = 'lightgreen';
    }
  }


  runCLICK2(prods) {
    console.log('this.products::', prods);
  }

  runCLICK3(str, num, bool, reg) {
    console.log('str::', typeof str, str);
    console.log('num::', typeof num, num);
    console.log('bool::', typeof bool, bool);
    console.log('reg::', typeof reg, reg, '--- reg.test("oglas")::', reg.test('oglas'));
  }

  // click on the INPUT tag
  runCLICK4(val) {
    console.log('val::', typeof val, val);
  }


  // run on keyup event
  runKEYUP(elem, val, evt) {
    console.log('runKEYUP $element::', elem);
    console.log('runKEYUP $value::', typeof val, val);
    console.log('runKEYUP $event::', evt);
  }


  // update data-rg-switch and data-rg-if every time the SELECT is changed
  async runCHANGE(n, val) {
    if (n === 1) {
      this.$model.change1 = val;
    } else if (n === 2) {
      this.$model.change2 = val;
    }
  }


  // change text collor on mouseover and click
  runEVT(elem, evt, boja) {
    // console.log('$element::', elem);
    // console.log('$event::', evt);
    elem.style.color = boja;
  }


  // change the controller value and affect data-rg-model element
  runMODEL() {
    this.$model.myMDL = 'I changed it !!!';
  }


}


module.exports = DataRgListenersCtrl;
