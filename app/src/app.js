const App = require('../../sys/App');

const routesCnf = require('./conf/routesCnf');
const appCnf = require('./conf/appCnf');
const httpClientCnf = require('./conf/httpClientCnf');


// controllers
const IndexCtrl = require('./controllers/IndexCtrl');
const Page1Ctrl = require('./controllers/Page1Ctrl');
const Page2Ctrl = require('./controllers/Page2Ctrl');
const FormCtrl = require('./controllers/FormCtrl');
const NotfoundCtrl = require('./controllers/NotfoundCtrl');


// init and set the app
const app = new App();

app
  .conf('app', appCnf)
  .conf('httpClient', httpClientCnf)
  .const('myNum', 10)
  .const('myStr', 'some thing')
  .const('myObj', {a: 22})
  .freeze();

app.system(httpClientCnf);


app.controller(
  IndexCtrl,
  Page1Ctrl,
  Page2Ctrl,
  FormCtrl,
  NotfoundCtrl
);

app
  .routes(routesCnf)
  .run();



