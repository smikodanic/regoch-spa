const App = require('../../sys/App');

const routesCnf = require('./conf/routesCnf');
const appCnf = require('./conf/appCnf');
const httpClientCnf = require('./conf/httpClientCnf');


// controllers
const Ctrls = require('./controllers');


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
app.controller(Ctrls);

app
  .routes(routesCnf)
  .run();



