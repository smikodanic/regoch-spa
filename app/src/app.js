const { App } = require('../../sys');

// conf
const routesCnf = require('./conf/routesCnf');
const apiCnf = require('./conf/apiCnf');
const httpClientCnf = require('./conf/httpClientCnf');

// lib
const StringExt = require('./lib/StringExt');
const Rand = require('./lib/Rand');

// controllers
const HomeCtrl = require('./controllers/HomeCtrl');
const SinglePageAppCtrl = require('./controllers/SinglePageAppCtrl');
const NotfoundCtrl = require('./controllers/NotfoundCtrl');



const app = new App();

app
  .conf('API', apiCnf)
  .conf('httpClient', httpClientCnf)
  .const('myNum', 10)
  .const('myStr', 'some thing')
  .const('myObj', {a: 22})
  .freeze();

app.libInject({StringExt, Rand});

app
  .controller([HomeCtrl, SinglePageAppCtrl, NotfoundCtrl])
  .routes(routesCnf)
  .run();



