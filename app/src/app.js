const App = require('../../sys/App');

// conf
const routesCnf = require('./conf/routesCnf');
const appCnf = require('./conf/appCnf');
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
  .conf('app', appCnf)
  .conf('httpClient', httpClientCnf)
  .const('myNum', 10)
  .const('myStr', 'some thing')
  .const('myObj', {a: 22})
  .freeze();

app.libInject({ StringExt });
app.libAppend({ Rand });

app
  .controller([HomeCtrl, SinglePageAppCtrl, NotfoundCtrl])
  .routes(routesCnf)
  .run();



