const App = require('../../sys/App');

// conf
const routesCnf = require('./conf/routesCnf');
const appCnf = require('./conf/appCnf');
const httpClientCnf = require('./conf/httpClientCnf');

// controller
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
app.system();
app
  .controller([HomeCtrl, SinglePageAppCtrl, NotfoundCtrl])
  .routes(routesCnf)
  .run();



