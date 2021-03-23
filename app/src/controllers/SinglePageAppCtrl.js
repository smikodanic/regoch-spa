const { Controller } = require('../../../sys');
const HTTPclient = require('../../../sys/HTTPClient');


class SinglePageAppCtrl extends Controller {

  constructor(app) {
    super();
    console.log('SinglePageApp constructor');
    console.log('app:', app);
    this.sys = app.sys;
    this.hc = new HTTPclient();
  }


  async prerender(trx) {
    // await this.emptyView('#sibling', 'sibling');
    await this.loadView('#sibling', 'pages/single-page-app/sibling.html', 'sibling');
    // await this.loadViews([
    //   ['#top', 'pages/shared/top.html'],
    //   ['#bottom', 'pages/home/bottom.html'],
    //   ['#main', 'pages/home/main.html'],
    //   ['#footer', 'pages/home/footer.html']
    // ]);

  }


  async postrender(trx) {
    console.log('SinglePageApp postrender', trx, this.dataRgs);

    const script = document.createElement('script');
    // script.type = 'text/javascript';
    script.src = '/assets/js/highlight-custom.js';
    script.defer = true;
    document.body.appendChild(script);

    const script2 = document.createElement('script');
    script2.src = '/assets/plugins/jquery.scrollTo.min.js';
    script2.defer = true;
    document.body.appendChild(script2);

    const script3 = document.createElement('script');
    script3.src = '/assets/plugins/lightbox/dist/ekko-lightbox.min.js';
    script3.defer = true;
    document.body.appendChild(script3);

    const script4 = document.createElement('script');
    script4.src = '/assets/js/docs.js';
    script4.defer = true;
    document.body.appendChild(script4);



    // await this.sys.util.sleep(800);

    // const answer0 = await this.hc.askJS('http://localhost:4400/assets/plugins/jquery-3.4.1.min.js');
    // eval(answer0.res.content);

    // const answer1 = await this.hc.askJS('http://localhost:4400/assets/js/highlight-custom.js');
    // eval(answer1.res.content);

    // const answer2 = await this.hc.askJS('http://localhost:4400/assets/plugins/jquery.scrollTo.min.js');
    // eval(answer2.res.content);

    // const answer3 = await this.hc.askJS('http://localhost:4400/assets/plugins/lightbox/dist/ekko-lightbox.min.js');
    // eval(answer3.res.content);

    // const answer4 = await this.hc.askJS('http://localhost:4400/assets/js/docs.js');
    // eval(answer4.res.content);
  }


}


module.exports =  SinglePageAppCtrl;